// weather.js - 处理天气和节气相关功能
import config from './config.js';

// 初始化天气和节气模块
export function initWeather() {
    console.log('初始化天气和节气模块...');
    getSolarTerm()
        .then(currentTerm => {
            console.log(`当前节气: ${currentTerm}`);
            // 可以在这里添加其他依赖于节气的初始化逻辑
        })
        .catch(error => {
            console.error('初始化节气失败:', error);
        });
}

// 获取当前节气
export async function getSolarTerm() {
    try {
        // 使用腾讯云API获取节气信息
        const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.GET_SOLAR_TERM}`);
        
        if (!response.ok) {
            throw new Error(`获取节气失败: ${response.status}`);
        }
        
        const data = await response.json();
        const currentTerm = data.solarTerm; // 假设API返回 { solarTerm: '谷雨' }
        
        // 更新UI显示当前节气
        displaySolarTerm(currentTerm);
        
        return currentTerm;
    } catch (error) {
        console.error('获取节气信息失败:', error);
        // 显示默认节气或错误信息
        displaySolarTerm('未知节气');
        return '未知节气';
    }
}

// 显示节气信息
function displaySolarTerm(termName) {
    // 更新DOM显示节气名称
    const termElement = document.querySelector('#current-term');
    if (termElement) {
        termElement.textContent = termName;
    }

    // 更新地球动画以反映当前节气
    const solarTermsList = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', 
                           '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', 
                           '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];
    
    const termIndex = solarTermsList.indexOf(termName);
    if (termIndex !== -1) {
        const earth = document.querySelector('.earth');
        if (earth) {
            const angle = (termIndex / 24) * 360;
            earth.style.transform = `rotate(${angle}deg)`;
        }
    } else {
        console.warn("收到未知节气:", termName);
    }
}

// 获取基于节气的植物指南
export async function getPlantGuidesBySolarTerm(solarTerm) {
    try {
        // 使用腾讯云API获取植物指南
        const url = `${config.API_BASE_URL}${config.API_ENDPOINTS.PLANT_GUIDES}?solarTerm=${encodeURIComponent(solarTerm)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`获取植物指南失败: ${response.status}`);
        }
        
        const guides = await response.json();
        return guides;
    } catch (error) {
        console.error('获取植物指南失败:', error);
        return []; // 返回空数组表示没有指南
    }
}
