// Secure SPA Router - 完全安全的单页应用路由器
// 不使用innerHTML，仅使用安全的DOM操作

// Import logger system
import('./logger.js').then(({ logger }) => {
    window.spaLogger = logger;
    logger.info('🚀 Initializing Secure SPA Router', null, 'SPA_ROUTER');
}).catch(error => {
    window.logWarn('Failed to load logger system for SPA router:', error);
});

class SecureSPARouter {
    constructor() {
        this.contentContainer = null;
        this.currentPage = null;
        this.pageCache = new Map();
        this.transitionEnabled = true;
        this.loadedStyles = new Set(); // 跟踪已加载的样式
        this.logger = window.spaLogger || null;
        this.init();
    }

    init() {
        // 延迟初始化，确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupRouter());
        } else {
            this.setupRouter();
        }
    }

    setupRouter() {
        this.contentContainer = document.getElementById('page-content');
        if (!this.contentContainer) {
            window.logError('❌ Page content container not found! Looking for element with id="page-content"');
            window.logInfo('🔍 Available elements with content in the page:',
                document.querySelectorAll('main, [id*="content"], [class*="content"]').length);
            return;
        }

        // 加载窗口通信管理器（确保多窗口间语言同步）
        this.loadWindowCommunication();

        // 确保header存在且固定
        this.headerElement = document.querySelector('header');
        if (this.headerElement) {
            window.logInfo('✅ Single header architecture detected - header fixed:', this.headerElement);
            // 确保header不会被意外移除
            this.headerElement.setAttribute('data-persistent', 'true');
        } else {
            window.logWarn('⚠️ No header found - this may cause navigation issues');
        }

        window.logInfo('✅ Secure SPA Router setup started - single header mode');

        // 根据URL hash加载对应页面内容
        const hash = window.location.hash.slice(1);
        if (hash) {
            // 只有当有hash时才加载页面，保持主页内容不变
            this.loadPage(hash);
        } else {
            window.logInfo('🏠 Homepage loaded, keeping original content');
        }

        // 监听浏览器前进后退
        window.addEventListener('popstate', (event) => {
            const hash = window.location.hash.slice(1);
            if (hash && event.state && event.state.pageName) {
                this.loadPage(event.state.pageName, false);
            } else if (!hash) {
                window.logInfo('🏠 Homepage loaded via back/forward, keeping original content');
            }
        });

        // 监听导航链接点击 - 但优先让导航系统处理
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[data-page]');
            if (link) {
                event.preventDefault();
                event.stopPropagation();
                const pageName = link.getAttribute('data-page');

                // 如果导航控制器存在，让导航系统处理
                if (window.navigationController && typeof window.navigationController.navigateTo === 'function') {
                    window.navigationController.navigateTo(pageName);
                } else {
                    // 直接加载页面
                    this.loadPage(pageName);
                }
            }
        });
    }

    async loadPage(pageName, updateHistory = true) {
        // 性能监控开始
        if (this.logger) {
            this.logger.startPerformanceMark(`page-load-${pageName}`);
        }

        // 特殊处理：如果是home页面，不做任何操作
        if (pageName === 'home' || !pageName) {
            this.logger?.info('🏠 Homepage requested, keeping original content', {
                pageName: pageName,
                currentPage: this.currentPage
            }, 'SPA_ROUTER') || window.logInfo('🏠 Homepage requested, keeping original content');
            return;
        }

        if (this.currentPage === pageName) {
            this.logger?.debug(`Already on page: ${pageName}`, {
                pageName: pageName,
                currentPage: this.currentPage
            }, 'SPA_ROUTER') || window.logInfo(`Already on page: ${pageName}`);
            return;
        }

        this.logger?.info(`🔄 Loading page: ${pageName}`, {
            pageName: pageName,
            currentPage: this.currentPage,
            updateHistory: updateHistory,
            timestamp: Date.now()
        }, 'SPA_ROUTER') || window.logInfo(`🔄 Loading page: ${pageName}`);

        // 显示加载状态
        this.showLoading();

        try {
            // 安全渲染内容
            await this.safeRenderPage(pageName);

            // 更新状态
            this.currentPage = pageName;

            if (updateHistory) {
                history.pushState({ pageName: pageName }, '', `#${pageName}`);
            }

            // 更新导航状态
            this.updateActiveNavigation(pageName);
            this.updatePageTitle(pageName);

            // 标记加载完成
            this.contentContainer.classList.add('loaded');

            window.logInfo(`✅ Page loaded successfully: ${pageName}`);

        } catch (error) {
            window.logError('❌ Failed to load page:', error);
            this.showError(error);
        }
    }

    async safeRenderPage(pageName) {
        // 确保header在渲染过程中不被意外移除
        this.protectHeader();

        // 过渡动画
        if (this.transitionEnabled) {
            await this.transitionOut();
        }

        // 只清空内容容器，绝不触碰header
        while (this.contentContainer.firstChild) {
            this.contentContainer.removeChild(this.contentContainer.firstChild);
        }

        // 安全地创建页面内容
        const pageWrapper = this.createPageWrapper(pageName);
        this.contentContainer.appendChild(pageWrapper);

        // 过渡动画
        if (this.transitionEnabled) {
            await this.transitionIn();
        }

        // 再次确认header完整性
        this.verifyHeaderIntegrity(pageName);
    }

    // 保护header不被意外操作
    protectHeader() {
        if (this.headerElement) {
            // 确保header有持久属性
            if (!this.headerElement.hasAttribute('data-persistent')) {
                this.headerElement.setAttribute('data-persistent', 'true');
            }

            // 如果header不在正确位置，重新定位
            if (this.headerElement.parentNode !== document.body) {
                window.logWarn('⚠️ Header misplaced, repositioning to body');
                document.body.insertBefore(this.headerElement, document.body.firstChild);
            }

            // 确保header有正确的CSS类
            if (!this.headerElement.classList.contains('header')) {
                this.headerElement.classList.add('header');
            }
        }
    }

    // 验证header完整性
    verifyHeaderIntegrity(pageName) {
        if (!this.headerElement) {
            window.logError(`❌ Header missing after loading page: ${pageName}`);
            return;
        }

        // 检查导航是否还在
        const navbar = this.headerElement.querySelector('#main-navbar');
        if (!navbar) {
            window.logWarn(`⚠️ Navigation missing in header after loading: ${pageName}`);
        } else {
            window.logInfo(`✅ Header integrity verified for page: ${pageName}`);
        }
    }

    createPageWrapper(pageName) {
        const wrapper = document.createElement('div');
        wrapper.className = 'page-wrapper';

        if (this.isVirtualPage(pageName)) {
            // 创建虚拟页面内容
            this.createVirtualPageContent(wrapper, pageName);
        } else {
            // 创建真实页面内容
            this.createRealPageContent(wrapper, pageName);
        }

        return wrapper;
    }

    isVirtualPage(pageName) {
        return pageName.startsWith('test') || pageName === 'demo';
    }

    createVirtualPageContent(wrapper, pageName) {
        const pageData = {
            'test1': {
                title: '测试页面1',
                icon: '🧪',
                description: '这是一个虚拟生成的测试页面'
            },
            'test2': {
                title: '测试页面2',
                icon: '🔬',
                description: '这是另一个虚拟测试页面'
            },
            'demo': {
                title: '功能演示',
                icon: '🎯',
                description: '这里是各种功能的演示页面'
            }
        };

        const data = pageData[pageName] || {
            title: '未知页面',
            icon: '❓',
            description: '此页面内容尚未定义'
        };

        // 创建页面头部
        const header = document.createElement('header');
        header.className = 'page-header';

        const title = document.createElement('h1');
        title.className = 'page-title';
        title.textContent = `${data.icon} ${data.title}`;

        const description = document.createElement('p');
        description.className = 'page-description';
        description.textContent = data.description;

        header.appendChild(title);
        header.appendChild(description);

        // 创建页面内容
        const content = document.createElement('main');
        content.className = 'page-content';

        // 添加一些示例内容
        const section = document.createElement('section');
        section.className = 'demo-section';

        const features = document.createElement('div');
        features.className = 'features-grid';

        const featureList = [
            { title: '安全路由', desc: '完全避免XSS攻击' },
            { title: '平滑过渡', desc: '优雅的页面切换动画' },
            { title: '状态管理', desc: '完整的页面状态管理' },
            { title: '错误处理', desc: '完善的错误处理机制' }
        ];

        featureList.forEach(feature => {
            const card = document.createElement('div');
            card.className = 'feature-card';
            card.style.cssText = `
                padding: 2rem;
                background: var(--white, #ffffff);
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
                border: 1px solid var(--gray-lighter, #e0e0e0);
            `;

            const featureTitle = document.createElement('h3');
            featureTitle.textContent = feature.title;
            featureTitle.style.cssText = 'color: var(--primary, #1e3a5f); margin-bottom: 0.5rem;';

            const featureDesc = document.createElement('p');
            featureDesc.textContent = feature.desc;
            featureDesc.style.cssText = 'color: var(--gray, #666); margin: 0;';

            card.appendChild(featureTitle);
            card.appendChild(featureDesc);
            features.appendChild(card);
        });

        section.appendChild(features);

        // 创建操作按钮
        const actions = document.createElement('div');
        actions.className = 'action-buttons';
        actions.style.cssText = 'margin-top: 3rem; text-align: center; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;';

        const buttons = [
            { text: '返回首页', action: () => this.loadPage('home'), class: 'btn-primary' },
            { text: '测试页面1', action: () => this.loadPage('test1'), class: 'btn-secondary' },
            { text: '刷新页面', action: () => window.location.reload(), class: 'btn-outline' }
        ];

        buttons.forEach(btnConfig => {
            const button = document.createElement('button');
            button.className = btnConfig.class;
            button.textContent = btnConfig.text;
            button.style.cssText = `
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
                background: ${btnConfig.class === 'btn-primary' ? 'var(--primary, #1e3a5f)' : 'transparent'};
                color: ${btnConfig.class === 'btn-primary' ? 'white' : 'var(--primary, #1e3a5f)'};
                border: ${btnConfig.class === 'btn-outline' ? '1px solid var(--primary, #1e3a5f)' : 'none'};
            `;

            button.addEventListener('click', btnConfig.action);
            button.addEventListener('mouseenter', () => {
                button.style.opacity = '0.8';
            });
            button.addEventListener('mouseleave', () => {
                button.style.opacity = '1';
            });

            actions.appendChild(button);
        });

        content.appendChild(section);
        content.appendChild(actions);

        wrapper.appendChild(header);
        wrapper.appendChild(content);

        // 异步加载真实页面内容（如果需要）
        this.loadRealPageAsync(pageName, wrapper);
    }

    createRealPageContent(wrapper, pageName) {
        // 为真实页面创建占位内容
        const placeholder = document.createElement('div');
        placeholder.className = 'page-placeholder';

        const loadingTitle = document.createElement('h2');
        loadingTitle.textContent = `页面加载中: ${pageName}`;
        loadingTitle.style.cssText = 'text-align: center; color: var(--primary, #1e3a5f); margin: 2rem 0;';

        const loadingDesc = document.createElement('p');
        loadingDesc.textContent = '正在从服务器获取页面内容...';
        loadingDesc.style.cssText = 'text-align: center; color: var(--gray, #666);';

        placeholder.appendChild(loadingTitle);
        placeholder.appendChild(loadingDesc);
        wrapper.appendChild(placeholder);

        // 异步加载真实页面内容
        this.loadRealPageAsync(pageName, wrapper);
    }

    // 简单的字符串哈希函数
hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(36);
}

async loadRealPageAsync(pageName, wrapper) {
        // 尝试加载html文件夹中的HTML文件 - 单header架构模式
        window.logInfo(`🔄 Loading real page (single header mode): ${pageName}`);

        try {
            // 首先尝试本地HTTP服务器
            const pageMapping = {
                'aicrm': 'aicrm.html',
                'ailegal': 'ailegal.html',
                'aiglobal': 'aiglobal.html',
                'aifinance': 'aifinance.html',
                'community': 'community.html',
                'education': 'education.html',
                'knowledge': 'knowledge.html',
                'labor': 'labor.html',
                'lifestyle': 'lifestyle.html',
                'pet': 'pet.html',
                'professionals': 'professionals.html',
                'services': 'services.html',
                'tourism': 'tourism.html',
                'complete-demo': 'complete-demo.html',
                'ai-architecture': 'ai-architecture.html'  // Special case: root directory file
            };

            const fileName = pageMapping[pageName];
            if (!fileName) {
                window.logError(`❌ Page mapping not found for: ${pageName}`);
                window.logInfo('📋 Available pages:', Object.keys(pageMapping));
                throw new Error(`Page not found: ${pageName}`);
            }


            // 检查是否在本地服务器环境下
            const isLocalServer = window.location.protocol === 'http:' || window.location.protocol === 'https:';

            if (isLocalServer) {
                // 特殊处理AI架构页面（在根目录）
                const filePath = pageName === 'ai-architecture' ? fileName : `html/${fileName}`;
                window.logInfo(`📡 Fetching from server: ${filePath}`);

                try {
                    const response = await fetch(filePath);
                    if (!response.ok) {
                        throw new Error(`Server error loading ${fileName}: ${response.status}`);
                    }
                    const htmlContent = await response.text();
                    this.processPageContent(htmlContent, wrapper, pageName);
                } catch (fetchError) {
                    window.logWarn(`⚠️ Server fetch failed: ${fetchError.message}`);
                    // 如果HTTP服务器也失败了，使用备用内容
                    window.logInfo('📁 Using fallback content due to server error...');
                    this.loadFallbackPageContent(pageName, wrapper);
                }
            } else {
                // 本地文件系统 - 使用备用内容
                window.logInfo(`📁 Using fallback content for: ${pageName}`);
                this.loadFallbackPageContent(pageName, wrapper);
            }
        } catch (error) {
            window.logError(`❌ Failed to load page ${pageName}:`, error);

            const placeholder = wrapper.querySelector('.page-placeholder');
            if (placeholder) {
                // 安全地创建错误内容
                while (placeholder.firstChild) {
                    placeholder.removeChild(placeholder.firstChild);
                }

                const errorTitle = document.createElement('h2');
                errorTitle.textContent = '页面加载失败';
                errorTitle.style.color = 'var(--error, #e53e3e)';
                errorTitle.style.textAlign = 'center';

                const errorMsg = document.createElement('p');
                errorMsg.textContent = `无法加载页面: ${pageName}`;
                errorMsg.style.color = 'var(--gray, #666)';
                errorMsg.style.textAlign = 'center';

                const errorDetail = document.createElement('p');
                errorDetail.textContent = `错误: ${error.message}`;
                errorDetail.style.color = 'var(--gray, #666)';
                errorDetail.style.textAlign = 'center';
                errorDetail.style.fontSize = '0.9rem';

                placeholder.appendChild(errorTitle);
                placeholder.appendChild(errorMsg);
                placeholder.appendChild(errorDetail);
            }
        }
    }

    async transitionOut() {
        return new Promise(resolve => {
            this.contentContainer.style.opacity = '0';
            this.contentContainer.style.transform = 'translateY(20px)';
            this.contentContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

            setTimeout(resolve, 300);
        });
    }

    async transitionIn() {
        return new Promise(resolve => {
            this.contentContainer.style.opacity = '1';
            this.contentContainer.style.transform = 'translateY(0)';
            this.contentContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

            setTimeout(resolve, 300);
        });
    }

    updateActiveNavigation(pageName) {
        // 移除所有活跃状态
        const navLinks = document.querySelectorAll('a[data-page]');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // 添加当前页面的活跃状态
        const activeLink = document.querySelector(`a[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    updatePageTitle(pageName) {
        const titles = {
            'home': '首页 - 日本商务通',
            'test1': '测试页面1 - 日本商务通',
            'test2': '测试页面2 - 日本商务通',
            'demo': '功能演示 - 日本商务通',
            'ailegal': 'AI法律咨询 - 日本商务通',
            'aicrm': 'AI CRM系统 - 日本商务通',
            'aiglobal': 'AI出海服务 - 日本商务通',
            'aifinance': 'AI财务服务 - 日本商务通'
        };

        document.title = titles[pageName] || `${pageName} - 日本商务通`;
    }

    showLoading() {
        this.contentContainer.classList.remove('loaded');
        this.contentContainer.classList.add('loading');
    }

    showError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            padding: 2rem;
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 8px;
            color: #c33;
            text-align: center;
            margin: 2rem auto;
            max-width: 500px;
        `;

        const errorTitle = document.createElement('h3');
        errorTitle.textContent = '🚫 页面暂时无法访问';
        errorTitle.style.cssText = 'margin: 0 0 1rem 0; color: #c33; font-size: 1.5rem;';

        const errorMsg = document.createElement('p');
        errorMsg.textContent = error.message || '未知错误';
        errorMsg.style.cssText = 'margin: 0;';

        const retryBtn = document.createElement('button');
        retryBtn.textContent = '🔄 重新加载';
        retryBtn.style.cssText = `
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #c33;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        retryBtn.addEventListener('click', () => {
            if (this.currentPage) {
                this.loadPage(this.currentPage);
            }
        });

        // 添加返回首页按钮
        const homeBtn = document.createElement('button');
        homeBtn.textContent = '🏠 返回首页';
        homeBtn.style.cssText = `
            margin-left: 0.5rem;
            padding: 0.5rem 1rem;
            background: #666;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        homeBtn.addEventListener('click', () => {
            this.loadPage('home');
        });

        errorDiv.appendChild(errorTitle);
        errorDiv.appendChild(errorMsg);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'margin-top: 1rem;';
        buttonContainer.appendChild(retryBtn);
        buttonContainer.appendChild(homeBtn);

        errorDiv.appendChild(buttonContainer);

        // 清空容器并显示错误
        while (this.contentContainer.firstChild) {
            this.contentContainer.removeChild(this.contentContainer.firstChild);
        }
        this.contentContainer.appendChild(errorDiv);
    }

    
    // 公共方法
    navigateTo(pageName) {
        return this.loadPage(pageName);
    }

    getCurrentPage() {
        return this.currentPage;
    }

    destroy() {
        // 清理事件监听器
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleClick);

        // 清空内容
        if (this.contentContainer) {
            while (this.contentContainer.firstChild) {
                this.contentContainer.removeChild(this.contentContainer.firstChild);
            }
        }

        this.pageCache.clear();
        window.logInfo('🗑️ SPA Router destroyed');
    }

    // 处理HTML页面内容
    processPageContent(htmlContent, wrapper, pageName) {
        // 创建临时DOM元素来解析HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        try {
            // 提取并加载CSS样式（避免重复）
            const styles = tempDiv.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(style => {
                if (style.tagName === 'STYLE') {
                    // 内联样式 - 使用内容哈希避免重复
                    const styleHash = this.hashString(style.textContent);
                    if (!this.loadedStyles.has(`style-${styleHash}`)) {
                        const styleElement = document.createElement('style');
                        styleElement.textContent = style.textContent;
                        styleElement.setAttribute('data-page', pageName);
                        document.head.appendChild(styleElement);
                        this.loadedStyles.add(`style-${styleHash}`);
                        window.logInfo(`🎨 Loaded inline styles for page: ${pageName}`);
                    }
                } else if (style.tagName === 'LINK' && style.rel === 'stylesheet') {
                    // 外部样式表 - 使用href避免重复
                    if (!this.loadedStyles.has(style.href)) {
                        const linkElement = document.createElement('link');
                        linkElement.rel = 'stylesheet';
                        linkElement.href = style.href;
                        linkElement.setAttribute('data-page', pageName);
                        document.head.appendChild(linkElement);
                        this.loadedStyles.add(style.href);
                        window.logInfo(`🎨 Loaded stylesheet: ${style.href}`);
                    }
                }
            });

            // 动态加载页面所需的JavaScript文件（非阻塞）
            if (pageName === 'professionals') {
                this.loadPageScript('js/pages/professionals.js', 'professionals').catch(e => window.logWarn('Script load failed:', e));
            } else if (pageName === 'ailegal') {
                // 先加载共享工具和筛选管理器，再加载AI法律服务页面脚本
                this.loadPageScript('js/shared/utils.js', 'utils').then(() => {
                    return this.loadPageScript('js/shared/filter-manager.js', 'filter-manager');
                }).then(() => {
                    return this.loadPageScript('js/pages/ailaw.js', 'ailaw');
                }).catch(e => window.logWarn('AI Legal script load failed:', e));
            } else if (pageName === 'aicrm') {
                // 加载AI CRM系统页面脚本
                this.loadPageScript('js/pages/aicrm.js', 'aicrm').catch(e => window.logWarn('AI CRM script load failed:', e));
            } else if (pageName === 'aiglobal') {
                // 先加载共享工具和筛选管理器，再加载AI出海服务页面脚本
                this.loadPageScript('js/shared/utils.js', 'utils').then(() => {
                    return this.loadPageScript('js/shared/filter-manager.js', 'filter-manager');
                }).then(() => {
                    return this.loadPageScript('js/pages/aiglobal.js', 'aiglobal');
                }).catch(e => window.logWarn('AI Global script load failed:', e));
            } else if (pageName === 'aifinance') {
                // 先加载共享工具和筛选管理器，再加载AI财务服务页面脚本
                this.loadPageScript('js/shared/utils.js', 'utils').then(() => {
                    return this.loadPageScript('js/shared/filter-manager.js', 'filter-manager');
                }).then(() => {
                    return this.loadPageScript('js/pages/aifinance.js', 'aifinance');
                }).catch(e => window.logWarn('AI Finance script load failed:', e));
            } else if (['education', 'labor', 'tourism'].includes(pageName)) {
                this.loadPageScript('js/pages/services.js', 'services').catch(e => window.logWarn('Script load failed:', e));
            } else if (pageName === 'pet') {
                this.loadPageScript('js/pages/pet.js', 'pet').catch(e => window.logWarn('Script load failed:', e));
            } else if (pageName === 'lifestyle') {
                this.loadPageScript('js/pages/services.js', 'lifestyle').catch(e => window.logWarn('Script load failed:', e));
            }

            // i18n系统已禁用 - 仅保留导航栏语言切换功能
            // 不再加载删除的 js/core/i18n.js 文件

            // 提取主要内容区域
            const pageContent = tempDiv.querySelector('main, .page-content, .container');
            if (pageContent) {
                // 安全地清空并替换内容
                while (wrapper.firstChild) {
                    wrapper.removeChild(wrapper.firstChild);
                }
                wrapper.appendChild(pageContent.cloneNode(true));
            } else {
                throw new Error(`No content found in page: ${pageName}`);
            }

            window.logInfo(`✅ Successfully processed page: ${pageName}`);
        } finally {
            // 清理临时DOM元素
            tempDiv.remove();
        }
    }

    // 加载窗口通信管理器（确保多窗口间语言同步）- 优化版本
    async loadWindowCommunication() {
        try {
            // 检查是否已经加载了窗口通信管理器
            if (window.windowCommManagerOptimized && window.windowCommManagerOptimized.getStatus().isInitialized) {
                window.logInfo('🔄 Optimized Window Communication Manager already initialized');
                return;
            }

            window.logInfo('🔄 Loading Optimized Window Communication Manager...');

            // 动态加载窗口通信管理器脚本
            await this.loadPageScript('js/core/window-communication-optimized.js', 'window-communication-optimized');

            window.logInfo('✅ Optimized Window Communication Manager loaded successfully');

        } catch (error) {
            window.logWarn('⚠️ Failed to load Optimized Window Communication Manager:', error);
            // 继续执行，不阻塞应用启动
        }
    }

    // 动态加载页面JavaScript文件
    async loadPageScript(scriptPath, pageType) {
        // 避免重复加载同一个脚本
        if (this.loadedScripts && this.loadedScripts.has(scriptPath)) {
            window.logInfo(`⏩ Script already loaded: ${scriptPath}`);
            return;
        }

        // 初始化已加载脚本记录
        if (!this.loadedScripts) {
            this.loadedScripts = new Set();
        }

        try {
            window.logInfo(`📜 Loading script: ${scriptPath}`);

            // 动态创建script标签
            const script = document.createElement('script');
            script.src = scriptPath;
            script.type = 'text/javascript';

            // 返回Promise来等待脚本加载完成
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    this.loadedScripts.add(scriptPath);
                    window.logInfo(`✅ Script loaded successfully: ${pageType}`);
                    resolve();
                };

                script.onerror = () => {
                    window.logWarn(`⚠️ Failed to load script: ${scriptPath}`);
                    reject(new Error(`Failed to load script: ${scriptPath}`));
                };

                document.head.appendChild(script);
            });

        } catch (error) {
            window.logError(`❌ Error loading script ${scriptPath}:`, error);
            // 不抛出错误，允许页面继续加载
        }
    }

    // 字符串哈希函数（用于样式去重）
    hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }
}

// 自动初始化路由器
let spaRouter;

function initializeRouter() {
    spaRouter = new SecureSPARouter();
    window.spaRouter = spaRouter;
    window.logInfo('✅ Secure SPA Router initialized');
}

// 等待DOM完全加载后初始化路由器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRouter);
} else {
    // DOM已经加载完成
    setTimeout(initializeRouter, 100);
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureSPARouter;
}
// 安全的备用页面加载方法
SecureSPARouter.prototype.loadFallbackPageContent = function(pageName, wrapper) {
    window.logInfo(`📄 Loading safe fallback content for: ${pageName}`);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'page-content-wrapper fallback-content';
    contentDiv.setAttribute('data-page', pageName);

    // 创建页面头部
    const pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';

    const titles = {
        'ailegal': '⚖️ AI法律服务',
        'aicrm': '🤖 AI CRM系统',
        'aiglobal': '🌍 AI出海服务',
        'aifinance': '💰 AI财务服务',
        'professionals': '👥 专业人才',
        'knowledge': '📚 知识库'
    };

    const title = document.createElement('h1');
    title.textContent = titles[pageName] || '📄 ' + pageName;
    pageHeader.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = '该页面内容正在完善中，敬请期待...';
    pageHeader.appendChild(subtitle);

    contentDiv.appendChild(pageHeader);

    // 创建页面内容
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content';

    const homeBtn = document.createElement('button');
    homeBtn.className = 'btn-primary';
    homeBtn.textContent = '返回首页';
    homeBtn.onclick = () => {
        // 安全的导航调用，优先使用SPA路由器
        if (window.spaRouter && window.spaRouter.loadPage) {
            window.spaRouter.loadPage('home');
        } else if (window.testNavigationClick && typeof window.testNavigationClick === 'function') {
            window.testNavigationClick('home');
        } else {
            // 备用方案：直接修改hash
            window.location.hash = '';
            window.logInfo('🏠 Navigating to home via hash');
        }
    };
    pageContent.appendChild(homeBtn);

    contentDiv.appendChild(pageContent);
    wrapper.appendChild(contentDiv);

    window.logInfo(`✅ Safe fallback content loaded: ${pageName}`);
};
