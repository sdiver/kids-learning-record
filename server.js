const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
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
// 禁用 redirect 选项，防止 /admin 自动跳转到 /admin/ 丢失代理路径
app.use('/admin', express.static('admin', { redirect: false }));

// 为每个代理路径挂载静态文件服务
commonProxyPaths.forEach(proxyPath => {
    app.use(proxyPath + '/', express.static('public'));
    app.use(proxyPath + '/admin', express.static('admin', { redirect: false }));
});

// SQLite 数据库连接
const db = new sqlite3.Database('./kids_learning.db');

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

// 辅助函数：读取并修复 HTML 中的绝对路径
function serveHtmlWithFixedPaths(res, htmlPath, basePath) {
  try {
    let html = fs.readFileSync(htmlPath, 'utf8');
    if (basePath && basePath !== '') {
      // 将 href="/xxx" 替换为 href="./xxx"
      // 将 src="/xxx" 替换为 src="./xxx"
      html = html.replace(/href="\/([^"]+)"/g, 'href="./$1"');
      html = html.replace(/src="\/([^"]+)"/g, 'src="./$1"');
      // 修复 admin.js 的相对路径 - 从 "admin.js" 改为 "./admin/admin.js"
      // 这样可以确保在代理路径下正确加载 admin.js
      html = html.replace(/src="admin\.js"/g, 'src="./admin/admin.js"');
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('读取 HTML 失败:', err);
    res.status(500).send('服务器错误');
  }
}

// 处理 admin 路径重定向问题 - 确保代理路径下访问 /admin 不重定向到根路径的 /admin/
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// 为代理路径添加同样的处理
commonProxyPaths.forEach(proxyPath => {
    app.get(proxyPath + '/admin', (req, res) => {
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
    console.log(`🔧 后台管理: http://localhost:${PORT}/admin`);
    console.log(`📁 支持的代理路径: ${commonProxyPaths.join(', ') || '无'}`);
});

module.exports = db;
