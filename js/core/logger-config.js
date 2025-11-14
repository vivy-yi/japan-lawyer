/**
 * 日志系统配置文件
 * 管理不同环境下的日志配置和策略
 */

// 环境配置映射 - 默认全部关闭
const ENVIRONMENT_CONFIGS = {
    development: {
        // 基础配置 - 默认关闭，需要手动开启
        enabled: false,
        level: 1, // INFO
        console: true,
        storage: false,
        remote: false,

        // 存储配置
        maxStorageSize: 500,
        storageKey: 'dev_logs',

        // 性能监控 - 默认关闭
        performance: false,
        trackNetworkRequests: false,
        trackUserInteractions: false,

        // 调试功能
        showLogCount: false,
        showPerformanceMetrics: false,
        enableHotReload: false,

        // 错误处理
        errorReporting: false,
        showStackTrace: true,
        breakOnErrors: false
    },

    test: {
        // 基础配置 - 默认关闭
        enabled: false,
        level: 1, // INFO
        console: true,
        storage: false,
        remote: false,

        // 性能监控 - 默认关闭
        performance: false,
        trackNetworkRequests: false,
        trackUserInteractions: false,

        // 错误处理
        errorReporting: false,
        showStackTrace: true
    },

    production: {
        // 基础配置 - 始终关闭，除非通过特殊方式开启
        enabled: false,
        level: 3, // ERROR
        console: false,
        storage: false,
        remote: false,

        // 远程日志配置 - 默认关闭
        remoteEndpoint: '/api/logs',
        batchSize: 10,
        retryAttempts: 3,
        retryDelay: 1000,

        // 性能监控 - 默认关闭
        performance: false,
        trackCoreMetrics: false,

        // 错误处理 - 默认关闭
        errorReporting: false,
        maxErrorsPerSession: 0,

        // 安全配置
        sanitizeData: true,
        excludeSensitiveFields: ['password', 'token', 'ssn', 'creditCard']
    }
};

// 功能开关配置
const FEATURE_FLAGS = {
    // 全局功能
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    enableUserActivityTracking: false,

    // 开发功能
    enableConsoleEnhancements: true,
    enableLogVisualization: false,
    enableLiveReload: false,

    // 生产功能
    enableAnonymousReporting: true,
    enableCompressedLogging: true,
    enableOfflineQueue: true
};

// 日志格式化配置
const LOG_FORMATTING = {
    // 时间戳格式
    timestampFormat: 'ISO', // ISO, UNIX, CUSTOM

    // 消息格式
    includeTimestamp: true,
    includeLevel: true,
    includeUrl: false,
    includeUserAgent: false,
    includeSessionId: false,

    // 数据格式化
    maxDataLength: 1000,
    truncateLargeObjects: true,
    formatObjectsPretty: true,

    // 颜色和样式
    useColors: true,
    useIcons: true,
    compactMode: false
};

// 性能监控配置
const PERFORMANCE_CONFIG = {
    // 要监控的性能指标
    metrics: [
        'pageLoad',
        'navigationTiming',
        'resourceTiming',
        'paintTiming',
        'userTiming',
        'memoryUsage',
        'networkRequests',
        'longTasks'
    ],

    // 阈值设置
    thresholds: {
        pageLoad: 3000, // 3秒
        firstContentfulPaint: 1000, // 1秒
        largestContentfulPaint: 2500, // 2.5秒
        firstInputDelay: 100, // 100ms
        cumulativeLayoutShift: 0.1
    },

    // 采样率
    samplingRate: {
        pageLoad: 1.0,
        userInteractions: 0.1,
        networkRequests: 0.01,
        customMetrics: 0.5
    }
};

// 远程日志配置
const REMOTE_CONFIG = {
    // 端点配置
    endpoints: {
        logs: '/api/logs',
        errors: '/api/errors',
        metrics: '/api/metrics'
    },

    // 发送策略
    strategy: 'BATCH', // IMMEDIATE, BATCH, QUEUED
    batchSize: 10,
    flushInterval: 30000, // 30秒
    retryAttempts: 3,
    retryDelay: 1000,

    // 压缩和加密
    compression: true,
    encryption: false,

    // 过滤器
    filters: [
        'exclude-noise',
        'exclude-duplicates',
        'exclude-sensitive'
    ]
};

// 用户追踪配置
const USER_TRACKING = {
    // 追踪开关
    enablePageViewTracking: true,
    enableClickTracking: false,
    enableScrollTracking: false,
    enableFormTracking: false,

    // 隐私设置
    anonymizeIPs: true,
    respectDoNotTrack: true,
    requireConsent: false,

    // 数据收集限制
    maxEventsPerSession: 100,
    sessionTimeout: 1800000, // 30分钟
    cleanupInterval: 3600000 // 1小时
};

// 创建配置管理器
class LoggerConfigManager {
    constructor() {
        this.config = this.loadConfig();
        this.observers = [];
    }

    /**
     * 加载配置
     */
    loadConfig() {
        // 检测当前环境
        const environment = this.detectEnvironment();

        // 获取基础配置
        let config = {
            ...ENVIRONMENT_CONFIGS[environment],
            featureFlags: { ...FEATURE_FLAGS },
            formatting: { ...LOG_FORMATTING },
            performance: { ...PERFORMANCE_CONFIG },
            remote: { ...REMOTE_CONFIG },
            userTracking: { ...USER_TRACKING }
        };

        // 应用URL参数覆盖
        config = this.applyUrlOverrides(config);

        // 应用本地存储覆盖
        config = this.applyLocalOverrides(config);

        return config;
    }

    /**
     * 检测环境
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const search = window.location.search;

        // 强制开发环境
        if (search.includes('env=dev') || localStorage.getItem('logger_env') === 'dev') {
            return 'development';
        }

        // 强制测试环境
        if (search.includes('env=test') || localStorage.getItem('logger_env') === 'test') {
            return 'test';
        }

        // 强制生产环境
        if (search.includes('env=prod') || localStorage.getItem('logger_env') === 'prod') {
            return 'production';
        }

        // 自动检测
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
            return 'development';
        }

        if (hostname.includes('github.io')) {
            return 'production';
        }

        if (hostname.includes('staging') || hostname.includes('test')) {
            return 'test';
        }

        return 'production';
    }

    /**
     * 应用URL参数覆盖
     */
    applyUrlOverrides(config) {
        const params = new URLSearchParams(window.location.search);
        const overrides = {};

        // 日志级别
        if (params.has('logLevel')) {
            const level = params.get('logLevel').toUpperCase();
            if (Object.values(LOG_LEVELS).includes(level)) {
                overrides.level = LOG_LEVELS[level];
            }
        }

        // 功能开关
        if (params.has('debug')) {
            overrides.enabled = params.get('debug') === 'true';
        }

        if (params.has('performance')) {
            overrides.performance = params.get('performance') === 'true';
        }

        if (params.has('storage')) {
            overrides.storage = params.get('storage') === 'true';
        }

        if (params.has('remote')) {
            overrides.remote = params.get('remote') === 'true';
        }

        return { ...config, ...overrides };
    }

    /**
     * 应用本地存储覆盖
     */
    applyLocalOverrides(config) {
        const overrides = {};

        // 从本地存储读取配置
        const localConfig = localStorage.getItem('logger_config');
        if (localConfig) {
            try {
                const parsed = JSON.parse(localConfig);
                Object.assign(overrides, parsed);
            } catch (error) {
                window.logWarn('Failed to parse logger config from localStorage:', error);
            }
        }

        return { ...config, ...overrides };
    }

    /**
     * 获取配置
     */
    getConfig() {
        return this.config;
    }

    /**
     * 更新配置
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.notifyObservers('config-updated', this.config);
    }

    /**
     * 保存配置到本地存储
     */
    saveToLocal() {
        try {
            localStorage.setItem('logger_config', JSON.stringify(this.config));
        } catch (error) {
            window.logWarn('Failed to save logger config to localStorage:', error);
        }
    }

    /**
     * 添加配置观察者
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * 移除配置观察者
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * 通知观察者
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                window.logError('Observer callback error:', error);
            }
        });
    }

    /**
     * 重置配置
     */
    reset() {
        localStorage.removeItem('logger_config');
        localStorage.removeItem('logger_env');
        this.config = this.loadConfig();
        this.notifyObservers('config-reset', this.config);
    }

    /**
     * 获取环境信息
     */
    getEnvironmentInfo() {
        return {
            current: this.detectEnvironment(),
            isDevelopment: this.detectEnvironment() === 'development',
            isTest: this.detectEnvironment() === 'test',
            isProduction: this.detectEnvironment() === 'production',
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }
}

// 创建全局配置管理器
const configManager = new LoggerConfigManager();

// 导出配置管理器
export {
    ENVIRONMENT_CONFIGS,
    FEATURE_FLAGS,
    LOG_FORMATTING,
    PERFORMANCE_CONFIG,
    REMOTE_CONFIG,
    USER_TRACKING,
    LoggerConfigManager,
    configManager
};

export default configManager;