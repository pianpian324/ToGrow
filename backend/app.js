'use strict';

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios');

// 初始化 Express 应用
const app = express();
app.use(cors());
app.use(express.json());

// 配置静态文件服务
app.use(express.static(path.join(__dirname, '../')));

// +++ OpenWeatherMap Config +++
const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'togrow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 导入数据库初始化函数
const initializeDatabase = require('./init-database');

// 导入认证路由
const authRoutes = require('./routes/auth');

// 使用认证路由
app.use('/api/auth', authRoutes);

// 认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  // 这里应该验证令牌
  // 在实际应用中，应该使用CIAM服务验证令牌
  // 为了简化，这里只是检查令牌是否存在
  req.user = { token };
  next();
};

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器运行正常' });
});

// +++ Weather API Proxy Routes +++

// Proxy for getting weather by city name
app.get('/api/proxy/weather', async (req, res) => {
  const { city, lang = 'zh_cn', units = 'metric' } = req.query;

  if (!city) {
    return res.status(400).json({ error: '缺少城市名称 (city) 参数' });
  }
  if (!WEATHER_API_KEY) {
     console.error('Weather API Key (OPENWEATHERMAP_API_KEY) not found in environment variables.');
     return res.status(500).json({ error: '服务器配置错误：缺少天气API密钥' });
  }

  // 中文城市名映射表
  const cityNameMap = {
    '北京': 'Beijing',
    '上海': 'Shanghai',
    '广州': 'Guangzhou',
    '深圳': 'Shenzhen',
    '成都': 'Chengdu',
    '武汉': 'Wuhan',
    '杭州': 'Hangzhou',
    '南京': 'Nanjing',
    '西安': 'Xian',
    '重庆': 'Chongqing'
  };

  const apiUrl = `${OPENWEATHERMAP_BASE_URL}/weather`;
  try {
    // 如果是中文城市名，使用映射的英文名
    const queryCity = cityNameMap[city] || city;
    console.log(`查询城市天气: ${city} -> ${queryCity}`);

    const response = await axios.get(apiUrl, {
      params: {
        q: queryCity,
        appid: WEATHER_API_KEY,
        units: units,
        lang: lang,
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('OpenWeatherMap API Error (weather):', error.response ? error.response.data : error.message);
    const statusCode = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data.message : '代理请求天气信息失败';
    res.status(statusCode).json({ error: message });
  }
});

// Proxy for reverse geocoding (getting city from lat/lon)
app.get('/api/proxy/reverse-geo', async (req, res) => {
  const { lat, lon, lang = 'zh_cn' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: '缺少纬度 (lat) 或经度 (lon) 参数' });
  }
   if (!WEATHER_API_KEY) {
     console.error('Weather API Key (OPENWEATHERMAP_API_KEY) not found in environment variables.');
     return res.status(500).json({ error: '服务器配置错误：缺少天气API密钥' });
  }

  // Note: OpenWeatherMap's reverse geocoding is a separate endpoint
  const reverseGeoApiUrl = `http://api.openweathermap.org/geo/1.0/reverse`;
  try {
    const response = await axios.get(reverseGeoApiUrl, {
       params: {
        lat: lat,
        lon: lon,
        limit: 1, // We usually only need the top result
        appid: WEATHER_API_KEY,
        // Note: lang doesn't seem to be directly supported by /geo/1.0/reverse for city names in the same way as /data/2.5/weather
      }
    });
    // The actual city name is often in response.data[0].local_names[lang] or response.data[0].name
    // We send the whole first result back for the frontend to parse
    if (response.data && response.data.length > 0) {
        res.json(response.data[0]);
    } else {
        res.status(404).json({ error: '无法从坐标反查到地点信息' });
    }
  } catch (error) {
    console.error('OpenWeatherMap API Error (reverse-geo):', error.response ? error.response.data : error.message);
    const statusCode = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data.message : '代理请求反向地理编码失败';
    res.status(statusCode).json({ error: message });
  }
});

// 获取节气信息
app.get('/api/getSolarTerm', async (req, res) => {
  try {
    const solarTermsData = await fs.readFile(path.join(__dirname, 'data/solar-terms.json'), 'utf8');
    const solarTerms = JSON.parse(solarTermsData).solarTerms;
    
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 简化的节气判断逻辑
    const solarTermRanges = [
      { name: '小寒', start: { month: 1, day: 5 }, end: { month: 1, day: 19 } },
      { name: '大寒', start: { month: 1, day: 20 }, end: { month: 2, day: 3 } },
      { name: '立春', start: { month: 2, day: 4 }, end: { month: 2, day: 18 } },
      { name: '雨水', start: { month: 2, day: 19 }, end: { month: 3, day: 4 } },
      { name: '惊蛰', start: { month: 3, day: 5 }, end: { month: 3, day: 19 } },
      { name: '春分', start: { month: 3, day: 20 }, end: { month: 4, day: 4 } },
      { name: '清明', start: { month: 4, day: 5 }, end: { month: 4, day: 19 } },
      { name: '谷雨', start: { month: 4, day: 20 }, end: { month: 5, day: 4 } },
      { name: '立夏', start: { month: 5, day: 5 }, end: { month: 5, day: 20 } },
      { name: '小满', start: { month: 5, day: 21 }, end: { month: 6, day: 4 } },
      { name: '芒种', start: { month: 6, day: 5 }, end: { month: 6, day: 20 } },
      { name: '夏至', start: { month: 6, day: 21 }, end: { month: 7, day: 6 } },
      { name: '小暑', start: { month: 7, day: 7 }, end: { month: 7, day: 21 } },
      { name: '大暑', start: { month: 7, day: 22 }, end: { month: 8, day: 6 } },
      { name: '立秋', start: { month: 8, day: 7 }, end: { month: 8, day: 22 } },
      { name: '处暑', start: { month: 8, day: 23 }, end: { month: 9, day: 6 } },
      { name: '白露', start: { month: 9, day: 7 }, end: { month: 9, day: 22 } },
      { name: '秋分', start: { month: 9, day: 23 }, end: { month: 10, day: 7 } },
      { name: '寒露', start: { month: 10, day: 8 }, end: { month: 10, day: 22 } },
      { name: '霜降', start: { month: 10, day: 23 }, end: { month: 11, day: 6 } },
      { name: '立冬', start: { month: 11, day: 7 }, end: { month: 11, day: 21 } },
      { name: '小雪', start: { month: 11, day: 22 }, end: { month: 12, day: 6 } },
      { name: '大雪', start: { month: 12, day: 7 }, end: { month: 12, day: 21 } },
      { name: '冬至', start: { month: 12, day: 22 }, end: { month: 1, day: 4 } }
    ];
    
    let currentTermName = '';
    let dateRange = '';
    
    for (const range of solarTermRanges) {
      if (range.name === '冬至') {
        // 特殊处理跨年的冬至
        if ((month === 12 && day >= 22) || (month === 1 && day <= 4)) {
          currentTermName = range.name;
          dateRange = `12月22日-1月4日`;
          break;
        }
      } else {
        if ((month === range.start.month && day >= range.start.day) && 
            (month === range.end.month && day <= range.end.day)) {
          currentTermName = range.name;
          dateRange = `${range.start.month}月${range.start.day}日-${range.end.month}月${range.end.day}日`;
          break;
        }
      }
    }
    
    // 查找当前节气的详细信息
    const currentTermInfo = solarTerms.find(term => term.name === currentTermName);
    
    if (!currentTermInfo) {
      return res.status(404).json({ error: '无法确定当前节气' });
    }
    
    res.json({
      name: currentTermInfo.name,
      dateRange: dateRange,
      description: currentTermInfo.description,
      naturalSigns: currentTermInfo.naturalSigns,
      farmingTips: currentTermInfo.farmingTips
    });
  } catch (error) {
    console.error('获取节气信息失败:', error);
    res.status(500).json({ error: '获取节气信息失败' });
  }
});

// 获取植物指南
app.get('/api/plantGuides', async (req, res) => {
  try {
    // 读取植物数据
    const plantsData = await fs.readFile(path.join(__dirname, 'data/plants.json'), 'utf8');
    const plants = JSON.parse(plantsData).plants;
    
    // 获取查询参数
    const { season, search, limit = 10 } = req.query;
    
    let filteredPlants = plants;
    
    // 按节气/季节筛选
    if (season) {
      filteredPlants = filteredPlants.filter(plant => 
        plant.suitableSeason.includes(season)
      );
    }
    
    // 按名称搜索
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPlants = filteredPlants.filter(plant => 
        plant.name.toLowerCase().includes(searchLower) || 
        plant.description.toLowerCase().includes(searchLower)
      );
    }
    
    // 限制返回数量
    const limitedPlants = filteredPlants.slice(0, parseInt(limit));
    
    res.json(limitedPlants);
  } catch (error) {
    console.error('获取植物指南失败:', error);
    res.status(500).json({ error: '获取植物指南失败' });
  }
});

// 获取植物详情
app.get('/api/plantGuides/:id', async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    
    // 读取植物数据
    const plantsData = await fs.readFile(path.join(__dirname, 'data/plants.json'), 'utf8');
    const plants = JSON.parse(plantsData).plants;
    
    // 查找指定ID的植物
    const plant = plants.find(p => p.id === plantId);
    
    if (!plant) {
      return res.status(404).json({ error: '未找到指定植物' });
    }
    
    res.json(plant);
  } catch (error) {
    console.error('获取植物详情失败:', error);
    res.status(500).json({ error: '获取植物详情失败' });
  }
});

// 需要认证的API端点

// 获取用户的种植日记
app.get('/api/diaries', authenticateToken, async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: '缺少必要参数: userId' });
    }
    
    const [rows] = await pool.execute(
      'SELECT * FROM diaries WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    
    // 格式化日期
    const diaries = rows.map(diary => ({
      ...diary,
      id: diary.id.toString(),
      plantId: diary.plantId ? diary.plantId.toString() : null,
      startDate: diary.startDate.toISOString(),
      createdAt: diary.createdAt.toISOString(),
      updatedAt: diary.updatedAt.toISOString(),
      completedDate: diary.completedDate ? diary.completedDate.toISOString() : null
    }));
    
    res.status(200).json(diaries);
  } catch (error) {
    console.error('获取种植日记失败:', error);
    res.status(500).json({ message: '获取种植日记失败' });
  }
});

// 创建种植日记
app.post('/api/createDiary', authenticateToken, async (req, res) => {
  try {
    const { userId, plantId, plantName } = req.body;
    
    if (!userId || !plantName) {
      return res.status(400).json({ message: '缺少必要参数: userId, plantName' });
    }
    
    // 创建新的种植日记
    const startDate = new Date();
    
    const [result] = await pool.execute(
      `INSERT INTO diaries (userId, plantId, plantName, startDate, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, plantId || null, plantName, startDate, 'active']
    );
    
    // 获取插入的日记ID
    const diaryId = result.insertId;
    
    // 查询刚创建的日记
    const [rows] = await pool.execute(
      `SELECT * FROM diaries WHERE id = ?`,
      [diaryId]
    );
    
    if (rows.length === 0) {
      throw new Error('Failed to retrieve created diary');
    }
    
    // 格式化日期
    const diary = {
      ...rows[0],
      id: rows[0].id.toString(),
      plantId: rows[0].plantId ? rows[0].plantId.toString() : null,
      startDate: rows[0].startDate.toISOString(),
      createdAt: rows[0].createdAt.toISOString(),
      updatedAt: rows[0].updatedAt.toISOString(),
      completedDate: rows[0].completedDate ? rows[0].completedDate.toISOString() : null
    };
    
    res.status(201).json(diary);
  } catch (error) {
    console.error('创建种植日记失败:', error);
    res.status(500).json({ message: '创建种植日记失败' });
  }
});

// 添加种植日记日志
app.post('/api/diaries/:diaryId/logs', authenticateToken, async (req, res) => {
  try {
    const diaryId = req.params.diaryId;
    const { content, imageUrl } = req.body;
    
    if (!diaryId || !content) {
      return res.status(400).json({ message: '缺少必要参数: diaryId, content' });
    }
    
    // 检查日记是否存在
    const [diaryRows] = await pool.execute(
      'SELECT * FROM diaries WHERE id = ?',
      [diaryId]
    );
    
    if (diaryRows.length === 0) {
      return res.status(404).json({ message: '种植日记不存在' });
    }
    
    // 添加日志
    const date = new Date();
    
    const [result] = await pool.execute(
      `INSERT INTO diary_logs (diaryId, date, content, imageUrl) 
       VALUES (?, ?, ?, ?)`,
      [diaryId, date, content, imageUrl || null]
    );
    
    // 获取插入的日志ID
    const logId = result.insertId;
    
    // 查询刚创建的日志
    const [rows] = await pool.execute(
      `SELECT * FROM diary_logs WHERE id = ?`,
      [logId]
    );
    
    if (rows.length === 0) {
      throw new Error('Failed to retrieve created diary log');
    }
    
    // 格式化日期
    const log = {
      ...rows[0],
      id: rows[0].id.toString(),
      diaryId: rows[0].diaryId.toString(),
      date: rows[0].date.toISOString(),
      createdAt: rows[0].createdAt.toISOString()
    };
    
    res.status(201).json(log);
  } catch (error) {
    console.error('添加种植日记日志失败:', error);
    res.status(500).json({ message: '添加种植日记日志失败' });
  }
});

// 完成种植日记
app.patch('/api/diaries/:diaryId', authenticateToken, async (req, res) => {
  try {
    const diaryId = req.params.diaryId;
    const { status } = req.body;
    
    if (!diaryId || !status) {
      return res.status(400).json({ message: '缺少必要参数: diaryId, status' });
    }
    
    // 检查日记是否存在
    const [diaryRows] = await pool.execute(
      'SELECT * FROM diaries WHERE id = ?',
      [diaryId]
    );
    
    if (diaryRows.length === 0) {
      return res.status(404).json({ message: '种植日记不存在' });
    }
    
    // 更新状态
    const completedDate = status === 'completed' ? new Date() : null;
    
    await pool.execute(
      `UPDATE diaries SET status = ?, completedDate = ? WHERE id = ?`,
      [status, completedDate, diaryId]
    );
    
    // 查询更新后的日记
    const [rows] = await pool.execute(
      `SELECT * FROM diaries WHERE id = ?`,
      [diaryId]
    );
    
    // 格式化日期
    const diary = {
      ...rows[0],
      id: rows[0].id.toString(),
      plantId: rows[0].plantId ? rows[0].plantId.toString() : null,
      startDate: rows[0].startDate.toISOString(),
      createdAt: rows[0].createdAt.toISOString(),
      updatedAt: rows[0].updatedAt.toISOString(),
      completedDate: rows[0].completedDate ? rows[0].completedDate.toISOString() : null
    };
    
    res.status(200).json(diary);
  } catch (error) {
    console.error('更新种植日记状态失败:', error);
    res.status(500).json({ message: '更新种植日记状态失败' });
  }
});

// 获取社区帖子
app.get('/api/getPosts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    // 获取帖子总数
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM posts');
    const total = countResult[0].total;
    
    // 获取分页帖子
    const [rows] = await pool.execute(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentCount
       FROM posts p
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    
    // 格式化日期
    const posts = rows.map(post => ({
      ...post,
      id: post.id.toString(),
      createdAt: post.createdAt.toISOString(),
      commentCount: post.commentCount.toString()
    }));
    
    res.status(200).json({
      posts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取社区帖子失败:', error);
    res.status(500).json({ message: '获取社区帖子失败' });
  }
});

// 创建社区帖子
app.post('/api/createPost', authenticateToken, async (req, res) => {
  try {
    const { userId, userName, userAvatar, content, imageUrl } = req.body;
    
    if (!userId || !userName || !content) {
      return res.status(400).json({ message: '缺少必要参数: userId, userName, content' });
    }
    
    // 创建新帖子
    const [result] = await pool.execute(
      `INSERT INTO posts (userId, userName, userAvatar, content, imageUrl) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, userName, userAvatar || null, content, imageUrl || null]
    );
    
    // 获取插入的帖子ID
    const postId = result.insertId;
    
    // 查询刚创建的帖子
    const [rows] = await pool.execute(
      `SELECT * FROM posts WHERE id = ?`,
      [postId]
    );
    
    if (rows.length === 0) {
      throw new Error('Failed to retrieve created post');
    }
    
    // 格式化日期
    const post = {
      ...rows[0],
      id: rows[0].id.toString(),
      createdAt: rows[0].createdAt.toISOString(),
      commentCount: '0'
    };
    
    res.status(201).json(post);
  } catch (error) {
    console.error('创建社区帖子失败:', error);
    res.status(500).json({ message: '创建社区帖子失败' });
  }
});

// 点赞帖子
app.post('/api/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId } = req.body;
    
    if (!postId || !userId) {
      return res.status(400).json({ message: '缺少必要参数: postId, userId' });
    }
    
    // 检查帖子是否存在
    const [postRows] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );
    
    if (postRows.length === 0) {
      return res.status(404).json({ message: '帖子不存在' });
    }
    
    // 检查用户是否已点赞
    const [likeRows] = await pool.execute(
      'SELECT * FROM post_likes WHERE postId = ? AND userId = ?',
      [postId, userId]
    );
    
    let liked = false;
    
    if (likeRows.length === 0) {
      // 用户未点赞，添加点赞
      await pool.execute(
        'INSERT INTO post_likes (postId, userId) VALUES (?, ?)',
        [postId, userId]
      );
      
      // 更新帖子点赞数
      await pool.execute(
        'UPDATE posts SET likeCount = likeCount + 1 WHERE id = ?',
        [postId]
      );
      
      liked = true;
    } else {
      // 用户已点赞，取消点赞
      await pool.execute(
        'DELETE FROM post_likes WHERE postId = ? AND userId = ?',
        [postId, userId]
      );
      
      // 更新帖子点赞数
      await pool.execute(
        'UPDATE posts SET likeCount = GREATEST(likeCount - 1, 0) WHERE id = ?',
        [postId]
      );
      
      liked = false;
    }
    
    // 获取更新后的帖子
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );
    
    // 格式化日期
    const post = {
      ...rows[0],
      id: rows[0].id.toString(),
      createdAt: rows[0].createdAt.toISOString(),
      liked
    };
    
    res.status(200).json(post);
  } catch (error) {
    console.error('点赞帖子失败:', error);
    res.status(500).json({ message: '点赞帖子失败' });
  }
});

// 添加评论
app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId, userName, content } = req.body;
    
    if (!postId || !userId || !userName || !content) {
      return res.status(400).json({ message: '缺少必要参数: postId, userId, userName, content' });
    }
    
    // 检查帖子是否存在
    const [postRows] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );
    
    if (postRows.length === 0) {
      return res.status(404).json({ message: '帖子不存在' });
    }
    
    // 添加评论
    const [result] = await pool.execute(
      'INSERT INTO comments (postId, userId, userName, content) VALUES (?, ?, ?, ?)',
      [postId, userId, userName, content]
    );
    
    // 获取插入的评论ID
    const commentId = result.insertId;
    
    // 查询刚创建的评论
    const [rows] = await pool.execute(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );
    
    if (rows.length === 0) {
      throw new Error('Failed to retrieve created comment');
    }
    
    // 格式化日期
    const comment = {
      ...rows[0],
      id: rows[0].id.toString(),
      postId: rows[0].postId.toString(),
      createdAt: rows[0].createdAt.toISOString()
    };
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({ message: '添加评论失败' });
  }
});

// 404 处理
app.use((req, res, next) => {
  res.status(404).json({ error: `找不到路由: ${req.method} ${req.path}` });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 初始化数据库并启动服务器
async function startServer() {
  try {
    // 初始化数据库
    console.log('开始初始化数据库...');
    const dbInitialized = await initializeDatabase(true);
    
    if (!dbInitialized) {
      console.error('数据库初始化失败，无法启动服务器');
      process.exit(1);
    }
    
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`服务器已启动，监听端口 ${PORT}`);
      console.log(`可以通过 http://localhost:${PORT}/health 访问健康检查端点`);
      console.log(`可以通过 http://localhost:${PORT}/api/getSolarTerm 获取节气信息`);
      console.log(`可以通过 http://localhost:${PORT}/api/plantGuides 获取植物指南`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则启动服务器
if (require.main === module) {
  startServer();
} else {
  // 作为模块导出
  module.exports = app;
}
