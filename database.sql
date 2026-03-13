-- 小朋友学习记录系统数据库设计
-- 可以直接导入 MySQL 数据库

-- 创建数据库
CREATE DATABASE IF NOT EXISTS kids_learning DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kids_learning;

-- 1. 小朋友信息表
CREATE TABLE IF NOT EXISTS kids (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '小朋友姓名',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    birth_date DATE COMMENT '出生日期',
    grade VARCHAR(20) COMMENT '年级',
    favorite_color VARCHAR(20) DEFAULT '#FFD93D' COMMENT '喜欢的颜色（用于UI个性化）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小朋友信息表';

-- 2. 学习科目/类别表
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '科目名称',
    icon VARCHAR(50) COMMENT '图标emoji或类名',
    color VARCHAR(20) DEFAULT '#4ECDC4' COMMENT '科目颜色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习科目表';

-- 3. 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kid_id INT NOT NULL COMMENT '小朋友ID',
    subject_id INT NOT NULL COMMENT '科目ID',
    learning_date DATE NOT NULL COMMENT '学习日期',
    duration INT COMMENT '学习时长（分钟）',
    content TEXT COMMENT '学习内容描述',
    performance INT DEFAULT 3 COMMENT '表现评分 1-5星',
    notes TEXT COMMENT '家长/老师备注',
    mood VARCHAR(20) COMMENT '心情 emoji',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习记录表';

-- 4. 成就/奖励表
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kid_id INT NOT NULL COMMENT '小朋友ID',
    title VARCHAR(100) NOT NULL COMMENT '成就标题',
    description TEXT COMMENT '成就描述',
    badge_icon VARCHAR(50) COMMENT '徽章图标',
    earned_at DATE COMMENT '获得日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就奖励表';

-- 5. 积分记录表
CREATE TABLE IF NOT EXISTS points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kid_id INT NOT NULL COMMENT '小朋友ID',
    points INT NOT NULL COMMENT '积分变动（正数为获得，负数为消耗）',
    reason VARCHAR(200) COMMENT '积分变动原因',
    record_type ENUM('earn', 'spend') NOT NULL COMMENT '类型：获得或消耗',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分记录表';

-- 插入示例数据

-- 示例小朋友
INSERT INTO kids (name, nickname, birth_date, grade, favorite_color) VALUES
('小明', '明明', '2016-05-15', '一年级', '#FF6B6B'),
('小红', '红红', '2015-08-20', '二年级', '#4ECDC4');

-- 学习科目
INSERT INTO subjects (name, icon, color, sort_order) VALUES
('语文', '📚', '#FF6B6B', 1),
('数学', '🔢', '#4ECDC4', 2),
('英语', '🔤', '#45B7D1', 3),
('科学', '🔬', '#96CEB4', 4),
('美术', '🎨', '#FFEAA7', 5),
('音乐', '🎵', '#DDA0DD', 6),
('体育', '⚽', '#98D8C8', 7),
('阅读', '📖', '#F7DC6F', 8);

-- 示例学习记录
INSERT INTO learning_records (kid_id, subject_id, learning_date, duration, content, performance, mood, notes) VALUES
(1, 1, '2026-03-12', 30, '学习拼音 a o e', 5, '😊', '掌握得很好'),
(1, 2, '2026-03-12', 20, '10以内加减法练习', 4, '😄', '需要加强减法练习'),
(1, 5, '2026-03-12', 45, '画了一幅春天的画', 5, '🥰', '很有创意'),
(1, 8, '2026-03-11', 30, '阅读《小王子》', 5, '😊', '很喜欢这个故事'),
(2, 1, '2026-03-12', 40, '课文朗读与背诵', 5, '😄', '朗读流利'),
(2, 2, '2026-03-12', 35, '乘法口诀表学习', 4, '🤔', '口诀还需要多背诵');

-- 示例成就
INSERT INTO achievements (kid_id, title, description, badge_icon, earned_at) VALUES
(1, '学习小达人', '连续7天坚持学习', '🏆', '2026-03-12'),
(1, '阅读之星', '累计阅读10本书', '📚', '2026-03-10'),
(2, '数学小天才', '数学测试满分', '🥇', '2026-03-08');

-- 示例积分记录
INSERT INTO points (kid_id, points, reason, record_type) VALUES
(1, 50, '完成今日学习计划', 'earn'),
(1, 20, '帮助整理书包', 'earn'),
(1, -30, '兑换小贴纸', 'spend'),
(2, 60, '完成今日学习计划', 'earn'),
(2, 10, '主动做家务', 'earn');

-- 创建视图：小朋友学习统计
CREATE VIEW kid_learning_stats AS
SELECT
    k.id AS kid_id,
    k.name AS kid_name,
    k.nickname,
    COUNT(DISTINCT lr.id) AS total_records,
    SUM(lr.duration) AS total_minutes,
    ROUND(AVG(lr.performance), 1) AS avg_performance,
    COUNT(DISTINCT a.id) AS total_achievements,
    COALESCE(SUM(p.points), 0) AS total_points
FROM kids k
LEFT JOIN learning_records lr ON k.id = lr.kid_id
LEFT JOIN achievements a ON k.id = a.kid_id
LEFT JOIN points p ON k.id = p.kid_id
GROUP BY k.id, k.name, k.nickname;

-- 创建视图：每日学习汇总
CREATE VIEW daily_learning_summary AS
SELECT
    lr.learning_date,
    k.name AS kid_name,
    COUNT(*) AS subject_count,
    SUM(lr.duration) AS total_duration,
    ROUND(AVG(lr.performance), 1) AS avg_performance
FROM learning_records lr
JOIN kids k ON lr.kid_id = k.id
GROUP BY lr.learning_date, k.id, k.name
ORDER BY lr.learning_date DESC;
