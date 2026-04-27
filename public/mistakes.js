// 错字本模块 v2

// API 基础URL
const pathParts = window.location.pathname.split('/');
const appIndex = pathParts.indexOf('app');
const BASE_PATH = appIndex >= 0 ? '/' + pathParts.slice(1, appIndex + 2).join('/') : '';
const API_BASE = BASE_PATH + '/api';

// ========== 拼音系统 ==========

let pinyinCache = {};
const PINYIN_CACHE_KEY = 'pinyin_cache';

const localPinyinDict = {
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
    '乃': 'nǎi', '迁': 'qiān', '道': 'dào', '贵': 'guì', '以': 'yǐ', '专': 'zhuān',
    '大': 'dà', '的': 'de', '是': 'shì', '了': 'le', '在': 'zài', '有': 'yǒu',
    '和': 'hé', '这': 'zhè', '那': 'nà', '个': 'gè', '们': 'men', '说': 'shuō',
    '去': 'qù', '到': 'dào', '好': 'hǎo', '很': 'hěn',
    '都': 'dōu', '就': 'jiù', '可': 'kě', '能': 'néng', '对': 'duì',
    '着': 'zhe', '过': 'guò', '给': 'gěi', '但': 'dàn', '还': 'hái', '自': 'zì',
    '让': 'ràng', '从': 'cóng', '才': 'cái', '用': 'yòng', '想': 'xiǎng', '只': 'zhǐ',
    '最': 'zuì', '再': 'zài', '现': 'xiàn', '比': 'bǐ',
    '被': 'bèi', '已': 'yǐ', '真': 'zhēn', '新': 'xīn', '年': 'nián', '得': 'dé',
    '出': 'chū', '起': 'qǐ', '会': 'huì', '后': 'hòu', '作': 'zuò',
    '家': 'jiā', '心': 'xīn', '面': 'miàn', '打': 'dǎ', '长': 'zhǎng', '方': 'fāng',
    '成': 'chéng', '什': 'shén', '么': 'me', '名': 'míng', '同': 'tóng', '五': 'wǔ',
    '六': 'liù', '七': 'qī', '八': 'bā', '十': 'shí', '你': 'nǐ',
    '他': 'tā', '她': 'tā', '它': 'tā', '吧': 'ba', '吗': 'ma', '呢': 'ne', '啊': 'a',
    '一': 'yī', '二': 'èr', '四': 'sì',
    '走': 'zǒu', '跑': 'pǎo', '吃': 'chī', '喝': 'hē', '见': 'jiàn',
    '听': 'tīng', '太': 'tài', '而': 'ér', '时': 'shí', '今': 'jīn',
    '火': 'huǒ', '木': 'mù', '金': 'jīn', '石': 'shí', '田': 'tián',
    '云': 'yún', '虫': 'chóng', '爸': 'bà', '哥': 'gē', '姐': 'jiě', '弟': 'dì',
    '妹': 'mèi', '爷': 'yé', '奶': 'nǎi', '老': 'lǎo', '师': 'shī',
    '学': 'xué', '友': 'yǒu', '朋': 'péng', '高': 'gāo', '兴': 'xìng',
    '乐': 'lè', '爱': 'ài', '喜': 'xǐ', '欢': 'huān',
    '笑': 'xiào', '东': 'dōng', '西': 'xī', '南': 'nán', '北': 'běi',
    '左': 'zuǒ', '右': 'yòu', '早': 'zǎo', '晚': 'wǎn',
    '夏': 'xià', '秋': 'qiū', '冬': 'dōng', '手': 'shǒu',
    '足': 'zú', '耳': 'ěr', '口': 'kǒu', '牙': 'yá',
    '舌': 'shé', '书': 'shū', '笔': 'bǐ', '纸': 'zhǐ',
    '桌': 'zhuō', '椅': 'yǐ', '窗': 'chuāng',
    '灯': 'dēng', '衣': 'yī', '服': 'fú', '裤': 'kù', '鞋': 'xié',
    '帽': 'mào', '袜': 'wà', '裙': 'qún', '猫': 'māo', '狗': 'gǒu',
    '鸡': 'jī', '鸭': 'yā', '鱼': 'yú', '马': 'mǎ', '牛': 'niú',
    '羊': 'yáng', '猪': 'zhū', '猴': 'hóu',
    '虎': 'hǔ', '狼': 'láng', '象': 'xiàng', '熊': 'xióng', '鹿': 'lù',
    '龟': 'guī', '关': 'guān', '立': 'lì', '睡': 'shuì', '醒': 'xǐng',
    '玩': 'wán', '问': 'wèn', '答': 'dá', '告': 'gào', '诉': 'sù',
    '讲': 'jiǎng', '记': 'jì', '忘': 'wàng', '念': 'niàn', '读': 'dú',
    '写': 'xiě', '画': 'huà', '唱': 'chàng', '跳': 'tiào',
    '游': 'yóu', '蓝': 'lán', '黑': 'hēi', '青': 'qīng',
    '坐': 'zuò', '站': 'zhàn', '草': 'cǎo', '树': 'shù', '林': 'lín',
    '森': 'sēn', '百': 'bǎi', '万': 'wàn', '为': 'wèi', '与': 'yǔ',
    '哭': 'kū', '字': 'zì', '文': 'wén', '电': 'diàn', '车': 'chē',
    '船': 'chuán', '路': 'lù', '话': 'huà', '星': 'xīng'
};

function initPinyinCache() {
    try {
        const cached = localStorage.getItem(PINYIN_CACHE_KEY);
        if (cached) pinyinCache = JSON.parse(cached);
    } catch (e) { pinyinCache = {}; }
}

function savePinyinCache() {
    try { localStorage.setItem(PINYIN_CACHE_KEY, JSON.stringify(pinyinCache)); } catch (e) {}
}

async function getPinyin(char) {
    if (pinyinCache[char]) return pinyinCache[char];
    if (localPinyinDict[char]) {
        pinyinCache[char] = localPinyinDict[char];
        savePinyinCache();
        return localPinyinDict[char];
    }
    try {
        const response = await fetch(`${API_BASE}/pinyin/${encodeURIComponent(char)}`);
        const data = await response.json();
        if (data.success && data.data.pinyin) {
            pinyinCache[char] = data.data.pinyin;
            savePinyinCache();
            return data.data.pinyin;
        }
    } catch (e) {}
    return '';
}

async function batchGetPinyin(chars) {
    const promises = chars.map(async char => {
        await getPinyin(char);
    });
    await Promise.all(promises);
}

// ========== 数据层 ==========

let cachedMistakes = null;
let currentTab = 'learning';

function getCurrentKidId() {
    return localStorage.getItem('currentKidId');
}

async function getMistakes() {
    const kidId = getCurrentKidId();
    if (kidId) {
        try {
            const response = await fetch(`${API_BASE}/mistakes/${kidId}`);
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('mistakeBook', JSON.stringify(data.data));
                return data.data;
            }
        } catch (e) {
            console.error('API获取错字本失败:', e);
        }
    }
    try {
        const data = localStorage.getItem('mistakeBook');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveMistakes(mistakes) {
    localStorage.setItem('mistakeBook', JSON.stringify(mistakes));
}

// 前端去重：同一个字只保留一条（取 count 最大的）
function deduplicateMistakes(mistakes) {
    const map = new Map();
    for (const m of mistakes) {
        const existing = map.get(m.char);
        if (!existing || (m.count || 0) > (existing.count || 0)) {
            map.set(m.char, m);
        }
    }
    return Array.from(map.values());
}

// ========== 页面渲染 ==========

async function loadMistakes() {
    const raw = await getMistakes();
    cachedMistakes = deduplicateMistakes(raw);

    // 预加载拼音
    await batchGetPinyin(cachedMistakes.map(m => m.char));

    // 补充拼音到 cachedMistakes
    for (const m of cachedMistakes) {
        if (!m.pinyin) m.pinyin = pinyinCache[m.char] || localPinyinDict[m.char] || '';
    }

    updateStats();
    renderCards();
}

function updateStats() {
    if (!cachedMistakes) return;
    const newCount = cachedMistakes.filter(m => m.status === 'new').length;
    const practicingCount = cachedMistakes.filter(m => m.status === 'practicing').length;
    const masteredCount = cachedMistakes.filter(m => m.status === 'mastered').length;

    document.getElementById('statNew').textContent = newCount + practicingCount;
    document.getElementById('statPracticing').textContent = practicingCount;
    document.getElementById('statMastered').textContent = masteredCount;

    document.getElementById('tabLearningCount').textContent = newCount + practicingCount;
    document.getElementById('tabMasteredCount').textContent = masteredCount;

    // 练习按钮
    const hasLearning = newCount + practicingCount > 0;
    document.getElementById('practiceButtons').style.display = hasLearning ? 'flex' : 'none';
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tabLearning').classList.toggle('active', tab === 'learning');
    document.getElementById('tabMastered').classList.toggle('active', tab === 'mastered');
    renderCards();
}

function renderCards() {
    const grid = document.getElementById('cardGrid');
    if (!cachedMistakes || cachedMistakes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="icon">🎉</div>
                <p>太棒了！还没有错字</p>
                <p style="font-size: 0.9rem;">去阅读页面朗读文章吧</p>
            </div>`;
        return;
    }

    let filtered;
    if (currentTab === 'learning') {
        filtered = cachedMistakes
            .filter(m => m.status !== 'mastered')
            .sort((a, b) => (b.count || 0) - (a.count || 0));
    } else {
        filtered = cachedMistakes
            .filter(m => m.status === 'mastered')
            .sort((a, b) => {
                const ta = a.mastered_at || a.masteredAt || '';
                const tb = b.mastered_at || b.masteredAt || '';
                return tb.localeCompare(ta);
            });
    }

    if (filtered.length === 0) {
        const msg = currentTab === 'learning' ? '所有错字都掌握了！' : '还没有掌握的字';
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="icon">${currentTab === 'learning' ? '🏆' : '📖'}</div>
                <p>${msg}</p>
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(m => {
        const pinyin = m.pinyin || pinyinCache[m.char] || '';
        const isMastered = m.status === 'mastered';
        return `
            <div class="char-card ${isMastered ? 'mastered' : ''}" onclick="showCharDetail('${m.char}')">
                <div class="status-dot ${m.status}"></div>
                <div class="char">${m.char}</div>
                <div class="pinyin">${pinyin}</div>
                <div class="meta">${isMastered ? '已掌握' : '错' + (m.count || 1) + '次'}</div>
            </div>`;
    }).join('');
}

// ========== 字详情弹窗（瞬开，无网络请求） ==========

function showCharDetail(char) {
    const m = cachedMistakes.find(x => x.char === char);
    if (!m) return;

    const pinyin = m.pinyin || pinyinCache[char] || '';
    const visual = charVisualData[char] || generateGenericVisual(char, pinyin);
    const isMastered = m.status === 'mastered';
    const reviewCount = m.review_count || m.reviewCount || 0;

    const overlay = document.createElement('div');
    overlay.className = 'char-modal-overlay';
    overlay.id = 'charModal';
    overlay.innerHTML = `
        <div class="char-modal">
            <button class="modal-close" onclick="closeCharDetail()">×</button>

            <div class="modal-char-display">
                <div class="modal-char-big" onclick="speakChar('${char}')">${char}</div>
                <div class="modal-char-pinyin">${pinyin}</div>
                <button class="modal-speak-btn" onclick="speakChar('${char}')">🔊 听发音</button>
                ${reviewCount > 0 ? `<div style="font-size:0.85rem;color:#888;margin-top:6px;">已复习 ${reviewCount} 次</div>` : ''}
            </div>

            <div class="modal-section section-visual">
                <div class="modal-section-title">🎨 形象记忆</div>
                <div class="emoji">${visual.emoji}</div>
                <div class="desc">${visual.desc}</div>
            </div>

            <div class="modal-section section-tianzige">
                <div class="modal-section-title">✍️ 田字格</div>
                <div class="tianzige">
                    <div class="diagonal1"></div>
                    <div class="diagonal2"></div>
                    <div class="tz-char">${char}</div>
                </div>
            </div>

            <div class="modal-section section-etymology">
                <div class="modal-section-title">📜 字源故事</div>
                <div class="text">${visual.etymology}</div>
            </div>

            <div class="modal-section section-memory">
                <div class="modal-section-title">💡 记忆口诀</div>
                <div class="text">${visual.memory}</div>
            </div>

            <div class="modal-actions">
                ${isMastered
                    ? `<button class="modal-btn-relearn" onclick="relearn('${char}')">重新学习</button>`
                    : `<button class="modal-btn-practice" onclick="closeCharDetail(); startSinglePractice('${char}')">练习此字</button>
                       <button class="modal-btn-master" onclick="markMastered('${char}')">标记掌握</button>`
                }
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeCharDetail(); });
    document.addEventListener('keydown', handleModalEsc);

    setTimeout(() => speakChar(char), 300);
}

function handleModalEsc(e) {
    if (e.key === 'Escape') closeCharDetail();
}

function closeCharDetail() {
    const modal = document.getElementById('charModal');
    if (modal) {
        modal.remove();
        document.removeEventListener('keydown', handleModalEsc);
    }
}

// ========== 操作 ==========

async function markMastered(char) {
    const m = cachedMistakes.find(x => x.char === char);
    if (!m) return;
    m.status = 'mastered';
    m.masteredAt = new Date().toISOString();
    if (m.id) {
        try {
            await fetch(`${API_BASE}/mistakes/${m.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'mastered' })
            });
        } catch (e) {}
    }
    saveMistakes(cachedMistakes);
    closeCharDetail();
    updateStats();
    renderCards();
}

async function relearn(char) {
    const m = cachedMistakes.find(x => x.char === char);
    if (!m) return;
    m.status = 'practicing';
    if (m.id) {
        try {
            await fetch(`${API_BASE}/mistakes/${m.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'practicing' })
            });
        } catch (e) {}
    }
    saveMistakes(cachedMistakes);
    closeCharDetail();
    updateStats();
    renderCards();
}

async function refreshMistakes() {
    cachedMistakes = null;
    await loadMistakes();
}

async function clearAllMistakes() {
    if (!confirm('确定清空所有错字吗？')) return;
    const kidId = getCurrentKidId();
    if (kidId && cachedMistakes) {
        for (const m of cachedMistakes) {
            if (m.id) {
                try {
                    await fetch(`${API_BASE}/mistakes/${m.id}`, { method: 'DELETE' });
                } catch (e) {}
            }
        }
    }
    localStorage.removeItem('mistakeBook');
    cachedMistakes = [];
    updateStats();
    renderCards();
}

// ========== 发音 ==========

function speakChar(char) {
    if (!char) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(char);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.75;
    utterance.pitch = 1.15;
    utterance.volume = 1.0;

    const voices = speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith('zh') && v.name.includes('Ting')) ||
                    voices.find(v => v.lang.startsWith('zh-CN')) ||
                    voices.find(v => v.lang.startsWith('zh'));
    if (zhVoice) utterance.voice = zhVoice;
    speechSynthesis.speak(utterance);
}

// 确保语音列表加载
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
}

// ========== 拼音工具函数 ==========

// 去掉声调符号，返回纯拼音字母
function stripTone(py) {
    const toneMap = {
        'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
        'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
        'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
        'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
        'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
        'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü'
    };
    return py.split('').map(c => toneMap[c] || c).join('');
}

// 获取声调数字 (1-4, 0=轻声)
function getToneNumber(py) {
    const tone1 = 'āēīōūǖ';
    const tone2 = 'áéíóúǘ';
    const tone3 = 'ǎěǐǒǔǚ';
    const tone4 = 'àèìòùǜ';
    for (const c of py) {
        if (tone1.includes(c)) return 1;
        if (tone2.includes(c)) return 2;
        if (tone3.includes(c)) return 3;
        if (tone4.includes(c)) return 4;
    }
    return 0;
}

// 拼音声母提取
function getInitial(py) {
    const base = stripTone(py);
    const initials = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l',
                      'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
    for (const ini of initials) {
        if (base.startsWith(ini)) return ini;
    }
    return ''; // 零声母
}

// 拼音韵母提取
function getFinal(py) {
    const base = stripTone(py);
    const initial = getInitial(py);
    return base.slice(initial.length);
}

// 给纯拼音字母加上指定声调
function applyTone(base, tone) {
    if (tone === 0) return base;
    // 声调标在韵母主元音上：a/e优先，ou标o，其他标后一个元音
    const tones = {
        'a': ['ā', 'á', 'ǎ', 'à'],
        'e': ['ē', 'é', 'ě', 'è'],
        'i': ['ī', 'í', 'ǐ', 'ì'],
        'o': ['ō', 'ó', 'ǒ', 'ò'],
        'u': ['ū', 'ú', 'ǔ', 'ù'],
        'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ']
    };
    const idx = tone - 1;

    // 找标调位置
    if (base.includes('a')) return base.replace('a', tones['a'][idx]);
    if (base.includes('e')) return base.replace('e', tones['e'][idx]);
    if (base.includes('ou')) return base.replace('o', tones['o'][idx]);
    // iu / ui 标后一个
    const vowels = ['a', 'e', 'i', 'o', 'u', 'ü'];
    for (let i = base.length - 1; i >= 0; i--) {
        if (vowels.includes(base[i]) && tones[base[i]]) {
            return base.slice(0, i) + tones[base[i]][idx] + base.slice(i + 1);
        }
    }
    return base;
}

// ========== 干扰项生成 v2 ==========

function generatePinyinOptionsV2(correctPinyin) {
    if (!correctPinyin) return [correctPinyin || '?'];

    const correctBase = stripTone(correctPinyin);
    const correctTone = getToneNumber(correctPinyin);
    const correctInitial = getInitial(correctPinyin);
    const correctFinal = getFinal(correctPinyin);

    const options = new Set();
    options.add(correctPinyin);

    // 策略1：同韵母不同声调（最佳干扰）
    const allTones = [1, 2, 3, 4];
    for (const t of allTones) {
        if (t !== correctTone && options.size < 4) {
            const variant = applyTone(correctBase, t);
            if (variant !== correctPinyin) options.add(variant);
        }
    }

    // 策略2：同声母不同韵母（保持长度相近）
    if (options.size < 4) {
        const allPinyins = Object.values(localPinyinDict);
        const sameLenPinyins = allPinyins.filter(p => {
            const base = stripTone(p);
            return base.length === correctBase.length &&
                   getInitial(p) === correctInitial &&
                   stripTone(p) !== correctBase;
        });
        for (const p of shuffle(sameLenPinyins)) {
            if (options.size >= 4) break;
            if (!hasDuplicateBase(options, p)) options.add(p);
        }
    }

    // 策略3：相同长度的其他拼音
    if (options.size < 4) {
        const allPinyins = Object.values(localPinyinDict);
        const sameLenPinyins = allPinyins.filter(p => {
            const base = stripTone(p);
            return base.length === correctBase.length && stripTone(p) !== correctBase;
        });
        for (const p of shuffle(sameLenPinyins)) {
            if (options.size >= 4) break;
            if (!hasDuplicateBase(options, p)) options.add(p);
        }
    }

    // 兜底：放宽长度限制 (±1)
    if (options.size < 4) {
        const allPinyins = Object.values(localPinyinDict);
        const nearLenPinyins = allPinyins.filter(p => {
            const base = stripTone(p);
            return Math.abs(base.length - correctBase.length) <= 1 && stripTone(p) !== correctBase;
        });
        for (const p of shuffle(nearLenPinyins)) {
            if (options.size >= 4) break;
            if (!hasDuplicateBase(options, p)) options.add(p);
        }
    }

    return shuffle(Array.from(options).slice(0, 4));
}

// 检查选项中是否已有相同 base 拼音（避免同音选项）
function hasDuplicateBase(optionSet, newPinyin) {
    const newBase = stripTone(newPinyin);
    for (const existing of optionSet) {
        if (stripTone(existing) === newBase) return true;
    }
    return false;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// 为「看拼音选字」生成选项：从字典补充，确保无同音字
function generateCharOptions(correctChar, correctPinyin, pool) {
    const options = [correctChar];
    const correctBase = stripTone(correctPinyin);

    // 先从错字本池中选不同音的字
    const poolChars = shuffle(pool.filter(m => {
        if (m.char === correctChar) return false;
        const py = m.pinyin || pinyinCache[m.char] || localPinyinDict[m.char] || '';
        return stripTone(py) !== correctBase;
    }));

    for (const m of poolChars) {
        if (options.length >= 4) break;
        options.push(m.char);
    }

    // 不够则从字典补充
    if (options.length < 4) {
        const dictEntries = shuffle(Object.entries(localPinyinDict).filter(([ch, py]) => {
            return ch !== correctChar &&
                   stripTone(py) !== correctBase &&
                   !options.includes(ch);
        }));
        for (const [ch] of dictEntries) {
            if (options.length >= 4) break;
            options.push(ch);
        }
    }

    return shuffle(options.slice(0, 4));
}

// ========== 队列练习系统 ==========

let practiceQueue = [];
let practiceCorrect = 0;
let practiceTotal = 0;
let practiceMode = 'pinyin'; // 'pinyin' | 'char' | 'listen'

function startQueuePractice(mode) {
    if (!cachedMistakes) return;
    const learning = cachedMistakes.filter(m => m.status !== 'mastered');
    if (learning.length === 0) {
        alert('没有需要练习的字！');
        return;
    }

    practiceMode = mode;
    practiceQueue = shuffle([...learning]);
    practiceCorrect = 0;
    practiceTotal = practiceQueue.length;

    const titles = { pinyin: '看字选拼音', char: '看拼音选字', listen: '听音选字' };
    document.getElementById('practiceTitle').textContent = titles[mode] || '练习';
    document.getElementById('practiceArea').classList.add('active');
    document.getElementById('practiceArea').scrollIntoView({ behavior: 'smooth' });

    showNextPractice();
}

function startSinglePractice(char) {
    if (!cachedMistakes) return;
    const m = cachedMistakes.find(x => x.char === char);
    if (!m) return;

    practiceMode = 'pinyin';
    practiceQueue = [m];
    practiceCorrect = 0;
    practiceTotal = 1;

    document.getElementById('practiceTitle').textContent = `练习：${char}`;
    document.getElementById('practiceArea').classList.add('active');
    document.getElementById('practiceArea').scrollIntoView({ behavior: 'smooth' });

    showNextPractice();
}

function showNextPractice() {
    if (practiceQueue.length === 0) {
        showPracticeSummary();
        return;
    }

    const done = practiceTotal - practiceQueue.length;
    const pct = practiceTotal > 0 ? (done / practiceTotal * 100) : 0;
    document.getElementById('practiceProgress').style.width = pct + '%';
    document.getElementById('practiceResult').innerHTML = '';

    const current = practiceQueue[0];
    const pinyin = current.pinyin || pinyinCache[current.char] || localPinyinDict[current.char] || '';

    if (practiceMode === 'pinyin') {
        // 看字选拼音
        document.getElementById('practiceQuestion').innerHTML = `
            <div style="font-size:5rem;cursor:pointer;" onclick="speakChar('${current.char}')">${current.char}</div>
            <div style="font-size:0.95rem;color:#888;margin-top:8px;">选择正确的拼音</div>`;

        const options = generatePinyinOptionsV2(pinyin);
        document.getElementById('practiceOptions').innerHTML = options.map(opt => `
            <button class="practice-option" style="font-size:1.6rem;"
                onclick="checkAnswer(this, '${escapeHtml(opt)}', '${escapeHtml(pinyin)}', '${current.char}')">
                ${opt}
            </button>`).join('');

        setTimeout(() => speakChar(current.char), 200);

    } else if (practiceMode === 'char') {
        // 看拼音选字
        document.getElementById('practiceQuestion').innerHTML = `
            <div style="font-size:2.2rem;color:#667eea;font-weight:700;">${pinyin}</div>
            <div style="font-size:0.95rem;color:#888;margin-top:8px;">选择对应的汉字</div>
            <button onclick="speakChar('${current.char}')" style="margin-top:10px;padding:8px 18px;background:#ff6b6b;color:white;border:none;border-radius:14px;cursor:pointer;font-size:0.95rem;">🔊 听发音</button>`;

        const pool = cachedMistakes.filter(m => m.status !== 'mastered');
        const options = generateCharOptions(current.char, pinyin, pool);
        document.getElementById('practiceOptions').innerHTML = options.map(ch => `
            <button class="practice-option" style="font-size:3.2rem;"
                onclick="checkAnswer(this, '${ch}', '${current.char}', '${current.char}')">
                ${ch}
            </button>`).join('');

    } else if (practiceMode === 'listen') {
        // 听音选字
        document.getElementById('practiceQuestion').innerHTML = `
            <div style="font-size:1.2rem;color:#888;margin-bottom:16px;">听发音，选汉字</div>
            <button onclick="speakChar('${current.char}')" style="padding:16px 32px;background:linear-gradient(135deg,#ff6b6b,#ee5a6f);color:white;border:none;border-radius:20px;cursor:pointer;font-size:1.3rem;font-weight:700;">🔊 再听一次</button>`;

        const pool = cachedMistakes.filter(m => m.status !== 'mastered');
        const options = generateCharOptions(current.char, pinyin, pool);
        document.getElementById('practiceOptions').innerHTML = options.map(ch => `
            <button class="practice-option" style="font-size:3.2rem;"
                onclick="checkAnswer(this, '${ch}', '${current.char}', '${current.char}')">
                ${ch}
            </button>`).join('');

        setTimeout(() => speakChar(current.char), 300);
    }
}

function checkAnswer(btn, selected, correct, char) {
    // 禁用所有按钮
    const allBtns = document.querySelectorAll('.practice-option');
    allBtns.forEach(b => b.disabled = true);

    const isCorrect = selected === correct;
    btn.classList.add(isCorrect ? 'correct' : 'wrong');

    // 高亮正确答案
    if (!isCorrect) {
        allBtns.forEach(b => {
            const val = b.textContent.trim();
            if (val === correct) b.classList.add('correct');
        });
    }

    const resultEl = document.getElementById('practiceResult');
    if (isCorrect) {
        practiceCorrect++;
        resultEl.innerHTML = '<div style="color:#4CAF50;">✅ 回答正确！</div>';
        speakChar(char);
        practiceQueue.shift(); // 答对出队
    } else {
        resultEl.innerHTML = `<div style="color:#f44336;">❌ 正确答案：${correct}</div>`;
        // 答错：移到队尾
        const item = practiceQueue.shift();
        practiceQueue.push(item);
    }

    // 更新复习次数
    incrementReviewCount(char);

    setTimeout(() => showNextPractice(), 1500);
}

function showPracticeSummary() {
    const pct = practiceTotal > 0 ? Math.round(practiceCorrect / practiceTotal * 100) : 0;
    document.getElementById('practiceProgress').style.width = '100%';
    document.getElementById('practiceQuestion').innerHTML = `
        <div class="practice-summary">
            <div class="score">${pct}%</div>
            <div style="font-size:1.2rem;color:#666;margin-top:10px;">
                ${practiceTotal} 题全部完成！答对 ${practiceCorrect} 题
            </div>
            <div style="margin-top:16px;font-size:1.4rem;">
                ${pct === 100 ? '🏆 太棒了！全对！' : pct >= 80 ? '👍 很不错！继续加油！' : '💪 多练习几次就会了！'}
            </div>
        </div>`;
    document.getElementById('practiceOptions').innerHTML = '';
    document.getElementById('practiceResult').innerHTML = '';
}

function closePractice() {
    document.getElementById('practiceArea').classList.remove('active');
    practiceQueue = [];
}

async function incrementReviewCount(char) {
    const m = cachedMistakes.find(x => x.char === char);
    if (!m) return;
    m.review_count = (m.review_count || 0) + 1;
    if (m.status === 'new') m.status = 'practicing';

    if (m.id) {
        try {
            await fetch(`${API_BASE}/mistakes/${m.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review_count: m.review_count, status: m.status })
            });
        } catch (e) {}
    }
    saveMistakes(cachedMistakes);
}

function escapeHtml(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ========== 添加错字（阅读页调用） ==========

async function addMistake(char, recognized, source) {
    const kidId = getCurrentKidId();
    const pinyin = await getPinyin(char);

    if (kidId) {
        try {
            await fetch(`${API_BASE}/mistakes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kid_id: parseInt(kidId), char, pinyin, recognized, source })
            });
        } catch (e) {
            console.error('API添加错字失败:', e);
        }
    }

    // 更新本地缓存
    const mistakes = await getMistakes();
    saveMistakes(mistakes);
}

// ========== 汉字图形数据 ==========

const charVisualData = {
    '日': { emoji: '☀️', desc: '太阳的形状', etymology: '甲骨文像一轮太阳，中间一点代表光芒', memory: '圆圆的太阳，发出温暖的光芒' },
    '月': { emoji: '🌙', desc: '弯弯的月亮', etymology: '甲骨文像一弯新月', memory: '弯弯的月牙儿挂天上' },
    '山': { emoji: '⛰️', desc: '三座山峰', etymology: '像三座连绵起伏的山峰', memory: '三座高山排排站' },
    '水': { emoji: '💧', desc: '流动的水', etymology: '像流动的河水，中间是主流，两边是支流', memory: '小河流水哗啦啦' },
    '火': { emoji: '🔥', desc: '燃烧的火焰', etymology: '像跳动的火苗', memory: '火苗向上窜，温暖又明亮' },
    '木': { emoji: '🌲', desc: '一棵树', etymology: '上面是树枝，中间是树干，下面是树根', memory: '大树高高，根深叶茂' },
    '人': { emoji: '🚶', desc: '站立的人', etymology: '像一个侧面站立的人', memory: '一个人，两条腿，站得直' },
    '口': { emoji: '👄', desc: '嘴巴', etymology: '像人的嘴巴形状', memory: '一张嘴巴，吃饭说话都用它' },
    '目': { emoji: '👁️', desc: '眼睛', etymology: '像人的眼睛，外框是眼眶', memory: '大大的眼睛看世界' },
    '手': { emoji: '✋', desc: '手', etymology: '像五根手指张开的手', memory: '五根手指本领大' },
    '足': { emoji: '🦶', desc: '脚', etymology: '像人的脚和腿', memory: '两只小脚走路快' },
    '心': { emoji: '❤️', desc: '心脏', etymology: '像心脏的形状', memory: '一颗红心砰砰跳' },
    '田': { emoji: '🌾', desc: '田地', etymology: '像一块块划分好的农田', memory: '方方田字格，种满庄稼' },
    '禾': { emoji: '🌾', desc: '稻穗', etymology: '像成熟的稻穗垂下来', memory: '禾苗青青，结出稻穗' },
    '鱼': { emoji: '🐟', desc: '鱼', etymology: '像有鱼头、鱼身、鱼尾的形状', memory: '小鱼水里游，摆摆尾巴摇摇头' },
    '鸟': { emoji: '🐦', desc: '鸟', etymology: '像有头、羽、爪的鸟形', memory: '小鸟天上飞，翅膀扇扇' },
    '马': { emoji: '🐴', desc: '马', etymology: '像马的侧面，有头、身、腿、尾', memory: '小马四条腿，跑得快如飞' },
    '牛': { emoji: '🐮', desc: '牛', etymology: '像牛头，上面两角向上弯', memory: '牛头有两角，耕田力气大' },
    '羊': { emoji: '🐑', desc: '羊', etymology: '像羊头，两角向下弯', memory: '山羊两角弯，爱吃青草山' },
    '犬': { emoji: '🐕', desc: '狗', etymology: '像狗的侧面，有头、身、尾、腿', memory: '小狗汪汪叫，忠诚又可爱' },
    '门': { emoji: '🚪', desc: '门', etymology: '像两扇门的形状', memory: '两扇门，开又关' },
    '雨': { emoji: '🌧️', desc: '下雨', etymology: '上面是天空，下面是雨滴', memory: '云在天上飘，雨滴落下来' },
    '云': { emoji: '☁️', desc: '云朵', etymology: '像天空中卷曲的云', memory: '白云天上飘，像棉花糖' },
    '雪': { emoji: '❄️', desc: '雪花', etymology: '像飘落的雪花', memory: '雪花片片，洁白美丽' },
    '风': { emoji: '🌬️', desc: '风', etymology: '像风吹动的样子', memory: '风吹树叶沙沙响' },
    '石': { emoji: '🪨', desc: '石头', etymology: '像山崖下的石块', memory: '山下有块石，坚硬又结实' },
    '土': { emoji: '🟫', desc: '土地', etymology: '像地上的土块', memory: '黄土黑土，养育万物' },
    '金': { emoji: '🏆', desc: '金属', etymology: '像两块铜锭', memory: '黄金闪亮亮，珍贵又值钱' },
    '春': { emoji: '🌸', desc: '春天', etymology: '太阳（日）下草木（屯）生长', memory: '春日阳光好，草木发芽了' },
    '夏': { emoji: '☀️', desc: '夏天', etymology: '人在太阳下，天气炎热', memory: '夏日炎炎，阳光灿烂' },
    '秋': { emoji: '🍂', desc: '秋天', etymology: '禾+火，禾谷成熟如火色', memory: '秋天禾谷熟，金黄一片' },
    '冬': { emoji: '❄️', desc: '冬天', etymology: '像冰结在两头', memory: '冬天寒冷，冰雪覆盖' },
    '东': { emoji: '🌅', desc: '东方', etymology: '太阳在木中升起', memory: '太阳从东方升起' },
    '西': { emoji: '🌇', desc: '西方', etymology: '像鸟归巢，太阳落山', memory: '夕阳西下，鸟儿归巢' },
    '南': { emoji: '🧭', desc: '南方', etymology: '像一种乐器，南方之音', memory: '指南针指向南方' },
    '北': { emoji: '🧭', desc: '北方', etymology: '像两人相背', memory: '北方的方向' },
    '上': { emoji: '⬆️', desc: '上面', etymology: '一长横为基准，短画在上', memory: '高高在上，向上攀登' },
    '下': { emoji: '⬇️', desc: '下面', etymology: '一长横为基准，短画在下', memory: '向下看，脚踏实地' },
    '大': { emoji: '📏', desc: '大的', etymology: '像张开双臂的人，表示大', memory: '人张开双臂，表示很大' },
    '小': { emoji: '🤏', desc: '小的', etymology: '像细小的沙粒', memory: '小小的，像沙粒' },
    '好': { emoji: '👍', desc: '好的', etymology: '女+子，有女有子为好', memory: '有儿有女，家庭美好' },
    '花': { emoji: '🌺', desc: '花朵', etymology: '草字头+化，草的变化', memory: '草上开出美丽的花' },
    '草': { emoji: '🌿', desc: '小草', etymology: '草字头+早，早晨的草', memory: '早晨的青草绿油油' },
    '树': { emoji: '🌳', desc: '树木', etymology: '木+对，成对的木', memory: '两棵大树站在一起' },
    '林': { emoji: '🌲', desc: '树林', etymology: '两木为林', memory: '两棵树就是一片小林' },
    '森': { emoji: '🌲', desc: '森林', etymology: '三木为森', memory: '三棵树就是茂密森林' },
    '明': { emoji: '💡', desc: '明亮', etymology: '日+月，日月光明', memory: '日月同辉，光明灿烂' },
    '星': { emoji: '⭐', desc: '星星', etymology: '日生，日生光辉', memory: '晚上出生的光点就是星' },
    '光': { emoji: '💫', desc: '光明', etymology: '火在人上，火光照明', memory: '火光照耀，一片光明' },
    '家': { emoji: '🏡', desc: '家', etymology: '屋里有猪（豕），表示有财产', memory: '家里有猪，表示富裕温暖' },
    '学': { emoji: '📚', desc: '学习', etymology: '双手（臼）在算（子）', memory: '双手捧书认真学习' },
    '爱': { emoji: '❤️', desc: '爱心', etymology: '心+旡，心中有情', memory: '心中有爱，用心爱' },
    '看': { emoji: '👀', desc: '看见', etymology: '手+目，用手遮目远望', memory: '手搭凉棚，远远看' },
    '听': { emoji: '👂', desc: '听见', etymology: '口+斤，用耳倾听', memory: '用耳朵听，静静听' },
    '说': { emoji: '💬', desc: '说话', etymology: '言+兑，用嘴表达', memory: '开口说话，言字旁' },
    '走': { emoji: '🚶‍♂️', desc: '走路', etymology: '像人摆臂行走', memory: '大步走路，向前走' },
    '飞': { emoji: '🦅', desc: '飞翔', etymology: '像鸟展翅飞翔', memory: '小鸟飞上天，翅膀扇动' },
    '笑': { emoji: '😄', desc: '微笑', etymology: '竹+夭，像人笑的样子', memory: '竹字头下一个人，笑哈哈' },
    '哭': { emoji: '😭', desc: '哭泣', etymology: '像犬吠，引申为哭泣', memory: '两只大眼睛，在哭泣' }
};

function generateGenericVisual(char, pinyin) {
    const commonRadicals = {
        '氵': { name: '三点水', meaning: '和水有关', emoji: '💧' },
        '扌': { name: '提手旁', meaning: '和手的动作有关', emoji: '✋' },
        '口': { name: '口字旁', meaning: '和嘴巴有关', emoji: '👄' },
        '亻': { name: '单人旁', meaning: '和人有关', emoji: '👤' },
        '木': { name: '木字旁', meaning: '和树木有关', emoji: '🌲' },
        '艹': { name: '草字头', meaning: '和植物有关', emoji: '🌿' },
        '讠': { name: '言字旁', meaning: '和说话有关', emoji: '💬' },
        '纟': { name: '绞丝旁', meaning: '和丝线有关', emoji: '🧵' },
        '忄': { name: '竖心旁', meaning: '和心理有关', emoji: '❤️' },
        '宀': { name: '宝盖头', meaning: '和房屋有关', emoji: '🏠' },
        '辶': { name: '走之旁', meaning: '和行走有关', emoji: '🚶' },
        '钅': { name: '金字旁', meaning: '和金属有关', emoji: '⚙️' },
        '女': { name: '女字旁', meaning: '和女性有关', emoji: '👩' },
        '日': { name: '日字旁', meaning: '和太阳、时间有关', emoji: '☀️' },
        '月': { name: '月字旁', meaning: '和月亮、身体有关', emoji: '🌙' }
    };

    for (const [radical, info] of Object.entries(commonRadicals)) {
        if (char.includes(radical)) {
            return {
                emoji: info.emoji,
                desc: `包含"${info.name}"，${info.meaning}`,
                etymology: `${info.name}，${info.meaning}`,
                memory: `${char}字有${info.name}，${info.meaning}`
            };
        }
    }

    return {
        emoji: '📝',
        desc: `汉字"${char}"`,
        etymology: `"${char}"是一个汉字，读作${pinyin || '...'}`,
        memory: `"${char}"字要记牢，多读多写就会了！`
    };
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    initPinyinCache();
    loadMistakes();

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) loadMistakes();
    });
});

// ========== 导出给阅读页面使用 ==========

window.mistakeBook = {
    addMistake,
    getMistakes,
    saveMistakes
};
