// weather.js - 处理天气和节气相关功能
import { updateSolarTermDescription, updateSeasonalFlowers } from './ui.js';

// 初始化天气和节气模块
export function initWeather() {
    console.log('初始化天气和节气模块...');
    
    // 确保DOM已加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initWeatherAndLocation();
        });
    } else {
        initWeatherAndLocation();
    }
}

// 初始化天气和位置
function initWeatherAndLocation() {
    // 获取节气信息
    getSolarTerm()
        .then(currentTerm => {
            console.log(`当前节气: ${currentTerm}`);
            // 更新节气描述和季节性花卉
            updateSolarTermDescription(currentTerm);
            updateSeasonalFlowers(currentTerm);
        })
        .catch(error => {
            console.error('初始化节气失败:', error);
        });
        
    // 主动请求位置权限并显示提示
    const locationStatus = document.querySelector('#user-location');
    if (locationStatus) {
        locationStatus.textContent = '正在请求位置权限...';
    }
    
    // 强制请求位置权限
    requestLocationPermission();
}

// 请求位置权限
function requestLocationPermission() {
    if (!navigator.geolocation) {
        updateLocationStatus('您的浏览器不支持地理位置功能');
        getWeatherData('北京'); // 使用默认城市
        return;
    }
    
    // 显示位置请求对话框
    const locationDialog = document.createElement('div');
    locationDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    locationDialog.id = 'location-dialog';
    locationDialog.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md">
            <h3 class="text-xl font-bold text-gray-800 mb-4">位置访问请求</h3>
            <p class="text-gray-700 mb-4">ToGrow需要访问您的位置以提供本地天气信息和种植建议。</p>
            <div class="flex justify-end space-x-4">
                <button id="deny-location" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">拒绝</button>
                <button id="allow-location" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">允许</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(locationDialog);
    
    // 添加按钮事件
    document.getElementById('allow-location').addEventListener('click', () => {
        locationDialog.remove();
        getUserLocation();
    });
    
    document.getElementById('deny-location').addEventListener('click', () => {
        locationDialog.remove();
        updateLocationStatus('位置访问被拒绝，显示默认城市天气');
        getWeatherData('北京'); // 使用默认城市
    });
}

// 更新位置状态显示
function updateLocationStatus(message) {
    const locationStatus = document.querySelector('#user-location');
    if (locationStatus) {
        locationStatus.textContent = message;
    }
}

// 获取用户地理位置
export function getUserLocation() {
    updateLocationStatus('正在获取您的位置...');
    
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            updateLocationStatus('您的浏览器不支持地理位置功能');
            reject(new Error('您的浏览器不支持地理位置功能'));
            getWeatherData('北京'); // 使用默认城市
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            position => {
                console.log('成功获取位置:', position.coords);
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                
                // 获取到位置后立即使用
                getLocationName(position.coords.latitude, position.coords.longitude)
                    .then(locationName => {
                        console.log(`用户所在地: ${locationName}`);
                        return getWeatherData(locationName);
                    });
            },
            error => {
                console.error('获取地理位置失败:', error.message);
                let errorMsg = '无法获取位置';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = '位置访问被拒绝';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = '位置信息不可用';
                        break;
                    case error.TIMEOUT:
                        errorMsg = '获取位置超时';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMsg = '未知位置错误';
                        break;
                }
                
                updateLocationStatus(`${errorMsg}，显示默认城市天气`);
                getWeatherData('北京'); // 使用默认城市
                reject(error);
            },
            { 
                timeout: 10000, 
                enableHighAccuracy: true,
                maximumAge: 0 // 不使用缓存
            }
        );
    });
}

// 根据经纬度获取位置名称（反向地理编码）
export async function getLocationName(latitude, longitude) {
    try {
        console.log(`尝试获取位置名称，经度: ${longitude}, 纬度: ${latitude}`);
        updateLocationStatus('正在解析您的位置...');
        
        // 使用 OpenWeatherMap 的地理编码 API
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${window.config.WEATHER_API.KEY}`);
        
        if (!response.ok) {
            throw new Error(`获取位置名称失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('获取到位置数据:', data);
        
        if (data && data.length > 0) {
            // 显示用户所在位置
            const locationName = data[0].name;
            const country = data[0].country;
            displayUserLocation(locationName, country);
            return locationName;
        } else {
            throw new Error('无法解析位置信息');
        }
    } catch (error) {
        console.error('获取位置名称失败:', error);
        updateLocationStatus('无法解析位置，显示默认城市天气');
        return '北京'; // 返回默认城市
    }
}

// 显示用户位置
function displayUserLocation(city, country) {
    updateLocationStatus(country ? `${city}, ${country}` : city);
}

// 获取天气数据
export async function getWeatherData(city) {
    try {
        console.log(`尝试获取城市天气: ${city}`);
        
        // 更新天气加载状态
        updateWeatherLoadingState(true);
        
        // 使用OpenWeatherMap API获取天气数据
        const currentWeatherUrl = `${window.config.WEATHER_API.BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${window.config.WEATHER_API.UNITS}&lang=zh_cn&appid=${window.config.WEATHER_API.KEY}`;
        const forecastUrl = `${window.config.WEATHER_API.BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${window.config.WEATHER_API.UNITS}&lang=zh_cn&appid=${window.config.WEATHER_API.KEY}`;
        
        console.log('当前天气URL:', currentWeatherUrl);
        console.log('天气预报URL:', forecastUrl);
        
        // 并行请求当前天气和预报
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);
        
        if (!currentResponse.ok) {
            console.error(`获取当前天气失败: ${currentResponse.status}`);
            throw new Error(`获取当前天气失败: ${currentResponse.status}`);
        }
        
        if (!forecastResponse.ok) {
            console.error(`获取天气预报失败: ${forecastResponse.status}`);
            throw new Error(`获取天气预报失败: ${forecastResponse.status}`);
        }
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        console.log('获取到当前天气数据:', currentData);
        console.log('获取到天气预报数据:', forecastData);
        
        // 处理当前天气数据
        const weatherData = {
            current: {
                temp: Math.round(currentData.main.temp),
                humidity: currentData.main.humidity,
                wind: currentData.wind.speed,
                condition: currentData.weather[0].description,
                icon: currentData.weather[0].icon
            },
            forecast: []
        };
        
        // 处理预报数据（每天一条，取中午12点的数据）
        const dailyForecasts = {};
        
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            // 如果这一天还没有数据，或者是中午12点左右的数据，则保存
            if (!dailyForecasts[dateStr] || 
                (date.getHours() >= 11 && date.getHours() <= 13)) {
                dailyForecasts[dateStr] = {
                    date: dateStr,
                    temp: Math.round(item.main.temp),
                    condition: item.weather[0].description,
                    icon: item.weather[0].icon
                };
            }
        });
        
        // 转换为数组并排序
        weatherData.forecast = Object.values(dailyForecasts)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 5); // 只取5天
        
        // 更新UI
        displayWeatherData(weatherData);
        
        return weatherData;
    } catch (error) {
        console.error('获取天气数据失败:', error);
        
        // 显示错误信息
        const errorData = {
            current: {
                temp: '--',
                humidity: '--',
                wind: '--',
                condition: '获取失败'
            },
            forecast: []
        };
        
        displayWeatherData(errorData);
        return errorData;
    } finally {
        // 无论成功失败都关闭加载状态
        updateWeatherLoadingState(false);
    }
}

// 更新天气加载状态
function updateWeatherLoadingState(isLoading) {
    const weatherContainer = document.querySelector('#weather .bg-white');
    if (weatherContainer) {
        if (isLoading) {
            // 添加加载指示器
            if (!document.getElementById('weather-loading')) {
                const loadingIndicator = document.createElement('div');
                loadingIndicator.id = 'weather-loading';
                loadingIndicator.className = 'absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10';
                loadingIndicator.innerHTML = `
                    <div class="flex flex-col items-center">
                        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-2"></div>
                        <div class="text-green-600 font-medium">正在加载天气数据...</div>
                    </div>
                `;
                weatherContainer.style.position = 'relative';
                weatherContainer.appendChild(loadingIndicator);
            }
        } else {
            // 移除加载指示器
            const loadingIndicator = document.getElementById('weather-loading');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        }
    }
}

// 显示天气数据
function displayWeatherData(weatherData) {
    console.log('显示天气数据:', weatherData);
    
    // 更新当前天气
    const tempElement = document.querySelector('#current-temp');
    const humidityElement = document.querySelector('#current-humidity');
    const windElement = document.querySelector('#current-wind');
    const conditionElement = document.querySelector('#current-condition');
    
    if (tempElement) tempElement.textContent = `${weatherData.current.temp}°C`;
    if (humidityElement) humidityElement.textContent = `${weatherData.current.humidity}%`;
    if (windElement) windElement.textContent = `${weatherData.current.wind} m/s`;
    if (conditionElement) conditionElement.textContent = weatherData.current.condition;
    
    // 如果有天气图标，显示图标
    if (weatherData.current.icon) {
        const iconElement = document.querySelector('#weather-icon');
        if (iconElement) {
            iconElement.src = `https://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`;
            iconElement.style.display = 'block';
        }
    }
    
    // 更新天气预报
    const forecastContainer = document.querySelector('#weather-forecast');
    if (forecastContainer && weatherData.forecast.length > 0) {
        forecastContainer.innerHTML = weatherData.forecast.map(day => `
            <div class="flex items-center justify-between py-2">
                <span class="text-gray-600">${formatDate(day.date)}</span>
                <span class="font-medium">${day.temp}°C</span>
                <span class="text-gray-600">${day.condition}</span>
                ${day.icon ? `<img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.condition}" class="w-8 h-8">` : ''}
            </div>
        `).join('');
    } else if (forecastContainer) {
        forecastContainer.innerHTML = '<div class="py-2 text-center text-gray-500">无法获取天气预报</div>';
    }
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 获取当前节气
export async function getSolarTerm() {
    try {
        // 使用腾讯云API获取节气信息
        const response = await fetch(`${window.config.API_BASE_URL}${window.config.API_ENDPOINTS.GET_SOLAR_TERM}`);
        
        if (!response.ok) {
            throw new Error(`获取节气失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('获取到节气数据:', data);
        
        const currentTerm = data.name; // 使用name字段获取节气名称
        const dateRange = data.dateRange; // 节气日期范围
        
        // 更新UI显示当前节气
        displaySolarTerm(currentTerm, dateRange);
        
        return currentTerm;
    } catch (error) {
        console.error('获取节气信息失败:', error);
        // 显示默认节气或错误信息
        displaySolarTerm('未知节气', '');
        return '未知节气';
    }
}

// 显示节气信息
function displaySolarTerm(termName, dateRange) {
    // 更新DOM显示节气名称
    const termElement = document.querySelector('#current-term');
    const termDateElement = document.querySelector('#term-date');
    
    if (termElement) {
        termElement.textContent = termName;
    }
    
    if (termDateElement && dateRange) {
        termDateElement.textContent = dateRange;
    } else if (termDateElement) {
        // 如果没有日期范围，使用当前日期
        const now = new Date();
        termDateElement.textContent = `${now.getMonth() + 1}月${now.getDate()}日`;
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
        const url = `${window.config.API_BASE_URL}${window.config.API_ENDPOINTS.PLANT_GUIDES}?season=${encodeURIComponent(solarTerm)}`;
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
