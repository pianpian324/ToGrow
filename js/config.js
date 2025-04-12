/**
 * ToGrow 应用配置
 * 
 * 此文件包含应用的配置信息，包括API端点和其他设置
 * 部署到生产环境时，请更新 API_BASE_URL 为您的腾讯云API网关URL
 */

const config = {
    // API 基础URL
    // 开发环境使用本地服务器
    // 生产环境使用腾讯云API网关URL，格式如：
    // https://[您的API网关服务ID].gz.apigw.tencentcs.com
    API_BASE_URL: 'http://localhost:3000',
    
    // API 端点
    API_ENDPOINTS: {
        // 节气和植物指南
        GET_SOLAR_TERM: '/api/getSolarTerm',
        PLANT_GUIDES: '/api/plantGuides',
        
        // 种植日记
        GET_DIARIES: '/api/diaries',
        CREATE_DIARY: '/api/createDiary',
        ADD_DIARY_LOG: (plantingId) => `/api/diaries/${plantingId}/logs`,
        COMPLETE_DIARY: (plantingId) => `/api/diaries/${plantingId}`,
        
        // 社区
        GET_POSTS: '/api/getPosts',
        CREATE_POST: '/api/createPost',
        LIKE_POST: (postId) => `/api/posts/${postId}/like`,
        ADD_COMMENT: (postId) => `/api/posts/${postId}/comments`,
        
        // 图片上传
        UPLOAD_IMAGE: '/api/upload'
    },
    
    // 默认用户信息 (仅用于演示)
    DEFAULT_USER: {
        id: 'test-user',
        name: '园丁小明',
        avatar: 'images/default-avatar.png'
    },
    
    // 其他配置
    ITEMS_PER_PAGE: 10,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// 导出配置
export default config;
