// Header Manager - 单Header架构管理器
// 确保在整个SPA应用中header的一致性和稳定性

class HeaderManager {
    constructor() {
        this.headerElement = null;
        this.navbarElement = null;
        this.isInitialized = false;
        this.originalContent = null;
        this.observers = [];
        this.config = {
            protectFromRemoval: true,
            ensureFixedPosition: true,
            monitorMutations: true,
            autoRestore: true
        };

        this.init();
    }

    init() {
        window.logInfo('🧭 Header Protection Service initializing...');
        this.locateHeader();
        this.setupProtection();
        this.startMonitoring();
        this.setupIntegration();
        this.isInitialized = true;
        window.logInfo('✅ Header Protection Service initialized - DOM protection active');
    }

    // 定位header
    locateHeader() {
        this.headerElement = document.querySelector('header');
        if (!this.headerElement) {
            window.logError('❌ No header element found in the document');
            return false;
        }

        this.navbarElement = this.headerElement.querySelector('#main-navbar');
        if (!this.navbarElement) {
            window.logError('❌ No navbar element found in header');
            return false;
        }

        // 安全地备份原始header内容结构
        this.backupHeaderStructure();
        window.logInfo('📍 Header located and backed up');
        return true;
    }

    // 安全地备份header结构
    backupHeaderStructure() {
        if (!this.headerElement) return;

        // 只备份结构信息，不使用innerHTML
        this.originalContent = {
            tagName: this.headerElement.tagName,
            className: this.headerElement.className,
            id: this.headerElement.id,
            attributes: this.getAttributes(this.headerElement),
            navbarStructure: this.backupNavbarStructure()
        };
    }

    // 备份navbar结构
    backupNavbarStructure() {
        if (!this.navbarElement) return null;

        return {
            tagName: this.navbarElement.tagName,
            className: this.navbarElement.className,
            id: this.navbarElement.id,
            attributes: this.getAttributes(this.navbarElement),
            childCount: this.navbarElement.children.length
        };
    }

    // 获取元素属性
    getAttributes(element) {
        const attrs = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }

    // 设置保护机制
    setupProtection() {
        if (!this.headerElement) return;

        // 添加持久属性
        this.headerElement.setAttribute('data-persistent', 'true');
        this.headerElement.setAttribute('data-header-manager', 'active');

        // 防止删除的保护
        if (this.config.protectFromRemoval) {
            this.setupRemovalProtection();
        }

        // 确保固定定位
        if (this.config.ensureFixedPosition) {
            this.ensureFixedPosition();
        }

        window.logInfo('🛡️ Header protection mechanisms activated');
    }

    // 设置防删除保护
    setupRemovalProtection() {
        // 使用MutationObserver监控DOM变化
        if (this.config.monitorMutations && 'MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        // 检查header是否被意外移除
                        if (!document.contains(this.headerElement)) {
                            window.logWarn('⚠️ Header was removed! Restoring...');
                            this.restoreHeader();
                        }

                        // 检查navbar是否还在header中
                        if (this.headerElement && !this.headerElement.contains(this.navbarElement)) {
                            window.logWarn('⚠️ Navbar was removed from header! Restoring...');
                            this.restoreNavbar();
                        }
                    }

                    // 检查属性变化
                    if (mutation.type === 'attributes' && mutation.target === this.headerElement) {
                        if (mutation.attributeName === 'data-persistent' &&
                            !this.headerElement.hasAttribute('data-persistent')) {
                            window.logWarn('⚠️ Persistent attribute removed! Re-adding...');
                            this.headerElement.setAttribute('data-persistent', 'true');
                        }
                    }
                });
            });

            // 监控整个document.body的变化
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-persistent']
            });

            this.observers.push(observer);
        }
    }

    // 确保固定定位
    ensureFixedPosition() {
        if (!this.headerElement) return;

        // 检查计算样式
        const computedStyle = window.getComputedStyle(this.headerElement);
        if (computedStyle.position !== 'fixed') {
            window.logWarn('⚠️ Header is not positioned as fixed! Applying fix...');
            this.headerElement.style.position = 'fixed';
            this.headerElement.style.top = '0';
            this.headerElement.style.left = '0';
            this.headerElement.style.right = '0';
            this.headerElement.style.zIndex = '1000';
        }

        // 确保CSS类存在
        if (!this.headerElement.classList.contains('header')) {
            this.headerElement.classList.add('header');
        }
    }

    // 安全地恢复header
    restoreHeader() {
        if (!this.originalContent) {
            window.logError('❌ No backup content available for header restoration');
            return;
        }

        // 创建新的header元素
        const restoredHeader = document.createElement(this.originalContent.tagName);
        restoredHeader.className = this.originalContent.className;
        if (this.originalContent.id) {
            restoredHeader.id = this.originalContent.id;
        }

        // 恢复属性
        Object.entries(this.originalContent.attributes).forEach(([name, value]) => {
            restoredHeader.setAttribute(name, value);
        });

        // 添加保护属性
        restoredHeader.setAttribute('data-persistent', 'true');
        restoredHeader.setAttribute('data-header-manager', 'active');

        // 创建navbar容器
        const navbarContainer = document.createElement('div');
        navbarContainer.className = 'container';

        const navbar = document.createElement('nav');
        navbar.id = 'main-navbar';

        navbarContainer.appendChild(navbar);
        restoredHeader.appendChild(navbarContainer);

        // 在body开头插入header
        document.body.insertBefore(restoredHeader, document.body.firstChild);

        // 更新引用
        this.headerElement = restoredHeader;
        this.navbarElement = navbar;

        window.logInfo('✅ Header restored safely');
    }

    // 安全地恢复navbar
    restoreNavbar() {
        if (!this.headerElement || !this.originalContent) return;

        // 清空当前header内容
        while (this.headerElement.firstChild) {
            this.headerElement.removeChild(this.headerElement.firstChild);
        }

        // 重新创建容器和navbar
        const container = document.createElement('div');
        container.className = 'container';

        const navbar = document.createElement('nav');
        navbar.id = 'main-navbar';

        container.appendChild(navbar);
        this.headerElement.appendChild(container);

        // 更新引用
        this.navbarElement = navbar;

        window.logInfo('✅ Navbar restored safely');
    }

    // 开始监控
    startMonitoring() {
        // 定期检查header完整性
        setInterval(() => {
            this.validateIntegrity();
        }, 5000); // 每5秒检查一次

        // 页面可见性变化时检查
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => this.validateIntegrity(), 100);
            }
        });

        // 窗口大小变化时检查
        window.addEventListener('resize', () => {
            setTimeout(() => this.validateIntegrity(), 100);
        });
    }

    // 验证完整性
    validateIntegrity() {
        const issues = [];

        // 检查header是否存在
        if (!this.headerElement || !document.contains(this.headerElement)) {
            issues.push('Header missing from DOM');
        }

        // 检查navbar是否存在
        if (!this.navbarElement || !document.contains(this.navbarElement)) {
            issues.push('Navbar missing from DOM');
        }

        // 检查header位置
        if (this.headerElement) {
            const headerParent = this.headerElement.parentElement;
            if (headerParent !== document.body) {
                issues.push(`Header in wrong parent: ${headerParent.tagName}`);
            }

            // 检查是否是第一个元素（应该在body开头）
            const firstElement = document.body.firstElementChild;
            if (firstElement !== this.headerElement) {
                issues.push('Header not positioned as first element');
            }
        }

        // 检查固定定位
        if (this.headerElement) {
            const computedStyle = window.getComputedStyle(this.headerElement);
            if (computedStyle.position !== 'fixed') {
                issues.push('Header not positioned as fixed');
            }
        }

        if (issues.length > 0) {
            // 限制警告日志的频率
            if (!this.lastWarningTime || Date.now() - this.lastWarningTime > 5000) {
                window.logWarn('🔍 Header integrity issues detected:', issues);
                this.lastWarningTime = Date.now();
            }
            if (this.config.autoRestore) {
                this.autoFixIssues(issues);
            }
        }
    }

    // 自动修复问题
    autoFixIssues(issues) {
        // 限制修复日志的频率
        if (!this.lastFixTime || Date.now() - this.lastFixTime > 5000) {
            window.logInfo('🔧 Auto-fixing header issues...');
            this.lastFixTime = Date.now();
        }

        issues.forEach(issue => {
            if (issue.includes('missing')) {
                this.restoreHeader();
            } else if (issue.includes('wrong parent')) {
                if (this.headerElement) {
                    document.body.insertBefore(this.headerElement, document.body.firstChild);
                }
            } else if (issue.includes('not positioned as fixed')) {
                this.ensureFixedPosition();
            }
        });

        // 修复后重新验证
        setTimeout(() => {
            const remainingIssues = [];
            if (!this.headerElement || !document.contains(this.headerElement)) {
                remainingIssues.push('Header still missing');
            }
            if (!this.navbarElement || !document.contains(this.navbarElement)) {
                remainingIssues.push('Navbar still missing');
            }

            if (remainingIssues.length === 0) {
                // 限制成功日志的频率
                if (!this.lastSuccessTime || Date.now() - this.lastSuccessTime > 5000) {
                    window.logInfo('✅ All header issues auto-fixed successfully');
                    this.lastSuccessTime = Date.now();
                }
            } else {
                window.logError('❌ Unable to auto-fix issues:', remainingIssues);
            }
        }, 100);
    }

    // 设置系统集成 - 只负责DOM保护，不处理路由逻辑
    setupIntegration() {
        // 为导航系统提供DOM保护服务
        if (window.navigationController) {
            window.logInfo('🔗 Providing DOM protection service to navigation controller...');
            window.navigationController.headerProtectionService = this;
        }

        // 为SPA路由器提供DOM保护服务
        if (window.spaRouter) {
            window.logInfo('🔗 Providing DOM protection service to SPA router...');
            window.spaRouter.domProtectionService = this;
        }
    }

    // 获取header状态
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            headerExists: !!(this.headerElement && document.contains(this.headerElement)),
            navbarExists: !!(this.navbarElement && document.contains(this.navbarElement)),
            headerPositioned: this.headerElement ?
                window.getComputedStyle(this.headerElement).position === 'fixed' : false,
            observerCount: this.observers.length,
            hasBackup: !!this.originalContent
        };
    }

    // 强制刷新导航
    refreshNavigation() {
        if (this.navbarElement && window.navigationController) {
            window.logInfo('🔄 Refreshing navigation in header...');
            // 触发导航系统重新渲染
            window.navigationController.destroy();
            setTimeout(() => {
                window.navigationController = new NavigationController();
            }, 100);
        }
    }

    // 更新header内容（安全）
    updateHeaderContent(updater) {
        if (!this.headerElement) return false;

        try {
            // 暂时移除监控以避免循环
            this.pauseMonitoring();

            // 执行更新
            const result = updater(this.headerElement, this.navbarElement);

            // 恢复监控
            this.resumeMonitoring();

            // 重新定位元素
            this.locateHeader();

            window.logInfo('✅ Header content updated safely');
            return result;
        } catch (error) {
            window.logError('❌ Failed to update header content:', error);
            this.resumeMonitoring();
            return false;
        }
    }

    // 暂停监控
    pauseMonitoring() {
        this.observers.forEach(observer => observer.disconnect());
    }

    // 恢复监控
    resumeMonitoring() {
        if (this.config.monitorMutations) {
            this.setupRemovalProtection();
        }
    }

    // 销毁管理器
    destroy() {
        window.logInfo('🗑️ Destroying Header Manager...');

        // 停止所有监控
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];

        // 清理引用
        this.headerElement = null;
        this.navbarElement = null;
        this.originalContent = null;
        this.isInitialized = false;

        window.logInfo('✅ Header Manager destroyed');
    }
}

// 全局Header管理器实例
let headerManager;

// 初始化Header管理器
function initHeaderManager() {
    if (typeof window !== 'undefined') {
        headerManager = new HeaderManager();
        window.headerManager = headerManager;

        window.logInfo('🧭 Header management system initialized');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderManager);
} else {
    initHeaderManager();
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeaderManager, initHeaderManager };
}