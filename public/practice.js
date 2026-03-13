// 练习模块
let currentType = 'pinyin';
let currentDifficulty = 'easy';
let currentQuestion = null;
let correctCount = 0;
let wrongCount = 0;
let streakCount = 0;
let totalQuestions = 0;
let maxQuestions = 10;
let isAnswered = false;

// 拼音题库（含声调练习）
const pinyinData = {
    easy: [
        { pinyin: 'bā', chars: ['八', '巴', '吧'], correct: '八', tone: 1 },
        { pinyin: 'mā', chars: ['妈', '马', '麻'], correct: '妈', tone: 1 },
        { pinyin: 'bō', chars: ['波', '拨', '播'], correct: '波', tone: 1 },
        { pinyin: 'mō', chars: ['摸', '模', '摩'], correct: '摸', tone: 1 },
        { pinyin: 'fēi', chars: ['飞', '非', '菲'], correct: '飞', tone: 1 },
        { pinyin: 'dà', chars: ['大', '达', '答'], correct: '大', tone: 4 },
        { pinyin: 'xiǎo', chars: ['小', '晓', '笑'], correct: '小', tone: 3 },
        { pinyin: 'shǒu', chars: ['手', '首', '守'], correct: '手', tone: 3 },
        { pinyin: 'kǒu', chars: ['口', '扣', '寇'], correct: '口', tone: 3 },
        { pinyin: 'ěr', chars: ['耳', '尔', '饵'], correct: '耳', tone: 3 },
        { pinyin: 'mā ma', chars: ['妈妈', '马麻', '嘛嘛'], correct: '妈妈', tone: '1-0' },
        { pinyin: 'bà ba', chars: ['爸爸', '罢罢', '吧吧'], correct: '爸爸', tone: '4-0' },
        { pinyin: 'gē ge', chars: ['哥哥', '歌歌', '格格'], correct: '哥哥', tone: '1-0' },
        { pinyin: 'jiě jie', chars: ['姐姐', '解解', '结结'], correct: '姐姐', tone: '3-0' }
    ],
    medium: [
        { pinyin: 'píng guǒ', chars: ['苹果', '平果', '萍果'], correct: '苹果', tone: '2-3' },
        { pinyin: 'xiāng jiāo', chars: ['香蕉', '香焦', '相交'], correct: '香蕉', tone: '1-1' },
        { pinyin: 'lǎo hǔ', chars: ['老虎', '老胡', '老壶'], correct: '老虎', tone: '3-3' },
        { pinyin: 'dà xiàng', chars: ['大象', '大像', '大象'], correct: '大象', tone: '4-4' },
        { pinyin: 'xǐ què', chars: ['喜鹊', '喜雀', '洗雀'], correct: '喜鹊', tone: '3-4' },
        { pinyin: 'kǒng què', chars: ['孔雀', '孔却', '空雀'], correct: '孔雀', tone: '3-4' },
        { pinyin: 'shī zi', chars: ['狮子', '师子', '施子'], correct: '狮子', tone: '1-0' },
        { pinyin: 'hóu zi', chars: ['猴子', '喉子', '侯子'], correct: '猴子', tone: '2-0' },
        { pinyin: 'xióng māo', chars: ['熊猫', '雄猫', '胸毛'], correct: '熊猫', tone: '2-1' },
        { pinyin: 'cháng jǐng lù', chars: ['长颈鹿', '长劲鹿', '长径鹿'], correct: '长颈鹿', tone: '2-3-4' }
    ],
    hard: [
        { pinyin: 'qīng wā', chars: ['青蛙', '青哇', '清蛙'], correct: '青蛙', tone: '1-1' },
        { pinyin: 'hú li', chars: ['狐狸', '胡力', '壶里'], correct: '狐狸', tone: '2-0' },
        { pinyin: 'wū guī', chars: ['乌龟', '乌归', '屋规'], correct: '乌龟', tone: '1-1' },
        { pinyin: 'mì fēng', chars: ['蜜蜂', '密峰', '蜜锋'], correct: '蜜蜂', tone: '4-1' },
        { pinyin: 'hú dié', chars: ['蝴蝶', '胡蝶', '湖碟'], correct: '蝴蝶', tone: '2-2' },
        { pinyin: 'zhī zhū', chars: ['蜘蛛', '知珠', '支朱'], correct: '蜘蛛', tone: '1-1' },
        { pinyin: 'mǎ yǐ', chars: ['蚂蚁', '马蚁', '码以'], correct: '蚂蚁', tone: '3-3' },
        { pinyin: 'xī shuài', chars: ['蟋蟀', '西帅', '稀蟀'], correct: '蟋蟀', tone: '1-4' },
        { pinyin: 'biān fú', chars: ['蝙蝠', '边福', '蝙服'], correct: '蝙蝠', tone: '1-2' },
        { pinyin: 'wō niú', chars: ['蜗牛', '涡牛', '窝牛'], correct: '蜗牛', tone: '1-2' }
    ]
};

// 数学口算题库
const mathData = {
    easy: {
        generate() {
            const types = ['add', 'sub', 'simple'];
            const type = types[Math.floor(Math.random() * types.length)];
            let question, answer, display;

            switch(type) {
                case 'add':
                    // 10以内加法
                    const a1 = Math.floor(Math.random() * 9) + 1;
                    const b1 = Math.floor(Math.random() * (10 - a1)) + 1;
                    display = `${a1} + ${b1}`;
                    answer = a1 + b1;
                    break;
                case 'sub':
                    // 10以内减法
                    const a2 = Math.floor(Math.random() * 9) + 2;
                    const b2 = Math.floor(Math.random() * (a2 - 1)) + 1;
                    display = `${a2} - ${b2}`;
                    answer = a2 - b2;
                    break;
                case 'simple':
                    // 简单填空
                    const num = Math.floor(Math.random() * 10) + 1;
                    const part = Math.floor(Math.random() * num);
                    display = `${part} + ? = ${num}`;
                    answer = num - part;
                    break;
            }

            return { question: `${display} = ?`, answer, display };
        }
    },
    medium: {
        generate() {
            const types = ['add', 'sub', 'mul', 'chain'];
            const type = types[Math.floor(Math.random() * types.length)];
            let display, answer;

            switch(type) {
                case 'add':
                    // 20以内加法
                    const a1 = Math.floor(Math.random() * 15) + 5;
                    const b1 = Math.floor(Math.random() * (20 - a1)) + 1;
                    display = `${a1} + ${b1}`;
                    answer = a1 + b1;
                    break;
                case 'sub':
                    // 20以内减法
                    const a2 = Math.floor(Math.random() * 10) + 11;
                    const b2 = Math.floor(Math.random() * (a2 - 1)) + 1;
                    display = `${a2} - ${b2}`;
                    answer = a2 - b2;
                    break;
                case 'mul':
                    // 表内乘法
                    const a3 = Math.floor(Math.random() * 8) + 2;
                    const b3 = Math.floor(Math.random() * 8) + 2;
                    display = `${a3} × ${b3}`;
                    answer = a3 * b3;
                    break;
                case 'chain':
                    // 连加连减
                    const n1 = Math.floor(Math.random() * 10) + 1;
                    const n2 = Math.floor(Math.random() * 5) + 1;
                    const n3 = Math.floor(Math.random() * 5) + 1;
                    display = `${n1} + ${n2} - ${n3}`;
                    answer = n1 + n2 - n3;
                    break;
            }

            return { question: `${display} = ?`, answer, display };
        }
    },
    hard: {
        generate() {
            const types = ['big', 'mul', 'div', 'chain', 'fill'];
            const type = types[Math.floor(Math.random() * types.length)];
            let display, answer;

            switch(type) {
                case 'big':
                    // 100以内加减
                    const a1 = Math.floor(Math.random() * 50) + 20;
                    const b1 = Math.floor(Math.random() * 40) + 10;
                    const isAdd = Math.random() > 0.5;
                    if (isAdd) {
                        display = `${a1} + ${b1}`;
                        answer = a1 + b1;
                    } else {
                        display = `${a1 + b1} - ${b1}`;
                        answer = a1;
                    }
                    break;
                case 'mul':
                    // 两位数乘一位数
                    const a2 = Math.floor(Math.random() * 90) + 10;
                    const b2 = Math.floor(Math.random() * 8) + 2;
                    display = `${a2} × ${b2}`;
                    answer = a2 * b2;
                    break;
                case 'div':
                    // 除法
                    const b3 = Math.floor(Math.random() * 8) + 2;
                    const ans3 = Math.floor(Math.random() * 9) + 2;
                    const a3 = b3 * ans3;
                    display = `${a3} ÷ ${b3}`;
                    answer = ans3;
                    break;
                case 'chain':
                    // 混合运算
                    const n1 = Math.floor(Math.random() * 20) + 10;
                    const n2 = Math.floor(Math.random() * 10) + 1;
                    const n3 = Math.floor(Math.random() * 5) + 1;
                    const n4 = Math.floor(Math.random() * 5) + 1;
                    display = `${n1} - ${n2} + ${n3} + ${n4}`;
                    answer = n1 - n2 + n3 + n4;
                    break;
                case 'fill':
                    // 填空
                    const num = Math.floor(Math.random() * 50) + 20;
                    const part = Math.floor(Math.random() * (num - 5)) + 5;
                    display = `? + ${part} = ${num}`;
                    answer = num - part;
                    break;
            }

            return { question: `${display} = ?`, answer, display };
        }
    }
};

// 语文识字题库
const chineseData = {
    easy: [
        { char: '一', pinyin: 'yī', meaning: '最小的正整数' },
        { char: '二', pinyin: 'èr', meaning: '一加一的和' },
        { char: '三', pinyin: 'sān', meaning: '二加一的和' },
        { char: '人', pinyin: 'rén', meaning: '能制造工具并使用工具进行劳动的高等动物' },
        { char: '口', pinyin: 'kǒu', meaning: '人和动物吃东西的器官' },
        { char: '日', pinyin: 'rì', meaning: '太阳' },
        { char: '月', pinyin: 'yuè', meaning: '月亮' },
        { char: '山', pinyin: 'shān', meaning: '地面形成的高耸的部分' },
        { char: '水', pinyin: 'shuǐ', meaning: '无色无味的透明液体' },
        { char: '火', pinyin: 'huǒ', meaning: '燃烧时发出的光和焰' },
        { char: '木', pinyin: 'mù', meaning: '树木' },
        { char: '土', pinyin: 'tǔ', meaning: '泥土，土壤' },
        { char: '天', pinyin: 'tiān', meaning: '天空' },
        { char: '地', pinyin: 'dì', meaning: '地球，地面' },
        { char: '上', pinyin: 'shàng', meaning: '位置在高处的' },
        { char: '下', pinyin: 'xià', meaning: '位置在低处的' }
    ],
    medium: [
        { char: '春', pinyin: 'chūn', meaning: '一年的第一季' },
        { char: '夏', pinyin: 'xià', meaning: '一年的第二季' },
        { char: '秋', pinyin: 'qiū', meaning: '一年的第三季' },
        { char: '冬', pinyin: 'dōng', meaning: '一年的第四季' },
        { char: '东', pinyin: 'dōng', meaning: '太阳升起的方向' },
        { char: '西', pinyin: 'xī', meaning: '太阳落下的方向' },
        { char: '南', pinyin: 'nán', meaning: '早晨面对太阳时右手的一边' },
        { char: '北', pinyin: 'běi', meaning: '早晨面对太阳时左手的一边' },
        { char: '花', pinyin: 'huā', meaning: '植物的繁殖器官' },
        { char: '草', pinyin: 'cǎo', meaning: '草本植物的总称' },
        { char: '树', pinyin: 'shù', meaning: '木本植物的通称' },
        { char: '鸟', pinyin: 'niǎo', meaning: '脊椎动物的一类' },
        { char: '鱼', pinyin: 'yú', meaning: '水生脊椎动物' },
        { char: '风', pinyin: 'fēng', meaning: '空气流动的现象' },
        { char: '雨', pinyin: 'yǔ', meaning: '从云层降向地面的水' }
    ],
    hard: [
        { char: '梦想', pinyin: 'mèng xiǎng', meaning: '对未来的美好愿望' },
        { char: '勇敢', pinyin: 'yǒng gǎn', meaning: '不怕困难和危险' },
        { char: '善良', pinyin: 'shàn liáng', meaning: '心地纯洁，没有恶意' },
        { char: '勤奋', pinyin: 'qín fèn', meaning: '努力不懈，勤劳刻苦' },
        { char: '智慧', pinyin: 'zhì huì', meaning: '辨析判断、发明创造的能力' },
        { char: '快乐', pinyin: 'kuài lè', meaning: '感到幸福或满意' },
        { char: '友谊', pinyin: 'yǒu yì', meaning: '朋友间的情谊' },
        { char: '诚实', pinyin: 'chéng shí', meaning: '言行跟内心思想一致' },
        { char: '坚持', pinyin: 'jiān chí', meaning: '坚决保持，不放弃' },
        { char: '感恩', pinyin: 'gǎn ēn', meaning: '对别人所给的帮助表示感激' },
        { char: '自信', pinyin: 'zì xìn', meaning: '相信自己' },
        { char: '尊重', pinyin: 'zūn zhòng', meaning: '敬重，重视' }
    ]
};

// 英语单词题库
const englishData = {
    easy: [
        { word: 'apple', meaning: '苹果', options: ['苹果', '香蕉', '橘子', '葡萄'] },
        { word: 'book', meaning: '书', options: ['书', '笔', '纸', '橡皮'] },
        { word: 'cat', meaning: '猫', options: ['狗', '猫', '鸟', '鱼'] },
        { word: 'dog', meaning: '狗', options: ['猫', '狗', '兔子', '老鼠'] },
        { word: 'sun', meaning: '太阳', options: ['月亮', '星星', '太阳', '云'] },
        { word: 'red', meaning: '红色', options: ['红色', '蓝色', '绿色', '黄色'] },
        { word: 'blue', meaning: '蓝色', options: ['红色', '黄色', '蓝色', '绿色'] },
        { word: 'green', meaning: '绿色', options: ['黄色', '绿色', '蓝色', '紫色'] },
        { word: 'yellow', meaning: '黄色', options: ['橙色', '黄色', '棕色', '粉色'] },
        { word: 'one', meaning: '一', options: ['一', '二', '三', '四'] },
        { word: 'two', meaning: '二', options: ['一', '二', '三', '四'] },
        { word: 'three', meaning: '三', options: ['二', '三', '四', '五'] },
        { word: 'water', meaning: '水', options: ['火', '水', '土', '风'] },
        { word: 'milk', meaning: '牛奶', options: ['果汁', '牛奶', '茶', '咖啡'] },
        { word: 'bread', meaning: '面包', options: ['米饭', '面条', '面包', '馒头'] }
    ],
    medium: [
        { word: 'elephant', meaning: '大象', options: ['老虎', '狮子', '大象', '熊'] },
        { word: 'butterfly', meaning: '蝴蝶', options: ['蜜蜂', '蝴蝶', '蜻蜓', '蚂蚁'] },
        { word: 'rainbow', meaning: '彩虹', options: ['雨', '云', '彩虹', '风'] },
        { word: 'mountain', meaning: '山', options: ['河', '湖', '山', '海'] },
        { word: 'library', meaning: '图书馆', options: ['学校', '医院', '图书馆', '商店'] },
        { word: 'computer', meaning: '电脑', options: ['手机', '电视', '电脑', '平板'] },
        { word: 'birthday', meaning: '生日', options: ['节日', '生日', '假期', '周末'] },
        { word: 'favorite', meaning: '最喜欢的', options: ['最喜欢的', '讨厌的', '一般的', '特别的'] },
        { word: 'tomorrow', meaning: '明天', options: ['昨天', '今天', '明天', '后天'] },
        { word: 'weather', meaning: '天气', options: ['温度', '天气', '季节', '气候'] }
    ],
    hard: [
        { word: 'beautiful', meaning: '美丽的', options: ['美丽的', '丑陋的', '普通的', '奇怪的'] },
        { word: 'adventure', meaning: '冒险', options: ['旅行', '冒险', '游戏', '故事'] },
        { word: 'knowledge', meaning: '知识', options: ['知识', '智慧', '学习', '书本'] },
        { word: 'brilliant', meaning: '聪明的', options: ['聪明的', '勤奋的', '善良的', '勇敢的'] },
        { word: 'congratulation', meaning: '祝贺', options: ['道歉', '感谢', '祝贺', '告别'] },
        { word: 'environment', meaning: '环境', options: ['环境', '生态', '自然', '地球'] },
        { word: 'experience', meaning: '经验', options: ['实验', '经验', '经历', '学习'] },
        { word: 'imagination', meaning: '想象力', options: ['想象', '想象力', '创造力', '记忆力'] }
    ]
};

// 当前小朋友ID
let currentKidId = localStorage.getItem('currentKidId') || '';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTypeSelector();
    initDifficultySelector();
    loadKids();
});

// 加载小朋友列表
async function loadKids() {
    try {
        const res = await fetch('/api/kids');
        const data = await res.json();

        if (data.success && data.data.length > 0) {
            const selector = document.getElementById('kidSelector');
            selector.innerHTML = '<option value="">选择小朋友</option>' +
                data.data.map(kid => `
                    <option value="${kid.id}" ${kid.id == currentKidId ? 'selected' : ''}>${kid.name}</option>
                `).join('');

            selector.addEventListener('change', (e) => {
                currentKidId = e.target.value;
                localStorage.setItem('currentKidId', currentKidId);
            });

            // 如果没有选择过，默认选第一个
            if (!currentKidId && data.data[0]) {
                currentKidId = data.data[0].id;
                selector.value = currentKidId;
                localStorage.setItem('currentKidId', currentKidId);
            }
        }
    } catch (error) {
        console.error('加载小朋友列表失败:', error);
    }
}

// 类型选择器
function initTypeSelector() {
    document.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentType = card.dataset.type;
            updatePracticeTitle();
            resetPractice();
        });
    });
}

// 难度选择器
function initDifficultySelector() {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.level;
            resetPractice();
        });
    });
}

// 更新练习标题
function updatePracticeTitle() {
    const titles = {
        pinyin: '拼音练习',
        math: '数学口算',
        chinese: '语文识字',
        english: '英语单词'
    };
    document.getElementById('practiceTitle').textContent = titles[currentType];
}

// 重置练习
function resetPractice() {
    correctCount = 0;
    wrongCount = 0;
    streakCount = 0;
    totalQuestions = 0;
    updateStats();
    document.getElementById('questionText').innerHTML = '准备好了吗？';
    document.getElementById('optionsArea').innerHTML = '';
    document.getElementById('inputArea').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('questionArea').classList.remove('hidden');
    document.getElementById('controlArea').innerHTML = `
        <button class="btn btn-primary" onclick="startPractice()">开始练习</button>
    `;
}

// 开始练习
function startPractice() {
    correctCount = 0;
    wrongCount = 0;
    streakCount = 0;
    totalQuestions = 0;
    updateStats();
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('questionArea').classList.remove('hidden');
    document.getElementById('controlArea').innerHTML = `
        <button class="btn btn-secondary" onclick="resetPractice()">结束练习</button>
    `;
    nextQuestion();
}

// 下一题
function nextQuestion() {
    if (totalQuestions >= maxQuestions) {
        showResult();
        return;
    }

    isAnswered = false;
    totalQuestions++;
    updateProgress();

    switch(currentType) {
        case 'pinyin':
            generatePinyinQuestion();
            break;
        case 'math':
            generateMathQuestion();
            break;
        case 'chinese':
            generateChineseQuestion();
            break;
        case 'english':
            generateEnglishQuestion();
            break;
    }
}

// 生成拼音题
function generatePinyinQuestion() {
    const questions = pinyinData[currentDifficulty];
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];

    document.getElementById('questionText').innerHTML = `
        <div class="pinyin">${currentQuestion.pinyin}</div>
        <div style="font-size: 1.5rem; color: #666;">选择正确的汉字</div>
    `;

    const optionsArea = document.getElementById('optionsArea');
    optionsArea.classList.remove('hidden');
    document.getElementById('inputArea').classList.add('hidden');

    // 打乱选项
    const shuffled = [...currentQuestion.chars].sort(() => Math.random() - 0.5);

    optionsArea.innerHTML = shuffled.map(char => `
        <button class="option-btn" onclick="checkPinyinAnswer('${char}', this)">
            <span style="font-size: 2rem;">${char}</span>
        </button>
    `).join('');
}

// 检查拼音答案
function checkPinyinAnswer(answer, btn) {
    if (isAnswered) return;
    isAnswered = true;

    const isCorrect = answer === currentQuestion.correct;
    handleAnswer(isCorrect, btn);
}

// 生成数学题
function generateMathQuestion() {
    currentQuestion = mathData[currentDifficulty].generate();

    document.getElementById('questionText').innerHTML = `
        <div style="font-size: 4rem;">${currentQuestion.display} = ?</div>
    `;

    document.getElementById('optionsArea').classList.add('hidden');
    document.getElementById('inputArea').classList.remove('hidden');

    const input = document.getElementById('mathAnswer');
    input.value = '';
    input.focus();

    // 回车提交
    input.onkeypress = (e) => {
        if (e.key === 'Enter') checkMathAnswer();
    };
}

// 检查数学答案
function checkMathAnswer() {
    if (isAnswered) return;
    isAnswered = true;

    const userAnswer = parseInt(document.getElementById('mathAnswer').value);
    const isCorrect = userAnswer === currentQuestion.answer;

    handleAnswer(isCorrect, null, userAnswer);
}

// 生成语文识字题
function generateChineseQuestion() {
    const questions = chineseData[currentDifficulty];
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];

    document.getElementById('questionText').innerHTML = `
        <div class="char">${currentQuestion.char}</div>
        <div style="font-size: 1.5rem; color: #666; margin-top: 10px;">${currentQuestion.pinyin}</div>
        <div style="font-size: 1rem; color: #888; margin-top: 5px;">这是什么意思？</div>
    `;

    const optionsArea = document.getElementById('optionsArea');
    optionsArea.classList.remove('hidden');
    document.getElementById('inputArea').classList.add('hidden');

    // 生成选项（正确答案 + 随机错误答案）
    const wrongOptions = questions
        .filter(q => q.meaning !== currentQuestion.meaning)
        .map(q => q.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    const allOptions = [currentQuestion.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);

    optionsArea.innerHTML = allOptions.map(meaning => `
        <button class="option-btn" onclick="checkChineseAnswer('${meaning}', this)">
            ${meaning}
        </button>
    `).join('');
}

// 检查语文答案
function checkChineseAnswer(answer, btn) {
    if (isAnswered) return;
    isAnswered = true;

    const isCorrect = answer === currentQuestion.meaning;
    handleAnswer(isCorrect, btn);
}

// 生成英语单词题
function generateEnglishQuestion() {
    const questions = englishData[currentDifficulty];
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];

    document.getElementById('questionText').innerHTML = `
        <div style="font-size: 3rem; color: #667eea;">${currentQuestion.word}</div>
        <div style="font-size: 1.5rem; color: #666; margin-top: 10px;">这个单词是什么意思？</div>
    `;

    const optionsArea = document.getElementById('optionsArea');
    optionsArea.classList.remove('hidden');
    document.getElementById('inputArea').classList.add('hidden');

    optionsArea.innerHTML = currentQuestion.options.map(opt => `
        <button class="option-btn" onclick="checkEnglishAnswer('${opt}', this)">
            ${opt}
        </button>
    `).join('');
}

// 检查英语答案
function checkEnglishAnswer(answer, btn) {
    if (isAnswered) return;
    isAnswered = true;

    const isCorrect = answer === currentQuestion.meaning;
    handleAnswer(isCorrect, btn);
}

// 处理答案
function handleAnswer(isCorrect, btn, userAnswer) {
    if (isCorrect) {
        correctCount++;
        streakCount++;
        if (btn) btn.classList.add('correct');

        // 连击提示
        if (streakCount >= 3) {
            showStreakMessage();
        }

        // 播放正确音效（如果有）
        // playSound('correct');
    } else {
        wrongCount++;
        streakCount = 0;
        if (btn) btn.classList.add('wrong');

        // 显示正确答案
        if (currentType === 'math') {
            document.getElementById('questionText').innerHTML += `
                <div style="color: #4CAF50; font-size: 1.5rem; margin-top: 10px;">
                    正确答案是 ${currentQuestion.answer}
                </div>
            `;
        }
    }

    updateStats();

    // 延迟下一题
    setTimeout(() => {
        nextQuestion();
    }, isCorrect ? 800 : 1500);
}

// 显示连击提示
function showStreakMessage() {
    const existing = document.querySelector('.streak-indicator');
    if (existing) existing.remove();

    const streak = document.createElement('div');
    streak.className = 'streak-indicator';
    streak.innerHTML = `🔥 ${streakCount} 连击！`;
    document.body.appendChild(streak);

    // 播放鼓励语
    const encouragements = ['太棒了！', '继续加油！', '你真聪明！', '好厉害！', '超级棒！'];
    if (streakCount % 3 === 0) {
        showEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
    }

    setTimeout(() => streak.remove(), 2000);
}

// 显示鼓励动画
function showEncouragement(text) {
    const el = document.createElement('div');
    el.className = 'encouragement';
    el.textContent = text;
    document.body.appendChild(el);

    // 添加星星特效
    createStarBurst();

    setTimeout(() => el.remove(), 1000);
}

// 星星特效
function createStarBurst() {
    for (let i = 0; i < 6; i++) {
        const star = document.createElement('div');
        star.className = 'star-burst';
        star.innerHTML = '⭐';
        star.style.left = (50 + (Math.random() - 0.5) * 30) + '%';
        star.style.top = (50 + (Math.random() - 0.5) * 30) + '%';
        star.style.animationDelay = (i * 0.1) + 's';
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 1000);
    }
}

// 更新统计
function updateStats() {
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;
    document.getElementById('streakCount').textContent = streakCount;
}

// 更新进度条
function updateProgress() {
    const progress = (totalQuestions / maxQuestions) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

// 显示结果
function showResult() {
    document.getElementById('questionArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('controlArea').innerHTML = '';

    const score = Math.round((correctCount / maxQuestions) * 100);
    document.getElementById('resultScore').textContent = score + '分';

    let message = '';
    if (score === 100) message = '🎉 完美！太棒了！';
    else if (score >= 80) message = '👏 优秀！继续加油！';
    else if (score >= 60) message = '💪 不错！还能更好！';
    else message = '📚 再练习一下会更好！';

    document.getElementById('resultMessage').innerHTML = `
        ${message}<br>
        <small>答对 ${correctCount} 题，答错 ${wrongCount} 题</small>
    `;

    // 保存练习记录到服务器
    savePracticeRecord(score);
}

// 保存练习记录
function savePracticeRecord(score) {
    const kidId = localStorage.getItem('currentKidId');
    if (!kidId) return;

    const subjectMap = {
        pinyin: 1,  // 语文
        math: 2,    // 数学
        chinese: 1, // 语文
        english: 3  // 英语
    };

    fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            kid_id: parseInt(kidId),
            subject_id: subjectMap[currentType],
            learning_date: new Date().toISOString().split('T')[0],
            duration: Math.floor(maxQuestions * 0.5), // 估算时间
            content: `${document.getElementById('practiceTitle').textContent} - ${score}分`,
            performance: Math.ceil(score / 20), // 转换为1-5星
            mood: score >= 80 ? '😄' : score >= 60 ? '😊' : '🤔',
            notes: `练习${maxQuestions}题，答对${correctCount}题`
        })
    }).catch(err => console.log('保存记录失败:', err));
}

// 重新开始
function restartPractice() {
    startPractice();
}
