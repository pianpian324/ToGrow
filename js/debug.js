/**
 * debug.js - 调试工具模块
 * 提供调试控制台和日志记录功能
 */

// 初始化调试模块
export function initDebug() {
    console.log('初始化调试模块...');
    
    // 确保DOM已加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupDebugConsole);
    } else {
        setupDebugConsole();
    }
}

// 设置调试控制台
function setupDebugConsole() {
    // 创建调试控制台元素
    createDebugConsoleIfNotExists();
    
    const debugConsole = document.getElementById('debug-console');
    const debugOutput = document.getElementById('debug-output');
    const toggleDebug = document.getElementById('toggle-debug');
    const closeDebug = document.getElementById('close-debug');
    
    if (!debugConsole || !debugOutput || !toggleDebug || !closeDebug) {
        console.error('找不到调试控制台元素');
        return;
    }
    
    // 显示/隐藏调试控制台
    toggleDebug.addEventListener('click', () => {
        debugConsole.style.display = debugConsole.style.display === 'none' ? 'block' : 'none';
    });
    
    // 关闭调试控制台
    closeDebug.addEventListener('click', () => {
        debugConsole.style.display = 'none';
    });
    
    // 重写console.log等方法
    overrideConsoleMethods();
    
    // 添加初始日志
    addLogToDebug('log', '调试控制台已初始化，点击左下角的按钮可以显示/隐藏');
}

// 创建调试控制台元素（如果不存在）
function createDebugConsoleIfNotExists() {
    if (document.getElementById('debug-console')) {
        return; // 已存在，不需要创建
    }
    
    // 创建调试控制台
    const debugConsole = document.createElement('div');
    debugConsole.id = 'debug-console';
    debugConsole.className = 'fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 h-40 overflow-auto';
    debugConsole.style.display = 'block';
    debugConsole.style.zIndex = '9999';
    
    debugConsole.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold">调试控制台</h3>
            <button id="close-debug" class="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div id="debug-output" class="font-mono text-sm"></div>
    `;
    
    // 创建调试按钮
    const debugButton = document.createElement('button');
    debugButton.id = 'toggle-debug';
    debugButton.className = 'fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50';
    debugButton.innerHTML = '<i class="fas fa-bug"></i>';
    
    // 添加到文档
    document.body.appendChild(debugConsole);
    document.body.appendChild(debugButton);
}

// 重写console方法
function overrideConsoleMethods() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    
    console.log = function(...args) {
        originalLog.apply(console, args);
        addLogToDebug('log', ...args);
    };
    
    console.error = function(...args) {
        originalError.apply(console, args);
        addLogToDebug('error', ...args);
    };
    
    console.warn = function(...args) {
        originalWarn.apply(console, args);
        addLogToDebug('warn', ...args);
    };
    
    console.info = function(...args) {
        originalInfo.apply(console, args);
        addLogToDebug('info', ...args);
    };
}

// 添加日志到调试控制台
export function addLogToDebug(type, ...args) {
    const debugOutput = document.getElementById('debug-output');
    if (!debugOutput) return;
    
    const logEntry = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString();
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
    
    let className = '';
    switch (type) {
        case 'error':
            className = 'text-red-500';
            break;
        case 'warn':
            className = 'text-yellow-500';
            break;
        case 'info':
            className = 'text-blue-500';
            break;
        default:
            className = 'text-green-300';
    }
    
    logEntry.className = className;
    logEntry.textContent = `[${timestamp}] ${message}`;
    debugOutput.appendChild(logEntry);
    
    // 自动滚动到底部
    debugOutput.scrollTop = debugOutput.scrollHeight;
}

// 导出调试日志函数
export const debug = {
    log: (...args) => addLogToDebug('log', ...args),
    error: (...args) => addLogToDebug('error', ...args),
    warn: (...args) => addLogToDebug('warn', ...args),
    info: (...args) => addLogToDebug('info', ...args)
};
