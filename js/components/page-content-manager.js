/**
 * 页面内容管理器
 * 负责动态设置页面主题、背景图和内容居中对齐
 * Created: 2025-11-14
 */

class PageContentManager {
    constructor() {
        this.initialized = false;
        this.currentPage = null;
        this.backgroundElements = null;

        // 页面主题配置
        this.pageThemes = {
            'ailegal': {
                name: 'legal',
                title: 'AI法律服务',
                primaryColor: '#4f46e5',
                secondaryColor: '#ec4899',
                description: '智能化全方位法律解决方案'
            },
            'aicrm': {
                name: 'crm',
                title: 'AI智能CRM',
                primaryColor: '#0891b2',
                secondaryColor: '#0284c7',
                description: '智能客户关系管理平台'
            },
            'aiglobal': {
                name: 'global',
                title: 'AI全球化服务',
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                description: '连接全球商业资源'
            },
            'aifinance': {
                name: 'finance',
                title: 'AI智能财务',
                primaryColor: '#10b981',
                secondaryColor: '#059669',
                description: '智能财务管理平台'
            },
            'professionals': {
                name: 'professionals',
                title: '专业人才对接',
                primaryColor: '#059669',
                secondaryColor: '#34d399',
                description: '认证专业人才，精准匹配'
            },
            'knowledge': {
                name: 'knowledge',
                title: 'AI知识库系统',
                primaryColor: '#7c3aed',
                secondaryColor: '#a78bfa',
                description: '实时更新的法律法规数据库'
            },
            'community': {
                name: 'community',
                title: 'AI商业社区',
                primaryColor: '#ea580c',
                secondaryColor: '#fb923c',
                description: '连接全球商业精英'
            },
            'education': {
                name: 'education',
                title: 'AI教育服务',
                primaryColor: '#7c3aed',
                secondaryColor: '#8b5cf6',
                description: '智能化教育解决方案'
            },
            'tourism': {
                name: 'tourism',
                title: 'AI智能旅游',
                primaryColor: '#06b6d4',
                secondaryColor: '#0891b2',
                description: '定制化旅游方案'
            },
            'pet': {
                name: 'pet',
                title: 'AI宠物服务',
                primaryColor: '#10b981',
                secondaryColor: '#34d399',
                description: '全方位宠物护理服务'
            },
            'labor': {
                name: 'labor',
                title: 'AI劳务服务',
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                description: '智能化劳务解决方案'
            },
            'lifestyle': {
                name: 'lifestyle',
                title: 'AI生活方式',
                primaryColor: '#ec4899',
                secondaryColor: '#f472b6',
                description: '智能化生活助手'
            },
            'services': {
                name: 'services',
                title: '综合服务平台',
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                description: '连接优质服务资源'
            }
        };

        this.bindMethods();
    }

    /**
     * 绑定方法
     */
    bindMethods() {
        this.init = this.init.bind(this);
        this.detectCurrentPage = this.detectCurrentPage.bind(this);
        this.setupPageTheme = this.setupPageTheme.bind(this);
        this.createBackgroundElements = this.createBackgroundElements.bind(this);
        this.updateContentAlignment = this.updateContentAlignment.bind(this);
        this.handlePageNavigation = this.handlePageNavigation.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    /**
     * 初始化页面内容管理器
     */
    init() {
        if (this.initialized) {
            window.logWarn('PageContentManager already initialized');
            return;
        }

        try {
            this.detectCurrentPage();
            this.setupPageTheme();
            this.createBackgroundElements();
            this.updateContentAlignment();
            this.setupEventListeners();
            this.initialized = true;

            window.logInfo(`PageContentManager initialized for page: ${this.currentPage}`);
        } catch (error) {
            window.logError('Failed to initialize PageContentManager:', error);
        }
    }

    /**
     * 检测当前页面类型
     */
    detectCurrentPage() {
        const pathname = window.location.pathname;

        // 从路径中提取页面名称
        let pageName = pathname.replace(/\.html$/, '').replace(/^\\//, '');

        // 如果是根路径，默认为首页
        if (!pageName || pageName === '') {
            pageName = 'index';
        }

        // 如果包含 html/ 路径，提取实际页面名
        if (pageName.includes('html/')) {
            pageName = pageName.replace('html/', '');
        }

        // 获取文件名（不含扩展名）
        pageName = pageName.split('/').pop();

        this.currentPage = pageName;

        // 设置body属性
        document.body.setAttribute('data-page', pageName);
    }

    /**
     * 设置页面主题
     */
    setupPageTheme() {
        const theme = this.pageThemes[this.currentPage];

        if (!theme) {
            window.logWarn(`No theme found for page: ${this.currentPage}`);
            return;
        }

        // 设置CSS变量
        this.setThemeVariables(theme);

        // 更新页面标题
        this.updatePageTitle(theme);

        // 设置meta标签
        this.updateMetaTags(theme);
    }

    /**
     * 设置主题变量
     */
    setThemeVariables(theme) {
        const root = document.documentElement;

        root.style.setProperty('--page-primary-color', theme.primaryColor);
        root.style.setProperty('--page-secondary-color', theme.secondaryColor);
        root.style.setProperty('--page-theme-name', theme.name);
    }

    /**
     * 更新页面标题
     */
    updatePageTitle(theme) {
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = `${theme.title} - 日本商务通`;
        }

        // 更新h1标题（如果存在）
        const mainTitle = document.querySelector('h1');
        if (mainTitle && !mainTitle.hasAttribute('data-no-override')) {
            mainTitle.textContent = theme.title;
        }
    }

    /**
     * 更新meta标签
     */
    updateMetaTags(theme) {
        // 更新description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = theme.description;

        // 更新theme-color
        let themeColor = document.querySelector('meta[name="theme-color"]');
        if (!themeColor) {
            themeColor = document.createElement('meta');
            themeColor.name = 'theme-color';
            document.head.appendChild(themeColor);
        }
        themeColor.content = theme.primaryColor;
    }

    /**
     * 创建背景元素
     */
    createBackgroundElements() {
        // 检查是否已存在背景元素
        if (document.querySelector('.page-content-background')) {
            return;
        }

        // 创建背景图元素
        const backgroundElement = document.createElement('div');
        backgroundElement.className = 'page-content-background';

        // 创建渐变叠加层
        const overlayElement = document.createElement('div');
        overlayElement.className = 'page-content-overlay';

        // 插入到body的开头
        document.body.insertBefore(backgroundElement, document.body.firstChild);
        document.body.insertBefore(overlayElement, backgroundElement.nextSibling);

        this.backgroundElements = {
            background: backgroundElement,
            overlay: overlayElement
        };
    }

    /**
     * 更新内容居中对齐
     */
    updateContentAlignment() {
        // 查找主要内容容器
        const mainContent = document.querySelector('.main-content, .page-content, main');

        if (mainContent) {
            // 确保容器有正确的类名
            if (!mainContent.classList.contains('page-content-wrapper')) {
                mainContent.classList.add('page-content-wrapper');
            }

            // 设置flex居中
            mainContent.style.display = 'flex';
            mainContent.style.flexDirection = 'column';
            mainContent.style.justifyContent = 'center';
            mainContent.style.alignItems = 'center';
            mainContent.style.minHeight = 'calc(100vh - var(--header-height, 70px))';
            mainContent.style.position = 'relative';
            mainContent.style.zIndex = '2';
        }

        // 处理section元素的居中
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (!section.classList.contains('page-header') &&
                !section.classList.contains('carousel-container')) {

                section.style.maxWidth = '1200px';
                section.style.margin = '0 auto';
                section.style.padding = 'var(--spacing-lg, 24px)';
                section.style.textAlign = 'center';
            }
        });

        // 处理卡片容器的对齐
        const cardContainers = document.querySelectorAll('.service-grid, .feature-grid, .card-grid, .professionals-grid');
        cardContainers.forEach(container => {
            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.justifyContent = 'center';
            container.style.gap = 'var(--spacing-lg, 24px)';
            container.style.maxWidth = '1200px';
            container.style.margin = '0 auto';
            container.style.padding = 'var(--spacing-lg, 24px)';
        });

        // 处理单个卡片的对齐
        const cards = document.querySelectorAll('.service-card, .feature-card, .professional-card, .card');
        cards.forEach(card => {
            card.style.textAlign = 'center';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
        });
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听SPA导航
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                this.handlePageNavigation();
            }, 100);
        });

        // 监听DOM变化，检测页面切换
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 检查是否有新的主要内容区域
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList?.contains('main-content') ||
                                node.classList?.contains('page-content') ||
                                node.classList?.contains('page-header')) {
                                shouldUpdate = true;
                            }

                            // 检查子元素
                            if (node.querySelector) {
                                const mainContent = node.querySelector('.main-content, .page-content, main');
                                if (mainContent) {
                                    shouldUpdate = true;
                                }
                            }
                        }
                    });
                }
            });

            if (shouldUpdate) {
                setTimeout(() => {
                    this.handlePageNavigation();
                }, 200);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.updateContentAlignment();
        });
    }

    /**
     * 处理页面导航
     */
    handlePageNavigation() {
        const oldPage = this.currentPage;
        this.detectCurrentPage();

        if (oldPage !== this.currentPage) {
            window.logInfo(`Page changed from ${oldPage} to ${this.currentPage}`);
            this.setupPageTheme();
            this.updateContentAlignment();

            // 触发页面变化事件
            const event = new CustomEvent('pageContentChanged', {
                detail: {
                    oldPage: oldPage,
                    newPage: this.currentPage,
                    theme: this.pageThemes[this.currentPage]
                }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * 获取当前页面主题
     */
    getCurrentTheme() {
        return this.pageThemes[this.currentPage] || null;
    }

    /**
     * 手动设置页面主题
     */
    setPageTheme(pageName) {
        if (this.pageThemes[pageName]) {
            this.currentPage = pageName;
            document.body.setAttribute('data-page', pageName);
            this.setupPageTheme();
            return true;
        }
        return false;
    }

    /**
     * 添加自定义主题
     */
    addTheme(pageName, themeConfig) {
        this.pageThemes[pageName] = themeConfig;
    }

    /**
     * 获取所有可用主题
     */
    getAllThemes() {
        return { ...this.pageThemes };
    }

    /**
     * 销毁管理器
     */
    destroy() {
        if (!this.initialized) return;

        // 清理背景元素
        if (this.backgroundElements) {
            Object.values(this.backgroundElements).forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            this.backgroundElements = null;
        }

        // 移除body属性
        document.body.removeAttribute('data-page');

        this.initialized = false;
        window.logInfo('PageContentManager destroyed');
    }
}

// ==================== 全局实例和初始化 ====================

let pageContentManager = null;

/**
 * 初始化页面内容管理器
 */
function initPageContentManager() {
    if (pageContentManager) {
        pageContentManager.destroy();
    }

    pageContentManager = new PageContentManager();
    pageContentManager.init();

    return pageContentManager;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageContentManager);
} else {
    // 延迟初始化，确保其他系统已加载
    setTimeout(initPageContentManager, 100);
}

// 导出
window.PageContentManager = PageContentManager;
window.initPageContentManager = initPageContentManager;
window.pageContentManager = pageContentManager;