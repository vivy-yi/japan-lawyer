// Navigation Performance Monitor and Error Handler
// 导航栏性能监控和错误处理系统

class NavigationPerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.errorLog = [];
        this.performanceThresholds = {
            renderTime: 100, // ms
            navigationTime: 300, // ms
            memoryUsage: 50 * 1024 * 1024, // 50MB
            errorRate: 0.05 // 5%
        };
        this.observers = [];
        this.isMonitoring = false;
        this.init();
    }

    init() {
        console.log('📊 Initializing Navigation Performance Monitor...');
        this.setupPerformanceObserver();
        this.setupErrorHandling();
        this.setupMemoryMonitoring();
        this.startMonitoring();
    }

    // 设置性能观察器
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // 监控导航性能
            try {
                const navObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            this.recordMetric('navigation', {
                                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                                loadComplete: entry.loadEventEnd - entry.loadEventStart,
                                totalTime: entry.loadEventEnd - entry.startTime
                            });
                        }
                    });
                });

                navObserver.observe({ entryTypes: ['navigation'] });
                this.observers.push(navObserver);
            } catch (error) {
                console.warn('Navigation observer setup failed:', error);
            }

            // 监控渲染性能
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'paint') {
                            this.recordMetric(`paint-${entry.name}`, {
                                timestamp: entry.startTime,
                                value: entry.startTime
                            });
                        }
                    });
                });

                paintObserver.observe({ entryTypes: ['paint'] });
                this.observers.push(paintObserver);
            } catch (error) {
                console.warn('Paint observer setup failed:', error);
            }

            // 监控长任务
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'longtask') {
                            this.recordMetric('long-task', {
                                duration: entry.duration,
                                startTime: entry.startTime
                            });
                            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
                        }
                    });
                });

                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch (error) {
                console.warn('Long task observer setup failed:', error);
            }
        }
    }

    // 设置错误处理
    setupErrorHandling() {
        // 全局错误监听器
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null,
                timestamp: Date.now()
            });
        });

        // Promise错误监听器
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason ? event.reason.toString() : 'Unhandled Promise Rejection',
                stack: event.reason && event.reason.stack ? event.reason.stack : null,
                timestamp: Date.now()
            });
        });

        // 导航相关错误处理
        this.setupNavigationErrorHandling();
    }

    // 设置导航错误处理
    setupNavigationErrorHandling() {
        // 监听导航事件
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[data-page]');
            if (link) {
                const startTime = performance.now();

                // 监听导航完成
                const checkNavigationComplete = () => {
                    const endTime = performance.now();
                    const navigationTime = endTime - startTime;

                    this.recordMetric('navigation-click', {
                        page: link.getAttribute('data-page'),
                        duration: navigationTime,
                        success: true
                    });

                    if (navigationTime > this.performanceThresholds.navigationTime) {
                        console.warn(`⚠️ Slow navigation detected: ${navigationTime.toFixed(2)}ms`);
                    }
                };

                // 使用MutationObserver监听内容变化
                const observer = new MutationObserver((mutations) => {
                    if (mutations.some(m => m.target.id === 'page-content')) {
                        checkNavigationComplete();
                        observer.disconnect();
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                // 设置超时检查
                setTimeout(() => {
                    checkNavigationComplete();
                    observer.disconnect();
                }, 5000);
            }
        });
    }

    // 设置内存监控
    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.recordMetric('memory', {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });

                if (memory.usedJSHeapSize > this.performanceThresholds.memoryUsage) {
                    console.warn(`⚠️ High memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
                    this.suggestMemoryOptimization();
                }
            }, 30000); // 每30秒检查一次
        }
    }

    // 开始监控
    startMonitoring() {
        this.isMonitoring = true;
        console.log('📊 Navigation performance monitoring started');

        // 记录初始性能指标
        this.recordInitialMetrics();

        // 设置定期报告
        this.setupPeriodicReporting();
    }

    // 记录初始指标
    recordInitialMetrics() {
        setTimeout(() => {
            if ('performance' in window && 'timing' in window.performance) {
                const timing = performance.timing;
                this.recordMetric('initial-load', {
                    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                    complete: timing.loadEventEnd - timing.navigationStart,
                    domInteractive: timing.domInteractive - timing.navigationStart
                });
            }
        }, 100);
    }

    // 记录指标
    recordMetric(name, data) {
        const timestamp = Date.now();

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        this.metrics.get(name).push({
            ...data,
            timestamp
        });

        // 保持最近100条记录
        const records = this.metrics.get(name);
        if (records.length > 100) {
            records.splice(0, records.length - 100);
        }
    }

    // 处理错误
    handleError(error) {
        this.errorLog.push({
            ...error,
            id: this.generateErrorId(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now()
        });

        // 保持最近50个错误
        if (this.errorLog.length > 50) {
            this.errorLog.splice(0, this.errorLog.length - 50);
        }

        // 根据错误类型决定处理方式
        this.categorizeAndHandleError(error);

        console.error('🚨 Navigation Error:', error);
    }

    // 分类和处理错误
    categorizeAndHandleError(error) {
        const { type, message } = error;

        // 关键错误需要立即处理
        if (message.includes('navigation') || message.includes('router')) {
            this.handleCriticalError(error);
        } else if (type === 'promise') {
            this.handlePromiseError(error);
        } else {
            this.handleGeneralError(error);
        }
    }

    // 处理关键错误
    handleCriticalError(error) {
        console.error('🔥 Critical navigation error detected:', error);

        // 尝试恢复
        this.attemptRecovery();

        // 通知用户（如果需要）
        this.notifyUserIfNeeded(error);
    }

    // 处理Promise错误
    handlePromiseError(error) {
        console.warn('⚠️ Promise rejection in navigation:', error);

        // 检查是否与导航相关
        if (error.message.includes('fetch') || error.message.includes('load')) {
            this.handleLoadError(error);
        }
    }

    // 处理加载错误
    handleLoadError(error) {
        console.error('📡 Load error in navigation:', error);

        // 重试机制
        this.scheduleRetry();
    }

    // 处理一般错误
    handleGeneralError(error) {
        console.warn('⚠️ General error in navigation:', error);

        // 记录但不中断用户体验
        this.logErrorForAnalysis(error);
    }

    // 尝试恢复
    attemptRecovery() {
        try {
            console.log('🔄 Attempting navigation recovery...');

            // 检查导航控制器状态
            if (window.navigationController) {
                const status = window.navigationController.getNavigationStatus();
                if (!status.initialized) {
                    console.log('🔄 Reinitializing navigation controller...');
                    // 这里可以触发重新初始化
                }
            }

            // 检查DOM完整性
            const navbar = document.getElementById('main-navbar');
            if (!navbar || navbar.children.length === 0) {
                console.log('🔄 Restoring navigation DOM...');
                // 这里可以触发DOM恢复
            }

        } catch (error) {
            console.error('❌ Recovery attempt failed:', error);
        }
    }

    // 通知用户
    notifyUserIfNeeded(error) {
        // 只对关键错误通知用户
        const shouldNotify = error.message.includes('navigation') &&
                            Math.random() < 0.1; // 10%的概率通知，避免过度打扰

        if (shouldNotify) {
            // 创建非阻塞的通知
            const notification = document.createElement('div');
            notification.className = 'nav-error-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff6b6b;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                max-width: 300px;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
            `;
            notification.textContent = '导航遇到问题，正在尝试恢复...';

            document.body.appendChild(notification);

            // 3秒后自动移除
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }

    // 安排重试
    scheduleRetry() {
        setTimeout(() => {
            console.log('🔄 Retrying failed navigation operation...');
            // 这里可以触发重试逻辑
        }, 2000);
    }

    // 记录错误用于分析
    logErrorForAnalysis(error) {
        // 这里可以发送到分析服务
        console.log('📝 Error logged for analysis:', error);
    }

    // 建议内存优化
    suggestMemoryOptimization() {
        console.log('💡 Memory optimization suggestions:');
        console.log('- Clear unused caches');
        console.log('- Remove event listeners');
        console.log('- Close dropdown menus');

        // 自动清理一些缓存
        if (window.navigationController && window.navigationController.clearDynamicCache) {
            window.navigationController.clearDynamicCache();
        }
    }

    // 生成错误ID
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 设置定期报告
    setupPeriodicReporting() {
        // 每分钟生成性能报告
        setInterval(() => {
            this.generatePerformanceReport();
        }, 60000);

        // 每小时生成健康检查
        setInterval(() => {
            this.performHealthCheck();
        }, 3600000);
    }

    // 生成性能报告
    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            metrics: {},
            errors: this.getRecentErrors(10),
            performanceScore: this.calculatePerformanceScore()
        };

        // 计算平均指标
        this.metrics.forEach((values, key) => {
            if (values.length > 0) {
                const durations = values.map(v => v.duration || v.value || 0);
                report.metrics[key] = {
                    count: values.length,
                    average: durations.reduce((a, b) => a + b, 0) / durations.length,
                    min: Math.min(...durations),
                    max: Math.max(...durations),
                    latest: values[values.length - 1]
                };
            }
        });

        console.log('📊 Performance Report:', report);

        // 检查性能问题
        this.analyzePerformance(report);
    }

    // 获取最近的错误
    getRecentErrors(count = 10) {
        return this.errorLog
            .filter(error => Date.now() - error.timestamp < 300000) // 最近5分钟
            .slice(-count);
    }

    // 计算性能分数
    calculatePerformanceScore() {
        let score = 100;

        // 基于错误率
        const recentErrors = this.getRecentErrors();
        const errorRate = recentErrors.length / 60; // 每分钟错误数
        if (errorRate > this.performanceThresholds.errorRate) {
            score -= 20;
        }

        // 基于内存使用
        if ('memory' in performance) {
            const memoryUsage = performance.memory.usedJSHeapSize;
            if (memoryUsage > this.performanceThresholds.memoryUsage) {
                score -= 15;
            }
        }

        return Math.max(0, score);
    }

    // 分析性能
    analyzePerformance(report) {
        const { metrics, performanceScore } = report;

        // 检查慢导航
        if (metrics['navigation-click'] && metrics['navigation-click'].average > this.performanceThresholds.navigationTime) {
            console.warn(`⚠️ Slow navigation detected: ${metrics['navigation-click'].average.toFixed(2)}ms average`);
        }

        // 检查长任务
        if (metrics['long-task'] && metrics['long-task'].count > 0) {
            console.warn(`⚠️ ${metrics['long-task'].count} long tasks detected`);
        }

        // 检查内存使用
        if (metrics.memory && metrics.memory.latest.used > this.performanceThresholds.memoryUsage) {
            console.warn(`⚠️ High memory usage: ${(metrics.memory.latest.used / 1024 / 1024).toFixed(2)}MB`);
        }

        // 总体性能警告
        if (performanceScore < 70) {
            console.warn(`⚠️ Performance score low: ${performanceScore}/100`);
        }
    }

    // 执行健康检查
    performHealthCheck() {
        const health = {
            timestamp: Date.now(),
            status: 'healthy',
            issues: [],
            recommendations: []
        };

        // 检查导航控制器
        if (!window.navigationController) {
            health.issues.push('Navigation controller not available');
            health.status = 'unhealthy';
        } else {
            const status = window.navigationController.getNavigationStatus();
            if (!status.initialized) {
                health.issues.push('Navigation controller not initialized');
                health.status = 'degraded';
            }
        }

        // 检查DOM元素
        const navbar = document.getElementById('main-navbar');
        if (!navbar) {
            health.issues.push('Main navbar element missing');
            health.status = 'unhealthy';
        } else if (navbar.children.length === 0) {
            health.issues.push('Navigation bar empty');
            health.status = 'degraded';
        }

        // 检查错误率
        const recentErrors = this.getRecentErrors();
        if (recentErrors.length > 5) {
            health.issues.push(`High error rate: ${recentErrors.length} errors in last 5 minutes`);
            health.status = 'degraded';
            health.recommendations.push('Review recent errors and consider error recovery');
        }

        console.log('🏥 Navigation Health Check:', health);

        return health;
    }

    // 获取性能统计
    getPerformanceStats() {
        const stats = {
            uptime: Date.now() - (this.startTime || Date.now()),
            totalMetrics: this.metrics.size,
            totalErrors: this.errorLog.length,
            recentErrors: this.getRecentErrors().length,
            memoryUsage: 'memory' in performance ? performance.memory.usedJSHeapSize : null
        };

        // 计算平均值
        this.metrics.forEach((values, key) => {
            if (values.length > 0 && (values[0].duration || values[0].value)) {
                const durations = values.map(v => v.duration || v.value || 0);
                stats[key] = {
                    count: values.length,
                    average: durations.reduce((a, b) => a + b, 0) / durations.length,
                    latest: durations[durations.length - 1]
                };
            }
        });

        return stats;
    }

    // 清理资源
    cleanup() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];

        this.metrics.clear();
        this.errorLog = [];
        this.isMonitoring = false;

        console.log('🧹 Navigation Performance Monitor cleaned up');
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavigationPerformanceMonitor };
}

// 全局初始化
window.NavigationPerformanceMonitor = NavigationPerformanceMonitor;

console.log('📊 Navigation Performance Monitor loaded');