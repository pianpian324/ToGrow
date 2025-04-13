# ToGrow 应用部署指南 (基于腾讯云 CNB)

本文档提供了将 ToGrow 应用后端部署到腾讯云的详细步骤，主要使用腾讯云 CNB (Cloud Native Blending) 服务进行部署。

## 先决条件

1. 拥有腾讯云账号并完成实名认证
2. 开通以下腾讯云服务：
   - 腾讯云 CNB (Cloud Native Blending)
   - 云数据库 MySQL（可使用试用版）
   - 对象存储 COS（用于存储图片，可选）
   - CIAM (客户身份与访问管理，用于用户认证)

## 1. 配置云数据库 MySQL

### 1.1 创建 MySQL 实例

1. 登录腾讯云控制台，进入云数据库 MySQL
2. 点击"新建"，选择合适的配置：
   - 计费模式：按量计费（开发测试阶段推荐）或试用版（如有资格）
   - 地域：选择与您的应用相同的地域（如广州）
   - 网络类型：VPC（推荐）
   - 规格配置：2核4GB 或根据需求选择
   - 存储空间：50GB（根据需求调整）
3. 设置管理员密码并完成创建

### 1.2 初始化数据库

1. 在 MySQL 实例创建完成后，获取连接信息
2. 使用 MySQL Workbench 或其他工具连接到 MySQL 实例
3. 创建名为 `togrow` 的数据库：
   ```sql
   CREATE DATABASE togrow;
   USE togrow;
   ```
4. 在该数据库中创建以下表（tables）：

   ```sql
   -- 植物指南表
   CREATE TABLE plants (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     description TEXT,
     difficulty INT,
     suitableSeason JSON,
     imageUrl VARCHAR(255)
   );

   -- 用户种植日记表
   CREATE TABLE diaries (
     id INT AUTO_INCREMENT PRIMARY KEY,
     userId VARCHAR(100) NOT NULL,
     plantId INT,
     plantName VARCHAR(100) NOT NULL,
     startDate DATETIME NOT NULL,
     status VARCHAR(20) DEFAULT 'active',
     completedDate DATETIME,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (plantId) REFERENCES plants(id) ON DELETE SET NULL
   );

   -- 种植日记日志表
   CREATE TABLE diary_logs (
     id INT AUTO_INCREMENT PRIMARY KEY,
     diaryId INT NOT NULL,
     date DATETIME NOT NULL,
     content TEXT,
     imageUrl VARCHAR(255),
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (diaryId) REFERENCES diaries(id) ON DELETE CASCADE
   );

   -- 社区帖子表
   CREATE TABLE posts (
     id INT AUTO_INCREMENT PRIMARY KEY,
     userId VARCHAR(100) NOT NULL,
     userName VARCHAR(100) NOT NULL,
     userAvatar VARCHAR(255),
     content TEXT NOT NULL,
     imageUrl VARCHAR(255),
     likeCount INT DEFAULT 0,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   -- 帖子评论表
   CREATE TABLE comments (
     id INT AUTO_INCREMENT PRIMARY KEY,
     postId INT NOT NULL,
     userId VARCHAR(100) NOT NULL,
     userName VARCHAR(100) NOT NULL,
     content TEXT NOT NULL,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
   );

   -- 帖子点赞表
   CREATE TABLE post_likes (
     id INT AUTO_INCREMENT PRIMARY KEY,
     postId INT NOT NULL,
     userId VARCHAR(100) NOT NULL,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     UNIQUE KEY (postId, userId),
     FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
   );
   ```

### 1.3 导入初始数据（可选）

可以导入一些初始的植物指南数据到 `plants` 表中：

1. 准备植物指南数据的 SQL 插入语句，例如：
   ```sql
   INSERT INTO plants (name, description, difficulty, suitableSeason, imageUrl) VALUES
   ('番茄', '喜温暖、阳光充足环境，适合阳台种植。', 2, '["春分", "清明", "谷雨"]', 'https://example.com/tomato.jpg'),
   ('生菜', '喜凉爽环境，生长周期短，适合新手。', 1, '["立春", "雨水", "惊蛰"]', 'https://example.com/lettuce.jpg');
   ```

2. 使用 MySQL Workbench 执行 SQL 语句或通过命令行导入数据

## 2. 配置对象存储 COS（可选）

如果您需要存储图片，可以配置对象存储 COS。如果暂时不需要图片上传功能，可以跳过此步骤。

### 2.1 创建存储桶

1. 登录腾讯云控制台，进入对象存储 COS
2. 点击"创建存储桶"，命名为 `togrow-[您的唯一标识符]`（例如：`togrow-1234567890`）
3. 访问权限设置为"公有读私有写"
4. 其他设置保持默认

### 2.2 创建目录结构

在存储桶中创建以下目录：
- `diary-images/`：存储日记图片
- `post-images/`：存储帖子图片
- `avatars/`：存储用户头像

### 2.3 配置 COS 权限

1. 创建一个用于 COS 访问的子账号或角色
2. 为该子账号或角色授予 COS 的读写权限
3. 获取并保存访问密钥（SecretId 和 SecretKey），后续将在 CNB 环境变量中使用

## 3. 使用腾讯云 CNB 部署应用

CNB (Cloud Native Blending) 是腾讯云提供的云原生混合部署服务，可以简化应用的部署和管理。使用 CNB 可以将我们的应用以容器化的方式部署，并自动处理扩缩容、负载均衡等问题。

### 3.1 准备应用代码

1. 将所有后端代码整合到一个项目中
2. 在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

3. 创建 `app.js` 作为应用入口，整合所有 API 端点：

```javascript
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const COS = require('cos-nodejs-sdk-v5');

// 初始化 Express 应用
const app = express();
app.use(cors());
app.use(express.json());

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 初始化 COS（如果配置了）
let cos;
if (process.env.COS_SECRET_ID && process.env.COS_SECRET_KEY) {
  cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
  });
}

// 导入各个 API 处理函数
const { getSolarTerm } = require('./getSolarTerm');
const { getPlantGuides } = require('./plantGuides');
const { getDiaries } = require('./getDiaries');
const { createDiary } = require('./createDiary');
const { addDiaryLog } = require('./addDiaryLog');
const { completeDiary } = require('./completeDiary');
const { getPosts } = require('./getPosts');
const { createPost } = require('./createPost');
const { likePost } = require('./likePost');
const { addComment } = require('./addComment');
const { uploadImage } = require('./uploadImage');

// 定义 API 路由
app.get('/api/getSolarTerm', (req, res) => getSolarTerm(req, res, pool));
app.get('/api/plantGuides', (req, res) => getPlantGuides(req, res, pool));
app.get('/api/diaries', (req, res) => getDiaries(req, res, pool));
app.post('/api/createDiary', (req, res) => createDiary(req, res, pool));
app.post('/api/diaries/:plantingId/logs', (req, res) => addDiaryLog(req, res, pool));
app.patch('/api/diaries/:plantingId', (req, res) => completeDiary(req, res, pool));
app.get('/api/getPosts', (req, res) => getPosts(req, res, pool));
app.post('/api/createPost', (req, res) => createPost(req, res, pool));
app.post('/api/posts/:postId/like', (req, res) => likePost(req, res, pool));
app.post('/api/posts/:postId/comments', (req, res) => addComment(req, res, pool));

// 仅当配置了 COS 时才启用图片上传
if (cos) {
  app.post('/api/upload', (req, res) => uploadImage(req, res, cos));
} else {
  app.post('/api/upload', (req, res) => {
    res.status(501).json({ message: '图片上传功能未配置' });
  });
}

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

4. 修改各个 API 处理函数，使其适配 Express 路由和 MySQL：

例如，将 `getSolarTerm/index.js` 修改为：

```javascript
exports.getSolarTerm = async (req, res, pool) => {
  try {
    // 原有的 getSolarTerm 逻辑
    const now = new Date();
    // ... 计算当前节气 ...
    
    return res.status(200).json({ solarTerm: currentTerm });
  } catch (error) {
    console.error('Error getting solar term:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
```

### 3.2 使用 CNB 部署应用

1. 登录腾讯云控制台，进入 CNB 服务
2. 点击"新建应用"，选择"容器应用"
3. 配置应用基本信息：
   - 应用名称：`togrow-backend`
   - 部署区域：选择与您的 MySQL 实例相同的区域
   - 网络配置：选择与 MySQL 实例相同的 VPC
4. 配置容器信息：
   - 选择"本地代码构建"，上传您的应用代码
   - 或选择"代码仓库"，关联您的 GitHub 或 GitLab 仓库
5. 配置环境变量：
   - `MYSQL_HOST`：MySQL 连接地址
   - `MYSQL_USER`：MySQL 用户名
   - `MYSQL_PASSWORD`：MySQL 密码
   - `MYSQL_DATABASE`：MySQL 数据库名称（togrow）
   - `COS_SECRET_ID`：COS 访问密钥 ID（如果配置了 COS）
   - `COS_SECRET_KEY`：COS 访问密钥 Secret（如果配置了 COS）
   - `COS_BUCKET`：COS 存储桶名称（如果配置了 COS）
   - `COS_REGION`：COS 存储桶所在地域（如果配置了 COS）
6. 配置资源规格：
   - CPU：1核（开发测试阶段足够）
   - 内存：2GB
   - 实例数：1（可根据需求调整）
7. 配置网络和访问设置：
   - 开放端口：3000
   - 创建公网访问入口
8. 完成创建并等待部署完成

### 3.3 配置 API 网关（可选，用于自定义域名和更高级的 API 管理）

如果您需要更高级的 API 管理功能，可以配置 API 网关：

1. 登录腾讯云控制台，进入 API 网关
2. 创建 API 服务，并配置自定义域名（如需要）
3. 创建 API 规则，将请求转发到 CNB 应用的公网访问地址

## 4. 配置 CIAM 进行用户认证

### 4.1 创建 CIAM 应用

1. 登录腾讯云控制台，进入 CIAM
2. 点击"创建应用"，填写应用信息：
   - 应用名称：ToGrow
   - 应用类型：Web 应用
   - 回调 URL：您的前端应用 URL
3. 配置认证方式：
   - 启用账号密码认证
   - 可选：启用社交账号登录（微信、QQ等）
4. 获取应用 ID 和密钥

### 4.2 在后端集成 CIAM

1. 安装 CIAM SDK：
   ```bash
   npm install @tencent-cloud/ciam-sdk
   ```

2. 在应用中添加 CIAM 认证中间件：
   ```javascript
   const { CIAMAuth } = require('@tencent-cloud/ciam-sdk');
   
   // 初始化 CIAM
   const ciamAuth = new CIAMAuth({
     appId: process.env.CIAM_APP_ID,
     appSecret: process.env.CIAM_APP_SECRET
   });
   
   // 认证中间件
   function authMiddleware(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) {
       return res.status(401).json({ message: 'Unauthorized' });
     }
     
     try {
       const user = ciamAuth.verifyToken(token);
       req.user = user;
       next();
     } catch (error) {
       return res.status(401).json({ message: 'Invalid token' });
     }
   }
   
   // 在需要认证的路由上使用中间件
   app.get('/api/diaries', authMiddleware, (req, res) => getDiaries(req, res, pool));
   ```

### 4.3 在前端集成 CIAM

1. 安装 CIAM 前端 SDK：
   ```bash
   npm install @tencent-cloud/ciam-js-sdk
   ```

2. 在前端代码中初始化 CIAM：
   ```javascript
   import { CIAM } from '@tencent-cloud/ciam-js-sdk';
   
   const ciam = new CIAM({
     appId: 'YOUR_APP_ID',
     redirectUri: window.location.origin + '/callback'
   });
   
   // 登录
   function login() {
     ciam.login();
   }
   
   // 处理回调
   async function handleCallback() {
     const token = await ciam.handleCallback();
     localStorage.setItem('token', token);
     // 重定向到应用首页
     window.location.href = '/';
   }
   ```

## 5. 监控与维护

### 5.1 使用 CNB 监控功能

CNB 提供了内置的监控功能，可以监控应用的 CPU、内存使用率、请求数等指标：

1. 在 CNB 控制台，选择您的应用
2. 点击"监控"选项卡，查看应用性能指标
3. 配置告警规则，在应用异常时接收通知

### 5.2 使用腾讯云日志服务

1. 在 CNB 应用配置中启用日志服务
2. 在日志服务控制台查看应用日志
3. 配置日志检索和分析规则，快速定位问题

### 5.3 定期备份数据

1. 配置 MySQL 自动备份策略
2. 定期导出重要数据

## 6. 扩展与优化

### 6.1 使用 CDN 加速静态资源

1. 在腾讯云控制台，开通 CDN 服务
2. 配置 CDN 加速域名，指向 COS 存储桶
3. 更新前端代码中的图片 URL，使用 CDN 域名

### 6.2 配置自动扩缩容

在 CNB 应用配置中：

1. 启用自动扩缩容
2. 配置扩缩容规则，例如：
   - 当 CPU 使用率超过 70% 时，增加实例
   - 当 CPU 使用率低于 30% 时，减少实例

### 6.3 使用腾讯云 Serverless 服务（可选）

对于某些低频使用的功能（如图片处理），可以考虑使用 Serverless 云函数：

1. 在腾讯云控制台，开通 Serverless 云函数
2. 将图片处理等功能部署为独立的云函数
3. 通过 API 网关或直接调用方式集成到应用中

## 常见问题与解决方案

### 跨域问题
确保在 Express 应用中正确配置了 CORS：
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 连接数据库失败
1. 检查 MySQL 连接参数是否正确
2. 确保 CNB 应用与 MySQL 实例在同一 VPC 中，或已配置网络互通
3. 检查 MySQL 实例的安全组规则是否允许连接

### 图片上传失败
1. 检查 COS 密钥是否正确
2. 确保 COS 存储桶权限设置为"公有读私有写"
3. 检查上传的文件大小是否超过限制

### 应用性能问题
1. 增加 CNB 应用的资源配置（CPU、内存）
2. 优化数据库查询，添加适当的索引
3. 考虑使用缓存服务（如腾讯云 Redis）缓存热点数据
