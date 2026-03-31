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

// 拼音缓存
let pinyinCache = {};
const PINYIN_CACHE_KEY = 'pinyin_cache';

// 儿童阅读容错配置
let readingConfig = {
    slowMode: false,
    hintMode: true,
    retryEnabled: true,
    recognitionTimeout: 8000, // 8秒识别窗口
    waitBetweenChars: 500, // 字间等待时间
    maxRetries: 3 // 最大重试次数
};

// 当前字的重试计数
let currentCharRetries = 0;

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

// 拼音字典（扩展版）- 作为本地回退
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
    // 更多常用字
    '大': 'dà', '的': 'de', '是': 'shì', '了': 'le', '在': 'zài', '有': 'yǒu',
    '和': 'hé', '这': 'zhè', '那': 'nà', '个': 'gè', '们': 'men', '说': 'shuō',
    '去': 'qù', '到': 'dào', '好': 'hǎo', '很': 'hěn',
    '都': 'dōu', '就': 'jiù', '可': 'kě', '也': 'yě', '能': 'néng', '对': 'duì',
    '着': 'zhe', '过': 'guò', '给': 'gěi', '但': 'dàn', '还': 'hái', '自': 'zì',
    '让': 'ràng', '从': 'cóng', '才': 'cái', '用': 'yòng', '想': 'xiǎng', '只': 'zhǐ',
    '最': 'zuì', '再': 'zài', '现': 'xiàn', '比': 'bǐ', '没': 'méi',
    '被': 'bèi', '已': 'yǐ', '真': 'zhēn', '新': 'xīn', '年': 'nián', '得': 'dé',
    '出': 'chū', '起': 'qǐ', '会': 'huì', '后': 'hòu', '作': 'zuò', '里': 'lǐ',
    '家': 'jiā', '心': 'xīn', '面': 'miàn', '打': 'dǎ', '长': 'zhǎng', '方': 'fāng',
    '成': 'chéng', '什': 'shén', '么': 'me', '名': 'míng', '同': 'tóng', '五': 'wǔ',
    '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí', '你': 'nǐ',
    '他': 'tā', '她': 'tā', '它': 'tā', '吧': 'ba', '吗': 'ma', '呢': 'ne', '啊': 'a'
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

// 初始化拼音缓存
function initPinyinCache() {
    try {
        const cached = localStorage.getItem(PINYIN_CACHE_KEY);
        if (cached) {
            pinyinCache = JSON.parse(cached);
            console.log('拼音缓存已加载:', Object.keys(pinyinCache).length, '个字');
        }
    } catch (e) {
        console.error('加载拼音缓存失败:', e);
        pinyinCache = {};
    }
}

// 保存拼音缓存
function savePinyinCache() {
    try {
        localStorage.setItem(PINYIN_CACHE_KEY, JSON.stringify(pinyinCache));
    } catch (e) {
        console.error('保存拼音缓存失败:', e);
    }
}

// 获取拼音（带缓存和网络查询）
async function getPinyin(char) {
    // 1. 先查缓存
    if (pinyinCache[char]) {
        return pinyinCache[char];
    }

    // 2. 查本地字典
    if (localPinyinDict[char]) {
        pinyinCache[char] = localPinyinDict[char];
        savePinyinCache();
        return localPinyinDict[char];
    }

    // 3. 尝试从服务器获取
    try {
        const response = await fetch(`${API_BASE}/pinyin/${encodeURIComponent(char)}`);
        const data = await response.json();
        if (data.success && data.data.pinyin) {
            pinyinCache[char] = data.data.pinyin;
            savePinyinCache();
            return data.data.pinyin;
        }
    } catch (e) {
        console.error('获取拼音失败:', e);
    }

    // 4. 尝试使用在线API（pinyin-api.com）
    try {
        const pinyin = await fetchPinyinFromAPI(char);
        if (pinyin) {
            pinyinCache[char] = pinyin;
            savePinyinCache();
            return pinyin;
        }
    } catch (e) {
        console.error('网络查询拼音失败:', e);
    }

    return '';
}

// 从网络API获取拼音（备用方案）
async function fetchPinyinFromAPI(char) {
    // 优先使用本地字典，避免网络请求
    const commonPinyin = getCommonPinyin(char);
    if (commonPinyin) {
        return commonPinyin;
    }

    // 如果本地没有，尝试网络API（带超时）
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时

        // 尝试多个备用API
        const apis = [
            // 备用API 1
            `https://v.api.aa1.cn/api/api-pinyin/pinyin.php?msg=${encodeURIComponent(char)}&type=text`,
            // 备用API 2 - 使用本地后端API
            `${API_BASE}/pinyin/${encodeURIComponent(char)}`
        ];

        for (const api of apis) {
            try {
                const response = await fetch(api, {
                    method: 'GET',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const text = await response.text();
                    // 清理返回的拼音
                    const pinyin = text.trim().replace(/[\d\s]/g, '');
                    if (pinyin && pinyin.length > 0 && /^[a-zA-Z]+$/.test(pinyin)) {
                        return pinyin;
                    }
                }
            } catch (apiError) {
                console.log(`API ${api} 失败，尝试下一个`);
                continue;
            }
        }
    } catch (e) {
        console.log('在线拼音API全部失败，使用备用方案');
    }

    // 返回空字符串让上层处理
    return '';
}

// 获取常见字的拼音（本地字典）
function getCommonPinyin(char) {
    const commonDict = {
        // 数字
        '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ',
        '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí',
        // 常见字
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
        '风': 'fēng', '花': 'huā', '鸟': 'niǎo', '虫': 'chóng', '六': 'liù',
        '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí', '爸': 'bà',
        '妈': 'mā', '哥': 'gē', '姐': 'jiě', '弟': 'dì', '妹': 'mèi',
        '爷': 'yé', '奶': 'nǎi', '老': 'lǎo', '师': 'shī', '同': 'tóng',
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
        '猪': 'zhū', '兔': 'tù', '鸟': 'niǎo', '猴': 'hóu', '虎': 'hǔ',
        '狼': 'láng', '象': 'xiàng', '熊': 'xióng', '鹿': 'lù', '龟': 'guī',
        '开': 'kāi', '关': 'guān', '进': 'jìn', '出': 'chū', '坐': 'zuò',
        '站': 'zhàn', '立': 'lì', '睡': 'shuì', '醒': 'xǐng', '玩': 'wán',
        '问': 'wèn', '答': 'dá', '告': 'gào', '诉': 'sù', '讲': 'jiǎng',
        '记': 'jì', '忘': 'wàng', '念': 'niàn', '读': 'dú', '写': 'xiě',
        '画': 'huà', '唱': 'chàng', '跳': 'tiào', '飞': 'fēi', '游': 'yóu'
    };

    return commonDict[char] || null;
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    initPinyinCache();
    await loadAllArticles(); // 等待文章加载完成，避免 loadGeneratedArticle 竞态覆盖
    initSpeechRecognition();
    initSpeedSlider();
    initAddArticleModal();
    initReadingControls();

    // 检查是否有生成的文章（必须在 loadAllArticles 之后执行）
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('generated') === 'true') {
        loadGeneratedArticle();
    }
});

// 初始化阅读控制面板
function initReadingControls() {
    // 慢速模式切换
    const slowModeBtn = document.getElementById('slowModeBtn');
    if (slowModeBtn) {
        slowModeBtn.addEventListener('click', () => {
            readingConfig.slowMode = !readingConfig.slowMode;
            slowModeBtn.classList.toggle('active', readingConfig.slowMode);
            slowModeBtn.textContent = readingConfig.slowMode ? '🐢 慢速模式' : '🐇 正常模式';
            readingConfig.waitBetweenChars = readingConfig.slowMode ? 1500 : 500;
        });
    }

    // 提示模式切换
    const hintModeBtn = document.getElementById('hintModeBtn');
    if (hintModeBtn) {
        hintModeBtn.addEventListener('click', () => {
            readingConfig.hintMode = !readingConfig.hintMode;
            hintModeBtn.classList.toggle('active', readingConfig.hintMode);
            hintModeBtn.textContent = readingConfig.hintMode ? '💡 提示开启' : '💡 提示关闭';
        });
    }

    // 跳过按钮
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', skipCurrentChar);
    }
}

// 跳过当前字
function skipCurrentChar() {
    if (!isReading || currentIndex >= charElements.length) return;

    const char = charElements[currentIndex]?.dataset?.char;
    if (char) {
        markWrong(currentIndex, '跳过');
        currentIndex++;
        currentCharRetries = 0;
        
        if (currentIndex >= charElements.length) {
            finishReading();
        } else {
            highlightCurrent();
            updateProgress();
        }
    }
}

// 显示字的提示（拼音+发音）
function showCharHint(index) {
    const char = charElements[index]?.dataset?.char;
    if (!char) return;

    // 播放发音
    speakChar(char);

    // 显示拼音提示
    getPinyin(char).then(pinyin => {
        const hint = document.getElementById('charHint');
        if (hint) {
            hint.innerHTML = `
                <div class="hint-popup">
                    <span class="hint-char">${char}</span>
                    <span class="hint-pinyin">${pinyin || '...'}</span>
                    <button onclick="speakChar('${char}')">🔊</button>
                </div>
            `;
            hint.classList.remove('hidden');
            setTimeout(() => hint.classList.add('hidden'), 3000);
        }
    });
}

// 非阅读模式下显示简单拼音提示
function showSimplePinyinHint(char) {
    getPinyin(char).then(pinyin => {
        // 移除旧的提示
        const oldHint = document.querySelector('.simple-pinyin-hint');
        if (oldHint) oldHint.remove();

        // 创建新提示（在点击位置附近显示）
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

        // 自动移除
        setTimeout(() => {
            hint.style.animation = 'popOut 0.3s ease';
            setTimeout(() => hint.remove(), 300);
        }, 1500);
    });
}

// 加载生成的文章（必须在 loadAllArticles 之后调用）
function loadGeneratedArticle() {
    const saved = localStorage.getItem('generatedArticle');
    if (!saved) return;

    const article = JSON.parse(saved);

    // 用一个不与内置（正整数）和自定义（负整数）冲突的数字ID
    const GENERATED_ID = -99999;

    // 移除旧的同ID文章（避免重复）
    allArticles = allArticles.filter(a => a.id !== GENERATED_ID);

    const customArticle = {
        id: GENERATED_ID,
        title: article.title + ' (AI生成)',
        content: article.content,
        level: 'medium',
        isCustom: true,
        isGenerated: true
    };

    // 置顶插入列表
    allArticles.unshift(customArticle);
    initArticleList();

    // 直接选中（已无竞态，无需 setTimeout）
    selectArticle(GENERATED_ID);
}

// 加载所有文章（内置 + 自定义）
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

    // 合并文章列表，自定义文章使用负ID避免冲突
    allArticles = [
        ...builtinArticles,
        ...customArticles.map(a => ({ ...a, id: -a.id, isCustom: true }))
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

// 初始化语音识别 - 使用更高级的配置（儿童优化版）
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert('您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器');
        document.getElementById('startBtn').disabled = true;
        return;
    }

    recognition = new SpeechRecognition();
    
    // 儿童阅读优化配置
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    recognition.maxAlternatives = 5; // 增加候选结果数量
    
    // 更宽容的识别参数（如果浏览器支持）
    if ('speechRecognitionThreshold' in recognition) {
        recognition.speechRecognitionThreshold = 0.3; // 降低识别阈值
    }

    recognition.onresult = handleSpeechResult;
    recognition.onerror = handleSpeechError;
    recognition.onend = handleSpeechEnd;
    
    // 增加语音开始检测
    recognition.onstart = () => {
        console.log('语音识别已启动');
        updateStatus('listening', '🎤 请大声朗读...');
    };
    
    // 增加语音结束检测（长停顿）
    recognition.onspeechend = () => {
        console.log('语音输入结束（检测到停顿）');
        if (isReading && !isPaused) {
            // 给儿童更多时间，不立即重启
            setTimeout(() => {
                if (isReading && !isPaused) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.log('重启识别失败:', e);
                    }
                }
            }, readingConfig.slowMode ? 2000 : 1000);
        }
    };
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

// 预加载文章中所有汉字的拼音到 pinyinCache（异步，不阻塞渲染）
function preloadArticlePinyins(content) {
    const chars = [...new Set(content.split('').filter(c => /[\u4e00-\u9fa5]/.test(c)))];
    chars.forEach(c => getPinyin(c)); // getPinyin 内部自动缓存
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

    // 预加载拼音（异步，尽早触发以便识别时已缓存）
    preloadArticlePinyins(currentArticle.content);

    // 渲染文章
    renderArticle(currentArticle.content);

    // 重置状态
    resetReading();

    // 显示进度条
    document.getElementById('progressContainer').classList.remove('hidden');

    // 启用开始按钮
    document.getElementById('startBtn').disabled = false;
}

// 渲染文章（添加点击提示功能）
function renderArticle(content) {
    const container = document.getElementById('articleContent');
    charElements = [];

    let html = '';
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const isPunct = /[，。！？、；：""''（）【】「」『』〈〉《》…—～·\s\r\n"'`!?,.:;()\[\]{}\-]/.test(char);

        if (char === '\n') {
            html += '<br>';
        } else {
            // 添加点击事件用于朗读和提示
            html += `<span class="char ${isPunct ? 'punct' : ''}"
                data-index="${i}"
                data-char="${char}"
                onclick="onCharClick(${i}, '${char}')"
                title="点击听读音 🔊">${char}</span>`;
        }
    }

    container.innerHTML = html;

    // 保存字符元素引用（不包括标点）
    charElements = Array.from(container.querySelectorAll('.char:not(.punct)'));

    // 更新进度
    updateProgress();
}

// 字符点击处理 - 优化版：任何时候点击都可以朗读
function onCharClick(index, char) {
    // 播放发音（任何时候点击都可以听发音）
    speakChar(char);

    // 添加点击视觉反馈
    const charEl = document.querySelector(`.char[data-index="${index}"]`);
    if (charEl) {
        charEl.classList.add('clicked');
        setTimeout(() => charEl.classList.remove('clicked'), 300);
    }

    // 只有在阅读模式下才处理提示逻辑
    if (isReading) {
        // 只有当前字或附近的字可以点击查看提示
        if (readingConfig.hintMode && Math.abs(index - currentIndex) <= 2) {
            showCharHint(index);
        }
    } else {
        // 非阅读模式下，显示简单的拼音提示
        showSimplePinyinHint(char);
    }
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
    currentCharRetries = 0;

    // 更新UI
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    document.getElementById('skipBtn').classList.remove('hidden');
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
    currentCharRetries = 0;

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
    document.getElementById('skipBtn').classList.add('hidden');
    document.getElementById('statusIndicator').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('saveBtn').classList.add('hidden');

    updateStats();
    updateProgress();
}

// 处理语音识别结果 - 改进版（儿童容错）
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
    const statusText = document.getElementById('statusText');
    if (statusText && isReading) {
        statusText.textContent = '🎤 识别中: ' + text.slice(-15);
    }
}

// 处理识别结果：遍历所有候选文本，取第一个有进展的
function processRecognizedTextAdvanced(alternatives) {
    if (!currentArticle || currentIndex >= charElements.length) return;

    const punct = /[，。！？、；：""''（）【】「」『』〈〉《》…—～·\s\r\n"'`!?,.:;()\[\]{}\-]/g;

    for (const text of alternatives) {
        const cleanText = text.replace(punct, '');
        if (!cleanText.length) continue;

        const advanced = tryMatchText(cleanText);
        if (advanced) {
            currentCharRetries = 0;
            return;
        }
    }

    // 所有候选都没有进展，计重试
    currentCharRetries++;
    if (currentCharRetries >= readingConfig.maxRetries) {
        updateStatus('error', '🤔 没听清，请点击字看提示或按跳过');
        currentCharRetries = 0;
    }
}

// 贪婪前向匹配：带多步前瞻纠偏，始终向前推进，不因单字失败而中断
function tryMatchText(text) {
    const startIndex = currentIndex;
    let ri = 0; // 识别文本游标

    while (ri < text.length && currentIndex < charElements.length) {
        const expectedChar = charElements[currentIndex]?.dataset?.char;
        if (!expectedChar) break;

        const recognizedChar = text[ri];
        const matchResult = checkMatchAdvanced(expectedChar, recognizedChar);

        if (matchResult.isMatch) {
            // 匹配成功
            markCorrect(currentIndex);
            if (!matchResult.exact) {
                addToMistakeBook(expectedChar, recognizedChar + (matchResult.reason ? `(${matchResult.reason})` : ''));
            }
            currentIndex++;
            ri++;
        } else {
            // 前瞻1：识别文本多了噪音字（跳过最多3个识别字，期待字不变）
            let noiseSkip = 0;
            for (let skip = 1; skip <= 3 && ri + skip < text.length; skip++) {
                if (checkMatchAdvanced(expectedChar, text[ri + skip]).isMatch) {
                    noiseSkip = skip;
                    break;
                }
            }
            if (noiseSkip > 0) {
                ri += noiseSkip; // 跳过噪音字，下次循环重新匹配
                continue;
            }

            // 前瞻2：孩子漏读了字（跳过最多2个期待字，识别字不变）
            let missedCount = 0;
            for (let skip = 1; skip <= 2 && currentIndex + skip < charElements.length; skip++) {
                const nextExpEl = charElements[currentIndex + skip];
                if (nextExpEl && checkMatchAdvanced(nextExpEl.dataset.char, recognizedChar).isMatch) {
                    missedCount = skip;
                    break;
                }
            }
            if (missedCount > 0) {
                for (let s = 0; s < missedCount; s++) {
                    markWrong(currentIndex, '—'); // 漏读
                    currentIndex++;
                }
                continue; // 下次循环用同一个识别字匹配下一个期待字
            }

            // 真正读错：标记错误，两边同时推进
            markWrong(currentIndex, recognizedChar);
            currentIndex++;
            ri++;
        }

        if (currentIndex >= charElements.length) {
            finishReading();
            return true;
        }
    }

    const advanced = currentIndex - startIndex;
    if (advanced > 0) {
        highlightCurrent();
        updateProgress();
        return true;
    }
    return false;
}

// 去掉 Unicode 声调符号，用于同音字比对
function stripTones(pinyin) {
    return pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// 获取某个字的已缓存拼音（同步，优先 pinyinCache，其次 localPinyinDict）
function getCachedPinyin(char) {
    return pinyinCache[char] || localPinyinDict[char] || null;
}

// 高级匹配检查 - 多种策略
function checkMatchAdvanced(expected, recognized) {
    // 1. 完全匹配
    if (expected === recognized) {
        return { isMatch: true, confident: true, exact: true };
    }

    // 2. 拼音匹配（同音 / 近音）- 算正确但记录到错字本
    //    同时查 pinyinCache（服务端预取）和 localPinyinDict（本地内置）
    const expectedPinyin = getCachedPinyin(expected);
    const recognizedPinyin = getCachedPinyin(recognized);

    if (expectedPinyin && recognizedPinyin) {
        // 去除 Unicode 声调后比较（字典用 ā é ī 等 Unicode 音调符号）
        const expBase = stripTones(expectedPinyin);
        const recBase = stripTones(recognizedPinyin);

        if (expBase === recBase) {
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

    // 5. 如果两个字都不在任何字典中，可能是特殊字符，保守处理
    if (!expectedPinyin && !recognizedPinyin) {
        return { isMatch: false, confident: false };
    }

    return { isMatch: false, confident: true };
}

// 模糊拼音匹配（儿童常见混淆）
function isSimilarPinyin(p1, p2) {
    if (p1 === p2) return true;

    // 标准化：去掉声调（调用前已处理，这里再次保证）
    const a = p1.toLowerCase();
    const b = p2.toLowerCase();
    if (a === b) return true;

    // 前后鼻音容错 (in/ing, en/eng, an/ang, uan/uang)
    const nasalPairs = [
        ['in', 'ing'], ['en', 'eng'], ['an', 'ang'], ['un', 'ong'],
        ['uan', 'uang'], ['ian', 'iang']
    ];
    for (const [x, y] of nasalPairs) {
        const swap = (s, from, to) => s.endsWith(from) ? s.slice(0, -from.length) + to : null;
        const a2 = swap(a, x, y) || swap(a, y, x);
        if (a2 && a2 === b) return true;
    }

    // 平翘舌容错 (z/zh, c/ch, s/sh)
    const shPairs = [['z', 'zh'], ['c', 'ch'], ['s', 'sh']];
    for (const [flat, curl] of shPairs) {
        const normalize = s => s.startsWith(curl) ? flat + s.slice(curl.length)
                              : s.startsWith(flat) && !s.startsWith(curl) ? curl + s.slice(flat.length) : null;
        const a2 = normalize(a);
        if (a2 && a2 === b) return true;
        const b2 = normalize(b);
        if (b2 && b2 === a) return true;
    }

    // n/l 容错
    if (a[0] !== b[0] && ((a[0] === 'n' && b[0] === 'l') || (a[0] === 'l' && b[0] === 'n'))) {
        if (a.slice(1) === b.slice(1)) return true;
    }

    // j/zh, q/ch, x/sh 容错（儿童常见混淆）
    const jqxPairs = [['j', 'zh'], ['q', 'ch'], ['x', 'sh']];
    for (const [jqx, zhcsh] of jqxPairs) {
        if (a.startsWith(jqx) && b.startsWith(zhcsh) && a.slice(jqx.length) === b.slice(zhcsh.length)) return true;
        if (b.startsWith(jqx) && a.startsWith(zhcsh) && b.slice(jqx.length) === a.slice(zhcsh.length)) return true;
    }

    // f/h 容错（南方口音）
    if (a[0] !== b[0] && ((a[0] === 'f' && b[0] === 'h') || (a[0] === 'h' && b[0] === 'f'))) {
        if (a.slice(1) === b.slice(1)) return true;
    }

    // r/l 容错
    if (a[0] !== b[0] && ((a[0] === 'r' && b[0] === 'l') || (a[0] === 'l' && b[0] === 'r'))) {
        if (a.slice(1) === b.slice(1)) return true;
    }

    // 韵母简化容错：üe/ue/e, ia/a, ua/a
    const vowelPairs = [['ue', 'e'], ['ia', 'a'], ['ua', 'a'], ['uo', 'o']];
    for (const [full, short] of vowelPairs) {
        const toShort = s => s.includes(full) ? s.replace(full, short) : null;
        const a2 = toShort(a);
        if (a2 && a2 === b) return true;
        const b2 = toShort(b);
        if (b2 && b2 === a) return true;
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
        pinyin: localPinyinDict[expected] || ''
    });

    // 添加到错字本
    console.log('>>> 调用 addToMistakeBook:', expected, recognized);
    addToMistakeBook(expected, recognized || '未识别');

    updateStats();
}

// 添加到错字本（优先使用API，回退到localStorage）
function addToMistakeBook(char, recognized) {
    console.log('>>> addToMistakeBook 被调用:', char, recognized);

    // 清理输入字符
    const cleanChar = char ? String(char).trim() : '';
    if (!cleanChar || cleanChar === '') {
        console.log('>>> 跳过空字符');
        return;
    }

    // 只保留第一个字符
    const firstChar = cleanChar.charAt(0);
    console.log('>>> 处理字符:', firstChar);

    // 获取当前小朋友ID
    const kidId = localStorage.getItem('currentKidId');
    
    // 准备错字数据
    const mistakeData = {
        char: firstChar,
        pinyin: localPinyinDict[firstChar] || '',
        recognized: recognized || '未识别',
        source: currentArticle ? currentArticle.title : '未知'
    };

    // 优先尝试使用API保存
    if (kidId) {
        saveMistakeToAPI(kidId, mistakeData);
    } else {
        // 没有小朋友ID，保存到localStorage
        saveMistakeToLocalStorage(mistakeData);
    }
}

// 通过API保存错字
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
        if (result.success) {
            console.log('>>> 错字已通过API保存:', result.data);
        } else {
            console.error('>>> API保存失败，回退到localStorage:', result.message);
            saveMistakeToLocalStorage(mistakeData);
        }
    } catch (error) {
        console.error('>>> API请求失败，回退到localStorage:', error);
        saveMistakeToLocalStorage(mistakeData);
    }
}

// 保存到localStorage（回退方案）
function saveMistakeToLocalStorage(mistakeData) {
    try {
        const key = 'mistakeBook';
        let existing = localStorage.getItem(key);
        const mistakes = existing ? JSON.parse(existing) : [];
        
        const found = mistakes.find(m => m.char === mistakeData.char);

        if (found) {
            found.count = (found.count || 0) + 1;
            found.recognized = mistakeData.recognized;
            found.lastWrong = new Date().toISOString();
            if (found.status === 'mastered') {
                found.status = 'practicing';
            }
            console.log('>>> 更新错字（localStorage）:', mistakeData.char, '次数:', found.count);
        } else {
            const newMistake = {
                char: mistakeData.char,
                pinyin: mistakeData.pinyin,
                recognized: mistakeData.recognized,
                source: mistakeData.source,
                count: 1,
                reviewCount: 0,
                status: 'new',
                createdAt: new Date().toISOString(),
                lastWrong: new Date().toISOString()
            };
            mistakes.push(newMistake);
            console.log('>>> 新增错字（localStorage）:', mistakeData.char);
        }

        localStorage.setItem(key, JSON.stringify(mistakes));
        console.log('>>> 错字本已保存到localStorage');
    } catch (error) {
        console.error('>>> 保存错字失败:', error);
    }
}

// 优化后的发音函数（中文+好听+适合儿童）
function speakChar(char) {
    if (!char) return;

    // 取消之前的发音
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(char);
    
    // 儿童优化配置
    utterance.lang = 'zh-CN';
    utterance.rate = 0.75; // 更慢的语速，适合儿童跟读
    utterance.pitch = 1.15; // 稍微提高音调，更亲切
    utterance.volume = 1.0; // 最大音量

    // 等待语音列表加载并选择最佳中文语音
    const selectVoice = () => {
        const voices = speechSynthesis.getVoices();
        
        // 语音选择优先级（全程排除 zh-HK / zh-TW 粤语/繁中）：
        // 1. Google 普通话女声
        // 2. Microsoft 普通话女声
        // 3. 任何 zh-CN 女声
        // 4. 任何 zh-CN 语音
        // 5. 非粤语/繁中的中文语音
        let selectedVoice = null;

        // 优先选择 Google 普通话女声
        selectedVoice = voices.find(v =>
            v.name.includes('Google') && v.lang.startsWith('zh-CN') && v.name.includes('女')
        );

        // 其次 Microsoft 普通话女声
        if (!selectedVoice) {
            selectedVoice = voices.find(v =>
                v.name.includes('Microsoft') && v.lang.startsWith('zh-CN') &&
                (v.name.includes('女') || v.name.includes('Yaoyao') || v.name.includes('Huihui') || v.name.includes('Xiaoxiao'))
            );
        }

        // 然后任何 zh-CN 女声
        if (!selectedVoice) {
            selectedVoice = voices.find(v =>
                v.lang.startsWith('zh-CN') && (v.name.includes('女') || v.gender === 'female')
            );
        }

        // 再次任何 zh-CN 语音
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('zh-CN'));
        }

        // 兜底：任何中文语音，但排除粤语（zh-HK）和繁中（zh-TW）
        if (!selectedVoice) {
            selectedVoice = voices.find(v =>
                v.lang.startsWith('zh') && !v.lang.startsWith('zh-HK') && !v.lang.startsWith('zh-TW')
            );
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log('选择语音:', selectedVoice.name);
        }
    };

    // 如果语音列表已加载，直接选择
    if (speechSynthesis.getVoices().length > 0) {
        selectVoice();
    } else {
        // 等待语音列表加载
        speechSynthesis.addEventListener('voiceschanged', selectVoice, { once: true });
    }

    // 添加事件监听
    utterance.onstart = () => {
        console.log('开始发音:', char);
    };
    
    utterance.onerror = (e) => {
        console.error('发音错误:', e);
        // 错误时尝试用默认设置重试
        setTimeout(() => {
            const retry = new SpeechSynthesisUtterance(char);
            retry.lang = 'zh-CN';
            retry.rate = 0.8;
            speechSynthesis.speak(retry);
        }, 100);
    };

    // 确保语音已准备好再播放
    setTimeout(() => {
        speechSynthesis.speak(utterance);
    }, 50);
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
        
        // 提示模式下，如果重试多次，自动显示提示
        if (readingConfig.hintMode && currentCharRetries >= 2) {
            showCharHint(currentIndex);
        }
    }
}

// 显示拼音弹窗
function showPinyinPopup(char) {
    const pinyin = localPinyinDict[char];
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
    document.getElementById('skipBtn').classList.add('hidden');
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

    // 自动重启识别（更长的延迟给儿童）
    if (isReading && !isPaused) {
        setTimeout(() => {
            try {
                recognition.start();
            } catch (e) {
                console.log('Auto restart failed:', e);
            }
        }, readingConfig.slowMode ? 2000 : 1000);
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
        }, readingConfig.slowMode ? 1000 : 500);
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
async function addCustomArticle() {
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

    try {
        const response = await fetch(`${API_BASE}/articles/custom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author: author || undefined, content, level })
        });
        const data = await response.json();
        if (!data.success) {
            alert('添加失败：' + data.message);
            return;
        }
    } catch (e) {
        alert('添加失败，请检查网络连接');
        return;
    }

    // 重新加载文章列表
    await loadAllArticles();

    // 关闭模态框
    closeAddArticleModal();

    alert('文章添加成功！');
}

// 导出函数供HTML调用
window.onCharClick = onCharClick;
window.skipCurrentChar = skipCurrentChar;
