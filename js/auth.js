import { auth } from '../config/firebase.js';

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
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            loginModal.style.display = 'none';
        } catch (error) {
            alert('登录失败：' + error.message);
        }
    });

    // 注册表单提交
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({
                displayName: name
            });
            registerModal.style.display = 'none';
        } catch (error) {
            alert('注册失败：' + error.message);
        }
    });

    // 退出登录
    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
        } catch (error) {
            alert('退出失败：' + error.message);
        }
    });

    // 监听用户状态变化
    auth.onAuthStateChanged(user => {
        if (user) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = user.displayName || '用户';
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    });
}
