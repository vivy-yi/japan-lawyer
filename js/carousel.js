// carousel.js - 轮播图系统
// 功能：自动滚动、手动控制、动态内容加载、多语言支持

class Carousel {
    constructor(containerSelector, options = {}) {
        // 默认配置
        this.config = {
            autoScrollInterval: 5000, // 5秒自动切换
            enableAutoScroll: true,
            enableHoverPause: true,
            animationDuration: 300,
            loadDelay: 800, // 模拟网络延迟
            ...options
        };

        // 状态管理
        this.currentSlide = 0;
        this.carouselData = [];
        this.autoScrollTimer = null;
        this.isAutoScrolling = true;
        this.isLoading = false;
        this.hasError = false;
        this.isTransitioning = false; // 新增：防止动画冲突

        // DOM 元素
        this.container = document.querySelector(containerSelector);
        this.slides = [];
        this.dots = [];
        this.controls = null;
        this.arrows = null;

        window.logInfo(`🎠 Carousel constructor: looking for ${containerSelector}`);
        window.logInfo(`🎠 Container found: ${this.container ? '✅ YES' : '❌ NO'}`);

        if (this.container) {
            window.logInfo(`🎠 Container element:`, this.container);
            window.logInfo(`🎠 Container classes:`, this.container.className);
        } else {
            window.logError(`❌ Carousel container not found: ${containerSelector}`);
            window.logInfo(`🔍 Available elements with carousel class:`);
            document.querySelectorAll('[class*="carousel"]').forEach((el, i) => {
                window.logInfo(`   ${i + 1}. ${el.tagName}.${el.className} - ${el.children.length} children`);
            });
        }

        // 初始化
        if (this.container) {
            this.init();
        } else {
            window.logError(`❌ Cannot initialize carousel - container not found`);
        }
    }

    // 初始化轮播图
    async init() {
        window.logInfo('初始化轮播图系统...');

        try {
            // 等待DOM准备就绪
            await this.waitForDOMReady();

            // 获取轮播图数据
            await this.fetchCarouselData();

            // 渲染轮播图内容
            await this.renderCarouselContent();

            // 设置事件监听器
            this.setupEventListeners();

            // 开始自动滚动
            if (this.config.enableAutoScroll) {
                this.startAutoScroll();
            }

            window.logInfo('轮播图初始化完成');

        } catch (error) {
            window.logError('轮播图初始化失败:', error);
            this.showError();
        }
    }

    // 等待DOM准备就绪
    waitForDOMReady() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    // 模拟网络请求获取轮播图数据
    async fetchCarouselData() {
        try {
            window.logInfo('开始加载轮播图数据...');

            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, this.config.loadDelay));

            // 模拟从API获取数据
            const mockData = [
                {
                    id: 1,
                    titleKey: 'slide1-title',
                    subtitleKey: 'slide1-subtitle',
                    ctaKey: 'slide1-cta',
                    demoKey: 'slide1-demo',
                    backgroundImage: 'linear-gradient(135deg, rgba(30, 58, 95, 0.9), rgba(44, 82, 130, 0.9))',
                    active: true
                },
                {
                    id: 2,
                    titleKey: 'slide2-title',
                    subtitleKey: 'slide2-subtitle',
                    ctaKey: 'slide2-cta',
                    teamKey: 'slide2-team',
                    backgroundImage: 'linear-gradient(135deg, rgba(56, 161, 105, 0.9), rgba(72, 187, 120, 0.9))',
                    active: false
                },
                {
                    id: 3,
                    titleKey: 'slide3-title',
                    subtitleKey: 'slide3-subtitle',
                    ctaKey: 'slide3-cta',
                    featuresKey: 'slide3-features',
                    backgroundImage: 'linear-gradient(135deg, rgba(214, 158, 46, 0.9), rgba(245, 189, 85, 0.9))',
                    active: false
                }
            ];

            this.carouselData = mockData;
            window.logInfo('轮播图数据加载成功:', this.carouselData);

            return this.carouselData;

        } catch (error) {
            window.logError('轮播图数据加载失败:', error);
            // 返回默认数据
            return this.getDefaultCarouselData();
        }
    }

    // 获取默认轮播图数据
    getDefaultCarouselData() {
        return [
            {
                id: 1,
                titleKey: 'slide1-title',
                subtitleKey: 'slide1-subtitle',
                ctaKey: 'slide1-cta',
                backgroundImage: 'linear-gradient(135deg, rgba(30, 58, 95, 0.9), rgba(44, 82, 130, 0.9))'
            },
            {
                id: 2,
                titleKey: 'slide2-title',
                subtitleKey: 'slide2-subtitle',
                ctaKey: 'slide2-cta',
                backgroundImage: 'linear-gradient(135deg, rgba(56, 161, 105, 0.9), rgba(72, 187, 120, 0.9))'
            },
            {
                id: 3,
                titleKey: 'slide3-title',
                subtitleKey: 'slide3-subtitle',
                ctaKey: 'slide3-cta',
                backgroundImage: 'linear-gradient(135deg, rgba(214, 158, 46, 0.9), rgba(245, 189, 85, 0.9))'
            }
        ];
    }

    // 动态渲染轮播图内容 - 彻底重写，避免CSS冲突
    async renderCarouselContent() {
        if (!this.container) return;

        try {
            // 获取现有的轮播图控制元素
            this.controls = this.container.querySelector('.carousel-controls');
            this.arrows = this.container.querySelector('.carousel-arrows');

            // 使用现有的静态轮播图内容，不创建新内容
            this.slides = this.container.querySelectorAll('.carousel-slide');
            this.dots = this.container.querySelectorAll('.carousel-dot');

            window.logInfo(`找到 ${this.slides.length} 个轮播图 slide 和 ${this.dots.length} 个控制点`);

            // 清理所有slide的内联样式，让CSS完全控制
            this.slides.forEach((slide, index) => {
                // 清除所有内联样式
                slide.style.removeProperty('opacity');
                slide.style.removeProperty('visibility');
                slide.style.removeProperty('z-index');
                slide.style.removeProperty('transform');

                const slideContent = slide.querySelector('.slide-content');
                if (slideContent) {
                    // 清除slide-content的内联样式
                    slideContent.style.removeProperty('opacity');
                    slideContent.style.removeProperty('visibility');
                    slideContent.style.removeProperty('transform');

                    // 清除动画类
                    slideContent.classList.remove('animate-in-left', 'animate-in-right', 'animate-out-left', 'animate-out-right');
                }
            });

            // 重置所有slide类状态
            this.slides.forEach((slide) => {
                slide.classList.remove('active');
            });

            // 设置第一个slide为active
            if (this.slides.length > 0) {
                this.slides[0].classList.add('active');
            }

            // 重置所有控制点状态
            this.dots.forEach((dot) => {
                dot.classList.remove('active');
            });

            // 设置第一个控制点为active
            if (this.dots.length > 0) {
                this.dots[0].classList.add('active');
            }

            window.logInfo(`轮播图初始化完成：${this.slides.length} 个slides，当前显示第 ${this.currentSlide + 1} 个`);

        // 确保第一个slide是active的
        if (this.slides.length > 0 && !this.slides[0].classList.contains('active')) {
            this.slides[0].classList.add('active');
            window.logInfo('强制设置第一个slide为active');
        }

        // 确保第一个控制点是active的
        if (this.dots.length > 0 && !this.dots[0].classList.contains('active')) {
            this.dots[0].classList.add('active');
            window.logInfo('强制设置第一个控制点为active');
        }

        } catch (error) {
            window.logError('轮播图初始化失败:', error);
            this.showError();
        }
    }

    // 创建轮播图元素
    createSlideElement(data, index) {
        const slide = document.createElement('div');
        slide.className = `carousel-slide slide-${index + 1}`;
        if (index === 0) slide.classList.add('active');

        // 设置背景
        slide.style.background = data.backgroundImage;

        // 创建内容 - Safe DOM manipulation instead of innerHTML
        const content = document.createElement('div');
        content.className = 'carousel-content';

        // 创建标题
        const title = document.createElement('h1');
        title.setAttribute('data-lang', data.titleKey);
        title.textContent = this.getTranslationWithFallback(data.titleKey);

        // 创建副标题
        const subtitle = document.createElement('p');
        subtitle.setAttribute('data-lang', data.subtitleKey);
        subtitle.textContent = this.getTranslationWithFallback(data.subtitleKey);

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'carousel-buttons';

        // 安全地添加按钮
        const buttons = [
            { key: data.ctaKey, class: 'primary' },
            { key: data.demoKey, class: 'secondary' },
            { key: data.teamKey, class: 'secondary' },
            { key: data.featuresKey, class: 'secondary' }
        ];

        buttons.forEach(buttonConfig => {
            if (buttonConfig.key) {
                const button = document.createElement('button');
                button.className = `cta-button ${buttonConfig.class}`;
                button.setAttribute('data-lang', buttonConfig.key);
                button.textContent = this.getTranslationWithFallback(buttonConfig.key);
                buttonContainer.appendChild(button);
            }
        });

        // 组装内容
        content.appendChild(title);
        content.appendChild(subtitle);
        content.appendChild(buttonContainer);
        slide.appendChild(content);

        return slide;
    }

    // 获取翻译文本（带回退）
    getTranslationWithFallback(key) {
        // 尝试从全局翻译系统获取
        if (window.t && typeof window.t === 'function') {
            const translation = window.t(key);
            if (translation) return translation;
        }

        // 回退到默认翻译
        const fallbackTranslations = {
            'slide1-title': '专业法律服务',
            'slide1-subtitle': '为您提供最专业的法律咨询和支持',
            'slide1-cta': '立即咨询',
            'slide1-demo': '预约演示',
            'slide2-title': '智能CRM系统',
            'slide2-subtitle': '高效管理客户关系，提升业务效率',
            'slide2-cta': '免费试用',
            'slide2-team': '联系我们',
            'slide3-title': '一站式服务',
            'slide3-subtitle': '全面解决方案，助力企业成功',
            'slide3-cta': '了解更多',
            'slide3-features': '查看功能'
        };

        return fallbackTranslations[key] || key;
    }

    // 更新轮播图控制点
    updateCarouselDots() {
        if (!this.controls) return;

        // 清空现有控制点 - Safe DOM manipulation
        while (this.controls.firstChild) {
            this.controls.removeChild(this.controls.firstChild);
        }

        // 创建新的控制点
        this.carouselData.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('data-slide', index);
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            this.controls.appendChild(dot);
        });
    }

    // 显示加载状态
    showLoading() {
        this.isLoading = true;
        this.hasError = false;

        // Create loading content safely
        const createLoadingContent = () => {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'carousel-loading';

            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';

            const message = document.createElement('p');
            message.textContent = '正在加载轮播图内容...';

            loadingDiv.appendChild(spinner);
            loadingDiv.appendChild(message);
            return loadingDiv;
        };

        const existingContent = this.container.querySelector('.carousel-content');
        if (existingContent) {
            // Clear existing content safely
            while (existingContent.firstChild) {
                existingContent.removeChild(existingContent.firstChild);
            }
            existingContent.appendChild(createLoadingContent());
        } else {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide active';
            const content = document.createElement('div');
            content.className = 'carousel-content';
            content.appendChild(createLoadingContent());
            slide.appendChild(content);
            this.container.appendChild(slide);
        }
    }

    // 显示错误状态
    showError() {
        this.hasError = true;
        this.isLoading = false;

        // Create error content safely
        const errorDiv = document.createElement('div');
        errorDiv.className = 'carousel-error';

        const errorTitle = document.createElement('h3');
        errorTitle.textContent = '内容加载失败';

        const errorMessage = document.createElement('p');
        errorMessage.textContent = '轮播图内容暂时无法加载，请稍后重试。';

        const reloadButton = document.createElement('button');
        reloadButton.textContent = '重新加载';
        reloadButton.addEventListener('click', () => location.reload());

        errorDiv.appendChild(errorTitle);
        errorDiv.appendChild(errorMessage);
        errorDiv.appendChild(reloadButton);

        const existingContent = this.container.querySelector('.carousel-content');
        if (existingContent) {
            // Clear existing content safely
            while (existingContent.firstChild) {
                existingContent.removeChild(existingContent.firstChild);
            }
            existingContent.appendChild(errorDiv);
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        if (!this.container) return;

        // 使用事件委托处理控制点点击
        this.container.addEventListener('click', (e) => {
            // 处理控制点点击
            if (e.target.classList.contains('carousel-dot')) {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.showSlide(slideIndex);
            }
            // 处理箭头点击
            else if (e.target.classList.contains('carousel-arrow')) {
                const direction = parseInt(e.target.dataset.direction);
                this.changeSlide(direction);
            }
        });

        // 鼠标悬停暂停自动滚动
        if (this.config.enableHoverPause) {
            this.container.addEventListener('mouseenter', () => {
                this.isAutoScrolling = false;
            });

            this.container.addEventListener('mouseleave', () => {
                this.isAutoScrolling = true;
            });
        }

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.changeSlide(-1);
            } else if (e.key === 'ArrowRight') {
                this.changeSlide(1);
            }
        });
    }

    // 显示指定幻灯片 - 简化版本，依赖CSS控制
    showSlide(index) {
        if (!this.slides.length || this.isTransitioning) return;

        // 防止重复操作
        if (index === this.currentSlide) return;

        // 设置过渡状态，防止重复点击
        this.isTransitioning = true;

        // 边界检查
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;

        // 获取当前和新幻灯片元素
        const currentSlideElement = this.slides[this.currentSlide];
        const newSlideElement = this.slides[index];

        // 更新控制点状态
        if (this.dots[this.currentSlide]) {
            this.dots[this.currentSlide].classList.remove('active');
        }
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }

        // 切换slide的active类，让CSS控制显示/隐藏
        currentSlideElement.classList.remove('active');
        newSlideElement.classList.add('active');

        // 更新当前幻灯片索引
        this.currentSlide = index;

        // 重置自动滚动
        this.resetAutoScroll();

        // 解除过渡状态（短暂延迟确保动画完成）
        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);
    }

    // 切换到下一张/上一张幻灯片
    changeSlide(direction) {
        const newIndex = this.currentSlide + direction;
        this.showSlide(newIndex);
    }

    // 开始自动滚动
    startAutoScroll() {
        if (this.autoScrollTimer) {
            clearInterval(this.autoScrollTimer);
        }

        this.autoScrollTimer = setInterval(() => {
            if (this.isAutoScrolling && !this.isLoading && !this.hasError) {
                this.changeSlide(1);
            }
        }, this.config.autoScrollInterval);

        // window.logInfo('轮播图自动滚动已启动'); // 减少控制台日志
    }

    // 停止自动滚动
    stopAutoScroll() {
        if (this.autoScrollTimer) {
            clearInterval(this.autoScrollTimer);
            this.autoScrollTimer = null;
            // window.logInfo('轮播图自动滚动已停止'); // 减少控制台日志
        }
    }

    // 重置自动滚动
    resetAutoScroll() {
        if (this.config.enableAutoScroll) {
            this.stopAutoScroll();
            this.startAutoScroll();
        }
    }

    // 下一张幻灯片
    next() {
        this.changeSlide(1);
    }

    // 上一张幻灯片
    prev() {
        this.changeSlide(-1);
    }

    // 跳转到指定幻灯片
    goTo(index) {
        this.showSlide(index);
    }

    // 销毁轮播图
    destroy() {
        this.stopAutoScroll();

        // 移除事件监听器
        if (this.container) {
            this.container.removeEventListener('click', this.handleCarouselClick);
            this.container.removeEventListener('mouseenter', this.handleMouseEnter);
            this.container.removeEventListener('mouseleave', this.handleMouseLeave);
        }

        // 清理引用
        this.container = null;
        this.slides = [];
        this.dots = [];
        this.controls = null;
        this.arrows = null;
        this.carouselData = [];

        window.logInfo('轮播图已销毁');
    }

    // 获取当前状态
    getState() {
        return {
            currentSlide: this.currentSlide,
            totalSlides: this.slides.length,
            isAutoScrolling: this.isAutoScrolling,
            isLoading: this.isLoading,
            hasError: this.hasError
        };
    }
}

// 全局轮播图实例
let carouselInstance = null;

// 初始化轮播图的便捷函数
function initCarousel(containerSelector = '.carousel-container', options = {}) {
    window.logInfo(`🎠 initCarousel called with selector: ${containerSelector}`);

    // 销毁现有实例
    if (window.carouselInstance) {
        window.logInfo('🎠 Destroying existing carousel instance...');
        window.carouselInstance.destroy();
        window.carouselInstance = null;
    }

    // 创建新实例
    window.logInfo('🎠 Creating new carousel instance...');
    const newInstance = new Carousel(containerSelector, options);

    // 更新全局实例
    window.carouselInstance = newInstance;

    window.logInfo(`🎠 Carousel instance created: ${newInstance ? '✅ SUCCESS' : '❌ FAILED'}`);
    window.logInfo(`🎠 Global instance reference: ${window.carouselInstance ? '✅ SET' : '❌ NOT SET'}`);

    return newInstance;
}

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.logInfo('DOMContentLoaded event fired, initializing carousel...');
    setTimeout(initCarousel, 200); // 增加延迟确保DOM完全准备好
});

// 备用初始化 - 如果DOMContentLoaded已经触发
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    window.logInfo('Document already ready, initializing carousel immediately...');
    setTimeout(initCarousel, 300); // 增加延迟
}

// 紧急备用初始化 - 确保轮播图能够初始化
window.addEventListener('load', () => {
    window.logInfo('Window load event fired, checking carousel...');
    setTimeout(() => {
        if (!window.carouselInstance || !window.carouselInstance.container) {
            window.logInfo('Emergency carousel initialization...');
            initCarousel();
        }
    }, 500);
});

// 导出到全局作用域（兼容性）
window.Carousel = Carousel;
window.initCarousel = initCarousel;