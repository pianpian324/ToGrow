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
 * POST /api/posts/{postId}/comments
 * Path Param: postId
 * Body: { authorId, authorName, authorAvatar, content }
 * (Author info should ideally be from auth)
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    const postId = event.pathParameters?.postId;

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
    const { authorId, authorName, authorAvatar, content } = requestBody;

    if (!postId) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing path parameter: postId' })
        };
    }
    if (!authorId || !content) { // 至少需要 authorId 和 content
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing required fields: authorId, content' })
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

        const newComment = {
            _id: new ObjectId(), // 为评论生成唯一 ID
            authorId: authorId,
            authorName: authorName || '匿名用户',
            authorAvatar: authorAvatar || 'default-avatar.png',
            content: content,
            createdAt: new Date()
        };

        // 使用 $push 将新评论添加到 comments 数组
        const result = await postsCollection.updateOne(
            { _id: postObjectId }, // 查询条件：匹配帖子ID
            { $push: { comments: newComment } } // 更新操作：向 comments 数组添加元素
        );

        if (result.matchedCount === 0) {
             return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: 'Post not found' })
            };
        }
         if (result.modifiedCount === 0) {
            // 理论上匹配到了就应该能修改
            console.warn(`Post ${postId} matched but comments not modified.`);
             return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: 'Failed to add comment, post matched but not modified.' })
            };
        }

        console.log(`Comment added to post: ${postId}`);

        // 返回添加的评论信息，前端可能需要
        const addedComment = { ...newComment, id: newComment._id.toString(), _id: undefined };

        return {
            isBase64Encoded: false,
            statusCode: 201, // 201 Created (或者 200 OK)
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Comment added successfully', comment: addedComment })
        };

    } catch (error) {
        console.error('Error adding comment:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error adding comment' })
        };
    }
};
