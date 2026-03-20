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

// 从网络API获取拼音
async function fetchPinyinFromAPI(char) {
    try {
        const response = await fetch(`https://v.api.aa1.cn/api/api-pinyin/pinyin.php?msg=${encodeURIComponent(char)}&type=text`, {
            method: 'GET',
            mode: 'cors'
        });
        
        if (response.ok) {
            const text = await response.text();
            const pinyin = text.trim().replace(/[\d\s]/g, '');
            if (pinyin && pinyin.length > 0) {
                return pinyin;
            }
        }
    } catch (e) {
        console.log('在线拼音API失败');
    }
    
    return '';
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
        
        // 语音选择优先级：
        // 1. Google 中文女声
        // 2. Microsoft 中文女声
        // 3. 任何中文语音
        // 4. 默认语音
        let selectedVoice = null;
        
        // 优先选择 Google 中文女声
        selectedVoice = voices.find(v => 
            v.name.includes('Google') && v.name.includes('中文') && v.name.includes('女')
        );
        
        // 其次 Microsoft 中文女声
        if (!selectedVoice) {
            selectedVoice = voices.find(v => 
                v.name.includes('Microsoft') && v.lang.includes('zh') && 
                (v.name.includes('女') || v.name.includes('Yaoyao') || v.name.includes('Huihui'))
            );
        }
        
        // 然后任何中文女声
        if (!selectedVoice) {
            selectedVoice = voices.find(v => 
                v.lang.includes('zh') && (v.name.includes('女') || v.gender === 'female')
            );
        }
        
        // 最后任何中文语音
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
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

// 调用AI生成文章（这里使用模板方式，实际可以接入API）
async function generateArticleWithAI(targetChar, theme, length) {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 基于模板生成文章
    return generateFallbackArticle(targetChar, theme, length);
}

// 备用文章生成
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
    '森': { emoji: '🌲', desc: '森林', etymology: '三木为森', memory: '三棵树就是茂密森林' }
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
        '宀': { name: '宝盖头', meaning: '和房屋有关', emoji: '🏠' }
    };

    // 检查部首
    for (const [radical, info] of Object.entries(commonRadicals)) {
        if (char.includes(radical)) {
            return {
                emoji: info.emoji,
                desc: `包含"${info.name}"`,
                etymology: `${info.name}${info.meaning}`,
                memory: `${char}字有${info.name}，${info.meaning}`
            };
        }
    }

    // 默认返回
    return {
        emoji: '✨',
        desc: '神奇的汉字',
        etymology: '每个汉字都有它独特的故事和来历',
        memory: `"${char}"读作${pinyin}，用心记住它！`
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

    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'char-visual-modal';
    modal.id = 'charVisualModal';
    modal.innerHTML = `
        <div class="char-visual-content" style="position: relative;">
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
