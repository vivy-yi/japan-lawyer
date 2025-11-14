/**
 * SEO Manager - SEO优化管理器
 * 自动优化页面的SEO设置，包括元标签、结构化数据、sitemap等
 */

class SEOManager {
    constructor(config = {}) {
        this.config = {
            siteName: '日本商务通',
            siteDescription: '专业的日本商务服务平台，提供AI法律咨询、CRM系统、知识库等专业服务',
            siteUrl: window.location.origin,
            author: 'Japan Business Hub',
            keywords: ['日本商务', 'AI法律', 'CRM系统', '知识库', '专业服务', '商务咨询','日本留学','日本旅游','劳务派遣','帮帮忙','生活服务','宠物服务'],
            language: 'zh-CN',
            enableStructuredData: true,
            enableAutoMeta: true,
            enableSitemap: true,
            ...config
        };

        this.pageData = this.extractPageData();
        this.init();
    }

    init() {
        console.log('🔍 SEO Manager initialized');
        this.setupAutoSEO();
        this.generateMetaTags();
        this.generateStructuredData();
        this.setupTracking();
        this.optimizeImages();
        this.generateBreadcrumbs();
    }

    /**
     * 自动SEO设置
     */
    setupAutoSEO() {
        if (!this.config.enableAutoMeta) return;

        // 自动设置页面标题
        this.optimizeTitle();

        // 自动设置描述
        this.optimizeDescription();

        // 设置语言和地区
        this.setLanguageAndRegion();

        // 设置Canonical URL
        this.setCanonicalUrl();

        // 设置Open Graph标签
        this.setOpenGraphTags();

        // 设置Twitter Card标签
        this.setTwitterCardTags();
    }

    /**
     * 提取页面数据
     */
    extractPageData() {
        const title = document.title || this.config.siteName;
        const description = this.extractDescription();
        const headings = this.extractHeadings();
        const images = this.extractImages();
        const links = this.extractLinks();

        return {
            title,
            description,
            headings,
            images,
            links,
            url: window.location.href,
            lastModified: document.lastModified || new Date().toISOString()
        };
    }

    /**
     * 提取页面描述
     */
    extractDescription() {
        // 优先级：meta description > 第一个段落 > 页面内容摘要
        let description = '';

        // 检查meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && metaDesc.content) {
            description = metaDesc.content;
        }

        // 检查第一个段落
        if (!description) {
            const firstParagraph = document.querySelector('p');
            if (firstParagraph) {
                description = firstParagraph.textContent.trim().substring(0, 160);
            }
        }

        // 生成页面内容摘要
        if (!description) {
            const content = document.body.textContent.trim();
            description = content.substring(0, 160);
        }

        return description;
    }

    /**
     * 提取关键词
     */
    extractKeywords() {
        const keywords = new Set();

        // 从当前页面标题中提取
        const title = document.title || this.config.siteName;
        this.extractWordsFromText(title).forEach(word => keywords.add(word));

        // 从标题标签中提取
        const headings = this.extractHeadings();
        headings.forEach(heading => {
            this.extractWordsFromText(heading.text).forEach(word => keywords.add(word));
        });

        // 从配置的关键词中添加
        this.config.keywords.forEach(keyword => keywords.add(keyword));

        return Array.from(keywords).slice(0, 10);
    }

    /**
     * 从文本中提取词汇
     */
    extractWordsFromText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length >= 2)
            .slice(0, 20);
    }

    /**
     * 提取标题
     */
    extractHeadings() {
        const headings = [];
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            headings.push({
                level: parseInt(heading.tagName.substring(1)),
                text: heading.textContent.trim(),
                id: heading.id || ''
            });
        });
        return headings;
    }

    /**
     * 提取图片
     */
    extractImages() {
        const images = [];
        document.querySelectorAll('img').forEach(img => {
            images.push({
                src: img.src,
                alt: img.alt || '',
                title: img.title || '',
                width: img.width || 0,
                height: img.height || 0
            });
        });
        return images;
    }

    /**
     * 提取链接
     */
    extractLinks() {
        const links = [];
        document.querySelectorAll('a[href]').forEach(link => {
            if (link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript:')) {
                links.push({
                    href: link.href,
                    text: link.textContent.trim(),
                    title: link.title || ''
                });
            }
        });
        return links;
    }

    /**
     * 优化标题
     */
    optimizeTitle() {
        const currentTitle = this.pageData.title;
        let optimizedTitle = currentTitle;

        // 如果标题不包含网站名称，添加网站名称
        if (!currentTitle.includes(this.config.siteName)) {
            if (currentTitle.length > 50) {
                optimizedTitle = `${currentTitle} | ${this.config.siteName}`;
            } else {
                optimizedTitle = `${currentTitle} - ${this.config.siteName}`;
            }
        }

        // 确保标题长度合适
        if (optimizedTitle.length > 60) {
            optimizedTitle = optimizedTitle.substring(0, 57) + '...';
        }

        document.title = optimizedTitle;
    }

    /**
     * 优化描述
     */
    optimizeDescription() {
        let description = this.pageData.description;

        // 确保描述长度合适
        if (description.length < 50) {
            description = this.config.siteDescription;
        } else if (description.length > 160) {
            description = description.substring(0, 157) + '...';
        }

        this.setMetaTag('description', description);
    }

    /**
     * 设置语言和地区
     */
    setLanguageAndRegion() {
        // 设置html lang属性
        document.documentElement.lang = this.config.language;

        // 设置meta标签
        this.setMetaTag('language', this.config.language);
        this.setMetaTag('geo.region', 'JP');
        this.setMetaTag('geo.placename', 'Japan');
    }

    /**
     * 设置Canonical URL
     */
    setCanonicalUrl() {
        let canonicalUrl = this.pageData.url;

        // 移除不必要的参数
        const url = new URL(canonicalUrl);
        url.search = '';
        canonicalUrl = url.toString();

        // 查找或创建canonical link标签
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = canonicalUrl;
    }

    /**
     * 设置Open Graph标签
     */
    setOpenGraphTags() {
        const ogTags = {
            'og:title': this.pageData.title,
            'og:description': this.pageData.description,
            'og:url': this.pageData.url,
            'og:site_name': this.config.siteName,
            'og:type': 'website',
            'og:locale': this.config.language.replace('-', '_')
        };

        // 如果有图片，设置og:image
        if (this.pageData.images.length > 0) {
            const mainImage = this.pageData.images[0];
            ogTags['og:image'] = mainImage.src;
            ogTags['og:image:alt'] = mainImage.alt || this.pageData.title;
            if (mainImage.width > 0) ogTags['og:image:width'] = mainImage.width;
            if (mainImage.height > 0) ogTags['og:image:height'] = mainImage.height;
        }

        Object.entries(ogTags).forEach(([property, content]) => {
            this.setMetaProperty(property, content);
        });
    }

    /**
     * 设置Twitter Card标签
     */
    setTwitterCardTags() {
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': this.pageData.title,
            'twitter:description': this.pageData.description,
            'twitter:site': '@JapanBusinessHub',
            'twitter:creator': this.config.author
        };

        // 如果有图片，设置twitter:image
        if (this.pageData.images.length > 0) {
            twitterTags['twitter:image'] = this.pageData.images[0].src;
        }

        Object.entries(twitterTags).forEach(([name, content]) => {
            this.setMetaName(name, content);
        });
    }

    /**
     * 生成结构化数据
     */
    generateStructuredData() {
        if (!this.config.enableStructuredData) return;

        // 生成Website结构化数据
        this.generateWebsiteStructuredData();

        // 生成BreadcrumbList结构化数据
        this.generateBreadcrumbStructuredData();

        // 生成Organization结构化数据
        this.generateOrganizationStructuredData();

        // 如果是服务页面，生成Service结构化数据
        if (this.isServicePage()) {
            this.generateServiceStructuredData();
        }
    }

    /**
     * 生成Website结构化数据
     */
    generateWebsiteStructuredData() {
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: this.config.siteName,
            description: this.config.siteDescription,
            url: this.config.siteUrl,
            inLanguage: this.config.language,
            potentialAction: {
                '@type': 'SearchAction',
                target: `${this.config.siteUrl}?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
            }
        };

        this.addStructuredData(structuredData, 'website');
    }

    /**
     * 生成BreadcrumbList结构化数据
     */
    generateBreadcrumbStructuredData() {
        const breadcrumbs = this.generateBreadcrumbs();
        if (breadcrumbs.length <= 1) return;

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.name,
                item: crumb.url
            }))
        };

        this.addStructuredData(structuredData, 'breadcrumbs');
    }

    /**
     * 生成Organization结构化数据
     */
    generateOrganizationStructuredData() {
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: this.config.siteName,
            description: this.config.siteDescription,
            url: this.config.siteUrl,
            logo: `${this.config.siteUrl}/logo.png`,
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Chinese', 'English', 'Japanese']
            },
            sameAs: [
                // 这里可以添加社交媒体链接
            ]
        };

        this.addStructuredData(structuredData, 'organization');
    }

    /**
     * 生成Service结构化数据
     */
    generateServiceStructuredData() {
        const services = this.extractServices();
        services.forEach((service, index) => {
            const structuredData = {
                '@context': 'https://schema.org',
                '@type': 'Service',
                name: service.name,
                description: service.description,
                provider: {
                    '@type': 'Organization',
                    name: this.config.siteName
                },
                areaServed: {
                    '@type': 'Country',
                    name: 'Japan'
                }
            };

            this.addStructuredData(structuredData, `service-${index}`);
        });
    }

    /**
     * 添加结构化数据到页面
     */
    addStructuredData(data, id) {
        // 移除现有的相同ID的结构化数据
        const existingScript = document.querySelector(`script[data-structured-data="${id}"]`);
        if (existingScript) {
            existingScript.remove();
        }

        // 创建新的结构化数据脚本
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-structured-data', id);
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }

    /**
     * 生成面包屑导航
     */
    generateBreadcrumbs() {
        const breadcrumbs = [];
        const pathSegments = window.location.pathname.split('/').filter(segment => segment);

        // 首页
        breadcrumbs.push({
            name: '首页',
            url: this.config.siteUrl
        });

        // 路径段
        let currentPath = this.config.siteUrl;
        pathSegments.forEach(segment => {
            currentPath += '/' + segment;
            const name = this.formatBreadcrumbName(segment);
            breadcrumbs.push({
                name,
                url: currentPath
            });
        });

        return breadcrumbs;
    }

    /**
     * 格式化面包屑名称
     */
    formatBreadcrumbName(segment) {
        const nameMap = {
            'aicrm': 'AI CRM系统',
            'ailegal': 'AI法律咨询',
            'knowledge': '知识库',
            'professionals': '专业人才',
            'lifestyle': '生活帮忙',
            'community': '社群网络',
            'education': '留学教育',
            'tourism': '旅游服务',
            'pet': '宠物服务',
            'labor': '劳务派遣'
        };

        return nameMap[segment] || segment;
    }

    /**
     * 提取服务信息
     */
    extractServices() {
        const services = [];
        document.querySelectorAll('[data-service], .service-item, .service-card').forEach(element => {
            const name = element.querySelector('h1, h2, h3, .service-title, .title');
            const description = element.querySelector('p, .service-description, .description');

            if (name && name.textContent.trim()) {
                services.push({
                    name: name.textContent.trim(),
                    description: description ? description.textContent.trim() : ''
                });
            }
        });
        return services;
    }

    /**
     * 判断是否为服务页面
     */
    isServicePage() {
        return this.extractServices().length > 0 ||
               window.location.pathname.includes('service') ||
               window.location.pathname.includes('ai-');
    }

    /**
     * 设置追踪代码
     */
    setupTracking() {
        // 设置Google Analytics（如果需要）
        // this.setupGoogleAnalytics();

        // 设置页面性能监控
        this.setupPerformanceTracking();

        // 设置用户行为追踪
        this.setupUserBehaviorTracking();
    }

    /**
     * 设置性能追踪
     */
    setupPerformanceTracking() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const metrics = {
                        loadTime: perfData.loadEventEnd - perfData.navigationStart,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
                        firstPaint: this.getFirstPaint(),
                        firstContentfulPaint: this.getFirstContentfulPaint()
                    };

                    console.log('📊 Page Performance Metrics:', metrics);
                    this.trackPerformance(metrics);
                }, 0);
            });
        }
    }

    /**
     * 获取First Paint时间
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }

    /**
     * 获取First Contentful Paint时间
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }

    /**
     * 设置用户行为追踪
     */
    setupUserBehaviorTracking() {
        // 追踪外链点击
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.href && link.hostname !== window.location.hostname) {
                this.trackOutboundLink(link.href);
            }
        });

        // 追踪搜索查询
        if (window.searchManager) {
            this.trackSearchQueries();
        }

        // 追踪页面滚动
        this.trackScrollDepth();
    }

    /**
     * 追踪外链点击
     */
    trackOutboundLink(url) {
        console.log('🔗 Outbound link clicked:', url);
        // 这里可以发送到分析服务
    }

    /**
     * 追踪搜索查询
     */
    trackSearchQueries() {
        // 这里需要与搜索管理器集成
        console.log('🔍 Search tracking enabled');
    }

    /**
     * 追踪滚动深度
     */
    trackScrollDepth() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 90, 100];

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                thresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !this[`scrolled${threshold}`]) {
                        this[`scrolled${threshold}`] = true;
                        console.log(`📜 Scrolled to ${threshold}%`);
                    }
                });
            }
        });
    }

    /**
     * 优化图片
     */
    optimizeImages() {
        document.querySelectorAll('img').forEach(img => {
            // 添加alt属性
            if (!img.alt) {
                img.alt = this.generateImageAlt(img);
            }

            // 添加loading="lazy"
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }

            // 添加width和height属性
            if (!img.width && img.naturalWidth) {
                img.width = img.naturalWidth;
                img.height = img.naturalHeight;
            }
        });
    }

    /**
     * 生成图片alt文本
     */
    generateImageAlt(img) {
        // 从src中提取文件名
        const filename = img.src.split('/').pop().split('.')[0];
        return filename.replace(/[-_]/g, ' ');
    }

    /**
     * 设置meta标签
     */
    setMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    /**
     * 设置meta property标签（用于Open Graph）
     */
    setMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.property = property;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    /**
     * 设置meta name标签
     */
    setMetaName(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    /**
     * 追踪性能指标
     */
    trackPerformance(metrics) {
        // 这里可以发送性能数据到分析服务
        console.log('📈 Performance metrics tracked:', metrics);
    }

    /**
     * 生成Sitemap
     */
    generateSitemap() {
        if (!this.config.enableSitemap) return;

        // 这里可以实现客户端sitemap生成
        console.log('🗺️ Sitemap generation enabled');
    }

    /**
     * 获取SEO报告
     */
    getSEOReport() {
        const report = {
            title: {
                current: document.title,
                length: document.title.length,
                optimized: document.title.length >= 30 && document.title.length <= 60
            },
            description: {
                current: this.pageData.description,
                length: this.pageData.description.length,
                optimized: this.pageData.description.length >= 50 && this.pageData.description.length <= 160
            },
            headings: {
                h1: document.querySelectorAll('h1').length,
                h2: document.querySelectorAll('h2').length,
                total: this.pageData.headings.length
            },
            images: {
                total: this.pageData.images.length,
                withAlt: this.pageData.images.filter(img => img.alt).length,
                optimized: this.pageData.images.filter(img => img.alt && img.loading === 'lazy').length
            },
            links: {
                total: this.pageData.links.length,
                internal: this.pageData.links.filter(link => link.href.includes(window.location.hostname)).length,
                external: this.pageData.links.filter(link => !link.href.includes(window.location.hostname)).length
            },
            structuredData: {
                generated: document.querySelectorAll('script[type="application/ld+json"]').length
            }
        };

        return report;
    }

    /**
     * 生成Meta标签
     */
    generateMetaTags() {
        if (!this.config.enableAutoMeta) return;

        // 更新页面标题
        if (this.pageData.title) {
            document.title = this.pageData.title;
        }

        // 更新或创建描述meta标签
        this.setMetaTag('description', this.pageData.description);

        // 更新关键词meta标签
        const keywords = this.extractKeywords();
        this.setMetaTag('keywords', keywords.join(', '));

        // 更新作者meta标签
        this.setMetaTag('author', this.config.author);

        // 更新viewport meta标签
        this.setMetaTag('viewport', 'width=device-width, initial-scale=1.0');

        // 更新robots meta标签
        this.setMetaTag('robots', 'index, follow');

        // 更新canonical URL
        this.setCanonicalUrl();

        console.log('🏷️ Meta tags generated');
    }

    /**
     * 设置Meta标签的辅助方法
     */
    setMetaTag(name, content) {
        if (!content) return;

        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    /**
     * 重新运行SEO优化
     */
    reoptimize() {
        this.pageData = this.extractPageData();
        this.setupAutoSEO();
        this.generateStructuredData();
        this.optimizeImages();
        console.log('🔄 SEO re-optimization complete');
    }
}

// 自动初始化SEO管理器
let seoManager;

setTimeout(() => {
    seoManager = new SEOManager();
    window.seoManager = seoManager;
    console.log('✅ SEO Manager ready');
}, 100);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOManager;
}