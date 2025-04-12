'use strict';

const { MongoClient } = require('mongodb');

// !! 注意：请将下面的连接字符串替换为您的 TencentDB for MongoDB 连接地址 !!
const uri = process.env.MONGODB_URI || "mongodb://username:password@host:port/database?authSource=admin"; // 从环境变量或配置中读取
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client.db(); // 返回数据库实例
    } catch (e) {
        console.error("Could not connect to MongoDB", e);
        // 在实际应用中，这里应该有更健壮的错误处理和重试逻辑
        process.exit(1); // 或者抛出异常，让云函数调用失败
    }
}

let db;

/**
 * 云函数入口
 * GET /api/plantGuides?term=<solarTerm>
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    const solarTerm = event.queryStringParameters?.term;

    if (!solarTerm) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing required query parameter: term' })
        };
    }

    if (!db) {
        db = await connectDB();
    }

    try {
        const plantsCollection = db.collection('plants');

        // 根据节气查询适合的植物，按难度排序，限制数量
        const plants = await plantsCollection.find({
            suitableSeason: { $in: [solarTerm] } // 假设 suitableSeason 是一个包含节气的数组
        }).sort({ difficulty: 1 }) // 按难度升序
          .limit(6) // 限制返回6个
          .toArray();

        console.log(`Found ${plants.length} plants for term: ${solarTerm}`);

        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(plants)
        };

    } catch (error) {
        console.error('Error fetching plant guides:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error fetching plant guides' })
        };
    } 
    // 注意：在生产环境中，数据库连接的管理需要更精细，
    // 例如使用连接池或在函数执行完毕后显式关闭连接 (client.close())，
    // 但云函数的生命周期管理可能有所不同，需要根据实际情况调整。
};
