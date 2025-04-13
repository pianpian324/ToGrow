/**
 * 腾讯云部署配置
 * 
 * 此文件包含腾讯云服务的配置信息
 * 注意：实际部署时，敏感信息（如密钥）应通过环境变量或密钥管理服务提供，而不是硬编码
 */

module.exports = {
  // 云函数(SCF)配置
  scf: {
    region: 'ap-guangzhou', // 默认区域：广州
    runtime: 'Nodejs12.16', // 运行时
    timeout: 30, // 超时时间(秒)
    memorySize: 128, // 内存大小(MB)
  },
  
  // API网关配置
  apiGateway: {
    name: 'togrow-api', // API网关名称
    protocol: 'https', // 协议
    environment: 'release', // 发布环境
    endpoints: [
      { path: '/api/getSolarTerm', method: 'GET', function: 'getSolarTerm' },
      { path: '/api/plantGuides', method: 'GET', function: 'plantGuides' },
      { path: '/api/diaries', method: 'GET', function: 'getDiaries' },
      { path: '/api/createDiary', method: 'POST', function: 'createDiary' },
      { path: '/api/diaries/{plantingId}/logs', method: 'POST', function: 'addDiaryLog' },
      { path: '/api/diaries/{plantingId}', method: 'PATCH', function: 'completeDiary' },
      { path: '/api/getPosts', method: 'GET', function: 'getPosts' },
      { path: '/api/createPost', method: 'POST', function: 'createPost' },
      { path: '/api/posts/{postId}/like', method: 'POST', function: 'likePost' },
      { path: '/api/posts/{postId}/comments', method: 'POST', function: 'addComment' }
    ]
  },
  
  // MongoDB配置
  mongodb: {
    connectionStringEnv: 'MONGODB_URI', // 环境变量名
    database: 'togrow', // 数据库名
    collections: {
      plants: 'plants', // 植物指南集合
      diaries: 'diaries', // 种植日记集合
      posts: 'posts' // 社区帖子集合
    }
  },
  
  // 对象存储(COS)配置
  cos: {
    bucket: 'togrow-1234567890', // 存储桶名称，需要全局唯一
    region: 'ap-guangzhou', // 区域
    directory: {
      diaryImages: 'diary-images/', // 日记图片目录
      postImages: 'post-images/', // 帖子图片目录
      avatars: 'avatars/' // 用户头像目录
    }
  },
  
  // 用户认证(CIAM)配置
  auth: {
    region: 'ap-guangzhou',
    appId: 'your-app-id', // 应用ID
    appSecret: 'your-app-secret' // 应用密钥
  }
};
