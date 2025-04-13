'use strict';

const mysql = require('mysql2/promise');

// 创建MySQL连接池
const createPool = () => {
  return mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'togrow',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

/**
 * 云函数入口
 * POST /api/createDiary
 * Body: { userId, plantId, plantName }
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    let requestBody;

    try {
        // 解析请求体
        if (typeof event.body === 'string') {
            requestBody = JSON.parse(event.body);
        } else {
            requestBody = event.body;
        }
    } catch (error) {
        console.error("Error parsing request body:", error);
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Invalid request body' })
        };
    }

    const { userId, plantId, plantName } = requestBody;

    if (!userId || !plantName) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: '缺少必要参数: userId, plantName' })
        };
    }

    let pool;
    try {
        pool = createPool();
        
        // 创建新的种植日记
        const startDate = new Date();
        
        const [result] = await pool.execute(
            `INSERT INTO diaries (userId, plantId, plantName, startDate, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, plantId || null, plantName, startDate, 'active']
        );
        
        // 获取插入的日记ID
        const diaryId = result.insertId;
        
        // 查询刚创建的日记
        const [rows] = await pool.execute(
            `SELECT * FROM diaries WHERE id = ?`,
            [diaryId]
        );
        
        if (rows.length === 0) {
            throw new Error('Failed to retrieve created diary');
        }
        
        // 格式化日期
        const diary = {
            ...rows[0],
            id: rows[0].id.toString(),
            startDate: rows[0].startDate.toISOString(),
            createdAt: rows[0].createdAt.toISOString(),
            updatedAt: rows[0].updatedAt.toISOString(),
            completedDate: rows[0].completedDate ? rows[0].completedDate.toISOString() : null
        };

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(diary)
        };
    } catch (error) {
        console.error('Error creating diary:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error creating diary' })
        };
    } finally {
        if (pool) {
            await pool.end();
        }
    }
};
