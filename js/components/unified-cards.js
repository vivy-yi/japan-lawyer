/**
 * 统一卡片组件管理系统
 * Created: 2025-11-14
 * Purpose: 统一管理所有卡片组件的交互、动画和状态
 */

class UnifiedCardsManager {
    constructor() {
        this.cards = new Map();
        this.grids = new Map();
        this.observers = new Map();
        this.initialized = false;

        // 配置选项
        this.config = {
            enableAnimations: true,
            enableIntersectionObserver: true,
            enableKeyboardNavigation: true,
            animationDelay: 100, // 卡片依次出现的延迟时间
            observerThreshold: 0.1 // 触发动画的阈值
        };

        // 绑定全局方法
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.handleCardClick = this.handleCardClick.bind(this);
        this.handleKeyboardNavigation = this.handleKeyboardNavigation.bind(this);
    }

    /**
     * 初始化统一卡片系统
     */
    init() {
        if (this.initialized) {
            console.warn('UnifiedCardsManager already initialized');
            return;
        }

        try {
            this.scanCards();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.setupKeyboardNavigation();

            this.initialized = true;
            console.log(`UnifiedCardsManager initialized with ${this.cards.size} cards`);
        } catch (error) {
            console.error('Failed to initialize UnifiedCardsManager:', error);
        }
    }

    /**
     * 扫描页面中的所有卡片
     */
    scanCards() {
        // 扫描统一卡片
        const unifiedCards = document.querySelectorAll('.unified-card');
        this.registerCards(unifiedCards, 'unified');

        // 扫描传统卡片（向后兼容）
        const featureCards = document.querySelectorAll('.feature-card');
        const crmCards = document.querySelectorAll('.crm-card');
        const crmFeatureCards = document.querySelectorAll('.crm-feature-card');

        this.registerCards(featureCards, 'feature');
        this.registerCards(crmCards, 'crm');
        this.registerCards(crmFeatureCards, 'crm-feature');

        // 扫描网格容器
        const grids = document.querySelectorAll('.unified-grid, .features-grid');
        this.registerGrids(grids);
    }

    /**
     * 注册卡片到管理系统
     */
    registerCards(cardElements, type) {
        cardElements.forEach((card, index) => {
            const id = this.generateCardId(card, type, index);

            this.cards.set(id, {
                element: card,
                type: type,
                index: index,
                isVisible: false,
                isAnimated: false,
                metadata: this.extractCardMetadata(card)
            });

            // 添加数据属性
            card.setAttribute('data-card-id', id);
            card.setAttribute('data-card-type', type);
            card.setAttribute('data-card-index', index);

            // 初始化卡片状态
            this.initializeCard(card, type);
        });
    }

    /**
     * 注册网格容器
     */
    registerGrids(gridElements) {
        gridElements.forEach((grid, index) => {
            const id = `grid-${index}`;

            this.grids.set(id, {
                element: grid,
                type: grid.classList.contains('unified-grid') ? 'unified' : 'legacy',
                cardCount: grid.children.length
            });

            grid.setAttribute('data-grid-id', id);
        });
    }

    /**
     * 生成卡片ID
     */
    generateCardId(card, type, index) {
        const existingId = card.getAttribute('id');
        if (existingId) {
            return existingId;
        }
        return `${type}-card-${Date.now()}-${index}`;
    }

    /**
     * 提取卡片元数据
     */
    extractCardMetadata(card) {
        const metadata = {
            title: '',
            description: '',
            icon: '',
            link: null,
            status: null
        };

        // 提取标题
        const titleElement = card.querySelector('.unified-card__title, .feature-title, h3, h4');
        if (titleElement) {
            metadata.title = titleElement.textContent.trim();
        }

        // 提取描述
        const descElement = card.querySelector('.unified-card__description, .feature-description, p');
        if (descElement) {
            metadata.description = descElement.textContent.trim();
        }

        // 提取图标
        const iconElement = card.querySelector('.unified-card__icon, .feature-icon');
        if (iconElement) {
            metadata.icon = iconElement.textContent.trim();
        }

        // 提取链接
        const linkElement = card.querySelector('.unified-card__link, a');
        if (linkElement) {
            metadata.link = linkElement.getAttribute('href');
        }

        // 提取状态
        const statusElement = card.querySelector('.unified-card__status, .feature-status');
        if (statusElement) {
            metadata.status = statusElement.textContent.trim();
        }

        return metadata;
    }

    /**
     * 初始化单个卡片
     */
    initializeCard(card, type) {
        // 设置可访问性属性
        if (!card.getAttribute('role')) {
            card.setAttribute('role', 'article');
        }

        if (!card.getAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }

        // 添加键盘导航支持
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleCardActivation(card);
            }
        });

        // 添加点击处理
        card.addEventListener('click', (e) => {
            this.handleCardClick(card, e);
        });

        // 添加触摸设备支持
        if ('ontouchstart' in window) {
            card.addEventListener('touchstart', () => {
                card.classList.add('touch-active');
            });

            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.classList.remove('touch-active');
                }, 300);
            });
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 全局点击事件处理
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.unified-card, .feature-card, .crm-card, .crm-feature-card');
            if (card) {
                this.handleCardClick(card, e);
            }
        });

        // 窗口大小变化时重新计算布局
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.recalculateLayout();
            }, 250);
        });

        // 主题变化时更新卡片样式
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')) {
                    this.updateCardTheme();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });
    }

    /**
     * 设置交叉观察器（用于动画触发）
     */
    setupIntersectionObserver() {
        if (!this.config.enableIntersectionObserver || !window.IntersectionObserver) {
            // 如果不支持IntersectionObserver，直接显示所有卡片
            this.showAllCards();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateCard(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.config.observerThreshold,
            rootMargin: '50px'
        });

        // 观察所有卡片
        this.cards.forEach((cardData) => {
            if (!cardData.isAnimated) {
                observer.observe(cardData.element);
            }
        });

        this.observers.set('main', observer);
    }

    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        if (!this.config.enableKeyboardNavigation) return;

        document.addEventListener('keydown', this.handleKeyboardNavigation);
    }

    /**
     * 处理键盘导航
     */
    handleKeyboardNavigation(e) {
        // Alt + C: 聚焦到第一个卡片
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            const firstCard = document.querySelector('.unified-card, .feature-card, .crm-card, .crm-feature-card');
            if (firstCard) {
                firstCard.focus();
            }
            return;
        }

        // 在卡片之间导航
        const focusedCard = document.activeElement;
        if (focusedCard && this.isCard(focusedCard)) {
            let targetCard = null;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    targetCard = this.getNextCard(focusedCard);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    targetCard = this.getPreviousCard(focusedCard);
                    break;
                case 'Home':
                    e.preventDefault();
                    targetCard = this.getFirstCard();
                    break;
                case 'End':
                    e.preventDefault();
                    targetCard = this.getLastCard();
                    break;
            }

            if (targetCard) {
                targetCard.focus();
            }
        }
    }

    /**
     * 处理卡片点击
     */
    handleCardClick(card, event) {
        // 检查是否有可点击的链接
        const link = card.querySelector('a[href]');
        if (link && event.target !== link) {
            event.preventDefault();
            link.click();
            return;
        }

        // 触发自定义事件
        const customEvent = new CustomEvent('cardClick', {
            detail: {
                card: card,
                cardData: this.getCardData(card),
                originalEvent: event
            },
            bubbles: true
        });

        card.dispatchEvent(customEvent);
    }

    /**
     * 处理卡片激活
     */
    handleCardActivation(card) {
        const link = card.querySelector('a[href]');
        if (link) {
            link.click();
        } else {
            this.handleCardClick(card, new Event('keyboard'));
        }
    }

    /**
     * 动画显示卡片
     */
    animateCard(card) {
        if (!this.config.enableAnimations) return;

        const cardData = this.getCardData(card);
        if (!cardData || cardData.isAnimated) return;

        // 添加动画类
        card.classList.add('card-animated');

        // 设置延迟动画
        const delay = cardData.index * this.config.animationDelay;
        card.style.animationDelay = `${delay}ms`;

        // 标记为已动画
        cardData.isAnimated = true;
        cardData.isVisible = true;

        // 动画完成后清理
        setTimeout(() => {
            card.style.animationDelay = '';
            card.classList.remove('card-animated');
        }, delay + 600);
    }

    /**
     * 显示所有卡片
     */
    showAllCards() {
        this.cards.forEach((cardData) => {
            if (!cardData.isVisible) {
                this.animateCard(cardData.element);
            }
        });
    }

    /**
     * 重新计算布局
     */
    recalculateLayout() {
        this.grids.forEach((gridData) => {
            const grid = gridData.element;
            const cards = grid.querySelectorAll('.unified-card, .feature-card, .crm-card, .crm-feature-card');

            // 重新计算卡片索引
            cards.forEach((card, index) => {
                card.setAttribute('data-card-index', index);

                const cardData = this.getCardData(card);
                if (cardData) {
                    cardData.index = index;
                }
            });
        });
    }

    /**
     * 更新卡片主题
     */
    updateCardTheme() {
        this.cards.forEach((cardData) => {
            const card = cardData.element;

            // 触发主题更新事件
            const event = new CustomEvent('themeUpdate', {
                detail: { card: card }
            });
            card.dispatchEvent(event);
        });
    }

    /**
     * 工具方法：检查元素是否为卡片
     */
    isCard(element) {
        return element.matches('.unified-card, .feature-card, .crm-card, .crm-feature-card');
    }

    /**
     * 工具方法：获取卡片数据
     */
    getCardData(card) {
        const id = card.getAttribute('data-card-id');
        return id ? this.cards.get(id) : null;
    }

    /**
     * 工具方法：获取下一个卡片
     */
    getNextCard(currentCard) {
        const allCards = Array.from(document.querySelectorAll('.unified-card, .feature-card, .crm-card, .crm-feature-card'));
        const currentIndex = allCards.indexOf(currentCard);
        return allCards[currentIndex + 1] || allCards[0];
    }

    /**
     * 工具方法：获取上一个卡片
     */
    getPreviousCard(currentCard) {
        const allCards = Array.from(document.querySelectorAll('.unified-card, .feature-card, .crm-card, .crm-feature-card'));
        const currentIndex = allCards.indexOf(currentCard);
        return allCards[currentIndex - 1] || allCards[allCards.length - 1];
    }

    /**
     * 工具方法：获取第一个卡片
     */
    getFirstCard() {
        return document.querySelector('.unified-card, .feature-card, .crm-card, .crm-feature-card');
    }

    /**
     * 工具方法：获取最后一个卡片
     */
    getLastCard() {
        const allCards = document.querySelectorAll('.unified-card, .feature-card, .crm-card, .crm-feature-card');
        return allCards[allCards.length - 1];
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const stats = {
            totalCards: this.cards.size,
            totalGrids: this.grids.size,
            cardsByType: {},
            animatedCards: 0,
            visibleCards: 0
        };

        this.cards.forEach((cardData) => {
            // 按类型统计
            if (!stats.cardsByType[cardData.type]) {
                stats.cardsByType[cardData.type] = 0;
            }
            stats.cardsByType[cardData.type]++;

            // 统计动画和可见状态
            if (cardData.isAnimated) stats.animatedCards++;
            if (cardData.isVisible) stats.visibleCards++;
        });

        return stats;
    }

    /**
     * 销毁管理器
     */
    destroy() {
        if (!this.initialized) return;

        // 清理观察器
        this.observers.forEach((observer) => {
            observer.disconnect();
        });
        this.observers.clear();

        // 清理事件监听器
        document.removeEventListener('keydown', this.handleKeyboardNavigation);

        // 清理数据
        this.cards.clear();
        this.grids.clear();

        this.initialized = false;
        console.log('UnifiedCardsManager destroyed');
    }
}

// 全局实例
let unifiedCardsManager = null;

// 初始化函数
function initUnifiedCards(config = {}) {
    if (unifiedCardsManager) {
        unifiedCardsManager.destroy();
    }

    unifiedCardsManager = new UnifiedCardsManager();

    // 应用配置
    if (config) {
        Object.assign(unifiedCardsManager.config, config);
    }

    unifiedCardsManager.init();
    return unifiedCardsManager;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUnifiedCards);
} else {
    initUnifiedCards();
}

// 导出到全局作用域
window.UnifiedCardsManager = UnifiedCardsManager;
window.initUnifiedCards = initUnifiedCards;
window.unifiedCardsManager = unifiedCardsManager;