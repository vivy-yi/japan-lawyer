// Security Event Monitor - 安全事件监控系统
// 实时监控安全相关事件并自动响应威胁

class SecurityEventMonitor {
    constructor() {
        this.events = [];
        this.threats = new Set();
        this.blockedIPs = new Set();
        this.rateLimiters = new Map();
        this.maxEvents = 1000;
        this.debugMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        // 禁用安全监控以防止无限循环
        this.disabled = true;

        this.threatThresholds = {
            dangerousElements: this.debugMode ? 1000 : 20,  // 大幅提高阈值
            dangerousAttributes: this.debugMode ? 500 : 15, // 大幅提高阈值
            suspiciousRequests: this.debugMode ? 1000 : 25, // 大幅提高阈值
            rateLimit: this.debugMode ? 300 : 10 // 大幅提高阈值
        };

        if (this.disabled) {
            if (window.APP_DEBUG && window.APP_DEBUG.logger) {
                window.APP_DEBUG.logger.info('🛡️ Security Monitor disabled to prevent infinite loops', null, 'SECURITY_DISABLED');
            } else {
                window.logInfo('🛡️ Security Monitor disabled to prevent infinite loops');
            }
            return;
        }

        this.init();
    }

    init() {
        if (window.APP_DEBUG && window.APP_DEBUG.logger) {
            window.APP_DEBUG.logger.info('🛡️ Security Event Monitor initialized', null, 'SECURITY_INIT');
        } else {
            window.logInfo('🛡️ Security Event Monitor initialized');
        }
        this.setupEventListeners();
        this.startPeriodicCleanup();
        this.loadBlockedIPs();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监控安全相关事件
        window.addEventListener('error', (e) => this.handleSecurityError(e));
        window.addEventListener('unhandledrejection', (e) => this.handlePromiseRejection(e));
        window.addEventListener('securitypolicyviolation', (e) => this.handleCSPViolation(e));

        // 监控DOM变化
        this.setupDOMObserver();

        // 监控网络请求
        this.setupNetworkMonitor();
    }

    // DOM变化监控
    setupDOMObserver() {
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.checkElementForThreats(node);
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // 网络请求监控
    setupNetworkMonitor() {
        // 拦截fetch请求
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            const options = args[1] || {};

            if (this.isSuspiciousRequest(url, options)) {
                this.logSecurityEvent('SUSPICIOUS_REQUEST', {
                    url: url,
                    options: options,
                    timestamp: Date.now()
                });
            }

            try {
                const response = await originalFetch(...args);
                return response;
            } catch (error) {
                this.logSecurityEvent('FETCH_ERROR', {
                    url: url,
                    error: error.message,
                    timestamp: Date.now()
                });
                throw error;
            }
        };
    }

    // 检查元素是否包含威胁
    checkElementForThreats(element) {
        const tag = element.tagName.toLowerCase();

        // 检查危险标签 - 但排除合法的网站元素
        const dangerousTags = ['script', 'iframe', 'object', 'embed'];

        // 检查是否为合法的网站元素
        if (this.isLegitimateElement(element)) {
            return; // 合法元素，不需要检查
        }

        if (dangerousTags.includes(tag)) {
            this.logSecurityEvent('DANGEROUS_ELEMENT', {
                tag: tag,
                element: element.outerHTML.substring(0, 200),
                timestamp: Date.now()
            });
        }

        // 检查危险属性
        const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover'];
        dangerousAttrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
                this.logSecurityEvent('DANGEROUS_ATTRIBUTE', {
                    attribute: attr,
                    value: element.getAttribute(attr),
                    timestamp: Date.now()
                });
            }
        });

        // 检查可疑内容
        const suspiciousPatterns = [
            /javascript:/i,
            /data:text\/html/i,
            /<script/i,
            /on\w+\s*=/i
        ];

        ['innerHTML', 'outerHTML', 'href', 'src'].forEach(prop => {
            if (element[prop] && suspiciousPatterns.some(pattern => pattern.test(element[prop]))) {
                this.logSecurityEvent('SUSPICIOUS_CONTENT', {
                    property: prop,
                    value: element[prop],
                    timestamp: Date.now()
                });
            }
        });
    }

    // 检查是否为合法的网站元素
    isLegitimateElement(element) {
        const tag = element.tagName.toLowerCase();
        const src = element.src || element.href || '';

        // 检查是否为同源的脚本或资源
        if (src && (src.startsWith(window.location.origin) ||
                    src.startsWith('/') ||
                    !src.includes('http') ||
                    src.includes('localhost'))) {
            return true;
        }

        // 检查是否为已知的合法脚本
        if (tag === 'script') {
            const legitScripts = [
                'nav.js',
                'carousel.js',
                'header-manager.js',
                'spa-router-secure.js',
                'error-handler.js',
                'security-monitor.js',
                'performance-optimizer.js',
                'component-library.js',
                'search-manager.js',
                'theme-manager-safe.js',
                'user-preferences.js',
                'i18n.js'
            ];

            const scriptSrc = element.src || element.getAttribute('src') || '';
            return legitScripts.some(legit => scriptSrc.includes(legit));
        }

        // 检查是否为网站的标准元素
        const legitClasses = [
            'container', 'navbar', 'nav', 'header', 'main', 'footer',
            'carousel', 'slide', 'content', 'page-content', 'section',
            'button', 'btn', 'form', 'input', 'modal', 'dropdown'
        ];

        return Array.from(element.classList).some(className =>
            legitClasses.some(legit => className.includes(legit))
        );
    }

    // 检查可疑请求
    isSuspiciousRequest(url, options) {
        const urlStr = typeof url === 'string' ? url : url.toString();

        const suspiciousPatterns = [
            /\.\./,  // 路径遍历
            /<script/i,  // XSS尝试
            /union.*select/i,  // SQL注入
            /javascript:/i,  // JavaScript协议
            /data:.*base64/i  // Base64数据
        ];

        return suspiciousPatterns.some(pattern => pattern.test(urlStr)) ||
               this.isRateLimited(urlStr) ||
               this.isFromBlockedIP();
    }

    // 频率限制检查
    isRateLimited(url) {
        const key = this.extractDomain(url);
        const now = Date.now();
        const requests = this.rateLimiters.get(key) || [];

        // 清理超过1分钟的请求
        const recent = requests.filter(time => now - time < 60000);

        if (recent.length >= this.threatThresholds.rateLimit) {
            this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                url: url,
                requests: recent.length,
                timestamp: now
            });
            return true;
        }

        recent.push(now);
        this.rateLimiters.set(key, recent);
        return false;
    }

    // 提取域名
    extractDomain(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.hostname;
        } catch {
            return 'unknown';
        }
    }

    // 检查是否来自被阻止的IP
    isFromBlockedIP() {
        // 注意：前端无法直接获取客户端IP，这是一个示例实现
        // 实际应用中需要在服务器端实现
        return false;
    }

    // 记录安全事件
    logSecurityEvent(eventType, details) {
        if (this.disabled) {
            return; // 完全禁用安全事件记录
        }

        const event = {
            id: this.generateEventId(),
            type: eventType,
            details: details,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.events.push(event);
        this.processSecurityEvent(event);
        this.maintainEventHistory();
    }

    // 生成事件ID
    generateEventId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 处理安全事件
    processSecurityEvent(event) {
        window.logWarn('🚨 Security Event:', event.type, event.details);

        // 根据事件类型采取行动
        switch (event.type) {
            case 'DANGEROUS_ELEMENT':
                this.handleDangerousElement(event);
                break;
            case 'SUSPICIOUS_CONTENT':
                this.handleSuspiciousContent(event);
                break;
            case 'RATE_LIMIT_EXCEEDED':
                this.handleRateLimitExceeded(event);
                break;
            case 'CSP_VIOLATION':
                this.handleCSPViolation(event);
                break;
            default:
                window.logInfo('Unknown security event type:', event.type);
        }

        // 检查威胁阈值
        this.checkThreatThresholds();
    }

    // 处理危险元素
    handleDangerousElement(event) {
        const element = document.querySelector(event.details.tag);
        if (element && element.parentNode) {
            // 安全地移除危险元素
            element.parentNode.removeChild(element);
            window.logInfo('🛡️ Dangerous element removed:', event.details.tag);
        }
    }

    // 处理可疑内容
    handleSuspiciousContent(event) {
        // 清理可疑内容
        const elements = document.querySelectorAll(`[${event.details.property}]`);
        elements.forEach(el => {
            if (el[event.details.property] && el[event.details.property].includes(event.details.value)) {
                el[event.details.property] = '';
                window.logInfo('🛡️ Suspicious content cleared');
            }
        });
    }

    // 处理频率限制
    handleRateLimitExceeded(event) {
        // 临时阻止该域名的请求
        const domain = this.extractDomain(event.details.url);
        this.threats.add(domain);

        window.logInfo('🚫 Rate limit exceeded for domain:', domain);

        // 5分钟后自动解除阻止
        setTimeout(() => {
            this.threats.delete(domain);
            window.logInfo('✅ Rate limit lifted for domain:', domain);
        }, 300000);
    }

    // 处理CSP违规
    handleCSPViolation(event) {
        window.logError('🚨 CSP Violation:', event.details);
        this.blockThreatSource(event.details.source);
    }

    // 阻止威胁源
    blockThreatSource(source) {
        this.threats.add(source);
        window.logInfo('🚫 Threat source blocked:', source);
    }

    // 检查威胁阈值
    checkThreatThresholds() {
        const recentEvents = this.getRecentEvents(300000); // 5分钟内的事件

        const eventCounts = recentEvents.reduce((counts, event) => {
            counts[event.type] = (counts[event.type] || 0) + 1;
            return counts;
        }, {});

        // 检查是否超过阈值
        Object.entries(eventCounts).forEach(([type, count]) => {
            if (count >= this.threatThresholds[type.toLowerCase().replace('_', '')] || count >= 5) {
                this.triggerSecurityResponse(type, count);
            }
        });
    }

    // 触发安全响应
    triggerSecurityResponse(threatType, count) {
        if (this.debugMode) {
            window.logWarn('🔍 Debug Mode - Security event detected:', threatType, 'Count:', count);
            return; // 调试模式下不触发安全响应
        }

        window.logError('🚨 Security threat detected:', threatType, 'Count:', count);

        // 根据威胁级别采取不同的响应
        const highThreshold = this.debugMode ? 200 : 50;
        const mediumThreshold = this.debugMode ? 100 : 25;

        if (count >= highThreshold) {
            // 高威胁级别
            this.enterLockdownMode();
        } else if (count >= mediumThreshold) {
            // 中等威胁级别
            this.increaseMonitoring();
        }
    }

    // 进入锁定模式
    enterLockdownMode() {
        window.logError('🔒 Entering security lockdown mode');

        // 禁用所有交互
        document.body.style.pointerEvents = 'none';

        // 显示安全警告
        this.showSecurityWarning('检测到安全威胁，网站已进入安全模式。');

        // 1分钟后自动解除锁定
        setTimeout(() => {
            this.exitLockdownMode();
        }, 60000);
    }

    // 退出锁定模式
    exitLockdownMode() {
        window.logInfo('🔓 Exiting security lockdown mode');
        document.body.style.pointerEvents = '';
        this.hideSecurityWarning();
    }

    // 增加监控级别
    increaseMonitoring() {
        window.logInfo('📈 Increasing security monitoring level');
        // 可以在这里增加更多的监控措施
    }

    // 显示安全警告
    showSecurityWarning(message) {
        const warning = document.createElement('div');
        warning.id = 'security-warning';
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc3545;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
            font-weight: bold;
        `;
        warning.textContent = message;
        document.body.appendChild(warning);
    }

    // 隐藏安全警告
    hideSecurityWarning() {
        const warning = document.getElementById('security-warning');
        if (warning) {
            warning.remove();
        }
    }

    // 处理安全错误
    handleSecurityError(event) {
        if (event.message && (
            event.message.includes('SecurityError') ||
            event.message.includes('CSP') ||
            event.message.includes('XSS')
        )) {
            this.logSecurityEvent('SECURITY_ERROR', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                timestamp: Date.now()
            });
        }
    }

    // 处理Promise拒绝
    handlePromiseRejection(event) {
        if (event.reason && typeof event.reason === 'object') {
            this.logSecurityEvent('PROMISE_REJECTION', {
                reason: event.reason.message || event.reason,
                timestamp: Date.now()
            });
        }
    }

    // 处理CSP违规
    handleCSPViolation(event) {
        this.logSecurityEvent('CSP_VIOLATION', {
            violatedDirective: event.violatedDirective,
            blockedURI: event.blockedURI,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber,
            timestamp: Date.now()
        });
    }

    // 获取最近的事件
    getRecentEvents(timeMs = 300000) {
        const cutoff = Date.now() - timeMs;
        return this.events.filter(event => event.timestamp > cutoff);
    }

    // 维护事件历史
    maintainEventHistory() {
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
    }

    // 定期清理
    startPeriodicCleanup() {
        setInterval(() => {
            this.cleanupOldData();
            this.saveBlockedIPs();
        }, 300000); // 5分钟清理一次
    }

    // 清理旧数据
    cleanupOldData() {
        const cutoff = Date.now() - 3600000; // 1小时前
        this.events = this.events.filter(event => event.timestamp > cutoff);

        // 清理频率限制数据
        this.rateLimiters.forEach((requests, key) => {
            const recent = requests.filter(time => Date.now() - time < 60000);
            if (recent.length === 0) {
                this.rateLimiters.delete(key);
            } else {
                this.rateLimiters.set(key, recent);
            }
        });
    }

    // 保存被阻止的IP
    saveBlockedIPs() {
        try {
            localStorage.setItem('security-blocked-ips', JSON.stringify([...this.blockedIPs]));
        } catch (e) {
            window.logWarn('Failed to save blocked IPs:', e);
        }
    }

    // 加载被阻止的IP
    loadBlockedIPs() {
        try {
            const saved = localStorage.getItem('security-blocked-ips');
            if (saved) {
                this.blockedIPs = new Set(JSON.parse(saved));
            }
        } catch (e) {
            window.logWarn('Failed to load blocked IPs:', e);
        }
    }

    // 获取安全报告
    getSecurityReport() {
        const recent = this.getRecentEvents();
        const summary = recent.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});

        return {
            totalEvents: recent.length,
            threatLevel: this.calculateThreatLevel(recent),
            eventsByType: summary,
            blockedIPs: this.blockedIPs.size,
            activeThreats: this.threats.size,
            timestamp: Date.now()
        };
    }

    // 计算威胁级别
    calculateThreatLevel(events) {
        const weights = {
            'DANGEROUS_ELEMENT': 10,
            'SUSPICIOUS_CONTENT': 5,
            'RATE_LIMIT_EXCEEDED': 8,
            'CSP_VIOLATION': 7,
            'SECURITY_ERROR': 6
        };

        const totalScore = events.reduce((score, event) => {
            return score + (weights[event.type] || 1);
        }, 0);

        if (totalScore >= 50) return 'HIGH';
        if (totalScore >= 20) return 'MEDIUM';
        if (totalScore >= 5) return 'LOW';
        return 'MINIMAL';
    }

    // 导出安全日志
    exportSecurityLog() {
        const log = {
            events: this.events,
            blockedIPs: [...this.blockedIPs],
            threats: [...this.threats],
            report: this.getSecurityReport(),
            exportTime: Date.now()
        };

        const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `security-log-${new Date().toISOString()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }
}

// 全局安全监控实例
let securityMonitor;

// 初始化安全监控
function initSecurityMonitoring() {
    if (typeof window !== 'undefined') {
        securityMonitor = new SecurityEventMonitor();
        window.securityMonitor = securityMonitor;

        window.logInfo('🛡️ Security monitoring system initialized');

        // 定期输出安全报告
        setInterval(() => {
            const report = securityMonitor.getSecurityReport();
            if (report.threatLevel !== 'MINIMAL') {
                window.logInfo('🛡️ Security Report:', report);
            }
        }, 60000); // 每分钟检查一次
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSecurityMonitoring);
} else {
    initSecurityMonitoring();
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityEventMonitor, initSecurityMonitoring };
}