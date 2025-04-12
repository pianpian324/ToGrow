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
 * POST /api/diaries/{plantingId}/logs
 * Path Param: plantingId
 * Body: { content, imageUrl } (userId should be from auth)
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    const plantingId = event.pathParameters?.plantingId; // 从路径参数获取 plantingId
    // !! 注意：实际 userId 应从认证信息获取
    const userId = event.requestContext?.identity?.cognitoIdentityId || event.headers?.['x-user-id'] || 'test-user'; // 示例: 尝试从不同地方获取用户ID

    if (!plantingId) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: '缺少必要参数: plantingId' })
        };
    }

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

    const { content, imageUrl } = requestBody;
    if (!content) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: '缺少必要参数: content' })
        };
    }

    let pool;
    try {
        pool = createPool();
        
        // 首先检查日记是否存在
        const [diaries] = await pool.execute(
            'SELECT * FROM diaries WHERE id = ? AND userId = ?',
            [plantingId, userId]
        );
        
        if (diaries.length === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: '未找到指定的种植日记' })
            };
        }
        
        // 检查日记状态是否为活跃
        if (diaries[0].status !== 'active') {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: '该种植日记已完成，无法添加新日志' })
            };
        }
        
        // 添加新的日志
        const now = new Date();
        const [result] = await pool.execute(
            `INSERT INTO diary_logs (diaryId, date, content, imageUrl) 
             VALUES (?, ?, ?, ?)`,
            [plantingId, now, content, imageUrl || null]
        );
        
        // 获取插入的日志ID
        const logId = result.insertId;
        
        // 查询刚创建的日志
        const [logs] = await pool.execute(
            `SELECT * FROM diary_logs WHERE id = ?`,
            [logId]
        );
        
        if (logs.length === 0) {
            throw new Error('Failed to retrieve created log');
        }
        
        // 格式化日期
        const log = {
            ...logs[0],
            id: logs[0].id.toString(),
            date: logs[0].date.toISOString(),
            createdAt: logs[0].createdAt.toISOString()
        };
        
        // 更新日记的更新时间
        await pool.execute(
            `UPDATE diaries SET updatedAt = ? WHERE id = ? AND userId = ?`,
            [now, plantingId, userId]
        );
        
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(log)
        };
    } catch (error) {
        console.error('Error adding diary log:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error adding diary log' })
        };
    } finally {
        if (pool) {
            await pool.end();
        }
    }
};
