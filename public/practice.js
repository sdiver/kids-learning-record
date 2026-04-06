// 练习模块
// API 基础URL - 根据当前路径自动检测
const pathParts = window.location.pathname.split('/');
const appIndex = pathParts.indexOf('app');
const BASE_PATH = appIndex >= 0 ? '/' + pathParts.slice(1, appIndex + 2).join('/') : '';
const API_BASE = BASE_PATH + '/api';

let currentType = 'pinyin';
let currentDifficulty = 'easy';
let currentQuestion = null;
let correctCount = 0;
let wrongCount = 0;
let streakCount = 0;
let totalQuestions = 0;
let maxQuestions = 10;
let isAnswered = false;

// 大规模拼音词库 - 互联网常见词汇+AI生成
const pinyinData = {
    easy: [
        // 单字基础
        { pinyin: 'bā', correct: '八', wrongOptions: ['入', '人'], tone: 1 },
        { pinyin: 'mā', correct: '妈', wrongOptions: ['好', '女'], tone: 1 },
        { pinyin: 'bō', correct: '波', wrongOptions: ['皮', '水'], tone: 1 },
        { pinyin: 'mō', correct: '摸', wrongOptions: ['拿', '手'], tone: 1 },
        { pinyin: 'fēi', correct: '飞', wrongOptions: ['走', '跑'], tone: 1 },
        { pinyin: 'dà', correct: '大', wrongOptions: ['天', '太'], tone: 4 },
        { pinyin: 'xiǎo', correct: '小', wrongOptions: ['少', '水'], tone: 3 },
        { pinyin: 'shǒu', correct: '手', wrongOptions: ['毛', '支'], tone: 3 },
        { pinyin: 'kǒu', correct: '口', wrongOptions: ['日', '回'], tone: 3 },
        { pinyin: 'ěr', correct: '耳', wrongOptions: ['目', '自'], tone: 3 },
        // 叠词
        { pinyin: 'mā ma', correct: '妈妈', wrongOptions: ['奶奶', '姐姐'], tone: '1-0' },
        { pinyin: 'bà ba', correct: '爸爸', wrongOptions: ['爷爷', '叔叔'], tone: '4-0' },
        { pinyin: 'gē ge', correct: '哥哥', wrongOptions: ['弟弟', '爸爸'], tone: '1-0' },
        { pinyin: 'jiě jie', correct: '姐姐', wrongOptions: ['妹妹', '妈妈'], tone: '3-0' },
        { pinyin: 'yé ye', correct: '爷爷', wrongOptions: ['爸爸', '姥爷'], tone: '2-0' },
        { pinyin: 'nǎi nai', correct: '奶奶', wrongOptions: ['妈妈', '姥姥'], tone: '3-0' },
        // 日常物品
        { pinyin: 'mù tóu', correct: '木头', wrongOptions: ['石头', '沙发'], tone: '4-2' },
        { pinyin: 'shí tou', correct: '石头', wrongOptions: ['木头', '砖头'], tone: '2-0' },
        { pinyin: 'dà mén', correct: '大门', wrongOptions: ['大门', '房门'], tone: '4-2' },
        { pinyin: 'chuāng hu', correct: '窗户', wrongOptions: ['房门', '阳台'], tone: '1-0' },
        { pinyin: 'zhuō zi', correct: '桌子', wrongOptions: ['椅子', '柜子'], tone: '1-0' },
        { pinyin: 'yǐ zi', correct: '椅子', wrongOptions: ['桌子', '凳子'], tone: '3-0' },
        // 食物
        { pinyin: 'mǐ fàn', correct: '米饭', wrongOptions: ['面条', '馒头'], tone: '3-4' },
        { pinyin: 'miàn tiáo', correct: '面条', wrongOptions: ['米饭', '粉丝'], tone: '4-2' },
        { pinyin: 'shuǐ guǒ', correct: '水果', wrongOptions: ['蔬菜', '糖果'], tone: '3-3' },
        { pinyin: 'niú nǎi', correct: '牛奶', wrongOptions: ['豆浆', '果汁'], tone: '2-3' },
        { pinyin: 'miàn bāo', correct: '面包', wrongOptions: ['馒头', '蛋糕'], tone: '4-1' },
        // 动物
        { pinyin: 'xiǎo māo', correct: '小猫', wrongOptions: ['小狗', '小兔'], tone: '3-1' },
        { pinyin: 'xiǎo gǒu', correct: '小狗', wrongOptions: ['小猫', '小鸟'], tone: '3-3' },
        { pinyin: 'xiǎo jī', correct: '小鸡', wrongOptions: ['小鸭', '小鸟'], tone: '3-1' },
        { pinyin: 'xiǎo yā', correct: '小鸭', wrongOptions: ['小鸡', '天鹅'], tone: '3-1' },
        { pinyin: 'xiǎo yú', correct: '小鱼', wrongOptions: ['小虾', '海豚'], tone: '3-2' },
        // 自然
        { pinyin: 'tài yáng', correct: '太阳', wrongOptions: ['月亮', '星星'], tone: '4-0' },
        { pinyin: 'yuè liang', correct: '月亮', wrongOptions: ['太阳', '地球'], tone: '4-0' },
        { pinyin: 'xīng xing', correct: '星星', wrongOptions: ['月亮', '云彩'], tone: '1-0' },
        { pinyin: 'tiān kōng', correct: '天空', wrongOptions: ['大海', '陆地'], tone: '1-1' },
        { pinyin: 'dà dì', correct: '大地', wrongOptions: ['天空', '海洋'], tone: '4-4' },
        // 颜色
        { pinyin: 'hóng sè', correct: '红色', wrongOptions: ['橙色', '粉色'], tone: '2-4' },
        { pinyin: 'lǜ sè', correct: '绿色', wrongOptions: ['蓝色', '青色'], tone: '4-4' },
        { pinyin: 'lán sè', correct: '蓝色', wrongOptions: ['绿色', '紫色'], tone: '2-4' },
        { pinyin: 'huáng sè', correct: '黄色', wrongOptions: ['橙色', '金色'], tone: '2-4' },
        { pinyin: 'bái sè', correct: '白色', wrongOptions: ['灰色', '银色'], tone: '2-4' },
        { pinyin: 'hēi sè', correct: '黑色', wrongOptions: ['深蓝', '深褐'], tone: '1-4' },
        // 基础动词
        { pinyin: 'chī fàn', correct: '吃饭', wrongOptions: ['喝水', '睡觉'], tone: '1-4' },
        { pinyin: 'hē shuǐ', correct: '喝水', wrongOptions: ['吃饭', '喝茶'], tone: '1-3' },
        { pinyin: 'shuì jiào', correct: '睡觉', wrongOptions: ['起床', '休息'], tone: '4-4' },
        { pinyin: 'qǐ chuáng', correct: '起床', wrongOptions: ['睡觉', '躺下'], tone: '3-2' },
        { pinyin: 'pǎo bù', correct: '跑步', wrongOptions: ['走路', '跳绳'], tone: '3-4' },
        { pinyin: 'chàng gē', correct: '唱歌', wrongOptions: ['跳舞', '弹琴'], tone: '4-1' },
        { pinyin: 'tiào wǔ', correct: '跳舞', wrongOptions: ['唱歌', '画画'], tone: '4-3' },
        { pinyin: 'huà huà', correct: '画画', wrongOptions: ['写字', '剪纸'], tone: '4-4' },
        { pinyin: 'xiě zì', correct: '写字', wrongOptions: ['画画', '读书'], tone: '3-4' },
        { pinyin: 'dú shū', correct: '读书', wrongOptions: ['看报', '写字'], tone: '2-1' },
        // 时间
        { pinyin: 'jīn tiān', correct: '今天', wrongOptions: ['明天', '昨天'], tone: '1-1' },
        { pinyin: 'míng tiān', correct: '明天', wrongOptions: ['今天', '后天'], tone: '2-1' },
        { pinyin: 'zuó tiān', correct: '昨天', wrongOptions: ['前天', '今天'], tone: '2-1' },
        { pinyin: 'zǎo shang', correct: '早上', wrongOptions: ['上午', '早晨'], tone: '3-0' },
        { pinyin: 'wǎn shang', correct: '晚上', wrongOptions: ['夜里', '深夜'], tone: '3-0' },
        { pinyin: 'zhōng wǔ', correct: '中午', wrongOptions: ['正午', '下午'], tone: '1-3' },
        // 身体部位
        { pinyin: 'yǎn jīng', correct: '眼睛', wrongOptions: ['眼皮', '眉毛'], tone: '3-1' },
        { pinyin: 'bí zi', correct: '鼻子', wrongOptions: ['嘴巴', '耳朵'], tone: '2-0' },
        { pinyin: 'zuǐ ba', correct: '嘴巴', wrongOptions: ['鼻子', '脸颊'], tone: '3-0' },
        { pinyin: 'ěr duo', correct: '耳朵', wrongOptions: ['鼻子', '眼睛'], tone: '3-0' },
        { pinyin: 'tóu fa', correct: '头发', wrongOptions: ['眉毛', '胡须'], tone: '2-0' },
        // 基础交通
        { pinyin: 'qì chē', correct: '汽车', wrongOptions: ['火车', '轮船'], tone: '4-1' },
        { pinyin: 'huǒ chē', correct: '火车', wrongOptions: ['地铁', '公交'], tone: '3-1' },
        { pinyin: 'fēi jī', correct: '飞机', wrongOptions: ['直升机', '热气球'], tone: '1-1' },
        { pinyin: 'lún chuán', correct: '轮船', wrongOptions: ['帆船', '快艇'], tone: '2-2' },
        // 天气
        { pinyin: 'qíng tiān', correct: '晴天', wrongOptions: ['阴天', '雨天'], tone: '2-1' },
        { pinyin: 'yīn tiān', correct: '阴天', wrongOptions: ['晴天', '多云'], tone: '1-1' },
        { pinyin: 'xià yǔ', correct: '下雨', wrongOptions: ['下雪', '打雷'], tone: '4-3' },
        { pinyin: 'xià xuě', correct: '下雪', wrongOptions: ['下雨', '冰雹'], tone: '4-3' },
        { pinyin: 'guā fēng', correct: '刮风', wrongOptions: ['下雨', '打雷'], tone: '1-1' }
    ],
    medium: [
        { pinyin: 'píng guǒ', correct: '苹果', wrongOptions: ['西瓜', '桃子'], tone: '2-3' },
        { pinyin: 'xiāng jiāo', correct: '香蕉', wrongOptions: ['黄瓜', '茄子'], tone: '1-1' },
        { pinyin: 'xī guā', correct: '西瓜', wrongOptions: ['南瓜', '冬瓜'], tone: '1-1' },
        { pinyin: 'pú tao', correct: '葡萄', wrongOptions: ['荔枝', '龙眼'], tone: '2-0' },
        { pinyin: 'cǎo méi', correct: '草莓', wrongOptions: ['蓝莓', '樱桃'], tone: '3-2' },
        { pinyin: 'lí zi', correct: '梨子', wrongOptions: ['苹果', '柿子'], tone: '2-0' },
        { pinyin: 'táo zi', correct: '桃子', wrongOptions: ['李子', '杏子'], tone: '2-0' },
        // 动物
        { pinyin: 'lǎo hǔ', correct: '老虎', wrongOptions: ['狮子', '豹子'], tone: '3-3' },
        { pinyin: 'dà xiàng', correct: '大象', wrongOptions: ['犀牛', '河马'], tone: '4-4' },
        { pinyin: 'xǐ què', correct: '喜鹊', wrongOptions: ['乌鸦', '燕子'], tone: '3-4' },
        { pinyin: 'kǒng què', correct: '孔雀', wrongOptions: ['鹦鹉', '天鹅'], tone: '3-4' },
        { pinyin: 'shī zi', correct: '狮子', wrongOptions: ['老虎', '狼狗'], tone: '1-0' },
        { pinyin: 'hóu zi', correct: '猴子', wrongOptions: ['猩猩', '猿猴'], tone: '2-0' },
        { pinyin: 'xióng māo', correct: '熊猫', wrongOptions: ['棕熊', '黑熊'], tone: '2-1' },
        { pinyin: 'cháng jǐng lù', correct: '长颈鹿', wrongOptions: ['梅花鹿', '驯鹿'], tone: '2-3-4' },
        { pinyin: 'dài shǔ', correct: '袋鼠', wrongOptions: ['考拉', '袋熊'], tone: '4-3' },
        { pinyin: 'wū guī', correct: '乌龟', wrongOptions: ['甲鱼', '蜥蜴'], tone: '1-1' },
        // 日常用品
        { pinyin: 'diàn shì', correct: '电视', wrongOptions: ['电脑', '电话'], tone: '4-4' },
        { pinyin: 'bīng xiāng', correct: '冰箱', wrongOptions: ['空调', '洗衣机'], tone: '1-1' },
        { pinyin: 'xǐ yī jī', correct: '洗衣机', wrongOptions: ['洗碗机', '烘干机'], tone: '3-1-1' },
        { pinyin: 'diàn nǎo', correct: '电脑', wrongOptions: ['平板', '手机'], tone: '4-3' },
        { pinyin: 'shǒu jī', correct: '手机', wrongOptions: ['电话', '相机'], tone: '3-1' },
        { pinyin: 'shū bāo', correct: '书包', wrongOptions: ['背包', '钱包'], tone: '1-1' },
        { pinyin: 'qiān bǐ', correct: '铅笔', wrongOptions: ['钢笔', '毛笔'], tone: '1-3' },
        { pinyin: 'chǐ zi', correct: '尺子', wrongOptions: ['圆规', '量角器'], tone: '3-0' },
        // 食物
        { pinyin: 'qiǎo kè lì', correct: '巧克力', wrongOptions: ['棉花糖', '棒棒糖'], tone: '3-4-4' },
        { pinyin: 'bīng jī líng', correct: '冰激凌', wrongOptions: ['雪糕', '冰棍'], tone: '1-1-2' },
        { pinyin: 'hàn bǎo', correct: '汉堡', wrongOptions: ['三明治', '热狗'], tone: '4-3' },
        { pinyin: 'shǔ tiáo', correct: '薯条', wrongOptions: ['薯片', '爆米花'], tone: '3-2' },
        { pinyin: 'kě lè', correct: '可乐', wrongOptions: ['雪碧', '芬达'], tone: '3-4' },
        // 学校
        { pinyin: 'lǎo shī', correct: '老师', wrongOptions: ['医生', '警察'], tone: '3-1' },
        { pinyin: 'tóng xué', correct: '同学', wrongOptions: ['朋友', '伙伴'], tone: '2-2' },
        { pinyin: 'jiāo shì', correct: '教室', wrongOptions: ['办公室', '图书馆'], tone: '4-4' },
        { pinyin: 'cāo chǎng', correct: '操场', wrongOptions: ['体育馆', '游泳池'], tone: '1-3' },
        { pinyin: 'tú shū guǎn', correct: '图书馆', wrongOptions: ['博物馆', '美术馆'], tone: '2-1-3' },
        // 蔬菜
        { pinyin: 'bái cài', correct: '白菜', wrongOptions: ['青菜', '菠菜'], tone: '2-4' },
        { pinyin: 'luó bo', correct: '萝卜', wrongOptions: ['土豆', '红薯'], tone: '2-0' },
        { pinyin: 'huáng guā', correct: '黄瓜', wrongOptions: ['南瓜', '冬瓜'], tone: '2-1' },
        { pinyin: 'xī hóng shì', correct: '西红柿', wrongOptions: ['圣女果', '草莓'], tone: '1-2-4' },
        { pinyin: 'tǔ dòu', correct: '土豆', wrongOptions: ['红薯', '芋头'], tone: '3-4' },
        { pinyin: 'dòu fu', correct: '豆腐', wrongOptions: ['豆芽', '豆浆'], tone: '4-0' },
        // 运动
        { pinyin: 'yóu yǒng', correct: '游泳', wrongOptions: ['潜水', '划船'], tone: '2-3' },
        { pinyin: 'páo bù', correct: '跑步', wrongOptions: ['走路', '散步'], tone: '3-4' },
        { pinyin: 'tiào shéng', correct: '跳绳', wrongOptions: ['跳绳', '踢毽'], tone: '4-2' },
        { pinyin: 'dǎ lán qiú', correct: '打篮球', wrongOptions: ['踢足球', '打排球'], tone: '3-2-2' },
        { pinyin: 'xià qí', correct: '下棋', wrongOptions: ['打牌', '玩游戏'], tone: '4-2' },
        // 衣物
        { pinyin: 'chèn shān', correct: '衬衫', wrongOptions: ['毛衣', '外套'], tone: '4-1' },
        { pinyin: 'kù zi', correct: '裤子', wrongOptions: ['裙子', '短裤'], tone: '4-0' },
        { pinyin: 'qún zi', correct: '裙子', wrongOptions: ['裤子', '衬衫'], tone: '2-0' },
        { pinyin: 'wà zi', correct: '袜子', wrongOptions: ['鞋子', '手套'], tone: '4-0' },
        { pinyin: 'mào zi', correct: '帽子', wrongOptions: ['围巾', '手套'], tone: '4-0' },
        // 情感
        { pinyin: 'kāi xīn', correct: '开心', wrongOptions: ['高兴', '快乐'], tone: '1-1' },
        { pinyin: 'nán guò', correct: '难过', wrongOptions: ['伤心', '哭泣'], tone: '2-4' },
        { pinyin: 'hài pà', correct: '害怕', wrongOptions: ['担心', '紧张'], tone: '4-4' },
        { pinyin: 'shēng qì', correct: '生气', wrongOptions: ['发怒', '烦恼'], tone: '1-4' },
        { pinyin: 'dān xīn', correct: '担心', wrongOptions: ['害怕', '忧愁'], tone: '1-1' },
        // 交通
        { pinyin: 'dì tiě', correct: '地铁', wrongOptions: ['公交车', '轻轨'], tone: '4-3' },
        { pinyin: 'gōng jiāo chē', correct: '公交车', wrongOptions: ['出租车', '私家车'], tone: '1-1-1' },
        { pinyin: 'zì xíng chē', correct: '自行车', wrongOptions: ['摩托车', '三轮车'], tone: '4-2-1' },
        // 场所
        { pinyin: 'chāo shì', correct: '超市', wrongOptions: ['商场', '便利店'], tone: '1-4' },
        { pinyin: 'gōng yuán', correct: '公园', wrongOptions: ['植物园', '动物园'], tone: '1-2' },
        { pinyin: 'diàn yǐng yuàn', correct: '电影院', wrongOptions: ['剧场', '音乐厅'], tone: '4-3-4' },
        { pinyin: 'cān tīng', correct: '餐厅', wrongOptions: ['食堂', '饭馆'], tone: '1-1' }
    ],
    hard: [
        // 昆虫/小动物
        { pinyin: 'qīng wā', correct: '青蛙', wrongOptions: ['蟾蜍', '蜥蜴'], tone: '1-1' },
        { pinyin: 'hú li', correct: '狐狸', wrongOptions: ['狼狗', '豺狼'], tone: '2-0' },
        { pinyin: 'mì fēng', correct: '蜜蜂', wrongOptions: ['黄蜂', '马蜂'], tone: '4-1' },
        { pinyin: 'hú dié', correct: '蝴蝶', wrongOptions: ['飞蛾', '蜻蜓'], tone: '2-2' },
        { pinyin: 'zhī zhū', correct: '蜘蛛', wrongOptions: ['蝎子', '蜈蚣'], tone: '1-1' },
        { pinyin: 'mǎ yǐ', correct: '蚂蚁', wrongOptions: ['白蚁', '甲虫'], tone: '3-3' },
        { pinyin: 'xī shuài', correct: '蟋蟀', wrongOptions: ['蝈蝈', '纺织娘'], tone: '1-4' },
        { pinyin: 'biān fú', correct: '蝙蝠', wrongOptions: ['猫头鹰', '夜莺'], tone: '1-2' },
        { pinyin: 'wō niú', correct: '蜗牛', wrongOptions: ['蛞蝓', '螺蛳'], tone: '1-2' },
        { pinyin: 'qīng tíng', correct: '蜻蜓', wrongOptions: ['豆娘', '螳螂'], tone: '1-2' },
        { pinyin: 'táng láng', correct: '螳螂', wrongOptions: ['蝗虫', '蚱蜢'], tone: '2-2' },
        // 职业
        { pinyin: 'yī shēng', correct: '医生', wrongOptions: ['护士', '药师'], tone: '1-1' },
        { pinyin: 'jǐng chá', correct: '警察', wrongOptions: ['保安', '军人'], tone: '3-2' },
        { pinyin: 'fēi xíng yuán', correct: '飞行员', wrongOptions: ['宇航员', '船长'], tone: '1-2-4' },
        { pinyin: 'jiào liàn', correct: '教练', wrongOptions: ['裁判', '领队'], tone: '4-4' },
        { pinyin: 'chú shī', correct: '厨师', wrongOptions: ['帮厨', '面点师'], tone: '2-1' },
        // 科技
        { pinyin: 'wéi xīng', correct: '卫星', wrongOptions: ['飞船', '火箭'], tone: '2-1' },
        { pinyin: 'fēi jī', correct: '飞机', wrongOptions: ['直升机', '滑翔机'], tone: '1-1' },
        { pinyin: 'huǒ jiàn', correct: '火箭', wrongOptions: ['导弹', '卫星'], tone: '3-4' },
        { pinyin: 'zhí shēng jī', correct: '直升机', wrongOptions: ['战斗机', '轰炸机'], tone: '2-1-1' },
        { pinyin: 'jī qì rén', correct: '机器人', wrongOptions: ['人工智能', '自动化'], tone: '1-4-2' },
        // 地理
        { pinyin: 'cháng chéng', correct: '长城', wrongOptions: ['故宫', '颐和园'], tone: '2-2' },
        { pinyin: 'gù gōng', correct: '故宫', wrongOptions: ['天坛', '地坛'], tone: '4-1' },
        { pinyin: 'tiān tán', correct: '天坛', wrongOptions: ['地坛', '日坛'], tone: '1-2' },
        { pinyin: 'běi jīng', correct: '北京', wrongOptions: ['天津', '石家庄'], tone: '3-1' },
        { pinyin: 'shàng hǎi', correct: '上海', wrongOptions: ['南京', '杭州'], tone: '4-3' },
        { pinyin: 'xiāng gǎng', correct: '香港', wrongOptions: ['澳门', '深圳'], tone: '1-3' },
        { pinyin: 'tái wān', correct: '台湾', wrongOptions: ['海南', '琉球'], tone: '2-1' },
        // 成语
        { pinyin: 'yī míng jīng rén', correct: '一鸣惊人', wrongOptions: ['一飞冲天', '一步登天'], tone: '1-2-1-2' },
        { pinyin: 'bàn tú ér fèi', correct: '半途而废', wrongOptions: ['坚持不懈', '有始有终'], tone: '4-2-2-4' },
        { pinyin: 'shǒu zhū dài tù', correct: '守株待兔', wrongOptions: ['掩耳盗铃', '亡羊补牢'], tone: '3-1-4-4' },
        { pinyin: 'huà shé tiān zú', correct: '画蛇添足', wrongOptions: ['多此一举', '弄巧成拙'], tone: '4-2-1-2' },
        { pinyin: 'yǎn ěr dào líng', correct: '掩耳盗铃', wrongOptions: ['自欺欺人', '睁眼说瞎话'], tone: '3-3-4-2' },
        { pinyin: 'wáng yáng bǔ láo', correct: '亡羊补牢', wrongOptions: ['亡羊补牢', '悬崖勒马'], tone: '2-2-3-2' },
        { pinyin: 'māo zhāo hǔ wēi', correct: '狐假虎威', wrongOptions: ['鸡鸣狗盗', '狗仗人势'], tone: '2-3-3-1' },
        // 品质/美德
        { pinyin: 'qiān xū', correct: '谦虚', wrongOptions: ['自满', '骄傲'], tone: '1-1' },
        { pinyin: 'kāng kǎi', correct: '慷慨', wrongOptions: ['吝啬', '小气'], tone: '1-3' },
        { pinyin: 'rè qíng', correct: '热情', wrongOptions: ['冷漠', '无情'], tone: '4-2' },
        { pinyin: 'jī zhì', correct: '机智', wrongOptions: ['鲁莽', '冒失'], tone: '1-4' },
        { pinyin: 'qín láo', correct: '勤劳', wrongOptions: ['懒惰', '懈怠'], tone: '2-2' },
        { pinyin: 'jié jiǎn', correct: '节俭', wrongOptions: ['浪费', '奢侈'], tone: '2-3' },
        // 自然现象
        { pinyin: 'léi diàn', correct: '雷电', wrongOptions: ['暴风', '冰雹'], tone: '2-4' },
        { pinyin: 'bào fēng xuě', correct: '暴风雪', wrongOptions: ['暴风雨', '台风'], tone: '4-1-3' },
        { pinyin: 'dì zhèn', correct: '地震', wrongOptions: ['海啸', '火山'], tone: '4-4' },
        { pinyin: 'huǒ shān', correct: '火山', wrongOptions: ['地震', '泥石流'], tone: '3-1' },
        // 四字词
        { pinyin: 'xīn nián kuài lè', correct: '新年快乐', wrongOptions: ['生日快乐', '节日快乐'], tone: '1-2-4-4' },
        { pinyin: 'wàn shì rú yì', correct: '万事如意', wrongOptions: ['心想事成', '一帆风顺'], tone: '4-4-2-4' },
        { pinyin: 'shēn tǐ jiàn kāng', correct: '身体健康', wrongOptions: ['万事如意', '心想事成'], tone: '1-3-4-1' },
        { pinyin: 'xué hǎi wú yá', correct: '学海无涯', wrongOptions: ['知识无限', '博大精深'], tone: '2-3-2-2' },
        { pinyin: 'tiān gāo dì kuò', correct: '天高地阔', wrongOptions: ['天长地久', '地大物博'], tone: '1-1-4-4' },
        { pinyin: 'bǎi nián shù rén', correct: '百年树人', wrongOptions: ['十年树木', '百折不挠'], tone: '3-2-4-2' }
    ]
};

// ==================== 拼音题库扩展与加权 ====================

// 从 localStorage 加载 AI 生成的扩展题目（启动时合并进 pinyinData）
function loadExpandedQuestions() {
    ['easy', 'medium', 'hard'].forEach(level => {
        try {
            const saved = localStorage.getItem(`pinyinExpanded_${level}`);
            if (saved) pinyinData[level].push(...JSON.parse(saved));
        } catch(e) {}
    });
}

// 错误权重：答错 +3，答对 -1（下限 0），持久化到 localStorage
let pinyinWrongWeights = {};
try { pinyinWrongWeights = JSON.parse(localStorage.getItem('pinyinWrongWeights') || '{}'); } catch(e) {}

function savePinyinWeights() {
    localStorage.setItem('pinyinWrongWeights', JSON.stringify(pinyinWrongWeights));
}

// 加权随机选题（错误多的题目出现概率更高）
function selectWeightedPinyinQuestion(questions) {
    const weights = questions.map(q => 1 + (pinyinWrongWeights[q.pinyin + '|' + q.correct] || 0));
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < questions.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return questions[i];
    }
    return questions[questions.length - 1];
}

// 更新题库数量显示
function updatePinyinPoolSize() {
    const el = document.getElementById('pinyinPoolSize');
    if (el) el.textContent = `题库: ${(pinyinData[currentDifficulty] || []).length} 题`;
}

// AI 扩种
async function expandPinyinPool() {
    const btn = document.getElementById('pinyinExpandBtn');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.textContent = '⏳ 生成中...';
    try {
        const res = await fetch(`${API_BASE}/pinyin/expand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: currentDifficulty })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        // 去重后合并
        const existingKeys = new Set(pinyinData[currentDifficulty].map(q => q.pinyin + '|' + q.correct));
        const newOnes = data.data.filter(q => !existingKeys.has(q.pinyin + '|' + q.correct));
        pinyinData[currentDifficulty].push(...newOnes);

        // 持久化到 localStorage
        const savedKey = `pinyinExpanded_${currentDifficulty}`;
        const existing = JSON.parse(localStorage.getItem(savedKey) || '[]');
        existing.push(...newOnes);
        localStorage.setItem(savedKey, JSON.stringify(existing));

        updatePinyinPoolSize();
        btn.textContent = `✅ 已添加 ${newOnes.length} 题`;
        setTimeout(() => { btn.textContent = '✨ AI扩种'; btn.disabled = false; }, 2000);
    } catch(e) {
        btn.textContent = '❌ 失败，重试';
        setTimeout(() => { btn.textContent = '✨ AI扩种'; btn.disabled = false; }, 2500);
    }
}

// 用于生成差异化干扰项的汉字库
const commonChars = {
    easy: ['一', '二', '三', '人', '口', '日', '月', '山', '水', '火', '木', '土', '天', '地', '上', '下', '大', '小', '手', '足', '耳', '目', '头', '尾', '牛', '马', '羊', '鸡', '鸭', '鱼'],
    medium: ['春', '夏', '秋', '冬', '东', '西', '南', '北', '花', '草', '树', '叶', '鸟', '虫', '云', '雨', '雪', '风', '电', '光', '书', '笔', '纸', '墨', '门', '窗', '桌', '椅', '床', '柜'],
    hard: ['梦', '想', '勇', '敢', '智', '慧', '快', '乐', '友', '谊', '诚', '实', '坚', '持', '感', '恩', '自', '信', '尊', '重', '团', '结', '帮', '助', '分', '享', '礼', '貌', '文', '明']
};

// ==================== 拼音错题统计（localStorage 持久化）====================

const PINYIN_STATS_KEY = 'pinyinQuestionStats_v2';

function getPinyinStats() {
    try { return JSON.parse(localStorage.getItem(PINYIN_STATS_KEY) || '{}'); }
    catch(e) { return {}; }
}

function savePinyinStats(stats) {
    try { localStorage.setItem(PINYIN_STATS_KEY, JSON.stringify(stats)); } catch(e) {}
}

/** 记录一次答题结果 */
function recordPinyinResult(pinyin, correct, isCorrect) {
    const stats = getPinyinStats();
    if (!stats[correct]) stats[correct] = { pinyin, wrong: 0, total: 0, lastWrong: 0 };
    stats[correct].pinyin = pinyin;
    stats[correct].total++;
    if (!isCorrect) {
        stats[correct].wrong++;
        stats[correct].lastWrong = Date.now();
    }
    savePinyinStats(stats);
}

/** 加权随机选题：错得多的题出现概率更高 */
function weightedSelectPinyinQuestion(difficulty) {
    const stats = getPinyinStats();
    const questions = pinyinData[difficulty];
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const weights = questions.map(q => {
        const s = stats[q.correct];
        let w = 1;
        if (s && s.total > 0) {
            w += s.wrong * 2;                                           // 每错一次 +2
            if (s.lastWrong && now - s.lastWrong < WEEK) w += 3;       // 近7天错过 +3
            if (s.wrong / s.total > 0.5) w += 2;                       // 错误率 >50% 再加
        }
        return w;
    });

    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < questions.length; i++) {
        r -= weights[i];
        if (r <= 0) return questions[i];
    }
    return questions[questions.length - 1];
}

/** 获取当前难度错误率最高的词（Top N） */
function getWeakWordsList(difficulty, topN = 10) {
    const stats = getPinyinStats();
    return pinyinData[difficulty]
        .filter(q => stats[q.correct] && stats[q.correct].wrong > 0)
        .map(q => ({ ...q, ...stats[q.correct] }))
        .sort((a, b) => (b.wrong / Math.max(b.total, 1)) - (a.wrong / Math.max(a.total, 1)))
        .slice(0, topN);
}

/** 清除拼音统计 */
function resetPinyinStats() {
    localStorage.removeItem(PINYIN_STATS_KEY);
    renderWeakWordsPanel();
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);
        padding:12px 24px;border-radius:12px;font-weight:700;z-index:9999;
        background:#4CAF50;color:white;box-shadow:0 4px 15px rgba(0,0,0,0.2);`;
    t.textContent = '✅ 已清除统计记录';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
}

// 数学口算题库
const mathData = {
    addsub: {
        easy: {
            generate() {
                const isAdd = Math.random() > 0.5;
                let display, answer;
                if (isAdd) {
                    const a = Math.floor(Math.random() * 9) + 1;
                    const b = Math.floor(Math.random() * (10 - a)) + 1;
                    display = `${a} + ${b}`;
                    answer = a + b;
                } else {
                    const a = Math.floor(Math.random() * 9) + 2;
                    const b = Math.floor(Math.random() * (a - 1)) + 1;
                    display = `${a} - ${b}`;
                    answer = a - b;
                }
                return { question: `${display} = ?`, answer, display, type: '加减法' };
            }
        },
        medium: {
            generate() {
                const isAdd = Math.random() > 0.5;
                let display, answer;
                if (isAdd) {
                    const a = Math.floor(Math.random() * 15) + 5;
                    const b = Math.floor(Math.random() * (20 - a)) + 1;
                    display = `${a} + ${b}`;
                    answer = a + b;
                } else {
                    const a = Math.floor(Math.random() * 10) + 11;
                    const b = Math.floor(Math.random() * (a - 1)) + 1;
                    display = `${a} - ${b}`;
                    answer = a - b;
                }
                return { question: `${display} = ?`, answer, display, type: '加减法' };
            }
        },
        hard: {
            generate() {
                const isAdd = Math.random() > 0.5;
                let display, answer;
                if (isAdd) {
                    const a = Math.floor(Math.random() * 50) + 20;
                    const b = Math.floor(Math.random() * 40) + 10;
                    display = `${a} + ${b}`;
                    answer = a + b;
                } else {
                    const a = Math.floor(Math.random() * 50) + 50;
                    const b = Math.floor(Math.random() * 40) + 10;
                    display = `${a} - ${b}`;
                    answer = a - b;
                }
                return { question: `${display} = ?`, answer, display, type: '加减法' };
            }
        }
    },
    muldiv: {
        easy: {
            generate() {
                const isMul = Math.random() > 0.5;
                let display, answer;
                if (isMul) {
                    const a = Math.floor(Math.random() * 4) + 2;
                    const b = Math.floor(Math.random() * 4) + 2;
                    display = `${a} × ${b}`;
                    answer = a * b;
                } else {
                    const b = Math.floor(Math.random() * 4) + 2;
                    const ans = Math.floor(Math.random() * 4) + 2;
                    const a = b * ans;
                    display = `${a} ÷ ${b}`;
                    answer = ans;
                }
                return { question: `${display} = ?`, answer, display, type: '乘除法' };
            }
        },
        medium: {
            generate() {
                const isMul = Math.random() > 0.5;
                let display, answer;
                if (isMul) {
                    const a = Math.floor(Math.random() * 8) + 2;
                    const b = Math.floor(Math.random() * 8) + 2;
                    display = `${a} × ${b}`;
                    answer = a * b;
                } else {
                    const b = Math.floor(Math.random() * 8) + 2;
                    const ans = Math.floor(Math.random() * 8) + 2;
                    const a = b * ans;
                    display = `${a} ÷ ${b}`;
                    answer = ans;
                }
                return { question: `${display} = ?`, answer, display, type: '乘除法' };
            }
        },
        hard: {
            generate() {
                const isMul = Math.random() > 0.5;
                let display, answer;
                if (isMul) {
                    const a = Math.floor(Math.random() * 90) + 10;
                    const b = Math.floor(Math.random() * 8) + 2;
                    display = `${a} × ${b}`;
                    answer = a * b;
                } else {
                    const b = Math.floor(Math.random() * 8) + 2;
                    const ans = Math.floor(Math.random() * 20) + 5;
                    const a = b * ans;
                    display = `${a} ÷ ${b}`;
                    answer = ans;
                }
                return { question: `${display} = ?`, answer, display, type: '乘除法' };
            }
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

// 专项练习：错字本数据
let smartMistakesPool = [];

// 当前小朋友ID
let currentKidId = localStorage.getItem('currentKidId') || '';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadExpandedQuestions();
    initTypeSelector();
    initDifficultySelector();
    initMathTypeSelector();
    loadKids();
    updatePinyinPoolSize(); // 初始显示拼音题库数量
});

// 加载小朋友列表
async function loadKids() {
    try {
        const res = await fetch(`${API_BASE}/kids`);
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

            // 显示/隐藏数学类型选择器 & 难度选择器
            const mathTypeSelector = document.getElementById('mathTypeSelector');
            const difficultySelector = document.getElementById('difficultySelector');
            const pinyinToolbar = document.getElementById('pinyinToolbar');
            if (mathTypeSelector && difficultySelector) {
                if (currentType === 'math') {
                    mathTypeSelector.classList.remove('hidden');
                    difficultySelector.classList.remove('hidden');
                } else if (currentType === 'smart' || currentType === 'dictation') {
                    // 专项/听写模式：难度由错字本决定，不显示选择器
                    mathTypeSelector.classList.add('hidden');
                    difficultySelector.classList.add('hidden');
                } else {
                    mathTypeSelector.classList.add('hidden');
                    difficultySelector.classList.remove('hidden');
                }
            }
            // 拼音工具栏仅拼音模式显示
            if (pinyinToolbar) {
                pinyinToolbar.style.display = (currentType === 'pinyin') ? 'flex' : 'none';
                if (currentType === 'pinyin') updatePinyinPoolSize();
            }

            updatePracticeTitle();
            resetPractice();
        });
    });
}

// 数学类型选择器
function initMathTypeSelector() {
    document.querySelectorAll('#mathTypeSelector .difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#mathTypeSelector .difficulty-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = '#e0e0e0';
                b.style.color = '#666';
            });
            btn.classList.add('active');
            btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            btn.style.color = 'white';
            window.mathSubType = btn.dataset.mathType;
            resetPractice();
        });
    });
    // 默认选择加减法
    window.mathSubType = 'addsub';
}

// 难度选择器
function initDifficultySelector() {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.level;
            if (currentType === 'pinyin') updatePinyinPoolSize();
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
        english: '英语单词',
        smart: '专项识字',
        dictation: '听写训练'
    };
    document.getElementById('practiceTitle').textContent = titles[currentType] || currentType;
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
async function startPractice() {
    // 专项识字 / 听写：需要先加载错字本
    if (currentType === 'smart' || currentType === 'dictation') {
        if (!currentKidId) {
            document.getElementById('controlArea').innerHTML = `
                <div style="color:#f44336;margin-bottom:12px;">请先在上方选择小朋友</div>
                <button class="btn btn-secondary" onclick="resetPractice()">返回</button>
            `;
            return;
        }
        document.getElementById('controlArea').innerHTML = `<div style="color:#888">⏳ 正在加载错字本...</div>`;
        try {
            const res = await fetch(`${API_BASE}/mistakes/${currentKidId}`);
            const data = await res.json();
            if (data.success) {
                smartMistakesPool = data.data.filter(m => m.status !== 'mastered').sort((a, b) => b.count - a.count);
            }
        } catch (e) {
            smartMistakesPool = [];
        }
    }

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
        case 'smart':
            generateSmartQuestion();
            break;
        case 'dictation':
            generateDictationQuestion();
            break;
    }
}

// 拼音练习临时存储
let pinyinSelectedAnswer = null;
let pinyinSelectedBtn = null;

// 生成拼音题 - 干净界面：只显示拼音+选项
function generatePinyinQuestion() {
    // 加权随机选题（常错词出现概率更高）
    const baseQuestion = weightedSelectPinyinQuestion(currentDifficulty);

    // 构建4个选项（1个正确+3个差异化干扰项）
    const options = generatePinyinOptions(baseQuestion);

    currentQuestion = {
        pinyin: baseQuestion.pinyin,
        correct: baseQuestion.correct,
        options: options
    };

    // 重置选择状态
    pinyinSelectedAnswer = null;
    pinyinSelectedBtn = null;

    // 上方只显示拼音，没有任何提示文字和图片
    document.getElementById('questionText').innerHTML = `
        <div class="pinyin" style="font-size: 4rem; color: #667eea; font-weight: bold;">${currentQuestion.pinyin}</div>
    `;

    const optionsArea = document.getElementById('optionsArea');
    optionsArea.classList.remove('hidden');
    document.getElementById('inputArea').classList.add('hidden');

    // 打乱选项顺序
    const shuffled = [...currentQuestion.options].sort(() => Math.random() - 0.5);

    // 显示4个汉字选项（干净的界面）
    optionsArea.innerHTML = shuffled.map((char) => `
        <button class="option-btn pinyin-option" data-char="${char}" onclick="selectPinyinOption('${char}', this)" style="font-size: 3rem; font-weight: bold;">
            ${char}
        </button>
    `).join('');

    // 显示确认按钮区域
    document.getElementById('controlArea').innerHTML = `
        <button class="btn btn-primary" id="pinyinConfirmBtn" onclick="confirmPinyinAnswer()" disabled style="opacity: 0.5; font-size: 1.2rem; padding: 15px 40px;">
            ✅ 确认选择
        </button>
    `;
}

// 生成差异化的拼音选项（不是同音字，而是完全不同的字）
function generatePinyinOptions(question) {
    const options = [question.correct];
    const correctLen = [...question.correct].length;

    // 先用预设的干扰项
    if (question.wrongOptions && question.wrongOptions.length > 0) {
        options.push(...question.wrongOptions.slice(0, 3));
    }

    // 选项不够4个时，从同难度同字数的其他题目中补充
    if (options.length < 4) {
        const allQuestions = pinyinData[currentDifficulty] || pinyinData.easy;
        const sameLen = allQuestions
            .map(q => q.correct)
            .filter(c => [...c].length === correctLen && !options.includes(c));

        while (options.length < 4 && sameLen.length > 0) {
            const idx = Math.floor(Math.random() * sameLen.length);
            options.push(sameLen.splice(idx, 1)[0]);
        }
    }

    // 仍不够时，从单字库兜底补充
    if (options.length < 4) {
        const charPool = commonChars[currentDifficulty] || commonChars.easy;
        const pool = charPool.filter(c => !options.includes(c));
        while (options.length < 4 && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            options.push(pool.splice(idx, 1)[0]);
        }
    }

    return options.slice(0, 4);
}

// 选择拼音选项（点击发音并选中）
function selectPinyinOption(char, btn) {
    if (isAnswered) return;

    // 播放发音
    speakCharPinyin(char);

    // 记录选择
    pinyinSelectedAnswer = char;
    pinyinSelectedBtn = btn;

    // 移除其他选项的选中状态
    document.querySelectorAll('.pinyin-option').forEach(b => {
        b.style.borderColor = '#e0e0e0';
        b.style.background = 'white';
        b.style.transform = 'scale(1)';
        b.style.boxShadow = 'none';
    });

    // 高亮当前选中的选项
    btn.style.borderColor = '#667eea';
    btn.style.background = '#f5f7ff';
    btn.style.transform = 'scale(1.05)';
    btn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';

    // 启用确认按钮
    const confirmBtn = document.getElementById('pinyinConfirmBtn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
    }
}

// 确认拼音答案
function confirmPinyinAnswer() {
    if (isAnswered || !pinyinSelectedAnswer || !pinyinSelectedBtn) return;
    isAnswered = true;

    const isCorrect = pinyinSelectedAnswer === currentQuestion.correct;
    // 记录答题结果到统计
    recordPinyinResult(currentQuestion.pinyin, currentQuestion.correct, isCorrect);
    const weightKey = currentQuestion.pinyin + '|' + currentQuestion.correct;

    // 显示结果
    if (isCorrect) {
        pinyinSelectedBtn.classList.add('correct');
        correctCount++;
        streakCount++;
        // 答对：权重递减（最低 0）
        if (pinyinWrongWeights[weightKey] > 0) {
            pinyinWrongWeights[weightKey] = Math.max(0, pinyinWrongWeights[weightKey] - 1);
            savePinyinWeights();
        }
        if (streakCount >= 3) {
            showStreakMessage();
        }
        if (window.ZhouYu) ZhouYu.praise();
    } else {
        pinyinSelectedBtn.classList.add('wrong');
        wrongCount++;
        streakCount = 0;
        if (window.ZhouYu) ZhouYu.encourage();
        // 答错：权重增加，下次更容易出现
        pinyinWrongWeights[weightKey] = (pinyinWrongWeights[weightKey] || 0) + 3;
        savePinyinWeights();

        // 高亮正确答案
        document.querySelectorAll('.pinyin-option').forEach(btn => {
            if (btn.dataset.char === currentQuestion.correct) {
                btn.style.borderColor = '#4CAF50';
                btn.style.background = '#E8F5E9';
            }
        });

        // 显示正确答案提示
        document.getElementById('questionText').innerHTML += `
            <div style="color: #4CAF50; font-size: 1.5rem; margin-top: 20px; animation: fadeIn 0.3s;">
                正确答案是 "${currentQuestion.correct}"
            </div>
        `;
    }

    updateStats();

    // 延迟下一题
    setTimeout(() => {
        isAnswered = false;
        nextQuestion();
    }, isCorrect ? 1200 : 2000);
}

// 朗读单个汉字
function speakCharPinyin(char) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(char);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.7;
    utterance.pitch = 1.1;

    const selectAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const voice =
            voices.find(v => v.name.includes('Google') && v.lang.startsWith('zh-CN') && v.name.includes('女')) ||
            voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('zh-CN') && (v.name.includes('女') || v.name.includes('Xiaoxiao') || v.name.includes('Yaoyao'))) ||
            voices.find(v => v.lang.startsWith('zh-CN') && (v.name.includes('女') || v.gender === 'female')) ||
            voices.find(v => v.lang.startsWith('zh-CN')) ||
            voices.find(v => v.lang.startsWith('zh') && !v.lang.startsWith('zh-HK') && !v.lang.startsWith('zh-TW'));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
        selectAndSpeak();
    } else {
        window.speechSynthesis.addEventListener('voiceschanged', selectAndSpeak, { once: true });
    }
}

// 生成数学题
function generateMathQuestion() {
    // 默认使用加减法，如果有mathSubType则使用指定的类型
    const mathType = window.mathSubType || 'addsub';
    currentQuestion = mathData[mathType][currentDifficulty].generate();

    document.getElementById('questionText').innerHTML = `
        <div style="font-size: 1.2rem; color: #667eea; margin-bottom: 10px;">${currentQuestion.type}</div>
        <div style="font-size: 4rem;">${currentQuestion.display} = ?</div>
    `;

    // 显示选项区域，隐藏输入区域
    const optionsArea = document.getElementById('optionsArea');
    optionsArea.classList.remove('hidden');
    document.getElementById('inputArea').classList.add('hidden');

    // 生成4个选项（1个正确答案 + 3个干扰项）
    const correctAnswer = currentQuestion.answer;
    const wrongAnswers = [];

    // 生成干扰项（与正确答案相近的数字）
    while (wrongAnswers.length < 3) {
        const offset = Math.floor(Math.random() * 10) - 5; // -5 到 +4
        const wrong = correctAnswer + offset;
        if (wrong !== correctAnswer && wrong > 0 && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    optionsArea.innerHTML = allOptions.map(opt => `
        <button class="option-btn" onclick="checkMathAnswer(${opt}, this)" style="font-size: 2rem; font-weight: bold;">
            ${opt}
        </button>
    `).join('');
}

// 检查数学答案
function checkMathAnswer(answer, btn) {
    if (isAnswered) return;
    isAnswered = true;

    const isCorrect = answer === currentQuestion.answer;
    handleAnswer(isCorrect, btn);
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
        if (window.ZhouYu) ZhouYu.praise();
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
        if (window.ZhouYu) ZhouYu.encourage();
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

    // 拼音练习：刷新易错词面板 + 结果页显示重点词
    if (currentType === 'pinyin') {
        renderWeakWordsPanel();
        renderResultWeakWords();
    }

    // 保存练习记录到服务器
    savePracticeRecord(score);
}

/** 渲染侧边/下方「我的易错词」面板 */
function renderWeakWordsPanel() {
    const panel = document.getElementById('weakWordsPanel');
    if (!panel) return;
    const list = getWeakWordsList(currentDifficulty);
    if (list.length === 0) {
        panel.innerHTML = '<div style="color:#bbb;font-size:0.85rem;text-align:center;padding:12px;">暂无记录，开始练习后自动统计</div>';
        return;
    }
    panel.innerHTML = list.map(item => {
        const rate = Math.round(item.wrong / item.total * 100);
        const col = rate >= 70 ? '#f44336' : rate >= 40 ? '#FF9800' : '#667eea';
        const heatLevel = rate >= 70 ? '🔥' : rate >= 40 ? '⚠️' : '📌';
        return `
        <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #f5f5f5;">
            <div style="font-size:1.5rem;font-weight:800;color:${col};min-width:44px;text-align:center;">${item.correct}</div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.78rem;color:#667eea;margin-bottom:3px;">${item.pinyin}</div>
                <div style="background:#f0f0f0;border-radius:4px;height:5px;">
                    <div style="height:100%;border-radius:4px;background:${col};width:${rate}%;transition:width 0.6s;"></div>
                </div>
            </div>
            <div style="font-size:0.72rem;color:${col};font-weight:700;text-align:right;white-space:nowrap;">
                ${heatLevel} ${item.wrong}/${item.total}<br>错${rate}%
            </div>
        </div>`;
    }).join('');
}

/** 练习结果页：展示本次最需重点攻克的词 */
function renderResultWeakWords() {
    const resultArea = document.getElementById('resultArea');
    if (!resultArea) return;
    document.getElementById('resultWeakWords')?.remove();
    const list = getWeakWordsList(currentDifficulty, 6);
    if (list.length === 0) return;
    const div = document.createElement('div');
    div.id = 'resultWeakWords';
    div.style.cssText = 'margin-top:16px;background:#fff5f5;border-radius:14px;padding:14px 16px;text-align:left;';
    div.innerHTML = `
        <div style="font-weight:800;color:#f44336;margin-bottom:10px;font-size:0.95rem;">🔥 重点攻克（累计错误率最高）</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${list.map(item => {
                const rate = Math.round(item.wrong / item.total * 100);
                const col = rate >= 70 ? '#f44336' : '#FF9800';
                return `<div style="background:white;border:2px solid ${col};border-radius:10px;padding:6px 12px;text-align:center;">
                    <div style="font-size:1.3rem;font-weight:800;color:${col};">${item.correct}</div>
                    <div style="font-size:0.7rem;color:#888;">${item.pinyin}</div>
                    <div style="font-size:0.68rem;color:${col};font-weight:700;">错${rate}%</div>
                </div>`;
            }).join('')}
        </div>
    `;
    resultArea.appendChild(div);
}

// ==================== 专项识字（A2）====================

function generateSmartQuestion() {
    if (smartMistakesPool.length === 0) {
        document.getElementById('questionText').innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
            <div style="font-size: 1.3rem; color: #667eea; font-weight: 700;">错字本是空的！</div>
            <div style="font-size: 1rem; color: #888; margin-top: 8px;">先去朗读练习积累错字吧</div>
        `;
        document.getElementById('optionsArea').innerHTML = '';
        document.getElementById('inputArea').classList.add('hidden');
        document.getElementById('controlArea').innerHTML = `
            <button class="btn btn-primary" onclick="resetPractice()">返回选择</button>
        `;
        return;
    }

    const idx = Math.floor(Math.random() * Math.min(smartMistakesPool.length, 10));
    const mistake = smartMistakesPool[idx];
    const correct = mistake.char;
    const pinyin = mistake.pinyin || '?';

    const options = [correct];
    const otherChars = smartMistakesPool.map(m => m.char).filter(c => c !== correct && [...c].length === [...correct].length);
    for (const c of otherChars) {
        if (options.length >= 4) break;
        options.push(c);
    }
    // 补充至 4 个
    if (options.length < 4) {
        const pool = [...commonChars.hard, ...commonChars.medium].filter(c => !options.includes(c) && [...c].length === [...correct].length);
        while (options.length < 4 && pool.length > 0) {
            options.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
    }
    // 如果还不够（单字 vs 多字不匹配），用任意字补够
    if (options.length < 4) {
        const fallback = [...commonChars.hard, ...commonChars.medium].filter(c => !options.includes(c));
        while (options.length < 4 && fallback.length > 0) {
            options.push(fallback.splice(Math.floor(Math.random() * fallback.length), 1)[0]);
        }
    }

    currentQuestion = { pinyin, correct, options, mistakeId: mistake.id };
    pinyinSelectedAnswer = null;
    pinyinSelectedBtn = null;

    document.getElementById('questionText').innerHTML = `
        <div class="pinyin" style="font-size: 3.8rem; color: #ff6b6b; font-weight: bold;">${pinyin}</div>
        <div style="font-size: 0.85rem; color: #aaa; margin-top: 6px;">📚 错字专项 · 选出正确的汉字</div>
    `;

    const optionsArea = document.getElementById('optionsArea');
    optionsArea.classList.remove('hidden');
    document.getElementById('inputArea').classList.add('hidden');

    const shuffled = [...options].sort(() => Math.random() - 0.5);
    optionsArea.innerHTML = shuffled.map(char => `
        <button class="option-btn pinyin-option" data-char="${char}"
                onclick="selectPinyinOption('${char}', this)"
                style="font-size: 3rem; font-weight: bold;">
            ${char}
        </button>
    `).join('');

    document.getElementById('controlArea').innerHTML = `
        <button class="btn btn-primary" id="pinyinConfirmBtn" onclick="confirmSmartAnswer()"
                disabled style="opacity:0.5; font-size:1.1rem; padding:14px 36px;">
            ✅ 确认选择
        </button>
    `;
}

function confirmSmartAnswer() {
    if (isAnswered || !pinyinSelectedAnswer || !pinyinSelectedBtn) return;
    isAnswered = true;

    const isCorrect = pinyinSelectedAnswer === currentQuestion.correct;

    if (isCorrect) {
        pinyinSelectedBtn.classList.add('correct');
        correctCount++;
        streakCount++;
        if (streakCount >= 3) showStreakMessage();
    } else {
        pinyinSelectedBtn.classList.add('wrong');
        wrongCount++;
        streakCount = 0;
        document.querySelectorAll('.pinyin-option').forEach(btn => {
            if (btn.dataset.char === currentQuestion.correct) {
                btn.style.borderColor = '#4CAF50';
                btn.style.background = '#E8F5E9';
            }
        });
        document.getElementById('questionText').innerHTML += `
            <div style="color:#4CAF50;font-size:1.5rem;margin-top:15px;">正确答案是「${currentQuestion.correct}」</div>
        `;
    }

    updateStats();
    // 更新复习次数
    if (currentQuestion.mistakeId) {
        fetch(`${API_BASE}/mistakes/${currentQuestion.mistakeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ review_count_increment: 1 })
        }).catch(() => {});
    }

    setTimeout(() => { isAnswered = false; nextQuestion(); }, isCorrect ? 1200 : 2000);
}

// ==================== 听写训练（B3）====================

function generateDictationQuestion() {
    // 题库优先用错字本，否则降级到语文词库
    let pool = [];
    if (smartMistakesPool.length > 0) {
        pool = smartMistakesPool.map(m => ({ char: m.char, pinyin: m.pinyin || '' }));
    } else {
        pool = chineseData[currentDifficulty].map(q => ({ char: q.char, pinyin: q.pinyin }));
    }

    const item = pool[Math.floor(Math.random() * pool.length)];
    currentQuestion = { char: item.char, pinyin: item.pinyin, type: 'dictation' };

    // 自动朗读
    setTimeout(() => speakCharPinyin(item.char), 400);

    document.getElementById('questionText').innerHTML = `
        <div style="font-size: 4.5rem; margin-bottom: 8px; animation: pulse 2s infinite;">🎧</div>
        <div style="font-size: 1.1rem; color: #667eea; font-weight: 700;">仔细听，写出你听到的字</div>
        <button class="btn btn-secondary" onclick="speakCharPinyin('${item.char.replace(/'/g, "\\'")}')"
                style="margin-top:12px; padding:8px 20px; font-size:0.9rem;">
            🔊 再听一遍
        </button>
    `;

    const optionsArea = document.getElementById('optionsArea');
    optionsArea.innerHTML = '';
    optionsArea.classList.add('hidden');

    const inputArea = document.getElementById('inputArea');
    inputArea.classList.remove('hidden');
    inputArea.innerHTML = `
        <input type="text" id="dictationInput"
               placeholder="写字…"
               maxlength="6"
               style="font-size:2.5rem; text-align:center; width:160px; padding:14px;
                      border:3px solid #e0e0e0; border-radius:15px; font-family:inherit;
                      outline:none; transition:border-color 0.2s;">
        <button class="btn btn-primary" onclick="checkDictationAnswer()" style="font-size:1rem;">确认</button>
    `;

    document.getElementById('controlArea').innerHTML = `
        <button class="btn btn-secondary" onclick="resetPractice()">结束练习</button>
    `;

    setTimeout(() => {
        const input = document.getElementById('dictationInput');
        if (input) {
            input.focus();
            input.addEventListener('keydown', e => { if (e.key === 'Enter') checkDictationAnswer(); });
        }
    }, 100);
}

function checkDictationAnswer() {
    if (isAnswered) return;
    const input = document.getElementById('dictationInput');
    if (!input) return;
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    isAnswered = true;

    const isCorrect = answer === currentQuestion.char;

    if (isCorrect) {
        correctCount++;
        streakCount++;
        if (streakCount >= 3) showStreakMessage();
        input.style.borderColor = '#4CAF50';
        input.style.background = '#E8F5E9';
        showEncouragement('✅ 写对了！');
    } else {
        wrongCount++;
        streakCount = 0;
        input.style.borderColor = '#f44336';
        input.style.background = '#FFEBEE';
        document.getElementById('questionText').innerHTML += `
            <div style="color:#4CAF50; font-size:2.2rem; margin-top:14px; font-weight:bold;">
                正确：${currentQuestion.char}
            </div>
            <div style="color:#888; font-size:1rem;">${currentQuestion.pinyin}</div>
        `;
        speakCharPinyin(currentQuestion.char);
    }

    updateStats();
    setTimeout(() => { isAnswered = false; nextQuestion(); }, isCorrect ? 1000 : 2200);
}

// 保存练习记录
function savePracticeRecord(score) {
    const kidId = localStorage.getItem('currentKidId');
    if (!kidId) return;

    const subjectMap = {
        pinyin: 1,    // 语文
        math: 2,      // 数学
        chinese: 1,   // 语文
        english: 3,   // 英语
        smart: 1,     // 语文
        dictation: 1  // 语文
    };

    fetch(`${API_BASE}/records`, {
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

// 朗读拼音
function speakPinyin(pinyin) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(pinyin);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;

    const selectAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const voice =
            voices.find(v => v.name.includes('Google') && v.lang.startsWith('zh-CN') && v.name.includes('女')) ||
            voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('zh-CN') && (v.name.includes('女') || v.name.includes('Xiaoxiao') || v.name.includes('Yaoyao'))) ||
            voices.find(v => v.lang.startsWith('zh-CN') && (v.name.includes('女') || v.gender === 'female')) ||
            voices.find(v => v.lang.startsWith('zh-CN')) ||
            voices.find(v => v.lang.startsWith('zh') && !v.lang.startsWith('zh-HK') && !v.lang.startsWith('zh-TW'));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
        selectAndSpeak();
    } else {
        window.speechSynthesis.addEventListener('voiceschanged', selectAndSpeak, { once: true });
    }
}
