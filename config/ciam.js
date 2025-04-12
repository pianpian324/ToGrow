/**
 * 腾讯云 CIAM 配置
 * 
 * 此文件包含腾讯云 CIAM (客户身份与访问管理) 服务的配置信息
 * 部署到生产环境时，请更新为您的实际 CIAM 应用信息
 */

const ciamConfig = {
    // CIAM 应用 ID
    appId: 'your-ciam-app-id',
    
    // CIAM 区域
    region: 'ap-guangzhou',
    
    // CIAM SDK 版本
    sdkVersion: 'v1',
    
    // CIAM 服务基础 URL
    baseUrl: 'https://ciam.ap-guangzhou.tencentcloudapi.com',
    
    // 令牌有效期（秒）
    tokenExpirySeconds: 86400, // 24小时
    
    // 自定义 UI 配置
    ui: {
        // 登录页面配置
        login: {
            title: 'ToGrow 登录',
            logo: '/images/logo.png',
            background: '#f5f5f5'
        },
        
        // 注册页面配置
        register: {
            title: 'ToGrow 注册',
            logo: '/images/logo.png',
            background: '#f5f5f5'
        }
    }
};

export default ciamConfig;
