// 智能阅读模块
// API 基础URL - 根据当前路径自动检测
const pathParts = window.location.pathname.split('/');
const appIndex = pathParts.indexOf('app');
const BASE_PATH = appIndex >= 0 ? '/' + pathParts.slice(1, appIndex + 2).join('/') : '';
const API_BASE = BASE_PATH + '/api';

let currentArticle = null;
let charElements = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let errorWords = [];
let isReading = false;
let isPaused = false;
let recognition = null;
let allArticles = []; // 内置 + 自定义文章

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

// 拼音字典（扩展版）
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
    '乃': 'nǎi', '迁': 'qiān', '道': 'dào', '贵': 'guì', '以': 'yǐ', '专': 'zhuān',
    // 更多常用字
    '大': 'dà', '的': 'de', '是': 'shì', '了': 'le', '在': 'zài', '有': 'yǒu',
    '和': 'hé', '这': 'zhè', '那': 'nà', '个': 'gè', '们': 'men', '说': 'shuō',
    '要': 'yào', '去': 'qù', '到': 'dào', '看': 'kàn', '好': 'hǎo', '很': 'hěn',
    '都': 'dōu', '就': 'jiù', '可': 'kě', '也': 'yě', '能': 'néng', '对': 'duì',
    '着': 'zhe', '过': 'guò', '给': 'gěi', '但': 'dàn', '还': 'hái', '自': 'zì',
    '让': 'ràng', '从': 'cóng', '才': 'cái', '用': 'yòng', '想': 'xiǎng', '只': 'zhǐ',
    '最': 'zuì', '再': 'zài', '现': 'xiàn', '比': 'bǐ', '当': 'dāng', '没': 'méi',
    '被': 'bèi', '已': 'yǐ', '真': 'zhēn', '新': 'xīn', '年': 'nián', '得': 'dé',
    '出': 'chū', '起': 'qǐ', '会': 'huì', '后': 'hòu', '作': 'zuò', '里': 'lǐ',
    '家': 'jiā', '心': 'xīn', '面': 'miàn', '打': 'dǎ', '长': 'zhǎng', '方': 'fāng',
    '成': 'chéng', '什': 'shén', '么': 'me', '名': 'míng', '同': 'tóng', '五': 'wǔ',
    '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí', '你': 'nǐ',
    '他': 'tā', '她': 'tā', '它': 'tā', '们': 'men', '得': 'de', '地': 'de',
    '着': 'zhe', '过': 'guo', '吧': 'ba', '吗': 'ma', '呢': 'ne', '啊': 'a'
};

// 形近字映射表（用于容错）
const similarChars = {
    '天': ['夫', '夭', '太'], '太': ['大', '天', '夫'], '夫': ['天', '太'],
    '人': ['入', '八'], '入': ['人', '八'], '八': ['人', '入'],
    '日': ['曰', '目', '白'], '目': ['日', '自'], '白': ['日', '百'],
    '土': ['士', '干', '王'], '士': ['土', '干'], '王': ['土', '玉'],
    '未': ['末', '朱'], '末': ['未'], '己': ['已', '巳'], '已': ['己', '巳'],
    '几': ['儿', '九'], '儿': ['几'], '刀': ['力', '刁'], '力': ['刀'],
    '午': ['牛', '干'], '牛': ['午'], '干': ['千', '午', '于'],
    '今': ['令', '令'], '令': ['今'], '万': ['方'], '方': ['万', '芳'],
    '木': ['本', '术', '禾'], '本': ['木', '术'], '禾': ['木', '和'],
    '情': ['请', '清', '晴', '睛'], '请': ['情', '清'], '清': ['情', '请'],
    '晴': ['情', '请', '睛'], '睛': ['晴', '情'],
    '做': ['作', '坐', '座'], '作': ['做', '昨'], '坐': ['做', '座'],
    '他': ['她', '它'], '她': ['他', '它'], '它': ['他', '她'],
    '园': ['圆', '元'], '圆': ['园', '元'], '元': ['园', '圆'],
    '再': ['在'], '在': ['再'], '带': ['戴'], '戴': ['带'],
    '级': ['极', '急', '及'], '极': ['级', '急'], '及': ['级', '急'],
    '象': ['像', '向'], '像': ['象'], '向': ['象'],
    '吗': ['妈', '马', '嘛'], '妈': ['吗', '马'], '马': ['吗', '妈'],
    '话': ['化', '画', '华'], '画': ['话', '化'], '化': ['话', '画']
};

// 语音识别缓存，用于提高准确度
let recognitionBuffer = '';
let lastRecognitionTime = 0;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadAllArticles();
    initSpeechRecognition();
    initSpeedSlider();
    initAddArticleModal();

    // 检查是否有生成的文章
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('generated') === 'true') {
        loadGeneratedArticle();
    }
});

// 加载生成的文章
function loadGeneratedArticle() {
    const saved = localStorage.getItem('generatedArticle');
    if (!saved) return;

    const article = JSON.parse(saved);

    // 添加到文章列表
    const customArticle = {
        id: 'generated-' + Date.now(),
        title: article.title + ' (AI生成)',
        content: article.content,
        level: 'medium',
        isCustom: true,
        isGenerated: true
    };

    // 临时添加到列表
    allArticles.unshift(customArticle);
    initArticleList();

    // 自动选择
    setTimeout(() => selectArticle(customArticle.id), 100);
}

// 加载所有文章（内置 + 自定义）
function loadAllArticles() {
    // 从 localStorage 加载自定义文章
    const customArticles = JSON.parse(localStorage.getItem('customArticles') || '[]');

    // 合并文章列表，自定义文章使用负ID避免冲突
    allArticles = [
        ...builtinArticles,
        ...customArticles.map((a, i) => ({ ...a, id: -(i + 1), isCustom: true }))
    ];

    initArticleList();
}

// 初始化文章列表
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

// 初始化语音识别 - 使用更高级的配置
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert('您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器');
        document.getElementById('startBtn').disabled = true;
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    // 优化识别参数
    recognition.maxAlternatives = 3; // 获取多个候选结果

    recognition.onresult = handleSpeechResult;
    recognition.onerror = handleSpeechError;
    recognition.onend = handleSpeechEnd;
}

// 初始化速度滑块
function initSpeedSlider() {
    const slider = document.getElementById('speedSlider');
    const value = document.getElementById('speedValue');

    slider.addEventListener('input', () => {
        const speeds = ['很慢', '慢', '正常', '快', '很快'];
        value.textContent = speeds[slider.value - 1];
    });
}

// 初始化添加文章模态框
function initAddArticleModal() {
    const content = document.getElementById('newArticleContent');
    const count = document.getElementById('charCount');

    content.addEventListener('input', () => {
        count.textContent = content.value.length;
    });
}

// 选择文章
function selectArticle(id) {
    currentArticle = allArticles.find(a => a.id === id);
    if (!currentArticle) return;

    // 更新UI
    document.querySelectorAll('.article-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.id) === id);
    });

    document.getElementById('articleTitle').textContent =
        currentArticle.title + (currentArticle.author ? ` - ${currentArticle.author}` : '');

    // 渲染文章
    renderArticle(currentArticle.content);

    // 重置状态
    resetReading();

    // 显示进度条
    document.getElementById('progressContainer').classList.remove('hidden');

    // 启用开始按钮
    document.getElementById('startBtn').disabled = false;
}

// 渲染文章
function renderArticle(content) {
    const container = document.getElementById('articleContent');
    charElements = [];

    let html = '';
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const isPunct = /[，。！？、；：""''（）【】]/.test(char);

        if (char === '\n') {
            html += '<br>';
        } else {
            html += `<span class="char ${isPunct ? 'punct' : ''}" data-index="${i}" data-char="${char}">${char}</span>`;
        }
    }

    container.innerHTML = html;

    // 保存字符元素引用（不包括标点）
    charElements = Array.from(container.querySelectorAll('.char:not(.punct)'));

    // 更新进度
    updateProgress();
}

// 开始朗读
function startReading() {
    if (!currentArticle) {
        alert('请先选择一篇文章');
        return;
    }

    if (!recognition) {
        alert('语音识别未初始化');
        return;
    }

    isReading = true;
    isPaused = false;
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    errorWords = [];
    recognitionBuffer = '';

    // 更新UI
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    document.getElementById('statusIndicator').classList.remove('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('saveBtn').classList.add('hidden');

    updateStatus('listening', '🎤 请大声朗读...');

    // 高亮第一个字
    highlightCurrent();

    // 开始识别
    try {
        recognition.start();
    } catch (e) {
        console.log('Recognition already started');
    }
}

// 暂停朗读
function pauseReading() {
    isPaused = true;
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('resumeBtn').classList.remove('hidden');
    updateStatus('processing', '⏸️ 已暂停');

    if (recognition) {
        recognition.stop();
    }
}

// 继续朗读
function resumeReading() {
    isPaused = false;
    document.getElementById('pauseBtn').classList.remove('hidden');
    document.getElementById('resumeBtn').classList.add('hidden');
    updateStatus('listening', '🎤 请继续朗读...');

    if (recognition) {
        recognition.start();
    }
}

// 重置朗读
function resetReading() {
    isReading = false;
    isPaused = false;
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    errorWords = [];
    recognitionBuffer = '';

    // 停止识别
    if (recognition) {
        recognition.stop();
    }

    // 重置UI
    document.querySelectorAll('.char').forEach(char => {
        char.classList.remove('current', 'correct', 'wrong');
    });

    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').disabled = !currentArticle;
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('resumeBtn').classList.add('hidden');
    document.getElementById('statusIndicator').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('saveBtn').classList.add('hidden');

    updateStats();
    updateProgress();
}

// 处理语音识别结果 - 改进版
function handleSpeechResult(event) {
    const results = event.results;
    const now = Date.now();

    for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i];
        const transcript = result[0].transcript;

        // 收集所有候选结果
        let alternatives = [transcript];
        for (let j = 1; j < result.length; j++) {
            if (result[j].transcript) {
                alternatives.push(result[j].transcript);
            }
        }

        if (result.isFinal) {
            console.log('语音识别结果:', transcript);

            // 累积识别结果
            recognitionBuffer += transcript;

            // 限制缓冲区大小
            if (recognitionBuffer.length > 50) {
                recognitionBuffer = recognitionBuffer.slice(-50);
            }

            // 处理识别到的文本
            processRecognizedTextAdvanced(alternatives);

            lastRecognitionTime = now;
        } else {
            // 临时结果显示
            showInterimResult(transcript);
        }
    }
}

// 显示临时结果（视觉反馈）
function showInterimResult(text) {
    // 可以在这里添加实时反馈
    const statusText = document.getElementById('statusText');
    if (statusText && isReading) {
        statusText.textContent = '🎤 识别中: ' + text.slice(-10);
    }
}

// 高级识别处理 - 使用多种算法提高准确度
function processRecognizedTextAdvanced(alternatives) {
    if (!currentArticle || currentIndex >= charElements.length) return;

    console.log('处理识别文本:', alternatives);

    // 处理所有候选结果
    for (const text of alternatives) {
        // 去除空格和标点
        const cleanText = text.replace(/[，。！？、；：""''（）【】\s]/g, '');

        console.log('清理后文本:', cleanText, '当前索引:', currentIndex);

        if (cleanText.length === 0) {
            console.log('清理后文本为空，跳过');
            continue;
        }

        // 使用滑动窗口匹配
        const result = tryMatchText(cleanText);
        console.log('匹配结果:', result);

        if (result) {
            console.log('匹配成功');
            return; // 成功匹配
        }
    }

    // 如果没有匹配成功，尝试强制匹配第一个字符作为错误
    console.log('没有匹配成功，尝试强制匹配');
    if (alternatives.length > 0 && currentIndex < charElements.length) {
        const firstText = alternatives[0].replace(/[，。！？、；：""''（）【】\s]/g, '');
        if (firstText.length > 0) {
            const recognizedChar = firstText[0];
            const expectedChar = charElements[currentIndex]?.dataset?.char;
            if (expectedChar && recognizedChar !== expectedChar) {
                console.log('强制标记错误:', expectedChar, '->', recognizedChar);
                markWrong(currentIndex, recognizedChar);
                currentIndex++;
                highlightCurrent();
                updateProgress();
            }
        }
    }
}

// 尝试匹配文本 - 使用多种策略
function tryMatchText(text) {
    let matchedCount = 0;

    console.log('tryMatchText 开始:', text, '长度:', text.length);

    for (let i = 0; i < text.length && currentIndex < charElements.length; i++) {
        const recognizedChar = text[i];
        const expectedChar = charElements[currentIndex]?.dataset?.char;

        console.log(`比较: 预期[${expectedChar}] vs 识别[${recognizedChar}]`);

        if (!expectedChar) {
            console.log('没有预期字符，跳过');
            break;
        }

        // 跳过标点符号
        if (/[，。！？、；：""''（）【】\s]/.test(recognizedChar)) {
            console.log('跳过标点:', recognizedChar);
            continue;
        }

        // 使用多种匹配策略
        const matchResult = checkMatchAdvanced(expectedChar, recognizedChar);
        console.log('匹配结果:', matchResult);

        if (matchResult.isMatch) {
            if (matchResult.exact) {
                // 完全匹配，正确
                markCorrect(currentIndex);
                matchedCount++;
            } else {
                // 容错匹配（同音字、形近字等），算正确但记录到错字本
                markCorrect(currentIndex);
                addToMistakeBook(expectedChar, recognizedChar + (matchResult.reason ? `(${matchResult.reason})` : ''));
                matchedCount++;
            }
            currentIndex++;
        } else {
            // 不匹配，标记为错误（不管是否 confident）
            console.log('不匹配，标记错误');
            markWrong(currentIndex, recognizedChar);
            currentIndex++;
        }

        // 检查是否完成
        if (currentIndex >= charElements.length) {
            finishReading();
            return true;
        }
    }

    console.log('匹配完成, matchedCount:', matchedCount, 'currentIndex:', currentIndex);

    if (matchedCount > 0 || currentIndex > 0) {
        // 只要有处理过字符，就算成功
        highlightCurrent();
        updateProgress();
        return true;
    }

    return false;
}

// 高级匹配检查 - 多种策略
function checkMatchAdvanced(expected, recognized) {
    // 1. 完全匹配
    if (expected === recognized) {
        return { isMatch: true, confident: true, exact: true };
    }

    // 2. 拼音匹配（容错声调）- 算正确但记录到错字本
    const expectedPinyin = pinyinDict[expected];
    const recognizedPinyin = pinyinDict[recognized];

    if (expectedPinyin && recognizedPinyin) {
        // 去除声调比较
        const expBase = expectedPinyin.replace(/[1234]/g, '');
        const recBase = recognizedPinyin.replace(/[1234]/g, '');

        if (expBase === recBase) {
            // 同音字，阅读流畅性算正确，但记录到错字本
            return { isMatch: true, confident: true, exact: false, reason: '同音字' };
        }

        // 模糊拼音匹配（前后鼻音、平翘舌等）
        if (isSimilarPinyin(expBase, recBase)) {
            return { isMatch: true, confident: true, exact: false, reason: '近似音' };
        }
    }

    // 3. 形近字匹配 - 算正确但记录到错字本
    if (similarChars[expected] && similarChars[expected].includes(recognized)) {
        return { isMatch: true, confident: true, exact: false, reason: '形近字' };
    }

    // 4. 常见混淆字处理 - 算正确但记录到错字本
    if (isCommonConfusion(expected, recognized)) {
        return { isMatch: true, confident: true, exact: false, reason: '常见混淆' };
    }

    // 5. 如果两个字都不在字典中，可能是特殊字符，保守处理
    if (!expectedPinyin && !recognizedPinyin) {
        return { isMatch: false, confident: false };
    }

    return { isMatch: false, confident: true };
}

// 模糊拼音匹配
function isSimilarPinyin(p1, p2) {
    // 前后鼻音容错
    const nMapping = { 'en': 'eng', 'eng': 'en', 'in': 'ing', 'ing': 'in', 'un': 'ong', 'ong': 'un' };

    // 平翘舌容错
    const sMapping = { 'z': 'zh', 'zh': 'z', 'c': 'ch', 'ch': 'c', 's': 'sh', 'sh': 's' };

    // n/l 容错
    const nlMapping = { 'n': 'l', 'l': 'n' };

    // 检查是否是常见的拼音混淆
    for (const [k, v] of Object.entries(nMapping)) {
        if ((p1.includes(k) && p2.includes(v)) || (p1.includes(v) && p2.includes(k))) {
            const r1 = p1.replace(k, '').replace(v, '');
            const r2 = p2.replace(k, '').replace(v, '');
            if (r1 === r2) return true;
        }
    }

    // 检查首字母
    if (p1[0] !== p2[0]) {
        const c1 = p1[0], c2 = p2[0];
        if ((sMapping[c1] === c2) || (nlMapping[c1] === c2)) {
            return p1.slice(1) === p2.slice(1);
        }
    }

    return false;
}

// 常见混淆字处理
function isCommonConfusion(expected, recognized) {
    // 数字和中文数字
    const numMap = { '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '七': '7', '八': '8', '九': '9', '十': '10' };
    if (numMap[expected] === recognized || numMap[recognized] === expected) {
        return true;
    }

    // 常见同义字
    const synonymMap = {
        '的': ['地', '得'],
        '在': ['再'],
        '做': ['作'],
        '像': ['象'],
        '他': ['她', '它'],
        '她': ['他', '它']
    };

    if (synonymMap[expected] && synonymMap[expected].includes(recognized)) {
        return true;
    }

    return false;
}

// 标记正确
function markCorrect(index) {
    const char = charElements[index];
    char.classList.remove('current');
    char.classList.add('correct');
    correctCount++;
    updateStats();

    // 显示拼音提示
    showPinyinPopup(char.dataset.char);
}

// 标记错误
function markWrong(index, recognized) {
    const char = charElements[index];
    if (!char) {
        console.log('markWrong: 字符元素不存在, index:', index);
        return;
    }

    const expected = char.dataset.char;
    if (!expected) {
        console.log('markWrong: 预期字符不存在');
        return;
    }

    console.log('>>> 标记错误:', expected, '识别为:', recognized);

    // 视觉反馈
    char.classList.remove('current');
    char.classList.add('wrong');
    wrongCount++;

    // 记录错误
    errorWords.push({
        expected: expected,
        recognized: recognized || '未识别',
        pinyin: pinyinDict[expected] || ''
    });

    // 添加到错字本
    console.log('>>> 调用 addToMistakeBook:', expected, recognized);
    addToMistakeBook(expected, recognized || '未识别');

    updateStats();
}

// 测试错字本功能
function testAddMistake() {
    console.log('>>> 测试错字本功能');

    // 测试添加一个错字
    const testChar = '测';
    const testRecognized = '读错';

    console.log('添加测试错字:', testChar, '->', testRecognized);
    addToMistakeBook(testChar, testRecognized);

    // 验证是否保存成功
    const saved = localStorage.getItem('mistakeBook');
    console.log('保存的数据:', saved);

    alert('测试错字已添加！请去错字本查看。');
}

// 添加到错字本
function addToMistakeBook(char, recognized) {
    console.log('>>> addToMistakeBook 被调用:', char, recognized);

    // 检查 localStorage 是否可用
    try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
    } catch (e) {
        console.error('>>> localStorage 不可用:', e);
        return;
    }

    // 清理输入字符
    const cleanChar = char ? String(char).trim() : '';
    if (!cleanChar || cleanChar === '') {
        console.log('>>> 跳过空字符');
        return;
    }

    // 只保留第一个字符
    const firstChar = cleanChar.charAt(0);
    console.log('>>> 处理字符:', firstChar);

    try {
        const key = 'mistakeBook';
        let existing = null;
        try {
            existing = localStorage.getItem(key);
        } catch (e) {
            console.error('>>> 读取 localStorage 失败:', e);
        }
        console.log('>>> 现有错字本数据:', existing);

        const mistakes = existing ? JSON.parse(existing) : [];
        const found = mistakes.find(m => m.char === firstChar);

        if (found) {
            found.count = (found.count || 0) + 1;
            found.recognized = recognized || '未识别';
            found.lastWrong = new Date().toISOString();
            if (found.status === 'mastered') {
                found.status = 'practicing';
            }
            console.log('>>> 更新错字:', firstChar, '次数:', found.count);
        } else {
            const newMistake = {
                char: firstChar,
                pinyin: pinyinDict[firstChar] || '',
                recognized: recognized || '未识别',
                source: currentArticle ? currentArticle.title : '未知',
                count: 1,
                reviewCount: 0,
                status: 'new',
                createdAt: new Date().toISOString(),
                lastWrong: new Date().toISOString()
            };
            mistakes.push(newMistake);
            console.log('>>> 新增错字:', firstChar, newMistake);
        }

        try {
            localStorage.setItem(key, JSON.stringify(mistakes));
            console.log('>>> 错字本已保存，当前共', mistakes.length, '个字');
        } catch (saveError) {
            console.error('>>> 保存到 localStorage 失败:', saveError);
            if (saveError.name === 'QuotaExceededError') {
                alert('存储空间已满，无法保存错字');
            }
            return;
        }

        // 验证保存成功
        try {
            const saved = localStorage.getItem(key);
            console.log('>>> 验证保存结果:', saved);
        } catch (verifyError) {
            console.error('>>> 验证保存失败:', verifyError);
        }
    } catch (error) {
        console.error('>>> 保存错字失败:', error);
    }
}

// 高亮当前字
function highlightCurrent() {
    // 清除之前的高亮
    document.querySelectorAll('.char.current').forEach(char => {
        char.classList.remove('current');
    });

    // 高亮当前字
    if (currentIndex < charElements.length) {
        charElements[currentIndex].classList.add('current');

        // 滚动到可视区域
        charElements[currentIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// 显示拼音弹窗
function showPinyinPopup(char) {
    const pinyin = pinyinDict[char];
    if (!pinyin) return;

    // 移除旧的弹窗
    const oldPopup = document.querySelector('.word-popup');
    if (oldPopup) oldPopup.remove();

    // 创建新弹窗
    const popup = document.createElement('div');
    popup.className = 'word-popup';
    popup.innerHTML = `
        <div class="pinyin">${pinyin}</div>
        <div>${char}</div>
    `;
    document.body.appendChild(popup);

    // 自动移除
    setTimeout(() => popup.remove(), 1500);
}

// 更新状态显示
function updateStatus(type, text) {
    const indicator = document.getElementById('statusIndicator');
    indicator.className = 'status-indicator ' + type;
    document.getElementById('statusText').textContent = text;
}

// 更新统计
function updateStats() {
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;

    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

// 更新进度
function updateProgress() {
    const total = charElements.length;
    const progress = total > 0 ? (currentIndex / total) * 100 : 0;

    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `${currentIndex} / ${total} 字`;
}

// 完成阅读
function finishReading() {
    isReading = false;

    // 停止识别
    if (recognition) {
        recognition.stop();
    }

    // 更新UI
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('resumeBtn').classList.add('hidden');
    updateStatus('success', '✅ 阅读完成！');

    // 显示结果
    showResult();

    // 显示保存按钮
    document.getElementById('saveBtn').classList.remove('hidden');
}

// 显示结果
function showResult() {
    const resultArea = document.getElementById('resultArea');
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    document.getElementById('resultScore').textContent = accuracy + '%';

    let message = '';
    if (accuracy === 100) message = '🎉 完美！全对！';
    else if (accuracy >= 90) message = '👏 太棒了！几乎全对！';
    else if (accuracy >= 80) message = '💪 很好！继续加油！';
    else if (accuracy >= 60) message = '📚 还不错，多练习会更好！';
    else message = '🎯 还需要多加练习哦！';

    document.getElementById('resultDetail').innerHTML = `
        ${message}<br>
        <small>正确 ${correctCount} 字，错误 ${wrongCount} 字</small>
    `;

    // 显示错误列表
    const errorList = document.getElementById('errorList');
    if (errorWords.length > 0) {
        errorList.classList.remove('hidden');
        document.getElementById('errorWords').innerHTML = errorWords.map(e => `
            <span class="error-item" title="读成了：${e.recognized} (${e.pinyin})">${e.expected}</span>
        `).join('');
    } else {
        errorList.classList.add('hidden');
    }

    resultArea.classList.remove('hidden');
}

// 保存阅读记录
function saveReadingRecord() {
    const kidId = localStorage.getItem('currentKidId');
    if (!kidId) {
        alert('请先选择小朋友');
        return;
    }

    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            kid_id: parseInt(kidId),
            subject_id: 8, // 阅读
            learning_date: new Date().toISOString().split('T')[0],
            duration: Math.max(1, Math.floor(total / 10)),
            content: `朗读《${currentArticle.title}》`,
            performance: Math.max(1, Math.ceil(accuracy / 20)),
            mood: accuracy >= 80 ? '😄' : accuracy >= 60 ? '😊' : '🤔',
            notes: `正确率${accuracy}%，正确${correctCount}字，错误${wrongCount}字`
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

// 处理识别错误
function handleSpeechError(event) {
    console.error('Speech recognition error:', event.error);

    switch(event.error) {
        case 'no-speech':
            updateStatus('error', '没有检测到语音，请大声朗读');
            break;
        case 'audio-capture':
            updateStatus('error', '无法访问麦克风');
            break;
        case 'not-allowed':
            updateStatus('error', '请允许使用麦克风');
            break;
        default:
            updateStatus('error', '识别出错，请重试');
    }

    // 自动重启识别
    if (isReading && !isPaused) {
        setTimeout(() => {
            try {
                recognition.start();
            } catch (e) {
                console.log('Auto restart failed:', e);
            }
        }, 1000);
    }
}

// 处理识别结束
function handleSpeechEnd() {
    if (isReading && !isPaused && currentIndex < charElements.length) {
        // 自动重启识别
        setTimeout(() => {
            try {
                recognition.start();
            } catch (e) {
                console.log('Restart failed:', e);
            }
        }, 500);
    }
}

// ========== 自定义文章功能 ==========

// 显示添加文章模态框
function showAddArticleModal() {
    document.getElementById('addArticleModal').style.display = 'flex';
    document.getElementById('addArticleModal').classList.remove('hidden');
}

// 关闭添加文章模态框
function closeAddArticleModal() {
    document.getElementById('addArticleModal').style.display = 'none';
    document.getElementById('addArticleModal').classList.add('hidden');

    // 清空表单
    document.getElementById('newArticleTitle').value = '';
    document.getElementById('newArticleAuthor').value = '';
    document.getElementById('newArticleContent').value = '';
    document.getElementById('charCount').textContent = '0';
}

// 添加自定义文章
function addCustomArticle() {
    const title = document.getElementById('newArticleTitle').value.trim();
    const author = document.getElementById('newArticleAuthor').value.trim();
    const content = document.getElementById('newArticleContent').value.trim();
    const level = document.getElementById('newArticleLevel').value;

    if (!title) {
        alert('请输入文章标题');
        return;
    }

    if (!content) {
        alert('请输入文章内容');
        return;
    }

    if (content.length > 500) {
        alert('文章内容太长了，请控制在500字以内');
        return;
    }

    // 获取已保存的自定义文章
    const customArticles = JSON.parse(localStorage.getItem('customArticles') || '[]');

    // 添加新文章
    customArticles.push({
        title,
        author: author || undefined,
        content,
        level,
        createdAt: new Date().toISOString()
    });

    // 保存到 localStorage
    localStorage.setItem('customArticles', JSON.stringify(customArticles));

    // 重新加载文章列表
    loadAllArticles();

    // 关闭模态框
    closeAddArticleModal();

    alert('文章添加成功！');
}
