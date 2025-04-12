'use strict';

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 初始化 Express 应用
const app = express();
app.use(cors());
app.use(express.json());

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
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由

// 获取节气信息
app.get('/api/getSolarTerm', async (req, res) => {
  try {
    // 从查询参数中获取日期，如果没有提供则使用当前日期
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);
    
    // 这里应该有更复杂的节气计算逻辑
    // 简化版本：根据月份和日期返回大致节气
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let solarTerm = '';
    if (month === 2 && day >= 3 && day <= 18) solarTerm = '立春';
    else if (month === 2 && day >= 19) solarTerm = '雨水';
    else if (month === 3 && day <= 5) solarTerm = '雨水';
    else if (month === 3 && day >= 6 && day <= 20) solarTerm = '惊蛰';
    else if (month === 3 && day >= 21) solarTerm = '春分';
    else if (month === 4 && day <= 4) solarTerm = '春分';
    else if (month === 4 && day >= 5 && day <= 19) solarTerm = '清明';
    else if (month === 4 && day >= 20) solarTerm = '谷雨';
    else if (month === 5 && day <= 5) solarTerm = '谷雨';
    else if (month === 5 && day >= 6 && day <= 20) solarTerm = '立夏';
    else if (month === 5 && day >= 21) solarTerm = '小满';
    else if (month === 6 && day <= 5) solarTerm = '小满';
    else if (month === 6 && day >= 6 && day <= 20) solarTerm = '芒种';
    else if (month === 6 && day >= 21) solarTerm = '夏至';
    else if (month === 7 && day <= 6) solarTerm = '夏至';
    else if (month === 7 && day >= 7 && day <= 22) solarTerm = '小暑';
    else if (month === 7 && day >= 23) solarTerm = '大暑';
    else if (month === 8 && day <= 7) solarTerm = '大暑';
    else if (month === 8 && day >= 8 && day <= 22) solarTerm = '立秋';
    else if (month === 8 && day >= 23) solarTerm = '处暑';
    else if (month === 9 && day <= 7) solarTerm = '处暑';
    else if (month === 9 && day >= 8 && day <= 22) solarTerm = '白露';
    else if (month === 9 && day >= 23) solarTerm = '秋分';
    else if (month === 10 && day <= 8) solarTerm = '秋分';
    else if (month === 10 && day >= 9 && day <= 23) solarTerm = '寒露';
    else if (month === 10 && day >= 24) solarTerm = '霜降';
    else if (month === 11 && day <= 7) solarTerm = '霜降';
    else if (month === 11 && day >= 8 && day <= 22) solarTerm = '立冬';
    else if (month === 11 && day >= 23) solarTerm = '小雪';
    else if (month === 12 && day <= 6) solarTerm = '小雪';
    else if (month === 12 && day >= 7 && day <= 21) solarTerm = '大雪';
    else if (month === 12 && day >= 22) solarTerm = '冬至';
    else if (month === 1 && day <= 5) solarTerm = '冬至';
    else if (month === 1 && day >= 6 && day <= 19) solarTerm = '小寒';
    else if (month === 1 && day >= 20) solarTerm = '大寒';
    
    res.status(200).json({
      date: dateStr,
      solarTerm: solarTerm,
      nextPlanting: ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨'].includes(solarTerm)
        ? '春季种植季节'
        : ['立夏', '小满', '芒种', '夏至', '小暑', '大暑'].includes(solarTerm)
        ? '夏季种植季节'
        : ['立秋', '处暑', '白露', '秋分', '寒露', '霜降'].includes(solarTerm)
        ? '秋季种植季节'
        : '冬季休整期'
    });
  } catch (error) {
    console.error('获取节气信息失败:', error);
    res.status(500).json({ message: '获取节气信息失败' });
  }
});

// 获取植物指南
app.get('/api/plantGuides', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM plants');
    
    // 格式化数据
    const plants = rows.map(plant => ({
      ...plant,
      id: plant.id.toString(),
      suitableSeason: JSON.parse(plant.suitableSeason)
    }));
    
    res.status(200).json(plants);
  } catch (error) {
    console.error('获取植物指南失败:', error);
    res.status(500).json({ message: '获取植物指南失败' });
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
