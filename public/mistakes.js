// 错字本模块

// API 基础URL - 根据当前路径自动检测
const pathParts = window.location.pathname.split('/');
const appIndex = pathParts.indexOf('app');
const BASE_PATH = appIndex >= 0 ? '/' + pathParts.slice(1, appIndex + 2).join('/') : '';
const API_BASE = BASE_PATH + '/api';

// 拼音缓存
let pinyinCache = {};
const PINYIN_CACHE_KEY = 'pinyin_cache';

// 本地拼音字典（作为回退）
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
    '都': 'dōu', '就': 'jiù', '可': 'kě', '也': 'yě', '能': 'néng', '对': 'duì',
    '着': 'zhe', '过': 'guò', '给': 'gěi', '但': 'dàn', '还': 'hái', '自': 'zì',
    '让': 'ràng', '从': 'cóng', '才': 'cái', '用': 'yòng', '想': 'xiǎng', '只': 'zhǐ',
    '最': 'zuì', '再': 'zài', '现': 'xiàn', '比': 'bǐ', '没': 'méi',
    '被': 'bèi', '已': 'yǐ', '真': 'zhēn', '新': 'xīn', '年': 'nián', '得': 'dé',
    '出': 'chū', '起': 'qǐ', '会': 'huì', '后': 'hòu', '作': 'zuò', '里': 'lǐ',
    '家': 'jiā', '心': 'xīn', '面': 'miàn', '打': 'dǎ', '长': 'zhǎng', '方': 'fāng',
    '成': 'chéng', '什': 'shén', '么': 'me', '名': 'míng', '同': 'tóng', '五': 'wǔ',
    '六': 'liù', '七': 'qī', '八': 'bā', '十': 'shí', '你': 'nǐ',
    '他': 'tā', '她': 'tā', '它': 'tā', '吧': 'ba', '吗': 'ma', '呢': 'ne', '啊': 'a'
};

// 初始化拼音缓存
function initPinyinCache() {
    try {
        const cached = localStorage.getItem(PINYIN_CACHE_KEY);
        if (cached) {
            pinyinCache = JSON.parse(cached);
            console.log('错字本: 拼音缓存已加载:', Object.keys(pinyinCache).length, '个字');
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

    // 4. 尝试使用在线API
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

// 从网络API获取拼音（备用方案，优先使用本地字典）
async function fetchPinyinFromAPI(char) {
    // 优先使用本地字典
    const commonPinyin = getCommonPinyin(char);
    if (commonPinyin) {
        return commonPinyin;
    }

    // 本地没有，尝试网络API（带超时）
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`https://v.api.aa1.cn/api/api-pinyin/pinyin.php?msg=${encodeURIComponent(char)}&type=text`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const text = await response.text();
            const pinyin = text.trim().replace(/[\d\s]/g, '');
            if (pinyin && pinyin.length > 0 && /^[a-zA-Z]+$/.test(pinyin)) {
                return pinyin;
            }
        }
    } catch (e) {
        console.log('在线拼音API失败');
    }

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
        '爸': 'bà', '妈': 'mā', '哥': 'gē', '姐': 'jiě', '弟': 'dì',
        '妹': 'mèi', '爷': 'yé', '奶': 'nǎi', '老': 'lǎo', '师': 'shī',
        '学': 'xué', '友': 'yǒu', '朋': 'péng', '高': 'gāo', '兴': 'xìng',
        '快': 'kuài', '乐': 'lè', '爱': 'ài', '喜': 'xǐ', '欢': 'huan',
        '笑': 'xiào', '东': 'dōng', '西': 'xī', '南': 'nán', '北': 'běi',
        '左': 'zuǒ', '右': 'yòu', '早': 'zǎo', '晚': 'wǎn', '春': 'chūn',
        '夏': 'xià', '秋': 'qiū', '冬': 'dōng', '头': 'tóu', '手': 'shǒu',
        '足': 'zú', '耳': 'ěr', '目': 'mù', '口': 'kǒu', '牙': 'yá',
        '舌': 'shé', '书': 'shū', '本': 'běn', '笔': 'bǐ', '纸': 'zhǐ',
        '桌': 'zhuō', '椅': 'yǐ', '门': 'mén', '窗': 'chuāng', '床': 'chuáng',
        '灯': 'dēng', '衣': 'yī', '服': 'fú', '裤': 'kù', '鞋': 'xié',
        '帽': 'mào', '袜': 'wà', '裙': 'qún', '猫': 'māo', '狗': 'gǒu',
        '鸡': 'jī', '鸭': 'yā', '鱼': 'yú', '马': 'mǎ', '牛': 'niú',
        '羊': 'yáng', '猪': 'zhū', '兔': 'tù', '鸟': 'niǎo', '猴': 'hóu',
        '虎': 'hǔ', '狼': 'láng', '象': 'xiàng', '熊': 'xióng', '鹿': 'lù',
        '龟': 'guī', '开': 'kāi', '关': 'guān', '进': 'jìn', '出': 'chū',
        '坐': 'zuò', '站': 'zhàn', '立': 'lì', '睡': 'shuì', '醒': 'xǐng',
        '玩': 'wán', '问': 'wèn', '答': 'dá', '告': 'gào', '诉': 'sù',
        '讲': 'jiǎng', '记': 'jì', '忘': 'wàng', '念': 'niàn', '读': 'dú',
        '写': 'xiě', '画': 'huà', '唱': 'chàng', '跳': 'tiào', '飞': 'fēi',
        '游': 'yóu', '红': 'hóng', '黄': 'huáng', '蓝': 'lán', '绿': 'lǜ',
        '白': 'bái', '黑': 'hēi', '紫': 'zǐ', '青': 'qīng'
    };

    return commonDict[char] || null;
}

// 批量获取拼音
async function batchGetPinyin(chars) {
    const results = {};
    const promises = chars.map(async char => {
        const pinyin = await getPinyin(char);
        results[char] = pinyin;
    });
    await Promise.all(promises);
    return results;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initPinyinCache();
    loadMistakes();
    updateStats();
    initTargetCharSelect();

    // 页面重新可见时刷新（从阅读页面返回时）
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadMistakes();
            updateStats();
            initTargetCharSelect();
        }
    });
});

// 获取当前小朋友ID
function getCurrentKidId() {
    return localStorage.getItem('currentKidId');
}

// 获取错字本数据（优先API，回退localStorage）
async function getMistakes() {
    const kidId = getCurrentKidId();
    
    // 优先尝试从API获取
    if (kidId) {
        try {
            const response = await fetch(`${API_BASE}/mistakes/${kidId}`);
            const data = await response.json();
            if (data.success) {
                console.log('从API获取错字本:', data.data.length, '个字');
                // 同时更新本地缓存
                localStorage.setItem('mistakeBook', JSON.stringify(data.data));
                return data.data;
            }
        } catch (error) {
            console.error('API获取错字本失败，使用localStorage:', error);
        }
    }
    
    // 回退到localStorage
    try {
        const data = localStorage.getItem('mistakeBook');
        console.log('从localStorage获取错字本:', data);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('读取错字本失败:', error);
        return [];
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

// 增加复习次数（API优先）
async function incrementReviewCount(char) {
    const mistakes = await getMistakes();
    const mistake = mistakes.find(m => m.char === char);

    if (mistake) {
        // 更新本地数据
        mistake.reviewCount = (mistake.reviewCount || 0) + 1;
        mistake.lastReviewed = new Date().toISOString();
        
        // 如果有API ID，更新到服务器
        if (mistake.id) {
            try {
                await fetch(`${API_BASE}/mistakes/${mistake.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        review_count: mistake.reviewCount,
                        status: mistake.status
                    })
                });
            } catch (e) {
                console.error('API更新复习次数失败:', e);
            }
        }
        
        // 保存到localStorage（作为缓存和回退）
        localStorage.setItem('mistakeBook', JSON.stringify(mistakes));
        console.log('更新复习次数:', char, '第', mistake.reviewCount, '次');
    }
}

// 保存错字本数据到localStorage
function saveMistakes(mistakes) {
    try {
        localStorage.setItem('mistakeBook', JSON.stringify(mistakes));
        console.log('saveMistakes 保存成功:', mistakes.length, '个字');
    } catch (error) {
        console.error('保存错字本失败:', error);
        alert('保存失败，可能是存储空间已满');
    }
}

// 加载并显示错字列表
async function loadMistakes() {
    const mistakes = await getMistakes();
    console.log('加载错字本, 共', mistakes.length, '个字:', mistakes);

    const container = document.getElementById('mistakeList');
    if (!container) {
        console.error('找不到 mistakeList 元素');
        return;
    }

    if (mistakes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎉</div>
                <p>太棒了！还没有错字</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">去阅读页面朗读文章吧</p>
            </div>
        `;
        return;
    }

    // 预加载所有拼音
    const chars = mistakes.map(m => m.char);
    await batchGetPinyin(chars);

    // 按状态分组排序
    const sorted = mistakes.sort((a, b) => {
        const statusOrder = { 'new': 0, 'practicing': 1, 'mastered': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    container.innerHTML = sorted.map(m => {
        const pinyin = m.pinyin || pinyinCache[m.char] || localPinyinDict[m.char] || '未知拼音';
        return `
        <div class="mistake-item" data-char="${m.char}">
            <div class="mistake-char" style="cursor: pointer; position: relative;" onclick="showCharVisual('${m.char}')" title="点击查看图形">
                ${m.char}
                <button class="btn-speak" onclick="event.stopPropagation(); speakChar('${m.char}')" title="点击发音">🔊</button>
            </div>
            <div class="mistake-info">
                <div class="mistake-pinyin">${pinyin}</div>
                <div class="mistake-source">
                    来自《${m.source || '未知'}》· 读错 ${m.count} 次
                    ${m.recognized && m.recognized !== '未识别' && m.recognized !== m.char ? ` · 读成"${m.recognized}"` : ''}
                    ${m.reviewCount ? ` · 已复习 ${m.reviewCount} 次` : ''}
                </div>
            </div>
            <span class="tag tag-${m.status}">${getStatusText(m.status)}</span>
            <div class="mistake-actions">
                <button class="btn-speak-action" onclick="speakChar('${m.char}')">🔊 发音</button>
                <button class="btn-visual" onclick="showCharVisual('${m.char}')">🎨 图形</button>
                <button class="btn-practice" onclick="practiceChar('${m.char}')">练习</button>
                ${m.status !== 'mastered' ? `<button class="btn-mastered" onclick="markMastered('${m.char}')">掌握</button>` : ''}
            </div>
        </div>
    `}).join('');
}

// 获取状态文本
function getStatusText(status) {
    const map = { 'new': '新错字', 'practicing': '练习中', 'mastered': '已掌握' };
    return map[status] || status;
}

// 更新统计
async function updateStats() {
    const mistakes = await getMistakes();
    document.getElementById('totalMistakes').textContent = mistakes.length;
    document.getElementById('newMistakes').textContent = mistakes.filter(m => m.status === 'new').length;
    document.getElementById('practicing').textContent = mistakes.filter(m => m.status === 'practicing').length;
    document.getElementById('masteredCount').textContent = mistakes.filter(m => m.status === 'mastered').length;

    // 显示NEW标签
    const hasNew = mistakes.some(m => m.status === 'new');
    const newBadge = document.getElementById('newBadge');
    if (newBadge) {
        newBadge.style.display = hasNew ? 'inline-block' : 'none';
    }
}

// 刷新错字本
async function refreshMistakes() {
    console.log('手动刷新错字本');
    await loadMistakes();
    await updateStats();
    initTargetCharSelect();
    alert('错字本已刷新');
}

// 清空所有错字（API优先）
async function clearAllMistakes() {
    if (!confirm('确定要清空所有错字吗？此操作无法撤销！')) return;

    const kidId = getCurrentKidId();
    
    if (kidId) {
        // 从API删除
        try {
            const mistakes = await getMistakes();
            const deletePromises = mistakes.map(m => {
                if (m.id) {
                    return fetch(`${API_BASE}/mistakes/${m.id}`, { method: 'DELETE' });
                }
                return Promise.resolve();
            });
            await Promise.all(deletePromises);
        } catch (e) {
            console.error('API清空失败:', e);
        }
    }
    
    // 清空localStorage
    try {
        localStorage.removeItem('mistakeBook');
        console.log('错字本已清空');
        await loadMistakes();
        await updateStats();
        initTargetCharSelect();
        alert('错字本已清空');
    } catch (error) {
        console.error('清空错字本失败:', error);
        alert('清空失败');
    }
}

// 初始化目标字选择器
async function initTargetCharSelect() {
    const select = document.getElementById('targetChar');
    if (!select) return;
    
    const mistakes = await getMistakes();
    const practicing = mistakes.filter(m => m.status !== 'mastered');

    select.innerHTML = '<option value="">-- 选择错字 --</option>' +
        practicing.map(m => {
            const pinyin = m.pinyin || pinyinCache[m.char] || localPinyinDict[m.char] || '未知';
            return `<option value="${m.char}">${m.char} (${pinyin})</option>`;
        }).join('');
}

// 添加错字（从阅读页面调用，API优先）
async function addMistake(char, recognized, source) {
    const kidId = getCurrentKidId();
    const mistakes = await getMistakes();
    
    const existing = mistakes.find(m => m.char === char);
    const pinyin = await getPinyin(char);

    if (existing) {
        existing.count++;
        existing.recognized = recognized;
        existing.lastWrong = new Date().toISOString();
        if (existing.status === 'mastered') {
            existing.status = 'practicing';
        }
        
        // 更新到API
        if (kidId && existing.id) {
            try {
                await fetch(`${API_BASE}/mistakes/${existing.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        count: existing.count,
                        recognized: existing.recognized,
                        status: existing.status
                    })
                });
            } catch (e) {
                console.error('API更新错字失败:', e);
            }
        }
    } else {
        const newMistake = {
            char: char,
            pinyin: pinyin,
            recognized: recognized,
            source: source,
            count: 1,
            status: 'new',
            createdAt: new Date().toISOString(),
            lastWrong: new Date().toISOString()
        };
        
        // 添加到API
        if (kidId) {
            try {
                const response = await fetch(`${API_BASE}/mistakes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        kid_id: parseInt(kidId),
                        char: char,
                        pinyin: pinyin,
                        recognized: recognized,
                        source: source
                    })
                });
                const result = await response.json();
                if (result.success) {
                    newMistake.id = result.data.id;
                }
            } catch (e) {
                console.error('API添加错字失败:', e);
            }
        }
        
        mistakes.push(newMistake);
    }

    saveMistakes(mistakes);
}

// 标记为已掌握（API优先）
async function markMastered(char) {
    const mistakes = await getMistakes();
    const mistake = mistakes.find(m => m.char === char);
    
    if (mistake) {
        mistake.status = 'mastered';
        mistake.masteredAt = new Date().toISOString();
        
        // 更新到API
        if (mistake.id) {
            try {
                await fetch(`${API_BASE}/mistakes/${mistake.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'mastered' })
                });
            } catch (e) {
                console.error('API标记掌握失败:', e);
            }
        }
        
        saveMistakes(mistakes);
        await loadMistakes();
        await updateStats();
        initTargetCharSelect();
    }
}

// 练习单个字
async function practiceChar(char) {
    const pinyin = await getPinyin(char);
    document.getElementById('practiceArea').classList.add('active');
    document.getElementById('practiceTitle').textContent = `练习：${char}`;

    // 获取复习次数
    const mistakes = await getMistakes();
    const mistake = mistakes.find(m => m.char === char);
    const reviewCount = mistake ? (mistake.reviewCount || 0) : 0;

    document.getElementById('practiceQuestion').innerHTML = `
        <div style="font-size: 6rem; cursor: pointer;" onclick="speakChar('${char}')" title="点击发音">${char}</div>
        <div style="font-size: 1.5rem; color: #667eea; margin-top: 10px;">拼音：${pinyin}</div>
        <div style="font-size: 0.9rem; color: #888; margin-top: 5px;">
            ${reviewCount > 0 ? `已复习 ${reviewCount} 次` : '首次复习'}
            <button onclick="speakChar('${char}')" style="margin-left: 10px; padding: 4px 10px; background: #ff6b6b; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 0.8rem;">🔊 听发音</button>
        </div>
    `;
    document.getElementById('practiceOptions').innerHTML = '';
    document.getElementById('practiceResult').innerHTML = '';

    // 生成干扰选项
    const options = generatePinyinOptions(pinyin);
    document.getElementById('practiceOptions').innerHTML = options.map(opt => `
        <button class="practice-option" onclick="checkPinyinAnswer('${char}', '${opt}', '${pinyin}', this)">
            ${opt}
        </button>
    `).join('');

    // 增加复习次数并更新状态
    if (mistake) {
        await incrementReviewCount(char);

        // 更新状态为练习中
        if (mistake.status === 'new') {
            mistake.status = 'practicing';
            saveMistakes(mistakes);
            await loadMistakes();
            await updateStats();
        }
    }

    // 自动播放发音
    setTimeout(() => speakChar(char), 300);
}

// 生成拼音选项（包含正确答案和干扰项）
function generatePinyinOptions(correctPinyin) {
    if (!correctPinyin) return ['未知'];

    const allPinyins = Object.values(localPinyinDict).filter(p => p);
    const wrongOptions = [];

    // 找相似拼音
    for (const p of allPinyins) {
        if (p !== correctPinyin && isSimilarPinyin(p, correctPinyin)) {
            wrongOptions.push(p);
        }
        if (wrongOptions.length >= 3) break;
    }

    // 如果不够，随机补充
    while (wrongOptions.length < 3) {
        const random = allPinyins[Math.floor(Math.random() * allPinyins.length)];
        if (random !== correctPinyin && !wrongOptions.includes(random)) {
            wrongOptions.push(random);
        }
    }

    // 打乱顺序
    return [correctPinyin, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5);
}

// 检查拼音相似度
function isSimilarPinyin(p1, p2) {
    if (Math.abs(p1.length - p2.length) > 2) return false;
    // 简单判断：首字母相同
    return p1[0] === p2[0];
}

// 检查拼音答案
async function checkPinyinAnswer(char, selected, correct, btn) {
    const isCorrect = selected === correct;
    btn.classList.add(isCorrect ? 'correct' : 'wrong');

    document.getElementById('practiceResult').innerHTML = isCorrect
        ? '<div style="color: #4CAF50; font-size: 1.2rem;">✅ 回答正确！</div>'
        : `<div style="color: #f44336; font-size: 1.2rem;">❌ 正确答案是：${correct}</div>`;

    // 如果答对了，播放发音
    if (isCorrect) {
        speakChar(char);
    }

    // 延迟后下一题
    setTimeout(() => {
        practiceChar(char);
    }, 2000);
}

// 关闭练习
function closePractice() {
    document.getElementById('practiceArea').classList.remove('active');
}

// 开始错字练习
async function startMistakePractice() {
    const mistakes = await getMistakes();
    const practicing = mistakes.filter(m => m.status !== 'mastered');
    
    if (practicing.length === 0) {
        alert('没有错字需要练习！');
        return;
    }

    // 随机选一个
    const random = practicing[Math.floor(Math.random() * practicing.length)];
    practiceChar(random.char);
}

// 开始拼音练习
async function startPinyinPractice() {
    const mistakes = await getMistakes();
    const practicing = mistakes.filter(m => m.status !== 'mastered');
    
    if (practicing.length === 0) {
        alert('没有错字需要练习！');
        return;
    }

    document.getElementById('practiceArea').classList.add('active');
    document.getElementById('practiceTitle').textContent = '看拼音选汉字';

    // 随机选4个字
    const shuffled = practicing.sort(() => Math.random() - 0.5).slice(0, 4);
    const correct = shuffled[0];

    // 增加复习次数
    await incrementReviewCount(correct.char);

    const pinyin = correct.pinyin || pinyinCache[correct.char] || localPinyinDict[correct.char] || '?';

    document.getElementById('practiceQuestion').innerHTML = `
        <div style="font-size: 2rem; color: #667eea;">${pinyin}</div>
        <div style="font-size: 1rem; color: #888; margin-top: 10px;">选择对应的汉字</div>
        <button onclick="speakChar('${correct.char}')" style="margin-top: 10px; padding: 8px 16px; background: #ff6b6b; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 0.9rem;">🔊 听提示</button>
    `;

    document.getElementById('practiceOptions').innerHTML = shuffled.map(m => `
        <button class="practice-option" style="font-size: 3rem;" onclick="checkCharAnswer('${correct.char}', '${m.char}', this)">
            ${m.char}
        </button>
    `).join('');

    document.getElementById('practiceResult').innerHTML = '';
}

// 检查汉字答案
function checkCharAnswer(correct, selected, btn) {
    const isCorrect = correct === selected;
    btn.classList.add(isCorrect ? 'correct' : 'wrong');

    document.getElementById('practiceResult').innerHTML = isCorrect
        ? '<div style="color: #4CAF50; font-size: 1.2rem;">✅ 回答正确！</div>'
        : '<div style="color: #f44336; font-size: 1.2rem;">❌ 再想想看</div>';

    // 如果答对了，播放发音
    if (isCorrect) {
        speakChar(correct);
    }

    setTimeout(() => {
        startPinyinPractice();
    }, 2000);
}

// AI生成文章
async function generateAIArticle() {
    const targetChar = document.getElementById('targetChar').value;
    const theme = document.getElementById('articleTheme').value;
    const length = document.getElementById('articleLength').value;

    if (!targetChar) {
        alert('请选择一个要练习的字');
        return;
    }

    const btn = document.querySelector('.ai-options .btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> 生成中...';
    btn.disabled = true;

    try {
        const article = await generateArticleWithAI(targetChar, theme, length);
        displayGeneratedArticle(article, targetChar);
    } catch (error) {
        console.error('生成失败:', error);
        // 使用备用生成方案
        const fallbackArticle = generateFallbackArticle(targetChar, theme, length);
        displayGeneratedArticle(fallbackArticle, targetChar);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// 调用AI生成文章（使用kimi-code API，内容更自由灵活）
async function generateArticleWithAI(targetChar, theme, length) {
    // API配置 - 可以从后端获取或使用默认配置
    const API_CONFIG = {
        endpoint: localStorage.getItem('kimi_api_endpoint') || 'https://api.moonshot.cn/v1/chat/completions',
        key: localStorage.getItem('kimi_api_key') || '',
        model: localStorage.getItem('kimi_model') || 'moonshot-v1-8k'
    };

    const lengthMap = { 'short': '50字左右', 'medium': '100字左右', 'long': '200字左右' };
    const targetLength = lengthMap[length] || '100字左右';

    const themePrompts = {
        '动物': '以动物为主角的温馨小故事',
        '自然': '描写大自然美景的散文',
        '家庭': '关于家庭生活的温馨故事',
        '学校': '发生在校园里的有趣故事',
        '童话': '充满想象力的童话故事',
        '科幻': '面向儿童的科幻小故事'
    };

    const prompt = `请为6岁小朋友创作一篇${themePrompts[theme] || '儿童故事'}。

要求：
1. 文章长度${targetLength}
2. 必须多次出现汉字"${targetChar}"，让小朋友能练习这个字
3. 内容要生动有趣，适合6岁儿童阅读
4. 语言简单易懂，句子不要太长
5. 要有教育意义或趣味性
6. 直接返回文章标题和正文，格式：标题：XXX\n正文：XXX`;

    try {
        // 如果有API密钥，尝试调用API
        if (API_CONFIG.key) {
            const response = await fetch(API_CONFIG.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_CONFIG.key}`
                },
                body: JSON.stringify({
                    model: API_CONFIG.model,
                    messages: [
                        { role: 'system', content: '你是一位擅长创作儿童文学的作家，专门为6岁左右的小朋友创作简单、有趣、易读的故事。' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.8,
                    max_tokens: 800
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const generatedText = data.choices?.[0]?.message?.content || '';

            // 解析返回的内容
            let title = `${targetChar}的故事`;
            let content = generatedText;

            // 尝试提取标题和正文
            const titleMatch = generatedText.match(/[标题：]+\s*([^\n]+)/);
            const contentMatch = generatedText.match(/[正文：]+\s*([\s\S]+)/);

            if (titleMatch) title = titleMatch[1].trim();
            if (contentMatch) content = contentMatch[1].trim();

            // 确保包含目标字多次
            const charCount = (content.match(new RegExp(targetChar, 'g')) || []).length;
            if (charCount < 3) {
                content += `\n\n小朋友们，今天我们学习了"${targetChar}"这个字，要记住它的写法哦！`;
            }

            return { title, content, targetChar };
        }
    } catch (error) {
        console.warn('AI API调用失败，使用备用方案:', error);
    }

    // 备用方案：使用更丰富的模板生成
    return generateEnhancedFallbackArticle(targetChar, theme, length);
}

// 增强版备用文章生成（更丰富的内容）
function generateEnhancedFallbackArticle(targetChar, theme, length) {
    const enhancedTemplates = {
        '动物': {
            titles: [`小${targetChar}的冒险`, `${targetChar}找朋友`, `聪明的小${targetChar}`],
            intros: [
                `森林里有只可爱的小${targetChar}，它有着闪闪发光的眼睛。`,
                `小${targetChar}是动物王国里最活泼的小家伙。`,
                `在一片绿色的草地上，住着一只特别的小${targetChar}。`
            ],
            plots: [
                `一天，小${targetChar}决定去找新朋友。它走啊走，遇到了小兔子。"你愿意和我一起玩吗？"小${targetChar}问道。小兔子高兴地点点头。`,
                `小${targetChar}最喜欢在森林里探险。今天，它发现了一朵神奇的花。这朵花可以实现一个愿望！小${targetChar}想了想，许了一个美好的愿望。`,
                `小${targetChar}每天都在学习新本领。它学会了跳跃，学会了奔跑，还学会了唱歌。小伙伴们都夸小${targetChar}真棒！`
            ],
            endings: [
                `从此，小${targetChar}和朋友们快乐地生活在一起。`,
                `小${targetChar}明白了，友谊是最珍贵的宝藏。`,
                `这就是小${targetChar}的故事，一个关于勇气和友情的故事。`
            ]
        },
        '自然': {
            titles: [`美丽的${targetChar}`, `${targetChar}的秘密`, `春天的${targetChar}`],
            intros: [
                `在大自然的怀抱里，${targetChar}静静地生长着。`,
                `每当太阳升起，${targetChar}就开始了新的一天。`,
                `大自然中，${targetChar}是一道美丽的风景。`
            ],
            plots: [
                `阳光洒在${targetChar}上，闪闪发光。小鸟飞过来，停在${targetChar}旁边唱歌。蝴蝶也飞来了，围着${targetChar}跳舞。`,
                `下雨了，雨滴落在${targetChar}上，发出好听的声音。${targetChar}喝饱了水，变得更加精神了。`,
                `风吹过，${targetChar}轻轻摇摆，好像在和风儿打招呼。小朋友们跑过来，围着${targetChar}开心地笑着。`
            ],
            endings: [
                `大自然真美啊，我们要爱护${targetChar}，爱护我们的家园。`,
                `这就是${targetChar}，大自然送给我们的礼物。`,
                `让我们一起保护美丽的${targetChar}吧！`
            ]
        },
        '家庭': {
            titles: [`我家的${targetChar}`, `${targetChar}的故事`, `温暖的${targetChar}`],
            intros: [
                `在我的家里，有一个特别的${targetChar}。`,
                `爸爸妈妈送给我一个${targetChar}，它是我的宝贝。`,
                `我们一家人都爱${targetChar}，它是我们家的快乐源泉。`
            ],
            plots: [
                `每天早上，我都会和${targetChar}打招呼。${targetChar}好像也在对我微笑呢！`,
                `晚上，一家人围坐在一起，讲着关于${targetChar}的故事。笑声充满了整个房间。`,
                `有了${targetChar}，家里变得更温馨了。我爱${targetChar}，也爱我的家。`
            ],
            endings: [
                `家因为有${targetChar}而更加美好。`,
                `${targetChar}是我们家的幸福见证。`,
                `我爱我的家，也爱家里的${targetChar}。`
            ]
        },
        '学校': {
            titles: [`学习"${targetChar}"`, `有趣的${targetChar}`, `课堂上的${targetChar}`],
            intros: [
                `今天，老师教我们认识"${targetChar}"这个字。`,
                `在学校里，我学会了写"${targetChar}"，真开心！`,
                `语文课上，老师讲了"${targetChar}"的故事。`
            ],
            plots: [
                `老师在黑板上写下"${targetChar}"，告诉我们这个字的意思。同学们都认真地听着，还跟着老师一起读。`,
                `我拿出铅笔，在作业本上练习写"${targetChar}"。一笔一画，写得可认真了！`,
                `下课后，我和同学们一起讨论"${targetChar}"。原来这个字这么有趣啊！`
            ],
            endings: [
                `今天我又学会了一个新字，真高兴！`,
                `"${targetChar}"这个字我会记一辈子的。`,
                `学习真快乐，我要认识更多的字！`
            ]
        },
        '童话': {
            titles: [`魔法${targetChar}`, `${targetChar}的奇迹`, `神奇${targetChar}`],
            intros: [
                `很久很久以前，有一个神奇的${targetChar}。`,
                `在童话王国里，${targetChar}有神奇的魔法。`,
                `传说中，得到${targetChar}的人就能实现愿望。`
            ],
            plots: [
                `小仙女送给小朋友一个${targetChar}，说它有神奇的魔力。小朋友半信半疑地接过${targetChar}。`,
                `当${targetChar}发出光芒时，奇迹发生了！周围的一切都变得美好起来。`,
                `原来，${targetChar}的魔法就是让人心中充满爱和希望。`
            ],
            endings: [
                `从此，${targetChar}的魔法一直守护着大家。`,
                `童话世界因为有${targetChar}而更加精彩。`,
                `相信魔法，相信美好，就像相信${targetChar}一样。`
            ]
        },
        '科幻': {
            titles: [`未来${targetChar}`, `${targetChar}号飞船`, `智能${targetChar}`],
            intros: [
                `2050年，科学家发明了神奇的${targetChar}。`,
                `在未来的世界里，每个人都有一个${targetChar}机器人。`,
                `太空站上，宇航员们正在研究一种新型${targetChar}。`
            ],
            plots: [
                `这个${targetChar}可以飞行，可以说话，还可以帮助人们做很多事情。小朋友们都非常喜欢它。`,
                `小明拥有一个${targetChar}助手。每天早上，${targetChar}都会叫他起床，还会帮他准备早餐。`,
                `有一天，${targetChar}带着小明飞上了太空。他们看到了美丽的地球，还有闪闪发光的星星。`
            ],
            endings: [
                `科技让生活更美好，这就是未来的${targetChar}。`,
                `有了${targetChar}，未来充满无限可能。`,
                `未来的世界真奇妙，我们要好好学习，创造更多奇迹！`
            ]
        }
    };

    const themeData = enhancedTemplates[theme] || enhancedTemplates['自然'];

    // 随机选择内容
    const title = themeData.titles[Math.floor(Math.random() * themeData.titles.length)];
    const intro = themeData.intros[Math.floor(Math.random() * themeData.intros.length)];
    const plot = themeData.plots[Math.floor(Math.random() * themeData.plots.length)];
    const ending = themeData.endings[Math.floor(Math.random() * themeData.endings.length)];

    let content = intro + plot + ending;

    // 根据长度调整
    const lengthMultipliers = { 'short': 0.6, 'medium': 1, 'long': 1.5 };
    const multiplier = lengthMultipliers[length] || 1;

    if (multiplier > 1) {
        content += `\n\n${intro.replace(targetChar, targetChar + targetChar)}${plot}${ending}`;
    }

    if (multiplier < 1) {
        content = intro + ending;
    }

    // 确保包含目标字多次
    if ((content.match(new RegExp(targetChar, 'g')) || []).length < 3) {
        content += `\n\n小朋友们，今天我们学习了"${targetChar}"这个字。记住，${targetChar}是一个很有趣的字，要多加练习哦！`;
    }

    return { title, content, targetChar };
}

// 保留原有简单备用方案
function generateFallbackArticle(targetChar, theme, length) {
    return generateEnhancedFallbackArticle(targetChar, theme, length);
}
function generateFallbackArticle(targetChar, theme, length) {
    const templates = {
        '动物': [
            `有一只小${targetChar}，它住在森林里。每天早上，小${targetChar}都会去找朋友们玩耍。小${targetChar}有很多好朋友，它们一起唱歌、跳舞，过得非常开心。`,
            `小${targetChar}是一只可爱的动物。它有着漂亮的毛发和明亮的眼睛。小${targetChar}喜欢在草地上跑来跑去，还喜欢和小朋友们一起玩耍。`
        ],
        '自然': [
            `春天的${targetChar}非常美丽。阳光照在${targetChar}上，闪闪发光。小朋友们都喜欢去看${targetChar}，感受大自然的美好。`,
            `大自然中有许多神奇的${targetChar}。每一朵${targetChar}、每一片${targetChar}都有它独特的美。我们要爱护这些美丽的${targetChar}。`
        ],
        '家庭': [
            `我的家里有一个${targetChar}。那是爸爸送给我的礼物。我非常喜欢这个${targetChar}，每天都会和它一起玩。这个${targetChar}是我最珍贵的东西。`,
            `一家人在一起的时候最开心了。${targetChar}是我们家的宝贝，每个人都爱它。有了${targetChar}，我们的家更加温暖。`
        ],
        '学校': [
            `在学校里，我学会了写"${targetChar}"这个字。老师教我们，"${targetChar}"字要认真写。现在我写得越来越好，老师还表扬了我。`,
            `今天在学校，我和同学们一起学习"${targetChar}"。这个字很有意思，我要多多练习，把它写得漂漂亮亮。`
        ],
        '童话': [
            `从前，有一个神奇的${targetChar}。它能够实现小朋友的愿望。只要对着${targetChar}许下心愿，梦想就会成真。`,
            `在遥远的王国里，住着一位拥有${targetChar}的公主。这个${targetChar}有魔法，能带给人快乐。公主用它帮助了很多需要帮助的人。`
        ],
        '科幻': [
            `未来的世界有一个神奇的${targetChar}。它可以带人们飞到太空，探索星星和月亮。小朋友们都梦想着能乘坐${targetChar}去宇宙旅行。`,
            `科学家发明了一种新型${targetChar}。这种${targetChar}可以帮助人们做很多事情。有了它，生活变得更加方便和有趣。`
        ]
    };

    const themeTemplates = templates[theme] || templates['自然'];
    let content = themeTemplates[Math.floor(Math.random() * themeTemplates.length)];

    // 确保包含目标字多次
    if ((content.match(new RegExp(targetChar, 'g')) || []).length < 3) {
        content += `我们要认真学习"${targetChar}"这个字，记住它的写法，理解它的意思。`;
    }

    // 根据长度调整
    const lengthMap = { 'short': 50, 'medium': 100, 'long': 200 };
    const targetLength = lengthMap[length] || 100;

    // 添加结尾
    const endings = [
        `这就是关于"${targetChar}"的故事。`,
        `小朋友们，你们学会"${targetChar}"这个字了吗？`,
        `让我们一起记住"${targetChar}"这个字吧！`
    ];
    content += endings[Math.floor(Math.random() * endings.length)];

    // 生成标题
    const titles = [
        `${targetChar}的故事`,
        `神奇的${targetChar}`,
        `我爱${targetChar}`,
        `${targetChar}的冒险`
    ];

    return {
        title: titles[Math.floor(Math.random() * titles.length)],
        content: content,
        targetChar: targetChar
    };
}

// 显示生成的文章
function displayGeneratedArticle(article, targetChar) {
    const container = document.getElementById('generatedArticle');
    const titleEl = document.getElementById('generatedTitle');
    const contentEl = document.getElementById('generatedContent');

    titleEl.textContent = article.title;

    // 高亮目标字
    const highlightedContent = article.content.replace(
        new RegExp(targetChar, 'g'),
        `<span class="highlight-target">${targetChar}</span>`
    );
    contentEl.innerHTML = highlightedContent;

    container.classList.remove('hidden');

    // 保存到localStorage供阅读页面使用
    localStorage.setItem('generatedArticle', JSON.stringify(article));
}

// 去朗读生成的文章
function goToReadArticle() {
    window.location.href = '/reading.html?generated=true';
}

// 汉字图形化数据 - 包含象形、emoji、记忆法
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
    '衣': { emoji: '👕', desc: '衣服', etymology: '像上衣的形状，领子、袖子、衣身', memory: '一件衣服身上穿，保暖又好看' },
    '食': { emoji: '🍚', desc: '食物', etymology: '像盛食物的器皿', memory: '食物香喷喷，吃饱有力气' },
    '住': { emoji: '🏠', desc: '居住', etymology: '人+主，人在主人家里', memory: '人在房子里住，温暖又安全' },
    '家': { emoji: '🏡', desc: '家', etymology: '屋里有猪（豕），表示有财产', memory: '家里有猪，表示富裕温暖' },
    '学': { emoji: '📚', desc: '学习', etymology: '双手（臼）在算（子）', memory: '双手捧书认真学习' },
    '文': { emoji: '📜', desc: '文字', etymology: '像人胸前的花纹', memory: '文字记录历史和知识' },
    '字': { emoji: '✍️', desc: '文字', etymology: '屋（宀）里有子，教孩子认字', memory: '在屋里教孩子写字' },
    '书': { emoji: '📖', desc: '书本', etymology: '像一支笔在书写', memory: '书本打开，知识满满' },
    '画': { emoji: '🎨', desc: '画画', etymology: '用笔（聿）在画边界（田）', memory: '用笔画出美丽图画' },
    '笔': { emoji: '✏️', desc: '毛笔', etymology: '竹字头+毛，竹管毛头', memory: '竹管羊毛，写字画画' },
    '纸': { emoji: '📄', desc: '纸张', etymology: '丝（纟）做的薄片', memory: '丝绸做的薄片，用来写字' },
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
    '左': { emoji: '⬅️', desc: '左边', etymology: '左手工作', memory: '左手边，伸出手' },
    '右': { emoji: '➡️', desc: '右边', etymology: '右手（又）在口边', memory: '右手边，写字的手' },
    '大': { emoji: '📏', desc: '大的', etymology: '像张开双臂的人，表示大', memory: '人张开双臂，表示很大' },
    '小': { emoji: '🤏', desc: '小的', etymology: '像细小的沙粒', memory: '小小的，像沙粒' },
    '多': { emoji: '🔢', desc: '很多', etymology: '两个夕（肉）表示多', memory: '两个肉块，表示很多' },
    '少': { emoji: '💧', desc: '很少', etymology: '像少数的几粒沙', memory: '只有几粒，表示很少' },
    '好': { emoji: '👍', desc: '好的', etymology: '女+子，有女有子为好', memory: '有儿有女，家庭美好' },
    '坏': { emoji: '👎', desc: '坏的', etymology: '土+不，土地不好', memory: '土地不好，就是坏' },
    '新': { emoji: '✨', desc: '新的', etymology: '亲+斤，用斧砍木，表示更新', memory: '斧砍木头，焕然一新' },
    '旧': { emoji: '📜', desc: '旧的', etymology: '像鸟停在巢上，表示不新', memory: '鸟儿归巢，表示旧物' },
    '长': { emoji: '📏', desc: '长的', etymology: '像长发老人', memory: '长发飘飘，年纪大' },
    '短': { emoji: '📎', desc: '短的', etymology: '矢（箭）+豆，短小的箭', memory: '短箭小豆，都不长' },
    '高': { emoji: '📏', desc: '高的', etymology: '像楼阁高耸', memory: '高楼耸立，高耸入云' },
    '低': { emoji: '⬇️', desc: '低的', etymology: '人+氐，人弯下身子', memory: '弯下身子，位置低' },
    '快': { emoji: '⚡', desc: '快的', etymology: '心+夬，心爽快', memory: '心里爽快，动作也快' },
    '慢': { emoji: '🐌', desc: '慢的', etymology: '心+曼，心情舒缓', memory: '心情舒缓，慢慢做事' },
    '早': { emoji: '🌅', desc: '早晨', etymology: '日在甲上，太阳初升', memory: '太阳初升，早晨到了' },
    '晚': { emoji: '🌙', desc: '晚上', etymology: '日在免旁，太阳落山', memory: '太阳落山，夜幕降临' },
    '明': { emoji: '💡', desc: '明亮', etymology: '日+月，日月光明', memory: '日月同辉，光明灿烂' },
    '暗': { emoji: '🌑', desc: '黑暗', etymology: '日+音，日无光', memory: '太阳没光，一片黑暗' },
    '星': { emoji: '⭐', desc: '星星', etymology: '日生，日生光辉', memory: '晚上出生的光点就是星' },
    '光': { emoji: '💫', desc: '光明', etymology: '火在人上，火光照明', memory: '火光照耀，一片光明' },
    '花': { emoji: '🌺', desc: '花朵', etymology: '草字头+化，草的变化', memory: '草上开出美丽的花' },
    '草': { emoji: '🌿', desc: '小草', etymology: '草字头+早，早晨的草', memory: '早晨的青草绿油油' },
    '树': { emoji: '🌳', desc: '树木', etymology: '木+对，成对的木', memory: '两棵大树站在一起' },
    '林': { emoji: '🌲', desc: '树林', etymology: '两木为林', memory: '两棵树就是一片小林' },
    '森': { emoji: '🌲', desc: '森林', etymology: '三木为森', memory: '三棵树就是茂密森林' },
    // 新增常用汉字
    '一': { emoji: '1️⃣', desc: '数字一', etymology: '一横表示数量一', memory: '一横一竖，最简单的字' },
    '二': { emoji: '2️⃣', desc: '数字二', etymology: '两横表示数量二', memory: '两横并排，就是二' },
    '三': { emoji: '3️⃣', desc: '数字三', etymology: '三横表示数量三', memory: '三横排一起，一二三' },
    '四': { emoji: '4️⃣', desc: '数字四', etymology: '像人口鼻中呼吸的样子', memory: '四方四正，四个角' },
    '五': { emoji: '5️⃣', desc: '数字五', etymology: '像交错的两绳', memory: '一横一竖交叉，就是五' },
    '六': { emoji: '6️⃣', desc: '数字六', etymology: '像房屋的形状', memory: '一点一横，像个帽子' },
    '七': { emoji: '7️⃣', desc: '数字七', etymology: '像切断东西的样子', memory: '一横一竖弯，七上八下' },
    '八': { emoji: '8️⃣', desc: '数字八', etymology: '像分开的样子', memory: '一撇一捺，像个八字' },
    '九': { emoji: '9️⃣', desc: '数字九', etymology: '像肘关节弯曲', memory: '一笔弯钩，就是九' },
    '十': { emoji: '🔟', desc: '数字十', etymology: '一横一竖，表示完备', memory: '横平竖直，十全十美' },
    '百': { emoji: '💯', desc: '一百', etymology: '一+白，表示很多', memory: '一白就是百，很多很多' },
    '千': { emoji: '💰', desc: '一千', etymology: '人+十，表示很多', memory: '千人千人，很多很多' },
    '万': { emoji: '🎋', desc: '一万', etymology: '像蝎子形状，借为数词', memory: '万字像蝎子，代表很多很多' },
    '爸': { emoji: '👨', desc: '爸爸', etymology: '父+巴，父亲', memory: '爸爸扛着家，很辛苦' },
    '妈': { emoji: '👩', desc: '妈妈', etymology: '女+马，母亲', memory: '妈妈像马一样勤劳' },
    '爷': { emoji: '👴', desc: '爷爷', etymology: '父+耶，祖父', memory: '爷爷年纪大，白胡子' },
    '奶': { emoji: '👵', desc: '奶奶', etymology: '女+乃，祖母', memory: '奶奶很慈祥，做好吃的' },
    '哥': { emoji: '👦', desc: '哥哥', etymology: '二+可，兄长', memory: '哥哥比我大，保护我' },
    '姐': { emoji: '👧', desc: '姐姐', etymology: '女+且，姐姐', memory: '姐姐很温柔，照顾我' },
    '弟': { emoji: '👶', desc: '弟弟', etymology: '丷+弔，弟弟', memory: '弟弟年纪小，很可爱' },
    '妹': { emoji: '🎀', desc: '妹妹', etymology: '女+未，妹妹', memory: '妹妹像花朵，很美丽' },
    '我': { emoji: '🙋', desc: '自己', etymology: '像手拿武器，表示自己', memory: '我自己，最棒的我' },
    '你': { emoji: '👉', desc: '对方', etymology: '人+尔，第二人称', memory: '你就是指对面的你' },
    '他': { emoji: '👤', desc: '他人', etymology: '人+也，第三人称', memory: '他是别人，不是我' },
    '她': { emoji: '👩', desc: '女性', etymology: '女+也，女性第三人称', memory: '她是女生，很美丽' },
    '它': { emoji: '🐾', desc: '动物', etymology: '宀+匕，指物', memory: '它是指小动物' },
    '这': { emoji: '👇', desc: '这里', etymology: '辶+言，近指', memory: '这就是这里，离我很近' },
    '那': { emoji: '👆', desc: '那里', etymology: '辶+冉，远指', memory: '那就是那里，离我很远' },
    '来': { emoji: '🏃', desc: '过来', etymology: '像麦子的形状', memory: '来来来，跑过来' },
    '去': { emoji: '🚶', desc: '离开', etymology: '像人离开的样子', memory: '去去去，走开啦' },
    '走': { emoji: '🚶‍♂️', desc: '走路', etymology: '像人摆臂行走', memory: '大步走路，向前走' },
    '跑': { emoji: '🏃‍♂️', desc: '跑步', etymology: '足+包，快速移动', memory: '跑得飞快，像风一样' },
    '飞': { emoji: '🦅', desc: '飞翔', etymology: '像鸟展翅飞翔', memory: '小鸟飞上天，翅膀扇动' },
    '看': { emoji: '👀', desc: '看见', etymology: '手+目，用手遮目远望', memory: '手搭凉棚，远远看' },
    '见': { emoji: '🙈', desc: '看见', etymology: '目+人，眼睛看见', memory: '看见看见，目字在上' },
    '听': { emoji: '👂', desc: '听见', etymology: '口+斤，用耳倾听', memory: '用耳朵听，静静听' },
    '说': { emoji: '💬', desc: '说话', etymology: '言+兑，用嘴表达', memory: '开口说话，言字旁' },
    '话': { emoji: '🗣️', desc: '话语', etymology: '言+舌，说出的话', memory: '说话用舌头，言字旁' },
    '吃': { emoji: '🍽️', desc: '吃饭', etymology: '口+乞，吃东西', memory: '张口吃饭，香香香' },
    '喝': { emoji: '🥤', desc: '喝水', etymology: '口+曷，饮也', memory: '口渴要喝水，口字旁' },
    '睡': { emoji: '😴', desc: '睡觉', etymology: '目+垂，眼皮垂下', memory: '眼皮垂下，要睡觉' },
    '醒': { emoji: '🌅', desc: '醒来', etymology: '酉+星，睡醒', memory: '太阳出来，醒来了' },
    '笑': { emoji: '😄', desc: '微笑', etymology: '竹+夭，像人笑的样子', memory: '竹字头下一个人，笑哈哈' },
    '哭': { emoji: '😭', desc: '哭泣', etymology: '像犬吠，引申为哭泣', memory: '两只大眼睛，在哭泣' },
    '爱': { emoji: '❤️', desc: '爱心', etymology: '心+旡，心中有情', memory: '心中有爱，用心爱' },
    '打': { emoji: '👊', desc: '打击', etymology: '手+丁，用手击打', memory: '用手拍打，提手旁' },
    '开': { emoji: '📂', desc: '打开', etymology: '两扇门打开', memory: '两扇门，打开了' },
    '关': { emoji: '📁', desc: '关闭', etymology: '门内有闩，关闭', memory: '门关上了，关关关' },
    '出': { emoji: '🚪', desc: '出去', etymology: '像脚从坑中迈出', memory: '从家出门，走出去' },
    '入': { emoji: '➡️', desc: '进入', etymology: '像尖头进入', memory: '尖着头，进入门' },
    '里': { emoji: '📦', desc: '里面', etymology: '田+土，田地之中', memory: '田字加土，在里面' },
    '外': { emoji: '🌐', desc: '外面', etymology: '夕+卜，外面', memory: '在外面，不在里面' },
    '天': { emoji: '☁️', desc: '天空', etymology: '像人头上的天空', memory: '一大为天，头顶上的天' },
    '地': { emoji: '🌍', desc: '大地', etymology: '土+也，大地', memory: '土也地，脚下大地' },
    '和': { emoji: '🤝', desc: '和平', etymology: '禾+口，禾苗人口', memory: '禾口和，和谐相处' },
    '的': { emoji: '⭕', desc: '助词', etymology: '白+勺，表示所属', memory: '白勺的，最常用的' },
    '了': { emoji: '✅', desc: '完成', etymology: '像婴儿形，借为助词', memory: '弯钩一笔，事情完了' },
    '在': { emoji: '📍', desc: '存在', etymology: '才+土，在地上', memory: '土上才在，在这里' },
    '有': { emoji: '🎁', desc: '拥有', etymology: '像手持肉，表示有', memory: '手里拿着肉，有了有了' },
    '没': { emoji: '🚫', desc: '没有', etymology: '水+殳，水沉没', memory: '三点水加殳，没有了' },
    '是': { emoji: '✔️', desc: '是的', etymology: '日+正，正直正确', memory: '日下正正，对的' },
    '不': { emoji: '❌', desc: '不是', etymology: '像花萼形，借为否定', memory: '一横一撇一竖，不要' },
    '会': { emoji: '🎯', desc: '能够', etymology: '人+云，能也', memory: '人云会，能够做' },
    '能': { emoji: '💪', desc: '能力', etymology: '像熊的形状，借为能', memory: '像只熊，有能力' },
    '要': { emoji: '🙏', desc: '需要', etymology: '西+女，要也', memory: '西方女子，想要' },
    '给': { emoji: '🎁', desc: '给予', etymology: '丝+合，给也', memory: '绞丝旁加合，给你' },
    '把': { emoji: '🤲', desc: '把握', etymology: '手+巴，握也', memory: '用手握住，提手旁' },
    '从': { emoji: '👥', desc: '跟随', etymology: '两个人相随', memory: '两个人，一前一后跟从' },
    '到': { emoji: '📍', desc: '到达', etymology: '至+刀，到达', memory: '到了到了，到达了' },
    '道': { emoji: '🛤️', desc: '道路', etymology: '辶+首，道路', memory: '走之旁加首，道路' },
    '路': { emoji: '🛣️', desc: '道路', etymology: '足+各，道路', memory: '足字旁加各，路路路' },
    '车': { emoji: '🚗', desc: '车子', etymology: '像车的形状', memory: '古代的车，两个轮子' },
    '船': { emoji: '⛵', desc: '船只', etymology: '舟+㕣，水上工具', memory: '舟字旁加几口，船' },
    '机': { emoji: '⚙️', desc: '机器', etymology: '木+几，机会', memory: '木字旁加几，机器' },
    '电': { emoji: '⚡', desc: '电力', etymology: '像闪电形状', memory: '闪电弯弯，是电' },
    '灯': { emoji: '💡', desc: '灯光', etymology: '火+丁，照明工具', memory: '火字旁加丁，灯灯灯' },
    '话': { emoji: '🗣️', desc: '话语', etymology: '言+舌，言语', memory: '言字旁加舌，说话' },
    '吗': { emoji: '❓', desc: '疑问', etymology: '口+马，疑问词', memory: '口字旁加马，对吗' },
    '呢': { emoji: '❔', desc: '疑问', etymology: '口+尼，疑问词', memory: '口字旁加尼，你呢' },
    '吧': { emoji: '❗', desc: '语气词', etymology: '口+巴，语气词', memory: '口字旁加巴，好吧' },
    '很': { emoji: '📈', desc: '很非常', etymology: '彳+艮，很也', memory: '双人旁加艮，很好' },
    '都': { emoji: '🏘️', desc: '全都', etymology: '者+阝，都也', memory: '全都在，都都都' },
    '得': { emoji: '🎉', desc: '得到', etymology: '彳+旦+寸，获得', memory: '双人旁加旦寸，得到' },
    '着': { emoji: '👔', desc: '穿着', etymology: '羊+目，附着', memory: '羊目着，穿着' },
    '过': { emoji: '⏮️', desc: '过去', etymology: '辶+寸，经过', memory: '走之旁加寸，过去' },
    '还': { emoji: '🔙', desc: '还有', etymology: '辶+不，还有', memory: '走之旁加不，还有' },
    '让': { emoji: '🙌', desc: '让', etymology: '言+上，让也', memory: '言字旁加上，让让' },
    '再': { emoji: '🔁', desc: '再次', etymology: '一+冉，再次', memory: '一再再，再一次' },
    '只': { emoji: '1️⃣', desc: '只有', etymology: '像鸟一只', memory: '八口只，一只鸟' },
    '最': { emoji: '🏆', desc: '最', etymology: '日+取+夂，最也', memory: '日取夂，最最好' },
    '现': { emoji: '👁️', desc: '现在', etymology: '王+见，显现', memory: '王字旁加见，现在' },
    '比': { emoji: '⚖️', desc: '比较', etymology: '像两人相比', memory: '两人比一比' },
    '被': { emoji: '🛌', desc: '被子', etymology: '衣+皮，被子', memory: '衣字旁加皮，被子' },
    '已': { emoji: '✔️', desc: '已经', etymology: '像胎儿形', memory: '已半巳满，已经' },
    '真': { emoji: '💎', desc: '真实', etymology: '十+具，真实', memory: '十字头下加具，真的' },
    '年': { emoji: '📅', desc: '年份', etymology: '禾+千，年也', memory: '禾字加千，一年年' },
    '当': { emoji: '⚖️', desc: '当时', etymology: '像田中有物', memory: '小字头加彐，当时' },
    '午': { emoji: '🕛', desc: '中午', etymology: '像舂米棒', memory: '干字出头，中午' },
    '后': { emoji: '↩️', desc: '后面', etymology: '像脚后跟着地', memory: '厂字下加口，后面' },
    '作': { emoji: '✍️', desc: '作业', etymology: '人+乍，工作', memory: '单人旁加乍，作业' },
    '方': { emoji: '⬜', desc: '方向', etymology: '像工具形', memory: '点横万，方向' },
    '成': { emoji: '🏆', desc: '成功', etymology: '戊+丁，成就', memory: '成了成了，成功了' },
    '什': { emoji: '❓', desc: '什么', etymology: '人+十，什么', memory: '单人旁加十，什么' },
    '么': { emoji: '❔', desc: '什么', etymology: '像幺的变形', memory: '撇撇折点，什么' },
    '名': { emoji: '🏷️', desc: '名字', etymology: '夕+口，名字', memory: '夕字加口，名字' },
    '同': { emoji: '👥', desc: '相同', etymology: '冂+一+口，相同', memory: '同字框加一和口，同' },
    '问': { emoji: '❓', desc: '问题', etymology: '门+口，询问', memory: '门字框加口，问问' },
    '回': { emoji: '🔁', desc: '回来', etymology: '口+口，回旋', memory: '大口套小口，回来' },
    '谁': { emoji: '👤', desc: '谁人', etymology: '言+隹，谁人', memory: '言字旁加隹，谁' },
    '也': { emoji: '〰️', desc: '也是', etymology: '像女阴形，借为也', memory: '横折钩竖弯钩，也' },
    '想': { emoji: '💭', desc: '想念', etymology: '相+心，思考', memory: '相字加心，想念' },
    '但': { emoji: '⛔', desc: '但是', etymology: '人+旦，但是', memory: '单人旁加旦，但是' },
    '自': { emoji: '👤', desc: '自己', etymology: '像鼻子形状', memory: '像鼻子，自己' },
    '用': { emoji: '🔧', desc: '使用', etymology: '像桶形，借为用', memory: '像桶，使用' },
    '才': { emoji: '🌱', desc: '才能', etymology: '像草木初生', memory: '一横一竖钩，才' },
    '对': { emoji: '✅', desc: '正确', etymology: '业+寸，正确', memory: '又字旁加寸，对' }
};

// 通用记忆法生成器（用于没有预定义的字）
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
        '阝': { name: '双耳旁', meaning: '和山丘或城市有关', emoji: '🏔️' },
        '钅': { name: '金字旁', meaning: '和金属有关', emoji: '⚙️' },
        '火': { name: '火字旁', meaning: '和火有关', emoji: '🔥' },
        '女': { name: '女字旁', meaning: '和女性有关', emoji: '👩' },
        '男': { name: '男字旁', meaning: '和男性有关', emoji: '👨' },
        '日': { name: '日字旁', meaning: '和太阳、时间有关', emoji: '☀️' },
        '月': { name: '月字旁', meaning: '和月亮、身体有关', emoji: '🌙' }
    };

    // 检查部首
    for (const [radical, info] of Object.entries(commonRadicals)) {
        if (char.includes(radical)) {
            return {
                emoji: info.emoji,
                desc: `包含"${info.name}"`,
                etymology: `${info.name}，${info.meaning}`,
                memory: `${char}字有${info.name}，${info.meaning}`
            };
        }
    }

    // 默认返回 - 使用汉字本身作为视觉
    return {
        emoji: '📝',
        desc: `汉字"${char}"`,
        etymology: `"${char}"是一个美丽的汉字，读作${pinyin || '...'}`,
        memory: `"${char}"字要记牢，多读多写就会了！`
    };
}

// 显示汉字图形化弹窗
async function showCharVisual(char) {
    const mistakes = await getMistakes();
    const mistake = mistakes.find(m => m.char === char);
    const pinyin = mistake?.pinyin || pinyinCache[char] || localPinyinDict[char] || await getPinyin(char);
    const reviewCount = mistake?.reviewCount || 0;

    // 获取图形数据
    const visual = charVisualData[char] || generateGenericVisual(char, pinyin);

    // 搜索网络图片（使用 Wikipedia 或生成搜索链接）
    const imageSearchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(char + ' 汉字 甲骨文')}`;
    const webSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(char + ' 汉字 字源 演变')}`;

    // 尝试获取 Wikimedia 图片
    const wikiImageUrl = await fetchWikiImage(char);

    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'char-visual-modal';
    modal.id = 'charVisualModal';
    modal.innerHTML = `
        <div class="char-visual-content" style="position: relative; max-height: 90vh; overflow-y: auto;">
            <button class="close-modal-btn" onclick="closeCharVisual()">×</button>

            <div class="char-display">
                <div class="char-big" style="cursor: pointer;" onclick="speakChar('${char}')" title="点击发音">${char}</div>
                <div class="char-pinyin">${pinyin}
                    <button onclick="speakChar('${char}')" style="margin-left: 10px; padding: 8px 16px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 0.9rem;"">🔊 发音</button>
                </div>
                ${reviewCount > 0 ? `<div style="font-size: 0.9rem; color: #667eea; margin-top: 5px;">已复习 ${reviewCount} 次</div>` : ''}
            </div>

            <div class="visual-section">
                <div class="visual-title">🎨 形象记忆</div>
                <div class="visual-content">
                    <div class="visual-emoji">${visual.emoji}</div>
                    <div class="visual-desc">${visual.desc}</div>
                </div>
            </div>

            ${wikiImageUrl ? `
            <div class="visual-section" style="margin-top: 15px;">
                <div class="visual-title">🖼️ 网络图片辅助</div>
                <div style="text-align: center; padding: 15px;">
                    <img src="${wikiImageUrl}" alt="${char} 图片" style="max-width: 100%; max-height: 200px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="display: none; padding: 20px; background: #f5f5f5; border-radius: 10px; color: #666;">
                        <p>🖼️ 图片加载失败</p>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="visual-section" style="margin-top: 15px;">
                <div class="visual-title">🔍 搜索更多资料</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; padding: 15px;">
                    <a href="${imageSearchUrl}" target="_blank" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 20px; font-size: 0.9rem;">🖼️ 搜索图片</a>
                    <a href="${webSearchUrl}" target="_blank" style="padding: 10px 20px; background: linear-gradient(135deg, #4ECDC4 0%, #44a08d 100%); color: white; text-decoration: none; border-radius: 20px; font-size: 0.9rem;">📚 字源资料</a>
                </div>
            </div>

            <div class="stroke-section">
                <div class="visual-title">✍️ 田字格书写</div>
                <div class="tianzige">
                    <div class="diagonal1"></div>
                    <div class="diagonal2"></div>
                    <div class="char">${char}</div>
                </div>
            </div>

            <div class="etymology-section">
                <div class="visual-title">📜 字形演变</div>
                <div class="etymology-content">
                    <div style="text-align: center;">
                        <div style="font-size: 0.8rem; color: #888; margin-bottom: 5px;">古代</div>
                        <div class="etymology-ancient">${char}</div>
                    </div>
                    <div class="etymology-arrow">→</div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.8rem; color: #888; margin-bottom: 5px;">现代</div>
                        <div class="etymology-modern">${char}</div>
                    </div>
                </div>
                <div class="etymology-text">${visual.etymology}</div>
            </div>

            <div class="memory-section">
                <div class="memory-title">💡 记忆口诀</div>
                <div class="memory-content">${visual.memory}</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 自动播放发音
    setTimeout(() => speakChar(char), 500);

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCharVisual();
    });

    // ESC键关闭
    document.addEventListener('keydown', handleEscKey);
}

// 从 Wikimedia 获取图片
async function fetchWikiImage(char) {
    try {
        // 尝试获取 Wikimedia Commons 上的汉字图片
        const searchTerm = encodeURIComponent(char + ' character');
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${char}&prop=pageimages&format=json&pithumbsize=300&origin=*`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) return null;

        const data = await response.json();
        const pages = data.query?.pages;
        if (pages) {
            const page = Object.values(pages)[0];
            if (page.thumbnail?.source) {
                return page.thumbnail.source;
            }
        }

        // 回退：使用 Unsplash 的随机相关图片（通过关键词）
        // 这里返回 null，让前端显示搜索链接
        return null;
    } catch (e) {
        console.error('获取网络图片失败:', e);
        return null;
    }
}

// ESC键处理
function handleEscKey(e) {
    if (e.key === 'Escape') closeCharVisual();
}

// 关闭图形化弹窗
function closeCharVisual() {
    const modal = document.getElementById('charVisualModal');
    if (modal) {
        modal.remove();
        document.removeEventListener('keydown', handleEscKey);
    }
}

// 导出给阅读页面使用
window.mistakeBook = {
    addMistake,
    getMistakes,
    saveMistakes
};
