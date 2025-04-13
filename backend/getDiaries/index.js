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
 * GET /api/diaries?userId=<userId>
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    // !! 注意：实际应用中需要从认证信息（如 CIAM Token 解析后）获取 userId，而不是直接从 query string 获取
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing required query parameter: userId (or authentication required)' })
        };
    }

    let pool;
    try {
        pool = createPool();
        
        // 查询特定用户的日记，按开始日期降序排序
        const [rows] = await pool.execute(
            `SELECT * FROM diaries WHERE userId = ? ORDER BY startDate DESC`,
            [userId]
        );
        
        // 将日期对象转换为ISO字符串，以便前端处理
        const formattedDiaries = rows.map(d => ({ 
            ...d, 
            id: d.id.toString(), 
            startDate: d.startDate.toISOString(), 
            createdAt: d.createdAt.toISOString(), 
            updatedAt: d.updatedAt.toISOString(), 
            completedDate: d.completedDate ? d.completedDate.toISOString() : null 
        }));
        
        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(formattedDiaries)
        };
    } catch (error) {
        console.error('Error fetching diaries:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error fetching diaries' })
        };
    } finally {
        if (pool) {
            // 结束连接池 (在实际的Express应用中不需要这样做，因为连接池会被重用)
            // 但在云函数环境中，应该在函数结束时释放资源
            await pool.end();
        }
    }
};
