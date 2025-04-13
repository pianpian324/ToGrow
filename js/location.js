/**
 * location.js - 处理位置获取和天气显示功能
 */
import { debug } from './debug.js';

// 状态常量
const LOCATION_STATUS = {
    INITIAL: 'initial',
    REQUESTING: 'requesting',
    SUCCESS: 'success',
    ERROR: 'error'
};

// 全局状态
const state = {
    locationStatus: LOCATION_STATUS.INITIAL,
    currentCity: null,
    lastLocation: null,
    errorType: null
};

// 初始化位置功能
export function initLocation() {
    debug.log('初始化位置功能...');
    
    // 确保DOM已加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            debug.log('DOM加载完成，设置位置功能');
            setupLocation();
        });
    } else {
        debug.log('DOM已加载，立即设置位置功能');
        setupLocation();
    }
}

// 设置位置功能
function setupLocation() {
    debug.log('设置位置功能开始...');
    
    // 查找位置按钮
    const locationButton = document.getElementById('get-location-btn');
    if (locationButton) {
        debug.log('找到位置按钮，添加点击事件');
        locationButton.addEventListener('click', requestLocation);
    } else {
        debug.error('找不到位置获取按钮 #get-location-btn');
        // 如果找不到按钮，尝试添加浮动按钮
        addFloatingLocationButton();
    }
    
    // 尝试从本地存储加载上次的位置
    loadLastLocationFromStorage();
}

// 添加浮动位置按钮（备选方案）
function addFloatingLocationButton() {
    debug.log('添加浮动位置按钮');
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'fixed bottom-4 right-4 z-50';
    buttonContainer.innerHTML = `
        <button id="get-location-btn-float" class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full shadow-lg transition-colors duration-300 flex items-center justify-center">
            <i class="fas fa-map-marker-alt mr-2"></i> 获取位置
        </button>
    `;
    document.body.appendChild(buttonContainer);
    debug.log('浮动按钮已添加到body');
    
    const floatButton = document.getElementById('get-location-btn-float');
    if (floatButton) {
        floatButton.addEventListener('click', requestLocation);
        debug.log('浮动位置获取按钮已绑定事件');
    } else {
        debug.error('无法找到浮动位置按钮');
    }
}

// 从本地存储加载上次的位置
function loadLastLocationFromStorage() {
    try {
        const savedLocation = localStorage.getItem('togrow_last_location');
        if (savedLocation) {
            const locationData = JSON.parse(savedLocation);
            debug.log('从本地存储加载上次位置:', locationData);
            
            // 检查数据是否有效且未过期（24小时内）
            const now = new Date().getTime();
            const savedTime = locationData.timestamp || 0;
            const isValid = now - savedTime < 24 * 60 * 60 * 1000; // 24小时内
            
            if (isValid && locationData.city) {
                state.lastLocation = locationData;
                updateLocationStatus(`上次位置: ${locationData.city}`);
                getWeatherByCity(locationData.city);
                return true;
            } else {
                debug.log('存储的位置已过期或无效');
                localStorage.removeItem('togrow_last_location');
            }
        }
    } catch (error) {
        debug.error('加载本地存储位置失败:', error);
    }
    
    // 如果没有有效的存储位置，使用默认城市
    debug.log('使用默认城市');
    updateLocationStatus('使用默认位置');
    getWeatherByCity('北京');
    return false;
}

// 保存位置到本地存储
function saveLocationToStorage(city, latitude, longitude) {
    try {
        const locationData = {
            city: city,
            latitude: latitude,
            longitude: longitude,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('togrow_last_location', JSON.stringify(locationData));
        debug.log('位置已保存到本地存储:', locationData);
    } catch (error) {
        debug.error('保存位置到本地存储失败:', error);
    }
}

// 请求位置权限
function requestLocation() {
    debug.log('请求位置权限...');
    updateLocationStatus('正在请求位置权限...');
    state.locationStatus = LOCATION_STATUS.REQUESTING;
    
    // 更新UI状态
    updateLocationButtonState(true);
    
    if (!navigator.geolocation) {
        const message = '您的浏览器不支持地理位置功能';
        debug.error(message);
        updateLocationStatus(message);
        showLocationHelp('browser-not-support');
        state.locationStatus = LOCATION_STATUS.ERROR;
        state.errorType = 'browser-not-support';
        updateLocationButtonState(false);
        return;
    }
    
    // 请求位置权限
    navigator.geolocation.getCurrentPosition(
        // 成功回调
        function(position) {
            debug.log('获取位置成功: ' + position.coords.latitude + ', ' + position.coords.longitude);
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            updateLocationStatus(`已获取位置: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            
            // 根据经纬度获取城市名称
            getLocationName(latitude, longitude)
                .then(city => {
                    if (city) {
                        updateLocationStatus(`您当前位置: ${city}`);
                        getWeatherByCity(city);
                        saveLocationToStorage(city, latitude, longitude);
                        state.currentCity = city;
                        state.locationStatus = LOCATION_STATUS.SUCCESS;
                    } else {
                        updateLocationStatus('无法确定城市名称，使用默认城市');
                        getWeatherByCity('北京');
                        state.locationStatus = LOCATION_STATUS.ERROR;
                        state.errorType = 'city-not-found';
                    }
                    updateLocationButtonState(false);
                })
                .catch(error => {
                    debug.error('获取城市名称失败: ' + error);
                    updateLocationStatus('获取城市名称失败，使用默认城市');
                    getWeatherByCity('北京');
                    state.locationStatus = LOCATION_STATUS.ERROR;
                    state.errorType = 'reverse-geo-failed';
                    updateLocationButtonState(false);
                });
        },
        // 错误回调
        function(error) {
            debug.error('获取位置失败: ' + error.code);
            let errorMsg = '';
            let helpType = '';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = '您拒绝了位置访问请求';
                    helpType = 'permission-denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = '位置信息不可用';
                    helpType = 'position-unavailable';
                    break;
                case error.TIMEOUT:
                    errorMsg = '获取位置超时';
                    helpType = 'timeout';
                    break;
                default:
                    errorMsg = '未知错误';
                    helpType = 'unknown';
            }
            
            debug.error(errorMsg);
            updateLocationStatus(`${errorMsg}，使用默认城市`);
            showLocationHelp(helpType);
            getWeatherByCity('北京');
            
            state.locationStatus = LOCATION_STATUS.ERROR;
            state.errorType = helpType;
            updateLocationButtonState(false);
        },
        // 选项
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// 更新位置按钮状态
function updateLocationButtonState(isLoading) {
    const locationButton = document.getElementById('get-location-btn');
    const floatButton = document.getElementById('get-location-btn-float');
    
    const buttons = [locationButton, floatButton].filter(btn => btn !== null);
    
    buttons.forEach(button => {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> 获取中...`;
            button.classList.add('opacity-75');
        } else {
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-map-marker-alt mr-2"></i> 获取我的位置`;
            button.classList.remove('opacity-75');
        }
    });
}

// 显示位置权限帮助信息
function showLocationHelp(type) {
    let helpMessage = '';
    switch (type) {
        case 'permission-denied':
            helpMessage = `
                <div class="location-help">
                    <h4 class="font-bold mb-2">如何启用位置权限？</h4>
                    <p>您需要在浏览器中允许网站访问位置信息：</p>
                    <ol class="list-decimal pl-5 my-2">
                        <li>点击浏览器地址栏左侧的锁头/感叹号图标</li>
                        <li>找到"位置"或"Location"选项</li>
                        <li>将其设置为"允许"或"Ask"</li>
                        <li>刷新页面并再次点击"获取位置"按钮</li>
                    </ol>
                </div>
            `;
            break;
        case 'position-unavailable':
            helpMessage = `
                <div class="location-help">
                    <h4 class="font-bold mb-2">位置信息不可用</h4>
                    <p>请确保您的设备GPS已开启，并且在可以获取位置信息的环境中。</p>
                    <p class="mt-2">如果您使用的是桌面设备，位置精度可能较低。</p>
                </div>
            `;
            break;
        case 'timeout':
            helpMessage = `
                <div class="location-help">
                    <h4 class="font-bold mb-2">获取位置超时</h4>
                    <p>请检查您的网络连接并重试。</p>
                    <p class="mt-2">如果问题持续存在，您可以手动选择城市。</p>
                </div>
            `;
            break;
        case 'browser-not-support':
            helpMessage = `
                <div class="location-help">
                    <h4 class="font-bold mb-2">浏览器不支持位置功能</h4>
                    <p>您的浏览器不支持位置功能，建议使用较新版本的Chrome、Firefox或Edge浏览器。</p>
                </div>
            `;
            break;
        default:
            helpMessage = `
                <div class="location-help">
                    <h4 class="font-bold mb-2">获取位置失败</h4>
                    <p>获取位置时发生错误，请稍后重试。</p>
                </div>
            `;
    }
    
    const helpElement = document.getElementById('location-help');
    if (helpElement) {
        helpElement.innerHTML = helpMessage;
        helpElement.style.display = 'block';
    } else {
        // 如果帮助元素不存在，创建一个新的
        const div = document.createElement('div');
        div.id = 'location-help';
        div.className = 'help-message mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm';
        div.innerHTML = helpMessage;
        
        // 尝试找到合适的容器
        const container = document.querySelector('.bg-gray-50') || document.getElementById('weather') || document.body;
        container.appendChild(div);
    }
}

// 更新位置状态显示
function updateLocationStatus(message) {
    debug.log('更新位置状态: ' + message);
    const locationElement = document.getElementById('user-location');
    if (locationElement) {
        locationElement.textContent = message;
        debug.log('已更新位置元素');
    } else {
        debug.error('找不到位置显示元素 #user-location');
    }
}

// 根据经纬度获取位置名称
async function getLocationName(latitude, longitude) {
    try {
        debug.log(`尝试获取位置名称: ${latitude}, ${longitude}`);
        
        // 使用后端代理获取反向地理编码
        const url = `${window.config.API_BASE_URL}/api/proxy/reverse-geo?lat=${latitude}&lon=${longitude}`;
        debug.log('反向地理编码代理 URL: ' + url);
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to get error details
            throw new Error(`获取位置名称失败: ${response.status} - ${errorData.error || '未知错误'}`);
        }
        
        const data = await response.json(); // Proxy returns the first result object
        debug.log('获取到位置数据: ' + JSON.stringify(data));
        
        if (data) {
            // 尝试从 local_names 获取中文名，否则回退到 name
            const cityName = (data.local_names && data.local_names.zh) ? data.local_names.zh : data.name;
            if (cityName) {
                 return cityName;
            } else {
                 throw new Error('无法从返回数据中解析城市名称');
            }
        } else {
            throw new Error('无法解析位置信息');
        }
    } catch (error) {
        debug.error('获取位置名称失败: ' + error);
        return null;
    }
}

// 根据城市名称获取天气
export async function getWeatherByCity(city) {
    try {
        debug.log(`获取城市天气: ${city}`);
        updateWeatherStatus('正在获取天气数据...');
        
        // 使用后端代理获取天气数据
        const url = `${window.config.API_BASE_URL}/api/proxy/weather?city=${encodeURIComponent(city)}&units=metric&lang=zh_cn`;
        debug.log('天气代理 URL: ' + url);
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `HTTP错误: ${response.status}`;
            debug.error('获取天气数据失败:', errorMessage);
            updateWeatherStatus(`获取天气数据失败: ${errorMessage}`);
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        debug.log('获取到天气数据:', data);
        
        // 更新天气显示
        updateWeatherDisplay(data);
        return data;
    } catch (error) {
        debug.error('获取天气数据时发生错误:', error);
        updateWeatherStatus(error.message || '获取天气数据失败');
        throw error;
    }
}

// 获取天气预报
async function getWeatherForecast(city) {
    try {
        debug.log(`(未启用) 获取城市天气预报: ${city}`);
        // This function still needs a backend proxy
        return null; // Return early
    } catch (error) {
        debug.error('获取天气预报失败: ' + error);
        return null;
    }
}

// 获取API密钥
function getApiKey() {
    // 尝试从不同来源获取API密钥
    let apiKey;
    
    // 1. 尝试从全局config对象获取
    if (typeof window.config !== 'undefined' && window.config.WEATHER_API && window.config.WEATHER_API.KEY) {
        apiKey = window.config.WEATHER_API.KEY;
        debug.log('使用全局config对象中的API密钥');
    } 
    // 2. 尝试从URL参数获取
    else {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            apiKey = urlParams.get('weather_api_key');
            if (apiKey) {
                debug.log('使用URL参数中的API密钥');
            } else {
                apiKey = 'YOUR_API_KEY'; // 默认密钥（需要替换为有效密钥）
                debug.warn('未找到API密钥，使用默认密钥');
            }
        } catch (e) {
            apiKey = 'YOUR_API_KEY'; // 默认密钥
            debug.error('获取API密钥失败，使用默认密钥: ' + e);
        }
    }
    
    return apiKey;
}

// 更新天气状态显示
function updateWeatherStatus(message) {
    debug.log('更新天气状态: ' + message);
    const conditionElement = document.getElementById('current-condition');
    if (conditionElement) {
        conditionElement.textContent = message;
        debug.log('已更新天气状态元素');
    } else {
        debug.error('找不到天气状态元素 #current-condition');
    }
}

// 更新天气显示
function updateWeatherDisplay(data) {
    if (!data) return;
    
    debug.log('更新天气显示');
    
    const tempElement = document.getElementById('current-temp');
    const humidityElement = document.getElementById('current-humidity');
    const windElement = document.getElementById('current-wind');
    const conditionElement = document.getElementById('current-condition');
    const iconElement = document.getElementById('weather-icon');
    
    if (tempElement) {
        tempElement.textContent = `${Math.round(data.main.temp)}°C`;
        debug.log(`更新温度: ${Math.round(data.main.temp)}°C`);
    } else {
        debug.error('找不到温度元素 #current-temp');
    }
    
    if (humidityElement) {
        humidityElement.textContent = `${data.main.humidity}%`;
        debug.log(`更新湿度: ${data.main.humidity}%`);
    } else {
        debug.error('找不到湿度元素 #current-humidity');
    }
    
    if (windElement) {
        windElement.textContent = `${data.wind.speed} m/s`;
        debug.log(`更新风速: ${data.wind.speed} m/s`);
    } else {
        debug.error('找不到风速元素 #current-wind');
    }
    
    if (conditionElement) {
        conditionElement.textContent = data.weather[0].description;
        debug.log(`更新天气状态: ${data.weather[0].description}`);
    } else {
        debug.error('找不到天气状态元素 #current-condition');
    }
    
    if (iconElement) {
        iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        iconElement.style.display = 'block';
        debug.log(`更新天气图标: ${data.weather[0].icon}`);
    } else {
        debug.error('找不到天气图标元素 #weather-icon');
    }
}

// 更新天气预报显示
function updateForecastDisplay(data) {
    if (!data || !data.list) return;
    
    debug.log('更新天气预报显示');
    
    const forecastContainer = document.getElementById('weather-forecast');
    if (!forecastContainer) {
        debug.error('找不到天气预报容器 #weather-forecast');
        return;
    }
    
    // 处理预报数据（每天一条，取中午12点的数据）
    const dailyForecasts = {};
    
    data.list.forEach(item => {
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
    const forecasts = Object.values(dailyForecasts)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5); // 只取5天
    
    // 更新预报显示
    if (forecasts.length > 0) {
        forecastContainer.innerHTML = forecasts.map(day => `
            <div class="flex items-center justify-between py-2">
                <span class="text-gray-600">${formatDate(day.date)}</span>
                <span class="font-medium">${day.temp}°C</span>
                <span class="text-gray-600">${day.condition}</span>
                ${day.icon ? `<img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.condition}" class="w-8 h-8">` : ''}
            </div>
        `).join('');
        debug.log(`更新了${forecasts.length}天的天气预报`);
    } else {
        forecastContainer.innerHTML = '<div class="py-2 text-center text-gray-500">无法获取天气预报</div>';
        debug.warn('没有可用的天气预报数据');
    }
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}
