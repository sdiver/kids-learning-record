const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 信任反向代理（Nginx/Portal），确保 rate-limit 能正确识别客户端 IP
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: false, // 允许内联脚本（当前应用需要）
    crossOriginEmbedderPolicy: false
}));

// 限流中间件
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制100次请求
    message: { success: false, message: '请求过于频繁，请稍后再试' }
});
app.use('/api/', apiLimiter);

// 认证中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: '令牌无效或已过期' });
        }
        req.user = user;
        next();
    });
}

// CORS配置 - 家用NAS私有服务，允许所有来源
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// 支持代理路径和直接访问两种方式
const basePath = process.env.BASE_PATH || '';

// 支持常见的代理路径前缀（NAS 反向代理常用）
const commonProxyPaths = [
    '/portal-home/app/parenting',
    '/app/parenting',
    '/parenting'
];

// 如果有环境变量设置的路径，也添加进去
if (basePath && !commonProxyPaths.includes(basePath)) {
    commonProxyPaths.push(basePath);
}

// API 路由 - 必须先定义，确保在 static 之前挂载，避免被 static 拦截
const apiRouter = express.Router();

// 挂载 API 路由到 /api（必须在静态文件之前）
app.use('/api', apiRouter);

// 支持代理路径 - 将 API 路由也挂载到常见代理路径（必须在静态文件之前）
commonProxyPaths.forEach(proxyPath => {
    app.use(proxyPath + '/api', apiRouter);
});

// 静态文件服务 - 支持直接访问
app.use('/', express.static('public'));
// 禁用 redirect 选项，防止 /hub 自动跳转到 /hub/ 丢失代理路径
app.use('/hub', express.static('admin', { redirect: false }));

// 为每个代理路径挂载静态文件服务
commonProxyPaths.forEach(proxyPath => {
    app.use(proxyPath + '/', express.static('public'));
    app.use(proxyPath + '/hub', express.static('admin', { redirect: false }));
});

// SQLite 数据库连接 - 支持环境变量指定路径（用于 Docker volume 挂载）
const dbPath = process.env.DB_PATH || process.env.DATABASE_PATH || './kids_learning.db';
const db = new sqlite3.Database(dbPath);
console.log('📁 数据库路径:', dbPath);

// 初始化数据库表
db.serialize(() => {
    // 小朋友表
    db.run(`CREATE TABLE IF NOT EXISTS kids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        nickname TEXT,
        avatar TEXT,
        birth_date DATE,
        grade TEXT,
        favorite_color TEXT DEFAULT '#FFD93D',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 科目表
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT DEFAULT '#4ECDC4',
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 学习记录表
    db.run(`CREATE TABLE IF NOT EXISTS learning_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kid_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        learning_date DATE NOT NULL,
        duration INTEGER,
        content TEXT,
        performance INTEGER DEFAULT 3,
        notes TEXT,
        mood TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )`);

    // 成就表
    db.run(`CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kid_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        badge_icon TEXT,
        earned_at DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE
    )`);

    // 积分记录表
    db.run(`CREATE TABLE IF NOT EXISTS points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kid_id INTEGER NOT NULL,
        points INTEGER NOT NULL,
        reason TEXT,
        record_type TEXT NOT NULL CHECK(record_type IN ('earn', 'spend')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE
    )`);

    // 错字本表
    db.run(`CREATE TABLE IF NOT EXISTS mistakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kid_id INTEGER NOT NULL,
        char TEXT NOT NULL,
        pinyin TEXT,
        recognized TEXT,
        source TEXT,
        count INTEGER DEFAULT 1,
        review_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'new' CHECK(status IN ('new', 'practicing', 'mastered')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_wrong DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_reviewed DATETIME,
        mastered_at DATETIME,
        FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE
    )`);

    // 用户表（家长账户）
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'parent' CHECK(role IN ('parent', 'admin')),
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    )`);

    // 用户-儿童关联表（家长可以看到哪些孩子的数据）
    db.run(`CREATE TABLE IF NOT EXISTS user_kids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        kid_id INTEGER NOT NULL,
        relationship TEXT DEFAULT 'parent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE,
        UNIQUE(user_id, kid_id)
    )`);

    // 审计日志表
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        table_name TEXT,
        record_id INTEGER,
        old_value TEXT,
        new_value TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // 自定义文章表
    db.run(`CREATE TABLE IF NOT EXISTS custom_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        content TEXT NOT NULL,
        level TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 插入默认科目
    const defaultSubjects = [
        ['语文', '📚', '#FF6B6B', 1],
        ['数学', '🔢', '#4ECDC4', 2],
        ['英语', '🔤', '#45B7D1', 3],
        ['科学', '🔬', '#96CEB4', 4],
        ['美术', '🎨', '#FFEAA7', 5],
        ['音乐', '🎵', '#DDA0DD', 6],
        ['体育', '⚽', '#98D8C8', 7],
        ['阅读', '📖', '#F7DC6F', 8]
    ];

    db.get('SELECT COUNT(*) as count FROM subjects', (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare('INSERT INTO subjects (name, icon, color, sort_order) VALUES (?, ?, ?, ?)');
            defaultSubjects.forEach(s => stmt.run(s));
            stmt.finalize();
            console.log('✅ 默认科目已创建');
        }
    });

    // 插入示例小朋友
    db.get('SELECT COUNT(*) as count FROM kids', (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO kids (name, nickname, birth_date, grade, favorite_color) VALUES
                ('小明', '明明', '2016-05-15', '一年级', '#FF6B6B'),
                ('小红', '红红', '2015-08-20', '二年级', '#4ECDC4')`);
            console.log('✅ 示例小朋友已创建');
        }
    });
});

// 数据库连接测试
apiRouter.get('/health', (req, res) => {
    res.json({ status: 'OK', message: '数据库连接正常' });
});

// ==================== 自定义文章 API ====================

// 获取所有自定义文章
apiRouter.get('/articles/custom', (req, res) => {
    db.all('SELECT * FROM custom_articles ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
});

// 添加自定义文章
apiRouter.post('/articles/custom', (req, res) => {
    const { title, author, content, level } = req.body;
    if (!title || !content) {
        return res.status(400).json({ success: false, message: '标题和内容不能为空' });
    }
    if (content.length > 2000) {
        return res.status(400).json({ success: false, message: '文章内容不能超过2000字' });
    }
    db.run(
        'INSERT INTO custom_articles (title, author, content, level) VALUES (?, ?, ?, ?)',
        [title, author || null, content, level || 'medium'],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: { id: this.lastID, message: '添加成功' } });
        }
    );
});

// 删除自定义文章
apiRouter.delete('/articles/custom/:id', (req, res) => {
    db.run('DELETE FROM custom_articles WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, message: '文章不存在' });
        res.json({ success: true, message: '删除成功' });
    });
});

// ==================== AI 文章生成 API ====================
// 支持多个免费 AI provider，按优先级自动选用：
//   1. Groq       → 设置 GROQ_API_KEY       （免费注册 console.groq.com，无需信用卡）
//   2. Gemini     → 设置 GEMINI_API_KEY      （免费注册 aistudio.google.com，无需信用卡）
//   3. Claude     → 设置 ANTHROPIC_API_KEY   （付费，备用）
//   均未配置 → 返回 503，前端自动降级为本地模板

// 通用 HTTPS 请求辅助（Node.js 内置，无需安装额外依赖）
function httpsPost(hostname, path, headers, body) {
    const https = require('https');
    const requestBody = JSON.stringify(body);
    return new Promise((resolve, reject) => {
        const req = https.request(
            { hostname, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(requestBody), ...headers } },
            (resp) => {
                let data = '';
                resp.on('data', chunk => { data += chunk; });
                resp.on('end', () => {
                    try { resolve({ status: resp.statusCode, body: JSON.parse(data) }); }
                    catch (e) { reject(new Error('解析响应失败')); }
                });
            }
        );
        req.on('error', reject);
        req.setTimeout(30000, () => { req.destroy(); reject(new Error('请求超时')); });
        req.write(requestBody);
        req.end();
    });
}

// 解析 AI 返回文本 → { title, content }
function parseArticleText(text, fallbackChar) {
    let title = `"${fallbackChar}"的故事`;
    let content = text.trim();
    const titleMatch = text.match(/标题[：:]\s*([^\n]+)/);
    const contentMatch = text.match(/正文[：:]\s*([\s\S]+)/);
    if (titleMatch) title = titleMatch[1].trim();
    if (contentMatch) content = contentMatch[1].trim();
    return { title, content };
}

apiRouter.post('/generate-article', async (req, res) => {
    const { targetChar, theme, length } = req.body;

    if (!targetChar || typeof targetChar !== 'string' || targetChar.length !== 1) {
        return res.status(400).json({ success: false, message: '请提供单个目标汉字' });
    }

    const ZHIPU_KEY     = process.env.ZHIPU_API_KEY;      // 智谱GLM，永久免费，中文最佳
    const GROQ_KEY      = process.env.GROQ_API_KEY;       // Groq，免费，中文好
    const GEMINI_KEY    = process.env.GEMINI_API_KEY;     // Google Gemini，免费
    const DEEPSEEK_KEY  = process.env.DEEPSEEK_API_KEY;   // DeepSeek，注册送5M token
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;  // Claude，付费备用

    if (!ZHIPU_KEY && !GROQ_KEY && !GEMINI_KEY && !DEEPSEEK_KEY && !ANTHROPIC_KEY) {
        return res.status(503).json({
            success: false,
            message: '未配置AI密钥。推荐免费选项：\n① ZHIPU_API_KEY（智谱GLM，永久免费，open.bigmodel.cn）\n② GROQ_API_KEY（Groq，console.groq.com）\n③ GEMINI_API_KEY（Google，aistudio.google.com）'
        });
    }

    const lengthMap = { short: '50字左右', medium: '100字左右', long: '150字左右' };
    const themeMap = { '动物': '以动物为主角的温馨小故事', '自然': '描写大自然美景的小散文', '家庭': '关于家庭生活的温馨故事', '学校': '发生在校园里的有趣故事', '童话': '充满想象力的童话故事', '科幻': '面向儿童的科幻小故事' };

    const prompt = `请为6岁小朋友创作一篇${themeMap[theme] || '儿童故事'}。
要求：1.长度${lengthMap[length] || '100字左右'} 2.必须多次出现汉字"${targetChar}" 3.内容生动有趣 4.语言简单易懂
只返回标题和正文，格式：
标题：XXX
正文：XXX`;

    // OpenAI 兼容格式（GLM / Groq / DeepSeek 通用）
    const openaiMessages = [
        { role: 'system', content: '你是一位专门为儿童创作故事的作家，语言简单温馨，适合6岁小朋友。' },
        { role: 'user', content: prompt }
    ];

    let generatedText = '';

    try {
        // ── Provider 1: 智谱GLM（永久免费，中文效果最好，open.bigmodel.cn 注册） ──
        if (ZHIPU_KEY) {
            const result = await httpsPost(
                'open.bigmodel.cn', '/api/paas/v4/chat/completions',
                { 'Authorization': `Bearer ${ZHIPU_KEY}` },
                { model: 'glm-4-flash', messages: openaiMessages, max_tokens: 400 }
            );
            if (result.status === 200) {
                generatedText = result.body.choices?.[0]?.message?.content || '';
                console.log('✅ AI生成（智谱GLM）成功');
            } else {
                throw new Error(`GLM ${result.status}: ${JSON.stringify(result.body)}`);
            }
        }

        // ── Provider 2: Groq（免费注册 console.groq.com，用 Qwen3 模型） ──
        else if (GROQ_KEY) {
            const result = await httpsPost(
                'api.groq.com', '/openai/v1/chat/completions',
                { 'Authorization': `Bearer ${GROQ_KEY}` },
                { model: 'qwen/qwen3-32b', messages: openaiMessages, max_tokens: 400 }
            );
            if (result.status === 200) {
                generatedText = result.body.choices?.[0]?.message?.content || '';
                console.log('✅ AI生成（Groq）成功');
            } else {
                throw new Error(`Groq ${result.status}: ${JSON.stringify(result.body)}`);
            }
        }

        // ── Provider 3: Google Gemini（免费注册 aistudio.google.com） ──
        else if (GEMINI_KEY) {
            const result = await httpsPost(
                'generativelanguage.googleapis.com',
                `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
                {},
                { contents: [{ parts: [{ text: prompt }] }] }
            );
            if (result.status === 200) {
                generatedText = result.body.candidates?.[0]?.content?.parts?.[0]?.text || '';
                console.log('✅ AI生成（Gemini）成功');
            } else {
                throw new Error(`Gemini ${result.status}: ${JSON.stringify(result.body)}`);
            }
        }

        // ── Provider 4: DeepSeek（注册送5M token，platform.deepseek.com） ──
        else if (DEEPSEEK_KEY) {
            const result = await httpsPost(
                'api.deepseek.com', '/chat/completions',
                { 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
                { model: 'deepseek-chat', messages: openaiMessages, max_tokens: 400, stream: false }
            );
            if (result.status === 200) {
                generatedText = result.body.choices?.[0]?.message?.content || '';
                console.log('✅ AI生成（DeepSeek）成功');
            } else {
                throw new Error(`DeepSeek ${result.status}: ${JSON.stringify(result.body)}`);
            }
        }

        // ── Provider 5: Anthropic Claude（付费，备用） ──
        else if (ANTHROPIC_KEY) {
            const result = await httpsPost(
                'api.anthropic.com', '/v1/messages',
                { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
                { model: 'claude-haiku-4-5-20251001', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }
            );
            if (result.status === 200) {
                generatedText = result.body.content?.[0]?.text || '';
                console.log('✅ AI生成（Claude）成功');
            } else {
                throw new Error(`Claude ${result.status}: ${JSON.stringify(result.body)}`);
            }
        }

        if (!generatedText) throw new Error('AI返回内容为空');

        const { title, content } = parseArticleText(generatedText, targetChar);
        const charCount = (content.match(new RegExp(targetChar, 'g')) || []).length;
        const finalContent = charCount < 2
            ? content + `\n小朋友，"${targetChar}"这个字要多读多写哦！`
            : content;

        res.json({ success: true, data: { title, content: finalContent, targetChar } });

    } catch (error) {
        console.error('❌ AI生成文章失败:', error.message);
        res.status(500).json({ success: false, message: 'AI生成失败：' + error.message });
    }
});

// ==================== 认证 API ====================

// 用户注册
apiRouter.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: '用户名、邮箱和密码不能为空' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: '密码长度至少6位' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ success: false, message: '用户名或邮箱已存在' });
                    }
                    return res.status(500).json({ success: false, message: err.message });
                }

                const token = jwt.sign(
                    { userId: this.lastID, username, role: 'parent' },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                res.json({
                    success: true,
                    data: {
                        token,
                        user: { id: this.lastID, username, email, role: 'parent' }
                    }
                });
            }
        );
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 用户登录
apiRouter.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    db.get(
        'SELECT * FROM users WHERE username = ? AND is_active = 1',
        [username],
        async (err, user) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            if (!user) {
                return res.status(401).json({ success: false, message: '用户名或密码错误' });
            }

            try {
                const match = await bcrypt.compare(password, user.password_hash);

                if (!match) {
                    return res.status(401).json({ success: false, message: '用户名或密码错误' });
                }

                // 更新最后登录时间
                db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

                const token = jwt.sign(
                    { userId: user.id, username: user.username, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                res.json({
                    success: true,
                    data: {
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role
                        }
                    }
                });
            } catch (err) {
                res.status(500).json({ success: false, message: err.message });
            }
        }
    );
});

// 获取当前用户信息
apiRouter.get('/auth/me', authenticateToken, (req, res) => {
    db.get(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [req.user.userId],
        (err, user) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
            res.json({ success: true, data: user });
        }
    );
});

// ==================== 小朋友管理 API ====================

// 获取所有小朋友
apiRouter.get('/kids', (req, res) => {
    db.all('SELECT * FROM kids ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
});

// 获取单个小朋友
apiRouter.get('/kids/:id', (req, res) => {
    db.get('SELECT * FROM kids WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: '小朋友不存在' });
        res.json({ success: true, data: row });
    });
});

// 添加小朋友
apiRouter.post('/kids', (req, res) => {
    const { name, nickname, birth_date, grade, favorite_color } = req.body;
    db.run(
        'INSERT INTO kids (name, nickname, birth_date, grade, favorite_color) VALUES (?, ?, ?, ?, ?)',
        [name, nickname, birth_date, grade, favorite_color || '#FFD93D'],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: { id: this.lastID, message: '添加成功' } });
        }
    );
});

// 更新小朋友
apiRouter.put('/kids/:id', (req, res) => {
    const { name, nickname, birth_date, grade, favorite_color } = req.body;
    db.run(
        'UPDATE kids SET name = ?, nickname = ?, birth_date = ?, grade = ?, favorite_color = ? WHERE id = ?',
        [name, nickname, birth_date, grade, favorite_color, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: '更新成功' });
        }
    );
});

// 删除小朋友
apiRouter.delete('/kids/:id', (req, res) => {
    db.run('DELETE FROM kids WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: '删除成功' });
    });
});

// ==================== 学习记录 API ====================

// 获取学习记录列表
apiRouter.get('/records', (req, res) => {
    const { kid_id, date, limit = 50 } = req.query;
    let sql = `
        SELECT lr.*, k.name as kid_name, s.name as subject_name, s.icon as subject_icon, s.color as subject_color
        FROM learning_records lr
        JOIN kids k ON lr.kid_id = k.id
        JOIN subjects s ON lr.subject_id = s.id
        WHERE 1=1
    `;
    const params = [];

    if (kid_id) {
        sql += ' AND lr.kid_id = ?';
        params.push(kid_id);
    }
    if (date) {
        sql += ' AND lr.learning_date = ?';
        params.push(date);
    }

    sql += ' ORDER BY lr.learning_date DESC, lr.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
});

// 添加学习记录
apiRouter.post('/records', (req, res) => {
    const { kid_id, subject_id, learning_date, duration, content, performance, mood, notes } = req.body;

    db.run(
        `INSERT INTO learning_records (kid_id, subject_id, learning_date, duration, content, performance, mood, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [kid_id, subject_id, learning_date, duration, content, performance || 3, mood, notes],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });

            // 添加积分
            const points = Math.floor(duration / 10) * 5;
            db.run(
                'INSERT INTO points (kid_id, points, reason, record_type) VALUES (?, ?, ?, ?)',
                [kid_id, points, `学习${duration}分钟`, 'earn']
            );

            res.json({ success: true, data: { id: this.lastID, points_earned: points } });
        }
    );
});

// 删除学习记录
apiRouter.delete('/records/:id', (req, res) => {
    db.run('DELETE FROM learning_records WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: '删除成功' });
    });
});

// ==================== 科目管理 API ====================

// 获取所有科目
apiRouter.get('/subjects', (req, res) => {
    db.all('SELECT * FROM subjects ORDER BY sort_order', (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
});

// 添加科目
apiRouter.post('/subjects', (req, res) => {
    const { name, icon, color } = req.body;
    db.run(
        'INSERT INTO subjects (name, icon, color) VALUES (?, ?, ?)',
        [name, icon, color],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: { id: this.lastID } });
        }
    );
});

// 删除科目
apiRouter.delete('/subjects/:id', (req, res) => {
    db.run('DELETE FROM subjects WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: '删除成功' });
    });
});

// ==================== 成就管理 API ====================

// 获取成就列表
apiRouter.get('/achievements', (req, res) => {
    const { kid_id } = req.query;
    let sql = 'SELECT * FROM achievements WHERE 1=1';
    const params = [];

    if (kid_id) {
        sql += ' AND kid_id = ?';
        params.push(kid_id);
    }

    sql += ' ORDER BY earned_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
});

// 添加成就
apiRouter.post('/achievements', (req, res) => {
    const { kid_id, title, description, badge_icon, earned_at } = req.body;

    db.run(
        'INSERT INTO achievements (kid_id, title, description, badge_icon, earned_at) VALUES (?, ?, ?, ?, ?)',
        [kid_id, title, description, badge_icon, earned_at || new Date().toISOString().split('T')[0]],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });

            // 添加成就积分奖励
            db.run(
                'INSERT INTO points (kid_id, points, reason, record_type) VALUES (?, ?, ?, ?)',
                [kid_id, 50, `获得成就：${title}`, 'earn']
            );

            res.json({ success: true, data: { id: this.lastID } });
        }
    );
});

// 删除成就
apiRouter.delete('/achievements/:id', (req, res) => {
    db.run('DELETE FROM achievements WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: '删除成功' });
    });
});

// ==================== 积分管理 API ====================

// 获取积分记录
apiRouter.get('/points', (req, res) => {
    const { kid_id } = req.query;
    let sql = `
        SELECT p.*, k.name as kid_name
        FROM points p
        JOIN kids k ON p.kid_id = k.id
        WHERE 1=1
    `;
    const params = [];

    if (kid_id) {
        sql += ' AND p.kid_id = ?';
        params.push(kid_id);
    }

    sql += ' ORDER BY p.created_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
});

// 添加积分记录
apiRouter.post('/points', (req, res) => {
    const { kid_id, points, reason, record_type } = req.body;

    const finalPoints = record_type === 'spend' ? -Math.abs(points) : points;

    db.run(
        'INSERT INTO points (kid_id, points, reason, record_type) VALUES (?, ?, ?, ?)',
        [kid_id, finalPoints, reason, record_type],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: { id: this.lastID } });
        }
    );
});

// ==================== 统计数据 API ====================

// 获取小朋友学习统计
apiRouter.get('/stats/:kid_id', (req, res) => {
    const kidId = req.params.kid_id;

    db.get(
        `SELECT
            k.id as kid_id,
            k.name as kid_name,
            k.nickname,
            COUNT(DISTINCT lr.id) as total_records,
            COALESCE(SUM(lr.duration), 0) as total_minutes,
            ROUND(AVG(lr.performance), 1) as avg_performance,
            COUNT(DISTINCT a.id) as total_achievements,
            COALESCE((SELECT SUM(points) FROM points WHERE kid_id = k.id), 0) as total_points
        FROM kids k
        LEFT JOIN learning_records lr ON k.id = lr.kid_id
        LEFT JOIN achievements a ON k.id = a.kid_id
        WHERE k.id = ?
        GROUP BY k.id, k.name, k.nickname`,
        [kidId],
        (err, row) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!row) return res.status(404).json({ success: false, message: '小朋友不存在' });
            res.json({ success: true, data: row });
        }
    );
});

// ==================== 错字本管理 API ====================

// 获取小朋友的错字列表
apiRouter.get('/mistakes/:kid_id', (req, res) => {
    const kidId = req.params.kid_id;
    db.all(
        `SELECT * FROM mistakes WHERE kid_id = ? ORDER BY 
            CASE status 
                WHEN 'new' THEN 0 
                WHEN 'practicing' THEN 1 
                WHEN 'mastered' THEN 2 
            END, 
            last_wrong DESC`,
        [kidId],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: rows });
        }
    );
});

// 添加/更新错字
apiRouter.post('/mistakes', (req, res) => {
    const { kid_id, char, pinyin, recognized, source } = req.body;
    
    if (!kid_id || !char) {
        return res.status(400).json({ success: false, message: 'kid_id 和 char 不能为空' });
    }

    // 先查询是否已存在
    db.get(
        'SELECT * FROM mistakes WHERE kid_id = ? AND char = ?',
        [kid_id, char],
        (err, row) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            if (row) {
                // 更新现有错字
                const newCount = (row.count || 0) + 1;
                const newStatus = row.status === 'mastered' ? 'practicing' : row.status;
                
                db.run(
                    `UPDATE mistakes SET 
                        count = ?, 
                        recognized = ?, 
                        last_wrong = CURRENT_TIMESTAMP,
                        status = ?
                    WHERE id = ?`,
                    [newCount, recognized || '未识别', newStatus, row.id],
                    function(err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.json({ success: true, data: { id: row.id, updated: true, count: newCount } });
                    }
                );
            } else {
                // 添加新错字
                db.run(
                    `INSERT INTO mistakes (kid_id, char, pinyin, recognized, source, count, status) 
                     VALUES (?, ?, ?, ?, ?, 1, 'new')`,
                    [kid_id, char, pinyin || '', recognized || '未识别', source || '未知'],
                    function(err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.json({ success: true, data: { id: this.lastID, created: true } });
                    }
                );
            }
        }
    );
});

// 更新错字（复习次数、状态等）
apiRouter.put('/mistakes/:id', (req, res) => {
    const { review_count, status } = req.body;
    const updates = [];
    const params = [];

    if (review_count !== undefined) {
        updates.push('review_count = ?');
        params.push(review_count);
        updates.push('last_reviewed = CURRENT_TIMESTAMP');
    }
    
    if (status) {
        updates.push('status = ?');
        params.push(status);
        if (status === 'mastered') {
            updates.push('mastered_at = CURRENT_TIMESTAMP');
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }

    params.push(req.params.id);

    db.run(
        `UPDATE mistakes SET ${updates.join(', ')} WHERE id = ?`,
        params,
        (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: '更新成功' });
        }
    );
});

// 删除错字
apiRouter.delete('/mistakes/:id', (req, res) => {
    db.run('DELETE FROM mistakes WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: '删除成功' });
    });
});

// 获取拼音（带缓存）
apiRouter.get('/pinyin/:char', async (req, res) => {
    const char = req.params.char;
    
    // 简单的拼音字典（常用字）
    const pinyinDict = {
        '鹅': 'é', '曲': 'qū', '项': 'xiàng', '向': 'xiàng', '天': 'tiān', '歌': 'gē',
        '白': 'bái', '毛': 'máo', '浮': 'fú', '绿': 'lǜ', '水': 'shuǐ', '红': 'hóng',
        '掌': 'zhǎng', '拨': 'bō', '清': 'qīng', '波': 'bō', '床': 'chuáng', '前': 'qián',
        '明': 'míng', '月': 'yuè', '光': 'guāng', '疑': 'yí', '地': 'dì', '上': 'shàng',
        '霜': 'shuāng', '举': 'jǔ', '头': 'tóu', '望': 'wàng', '低': 'dī', '思': 'sī',
        '故': 'gù', '乡': 'xiāng', '春': 'chūn', '眠': 'mián', '不': 'bù', '觉': 'jué',
        '晓': 'xiǎo', '处': 'chù', '闻': 'wén', '啼': 'tí', '鸟': 'niǎo', '夜': 'yè',
        '来': 'lái', '风': 'fēng', '雨': 'yǔ', '声': 'shēng', '花': 'huā', '落': 'luò',
        '知': 'zhī', '多': 'duō', '少': 'shǎo', '小': 'xiǎo', '兔': 'tù', '子': 'zi',
        '乖': 'guāi', '把': 'bǎ', '门': 'mén', '儿': 'ér', '开': 'kāi', '快': 'kuài',
        '点': 'diǎn', '我': 'wǒ', '要': 'yào', '进': 'jìn', '妈': 'mā', '没': 'méi',
        '回': 'huí', '谁': 'shuí', '也': 'yě', '锄': 'chú', '禾': 'hé', '日': 'rì',
        '当': 'dāng', '午': 'wǔ', '汗': 'hàn', '滴': 'dī', '下': 'xià', '土': 'tǔ',
        '盘': 'pán', '中': 'zhōng', '餐': 'cān', '粒': 'lì', '皆': 'jiē', '辛': 'xīn',
        '苦': 'kǔ', '依': 'yī', '山': 'shān', '尽': 'jìn', '黄': 'huáng',
        '河': 'hé', '入': 'rù', '海': 'hǎi', '流': 'liú', '欲': 'yù', '穷': 'qióng',
        '千': 'qiān', '里': 'lǐ', '目': 'mù', '更': 'gèng', '层': 'céng', '楼': 'lóu',
        '照': 'zhào', '香': 'xiāng', '炉': 'lú', '生': 'shēng', '紫': 'zǐ', '烟': 'yān',
        '遥': 'yáo', '看': 'kàn', '瀑': 'pù', '布': 'bù', '挂': 'guà', '川': 'chuān',
        '飞': 'fēi', '直': 'zhí', '三': 'sān', '尺': 'chǐ', '银': 'yín', '九': 'jiǔ',
        '人': 'rén', '之': 'zhī', '初': 'chū', '性': 'xìng', '本': 'běn', '善': 'shàn',
        '相': 'xiāng', '近': 'jìn', '习': 'xí', '远': 'yuǎn', '苟': 'gǒu', '教': 'jiào',
        '乃': 'nǎi', '迁': 'qiān', '道': 'dào', '贵': 'guì', '以': 'yǐ', '专': 'zhuān'
    };

    const pinyin = pinyinDict[char];
    
    if (pinyin) {
        res.json({ success: true, data: { char, pinyin, from: 'local' } });
    } else {
        // 对于不认识的字，返回空，让前端尝试其他方式
        res.json({ success: true, data: { char, pinyin: '', from: 'unknown' } });
    }
});

// 辅助函数：读取并修复 HTML 中的绝对路径
function serveHtmlWithFixedPaths(res, htmlPath, basePath) {
  try {
    let html = fs.readFileSync(htmlPath, 'utf8');
    if (basePath && basePath !== '') {
      // 将 href="/xxx" 替换为 href="./xxx"
      // 将 src="/xxx" 替换为 src="./xxx"
      html = html.replace(/href="\/([^"]+)"/g, 'href="./$1"');
      html = html.replace(/src="\/([^"]+)"/g, 'src="./$1"');

    }
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('读取 HTML 失败:', err);
    res.status(500).send('服务器错误');
  }
}

// 处理 manage 路径 - 无尾斜杠时重定向，确保 admin.js 相对路径正确解析
// 使用相对路径 'manage/' 而非绝对路径，避免反向代理剥前缀后跳到错误地址
app.get('/hub', (req, res) => {
    res.redirect('hub/');
});
app.get('/hub/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// 为代理路径添加同样的处理
commonProxyPaths.forEach(proxyPath => {
    app.get(proxyPath + '/hub', (req, res) => {
        res.redirect(proxyPath + '/hub/');
    });
    app.get(proxyPath + '/hub/', (req, res) => {
        serveHtmlWithFixedPaths(res, path.join(__dirname, 'admin', 'index.html'), proxyPath);
    });
});

// 为代理路径下的前端页面提供 HTML 路径修复
commonProxyPaths.forEach(proxyPath => {
    // 前台页面
    app.get(proxyPath + '/', (req, res) => {
        serveHtmlWithFixedPaths(res, path.join(__dirname, 'public', 'index.html'), proxyPath);
    });
    app.get(proxyPath + '/practice.html', (req, res) => {
        serveHtmlWithFixedPaths(res, path.join(__dirname, 'public', 'practice.html'), proxyPath);
    });
    app.get(proxyPath + '/reading.html', (req, res) => {
        serveHtmlWithFixedPaths(res, path.join(__dirname, 'public', 'reading.html'), proxyPath);
    });
    app.get(proxyPath + '/mistakes.html', (req, res) => {
        serveHtmlWithFixedPaths(res, path.join(__dirname, 'public', 'mistakes.html'), proxyPath);
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 前台页面: http://localhost:${PORT}`);
    console.log(`🔧 后台管理: http://localhost:${PORT}/hub`);
    console.log(`📁 支持的代理路径: ${commonProxyPaths.join(', ') || '无'}`);
});

module.exports = db;
