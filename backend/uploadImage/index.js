'use strict';

// 注意：实际部署时，需要安装 cos-nodejs-sdk-v5 依赖
// npm install cos-nodejs-sdk-v5
const COS = require('cos-nodejs-sdk-v5');
const { v4: uuidv4 } = require('uuid');

// 初始化 COS 实例
// 实际部署时，这些密钥应通过环境变量或密钥管理服务提供
const cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
});

// 存储桶配置
const Bucket = process.env.COS_BUCKET || 'togrow-1234567890';
const Region = process.env.COS_REGION || 'ap-guangzhou';

/**
 * 云函数入口
 * POST /api/upload
 * Body: { image: base64EncodedImage, type: 'diary' | 'post' | 'avatar' }
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    
    // 获取用户ID (在实际应用中应从认证信息获取)
    const userId = event.requestContext?.identity?.cognitoIdentityId || 
                  event.headers?.['x-user-id'] || 
                  'test-user';
    
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
    
    const { image, type } = requestBody;
    
    if (!image) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing required field: image' })
        };
    }
    
    if (!type || !['diary', 'post', 'avatar'].includes(type)) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Invalid or missing type: must be diary, post, or avatar' })
        };
    }
    
    // 从 Base64 编码的数据中提取实际的图片数据和 MIME 类型
    let base64Data, mimeType;
    try {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image format');
        }
        mimeType = matches[1];
        base64Data = matches[2];
    } catch (e) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Invalid base64 image format' })
        };
    }
    
    // 将 Base64 数据转换为 Buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 根据 MIME 类型确定文件扩展名
    let extension;
    switch (mimeType) {
        case 'image/jpeg':
        case 'image/jpg':
            extension = 'jpg';
            break;
        case 'image/png':
            extension = 'png';
            break;
        case 'image/gif':
            extension = 'gif';
            break;
        case 'image/webp':
            extension = 'webp';
            break;
        default:
            extension = 'jpg'; // 默认扩展名
    }
    
    // 确定存储路径
    let directory;
    switch (type) {
        case 'diary':
            directory = 'diary-images/';
            break;
        case 'post':
            directory = 'post-images/';
            break;
        case 'avatar':
            directory = 'avatars/';
            break;
    }
    
    // 生成唯一文件名
    const filename = `${userId}_${uuidv4()}.${extension}`;
    const key = `${directory}${filename}`;
    
    try {
        // 上传到腾讯云对象存储
        const result = await cos.putObject({
            Bucket,
            Region,
            Key: key,
            Body: buffer,
            ContentType: mimeType
        });
        
        console.log('Upload success:', result);
        
        // 构建图片 URL
        const imageUrl = `https://${Bucket}.cos.${Region}.myqcloud.com/${key}`;
        
        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
                message: 'Image uploaded successfully',
                imageUrl: imageUrl
            })
        };
        
    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Internal server error uploading image' })
        };
    }
};
