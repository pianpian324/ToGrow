'use strict';

const express = require('express');
const router = express.Router();
const { createCIAMService } = require('../ciam');

// 创建CIAM服务实例
const ciamService = createCIAMService();

/**
 * 用户注册
 * POST /api/auth/register
 * Body: { username, password, email, phoneNumber, nickname }
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, phoneNumber, nickname } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码是必填项' });
    }
    
    const userData = {
      username,
      password,
      email,
      phoneNumber,
      nickname: nickname || username
    };
    
    const result = await ciamService.createUser(userData);
    
    // 移除敏感信息
    delete result.password;
    
    res.status(201).json({
      message: '注册成功',
      user: result
    });
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(error.response?.status || 500).json({
      message: '注册失败',
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * 用户登录
 * POST /api/auth/login
 * Body: { username, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码是必填项' });
    }
    
    const result = await ciamService.login(username, password);
    
    res.status(200).json({
      message: '登录成功',
      token: result.token,
      userId: result.userId,
      expiresIn: result.expiresIn
    });
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(error.response?.status || 500).json({
      message: '登录失败',
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * 验证令牌
 * POST /api/auth/verify
 * Body: { token }
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: '令牌是必填项' });
    }
    
    const result = await ciamService.verifyToken(token);
    
    res.status(200).json({
      valid: result.valid,
      userId: result.userId
    });
  } catch (error) {
    console.error('令牌验证失败:', error);
    res.status(error.response?.status || 500).json({
      message: '令牌验证失败',
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * 获取用户信息
 * GET /api/auth/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: '用户ID是必填项' });
    }
    
    const result = await ciamService.getUserInfo(userId);
    
    // 移除敏感信息
    delete result.password;
    
    res.status(200).json(result);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(error.response?.status || 500).json({
      message: '获取用户信息失败',
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * 更新用户信息
 * PUT /api/auth/user/:userId
 * Body: { nickname, email, phoneNumber, ... }
 */
router.put('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: '用户ID是必填项' });
    }
    
    // 移除敏感字段，这些字段应该通过专门的API更新
    delete userData.password;
    delete userData.username;
    
    const result = await ciamService.updateUserInfo(userId, userData);
    
    res.status(200).json({
      message: '用户信息更新成功',
      user: result
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(error.response?.status || 500).json({
      message: '更新用户信息失败',
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * 重置密码
 * POST /api/auth/reset-password
 * Body: { userId, newPassword }
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ message: '用户ID和新密码是必填项' });
    }
    
    await ciamService.resetPassword(userId, newPassword);
    
    res.status(200).json({
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('密码重置失败:', error);
    res.status(error.response?.status || 500).json({
      message: '密码重置失败',
      error: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
