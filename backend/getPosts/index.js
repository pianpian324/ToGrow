'use strict';

const { MongoClient } = require('mongodb');

// !! 注意：请将下面的连接字符串替换为您的 TencentDB for MongoDB 连接地址 !!
const uri = process.env.MONGODB_URI || "mongodb://username:password@host:port/database?authSource=admin";
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client.db();
    } catch (e) {
        console.error("Could not connect to MongoDB", e);
        process.exit(1);
    }
}

let db;

/**
 * 云函数入口
 * GET /api/getPosts
 * (可添加分页参数如 ?limit=10&skip=0)
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    // 简单分页示例 (可选)
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const skip = parseInt(event.queryStringParameters?.skip || '0');

    if (!db) {
        db = await connectDB();
    }

    try {
        const postsCollection = db.collection('posts'); // 假设帖子存储在 'posts' collection

        // 查询帖子，按创建时间倒序
        const posts = await postsCollection.find({})
                                       .sort({ createdAt: -1 }) // 按创建时间降序
                                       .skip(skip)
                                       .limit(limit)
                                       .toArray();

        console.log(`Found ${posts.length} posts (limit: ${limit}, skip: ${skip})`);

        // 将 _id 转换为字符串 id
        const formattedPosts = posts.map(p => ({ ...p, id: p._id.toString(), _id: undefined }));

        // (可选) 获取总帖子数用于分页
        // const totalPosts = await postsCollection.countDocuments();

        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            // body: JSON.stringify({ posts: formattedPosts, total: totalPosts }) // 如果需要返回总数
            body: JSON.stringify(formattedPosts)
        };

    } catch (error) {
        console.error('Error fetching posts:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error fetching posts' })
        };
    }
};
