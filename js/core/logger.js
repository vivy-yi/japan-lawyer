/**
 * 统一日志管理系统
 * 开发环境自动开启，生产环境自动关闭
 * 支持多级别日志、性能监控、错误追踪等功能
 */

// 环境检测
const ENVIRONMENT = (() => {
    // 检测是否为生产环境
    const isProduction = () => {
        return (
            window.location.hostname === 'vivy-yi.github.io' ||
            window.location.hostname.includes('github.io') ||
            window.location.hostname.endsWith('.com') && !window.location.hostname.includes('localhost') ||
            window.location.protocol === 'https:' && !window.location.hostname.includes('dev')
        );
    };

    // 检测是否为开发环境
    const isDevelopment = () => {
        return (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '0.0.0.0' ||
            window.location.port !== '' ||
            window.location.protocol === 'file:' ||
            window.location.search.includes('debug=true') ||
            localStorage.getItem('debug') === 'true'
        );
    };

    // 检测是否为测试环境
    const isTest = () => {
        return window.location.search.includes('test=true') || localStorage.getItem('test') === 'true';
    };

    return {
        isProduction: isProduction(),
        isDevelopment: isDevelopment(),
        isTest: isTest(),
        current: isProduction() ? 'production' : (isDevelopment() ? 'development' : 'test')
    };
})();

// 日志级别
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SILENT: 4
};

// 日志级别颜色
const LOG_COLORS = {
    DEBUG: '#6c757d',
    INFO: '#0d6efd',
    WARN: '#ffc107',
    ERROR: '#dc3545'
};

// 日志级别图标
const LOG_ICONS = {
    DEBUG: '🔍',
    INFO: 'ℹ️',
    WARN: '⚠️',
    ERROR: '❌'
};

/**
 * 统一日志管理器
 */
class Logger {
    constructor(config = {}) {
        this.config = {
            // 基础配置
            level: config.level || (ENVIRONMENT.isProduction ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG),
            enabled: config.enabled !== undefined ? config.enabled : !ENVIRONMENT.isProduction,

            // 输出配置
            console: config.console !== false,
            storage: config.storage !== false && ENVIRONMENT.isDevelopment,
            remote: config.remote === true && !ENVIRONMENT.isDevelopment,

            // 存储配置
            maxStorageSize: config.maxStorageSize || 1000, // 最大存储条数
            storageKey: config.storageKey || 'app_logs',

            // 性能监控
            performance: config.performance !== false && ENVIRONMENT.isDevelopment,

            // 错误报告
            errorReporting: config.errorReporting === true && !ENVIRONMENT.isDevelopment,

            ...config
        };

        this.logs = [];
        this.performanceMarks = {};
        this.errorCounts = {};

        this.init();
    }

    /**
     * 初始化日志系统
     */
    init() {
        if (!this.config.enabled) {
            window.logInfo('🔇 Logger disabled in production mode');
            return;
        }

        // 加载存储的日志
        this.loadStoredLogs();

        // 设置全局错误处理
        this.setupGlobalErrorHandlers();

        // 设置性能监控
        if (this.config.performance) {
            this.setupPerformanceMonitoring();
        }

        window.logInfo(`🚀 Logger initialized in ${ENVIRONMENT.current} mode`);
        window.logInfo(`📊 Log level: ${this.getLevelName()}`);
    }

    /**
     * 记录调试日志
     */
    debug(message, data = null, tag = null) {
        this.log(LOG_LEVELS.DEBUG, message, data, tag);
    }

    /**
     * 记录信息日志
     */
    info(message, data = null, tag = null) {
        this.log(LOG_LEVELS.INFO, message, data, tag);
    }

    /**
     * 记录警告日志
     */
    warn(message, data = null, tag = null) {
        this.log(LOG_LEVELS.WARN, message, data, tag);
    }

    /**
     * 记录错误日志
     */
    error(message, error = null, tag = null) {
        this.log(LOG_LEVELS.ERROR, message, error, tag);
    }

    /**
     * 核心日志记录方法
     */
    log(level, message, data = null, tag = null) {
        if (!this.config.enabled || level < this.config.level) {
            return;
        }

        const logEntry = this.createLogEntry(level, message, data, tag);

        // 输出到控制台
        if (this.config.console) {
            this.logToConsole(logEntry);
        }

        // 存储到本地
        if (this.config.storage) {
            this.logToStorage(logEntry);
        }

        // 远程日志
        if (this.config.remote && level >= LOG_LEVELS.WARN) {
            this.logToRemote(logEntry);
        }

        // 错误统计
        if (level === LOG_LEVELS.ERROR) {
            this.trackError(logEntry);
        }

        this.logs.push(logEntry);
    }

    /**
     * 创建日志条目
     */
    createLogEntry(level, message, data, tag) {
        return {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            level: level,
            levelName: this.getLevelName(level),
            message: message,
            data: data,
            tag: tag,
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId(),
            buildVersion: this.getBuildVersion()
        };
    }

    /**
     * 控制台输出
     */
    logToConsole(logEntry) {
        const { level, levelName, message, data, tag, timestamp } = logEntry;
        const icon = LOG_ICONS[levelName];
        const color = LOG_COLORS[levelName];
        const tagStr = tag ? `[${tag}]` : '';

        const style = [
            `color: ${color}`,
            'font-weight: bold',
            'padding: 2px 6px',
            'border-radius: 3px',
            'background: rgba(0,0,0,0.05)'
        ].join(';');

        const args = [
            `%c${icon} ${timestamp} [${levelName}]${tagStr}`,
            style,
            message
        ];

        if (data) {
            args.push(data);
        }

        // 根据级别选择控制台方法
        switch (level) {
            case LOG_LEVELS.DEBUG:
                window.logDebug(...args);
                break;
            case LOG_LEVELS.INFO:
                console.info(...args);
                break;
            case LOG_LEVELS.WARN:
                window.logWarn(...args);
                break;
            case LOG_LEVELS.ERROR:
                window.logError(...args);
                break;
        }
    }

    /**
     * 本地存储
     */
    logToStorage(logEntry) {
        try {
            // 限制存储大小
            if (this.logs.length > this.config.maxStorageSize) {
                this.logs = this.logs.slice(-this.config.maxStorageSize);
            }

            const storageData = {
                logs: this.logs,
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(this.config.storageKey, JSON.stringify(storageData));
        } catch (error) {
            window.logWarn('Failed to store logs:', error);
        }
    }

    /**
     * 远程日志记录
     */
    async logToRemote(logEntry) {
        if (!this.config.enabled || !this.config.remote) {
            return;
        }

        try {
            // 这里可以集成到远程日志服务
            // 例如：Sentry, LogRocket, 自定义API等
            const response = await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            window.logWarn('Failed to send logs to remote:', error);
        }
    }

    /**
     * 性能监控开始
     */
    startPerformanceMark(name) {
        if (!this.config.performance) return;

        const markName = `perf_${name}_${Date.now()}`;
        performance.mark(markName);
        this.performanceMarks[name] = markName;
    }

    /**
     * 性能监控结束
     */
    endPerformanceMark(name) {
        if (!this.config.performance || !this.performanceMarks[name]) return;

        const markName = this.performanceMarks[name];
        const endMarkName = `${markName}_end`;
        performance.mark(endMarkName);

        try {
            performance.measure(name, markName, endMarkName);
            const measure = performance.getEntriesByName(name)[0];

            this.info(`Performance: ${name}`, {
                duration: `${measure.duration.toFixed(2)}ms`,
                startTime: measure.startTime
            }, 'PERFORMANCE');
        } catch (error) {
            window.logWarn('Performance measurement failed:', error);
        }

        delete this.performanceMarks[name];
    }

    /**
     * 设置全局错误处理
     */
    setupGlobalErrorHandlers() {
        // JavaScript错误
        window.addEventListener('error', (event) => {
            this.error('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            }, 'GLOBAL_ERROR');
        });

        // Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', {
                reason: event.reason,
                stack: event.reason?.stack
            }, 'PROMISE_ERROR');
        });

        // 资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.error('Resource Load Error', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    type: event.target.type
                }, 'RESOURCE_ERROR');
            }
        }, true);
    }

    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        // 页面加载性能
        window.addEventListener('load', () => {
            if (performance.timing) {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;

                this.info('Page Load Performance', {
                    loadTime: `${loadTime}ms`,
                    domReady: `${timing.domContentLoadedEventEnd - timing.navigationStart}ms`,
                    firstPaint: this.getFirstPaintTime()
                }, 'PAGE_PERFORMANCE');
            }
        });
    }

    /**
     * 获取首次绘制时间
     */
    getFirstPaintTime() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? `${firstPaint.startTime.toFixed(2)}ms` : 'N/A';
    }

    /**
     * 获取存储的日志
     */
    getStoredLogs() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            return stored ? JSON.parse(stored).logs : [];
        } catch (error) {
            window.logWarn('Failed to load stored logs:', error);
            return [];
        }
    }

    /**
     * 加载存储的日志
     */
    loadStoredLogs() {
        this.logs = this.getStoredLogs();
    }

    /**
     * 清除存储的日志
     */
    clearStoredLogs() {
        this.logs = [];
        localStorage.removeItem(this.config.storageKey);
    }

    /**
     * 导出日志
     */
    exportLogs() {
        const logData = {
            exportTime: new Date().toISOString(),
            environment: ENVIRONMENT.current,
            logs: this.logs,
            config: this.config
        };

        const blob = new Blob([JSON.stringify(logData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 获取日志统计
     */
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byTag: {},
            recentErrors: []
        };

        this.logs.forEach(log => {
            // 按级别统计
            const levelName = log.levelName;
            stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;

            // 按标签统计
            if (log.tag) {
                stats.byTag[log.tag] = (stats.byTag[log.tag] || 0) + 1;
            }

            // 最近错误
            if (log.levelName === 'ERROR') {
                stats.recentErrors.push({
                    timestamp: log.timestamp,
                    message: log.message,
                    tag: log.tag
                });
            }
        });

        stats.recentErrors = stats.recentErrors.slice(-10); // 最近10个错误
        return stats;
    }

    // 工具方法
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getLevelName(level) {
        const names = Object.keys(LOG_LEVELS);
        return names.find(name => LOG_LEVELS[name] === level) || 'UNKNOWN';
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('logger_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('logger_session_id', sessionId);
        }
        return sessionId;
    }

    getBuildVersion() {
        // 可以从 package.json 或其他配置文件获取
        return document.querySelector('meta[name="version"]')?.content || '1.0.0';
    }

    trackError(logEntry) {
        const errorKey = `${logEntry.message}_${logEntry.tag || 'no-tag'}`;
        this.errorCounts[errorKey] = (this.errorCounts[errorKey] || 0) + 1;

        // 错误过多时的处理
        if (this.errorCounts[errorKey] > 10) {
            this.warn(`Error occurred too many times: ${logEntry.message}`, {
                count: this.errorCounts[errorKey]
            }, 'ERROR_THRESHOLD');
        }
    }
}

// 创建全局日志实例
const logger = new Logger({
    // 默认关闭 - 需要手动开启
    enabled: false,

    // 基础配置 - 即使开启也使用保守设置
    console: true,
    storage: false,
    performance: false,
    level: LOG_LEVELS.INFO,

    // 可以通过本地存储覆盖配置 - 默认关闭
    ...(() => {
        const params = new URLSearchParams(window.location.search);
        const config = {};
        const localConfig = localStorage.getItem('logger_config');

        // 严格的安全策略：默认关闭，只有明确的本地配置才能开启
        // URL参数不再自动开启日志，需要手动在localStorage配置

        // 本地存储配置 - 只有明确配置enabled=true才开启
        if (localConfig) {
            try {
                const parsed = JSON.parse(localConfig);
                // 只有明确设置enabled=true才开启，其他情况保持关闭
                if (parsed.enabled === true) {
                    config.enabled = true;
                    config.console = parsed.console !== undefined ? parsed.console : true;
                    config.storage = parsed.storage !== undefined ? parsed.storage : false;
                    config.performance = parsed.performance !== undefined ? parsed.performance : false;
                    config.level = parsed.level !== undefined ? parsed.level : LOG_LEVELS.INFO;
                }
            } catch (error) {
                // 配置解析失败，保持默认关闭状态
                config.enabled = false;
            }
        }

        // 开发环境友好提示 - 静默模式，不输出到console
        // 使用内部标记而不是logInfo避免循环调用
        if (!config.enabled && ENVIRONMENT.isDevelopment) {
            // 只在开发者明确检查时提供信息
            window._LOGGER_DISABLED_HINT = 'Logger is disabled. Use localStorage.setItem("logger_config", \'{"enabled": true}\') to enable';
        }

        return config;
    })()
});

// 开发环境下的调试功能 - 默认不暴露，除非日志系统明确开启
if (ENVIRONMENT.isDevelopment && logger.config.enabled) {
    // 只有在日志明确开启时才添加全局调试方法
    window.logger = logger;
    window.debug = (...args) => logger.debug(...args);
    window.logInfo = (...args) => logger.info(...args);
    window.logWarn = (...args) => logger.warn(...args);
    window.logError = (...args) => logger.error(...args);

    // 开发者工具
    window.devTools = {
        // 获取日志统计
        getLogStats: () => logger.getStats(),

        // 导出日志
        exportLogs: () => logger.exportLogs(),

        // 清除日志
        clearLogs: () => logger.clearStoredLogs(),

        // 设置日志级别
        setLogLevel: (level) => {
            logger.config.level = typeof level === 'string' ? LOG_LEVELS[level.toUpperCase()] : level;
        },

        // 性能监控
        perf: {
            start: (name) => logger.startPerformanceMark(name),
            end: (name) => logger.endPerformanceMark(name)
        }
    };

    // 只在日志开启时显示开发工具信息
    if (logger.config.enabled) {
        console.log('🛠️ Development tools available:');
        console.log('- window.logger: 核心日志实例');
        console.log('- window.debug(): 快速调试日志');
        console.log('- window.devTools: 开发者工具集');
        console.log('- localStorage: logger_config 进行配置');
    }
}

// 生产环境优化 - 默认关闭所有日志
if (ENVIRONMENT.isProduction) {
    // 关闭所有日志功能
    logger.config.enabled = false;
    logger.config.level = LOG_LEVELS.SILENT;
    logger.config.storage = false;
    logger.config.performance = false;
    logger.config.console = false;

    // 生产环境不输出任何日志信息
    // window.logInfo('🔒 Logger disabled in production');
}

// 导出日志系统
export { Logger, logger, LOG_LEVELS, ENVIRONMENT };
export default logger;