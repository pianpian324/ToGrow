'use strict';

// 简化的节气计算逻辑，仅用于演示
// 实际应用中建议使用更精确的农历库
const solarTerms = [
    { name: '立春', date: '02-04' }, { name: '雨水', date: '02-19' },
    { name: '惊蛰', date: '03-05' }, { name: '春分', date: '03-20' },
    { name: '清明', date: '04-04' }, { name: '谷雨', date: '04-20' },
    { name: '立夏', date: '05-05' }, { name: '小满', date: '05-21' },
    { name: '芒种', date: '06-05' }, { name: '夏至', date: '06-21' },
    { name: '小暑', date: '07-07' }, { name: '大暑', date: '07-22' },
    { name: '立秋', date: '08-07' }, { name: '处暑', date: '08-23' },
    { name: '白露', date: '09-07' }, { name: '秋分', date: '09-23' },
    { name: '寒露', date: '10-08' }, { name: '霜降', date: '10-23' },
    { name: '立冬', date: '11-07' }, { name: '小雪', date: '11-22' },
    { name: '大雪', date: '12-07' }, { name: '冬至', date: '12-21' },
    { name: '小寒', date: '01-05' }, { name: '大寒', date: '01-20' },
];

function getCurrentSolarTerm() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const currentDate = `${month}-${day}`;

    // 按日期排序（注意跨年）
    const sortedTerms = [...solarTerms].sort((a, b) => {
        const dateA = a.date.replace('-', '');
        const dateB = b.date.replace('-', '');
        return dateA.localeCompare(dateB);
    });

    let currentTerm = sortedTerms[sortedTerms.length - 1].name; // 默认为最后一个节气（大寒之后到立春之前）

    for (let i = 0; i < sortedTerms.length; i++) {
        if (currentDate >= sortedTerms[i].date) {
            currentTerm = sortedTerms[i].name;
        } else {
            // 找到第一个大于当前日期的节气，则上一个节气是当前节气
            // 特殊处理立春前的日期
            if (i === 0 && currentDate < sortedTerms[i].date) {
                 // 如果当前日期小于立春日期，则属于上一年最后一个节气（大寒）
                 // 上面已默认处理
            } else if (i > 0) {
                currentTerm = sortedTerms[i - 1].name;
            }
            break; // 找到区间后停止
        }
    }
    return currentTerm;
}

/**
 * 腾讯云云函数入口函数
 * @param {Object} event API网关触发的事件对象
 * @param {Object} context 运行上下文
 */
exports.main_handler = async (event, context) => {
    console.log("Event: ", event);
    const solarTerm = getCurrentSolarTerm();

    // 返回给API网关的响应格式
    return {
        isBase64Encoded: false,
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }, // 允许跨域，方便本地测试
        body: JSON.stringify({ solarTerm: solarTerm })
    };
};
