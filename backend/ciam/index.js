'use strict';

const axios = require('axios');
const crypto = require('crypto');

/**
 * 腾讯云 CIAM 服务集成
 * 提供用户认证、授权和身份管理功能
 */
class CIAMService {
  constructor(config) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.region = config.region || 'ap-guangzhou';
    this.baseUrl = `https://ciam.${this.region}.tencentcloudapi.com`;
    this.apiVersion = '2022-03-31';
  }

  /**
   * 生成签名
   * @param {Object} params - 请求参数
   * @param {String} method - HTTP方法
   * @param {String} path - 请求路径
   * @returns {String} 签名
   */
  generateSignature(params, method, path) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(Math.random() * 10000);
    
    // 按字典序排序参数
    const sortedParams = {};
    Object.keys(params).sort().forEach(key => {
      sortedParams[key] = params[key];
    });
    
    // 构造签名字符串
    const paramStr = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const signStr = `${method}${path}?${paramStr}`;
    
    // 使用HMAC-SHA256算法生成签名
    const hmac = crypto.createHmac('sha256', this.appSecret);
    hmac.update(signStr);
    
    return {
      signature: hmac.digest('hex'),
      timestamp,
      nonce
    };
  }

  /**
   * 发送请求到CIAM API
   * @param {String} action - API动作
   * @param {Object} params - 请求参数
   * @returns {Promise<Object>} 响应数据
   */
  async request(action, params = {}) {
    try {
      const apiParams = {
        Action: action,
        AppId: this.appId,
        Version: this.apiVersion,
        ...params
      };
      
      const { signature, timestamp, nonce } = this.generateSignature(
        apiParams, 
        'POST', 
        '/'
      );
      
      const headers = {
        'Content-Type': 'application/json',
        'X-TC-Action': action,
        'X-TC-Version': this.apiVersion,
        'X-TC-Timestamp': timestamp,
        'X-TC-Nonce': nonce,
        'X-TC-AppId': this.appId,
        'X-TC-Signature': signature
      };
      
      const response = await axios.post(this.baseUrl, apiParams, { headers });
      return response.data;
    } catch (error) {
      console.error('CIAM API请求失败:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 创建的用户信息
   */
  async createUser(userData) {
    const params = {
      Username: userData.username,
      Password: userData.password,
      Email: userData.email,
      PhoneNumber: userData.phoneNumber,
      Nickname: userData.nickname || userData.username
    };
    
    return this.request('CreateUser', params);
  }

  /**
   * 用户登录
   * @param {String} username - 用户名
   * @param {String} password - 密码
   * @returns {Promise<Object>} 登录结果，包含token
   */
  async login(username, password) {
    const params = {
      Username: username,
      Password: password
    };
    
    return this.request('Login', params);
  }

  /**
   * 验证用户令牌
   * @param {String} token - 用户令牌
   * @returns {Promise<Object>} 验证结果
   */
  async verifyToken(token) {
    const params = {
      Token: token
    };
    
    return this.request('VerifyToken', params);
  }

  /**
   * 获取用户信息
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  async getUserInfo(userId) {
    const params = {
      UserId: userId
    };
    
    return this.request('GetUserInfo', params);
  }

  /**
   * 更新用户信息
   * @param {String} userId - 用户ID
   * @param {Object} userData - 要更新的用户数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserInfo(userId, userData) {
    const params = {
      UserId: userId,
      ...userData
    };
    
    return this.request('UpdateUserInfo', params);
  }

  /**
   * 重置用户密码
   * @param {String} userId - 用户ID
   * @param {String} newPassword - 新密码
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(userId, newPassword) {
    const params = {
      UserId: userId,
      NewPassword: newPassword
    };
    
    return this.request('ResetPassword', params);
  }

  /**
   * 删除用户
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUser(userId) {
    const params = {
      UserId: userId
    };
    
    return this.request('DeleteUser', params);
  }
}

// 创建CIAM服务实例
const createCIAMService = () => {
  const config = {
    appId: process.env.CIAM_APP_ID || 'your-app-id',
    appSecret: process.env.CIAM_APP_SECRET || 'your-app-secret',
    region: process.env.CIAM_REGION || 'ap-guangzhou'
  };
  
  return new CIAMService(config);
};

module.exports = {
  CIAMService,
  createCIAMService
};
