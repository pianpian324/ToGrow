'use strict';

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建数据库的SQL语句
const createDatabaseSQL = `CREATE DATABASE IF NOT EXISTS togrow;`;

// 创建表的SQL语句
const createTablesSQL = `
USE togrow;

-- 植物指南表
CREATE TABLE IF NOT EXISTS plants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty INT,
  suitableSeason JSON,
  imageUrl VARCHAR(255)
);

-- 用户种植日记表
CREATE TABLE IF NOT EXISTS diaries (
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
CREATE TABLE IF NOT EXISTS diary_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  diaryId INT NOT NULL,
  date DATETIME NOT NULL,
  content TEXT,
  imageUrl VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (diaryId) REFERENCES diaries(id) ON DELETE CASCADE
);

-- 社区帖子表
CREATE TABLE IF NOT EXISTS posts (
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
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId VARCHAR(100) NOT NULL,
  userName VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
);

-- 帖子点赞表
CREATE TABLE IF NOT EXISTS post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId VARCHAR(100) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (postId, userId),
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
);
`;

// 植物表的样本数据
const sampleDataSQL = `
INSERT INTO plants (name, description, difficulty, suitableSeason, imageUrl) VALUES
('番茄', '喜温暖、阳光充足环境，适合阳台种植。', 2, '["春分", "清明", "谷雨"]', 'https://example.com/tomato.jpg'),
('生菜', '喜凉爽环境，生长周期短，适合新手。', 1, '["立春", "雨水", "惊蛰"]', 'https://example.com/lettuce.jpg'),
('辣椒', '喜高温，生长期较长，需要充足阳光。', 3, '["小满", "芒种", "夏至"]', 'https://example.com/pepper.jpg'),
('胡萝卜', '适应性强，可在多种土壤中生长，喜凉爽气候。', 2, '["立秋", "白露", "秋分"]', 'https://example.com/carrot.jpg'),
('草莓', '喜温暖气候，需要充足阳光和排水良好的土壤。', 3, '["惊蛰", "春分", "清明"]', 'https://example.com/strawberry.jpg');
`;

/**
 * 初始化数据库
 * 创建数据库、表结构，并可选地导入样本数据
 */
async function initializeDatabase(importSampleData = true) {
  let connection;
  
  try {
    console.log('正在连接到 MySQL 服务器...');
    // 首先不指定数据库名称连接
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('成功连接到 MySQL 服务器');
    
    // 创建数据库
    console.log('正在创建数据库...');
    await connection.query(createDatabaseSQL);
    console.log('数据库创建成功或已存在');
    
    // 创建表
    console.log('正在创建表结构...');
    await connection.query(createTablesSQL);
    console.log('表结构创建成功');
    
    // 导入样本数据（可选）
    if (importSampleData) {
      console.log('正在检查是否需要导入样本数据...');
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM togrow.plants');
      
      if (rows[0].count === 0) {
        console.log('正在导入样本数据...');
        await connection.query(sampleDataSQL);
        console.log('样本数据导入成功');
      } else {
        console.log('植物表已有数据，跳过样本数据导入');
      }
    }
    
    console.log('数据库初始化完成！');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
  // 从命令行参数获取是否导入样本数据
  const importSampleData = process.argv.includes('--with-sample-data');
  
  initializeDatabase(importSampleData)
    .then(success => {
      if (success) {
        console.log('数据库初始化脚本执行成功');
        process.exit(0);
      } else {
        console.error('数据库初始化脚本执行失败');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('脚本执行出错:', err);
      process.exit(1);
    });
} else {
  // 作为模块导出
  module.exports = initializeDatabase;
}