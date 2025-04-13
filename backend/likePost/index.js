'use strict';

const { MongoClient, ObjectId } = require('mongodb');

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
 * POST /api/posts/{postId}/like
 * Path Param: postId
 * (userId for tracking 'who liked' might be needed in a real app)
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    const postId = event.pathParameters?.postId;
    // !! 注意：实际应用可能需要 userId (从认证获取) 来防止重复点赞或记录点赞者
    // const userId = event.requestContext?.identity?.cognitoIdentityId || 'test-user';

    if (!postId) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing path parameter: postId' })
        };
    }

    let postObjectId;
    try {
        postObjectId = new ObjectId(postId);
    } catch (e) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Invalid postId format' })
        };
    }

    if (!db) {
        db = await connectDB();
    }

    try {
        const postsCollection = db.collection('posts');

        // 使用 $inc 原子地增加 likes 计数
        const result = await postsCollection.updateOne(
            { _id: postObjectId }, // 查询条件：匹配帖子ID
            { $inc: { likes: 1 } } // 更新操作：将 likes 字段增加 1
        );

        if (result.matchedCount === 0) {
             return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: 'Post not found' })
            };
        }

        // matchedCount > 0 就算成功，即使 modifiedCount 是 0 (可能因为并发或其他原因没有实际增加，但操作是尝试了)
        console.log(`Like incremented for post: ${postId}`);

        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Post liked successfully' })
        };

    } catch (error) {
        console.error('Error liking post:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error liking post' })
        };
    }
};
