/**
 * solarterm.js - 处理节气相关功能
 */
import { debug } from './debug.js';

// 初始化节气模块
export function initSolarTerm() {
    debug.log('初始化节气模块...');
    
    // 确保DOM已加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            debug.log('DOM加载完成，设置节气功能');
            setupSolarTerm();
        });
    } else {
        debug.log('DOM已加载，立即设置节气功能');
        setupSolarTerm();
    }
}

// 设置节气功能
function setupSolarTerm() {
    debug.log('设置节气功能开始...');
    
    // 获取节气信息
    getSolarTerm()
        .then(termInfo => {
            debug.log(`当前节气: ${termInfo.name}`);
            displaySolarTerm(termInfo.name, termInfo.date);
        })
        .catch(error => {
            debug.error('获取节气信息失败: ' + error);
            // 使用默认节气信息
            const now = new Date();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            displaySolarTerm('未知节气', `${month}月${day}日`);
        });
}

// 获取当前节气
async function getSolarTerm() {
    try {
        debug.log('获取当前节气信息...');
        
        // 这里可以使用API获取节气信息，但为了简化，我们使用本地计算
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
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
        
        debug.log(`计算得到当前节气: ${currentTerm.name} (${month}月${day}日)`);
        
        return {
            name: currentTerm.name,
            date: `${month}月${day}日`
        };
    } catch (error) {
        debug.error('获取节气信息失败: ' + error);
        throw error;
    }
}

// 显示节气信息
function displaySolarTerm(termName, dateStr) {
    debug.log(`显示节气信息: ${termName} (${dateStr})`);
    
    // 更新节气名称
    const termElement = document.getElementById('current-term');
    if (termElement) {
        termElement.textContent = termName;
    } else {
        debug.error('找不到节气名称元素 #current-term');
    }
    
    // 更新日期
    const dateElement = document.getElementById('term-date');
    if (dateElement) {
        dateElement.textContent = dateStr;
    } else {
        debug.error('找不到节气日期元素 #term-date');
    }
    
    // 更新地球轨道显示
    updateEarthOrbit(termName);
    
    // 更新节气描述
    updateSolarTermDescription(termName);
}

// 更新地球轨道显示
function updateEarthOrbit(termName) {
    const earth = document.querySelector('.earth');
    if (earth) {
        const solarTerms = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', 
                          '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', 
                          '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];
        const termIndex = solarTerms.indexOf(termName);
        if (termIndex !== -1) {
            const angle = (termIndex / 24) * 360;
            earth.style.transform = `rotate(${angle}deg)`;
            debug.log(`更新地球轨道角度: ${angle}度`);
        } else {
            debug.warn(`未知节气名称: ${termName}，无法更新地球轨道`);
        }
    } else {
        debug.error('找不到地球轨道元素 .earth');
    }
}

// 更新节气描述
function updateSolarTermDescription(termName) {
    const descriptions = {
        '小寒': '小寒是二十四节气中的第23个节气，标志着一年中最寒冷的开始。此时，寒潮南下频繁，气温显著下降。',
        '大寒': '大寒是二十四节气中的最后一个，也是一年中最冷的节气。"大寒"表示天气寒冷到极点，冷气积久而寒。',
        '立春': '立春是二十四节气中的第一个节气，标志着春季的开始。此时，气温开始回升，万物开始复苏。',
        '雨水': '雨水是二十四节气中的第二个节气，表示降水开始增多，雨量渐增。此时，天气逐渐转暖，降雨增多。',
        '惊蛰': '惊蛰是二十四节气中的第三个节气，标志着春雷开始，惊醒了蛰伏在土中冬眠的昆虫。此时，气温升高，各种生物开始活跃。',
        '春分': '春分是二十四节气中的第四个节气，此时昼夜平分，阴阳相半。春分过后，阳光直射点北移，北半球昼长夜短。',
        '清明': '清明是二十四节气中的第五个节气，也是中国传统节日。此时，气温升高，草木萌动，万物生长，呈现清洁明净的景象。',
        '谷雨': '谷雨是二十四节气中的第六个节气，表示降雨量增多，适合谷类作物生长。此时，雨水滋润大地，谷类作物生长旺盛。',
        '立夏': '立夏是二十四节气中的第七个节气，标志着夏季的开始。此时，气温显著升高，农作物进入生长旺季。',
        '小满': '小满是夏季的第二个节气，此时太阳到达黄经60°。地球在这个位置时，北半球接收的阳光逐渐增多，气温明显升高，农作物开始饱满但尚未完全成熟。"小满者，物至于此小得盈满"。',
        '芒种': '芒种是二十四节气中的第九个节气，表示有芒的谷类作物可以种植。此时，气温较高，雨量充沛，适合农作物生长。',
        '夏至': '夏至是二十四节气中的第十个节气，也是一年中昼最长、夜最短的一天。夏至过后，昼渐短，夜渐长。',
        '小暑': '小暑是二十四节气中的第十一个节气，表示炎热的开始。此时，气温开始显著升高，但还未到最热。',
        '大暑': '大暑是二十四节气中的第十二个节气，表示一年中最热的时期。此时，气温达到全年最高，常伴有雷暴雨。',
        '立秋': '立秋是二十四节气中的第十三个节气，标志着秋季的开始。此时，气温开始下降，但仍然较热。',
        '处暑': '处暑是二十四节气中的第十四个节气，表示炎热结束。此时，气温逐渐下降，暑气渐消。',
        '白露': '白露是二十四节气中的第十五个节气，表示露水开始凝结。此时，气温下降，早晨草木上有白色露珠。',
        '秋分': '秋分是二十四节气中的第十六个节气，此时昼夜平分，阴阳相半。秋分过后，阳光直射点南移，北半球昼短夜长。',
        '寒露': '寒露是二十四节气中的第十七个节气，表示露水开始带有寒意。此时，气温下降明显，露水带有寒气。',
        '霜降': '霜降是二十四节气中的第十八个节气，表示开始有霜冻。此时，气温下降，早晨地面有霜。',
        '立冬': '立冬是二十四节气中的第十九个节气，标志着冬季的开始。此时，气温显著下降，万物开始收藏。',
        '小雪': '小雪是二十四节气中的第二十个节气，表示开始降雪。此时，气温下降，开始出现降雪天气，但雪量不大。',
        '大雪': '大雪是二十四节气中的第二十一个节气，表示降雪量增多。此时，气温显著下降，降雪量增大。',
        '冬至': '冬至是二十四节气中的第二十二个节气，也是一年中昼最短、夜最长的一天。冬至过后，昼渐长，夜渐短。'
    };
    
    const descriptionElement = document.querySelector('#weather .text-gray-700');
    if (descriptionElement) {
        const description = descriptions[termName] || `${termName}是二十四节气之一，具体描述暂无。`;
        descriptionElement.textContent = description;
        debug.log(`更新节气描述: ${termName}`);
    } else {
        debug.error('找不到节气描述元素');
    }
}

// 导出函数
export { getSolarTerm };
