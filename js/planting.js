// planting.js - 处理种植日记相关功能
import { getSolarTerm, getPlantGuidesBySolarTerm } from './weather.js';

// 当前用户ID (实际应用中应从认证服务获取)
let currentUserId = window.config.DEFAULT_USER.id;

// 初始化种植模块
export function initPlanting() {
    console.log('初始化种植模块...');
    
    // 加载植物指南
    loadPlantGuides();
    
    // 加载用户的种植日记
    loadPlantingDiaries();
    
    // 设置事件监听器
    setupEventListeners();
}

// 加载植物指南
async function loadPlantGuides() {
    try {
        // 获取当前节气
        const currentTerm = await getSolarTerm();
        
        // 获取基于节气的植物指南
        const guides = await getPlantGuidesBySolarTerm(currentTerm);
        
        // 更新UI显示植物指南
        const guidesContainer = document.querySelector('#plant-guides');
        if (!guidesContainer) return;
        
        if (guides.length === 0) {
            guidesContainer.innerHTML = '<p class="text-center py-4">当前节气没有可用的植物指南</p>';
            return;
        }
        
        guidesContainer.innerHTML = guides.map(guide => `
            <div class="plant-card bg-white rounded-lg shadow-md overflow-hidden">
                <img src="${guide.imageUrl}" alt="${guide.name}" class="w-full h-40 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold">${guide.name}</h3>
                    <div class="flex items-center mt-1">
                        <span class="text-sm text-gray-600">难度:</span>
                        <div class="ml-2">
                            ${getDifficultyStars(guide.difficulty)}
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">${guide.description.substring(0, 100)}...</p>
                    <button class="start-planting-btn mt-3 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600" 
                            data-plant-id="${guide.id}">
                        开始种植
                    </button>
                </div>
            </div>
        `).join('');
        
        // 为"开始种植"按钮添加事件监听器
        document.querySelectorAll('.start-planting-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const plantId = e.target.getAttribute('data-plant-id');
                const plant = guides.find(g => g.id === plantId);
                if (plant) {
                    showStartPlantingModal(plant);
                }
            });
        });
        
    } catch (error) {
        console.error('加载植物指南失败:', error);
        const guidesContainer = document.querySelector('#plant-guides');
        if (guidesContainer) {
            guidesContainer.innerHTML = '<p class="text-center py-4 text-red-500">加载植物指南失败，请稍后重试</p>';
        }
    }
}

// 加载用户的种植日记
async function loadPlantingDiaries() {
    try {
        // 从API获取用户的种植日记
        const url = `${window.config.API_BASE_URL}${window.config.API_ENDPOINTS.GET_DIARIES}?userId=${currentUserId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`获取种植日记失败: ${response.status}`);
        }
        
        const diaries = await response.json();
        
        // 更新UI显示种植日记
        const diariesContainer = document.querySelector('#planting-diaries');
        if (!diariesContainer) return;
        
        if (diaries.length === 0) {
            diariesContainer.innerHTML = '<p class="text-center py-4">您还没有种植日记，开始您的第一次种植吧！</p>';
            return;
        }
        
        // 按开始日期排序（最新的在前面）
        diaries.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        
        diariesContainer.innerHTML = diaries.map(diary => `
            <div class="diary-card bg-white rounded-lg shadow-md overflow-hidden mb-4">
                <div class="p-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">${diary.plantName}</h3>
                        <span class="text-sm ${diary.completed ? 'text-green-500' : 'text-blue-500'}">
                            ${diary.completed ? '已完成' : '进行中'}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">开始日期: ${formatDate(diary.startDate)}</p>
                    <p class="text-sm text-gray-600">记录数: ${diary.logs?.length || 0}</p>
                    <div class="mt-3 flex justify-between">
                        <button class="view-diary-btn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" 
                                data-diary-id="${diary.id}">
                            查看详情
                        </button>
                        ${!diary.completed ? `
                            <button class="add-log-btn bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" 
                                    data-diary-id="${diary.id}">
                                添加记录
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        // 为按钮添加事件监听器
        document.querySelectorAll('.view-diary-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const diaryId = e.target.getAttribute('data-diary-id');
                const diary = diaries.find(d => d.id === diaryId);
                if (diary) {
                    showDiaryDetails(diary);
                }
            });
        });
        
        document.querySelectorAll('.add-log-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const diaryId = e.target.getAttribute('data-diary-id');
                const diary = diaries.find(d => d.id === diaryId);
                if (diary) {
                    showAddLogModal(diary);
                }
            });
        });
        
    } catch (error) {
        console.error('加载种植日记失败:', error);
        const diariesContainer = document.querySelector('#planting-diaries');
        if (diariesContainer) {
            diariesContainer.innerHTML = '<p class="text-center py-4 text-red-500">加载种植日记失败，请稍后重试</p>';
        }
    }
}

// 创建新的种植日记
async function createPlantingDiary(plantId, plantName, notes) {
    try {
        // 准备请求数据
        const diaryData = {
            userId: currentUserId,
            plantId: plantId,
            plantName: plantName,
            notes: notes,
            startDate: new Date().toISOString(),
            completed: false,
            logs: []
        };
        
        // 发送创建日记请求
        const response = await fetch(`${window.config.API_BASE_URL}${window.config.API_ENDPOINTS.CREATE_DIARY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUserId // 简单认证，实际应使用令牌
            },
            body: JSON.stringify(diaryData)
        });
        
        if (!response.ok) {
            throw new Error(`创建种植日记失败: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('种植日记创建成功:', result);
        
        // 重新加载种植日记列表
        loadPlantingDiaries();
        
        // 显示成功消息
        alert('种植日记创建成功！');
        
        // 关闭模态框
        const modal = document.querySelector('#start-planting-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
    } catch (error) {
        console.error('创建种植日记失败:', error);
        alert('创建种植日记失败，请稍后重试');
    }
}

// 添加种植记录
async function addPlantingLog(diaryId, content, imageFile) {
    try {
        let imageUrl = '';
        
        // 如果有图片，先上传图片
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'diary');
        }
        
        // 准备请求数据
        const logData = {
            content: content,
            imageUrl: imageUrl
        };
        
        // 发送添加记录请求
        const response = await fetch(`${window.config.API_BASE_URL}${window.config.API_ENDPOINTS.ADD_DIARY_LOG(diaryId)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUserId // 简单认证，实际应使用令牌
            },
            body: JSON.stringify(logData)
        });
        
        if (!response.ok) {
            throw new Error(`添加种植记录失败: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('种植记录添加成功:', result);
        
        // 重新加载种植日记列表
        loadPlantingDiaries();
        
        // 显示成功消息
        alert('种植记录添加成功！');
        
        // 关闭模态框
        const modal = document.querySelector('#add-log-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
    } catch (error) {
        console.error('添加种植记录失败:', error);
        alert('添加种植记录失败，请稍后重试');
    }
}

// 完成种植日记
async function completePlantingDiary(diaryId) {
    try {
        // 发送完成日记请求
        const response = await fetch(`${window.config.API_BASE_URL}${window.config.API_ENDPOINTS.COMPLETE_DIARY(diaryId)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUserId // 简单认证，实际应使用令牌
            },
            body: JSON.stringify({ completed: true })
        });
        
        if (!response.ok) {
            throw new Error(`完成种植日记失败: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('种植日记已标记为完成:', result);
        
        // 重新加载种植日记列表
        loadPlantingDiaries();
        
        // 显示成功消息
        alert('恭喜！您的种植已成功完成！');
        
        // 关闭详情模态框
        const modal = document.querySelector('#diary-details-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
    } catch (error) {
        console.error('完成种植日记失败:', error);
        alert('完成种植日记失败，请稍后重试');
    }
}

// 上传图片
async function uploadImage(file, type) {
    try {
        // 检查文件类型和大小
        if (!window.config.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
            throw new Error('不支持的图片类型');
        }
        
        if (file.size > window.config.MAX_IMAGE_SIZE) {
            throw new Error(`图片大小不能超过 ${window.config.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
        }
        
        // 将文件转换为 Base64
        const base64Image = await fileToBase64(file);
        
        // 发送上传请求
        const response = await fetch(`${window.config.API_BASE_URL}${window.config.API_ENDPOINTS.UPLOAD_IMAGE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUserId // 简单认证，实际应使用令牌
            },
            body: JSON.stringify({
                image: base64Image,
                type: type // 'diary', 'post', 或 'avatar'
            })
        });
        
        if (!response.ok) {
            throw new Error(`上传图片失败: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('图片上传成功:', result);
        
        return result.imageUrl;
        
    } catch (error) {
        console.error('上传图片失败:', error);
        throw error; // 将错误传递给调用者
    }
}

// 将文件转换为 Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// 显示开始种植模态框
function showStartPlantingModal(plant) {
    const modalHtml = `
        <div id="start-planting-modal" class="modal fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full">
                <h2 class="text-xl font-bold mb-4">开始种植 ${plant.name}</h2>
                <div class="mb-4">
                    <img src="${plant.imageUrl}" alt="${plant.name}" class="w-full h-40 object-cover rounded">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">备注:</label>
                    <textarea id="planting-notes" class="w-full border rounded p-2" rows="3" placeholder="添加您的种植备注..."></textarea>
                </div>
                <div class="flex justify-end">
                    <button id="cancel-planting-btn" class="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400">取消</button>
                    <button id="confirm-planting-btn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">开始种植</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框到 DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 设置事件监听器
    document.getElementById('cancel-planting-btn').addEventListener('click', () => {
        document.getElementById('start-planting-modal').remove();
    });
    
    document.getElementById('confirm-planting-btn').addEventListener('click', () => {
        const notes = document.getElementById('planting-notes').value;
        createPlantingDiary(plant.id, plant.name, notes);
    });
}

// 显示添加记录模态框
function showAddLogModal(diary) {
    const modalHtml = `
        <div id="add-log-modal" class="modal fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full">
                <h2 class="text-xl font-bold mb-4">为 ${diary.plantName} 添加记录</h2>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">记录内容:</label>
                    <textarea id="log-content" class="w-full border rounded p-2" rows="3" placeholder="描述您的植物生长情况..."></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">上传图片 (可选):</label>
                    <input type="file" id="log-image" accept="image/*" class="w-full">
                </div>
                <div class="flex justify-end">
                    <button id="cancel-log-btn" class="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400">取消</button>
                    <button id="confirm-log-btn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">添加记录</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框到 DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 设置事件监听器
    document.getElementById('cancel-log-btn').addEventListener('click', () => {
        document.getElementById('add-log-modal').remove();
    });
    
    document.getElementById('confirm-log-btn').addEventListener('click', () => {
        const content = document.getElementById('log-content').value;
        const imageFile = document.getElementById('log-image').files[0];
        
        if (!content) {
            alert('请输入记录内容');
            return;
        }
        
        addPlantingLog(diary.id, content, imageFile);
    });
}

// 显示日记详情
function showDiaryDetails(diary) {
    // 格式化日志
    const logsHtml = diary.logs && diary.logs.length > 0 
        ? diary.logs.map(log => `
            <div class="log-entry border-b pb-3 mb-3">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">${formatDate(log.date)}</span>
                </div>
                <p class="my-2">${log.content}</p>
                ${log.image ? `<img src="${log.image}" alt="记录图片" class="w-full h-40 object-cover rounded">` : ''}
            </div>
        `).join('')
        : '<p class="text-center py-4">暂无记录</p>';
    
    const modalHtml = `
        <div id="diary-details-modal" class="modal fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="modal-content bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">${diary.plantName} 的种植日记</h2>
                    <span class="text-sm ${diary.completed ? 'text-green-500' : 'text-blue-500'}">
                        ${diary.completed ? '已完成' : '进行中'}
                    </span>
                </div>
                <div class="mb-4">
                    <p class="text-sm text-gray-600">开始日期: ${formatDate(diary.startDate)}</p>
                    ${diary.completionDate ? `<p class="text-sm text-gray-600">完成日期: ${formatDate(diary.completionDate)}</p>` : ''}
                    ${diary.notes ? `<p class="mt-2">备注: ${diary.notes}</p>` : ''}
                </div>
                <div class="logs-container mt-4">
                    <h3 class="text-lg font-semibold mb-3">生长记录</h3>
                    ${logsHtml}
                </div>
                <div class="flex justify-end mt-4">
                    ${!diary.completed ? `
                        <button id="complete-diary-btn" class="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600">
                            标记为完成
                        </button>
                    ` : ''}
                    <button id="close-details-btn" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框到 DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 设置事件监听器
    document.getElementById('close-details-btn').addEventListener('click', () => {
        document.getElementById('diary-details-modal').remove();
    });
    
    if (!diary.completed) {
        document.getElementById('complete-diary-btn').addEventListener('click', () => {
            if (confirm('确定要将此种植标记为完成吗？')) {
                completePlantingDiary(diary.id);
            }
        });
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 可以在这里添加全局事件监听器
}

// 工具函数：获取难度星级显示
function getDifficultyStars(difficulty) {
    const maxStars = 5;
    const filledStars = Math.min(Math.max(difficulty, 1), maxStars);
    
    let starsHtml = '';
    for (let i = 1; i <= maxStars; i++) {
        if (i <= filledStars) {
            starsHtml += '<span class="text-yellow-500">★</span>';
        } else {
            starsHtml += '<span class="text-gray-300">★</span>';
        }
    }
    
    return starsHtml;
}

// 工具函数：格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 导出函数
export { 
    loadPlantGuides, 
    loadPlantingDiaries, 
    createPlantingDiary as startPlanting, 
    addPlantingLog as addGrowthLog, 
    completePlantingDiary as completePlanting 
};
