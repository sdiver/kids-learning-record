// 家长手动标注模式 - 朗读页
// API 基础URL - 根据当前路径自动检测
const pathParts = window.location.pathname.split('/');
const appIndex = pathParts.indexOf('app');
const BASE_PATH = appIndex >= 0 ? '/' + pathParts.slice(1, appIndex + 2).join('/') : '';
const API_BASE = BASE_PATH + '/api';

let currentArticle = null;
let charElements = [];
let totalCharCount = 0;
let wrongCount = 0;
let errorWords = [];
let pendingMistakes = []; // [{ char, index, recognized }]
let isReading = false;
let allArticles = [];
let startTime = null;

// 拼音缓存
let pinyinCache = {};
const PINYIN_CACHE_KEY = 'pinyin_cache';

// 预置文章库
const builtinArticles = [
    { id: 1, title: '咏鹅', author: '骆宾王', content: '鹅鹅鹅，曲项向天歌。白毛浮绿水，红掌拨清波。', level: 'easy' },
    { id: 2, title: '静夜思', author: '李白', content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。', level: 'easy' },
    { id: 3, title: '春晓', author: '孟浩然', content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', level: 'easy' },
    { id: 4, title: '小兔子乖乖', content: '小兔子乖乖，把门儿开开。快点儿开开，我要进来。不开不开我不开，妈妈没回来，谁来也不开。', level: 'easy' },
    { id: 5, title: '悯农', author: '李绅', content: '锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。', level: 'medium' },
    { id: 6, title: '登鹳雀楼', author: '王之涣', content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', level: 'medium' },
    { id: 7, title: '望庐山瀑布', author: '李白', content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', level: 'hard' },
    { id: 8, title: '三字经（节选）', content: '人之初，性本善。性相近，习相远。苟不教，性乃迁。教之道，贵以专。', level: 'medium' }
];

// 拼音字典（本地回退）
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
    '都': 'dōu', '就': 'jiù', '可': 'kě', '对': 'duì',
    '着': 'zhe', '过': 'guò', '给': 'gěi', '但': 'dàn', '还': 'hái', '自': 'zì',
    '让': 'ràng', '从': 'cóng', '才': 'cái', '用': 'yòng', '想': 'xiǎng', '只': 'zhǐ',
    '最': 'zuì', '再': 'zài', '现': 'xiàn', '比': 'bǐ',
    '被': 'bèi', '已': 'yǐ', '真': 'zhēn', '新': 'xīn', '年': 'nián', '得': 'dé',
    '出': 'chū', '起': 'qǐ', '会': 'huì', '后': 'hòu', '作': 'zuò',
    '家': 'jiā', '心': 'xīn', '面': 'miàn', '打': 'dǎ', '长': 'zhǎng', '方': 'fāng',
    '成': 'chéng', '什': 'shén', '么': 'me', '名': 'míng', '同': 'tóng', '五': 'wǔ',
    '六': 'liù', '七': 'qī', '八': 'bā', '十': 'shí', '你': 'nǐ',
    '他': 'tā', '她': 'tā', '它': 'tā', '吧': 'ba', '吗': 'ma', '呢': 'ne', '啊': 'a'
};

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', async () => {
    initPinyinCache();
    await loadAllArticles();
    initAddArticleModal();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('generated') === 'true') {
        loadGeneratedArticle();
    }
});

// ========== 拼音缓存 ==========

function initPinyinCache() {
    try {
        const cached = localStorage.getItem(PINYIN_CACHE_KEY);
        if (cached) {
            pinyinCache = JSON.parse(cached);
        }
    } catch (e) {
        pinyinCache = {};
    }
}

function savePinyinCache() {
    try {
        localStorage.setItem(PINYIN_CACHE_KEY, JSON.stringify(pinyinCache));
    } catch (e) {}
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

// 获取常见字的拼音（本地字典）
function getCommonPinyin(char) {
    const commonDict = {
        '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ',
        '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí',
        '的': 'de', '是': 'shì', '在': 'zài', '有': 'yǒu', '和': 'hé',
        '这': 'zhè', '那': 'nà', '个': 'gè', '了': 'le', '不': 'bù',
        '说': 'shuō', '人': 'rén', '我': 'wǒ', '你': 'nǐ', '他': 'tā',
        '她': 'tā', '它': 'tā', '们': 'men', '为': 'wèi', '之': 'zhī',
        '与': 'yǔ', '到': 'dào', '上': 'shàng', '下': 'xià', '中': 'zhōng',
        '大': 'dà', '小': 'xiǎo', '来': 'lái', '去': 'qù', '走': 'zǒu',
        '跑': 'pǎo', '吃': 'chī', '喝': 'hē', '看': 'kàn', '见': 'jiàn',
        '听': 'tīng', '想': 'xiǎng', '知': 'zhī', '道': 'dào', '好': 'hǎo',
        '多': 'duō', '少': 'shǎo', '很': 'hěn', '太': 'tài', '都': 'dōu',
        '就': 'jiù', '能': 'néng', '会': 'huì', '要': 'yào', '让': 'ràng',
        '给': 'gěi', '从': 'cóng', '才': 'cái', '可': 'kě', '以': 'yǐ',
        '也': 'yě', '没': 'méi', '还': 'hái', '但': 'dàn', '而': 'ér',
        '只': 'zhǐ', '最': 'zuì', '更': 'gèng', '再': 'zài', '现': 'xiàn',
        '比': 'bǐ', '被': 'bèi', '已': 'yǐ', '真': 'zhēn', '新': 'xīn',
        '年': 'nián', '得': 'dé', '出': 'chū', '起': 'qǐ', '家': 'jiā',
        '心': 'xīn', '面': 'miàn', '打': 'dǎ', '长': 'zhǎng', '方': 'fāng',
        '成': 'chéng', '什': 'shén', '么': 'me', '名': 'míng', '同': 'tóng',
        '吧': 'ba', '吗': 'ma', '呢': 'ne', '啊': 'a', '着': 'zhe',
        '过': 'guò', '里': 'lǐ', '用': 'yòng', '作': 'zuò', '自': 'zì',
        '前': 'qián', '后': 'hòu', '时': 'shí', '今': 'jīn', '明': 'míng',
        '天': 'tiān', '月': 'yuè', '日': 'rì', '水': 'shuǐ', '火': 'huǒ',
        '木': 'mù', '土': 'tǔ', '金': 'jīn', '山': 'shān', '石': 'shí',
        '田': 'tián', '禾': 'hé', '对': 'duì', '云': 'yún', '雨': 'yǔ',
        '风': 'fēng', '花': 'huā', '鸟': 'niǎo', '虫': 'chóng',
        '爸': 'bà', '妈': 'mā', '哥': 'gē', '姐': 'jiě', '弟': 'dì', '妹': 'mèi',
        '爷': 'yé', '奶': 'nǎi', '老': 'lǎo', '师': 'shī',
        '学': 'xué', '友': 'yǒu', '朋': 'péng', '高': 'gāo', '兴': 'xìng',
        '快': 'kuài', '乐': 'lè', '爱': 'ài', '喜': 'xǐ', '欢': 'huan',
        '笑': 'xiào', '哭': 'kū', '气': 'qì', '怕': 'pà', '忙': 'máng',
        '东': 'dōng', '西': 'xī', '南': 'nán', '北': 'běi', '左': 'zuǒ',
        '右': 'yòu', '早': 'zǎo', '晚': 'wǎn', '春': 'chūn', '夏': 'xià',
        '秋': 'qiū', '冬': 'dōng', '头': 'tóu', '手': 'shǒu', '足': 'zú',
        '耳': 'ěr', '目': 'mù', '口': 'kǒu', '牙': 'yá', '舌': 'shé',
        '唇': 'chún', '发': 'fà', '皮': 'pí', '毛': 'máo', '身': 'shēn',
        '体': 'tǐ', '胸': 'xiōng', '背': 'bèi', '腰': 'yāo', '腿': 'tuǐ',
        '脚': 'jiǎo', '眼': 'yǎn', '睛': 'jīng', '眉': 'méi', '鼻': 'bí',
        '红': 'hóng', '黄': 'huáng', '蓝': 'lán', '绿': 'lǜ', '白': 'bái',
        '黑': 'hēi', '紫': 'zǐ', '青': 'qīng', '灰': 'huī', '粉': 'fěn',
        '书': 'shū', '本': 'běn', '笔': 'bǐ', '纸': 'zhǐ', '桌': 'zhuō',
        '椅': 'yǐ', '门': 'mén', '窗': 'chuāng', '床': 'chuáng', '灯': 'dēng',
        '衣': 'yī', '服': 'fú', '裤': 'kù', '鞋': 'xié', '帽': 'mào',
        '袜': 'wà', '裙': 'qún', '猫': 'māo', '狗': 'gǒu', '鸡': 'jī',
        '鸭': 'yā', '鱼': 'yú', '马': 'mǎ', '牛': 'niú', '羊': 'yáng',
        '猪': 'zhū', '兔': 'tù', '猴': 'hóu', '虎': 'hǔ',
        '狼': 'láng', '象': 'xiàng', '熊': 'xióng', '鹿': 'lù', '龟': 'guī',
        '开': 'kāi', '关': 'guān', '进': 'jìn', '坐': 'zuò',
        '站': 'zhàn', '立': 'lì', '睡': 'shuì', '醒': 'xǐng', '玩': 'wán',
        '问': 'wèn', '答': 'dá', '告': 'gào', '诉': 'sù', '讲': 'jiǎng',
        '记': 'jì', '忘': 'wàng', '念': 'niàn', '读': 'dú', '写': 'xiě',
        '画': 'huà', '唱': 'chàng', '跳': 'tiào', '飞': 'fēi', '游': 'yóu'
    };
    return commonDict[char] || null;
}

// ========== 文章管理 ==========

function loadGeneratedArticle() {
    const saved = localStorage.getItem('generatedArticle');
    if (!saved) return;

    const article = JSON.parse(saved);
    const GENERATED_ID = -99999;
    allArticles = allArticles.filter(a => a.id !== GENERATED_ID);

    const customArticle = {
        id: GENERATED_ID,
        title: article.title + ' (AI生成)',
        content: article.content,
        level: 'medium',
        isCustom: true,
        isGenerated: true
    };

    allArticles.unshift(customArticle);
    initArticleList();
    selectArticle(GENERATED_ID);
}

async function loadAllArticles() {
    let customArticles = [];
    try {
        const response = await fetch(`${API_BASE}/articles/custom`);
        const data = await response.json();
        if (data.success) {
            customArticles = data.data;
        }
    } catch (e) {
        console.error('加载自定义文章失败:', e);
    }

    allArticles = [
        ...builtinArticles,
        ...customArticles.map(a => ({ ...a, id: -a.id, isCustom: true }))
    ];

    initArticleList();
}

function initArticleList() {
    const container = document.getElementById('articleList');
    container.innerHTML = allArticles.map(article => `
        <button class="article-btn ${article.isCustom ? 'custom' : ''}" data-id="${article.id}" onclick="selectArticle(${article.id})">
            ${article.title}
            ${article.level === 'easy' ? '⭐' : article.level === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
            ${article.isCustom ? '📝' : ''}
        </button>
    `).join('');
}

// 预加载拼音（异步，不阻塞渲染）
function preloadArticlePinyins(content) {
    const chars = [...new Set(content.split('').filter(c => /[\u4e00-\u9fa5]/.test(c)))];
    chars.forEach(c => getPinyin(c));
}

function selectArticle(id) {
    currentArticle = allArticles.find(a => a.id === id);
    if (!currentArticle) return;

    document.querySelectorAll('.article-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.id) === id);
    });

    document.getElementById('articleTitle').textContent =
        currentArticle.title + (currentArticle.author ? ` - ${currentArticle.author}` : '');

    preloadArticlePinyins(currentArticle.content);
    renderArticle(currentArticle.content);
    resetReading();

    document.getElementById('startBtn').disabled = false;
}

function renderArticle(content) {
    const container = document.getElementById('articleContent');
    charElements = [];

    let html = '';
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const isPunct = /[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\uFF02\uFF07，。！？、；：""''（）【】「」『』〈〉《》…—～·\s\r\n"'`!?,.:;()\[\]{}\-]/.test(char);

        if (char === '\n') {
            html += '<br>';
        } else {
            html += `<span class="char ${isPunct ? 'punct' : ''}"
                data-index="${i}"
                data-char="${char}"
                onclick="onCharClick(${i}, '${char}')"
                title="${isPunct ? '' : '点击标错 / 取消标错'}">${char}</span>`;
        }
    }

    container.innerHTML = html;
    charElements = Array.from(container.querySelectorAll('.char:not(.punct)'));
    totalCharCount = charElements.length;

    document.getElementById('totalCharDisplay').textContent = totalCharCount;
}

// ========== 阅读控制 ==========

function startReading() {
    if (!currentArticle) {
        alert('请先选择一篇文章');
        return;
    }

    isReading = true;
    wrongCount = 0;
    errorWords = [];
    pendingMistakes = [];
    startTime = Date.now();

    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('finishBtn').classList.remove('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('saveBtn').classList.add('hidden');

    // 清除所有旧标注
    document.querySelectorAll('.char').forEach(el => el.classList.remove('wrong', 'correct'));

    updateStats();
}

function finishReading() {
    isReading = false;

    // 冲刷待定错字队列到错字本
    pendingMistakes.forEach(m => addToMistakeBook(m.char, m.recognized));
    pendingMistakes = [];

    document.getElementById('finishBtn').classList.add('hidden');
    document.getElementById('saveBtn').classList.remove('hidden');

    showResult();
}

function resetReading() {
    isReading = false;
    wrongCount = 0;
    errorWords = [];
    pendingMistakes = [];
    startTime = null;

    document.querySelectorAll('.char').forEach(el => el.classList.remove('wrong', 'correct'));

    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').disabled = !currentArticle;
    document.getElementById('finishBtn').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('saveBtn').classList.add('hidden');

    document.getElementById('wrongCount').textContent = '0';
    document.getElementById('accuracy').textContent = '—';
    document.getElementById('totalCharDisplay').textContent = totalCharCount;
}

// ========== 字符点击：切换标错 + 发音 ==========

function onCharClick(index, char) {
    // 始终播放发音
    speakChar(char);

    if (!isReading) {
        // 未开始时只显示拼音提示
        showSimplePinyinHint(char);
        return;
    }

    const charEl = document.querySelector(`.char[data-index="${index}"]`);
    if (!charEl || charEl.classList.contains('punct')) return;

    if (charEl.classList.contains('wrong')) {
        // 取消标错
        charEl.classList.remove('wrong');
        wrongCount = Math.max(0, wrongCount - 1);
        errorWords = errorWords.filter(e => e.index !== index);
        pendingMistakes = pendingMistakes.filter(m => m.index !== index);
    } else {
        // 标为错误
        charEl.classList.add('wrong');
        wrongCount++;
        errorWords.push({ expected: char, index, recognized: '手动标记', pinyin: localPinyinDict[char] || '' });
        pendingMistakes.push({ char, index, recognized: '手动标记' });
    }

    updateStats();
}

function updateStats() {
    const wrongEl = document.getElementById('wrongCount');
    const accuracyEl = document.getElementById('accuracy');
    const totalEl = document.getElementById('totalCharDisplay');

    if (wrongEl) wrongEl.textContent = wrongCount;
    if (totalEl) totalEl.textContent = totalCharCount;

    if (accuracyEl) {
        if (totalCharCount > 0) {
            const correctCount = totalCharCount - wrongCount;
            const acc = Math.round((correctCount / totalCharCount) * 100);
            accuracyEl.textContent = acc + '%';
        } else {
            accuracyEl.textContent = '—';
        }
    }
}

// ========== 结果与保存 ==========

function showResult() {
    const correctCount = totalCharCount - wrongCount;
    const accuracy = totalCharCount > 0 ? Math.round((correctCount / totalCharCount) * 100) : 0;

    document.getElementById('resultScore').textContent = accuracy + '%';

    let message = '';
    if (accuracy === 100) message = '🎉 完美！全对！';
    else if (accuracy >= 90) message = '👏 太棒了！几乎全对！';
    else if (accuracy >= 80) message = '💪 很好！继续加油！';
    else if (accuracy >= 60) message = '📚 还不错，多练习会更好！';
    else message = '🎯 还需要多加练习哦！';

    document.getElementById('resultDetail').innerHTML = `
        ${message}<br>
        <small>总字数 ${totalCharCount}，标错 ${wrongCount} 字</small>
    `;

    const errorList = document.getElementById('errorList');
    if (errorWords.length > 0) {
        errorList.classList.remove('hidden');
        document.getElementById('errorWords').innerHTML = errorWords.map(e => `
            <span class="error-item" title="${e.pinyin ? e.pinyin : ''}">${e.expected}</span>
        `).join('');
    } else {
        errorList.classList.add('hidden');
    }

    document.getElementById('resultArea').classList.remove('hidden');
}

function saveReadingRecord() {
    const kidId = localStorage.getItem('currentKidId');
    if (!kidId) {
        alert('请先选择小朋友');
        return;
    }

    const correctCount = totalCharCount - wrongCount;
    const accuracy = totalCharCount > 0 ? Math.round((correctCount / totalCharCount) * 100) : 0;
    const durationMs = startTime ? Date.now() - startTime : 0;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));

    fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            kid_id: parseInt(kidId),
            subject_id: 8,
            learning_date: new Date().toISOString().split('T')[0],
            duration: durationMin,
            content: `朗读《${currentArticle.title}》`,
            performance: Math.max(1, Math.ceil(accuracy / 20)),
            mood: accuracy >= 80 ? '😄' : accuracy >= 60 ? '😊' : '🤔',
            notes: `正确率${accuracy}%，总字${totalCharCount}，标错${wrongCount}字`
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('阅读记录已保存！获得 ' + data.data.points_earned + ' 积分！');
        }
    })
    .catch(err => console.error('保存失败:', err));
}

// ========== 错字本 ==========

function addToMistakeBook(char, recognized) {
    const cleanChar = char ? String(char).trim() : '';
    if (!cleanChar) return;

    const firstChar = cleanChar.charAt(0);
    const kidId = localStorage.getItem('currentKidId');

    const mistakeData = {
        char: firstChar,
        pinyin: localPinyinDict[firstChar] || getCommonPinyin(firstChar) || '',
        recognized: recognized || '手动标记',
        source: currentArticle ? currentArticle.title : '未知'
    };

    if (kidId) {
        saveMistakeToAPI(kidId, mistakeData);
    } else {
        saveMistakeToLocalStorage(mistakeData);
    }
}

async function saveMistakeToAPI(kidId, mistakeData) {
    try {
        const response = await fetch(`${API_BASE}/mistakes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                kid_id: parseInt(kidId),
                char: mistakeData.char,
                pinyin: mistakeData.pinyin,
                recognized: mistakeData.recognized,
                source: mistakeData.source
            })
        });
        const result = await response.json();
        if (!result.success) {
            saveMistakeToLocalStorage(mistakeData);
        }
    } catch (error) {
        saveMistakeToLocalStorage(mistakeData);
    }
}

function saveMistakeToLocalStorage(mistakeData) {
    try {
        const key = 'mistakeBook';
        const existing = localStorage.getItem(key);
        const mistakes = existing ? JSON.parse(existing) : [];

        const found = mistakes.find(m => m.char === mistakeData.char);
        if (found) {
            found.count = (found.count || 0) + 1;
            found.recognized = mistakeData.recognized;
            found.lastWrong = new Date().toISOString();
            if (found.status === 'mastered') found.status = 'practicing';
        } else {
            mistakes.push({
                char: mistakeData.char,
                pinyin: mistakeData.pinyin,
                recognized: mistakeData.recognized,
                source: mistakeData.source,
                count: 1,
                reviewCount: 0,
                status: 'new',
                createdAt: new Date().toISOString(),
                lastWrong: new Date().toISOString()
            });
        }

        localStorage.setItem(key, JSON.stringify(mistakes));
    } catch (error) {
        console.error('保存错字失败:', error);
    }
}

// ========== TTS 发音 ==========

function speakChar(char) {
    if (!char) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(char);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.75;
    utterance.pitch = 1.15;
    utterance.volume = 1.0;

    const selectVoice = () => {
        const voices = speechSynthesis.getVoices();
        let selectedVoice = voices.find(v =>
            v.name.includes('Google') && v.lang.startsWith('zh-CN') && v.name.includes('女')
        );
        if (!selectedVoice) {
            selectedVoice = voices.find(v =>
                v.name.includes('Microsoft') && v.lang.startsWith('zh-CN') &&
                (v.name.includes('女') || v.name.includes('Yaoyao') || v.name.includes('Huihui') || v.name.includes('Xiaoxiao'))
            );
        }
        if (!selectedVoice) {
            selectedVoice = voices.find(v =>
                v.lang.startsWith('zh-CN') && (v.name.includes('女') || v.gender === 'female')
            );
        }
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('zh-CN'));
        }
        if (!selectedVoice) {
            selectedVoice = voices.find(v =>
                v.lang.startsWith('zh') && !v.lang.startsWith('zh-HK') && !v.lang.startsWith('zh-TW')
            );
        }
        if (selectedVoice) utterance.voice = selectedVoice;
    };

    if (speechSynthesis.getVoices().length > 0) {
        selectVoice();
    } else {
        speechSynthesis.addEventListener('voiceschanged', selectVoice, { once: true });
    }

    utterance.onerror = () => {
        setTimeout(() => {
            const retry = new SpeechSynthesisUtterance(char);
            retry.lang = 'zh-CN';
            retry.rate = 0.8;
            speechSynthesis.speak(retry);
        }, 100);
    };

    setTimeout(() => speechSynthesis.speak(utterance), 50);
}

// ========== 拼音提示（非朗读模式）==========

function showSimplePinyinHint(char) {
    getPinyin(char).then(pinyin => {
        const oldHint = document.querySelector('.simple-pinyin-hint');
        if (oldHint) oldHint.remove();

        const hint = document.createElement('div');
        hint.className = 'simple-pinyin-hint';
        hint.innerHTML = `
            <span style="font-size: 3rem; color: #333;">${char}</span>
            <span style="font-size: 1.5rem; color: #667eea;">${pinyin || '...'}</span>
        `;
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
            animation: popIn 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        `;
        document.body.appendChild(hint);

        setTimeout(() => {
            hint.style.animation = 'popOut 0.3s ease';
            setTimeout(() => hint.remove(), 300);
        }, 1500);
    });
}

// ========== 自定义文章功能 ==========

function initAddArticleModal() {
    const content = document.getElementById('newArticleContent');
    const count = document.getElementById('charCount');
    if (content && count) {
        content.addEventListener('input', () => {
            count.textContent = content.value.length;
        });
    }
}

function showAddArticleModal() {
    document.getElementById('addArticleModal').style.display = 'flex';
    document.getElementById('addArticleModal').classList.remove('hidden');
}

function closeAddArticleModal() {
    document.getElementById('addArticleModal').style.display = 'none';
    document.getElementById('addArticleModal').classList.add('hidden');
    document.getElementById('newArticleTitle').value = '';
    document.getElementById('newArticleAuthor').value = '';
    document.getElementById('newArticleContent').value = '';
    document.getElementById('charCount').textContent = '0';
}

async function addCustomArticle() {
    const title = document.getElementById('newArticleTitle').value.trim();
    const author = document.getElementById('newArticleAuthor').value.trim();
    const content = document.getElementById('newArticleContent').value.trim();
    const level = document.getElementById('newArticleLevel').value;

    if (!title) { alert('请输入文章标题'); return; }
    if (!content) { alert('请输入文章内容'); return; }
    if (content.length > 2000) { alert('文章内容太长了，请控制在2000字以内'); return; }

    try {
        const response = await fetch(`${API_BASE}/articles/custom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author: author || undefined, content, level })
        });
        const data = await response.json();
        if (!data.success) { alert('添加失败：' + data.message); return; }
    } catch (e) {
        alert('添加失败，请检查网络连接');
        return;
    }

    await loadAllArticles();
    closeAddArticleModal();
    alert('文章添加成功！');
}

// 导出供HTML调用
window.onCharClick = onCharClick;
