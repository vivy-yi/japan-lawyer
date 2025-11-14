// Performance Optimizer - 性能优化器
// 监控和优化网站性能，提供实时性能分析

class PerformanceOptimizer {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.config = {
            enableCoreWebVitals: true,
            enableResourceMonitoring: true,
            enableUserTiming: true,
            enableFrameRateMonitoring: true,
            enableMemoryMonitoring: true,
            performanceThresholds: {
                LCP: 2500,  // Largest Contentful Paint (ms)
                FID: 100,   // First Input Delay (ms)
                CLS: 0.1,   // Cumulative Layout Shift
                FCP: 1800,  // First Contentful Paint (ms)
                TTFB: 800   // Time to First Byte (ms)
            }
        };

        this.init();
    }

    init() {
        console.log('⚡ Performance Optimizer initialized');
        this.setupPerformanceObservers();
        this.startResourceMonitoring();
        this.startFrameRateMonitoring();
        this.setupIntersectionObserver();
        this.setupLazyLoading();
        this.optimizeImages();
        this.optimizeFonts();
        this.startPeriodicReporting();
    }

    // 设置性能观察器
    setupPerformanceObservers() {
        // Core Web Vitals
        if ('PerformanceObserver' in window) {
            this.observeLCP();
            this.observeFID();
            this.observeCLS();
            this.observeFCP();
            this.observeTTFB();
        }

        // Navigation Timing
        this.observeNavigationTiming();

        // Resource Timing
        if (this.config.enableResourceMonitoring) {
            this.observeResourceTiming();
        }

        // User Timing
        if (this.config.enableUserTiming) {
            this.observeUserTiming();
        }
    }

    // 观察LCP (Largest Contentful Paint)
    observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.set('LCP', {
                    value: lastEntry.renderTime || lastEntry.loadTime,
                    element: lastEntry.element?.tagName || 'unknown',
                    url: lastEntry.url || '',
                    timestamp: Date.now()
                });

                this.checkPerformanceThreshold('LCP', this.metrics.get('LCP').value);
                console.log('📊 LCP:', this.metrics.get('LCP').value.toFixed(2) + 'ms');
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('LCP observation not supported:', e);
        }
    }

    // 观察FID (First Input Delay)
    observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.set('FID', {
                        value: entry.processingStart - entry.startTime,
                        eventType: entry.name,
                        timestamp: Date.now()
                    });

                    this.checkPerformanceThreshold('FID', this.metrics.get('FID').value);
                    console.log('📊 FID:', this.metrics.get('FID').value.toFixed(2) + 'ms');
                });
            });

            observer.observe({ entryTypes: ['first-input'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('FID observation not supported:', e);
        }
    }

    // 观察CLS (Cumulative Layout Shift)
    observeCLS() {
        try {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.set('CLS', {
                            value: clsValue,
                            entries: entries.length,
                            timestamp: Date.now()
                        });
                    }
                });

                this.checkPerformanceThreshold('CLS', clsValue);
                console.log('📊 CLS:', clsValue.toFixed(3));
            });

            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('CLS observation not supported:', e);
        }
    }

    // 观察FCP (First Contentful Paint)
    observeFCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
                if (fcpEntry) {
                    this.metrics.set('FCP', {
                        value: fcpEntry.startTime,
                        timestamp: Date.now()
                    });

                    this.checkPerformanceThreshold('FCP', this.metrics.get('FCP').value);
                    console.log('📊 FCP:', this.metrics.get('FCP').value.toFixed(2) + 'ms');
                }
            });

            observer.observe({ entryTypes: ['paint'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('FCP observation not supported:', e);
        }
    }

    // 观察TTFB (Time to First Byte)
    observeTTFB() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const navigationEntry = entries[0];
                if (navigationEntry) {
                    const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
                    this.metrics.set('TTFB', {
                        value: ttfb,
                        timestamp: Date.now()
                    });

                    this.checkPerformanceThreshold('TTFB', ttfb);
                    console.log('📊 TTFB:', ttfb.toFixed(2) + 'ms');
                }
            });

            observer.observe({ entryTypes: ['navigation'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('TTFB observation not supported:', e);
        }
    }

    // 观察导航时间
    observeNavigationTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.metrics.set('NavigationTiming', {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                        domInteractive: navigation.domInteractive - navigation.navigationStart,
                        timestamp: Date.now()
                    });
                }
            }, 0);
        });
    }

    // 观察资源时间
    observeResourceTiming() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!this.metrics.has('ResourceTiming')) {
                        this.metrics.set('ResourceTiming', {
                            resources: [],
                            totalSize: 0,
                            totalTransferSize: 0
                        });
                    }

                    const resourceData = {
                        name: entry.name,
                        type: this.getResourceType(entry.name),
                        duration: entry.duration,
                        size: entry.transferSize || 0,
                        cached: entry.transferSize === 0 && entry.decodedBodySize > 0
                    };

                    const resourceTiming = this.metrics.get('ResourceTiming');
                    resourceTiming.resources.push(resourceData);
                    resourceTiming.totalSize += entry.decodedBodySize || 0;
                    resourceTiming.totalTransferSize += entry.transferSize || 0;
                });
            });

            observer.observe({ entryTypes: ['resource'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('Resource timing observation not supported:', e);
        }
    }

    // 观察用户时间
    observeUserTiming() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log(`📊 User Timing: ${entry.name} - ${entry.startTime.toFixed(2)}ms`);
                });
            });

            observer.observe({ entryTypes: ['measure', 'mark'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('User timing observation not supported:', e);
        }
    }

    // 获取资源类型
    getResourceType(url) {
        if (url.includes('.js')) return 'script';
        if (url.includes('.css')) return 'stylesheet';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
        if (url.includes('api/') || url.includes('/api')) return 'api';
        return 'other';
    }

    // 检查性能阈值
    checkPerformanceThreshold(metric, value) {
        const threshold = this.config.performanceThresholds[metric];
        if (threshold && value > threshold) {
            console.warn(`⚠️ Performance issue detected: ${metric} (${value.toFixed(2)}) exceeds threshold (${threshold})`);
            this.suggestOptimization(metric, value);
        }
    }

    // 建议优化方案
    suggestOptimization(metric, value) {
        const suggestions = {
            LCP: [
                '优化图片加载（使用WebP格式、响应式图片）',
                '预加载关键资源',
                '减少服务器响应时间',
                '使用CDN加速'
            ],
            FID: [
                '减少JavaScript执行时间',
                '拆分代码包，延迟加载非关键JS',
                '优化第三方脚本加载'
            ],
            CLS: [
                '为图片和视频设置明确的尺寸',
                '避免动态插入内容',
                '使用transform动画而不是改变布局属性'
            ],
            FCP: [
                '减少服务器渲染时间',
                '内联关键CSS',
                '移除阻塞渲染的JavaScript'
            ],
            TTFB: [
                '优化服务器响应时间',
                '使用CDN',
                '启用缓存'
            ]
        };

        const metricSuggestions = suggestions[metric];
        if (metricSuggestions) {
            console.log(`💡 Optimization suggestions for ${metric}:`);
            metricSuggestions.forEach((suggestion, index) => {
                console.log(`  ${index + 1}. ${suggestion}`);
            });
        }
    }

    // 启动资源监控
    startResourceMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memoryInfo = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };

                this.metrics.set('Memory', memoryInfo);

                // 内存泄漏检测
                if (memoryInfo.used > memoryInfo.limit * 0.9) {
                    console.warn('⚠️ High memory usage detected:',
                        (memoryInfo.used / 1024 / 1024).toFixed(2) + 'MB');
                }
            }, 10000); // 每10秒检查一次
        }
    }

    // 启动帧率监控
    startFrameRateMonitoring() {
        if (!this.config.enableFrameRateMonitoring) return;

        let lastTime = performance.now();
        let frames = 0;

        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));

                this.metrics.set('FPS', {
                    value: fps,
                    timestamp: Date.now()
                });

                if (fps < 30) {
                    console.warn(`⚠️ Low frame rate detected: ${fps} FPS`);
                }

                frames = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    // 设置交叉观察器（用于懒加载）
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // 观察所有带有data-src的图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            this.imageObserver = imageObserver;
        }
    }

    // 设置懒加载
    setupLazyLoading() {
        // 为现有的图片添加懒加载
        document.querySelectorAll('img').forEach(img => {
            if (!img.src || img.src === window.location.href) {
                if (img.dataset.src) {
                    img.loading = 'lazy';
                }
            }
        });
    }

    // 优化图片
    optimizeImages() {
        // 添加loading="lazy"到所有图片
        document.querySelectorAll('img').forEach(img => {
            if (!img.loading) {
                img.loading = 'lazy';
            }
        });

        // 响应式图片优化
        document.querySelectorAll('img[src]').forEach(img => {
            const src = img.src;
            if (src.match(/\.(jpg|jpeg|png)$/i)) {
                // 可以添加WebP支持
                const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                const picture = document.createElement('picture');

                const webpSource = document.createElement('source');
                webpSource.srcset = webpSrc;
                webpSource.type = 'image/webp';

                picture.appendChild(webpSource);
                picture.appendChild(img.cloneNode());
                img.parentNode.replaceChild(picture, img);
            }
        });
    }

    // 优化字体
    optimizeFonts() {
        // 添加字体显示优化
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-display: swap;
            }
        `;
        document.head.appendChild(style);

        // 预加载关键字体
        const fonts = document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
        fonts.forEach(fontLink => {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = 'https://fonts.googleapis.com';
            document.head.appendChild(preconnect);

            const preconnect2 = document.createElement('link');
            preconnect2.rel = 'preconnect';
            preconnect2.href = 'https://fonts.gstatic.com';
            preconnect2.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect2);
        });
    }

    // 开始定期报告
    startPeriodicReporting() {
        setInterval(() => {
            const report = this.generatePerformanceReport();
            if (report.issues.length > 0) {
                console.log('📊 Performance Report:', report);
            }
        }, 30000); // 每30秒报告一次
    }

    // 生成性能报告
    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            metrics: {},
            issues: [],
            score: this.calculatePerformanceScore()
        };

        // 收集所有指标
        this.metrics.forEach((value, key) => {
            report.metrics[key] = value;
        });

        // 检查性能问题
        Object.entries(this.config.performanceThresholds).forEach(([metric, threshold]) => {
            const metricData = this.metrics.get(metric);
            if (metricData && metricData.value > threshold) {
                report.issues.push({
                    metric: metric,
                    value: metricData.value,
                    threshold: threshold,
                    severity: this.getIssueSeverity(metric, metricData.value, threshold)
                });
            }
        });

        return report;
    }

    // 计算性能分数
    calculatePerformanceScore() {
        let score = 100;
        const weights = {
            LCP: 25,
            FID: 25,
            CLS: 15,
            FCP: 20,
            TTFB: 15
        };

        Object.entries(weights).forEach(([metric, weight]) => {
            const metricData = this.metrics.get(metric);
            const threshold = this.config.performanceThresholds[metric];

            if (metricData && threshold) {
                const ratio = Math.min(metricData.value / threshold, 2);
                const deduction = Math.min((ratio - 1) * weight, weight);
                score -= deduction;
            }
        });

        return Math.max(0, Math.round(score));
    }

    // 获取问题严重程度
    getIssueSeverity(metric, value, threshold) {
        const ratio = value / threshold;
        if (ratio >= 2) return 'critical';
        if (ratio >= 1.5) return 'high';
        if (ratio >= 1.2) return 'medium';
        return 'low';
    }

    // 获取性能建议
    getPerformanceRecommendations() {
        const report = this.generatePerformanceReport();
        const recommendations = [];

        report.issues.forEach(issue => {
            switch (issue.metric) {
                case 'LCP':
                    recommendations.push('优化最大内容绘制时间：压缩图片、使用CDN、预加载关键资源');
                    break;
                case 'FID':
                    recommendations.push('优化首次输入延迟：减少JavaScript执行时间、代码分割');
                    break;
                case 'CLS':
                    recommendations.push('优化累积布局偏移：设置图片尺寸、避免动态内容插入');
                    break;
                case 'FCP':
                    recommendations.push('优化首次内容绘制：内联关键CSS、减少服务器响应时间');
                    break;
                case 'TTFB':
                    recommendations.push('优化首字节时间：使用CDN、优化服务器配置');
                    break;
            }
        });

        return [...new Set(recommendations)]; // 去重
    }

    // 标记用户计时
    mark(name) {
        if ('performance' in window && 'mark' in performance) {
            performance.mark(name);
        }
    }

    // 测量用户计时
    measure(name, startMark, endMark) {
        if ('performance' in window && 'measure' in performance) {
            performance.measure(name, startMark, endMark);
        }
    }

    // 预加载资源
    preloadResource(url, type = 'script') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = type;
        document.head.appendChild(link);
    }

    // 预连接到域名
    preconnect(href, crossOrigin) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        if (crossOrigin) {
            link.crossOrigin = crossOrigin;
        }
        document.head.appendChild(link);
    }

    // 清理观察器
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];
        this.metrics.clear();
        console.log('🧹 Performance optimizer cleaned up');
    }
}

// 全局性能优化器实例
let performanceOptimizer;

// 初始化性能优化器
function initPerformanceOptimization() {
    if (typeof window !== 'undefined') {
        performanceOptimizer = new PerformanceOptimizer();
        window.performanceOptimizer = performanceOptimizer;

        // 导出便捷方法到全局
        window.markPerformance = (name) => performanceOptimizer.mark(name);
        window.measurePerformance = (name, start, end) => performanceOptimizer.measure(name, start, end);
        window.getPerformanceReport = () => performanceOptimizer.generatePerformanceReport();
        window.getPerformanceRecommendations = () => performanceOptimizer.getPerformanceRecommendations();

        console.log('⚡ Performance optimization system initialized');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceOptimization);
} else {
    initPerformanceOptimization();
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceOptimizer, initPerformanceOptimization };
}