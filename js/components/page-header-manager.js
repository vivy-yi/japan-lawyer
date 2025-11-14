/**
 * 统一页面头部管理器
 * Created: 2025-11-14
 * Purpose: 统一管理所有页面的header组件，提供一致的体验
 */

class PageHeaderManager {
    constructor() {
        this.headers = new Map();
        this.initialized = false;

        // 页面类型配置
        this.pageConfigs = {
            'ailegal': {
                type: 'legal',
                title: '⚖️ AI一站式法律服务平台',
                subtitle: '智能化全方位法律解决方案，提供从咨询到执行的完整法律服务链条'
            },
            'aicrm': {
                type: 'crm',
                title: '🤖 AI智能CRM管理系统',
                subtitle: '智能客户关系管理平台，通过AI分析提升业务效率'
            },
            'aiglobal': {
                type: 'ai',
                title: '🌍 AI全球化服务',
                subtitle: '连接全球商业资源，AI驱动的智能匹配'
            },
            'aifinance': {
                type: 'finance',
                title: '💰 AI智能财务服务',
                subtitle: '智能财务管理平台，提供全方位的财务解决方案'
            },
            'professionals': {
                type: 'service',
                title: '👥 专业人才对接平台',
                subtitle: '认证专业人才，精准匹配，可靠服务保障'
            },
            'knowledge': {
                type: 'knowledge',
                title: '📚 AI知识库系统',
                subtitle: '实时更新的法律法规数据库，智能检索让法律研究更高效'
            },
            'community': {
                type: 'community',
                title: '🌟 AI商业社区',
                subtitle: '连接全球商业精英，共创智能商业未来'
            },
            'education': {
                type: 'service',
                title: '🎓 AI教育服务平台',
                subtitle: '智能化教育解决方案，打造个性化学习体验'
            },
            'tourism': {
                type: 'service',
                title: '✈️ AI智能旅游服务',
                subtitle: '定制化旅游方案，让旅行体验更加精彩'
            },
            'pet': {
                type: 'service',
                title: '🐾 AI宠物服务',
                subtitle: '全方位宠物护理服务，让爱宠健康成长'
            },
            'labor': {
                type: 'service',
                title: '💼 AI劳务服务平台',
                subtitle: '智能化劳务解决方案，为劳动者提供全方位保障'
            },
            'lifestyle': {
                type: 'service',
                title: '🌈 AI生活方式服务',
                subtitle: '智能化生活助手，让生活更加便捷美好'
            },
            'services': {
                type: 'service',
                title: '🌟 综合服务平台',
                subtitle: '连接优质服务资源，为您提供一站式解决方案'
            }
        };

        this.bindMethods();
    }

    /**
     * 绑定方法
     */
    bindMethods() {
        this.init = this.init.bind(this);
        this.updateHeader = this.updateHeader.bind(this);
        this.getHeaderConfig = this.getHeaderConfig.bind(this);
        this.animateHeader = this.animateHeader.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    /**
     * 初始化页面头部管理器
     */
    init() {
        if (this.initialized) {
            window.logWarn('PageHeaderManager already initialized');
            return;
        }

        try {
            this.scanHeaders();
            this.setupEventListeners();
            this.enhanceHeaders();
            this.initialized = true;
            window.logInfo(`PageHeaderManager initialized with ${this.headers.size} headers`);
        } catch (error) {
            window.logError('Failed to initialize PageHeaderManager:', error);
        }
    }

    /**
     * 扫描页面中的所有头部组件
     */
    scanHeaders() {
        const pageHeaders = document.querySelectorAll('.page-header');

        pageHeaders.forEach((header, index) => {
            const headerId = this.generateHeaderId(header, index);
            const pageType = this.detectPageType();

            this.headers.set(headerId, {
                element: header,
                type: pageType,
                config: this.pageConfigs[pageType],
                animated: false
            });

            header.setAttribute('data-header-id', headerId);
            header.setAttribute('data-page-type', pageType);
        });
    }

    /**
     * 生成头部ID
     */
    generateHeaderId(header, index) {
        const existingId = header.getAttribute('id');
        if (existingId) {
            return existingId;
        }

        const pageType = this.detectPageType();
        return `${pageType}-header-${Date.now()}-${index}`;
    }

    /**
     * 检测当前页面类型
     */
    detectPageType() {
        const pathname = window.location.pathname;
        const pageName = pathname.replace(/\.html$/, '').replace(/^\//, '');

        return pageTypeMapping[pageName] || 'default';
    }

    /**
     * 页面类型映射表
     */
    getPageTypeMapping() {
        return pageTypeMapping;
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听页面导航
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                this.scanHeaders();
                this.enhanceHeaders();
            }, 100);
        });

        // 监听DOM变化
        const observer = new MutationObserver((mutations) => {
            let hasNewHeaders = false;

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        (node.classList.contains('page-header') ||
                         node.querySelector('.page-header'))) {
                        hasNewHeaders = true;
                    }
                });
            });

            if (hasNewHeaders) {
                this.scanHeaders();
                this.enhanceHeaders();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 增强头部组件
     */
    enhanceHeaders() {
        this.headers.forEach((headerData, id) => {
            this.applyStandardStructure(headerData);
            this.addAnimations(headerData);
            this.addAccessibility(headerData);
            this.applyResponsiveBehavior(headerData);
        });
    }

    /**
     * 应用标准结构
     */
    applyStandardStructure(headerData) {
        const { element, config } = headerData;

        // 检查并修正结构
        if (!element.querySelector('.page-header__title')) {
            this.enhanceTitleElement(element, config);
        }

        if (!element.querySelector('.page-header__subtitle') && config.subtitle) {
            this.enhanceSubtitleElement(element, config);
        }

        if (!element.querySelector('.container')) {
            this.enhanceContainerStructure(element);
        }
    }

    /**
     * 增强标题元素
     */
    enhanceTitleElement(headerElement, config) {
        const titleElement = headerElement.querySelector('h1, .page-title, .page-header__title');

        if (titleElement) {
            titleElement.className = 'page-header__title';
            titleElement.textContent = config.title;

            // 添加数据属性
            titleElement.setAttribute('data-header-title', config.title);
            titleElement.setAttribute('data-page-type', config.type);
        }
    }

    /**
     * 增强副标题元素
     */
    enhanceSubtitleElement(headerElement, config) {
        let subtitleElement = headerElement.querySelector('p, .page-subtitle, .page-header__subtitle');

        if (!subtitleElement) {
            // 如果没有副标题元素，创建一个
            subtitleElement = document.createElement('p');
            const titleElement = headerElement.querySelector('.page-header__title');
            if (titleElement) {
                titleElement.insertAdjacentElement('afterend', subtitleElement);
            }
        }

        if (subtitleElement) {
            subtitleElement.className = 'page-header__subtitle';
            subtitleElement.textContent = config.subtitle;

            // 添加数据属性
            subtitleElement.setAttribute('data-header-subtitle', config.subtitle);
            subtitleElement.setAttribute('data-page-type', config.type);
        }
    }

    /**
     * 增强容器结构
     */
    enhanceContainerStructure(headerElement) {
        const container = headerElement.querySelector('.container');
        if (!container) {
            // 如果没有容器，将内容包装在容器中
            const children = Array.from(headerElement.children);
            const newContainer = document.createElement('div');
            newContainer.className = 'container';

            children.forEach(child => {
                newContainer.appendChild(child);
            });

            headerElement.appendChild(newContainer);
        }
    }

    /**
     * 添加动画效果
     */
    addAnimations(headerData) {
        const { element } = headerData;

        // 添加渐入动画类
        element.classList.add('page-header--animated');

        // 使用Intersection Observer实现滚动动画
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        element.classList.add('page-header--visible');
                        observer.unobserve(element);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            observer.observe(element);
        }

        headerData.animated = true;
    }

    /**
     * 添加无障碍功能
     */
    addAccessibility(headerData) {
        const { element } = headerData;

        // 设置ARIA标签
        element.setAttribute('role', 'banner');

        // 添加跳过链接
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = '跳转到主要内容';
        skipLink.setAttribute('aria-label', '跳转到主要内容区域');

        // 将跳过链接插入到body开头
        if (!document.querySelector('.skip-link')) {
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        // 确保键盘导航支持
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '-1');
        }
    }

    /**
     * 应用响应式行为
     */
    applyResponsiveBehavior(headerData) {
        const { element } = headerData;

        // 监听窗口大小变化
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            element.classList.toggle('page-header--mobile', isMobile);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始调用

        // 监听设备方向变化
        if ('orientation' in screen) {
            screen.addEventListener('orientationchange', handleResize);
        }
    }

    /**
     * 更新头部内容
     */
    updateHeader(headerId, updates) {
        const headerData = this.headers.get(headerId);
        if (!headerData) {
            window.logWarn(`Header with id ${headerId} not found`);
            return;
        }

        const { element } = headerData;

        // 更新标题
        if (updates.title) {
            const titleElement = element.querySelector('.page-header__title');
            if (titleElement) {
                titleElement.textContent = updates.title;
                titleElement.setAttribute('data-header-title', updates.title);
            }
        }

        // 更新副标题
        if (updates.subtitle) {
            const subtitleElement = element.querySelector('.page-header__subtitle');
            if (subtitleElement) {
                subtitleElement.textContent = updates.subtitle;
                subtitleElement.setAttribute('data-header-subtitle', updates.subtitle);
            }
        }

        // 更新类型
        if (updates.type) {
            element.className = element.className.replace(/page-header--\w+/g, '');
            element.classList.add(`page-header--${updates.type}`);
            element.setAttribute('data-page-type', updates.type);
        }

        // 更新配置
        Object.assign(headerData.config, updates);

        // 触发更新事件
        const event = new CustomEvent('headerUpdated', {
            detail: { headerId, updates, headerData }
        });
        element.dispatchEvent(event);
    }

    /**
     * 获取头部配置
     */
    getHeaderConfig(headerId) {
        const headerData = this.headers.get(headerId);
        return headerData ? headerData.config : null;
    }

    /**
     * 为特定页面添加动画
     */
    animateHeader(headerId, animationType = 'fadeIn') {
        const headerData = this.headers.get(headerId);
        if (!headerData) return;

        const { element } = headerData;

        // 移除现有动画类
        element.classList.remove('page-header--animated', 'page-header--slideIn', 'page-header--fadeIn');

        // 强制重排以应用动画
        void element.offsetWidth;

        // 添加新动画类
        element.classList.add(`page-header--${animationType}`);

        // 动画完成后清理
        setTimeout(() => {
            element.classList.remove(`page-header--${animationType}`);
        }, 1000);
    }

    /**
     * 获取所有头部信息
     */
    getAllHeaders() {
        const headers = [];
        this.headers.forEach((data, id) => {
            headers.push({
                id: id,
                type: data.type,
                config: data.config,
                element: data.element,
                animated: data.animated
            });
        });
        return headers;
    }

    /**
     * 根据页面类型获取头部
     */
    getHeaderByType(pageType) {
        const headers = [];
        this.headers.forEach((data, id) => {
            if (data.type === pageType) {
                headers.push({
                    id: id,
                    type: data.type,
                    config: data.config,
                    element: data.element
                });
            }
        });
        return headers;
    }

    /**
     * 销毁管理器
     */
    destroy() {
        if (!this.initialized) return;

        // 清理事件监听器
        // 事件监听器会在页面卸载时自动清理

        // 清理数据
        this.headers.clear();

        this.initialized = false;
        window.logInfo('PageHeaderManager destroyed');
    }
}

// 页面类型映射
const pageTypeMapping = {
    'ailegal': 'legal',
    'aicrm': 'crm',
    'aiglobal': 'ai',
    'aifinance': 'finance',
    'professionals': 'service',
    'knowledge': 'knowledge',
    'community': 'community',
    'education': 'service',
    'tourism': 'service',
    'pet': 'service',
    'labor': 'service',
    'lifestyle': 'service',
    'services': 'service'
};

// 全局实例
let pageHeaderManager = null;

// 初始化函数
function initPageHeaderManager() {
    if (pageHeaderManager) {
        pageHeaderManager.destroy();
    }

    pageHeaderManager = new PageHeaderManager();
    pageHeaderManager.init();

    return pageHeaderManager;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageHeaderManager);
} else {
    initPageHeaderManager();
}

// 导出
window.PageHeaderManager = PageHeaderManager;
window.initPageHeaderManager = initPageHeaderManager;
window.pageHeaderManager = pageHeaderManager;