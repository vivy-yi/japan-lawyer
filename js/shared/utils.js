/**
 * 共享工具函数库 - js/shared/utils.js
 *
 * 提供给所有JavaScript模块使用的通用工具函数
 * 避免重复定义，确保函数一致性
 *
 * @author Claude Code
 * @version 1.0.0
 */

console.log('🔧 Loading shared utilities...');

// ========================
// 安全工具函数
// ========================

/**
 * 安全的HTML转义函数 - 防止XSS攻击
 * @param {string} text - 需要转义的文本内容
 * @returns {string} 转义后的安全HTML内容
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // 返回: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
window.escapeHtml = function(text) {
    if (typeof text !== 'string') {
        console.warn('escapeHtml: 非字符串输入', typeof text, text);
        return String(text || '');
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * 安全的URL验证函数
 * @param {string} url - 需要验证的URL
 * @returns {boolean} 是否为安全URL
 */
window.isValidUrl = function(url) {
    if (typeof url !== 'string') return false;

    try {
        const urlObj = new URL(url);
        return ['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol);
    } catch (e) {
        return false;
    }
};

/**
 * 安全的URL清理函数
 * @param {string} url - 需要清理的URL
 * @returns {string} 清理后的安全URL
 */
window.sanitizeUrl = function(url) {
    if (!isValidUrl(url)) {
        console.warn('sanitizeUrl: 无效URL被过滤', url);
        return '#';
    }
    return url;
};

// ========================
// DOM操作工具函数
// ========================

/**
 * 安全创建DOM元素
 * @param {string} tag - 标签名
 * @param {string} className - CSS类名（可选）
 * @param {string} textContent - 文本内容（可选，会自动转义）
 * @returns {HTMLElement} 创建的DOM元素
 */
window.createElement = function(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = escapeHtml(textContent);
    return element;
};

/**
 * 安全设置元素HTML内容
 * @param {HTMLElement} element - 目标元素
 * @param {string} htmlContent - HTML内容
 * @param {boolean} allowHtml - 是否允许HTML标签（默认false，使用文本内容）
 */
window.setElementContent = function(element, htmlContent, allowHtml = false) {
    if (!element) return;

    if (allowHtml) {
        // 允许HTML内容，但实际项目中建议使用DOMPurify等安全库
        element.innerHTML = htmlContent;
    } else {
        // 安全的文本内容设置
        element.textContent = htmlContent || '';
    }
};

// ========================
// 动画工具函数
// ========================

/**
 * 添加CSS动画样式
 * @param {string} styleId - 样式ID
 * @param {string} cssContent - CSS内容
 * @returns {HTMLStyleElement} 创建的style元素
 */
window.addAnimationStyle = function(styleId, cssContent) {
    // 避免重复添加样式
    if (document.querySelector(`style[data-animation="${styleId}"]`)) {
        return document.querySelector(`style[data-animation="${styleId}"]`);
    }

    const style = document.createElement('style');
    style.setAttribute('data-animation', styleId);
    style.textContent = cssContent;
    document.head.appendChild(style);

    return style;
};

/**
 * 常用动画CSS样式集合
 */
window.ANIMATION_STYLES = {
    fadeInUp: `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in-up {
            animation: fadeInUp 0.5s ease forwards;
        }
    `,

    slideInLeft: `
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .slide-in-left {
            animation: slideInLeft 0.5s ease forwards;
        }
    `,

    slideInRight: `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .slide-in-right {
            animation: slideInRight 0.5s ease forwards;
        }
    `,

    pulse: `
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        .pulse {
            animation: pulse 2s ease-in-out infinite;
        }
    `
};

/**
 * 应用动画效果到元素
 * @param {HTMLElement} element - 目标元素
 * @param {string} animationName - 动画名称
 * @param {number} delay - 延迟时间（毫秒）
 */
window.applyAnimation = function(element, animationName, delay = 0) {
    if (!element || !animationName) return;

    setTimeout(() => {
        element.classList.add(animationName);
    }, delay);
};

// ========================
// 数据处理工具函数
// ========================

/**
 * 深度克隆对象
 * @param {any} obj - 需要克隆的对象
 * @returns {any} 克隆后的对象
 */
window.deepClone = function(obj) {
    if (obj === null || typeof obj !== 'object') return obj;

    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (e) {
        console.warn('deepClone: 克隆失败', e);
        return obj;
    }
};

/**
 * 防抖函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * 节流函数
 * @param {Function} func - 需要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
window.throttle = function(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ========================
// 错误处理工具函数
// ========================

/**
 * 安全执行函数，捕获并记录错误
 * @param {Function} func - 需要安全执行的函数
 * @param {any} fallback - 出错时的返回值
 * @returns {any} 函数执行结果或fallback值
 */
window.safeExecute = function(func, fallback = null) {
    try {
        if (typeof func === 'function') {
            return func();
        }
        return fallback;
    } catch (error) {
        console.error('safeExecute: 函数执行出错', error);
        return fallback;
    }
};

/**
 * 创建错误日志
 * @param {string} message - 错误消息
 * @param {any} context - 错误上下文信息
 */
window.logError = function(message, context = {}) {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        message: message,
        context: context,
        url: window.location.href,
        userAgent: navigator.userAgent
    };

    console.error('🚨 Error logged:', errorInfo);

    // 这里可以添加错误上报逻辑
    // 例如发送到错误监控服务
};

// ========================
// 验证工具函数
// ========================

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否为有效邮箱
 */
window.isValidEmail = function(email) {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * 验证手机号格式（中国大陆）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否为有效手机号
 */
window.isValidPhone = function(phone) {
    if (typeof phone !== 'string') return false;
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 文件扩展名（小写）
 */
window.getFileExtension = function(filename) {
    if (typeof filename !== 'string') return '';
    return filename.split('.').pop().toLowerCase();
};

// ========================
// 本地存储工具函数
// ========================

/**
 * 安全设置localStorage
 * @param {string} key - 存储键
 * @param {any} value - 存储值
 * @param {number} expireHours - 过期时间（小时，可选）
 */
window.setLocalStorage = function(key, value, expireHours = null) {
    try {
        const data = {
            value: value,
            timestamp: Date.now(),
            expire: expireHours ? Date.now() + (expireHours * 60 * 60 * 1000) : null
        };

        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('setLocalStorage: 存储失败', error);
    }
};

/**
 * 安全获取localStorage
 * @param {string} key - 存储键
 * @param {any} defaultValue - 默认值
 * @returns {any} 存储值或默认值
 */
window.getLocalStorage = function(key, defaultValue = null) {
    try {
        const dataStr = localStorage.getItem(key);
        if (!dataStr) return defaultValue;

        const data = JSON.parse(dataStr);

        // 检查是否过期
        if (data.expire && Date.now() > data.expire) {
            localStorage.removeItem(key);
            return defaultValue;
        }

        return data.value;
    } catch (error) {
        console.error('getLocalStorage: 读取失败', error);
        return defaultValue;
    }
};

// ========================
// 初始化完成
// ========================

console.log('✅ Shared utilities loaded successfully');

// 向全局暴露工具已加载的标记
window.SHARED_UTILS_LOADED = true;

// 版本信息
window.SHARED_UTILS_VERSION = '1.0.0';