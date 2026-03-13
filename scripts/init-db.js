const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });

    try {
        console.log('🔄 正在初始化数据库...');

        // 读取SQL文件
        const sqlFile = path.join(__dirname, '..', 'database.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        // 分割SQL语句并执行
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }

        console.log('✅ 数据库初始化成功！');
        console.log('📊 已创建以下表:');
        console.log('   - kids (小朋友信息)');
        console.log('   - subjects (学习科目)');
        console.log('   - learning_records (学习记录)');
        console.log('   - achievements (成就奖励)');
        console.log('   - points (积分记录)');
        console.log('   - kid_learning_stats (统计视图)');
        console.log('   - daily_learning_summary (每日汇总视图)');

    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
    } finally {
        await connection.end();
    }
}

initDatabase();
