// ui.js - 处理UI交互和界面功能

// 初始化UI功能
export function initUI() {
    console.log('初始化UI功能...');
    setupTabNavigation();
}

// 设置标签页导航
function setupTabNavigation() {
    console.log('设置标签页导航...');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 确保元素存在
    if (tabButtons.length === 0 || tabContents.length === 0) {
        console.error('找不到标签页按钮或内容元素');
        return;
    }
    
    console.log(`找到 ${tabButtons.length} 个标签按钮和 ${tabContents.length} 个内容区域`);
    
    // 为每个标签按钮添加点击事件
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            console.log(`点击了标签: ${tabName}`);
            
            // 移除所有激活状态
            tabButtons.forEach(btn => {
                btn.classList.remove('text-green-600', 'border-green-500');
                btn.classList.add('text-gray-600', 'border-transparent');
            });
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // 激活当前选中的标签
            button.classList.add('text-green-600', 'border-green-500');
            button.classList.remove('text-gray-600', 'border-transparent');
            
            const activeContent = document.getElementById(tabName);
            if (activeContent) {
                activeContent.classList.add('active');
                activeContent.style.display = 'block';
                console.log(`激活内容区域: ${tabName}`);
            } else {
                console.error(`找不到内容区域: ${tabName}`);
            }
        });
    });
    
    // 默认显示第一个标签内容
    if (tabContents.length > 0) {
        tabContents.forEach(content => {
            content.style.display = 'none';
        });
        
        const defaultTab = tabContents[0];
        defaultTab.style.display = 'block';
        defaultTab.classList.add('active');
        
        // 激活第一个按钮
        if (tabButtons.length > 0) {
            tabButtons[0].classList.add('text-green-600', 'border-green-500');
            tabButtons[0].classList.remove('text-gray-600', 'border-transparent');
        }
        
        console.log('已设置默认标签页');
    }
}

// 更新节气描述
export function updateSolarTermDescription(termName) {
    console.log(`更新节气描述: ${termName}`);
    const termDescriptions = {
        '小寒': '小寒是冬季的第五个节气，此时太阳到达黄经285°。天气寒冷但尚未到达最冷的时期，"小寒胜大寒，日短风寒冷"。',
        '大寒': '大寒是冬季的最后一个节气，此时太阳到达黄经300°。一年中最冷的时期，"大寒大寒，防风御寒"。',
        '立春': '立春是春季的第一个节气，此时太阳到达黄经315°。意味着万物开始复苏，"立春之日，天地始交，万物始生"。',
        '雨水': '雨水是春季的第二个节气，此时太阳到达黄经330°。降水开始增多，气温回升，"雨水节气春意浓，沉睡大地渐苏醒"。',
        '惊蛰': '惊蛰是春季的第三个节气，此时太阳到达黄经345°。春雷始鸣，惊醒蛰伏的昆虫，"惊蛰一声雷，万物尽开颜"。',
        '春分': '春分是春季的第四个节气，此时太阳到达黄经0°。昼夜平分，阴阳相半，"春分者，阴阳相半也，故昼夜均而寒暑平"。',
        '清明': '清明是春季的第五个节气，此时太阳到达黄经15°。天气清爽明朗，万物生长，"清明时节雨纷纷，路上行人欲断魂"。',
        '谷雨': '谷雨是春季的最后一个节气，此时太阳到达黄经30°。雨生百谷，润泽大地，"谷雨前后，种瓜种豆"。',
        '立夏': '立夏是夏季的第一个节气，此时太阳到达黄经45°。夏季开始，气温升高，"斗指东南，维为立夏，万物至此皆长大"。',
        '小满': '小满是夏季的第二个节气，此时太阳到达黄经60°。地球在这个位置时，北半球接收的阳光逐渐增多，气温明显升高，农作物开始饱满但尚未完全成熟。"小满者，物至于此小得盈满"。',
        '芒种': '芒种是夏季的第三个节气，此时太阳到达黄经75°。有芒的农作物开始成熟，"芒种者，有芒之谷可稼种矣"。',
        '夏至': '夏至是夏季的第四个节气，此时太阳到达黄经90°。一年中白昼最长的一天，"夏至日长之至，日影短至，故曰夏至"。',
        '小暑': '小暑是夏季的第五个节气，此时太阳到达黄经105°。天气开始炎热但尚未到最热，"小暑过，一日热三分"。',
        '大暑': '大暑是夏季的最后一个节气，此时太阳到达黄经120°。一年中最热的时期，"湿热交蒸，大暑盛夏"。',
        '立秋': '立秋是秋季的第一个节气，此时太阳到达黄经135°。秋季开始，暑气渐退，"立秋之日，暑气犹盛，秋意渐浓"。',
        '处暑': '处暑是秋季的第二个节气，此时太阳到达黄经150°。暑气结束，天气转凉，"处暑过，凉风至"。',
        '白露': '白露是秋季的第三个节气，此时太阳到达黄经165°。天气转凉，早晨草木上有露珠，"白露秋分夜，一夜冷一夜"。',
        '秋分': '秋分是秋季的第四个节气，此时太阳到达黄经180°。昼夜平分，阴阳相半，"秋分者，阴阳相半也，故昼夜均而寒暑平"。',
        '寒露': '寒露是秋季的第五个节气，此时太阳到达黄经195°。气温下降，露水带有寒意，"寒露不寒，大雪不雪"。',
        '霜降': '霜降是秋季的最后一个节气，此时太阳到达黄经210°。天气渐冷，开始有霜，"霜降水返壑，风落木归山"。',
        '立冬': '立冬是冬季的第一个节气，此时太阳到达黄经225°。冬季开始，天气转冷，"立冬之日，水始冰，地始冻"。',
        '小雪': '小雪是冬季的第二个节气，此时太阳到达黄经240°。开始降雪但尚未大雪纷飞，"小雪雪满天，来年必丰年"。',
        '大雪': '大雪是冬季的第三个节气，此时太阳到达黄经255°。降雪量增多，"大雪封地厚，来年麦枕稠"。',
        '冬至': '冬至是冬季的第四个节气，此时太阳到达黄经270°。一年中白昼最短的一天，"冬至一阳生，天下皆春"。',
        '未知节气': '当前节气信息暂未获取，请稍后刷新页面。'
    };
    
    const termDescription = termDescriptions[termName] || termDescriptions['未知节气'];
    const descriptionElement = document.querySelector('#weather p.text-gray-700');
    
    if (descriptionElement) {
        descriptionElement.textContent = termDescription;
        console.log('节气描述已更新');
    } else {
        console.error('找不到节气描述元素');
    }
}

// 显示花朵图片
export function updateSeasonalFlowers(termName) {
    console.log(`更新季节性花朵: ${termName}`);
    const seasonalFlowers = {
        '小寒': { name: '梅花', image: 'https://img.zcool.cn/community/01f9ea5541f3210000019ae9df1533.jpg@1280w_1l_2o_100sh.jpg' },
        '大寒': { name: '水仙', image: 'https://img.zcool.cn/community/0122895541f3210000019ae9b8cd38.jpg@1280w_1l_2o_100sh.jpg' },
        '立春': { name: '迎春花', image: 'https://img.zcool.cn/community/01a4325541f3210000019ae91f4b14.jpg@1280w_1l_2o_100sh.jpg' },
        '雨水': { name: '樱花', image: 'https://img.zcool.cn/community/01c1fd5541f3210000019ae9c1bd7a.jpg@1280w_1l_2o_100sh.jpg' },
        '惊蛰': { name: '杏花', image: 'https://img.zcool.cn/community/01f9ea5541f3210000019ae9df1533.jpg@1280w_1l_2o_100sh.jpg' },
        '春分': { name: '桃花', image: 'https://img.zcool.cn/community/0122895541f3210000019ae9b8cd38.jpg@1280w_1l_2o_100sh.jpg' },
        '清明': { name: '牡丹', image: 'https://img.zcool.cn/community/01a4325541f3210000019ae91f4b14.jpg@1280w_1l_2o_100sh.jpg' },
        '谷雨': { name: '杜鹃', image: 'https://img.zcool.cn/community/01c1fd5541f3210000019ae9c1bd7a.jpg@1280w_1l_2o_100sh.jpg' },
        '立夏': { name: '石榴花', image: 'https://img.zcool.cn/community/01f9ea5541f3210000019ae9df1533.jpg@1280w_1l_2o_100sh.jpg' },
        '小满': { name: '栀子花', image: 'https://img.zcool.cn/community/0122895541f3210000019ae9b8cd38.jpg@1280w_1l_2o_100sh.jpg' },
        '芒种': { name: '荷花', image: 'https://img.zcool.cn/community/01a4325541f3210000019ae91f4b14.jpg@1280w_1l_2o_100sh.jpg' },
        '夏至': { name: '凌霄花', image: 'https://img.zcool.cn/community/01c1fd5541f3210000019ae9c1bd7a.jpg@1280w_1l_2o_100sh.jpg' },
        '小暑': { name: '向日葵', image: 'https://img.zcool.cn/community/01f9ea5541f3210000019ae9df1533.jpg@1280w_1l_2o_100sh.jpg' },
        '大暑': { name: '睡莲', image: 'https://img.zcool.cn/community/0122895541f3210000019ae9b8cd38.jpg@1280w_1l_2o_100sh.jpg' },
        '立秋': { name: '桂花', image: 'https://img.zcool.cn/community/01a4325541f3210000019ae91f4b14.jpg@1280w_1l_2o_100sh.jpg' },
        '处暑': { name: '菊花', image: 'https://img.zcool.cn/community/01c1fd5541f3210000019ae9c1bd7a.jpg@1280w_1l_2o_100sh.jpg' },
        '白露': { name: '芙蓉', image: 'https://img.zcool.cn/community/01f9ea5541f3210000019ae9df1533.jpg@1280w_1l_2o_100sh.jpg' },
        '秋分': { name: '菊花', image: 'https://img.zcool.cn/community/0122895541f3210000019ae9b8cd38.jpg@1280w_1l_2o_100sh.jpg' },
        '寒露': { name: '山茶花', image: 'https://img.zcool.cn/community/01a4325541f3210000019ae91f4b14.jpg@1280w_1l_2o_100sh.jpg' },
        '霜降': { name: '菊花', image: 'https://img.zcool.cn/community/01c1fd5541f3210000019ae9c1bd7a.jpg@1280w_1l_2o_100sh.jpg' },
        '立冬': { name: '山茶花', image: 'https://img.zcool.cn/community/01f9ea5541f3210000019ae9df1533.jpg@1280w_1l_2o_100sh.jpg' },
        '小雪': { name: '腊梅', image: 'https://img.zcool.cn/community/0122895541f3210000019ae9b8cd38.jpg@1280w_1l_2o_100sh.jpg' },
        '大雪': { name: '腊梅', image: 'https://img.zcool.cn/community/01a4325541f3210000019ae91f4b14.jpg@1280w_1l_2o_100sh.jpg' },
        '冬至': { name: '梅花', image: 'https://img.zcool.cn/community/01c1fd5541f3210000019ae9c1bd7a.jpg@1280w_1l_2o_100sh.jpg' },
        '未知节气': { name: '未知花卉', image: 'https://via.placeholder.com/80?text=花卉' }
    };
    
    const flower = seasonalFlowers[termName] || seasonalFlowers['未知节气'];
    
    // 添加花卉信息区域（如果不存在）
    let flowerContainer = document.querySelector('#seasonal-flower');
    if (!flowerContainer) {
        const weatherContainer = document.querySelector('#weather .bg-white');
        if (weatherContainer) {
            flowerContainer = document.createElement('div');
            flowerContainer.id = 'seasonal-flower';
            flowerContainer.className = 'mt-4 p-4 bg-green-50 rounded-lg';
            flowerContainer.innerHTML = `
                <h3 class="font-semibold text-green-800 mb-2 flex items-center">
                    <i class="fas fa-flower text-green-600 mr-2"></i>
                    本节气花卉
                </h3>
                <div class="flex items-center">
                    <img src="${flower.image}" alt="${flower.name}" class="w-16 h-16 object-cover rounded-lg mr-3">
                    <div>
                        <div class="font-medium text-gray-800">${flower.name}</div>
                        <div class="text-sm text-gray-600">本节气代表花卉</div>
                    </div>
                </div>
            `;
            weatherContainer.appendChild(flowerContainer);
            console.log('已创建花卉信息区域');
        } else {
            console.error('找不到天气容器');
        }
    } else {
        // 更新现有花卉信息
        const flowerImage = flowerContainer.querySelector('img');
        const flowerName = flowerContainer.querySelector('.font-medium');
        
        if (flowerImage && flowerName) {
            flowerImage.src = flower.image;
            flowerImage.alt = flower.name;
            flowerName.textContent = flower.name;
            console.log('花卉信息已更新');
        } else {
            console.error('找不到花卉图片或名称元素');
        }
    }
}
