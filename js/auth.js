import config from './config.js';

export function initAuth() {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');

    // 显示/隐藏模态框
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
    });

    document.querySelectorAll('.cancel-modal').forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '登录失败');
            }

            const data = await response.json();
            
            // 保存认证信息到本地存储
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_id', data.userId);
            localStorage.setItem('token_expiry', new Date().getTime() + (data.expiresIn * 1000));
            
            // 获取用户信息
            await fetchUserInfo(data.userId);
            
            loginModal.style.display = 'none';
            updateAuthUI(true);
        } catch (error) {
            alert('登录失败：' + error.message);
        }
    });

    // 注册表单提交
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nickname = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const username = email; // 使用邮箱作为用户名

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username, 
                    password, 
                    email, 
                    nickname 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '注册失败');
            }

            // 注册成功后自动登录
            const loginResponse = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                throw new Error(errorData.message || '自动登录失败');
            }

            const data = await loginResponse.json();
            
            // 保存认证信息到本地存储
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_id', data.userId);
            localStorage.setItem('token_expiry', new Date().getTime() + (data.expiresIn * 1000));
            
            // 获取用户信息
            await fetchUserInfo(data.userId);
            
            registerModal.style.display = 'none';
            updateAuthUI(true);
        } catch (error) {
            alert('注册失败：' + error.message);
        }
    });

    // 退出登录
    logoutBtn.addEventListener('click', () => {
        // 清除本地存储中的认证信息
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_info');
        localStorage.removeItem('token_expiry');
        
        updateAuthUI(false);
    });

    // 页面加载时检查用户是否已登录
    checkAuthStatus();

    // 辅助函数：检查认证状态
    async function checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        const tokenExpiry = localStorage.getItem('token_expiry');
        
        if (!token || !userId || !tokenExpiry) {
            updateAuthUI(false);
            return;
        }
        
        // 检查令牌是否过期
        if (new Date().getTime() > parseInt(tokenExpiry)) {
            // 令牌已过期，清除认证信息
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_info');
            localStorage.removeItem('token_expiry');
            updateAuthUI(false);
            return;
        }
        
        try {
            // 验证令牌
            const response = await fetch(`${config.API_BASE_URL}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });
            
            if (!response.ok) {
                throw new Error('令牌验证失败');
            }
            
            const data = await response.json();
            
            if (data.valid) {
                // 如果本地没有用户信息，则获取用户信息
                if (!localStorage.getItem('user_info')) {
                    await fetchUserInfo(userId);
                }
                
                updateAuthUI(true);
            } else {
                // 令牌无效，清除认证信息
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('user_info');
                localStorage.removeItem('token_expiry');
                updateAuthUI(false);
            }
        } catch (error) {
            console.error('验证令牌失败:', error);
            updateAuthUI(false);
        }
    }

    // 辅助函数：获取用户信息
    async function fetchUserInfo(userId) {
        try {
            const token = localStorage.getItem('auth_token');
            
            const response = await fetch(`${config.API_BASE_URL}/api/auth/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('获取用户信息失败');
            }
            
            const userInfo = await response.json();
            
            // 保存用户信息到本地存储
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            
            // 更新UI显示用户名
            if (userName) {
                userName.textContent = userInfo.nickname || userInfo.username || '用户';
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
        }
    }

    // 辅助函数：更新认证UI
    function updateAuthUI(isLoggedIn) {
        if (isLoggedIn) {
            // 用户已登录
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            
            // 从本地存储获取用户信息
            const userInfoStr = localStorage.getItem('user_info');
            if (userInfoStr) {
                const userInfoObj = JSON.parse(userInfoStr);
                userName.textContent = userInfoObj.nickname || userInfoObj.username || '用户';
            } else {
                userName.textContent = '用户';
            }
        } else {
            // 用户未登录
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }
}

// 获取当前用户ID
export function getCurrentUserId() {
    return localStorage.getItem('user_id');
}

// 获取认证令牌
export function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// 获取当前用户信息
export function getCurrentUserInfo() {
    const userInfoStr = localStorage.getItem('user_info');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
}

// 检查用户是否已登录
export function isLoggedIn() {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    const tokenExpiry = localStorage.getItem('token_expiry');
    
    if (!token || !userId || !tokenExpiry) {
        return false;
    }
    
    // 检查令牌是否过期
    return new Date().getTime() <= parseInt(tokenExpiry);
}
