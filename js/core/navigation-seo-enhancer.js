// Navigation SEO and Accessibility Enhancer
// 导航栏SEO和无障碍功能增强器

class NavigationSEOEnhancer {
    constructor() {
        this.structuredData = null;
        this.accessibilityRules = null;
        this.init();
    }

    init() {
        console.log('🔍 Initializing Navigation SEO Enhancer...');
        this.setupStructuredData();
        this.setupAccessibilityRules();
        this.addSchemaMarkup();
        this.enhanceAccessibility();
    }

    // 设置结构化数据
    setupStructuredData() {
        this.structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: '日本商务通',
            alternateName: [
                { '@language': 'zh', '@value': '日本商务通' },
                { '@language': 'ja', '@value': '日本ビジネスハブ' },
                { '@language': 'en', '@value': 'Japan Business Hub' }
            ],
            url: window.location.origin,
            description: '一站式日本商业服务平台，提供AI法律服务、CRM系统、专业人才对接等服务',
            inLanguage: ['zh', 'ja', 'en'],
            potentialAction: [
                {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: window.location.origin + '/search?q={search_term_string}'
                    },
                    'query-input': 'required name=search_term_string'
                }
            ]
        };
    }

    // 设置无障碍规则
    setupAccessibilityRules() {
        this.accessibilityRules = {
            keyboardNavigation: {
                enabled: true,
                trapFocus: true,
                skipLinks: true
            },
            screenReader: {
                announceChanges: true,
                descriptiveLabels: true,
                liveRegions: true
            },
            visual: {
                highContrast: true,
                reducedMotion: true,
                focusIndicators: true
            },
            cognitive: {
                clearLabels: true,
                consistentNavigation: true,
                errorPrevention: true
            }
        };
    }

    // 添加Schema标记
    addSchemaMarkup() {
        // 添加主网站Schema
        this.addJSONLDSchema(this.structuredData);

        // 添加面包屑导航Schema
        this.addBreadcrumbSchema();

        // 添加导航菜单Schema
        this.addNavigationSchema();
    }

    // 添加JSON-LD Schema
    addJSONLDSchema(data) {
        // 移除现有的schema
        const existingSchema = document.querySelector('script[type="application/ld+json"]');
        if (existingSchema && existingSchema.getAttribute('data-nav-schema')) {
            existingSchema.remove();
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-nav-schema', 'true');
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }

    // 添加面包屑导航Schema
    addBreadcrumbSchema() {
        const currentPage = this.getCurrentPageFromHash();
        if (currentPage === 'home') return;

        const breadcrumbList = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: '首页',
                    item: window.location.origin
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: this.getPageTitle(currentPage),
                    item: `${window.location.origin}#${currentPage}`
                }
            ]
        };

        this.addJSONLDSchema(breadcrumbList);
    }

    // 添加导航菜单Schema
    addNavigationSchema() {
        const navigation = document.querySelector('nav[role="navigation"], .navbar, #main-navbar');
        if (!navigation) return;

        const navItems = navigation.querySelectorAll('a[data-page]');
        const siteNavigationElement = {
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: '主导航菜单',
            url: window.location.origin,
            numberOfItems: navItems.length
        };

        this.addJSONLDSchema(siteNavigationElement);
    }

    // 增强无障碍功能
    enhanceAccessibility() {
        this.addSkipLinks();
        this.enhanceKeyboardNavigation();
        this.addLiveRegions();
        this.enhanceFocusManagement();
        this.addAriaLabels();
        this.setupReducedMotion();
    }

    // 添加跳转链接
    addSkipLinks() {
        // 检查是否已存在
        if (document.querySelector('.skip-link')) return;

        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = '跳转到主要内容';

        // 设置无障碍属性
        skipLink.setAttribute('aria-label', '跳转到主要内容区域');
        skipLink.setAttribute('role', 'navigation');

        // 插入到body开头
        document.body.insertBefore(skipLink, document.body.firstChild);

        console.log('♿ Skip link added for accessibility');
    }

    // 增强键盘导航
    enhanceKeyboardNavigation() {
        const nav = document.querySelector('nav[role="navigation"], .navbar, #main-navbar');
        if (!nav) return;

        // 确保导航元素有正确的role属性
        if (!nav.hasAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }

        // 确保导航菜单有正确的role
        const navMenu = nav.querySelector('.nav-menu, ul');
        if (navMenu && !navMenu.hasAttribute('role')) {
            navMenu.setAttribute('role', 'menubar');
        }

        // 为所有导航链接设置role
        const navLinks = nav.querySelectorAll('a[data-page]');
        navLinks.forEach((link, index) => {
            if (!link.hasAttribute('role')) {
                link.setAttribute('role', 'menuitem');
            }

            // 设置tabindex
            if (index === 0) {
                link.setAttribute('tabindex', '0');
            } else {
                link.setAttribute('tabindex', '-1');
            }

            // 添加键盘事件监听器
            this.addKeyboardEventListeners(link, navLinks, index);
        });

        console.log('⌨️ Enhanced keyboard navigation for navigation');
    }

    // 添加键盘事件监听器
    addKeyboardEventListeners(element, allElements, currentIndex) {
        element.addEventListener('keydown', (e) => {
            let targetIndex = currentIndex;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    targetIndex = (currentIndex + 1) % allElements.length;
                    allElements[targetIndex].focus();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    targetIndex = currentIndex === 0 ? allElements.length - 1 : currentIndex - 1;
                    allElements[targetIndex].focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    allElements[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    allElements[allElements.length - 1].focus();
                    break;
            }
        });
    }

    // 添加实时区域
    addLiveRegions() {
        // 语言切换通知区域
        if (!document.getElementById('language-status')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'language-status';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only'; // 视觉隐藏但屏幕阅读器可读
            document.body.appendChild(liveRegion);
        }

        // 页面导航通知区域
        if (!document.getElementById('navigation-status')) {
            const navStatusRegion = document.createElement('div');
            navStatusRegion.id = 'navigation-status';
            navStatusRegion.setAttribute('aria-live', 'polite');
            navStatusRegion.setAttribute('aria-atomic', 'true');
            navStatusRegion.className = 'sr-only';
            document.body.appendChild(navStatusRegion);
        }

        console.log('📢 Live regions added for screen readers');
    }

    // 增强焦点管理
    enhanceFocusManagement() {
        // 添加焦点样式
        if (!document.querySelector('#focus-styles')) {
            const style = document.createElement('style');
            style.id = 'focus-styles';
            style.textContent = `
                /* 增强的焦点样式 */
                :focus-visible {
                    outline: 3px solid #007acc !important;
                    outline-offset: 2px !important;
                    border-radius: 4px !important;
                }

                /* 高对比度模式焦点样式 */
                @media (prefers-contrast: high) {
                    :focus-visible {
                        outline: 4px solid #000 !important;
                        background-color: #ff0 !important;
                        color: #000 !important;
                    }
                }

                /* 屏幕阅读器专用类 */
                .sr-only {
                    position: absolute !important;
                    width: 1px !important;
                    height: 1px !important;
                    padding: 0 !important;
                    margin: -1px !important;
                    overflow: hidden !important;
                    clip: rect(0, 0, 0, 0) !important;
                    white-space: nowrap !important;
                    border: 0 !important;
                }

                /* 减少动画偏好 */
                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        console.log('🎯 Enhanced focus management');
    }

    // 添加ARIA标签
    addAriaLabels() {
        const nav = document.querySelector('nav[role="navigation"], .navbar, #main-navbar');
        if (!nav) return;

        // 为导航容器添加标签
        if (!nav.hasAttribute('aria-label')) {
            nav.setAttribute('aria-label', '主导航菜单');
        }

        // 为语言切换器添加标签
        const langSwitcher = nav.querySelector('.language-switcher');
        if (langSwitcher && !langSwitcher.hasAttribute('aria-label')) {
            langSwitcher.setAttribute('aria-label', '语言选择 Language Selection');
        }

        // 为移动菜单切换按钮添加标签
        const mobileToggle = nav.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            if (!mobileToggle.hasAttribute('aria-label')) {
                mobileToggle.setAttribute('aria-label', '切换导航菜单');
            }
            if (!mobileToggle.hasAttribute('aria-controls')) {
                mobileToggle.setAttribute('aria-controls', 'main-nav-menu');
            }
        }

        // 为下拉菜单添加标签
        const dropdowns = nav.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle, button');
            if (toggle && !toggle.hasAttribute('aria-haspopup')) {
                toggle.setAttribute('aria-haspopup', 'true');
                toggle.setAttribute('aria-expanded', 'false');
            }

            const menu = dropdown.querySelector('.dropdown-menu, ul');
            if (menu && !menu.hasAttribute('role')) {
                menu.setAttribute('role', 'menu');
                menu.setAttribute('aria-hidden', 'true');
            }
        });

        console.log('🏷️ Enhanced ARIA labels');
    }

    // 设置减少动画偏好
    setupReducedMotion() {
        // 监听用户的减少动画偏好
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
            console.log('🐌 Reduced motion preference detected');
        }

        // 监听偏好变化
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.setAttribute('data-reduced-motion', 'true');
            } else {
                document.documentElement.removeAttribute('data-reduced-motion');
            }
        });
    }

    // 获取当前页面
    getCurrentPageFromHash() {
        const hash = window.location.hash.slice(1);
        return hash || 'home';
    }

    // 获取页面标题
    getPageTitle(page) {
        const titles = {
            'home': '首页',
            'ailegal': 'AI法律服务',
            'aicrm': 'AI CRM系统',
            'knowledge': '知识库',
            'professionals': '专业人才',
            'lifestyle': '生活帮忙',
            'education': '留学教育',
            'labor': '劳务派遣',
            'pet': '宠物服务',
            'tourism': '旅游服务',
            'community': '社群网络'
        };
        return titles[page] || page;
    }

    // 通知屏幕阅读器页面变化
    announcePageChange(pageName, language = 'zh') {
        const liveRegion = document.getElementById('navigation-status');
        if (liveRegion) {
            const messages = {
                zh: `已导航到${pageName}`,
                ja: `${pageName}にナビゲートしました`,
                en: `Navigated to ${pageName}`
            };
            liveRegion.textContent = messages[language] || messages.zh;
        }
    }

    // 通知语言切换
    announceLanguageChange(language) {
        const liveRegion = document.getElementById('language-status');
        if (liveRegion) {
            const langNames = {
                zh: '中文',
                ja: '日本語',
                en: 'English'
            };
            liveRegion.textContent = `语言已切换到 ${langNames[language]}`;
        }
    }

    // 生成SEO友好的URL
    generateSEOURL(page, language = 'zh') {
        const baseUrl = window.location.origin;
        const urlMap = {
            zh: {
                'home': '',
                'ailegal': '/legal-services',
                'aicrm': '/crm-system',
                'knowledge': '/knowledge-base'
            },
            ja: {
                'home': '/ja',
                'ailegal': '/ja/legal-services',
                'aicrm': '/ja/crm-system',
                'knowledge': '/ja/knowledge-base'
            },
            en: {
                'home': '/en',
                'ailegal': '/en/legal-services',
                'aicrm': '/en/crm-system',
                'knowledge': '/en/knowledge-base'
            }
        };

        const path = urlMap[language]?.[page] || `/${page}`;
        return baseUrl + path;
    }

    // 更新页面元数据
    updatePageMetadata(page, language = 'zh') {
        // 更新标题
        const titles = {
            zh: `${this.getPageTitle(page)} | 日本商务通`,
            ja: `${this.getPageTitle(page)} | 日本ビジネスハブ`,
            en: `${this.getPageTitle(page)} | Japan Business Hub`
        };
        document.title = titles[language];

        // 更新描述
        const descriptions = {
            zh: `日本商务通提供${this.getPageTitle(page)}等专业服务，是在日华人的首选商业服务平台。`,
            ja: `日本ビジネスハブは${this.getPageTitle(page)}など専門サービスを提供、在日華人向けビジネスプラットフォームです。`,
            en: `Japan Business Hub offers professional services including ${this.getPageTitle(page)}, the preferred business platform for Chinese in Japan.`
        };

        // 更新或创建meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = descriptions[language];

        // 更新Open Graph标签
        this.updateOpenGraphTags(page, language);

        // 更新语言标签
        document.documentElement.lang = language;
    }

    // 更新Open Graph标签
    updateOpenGraphTags(page, language) {
        const ogTags = [
            { property: 'og:title', content: `${this.getPageTitle(page)} | 日本商务通` },
            { property: 'og:description', content: `专业${this.getPageTitle(page)}服务 - 日本商务通` },
            { property: 'og:url', content: window.location.href },
            { property: 'og:type', content: 'website' },
            { property: 'og:locale', content: language === 'zh' ? 'zh_CN' : language === 'ja' ? 'ja_JP' : 'en_US' }
        ];

        ogTags.forEach(tag => {
            let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', tag.property);
                document.head.appendChild(metaTag);
            }
            metaTag.content = tag.content;
        });
    }

    // 检查无障碍合规性
    checkAccessibilityCompliance() {
        const issues = [];

        // 检查必要的ARIA属性
        const nav = document.querySelector('nav[role="navigation"], .navbar, #main-navbar');
        if (nav && !nav.hasAttribute('aria-label') && !nav.hasAttribute('aria-labelledby')) {
            issues.push('导航容器缺少ARIA标签');
        }

        // 检查跳转链接
        if (!document.querySelector('.skip-link')) {
            issues.push('缺少跳转到主要内容的链接');
        }

        // 检查焦点管理
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) {
            issues.push('没有可聚焦的元素');
        }

        // 检查语言属性
        if (!document.documentElement.hasAttribute('lang')) {
            issues.push('HTML元素缺少lang属性');
        }

        // 检查页面标题
        if (!document.title || document.title.trim().length === 0) {
            issues.push('页面缺少标题');
        }

        return {
            compliant: issues.length === 0,
            issues: issues,
            score: Math.max(0, 100 - (issues.length * 10))
        };
    }

    // 获取SEO建议
    getSEOSuggestions() {
        const suggestions = [];
        const currentURL = window.location.href;

        // URL建议
        if (currentURL.includes('#') && currentURL.split('#')[1]) {
            suggestions.push('考虑使用SEO友好的URL替代hash路由');
        }

        // 结构化数据建议
        if (!document.querySelector('script[type="application/ld+json"]')) {
            suggestions.push('添加结构化数据以提升搜索引擎理解度');
        }

        // Meta标签建议
        const metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc || metaDesc.content.length < 50) {
            suggestions.push('添加或优化页面描述（至少50字符）');
        }

        // 图片Alt属性建议
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');
        if (imagesWithoutAlt.length > 0) {
            suggestions.push(`为${imagesWithoutAlt.length}张图片添加alt属性`);
        }

        // 标题建议
        if (document.title.length > 60) {
            suggestions.push('页面标题过长，建议保持在60字符以内');
        }

        return suggestions;
    }

    // 生成无障碍和SEO报告
    generateReport() {
        const accessibilityCheck = this.checkAccessibilityCompliance();
        const seoSuggestions = this.getSEOSuggestions();

        return {
            timestamp: new Date().toISOString(),
            accessibility: {
                score: accessibilityCheck.score,
                compliant: accessibilityCheck.compliant,
                issues: accessibilityCheck.issues,
                rulesApplied: Object.keys(this.accessibilityRules)
            },
            seo: {
                structuredDataApplied: !!document.querySelector('script[type="application/ld+json"]'),
                metaTags: {
                    title: !!document.title,
                    description: !!document.querySelector('meta[name="description"]'),
                    openGraph: !!document.querySelector('meta[property^="og:"]')
                },
                suggestions: seoSuggestions,
                urlOptimized: !window.location.href.includes('#')
            },
            recommendations: [
                ...accessibilityCheck.issues.map(issue => `无障碍: ${issue}`),
                ...seoSuggestions.map(suggestion => `SEO: ${suggestion}`)
            ]
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavigationSEOEnhancer };
}

// 全局初始化
window.NavigationSEOEnhancer = NavigationSEOEnhancer;

console.log('🔍 Navigation SEO and Accessibility Enhancer loaded');