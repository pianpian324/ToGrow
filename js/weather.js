import { auth, db } from '../config/firebase.js';

export async function getWeatherData(city) {
    try {
        // 这里应该替换为实际的天气 API 调用
        const weatherData = {
            current: {
                temp: 25,
                humidity: 65,
                wind: 3.5,
                condition: '晴'
            },
            forecast: [
                { date: '2025-04-11', temp: 26, condition: '多云' },
                { date: '2025-04-12', temp: 24, condition: '晴' },
                { date: '2025-04-13', temp: 23, condition: '小雨' },
                { date: '2025-04-14', temp: 22, condition: '阴' },
                { date: '2025-04-15', temp: 25, condition: '晴' }
            ]
        };

        // 更新当前天气
        document.querySelector('#current-temp').textContent = `${weatherData.current.temp}°C`;
        document.querySelector('#current-humidity').textContent = `${weatherData.current.humidity}%`;
        document.querySelector('#current-wind').textContent = `${weatherData.current.wind} m/s`;
        document.querySelector('#current-condition').textContent = weatherData.current.condition;

        // 更新天气预报
        const forecastContainer = document.querySelector('#weather-forecast');
        forecastContainer.innerHTML = weatherData.forecast.map(day => `
            <div class="flex items-center justify-between py-2">
                <span class="text-gray-600">${day.date}</span>
                <span class="font-medium">${day.temp}°C</span>
                <span class="text-gray-600">${day.condition}</span>
            </div>
        `).join('');

        // 保存到 Firestore
        if (auth.currentUser) {
            await db.collection('weatherHistory').add({
                userId: auth.currentUser.uid,
                city: city,
                data: weatherData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('获取天气数据失败：', error);
        alert('获取天气数据失败，请稍后重试');
    }
}

export function getSolarTerm() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 简化的节气判断逻辑
    const solarTerms = [
        { name: '小寒', start: '1-5' },
        { name: '大寒', start: '1-20' },
        { name: '立春', start: '2-4' },
        { name: '雨水', start: '2-19' },
        { name: '惊蛰', start: '3-5' },
        { name: '春分', start: '3-20' },
        { name: '清明', start: '4-5' },
        { name: '谷雨', start: '4-20' },
        { name: '立夏', start: '5-5' },
        { name: '小满', start: '5-21' },
        { name: '芒种', start: '6-5' },
        { name: '夏至', start: '6-21' },
        { name: '小暑', start: '7-7' },
        { name: '大暑', start: '7-22' },
        { name: '立秋', start: '8-7' },
        { name: '处暑', start: '8-23' },
        { name: '白露', start: '9-7' },
        { name: '秋分', start: '9-23' },
        { name: '寒露', start: '10-8' },
        { name: '霜降', start: '10-23' },
        { name: '立冬', start: '11-7' },
        { name: '小雪', start: '11-22' },
        { name: '大雪', start: '12-7' },
        { name: '冬至', start: '12-22' }
    ];

    let currentTerm = solarTerms[0];
    for (let i = 0; i < solarTerms.length; i++) {
        const [termMonth, termDay] = solarTerms[i].start.split('-').map(Number);
        if (month > termMonth || (month === termMonth && day >= termDay)) {
            currentTerm = solarTerms[i];
        } else {
            break;
        }
    }

    // 更新节气显示
    document.querySelector('#current-term').textContent = currentTerm.name;
    
    // 更新地球公转动画
    const earth = document.querySelector('.earth');
    const termIndex = solarTerms.findIndex(term => term.name === currentTerm.name);
    const angle = (termIndex / 24) * 360;
    earth.style.transform = `rotate(${angle}deg)`;
}
