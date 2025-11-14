/**
 * Performance Monitor - 性能监控器
 * 监控页面性能指标，提供优化建议
 * 完全安全的DOM操作
 */

class PerformanceMonitor {
    constructor(config = {}) {
        this.config = {
            enableLogging: true,
            enableMetrics: true,
            enableRecommendations: true,
            checkInterval: 5000, // 5秒检查一次
            maxMetricsHistory: 100,
            ...config
        };

        this.metrics = {
            loadTime: null,
            domContentLoaded: null,
            firstPaint: null,
            firstContentfulPaint: null,
            largestContentfulPaint: null,
            cumulativeLayoutShift: null,
            firstInputDelay: null,
            memoryUsage: null,
            activeConnections: 0,
            renderTime: 0
        };

        this.metricsHistory = [];
        this.isMonitoring = false;
        this.observer = null;
        this.recommendations = [];

        this.init();
    }

    init() {
        this.setupPerformanceObservers();
        this.collectInitialMetrics();
        this.startMonitoring();
        window.logInfo('📊 Performance Monitor initialized');
    }

    setupPerformanceObservers() {
        // 观察Web Vitals指标
        if ('PerformanceObserver' in window) {
            // LCP (Largest Contentful Paint)
            try {
                this.observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
                });
                this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                window.logWarn('LCP observer not supported:', e);
            }

            // FID (First Input Delay)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.name === 'first-input') {
                            this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                        }
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                window.logWarn('FID observer not supported:', e);
            }

            // CLS (Cumulative Layout Shift)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    this.metrics.cumulativeLayoutShift = clsValue;
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                window.logWarn('CLS observer not supported:', e);
            }
        }
    }

    collectInitialMetrics() {
        // 收集初始性能指标
        if (performance.timing) {
            const timing = performance.timing;
            this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
            this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        }

        // 收集Paint Timing API数据
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            if (entry.name === 'first-paint') {
                this.metrics.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
                this.metrics.firstContentfulPaint = entry.startTime;
            }
        });

        // 收集内存使用情况
        if (performance.memory) {
            this.metrics.memoryUsage = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }

        this.updateMetricsHistory();
    }

    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectCurrentMetrics();
            this.analyzePerformance();
            this.updateMetricsHistory();
        }, this.config.checkInterval);
    }

    collectCurrentMetrics() {
        // 更新内存使用情况
        if (performance.memory) {
            this.metrics.memoryUsage = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }

        // 检查活跃连接数
        if (navigator.connection) {
            this.metrics.activeConnections = navigator.connection.downlink;
        }

        // 测量渲染性能
        const startTime = performance.now();
        requestAnimationFrame(() => {
            this.metrics.renderTime = performance.now() - startTime;
        });
    }

    analyzePerformance() {
        this.recommendations = [];

        // 分析加载性能
        if (this.metrics.loadTime > 3000) {
            this.recommendations.push({
                type: 'performance',
                level: 'warning',
                message: '页面加载时间较长',
                suggestion: '考虑优化资源加载，启用压缩和缓存'
            });
        }

        // 分析LCP
        if (this.metrics.largestContentfulPaint > 2500) {
            this.recommendations.push({
                type: 'lcp',
                level: 'warning',
                message: 'LCP (最大内容绘制) 时间过长',
                suggestion: '优化关键渲染路径，预加载重要资源'
            });
        }

        // 分析CLS
        if (this.metrics.cumulativeLayoutShift > 0.1) {
            this.recommendations.push({
                type: 'cls',
                level: 'error',
                message: 'CLS (累积布局偏移) 过高',
                suggestion: '为图片和广告设置明确尺寸，避免布局偏移'
            });
        }

        // 分析内存使用
        if (this.metrics.memoryUsage) {
            const memoryUsagePercent = (this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit) * 100;
            if (memoryUsagePercent > 80) {
                this.recommendations.push({
                    type: 'memory',
                    level: 'warning',
                    message: '内存使用率过高',
                    suggestion: `当前使用 ${memoryUsagePercent.toFixed(1)}%，检查内存泄漏`
                });
            }
        }

        // 分析FID
        if (this.metrics.firstInputDelay > 100) {
            this.recommendations.push({
                type: 'fid',
                level: 'warning',
                message: 'FID (首次输入延迟) 过高',
                suggestion: '减少JavaScript执行时间，优化主线程任务'
            });
        }

        if (this.config.enableLogging && this.recommendations.length > 0) {
            window.logInfo('📊 Performance Recommendations:', this.recommendations);
        }
    }

    updateMetricsHistory() {
        const timestamp = Date.now();
        const metricsSnapshot = { ...this.metrics, timestamp };

        this.metricsHistory.push(metricsSnapshot);

        // 限制历史记录数量
        if (this.metricsHistory.length > this.config.maxMetricsHistory) {
            this.metricsHistory.shift();
        }
    }

    getMetrics() {
        return {
            current: { ...this.metrics },
            history: [...this.metricsHistory],
            recommendations: [...this.recommendations],
            status: this.getPerformanceStatus()
        };
    }

    getPerformanceStatus() {
        const issues = this.recommendations.filter(r => r.level === 'error').length;
        const warnings = this.recommendations.filter(r => r.level === 'warning').length;

        if (issues > 0) return 'poor';
        if (warnings > 0) return 'fair';
        return 'good';
    }

    createPerformanceReport() {
        const report = this.createPerformanceReportElement();
        return report;
    }

    createPerformanceReportElement() {
        const container = document.createElement('div');
        container.style.cssText = `
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;

        // 标题
        const title = document.createElement('h3');
        title.textContent = '📊 性能监控报告';
        title.style.cssText = 'margin: 0 0 20px 0; color: #1e3a5f; font-size: 18px;';
        container.appendChild(title);

        // 性能状态
        const status = this.getPerformanceStatus();
        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = `
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 20px;
            background: ${status === 'good' ? '#d4edda' : status === 'fair' ? '#fff3cd' : '#f8d7da'};
            border: 1px solid ${status === 'good' ? '#c3e6cb' : status === 'fair' ? '#ffeaa7' : '#f5c6cb'};
        `;

        const statusText = status === 'good' ? '性能良好 ✅' :
                          status === 'fair' ? '性能一般 ⚠️' : '性能需要优化 ❌';
        statusDiv.textContent = statusText;
        container.appendChild(statusDiv);

        // 性能指标
        const metricsSection = this.createMetricsSection();
        container.appendChild(metricsSection);

        // 优化建议
        if (this.recommendations.length > 0) {
            const recommendationsSection = this.createRecommendationsSection();
            container.appendChild(recommendationsSection);
        }

        return container;
    }

    createMetricsSection() {
        const section = document.createElement('div');
        section.style.marginBottom = '20px';

        const title = document.createElement('h4');
        title.textContent = '📈 性能指标';
        title.style.cssText = 'margin: 0 0 15px 0; color: #495057; font-size: 16px;';
        section.appendChild(title);

        const metrics = [
            { label: '页面加载时间', value: this.metrics.loadTime ? `${this.metrics.loadTime}ms` : 'N/A' },
            { label: '首次内容绘制', value: this.metrics.firstContentfulPaint ? `${Math.round(this.metrics.firstContentfulPaint)}ms` : 'N/A' },
            { label: '最大内容绘制', value: this.metrics.largestContentfulPaint ? `${Math.round(this.metrics.largestContentfulPaint)}ms` : 'N/A' },
            { label: '首次输入延迟', value: this.metrics.firstInputDelay ? `${Math.round(this.metrics.firstInputDelay)}ms` : 'N/A' },
            { label: '累积布局偏移', value: this.metrics.cumulativeLayoutShift !== null ? this.metrics.cumulativeLayoutShift.toFixed(3) : 'N/A' }
        ];

        if (this.metrics.memoryUsage) {
            const memoryMB = (this.metrics.memoryUsage.used / 1024 / 1024).toFixed(1);
            metrics.push({ label: '内存使用', value: `${memoryMB}MB` });
        }

        const metricsList = document.createElement('div');
        metricsList.style.cssText = 'display: grid; gap: 10px;';

        metrics.forEach(metric => {
            const metricItem = document.createElement('div');
            metricItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                padding: 8px 12px;
                background: #f8f9fa;
                border-radius: 4px;
                border-left: 3px solid #007bff;
            `;

            const label = document.createElement('span');
            label.textContent = metric.label;
            label.style.color = '#495057';

            const value = document.createElement('strong');
            value.textContent = metric.value;
            value.style.color = '#007bff';

            metricItem.appendChild(label);
            metricItem.appendChild(value);
            metricsList.appendChild(metricItem);
        });

        section.appendChild(metricsList);
        return section;
    }

    createRecommendationsSection() {
        const section = document.createElement('div');

        const title = document.createElement('h4');
        title.textContent = '💡 优化建议';
        title.style.cssText = 'margin: 0 0 15px 0; color: #495057; font-size: 16px;';
        section.appendChild(title);

        this.recommendations.forEach(rec => {
            const recItem = document.createElement('div');
            recItem.style.cssText = `
                padding: 12px;
                margin-bottom: 10px;
                border-radius: 6px;
                border-left: 4px solid ${
                    rec.level === 'error' ? '#dc3545' :
                    rec.level === 'warning' ? '#ffc107' : '#28a745'
                };
                background: ${
                    rec.level === 'error' ? '#f8d7da' :
                    rec.level === 'warning' ? '#fff3cd' : '#d4edda'
                };
            `;

            const message = document.createElement('div');
            message.textContent = rec.message;
            message.style.cssText = 'font-weight: 500; margin-bottom: 5px; color: #495057;';

            const suggestion = document.createElement('div');
            suggestion.textContent = rec.suggestion;
            suggestion.style.cssText = 'font-size: 14px; color: #6c757d;';

            recItem.appendChild(message);
            recItem.appendChild(suggestion);
            section.appendChild(recItem);
        });

        return section;
    }

    // 公共API
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
        window.logInfo('📊 Performance monitoring stopped');
    }

    restartMonitoring() {
        this.stopMonitoring();
        this.startMonitoring();
    }

    clearHistory() {
        this.metricsHistory = [];
        window.logInfo('📊 Performance metrics history cleared');
    }

    destroy() {
        this.stopMonitoring();

        if (this.observer) {
            this.observer.disconnect();
        }

        this.metrics = {};
        this.metricsHistory = [];
        this.recommendations = [];

        window.logInfo('📊 Performance Monitor destroyed');
    }
}

// 自动初始化
let performanceMonitor;

setTimeout(() => {
    performanceMonitor = new PerformanceMonitor();
    window.performanceMonitor = performanceMonitor;
    window.logInfo('✅ Performance Monitor initialized');
}, 1000);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}