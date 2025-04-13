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
 * POST /api/createPost
 * Body: { authorId, authorName, authorAvatar, content, image } 
 * (userId, Name, Avatar should be from auth in production)
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    let requestBody;

    try {
        requestBody = JSON.parse(event.body || '{}');
    } catch (e) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Invalid JSON in request body' })
        };
    }

    // !! 注意：实际应用中 authorId, authorName, authorAvatar 应从认证信息获取
    // 这里为了与前端的简单实现匹配，暂时从请求体获取
    const { authorId, authorName, authorAvatar, content, image } = requestBody;

    if (!authorId || !content) { // 至少需要 authorId 和 content
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing required fields: authorId, content' })
        };
    }

    if (!db) {
        db = await connectDB();
    }

    try {
        const postsCollection = db.collection('posts');

        const newPost = {
            authorId: authorId,
            authorName: authorName || '匿名用户', // 提供默认值
            authorAvatar: authorAvatar || 'default-avatar.png', // 提供默认值
            content: content,
            image: image || '', // 图片 URL，可选
            likes: 0, // 初始点赞数
            comments: [], // 初始化空评论数组
            createdAt: new Date() // 记录创建时间
        };

        const result = await postsCollection.insertOne(newPost);
        console.log(`New post created with id: ${result.insertedId}`);

        // 将 _id 转换为字符串 id 返回给前端
        const createdPost = { ...newPost, id: result.insertedId.toString(), _id: undefined };

        return {
            isBase64Encoded: false,
            statusCode: 201, // 201 Created
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            // 返回创建的帖子信息，前端可能需要用来立即显示
            body: JSON.stringify({ message: 'Post created successfully', post: createdPost })
        };

    } catch (error) {
        console.error('Error creating post:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error creating post' })
        };
    }
};
