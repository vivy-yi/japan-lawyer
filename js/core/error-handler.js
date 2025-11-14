// Error Handler & Logger - 错误处理和日志系统
// 全面的错误捕获、日志记录和错误恢复机制

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 1000;
        this.errorTypes = {
            JAVASCRIPT_ERROR: 'javascript_error',
            NETWORK_ERROR: 'network_error',
            PROMISE_REJECTION: 'promise_rejection',
            RESOURCE_ERROR: 'resource_error',
            SECURITY_ERROR: 'security_error',
            PERFORMANCE_ERROR: 'performance_error',
            USER_ERROR: 'user_error'
        };

        this.config = {
            enableConsoleLogging: true,
            enableRemoteLogging: false, // 可以配置为true来发送到远程服务器
            enableLocalStorage: true,
            logLevel: 'error', // debug, info, warn, error
            maxRetries: 3,
            retryDelay: 1000
        };

        this.init();
    }

    init() {
        console.log('🔧 Error Handler initialized');
        this.setupGlobalErrorHandlers();
        this.setupNetworkErrorHandling();
        this.setupUnhandledRejectionHandling();
        this.setupResourceErrorHandling();
        this.loadStoredErrors();
        this.startPeriodicCleanup();
    }

    // 设置全局错误处理器
    setupGlobalErrorHandlers() {
        // JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError({
                type: this.errorTypes.JAVASCRIPT_ERROR,
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        // 安全错误
        window.addEventListener('securitypolicyviolation', (event) => {
            this.handleError({
                type: this.errorTypes.SECURITY_ERROR,
                message: 'CSP Violation',
                blockedURI: event.blockedURI,
                violatedDirective: event.violatedDirective,
                sourceFile: event.sourceFile,
                lineNumber: event.lineNumber,
                timestamp: Date.now()
            });
        });
    }

    // 设置网络错误处理
    setupNetworkErrorHandling() {
        // 拦截fetch请求
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            const options = args[1] || {};

            try {
                const response = await originalFetch(...args);

                // 检查响应状态
                if (!response.ok) {
                    this.handleError({
                        type: this.errorTypes.NETWORK_ERROR,
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        url: url,
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: Date.now()
                    });
                }

                return response;
            } catch (error) {
                this.handleError({
                    type: this.errorTypes.NETWORK_ERROR,
                    message: error.message,
                    url: url,
                    timestamp: Date.now(),
                    stack: error.stack
                });
                throw error;
            }
        };

        // XMLHttpRequest错误处理
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._url = url;
            this._method = method;
            return originalXHROpen.apply(this, [method, url, ...args]);
        };

        XMLHttpRequest.prototype.send = function(...args) {
            const xhr = this;
            this.addEventListener('error', () => {
                // Use global error handler
                if (window.globalErrorHandler && typeof window.globalErrorHandler.handleError === 'function') {
                    window.globalErrorHandler.handleError({
                        type: window.globalErrorHandler.errorTypes.NETWORK_ERROR,
                        message: 'XMLHttpRequest failed',
                        url: xhr._url,
                        method: xhr._method,
                        timestamp: Date.now()
                    });
                }
            });

            this.addEventListener('load', () => {
                if (this.status >= 400) {
                    // Use global error handler
                    if (window.globalErrorHandler && typeof window.globalErrorHandler.handleError === 'function') {
                        window.globalErrorHandler.handleError({
                            type: window.globalErrorHandler.errorTypes.NETWORK_ERROR,
                            message: `HTTP ${this.status}: ${this.statusText}`,
                            url: xhr._url,
                            method: xhr._method,
                            status: this.status,
                            timestamp: Date.now()
                        });
                    }
                }
            });

            return originalXHRSend.apply(this, args);
        };
    }

    // 设置未处理的Promise拒绝
    setupUnhandledRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: this.errorTypes.PROMISE_REJECTION,
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now()
            });

            // 阻止默认的控制台错误输出
            event.preventDefault();
        });
    }

    // 设置资源错误处理
    setupResourceErrorHandling() {
        // 图片加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                const element = event.target;
                const tagName = element.tagName.toLowerCase();
                let resourceType = 'unknown';
                let url = '';

                switch (tagName) {
                    case 'img':
                        resourceType = 'image';
                        url = element.src;
                        break;
                    case 'script':
                        resourceType = 'script';
                        url = element.src;
                        break;
                    case 'link':
                        resourceType = 'stylesheet';
                        url = element.href;
                        break;
                    case 'video':
                        resourceType = 'video';
                        url = element.src;
                        break;
                    case 'audio':
                        resourceType = 'audio';
                        url = element.src;
                        break;
                }

                this.handleError({
                    type: this.errorTypes.RESOURCE_ERROR,
                    message: `Failed to load ${resourceType}`,
                    resourceType: resourceType,
                    url: url,
                    tagName: tagName,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    // 处理错误
    handleError(error) {
        // 生成唯一ID
        error.id = this.generateErrorId();

        // 添加上下文信息
        error.context = this.getErrorContext();

        // 记录错误 (direct logging to avoid infinite loop)
        this.errorLog.push(error);

        // Limit log size
        if (this.errorLog.length > this.config.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.config.maxLogSize);
        }

        // Save to localStorage
        try {
            localStorage.setItem('error-log', JSON.stringify(this.errorLog));
        } catch (e) {
            console.warn('Failed to save error log to localStorage:', e);
        }

        console.error('Error handled:', error);

        // 尝试错误恢复
        this.attemptErrorRecovery(error);

        // 通知用户（如果需要）
        this.notifyUserIfNeeded(error);

        // 发送到远程服务器（如果启用）
        if (this.config.enableRemoteLogging) {
            this.sendErrorToServer(error);
        }
    }

    // 生成错误ID
    generateErrorId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 获取错误上下文
    getErrorContext() {
        return {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connection: this.getConnectionInfo(),
            memory: this.getMemoryInfo(),
            localStorage: this.getStorageInfo('localStorage'),
            sessionStorage: this.getStorageInfo('sessionStorage')
        };
    }

    // 获取网络连接信息
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            };
        }
        return null;
    }

    // 获取内存信息
    getMemoryInfo() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    // 获取存储信息
    getStorageInfo(storageType) {
        try {
            const storage = window[storageType];
            const data = {};
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && !key.includes('password') && !key.includes('token')) {
                    data[key] = storage.getItem(key);
                }
            }
            return data;
        } catch (e) {
            return null;
        }
    }

    // 记录错误
    logError(error) {
        this.errorLog.push(error);

        // 维护日志大小
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }

        // 控制台日志
        if (this.config.enableConsoleLogging) {
            this.logToConsole(error);
        }

        // 本地存储
        if (this.config.enableLocalStorage) {
            this.saveErrorsToStorage();
        }
    }

    // 控制台日志
    logToConsole(error) {
        const logMessage = `[${error.type.toUpperCase()}] ${error.message}`;
        const logData = {
            id: error.id,
            type: error.type,
            timestamp: new Date(error.timestamp).toISOString(),
            context: error.context
        };

        switch (error.type) {
            case this.errorTypes.JAVASCRIPT_ERROR:
                console.error(logMessage, {
                    ...logData,
                    filename: error.filename,
                    line: error.lineno,
                    column: error.colno,
                    stack: error.stack
                });
                break;
            case this.errorTypes.NETWORK_ERROR:
                console.error(logMessage, {
                    ...logData,
                    url: error.url,
                    status: error.status,
                    method: error.method
                });
                break;
            case this.errorTypes.SECURITY_ERROR:
                console.error(logMessage, {
                    ...logData,
                    blockedURI: error.blockedURI,
                    violatedDirective: error.violatedDirective
                });
                break;
            default:
                console.error(logMessage, logData);
        }
    }

    // 保存错误到本地存储
    saveErrorsToStorage() {
        try {
            const errors = this.errorLog.slice(-100); // 只保存最近100个错误
            localStorage.setItem('error-log', JSON.stringify(errors));
        } catch (e) {
            console.warn('Failed to save errors to localStorage:', e);
        }
    }

    // 从本地存储加载错误
    loadStoredErrors() {
        try {
            const stored = localStorage.getItem('error-log');
            if (stored) {
                this.errorLog = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load errors from localStorage:', e);
        }
    }

    // 尝试错误恢复
    attemptErrorRecovery(error) {
        switch (error.type) {
            case this.errorTypes.RESOURCE_ERROR:
                this.recoverResourceError(error);
                break;
            case this.errorTypes.NETWORK_ERROR:
                this.recoverNetworkError(error);
                break;
            case this.errorTypes.JAVASCRIPT_ERROR:
                this.recoverJavaScriptError(error);
                break;
        }
    }

    // 恢复资源错误
    recoverResourceError(error) {
        if (error.resourceType === 'image') {
            // 尝试重新加载图片
            const img = document.querySelector(`img[src="${error.url}"]`);
            if (img) {
                setTimeout(() => {
                    const timestamp = Date.now();
                    img.src = `${error.url}?retry=${timestamp}`;
                }, this.config.retryDelay);
            }
        } else if (error.resourceType === 'script') {
            // 脚本加载失败，尝试重新加载
            setTimeout(() => {
                const script = document.createElement('script');
                script.src = error.url;
                script.onerror = () => {
                    console.warn('Failed to reload script:', error.url);
                };
                document.head.appendChild(script);
            }, this.config.retryDelay * 2);
        }
    }

    // 恢复网络错误
    recoverNetworkError(error) {
        // 可以在这里实现重试逻辑
        console.log('Network error occurred, automatic retry could be implemented');
    }

    // 恢复JavaScript错误
    recoverJavaScriptError(error) {
        // 检查是否是关键功能错误
        const criticalErrors = [
            'nav.js',
            'carousel.js',
            'security-monitor.js',
            'performance-optimizer.js'
        ];

        const isCritical = criticalErrors.some(critical =>
            error.filename && error.filename.includes(critical)
        );

        if (isCritical) {
            console.warn('Critical JavaScript error detected:', error);
            // 可以在这里尝试重新加载关键脚本
        }
    }

    // 通知用户（如果需要）
    notifyUserIfNeeded(error) {
        // 只对关键错误通知用户
        const shouldNotify = (
            error.type === this.errorTypes.SECURITY_ERROR ||
            (error.type === this.errorTypes.NETWORK_ERROR && error.status >= 500) ||
            (error.type === this.errorTypes.JAVASCRIPT_ERROR && this.isCriticalError(error))
        );

        if (shouldNotify) {
            this.showUserNotification(error);
        }
    }

    // 判断是否是关键错误
    isCriticalError(error) {
        const criticalPatterns = [
            /nav/i,
            /carousel/i,
            /security/i,
            /performance/i,
            /main/i
        ];

        return criticalPatterns.some(pattern =>
            pattern.test(error.filename || '') ||
            pattern.test(error.message || '')
        );
    }

    // 显示用户通知
    showUserNotification(error) {
        // 避免重复通知
        if (document.querySelector('.error-notification')) {
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
        `;

        const title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '0.5rem';
        title.textContent = '系统提示';

        const message = document.createElement('div');
        message.textContent = this.getErrorMessage(error);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 0.5rem;
            font-size: 12px;
        `;
        closeBtn.onclick = () => notification.remove();

        notification.appendChild(title);
        notification.appendChild(message);
        notification.appendChild(closeBtn);

        document.body.appendChild(notification);

        // 5秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // 获取用户友好的错误消息
    getErrorMessage(error) {
        const messages = {
            [this.errorTypes.NETWORK_ERROR]: '网络连接出现问题，请检查网络连接',
            [this.errorTypes.SECURITY_ERROR]: '检测到安全问题，已自动处理',
            [this.errorTypes.RESOURCE_ERROR]: '部分资源加载失败，可能影响显示效果',
            [this.errorTypes.JAVASCRIPT_ERROR]: '程序出现错误，已自动记录'
        };

        return messages[error.type] || '系统出现未知错误';
    }

    // 发送错误到服务器
    async sendErrorToServer(error) {
        try {
            // 这里可以实现发送到远程日志服务
            // await fetch('/api/log-error', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(error)
            // });
        } catch (e) {
            console.warn('Failed to send error to server:', e);
        }
    }

    // 定期清理
    startPeriodicCleanup() {
        setInterval(() => {
            this.cleanupOldErrors();
            this.saveErrorsToStorage();
        }, 300000); // 每5分钟清理一次
    }

    // 清理旧错误
    cleanupOldErrors() {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24小时前
        this.errorLog = this.errorLog.filter(error => error.timestamp > cutoff);
    }

    // 获取错误统计
    getErrorStatistics() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            byHour: {},
            recent: this.errorLog.slice(-10)
        };

        this.errorLog.forEach(error => {
            // 按类型统计
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

            // 按小时统计
            const hour = new Date(error.timestamp).getHours();
            stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
        });

        return stats;
    }

    // 导出错误日志
    exportErrorLog() {
        const log = {
            errors: this.errorLog,
            statistics: this.getErrorStatistics(),
            exportTime: Date.now()
        };

        const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${new Date().toISOString()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    // 清除错误日志
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('error-log');
        console.log('🧹 Error log cleared');
    }

    // 手动记录错误 (without calling handleError to avoid infinite loop)
    logError(message, type = this.errorTypes.USER_ERROR, details = {}) {
        const error = {
            type: type,
            message: message,
            timestamp: Date.now(),
            ...details
        };

        // Add to error log without calling handleError to prevent infinite loop
        this.errorLog.push(error);

        // Limit log size
        if (this.errorLog.length > this.config.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.config.maxLogSize);
        }

        // Save to localStorage
        try {
            localStorage.setItem('error-log', JSON.stringify(this.errorLog));
        } catch (e) {
            console.warn('Failed to save error log to localStorage:', e);
        }

        console.error('Error logged:', error);
    }

    // 设置配置
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

// 全局错误处理器实例
let errorHandler;

// 初始化错误处理系统
function initErrorHandler() {
    if (typeof window !== 'undefined') {
        errorHandler = new ErrorHandler();
        window.errorHandler = errorHandler;

        // 导出便捷方法到全局
        window.logError = (message, type, details) => errorHandler.logError(message, type, details);
        window.getErrorStatistics = () => errorHandler.getErrorStatistics();
        window.exportErrorLog = () => errorHandler.exportErrorLog();
        window.clearErrorLog = () => errorHandler.clearErrorLog();

        console.log('🔧 Error handling system initialized');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initErrorHandler);
} else {
    initErrorHandler();
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandler, initErrorHandler };
}