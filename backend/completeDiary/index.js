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
 * PATCH /api/diaries/{plantingId}
 * Path Param: plantingId
 * Body: { completed: true } (Though we only care about the action itself)
 * (userId should be from auth)
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    const plantingId = event.pathParameters?.plantingId; // 从路径参数获取 plantingId
    // !! 注意：实际 userId 应从认证信息获取
    const userId = event.requestContext?.identity?.cognitoIdentityId || event.headers?.['x-user-id'] || 'test-user'; // 示例

    if (!plantingId) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing path parameter: plantingId' })
        };
    }

    let diaryObjectId;
    try {
        diaryObjectId = new ObjectId(plantingId);
    } catch (e) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Invalid plantingId format' })
        };
    }

    if (!db) {
        db = await connectDB();
    }

    try {
        const diariesCollection = db.collection('diaries');

        // 更新日记状态为已完成，并记录完成时间
        // 同样需要验证 userId
        const result = await diariesCollection.updateOne(
            { _id: diaryObjectId, userId: userId }, // 查询条件：匹配日记ID和用户ID
            {
                $set: {
                    completed: true,
                    completionDate: new Date() // 记录完成时间
                }
            }
        );

        if (result.matchedCount === 0) {
             return {
                statusCode: 404, // 或 403 Forbidden
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: 'Diary not found or user not authorized' })
            };
        }
        // 如果 matchedCount > 0 但 modifiedCount === 0，说明文档已是完成状态
        if (result.modifiedCount === 0 && result.matchedCount > 0) {
             console.log(`Diary ${plantingId} was already marked as completed.`);
             // 仍然可以返回成功，因为目标状态已达成
              return {
                isBase64Encoded: false,
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: 'Diary already marked as completed' })
             };
        }
        if (result.modifiedCount === 0) {
            console.warn(`Diary ${plantingId} matched but not modified (unexpected).`);
             return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: 'Failed to mark diary as completed, diary matched but not modified.' })
            };
        }

        console.log(`Diary marked as complete: ${plantingId}`);

        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Diary marked as completed successfully' })
        };

    } catch (error) {
        console.error('Error completing diary:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error completing diary' })
        };
    }
};
