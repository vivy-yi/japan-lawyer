/**
 * 日志系统初始化脚本
 * 在主页面加载时初始化统一的日志管理系统
 */

(function() {
    'use strict';

    // 异步加载日志系统
    async function initializeLogger() {
        try {
            // 动态导入日志系统
            const { logger, ENVIRONMENT, LOG_LEVELS } = await import('./core/logger.js');

            // 全局日志系统
            window.APP_LOGGER = logger;

            // 开发环境下的额外功能
            if (ENVIRONMENT.isDevelopment) {
                // 添加全局调试工具
                window.APP_DEBUG = {
                    logger: logger,

                    // 快速日志方法
                    debug: (...args) => logger.debug(...args),
                    info: (...args) => logger.info(...args),
                    warn: (...args) => logger.warn(...args),
                    error: (...args) => logger.error(...args),

                    // 性能监控
                    startTimer: (name) => logger.startPerformanceMark(name),
                    endTimer: (name) => logger.endPerformanceMark(name),

                    // 日志管理
                    getStats: () => logger.getStats(),
                    exportLogs: () => logger.exportLogs(),
                    clearLogs: () => logger.clearStoredLogs(),
                    setLevel: (level) => {
                        logger.config.level = typeof level === 'string' ? LOG_LEVELS[level.toUpperCase()] : level;
                    }
                };

                // 添加控制台信息
                console.group('🚀 日志系统已初始化');
                console.log('📊 环境:', ENVIRONMENT.current);
                console.log('🔧 调试工具:', window.APP_DEBUG);
                console.log('⚙️ 配置:', logger.config);
                console.log('💡 使用方法:');
                console.log('  - APP_DEBUG.debug("调试信息")');
                console.log('  - APP_DEBUG.startTimer("任务名称")');
                console.log('  - APP_DEBUG.endTimer("任务名称")');
                console.log('  - APP_DEBUG.getStats()');
                console.log('  - APP_DEBUG.exportLogs()');
                console.groupEnd();

                // 监听页面性能
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const stats = logger.getStats();
                        logger.info('📈 页面加载完成统计', stats, 'PAGE_METRICS');

                        // 开发环境下显示性能信息
                        if (stats.total > 0) {
                            console.group('📊 页面日志统计');
                            console.log('总日志数:', stats.total);
                            console.log('错误数:', stats.byLevel.ERROR || 0);
                            console.log('警告数:', stats.byLevel.WARN || 0);
                            console.log('信息数:', stats.byLevel.INFO || 0);
                            console.groupEnd();
                        }
                    }, 1000);
                });
            }

            // 生产环境优化
            if (ENVIRONMENT.isProduction) {
                // 只记录重要事件
                logger.info('🔒 生产环境日志系统已启用', {
                    version: logger.getBuildVersion(),
                    url: window.location.href,
                    userAgent: navigator.userAgent.substring(0, 100) + '...'
                }, 'PRODUCTION_INIT');

                // 性能监控（关键指标）
                window.addEventListener('load', () => {
                    if ('performance' in window && 'timing' in performance) {
                        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;

                        // 记录关键性能指标
                        if (loadTime > 3000) {
                            logger.warn('页面加载时间过长', {
                                loadTime: `${loadTime}ms`,
                                threshold: '3000ms'
                            }, 'PERFORMANCE_WARNING');
                        } else {
                            logger.info('页面加载性能正常', {
                                loadTime: `${loadTime}ms`
                            }, 'PERFORMANCE');
                        }
                    }
                });

                // 错误监控增强
                const originalErrorHandler = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                    logger.error('全局JavaScript错误', {
                        message: message,
                        source: source,
                        line: lineno,
                        column: colno,
                        stack: error?.stack?.substring(0, 500)
                    }, 'GLOBAL_ERROR');

                    // 调用原始错误处理器
                    if (originalErrorHandler) {
                        return originalErrorHandler.call(this, message, source, lineno, colno, error);
                    }
                };
            }

            // 记录应用启动完成
            logger.info('✅ 应用初始化完成', {
                environment: ENVIRONMENT.current,
                timestamp: new Date().toISOString(),
                buildVersion: logger.getBuildVersion()
            }, 'APP_INIT');

            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('logger:initialized', {
                detail: { logger, environment: ENVIRONMENT.current }
            }));

        } catch (error) {
            console.error('❌ 日志系统初始化失败:', error);

            // 降级处理：提供基础的控制台日志
            window.APP_DEBUG = {
                debug: console.debug.bind(console),
                info: console.info.bind(console),
                warn: console.warn.bind(console),
                error: console.error.bind(console)
            };
        }
    }

    // 等待DOM准备就绪后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLogger);
    } else {
        // DOM已经准备就绪，立即初始化
        initializeLogger();
    }

})();