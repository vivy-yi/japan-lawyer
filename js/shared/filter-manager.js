/**
 * 统一筛选管理器 - js/shared/filter-manager.js
 *
 * 提供统一的筛选和搜索功能，避免在多个页面中重复代码
 * 支持多种卡片类型、标签类型和搜索模式
 *
 * @author Claude Code
 * @version 1.0.0
 */

// 日志记录辅助方法
const logInfo = (message, data = null, tag = 'FILTER') => {
    if (window.APP_DEBUG && window.APP_DEBUG.logger) {
        window.APP_DEBUG.logger.info(message, data, tag);
    } else {
        console.log(message, data);
    }
};

const logWarn = (message, data = null, tag = 'FILTER') => {
    if (window.APP_DEBUG && window.APP_DEBUG.logger) {
        window.APP_DEBUG.logger.warn(message, data, tag);
    } else {
        console.warn(message, data);
    }
};

const logError = (message, error = null, tag = 'FILTER_ERROR') => {
    if (window.APP_DEBUG && window.APP_DEBUG.logger) {
        window.APP_DEBUG.logger.error(message, error, tag);
    } else {
        console.error(message, error);
    }
};

logInfo('🔍 Loading Filter Manager...', null, 'FILTER_INIT');

// ========================
// 筛选配置定义
// ========================

/**
 * 各页面的筛选配置
 * 每个配置包含：卡片选择器、标签选择器、搜索框选择器等
 */
window.FILTER_CONFIGS = {
    // AI财务页面
    aifinance: {
        cardSelectors: ['.finance-card', '.finance-grid > div'],
        tagSelectors: ['.tag'],
        searchInputSelector: '.search-input',
        pageName: 'AI财务',
        noResultsIcon: '💰',
        noResultsTitle: '未找到相关财务服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部财务服务'
    },

    // AI出海页面
    aiglobal: {
        cardSelectors: ['.global-card', '.service-grid > div'],
        tagSelectors: ['.tag'],
        searchInputSelector: '.search-input',
        pageName: 'AI出海',
        noResultsIcon: '🌍',
        noResultsTitle: '未找到相关出海服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部出海服务'
    },

    // 专业人才页面
    professionals: {
        cardSelectors: ['.professional-card'],
        tagSelectors: ['.filter-tag'],
        searchInputSelector: '.search-input',
        pageName: '专业人才',
        noResultsIcon: '👔',
        noResultsTitle: '未找到相关专业人才',
        noResultsMessage: '请尝试使用其他关键词或浏览全部人才'
    },

    // 知识库页面
    knowledge: {
        cardSelectors: ['.knowledge-card', '.info-card', '.card'],
        tagSelectors: ['.filter-tag', '.filter-btn'],
        searchInputSelector: '.search-input',
        pageName: '知识库',
        noResultsIcon: '📚',
        noResultsTitle: '未找到相关知识',
        noResultsMessage: '请尝试使用其他关键词或浏览全部知识'
    },

    // AI法律页面
    ailaw: {
        cardSelectors: ['.knowledge-card'],
        tagSelectors: ['.tag'],
        searchInputSelector: '.search-input',
        pageName: 'AI法律',
        noResultsIcon: '⚖️',
        noResultsTitle: '未找到相关法律服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部法律服务'
    },

    // AI CRM页面
    aicrm: {
        cardSelectors: ['.knowledge-card'],
        tagSelectors: ['.tag'],
        searchInputSelector: '.search-input',
        pageName: 'AI CRM',
        noResultsIcon: '🤖',
        noResultsTitle: '未找到相关CRM功能',
        noResultsMessage: '请尝试使用其他关键词或浏览全部CRM功能'
    },

    // 通用服务页面
    services: {
        cardSelectors: ['.service-card', '.professional-card'],
        tagSelectors: ['.filter-tag'],
        searchInputSelector: '.search-input',
        pageName: '服务',
        noResultsIcon: '🛠️',
        noResultsTitle: '未找到相关服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部服务'
    },

    // 劳务页面
    labor: {
        cardSelectors: ['.labor-card', '.service-card'],
        tagSelectors: ['.filter-tag'],
        searchInputSelector: '.search-input',
        pageName: '劳务服务',
        noResultsIcon: '👷',
        noResultsTitle: '未找到相关劳务服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部劳务服务'
    },

    // 生活方式页面
    lifestyle: {
        cardSelectors: ['.lifestyle-card', '.service-card'],
        tagSelectors: ['.filter-tag'],
        searchInputSelector: '.search-input',
        pageName: '生活方式',
        noResultsIcon: '🌸',
        noResultsTitle: '未找到相关生活服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部生活服务'
    },

    // 教育页面
    education: {
        cardSelectors: ['.education-card', '.service-card'],
        tagSelectors: ['.filter-tag'],
        searchInputSelector: '.search-input',
        pageName: '教育培训',
        noResultsIcon: '🎓',
        noResultsTitle: '未找到相关教育服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部教育服务'
    },

    // 宠物页面
    pet: {
        cardSelectors: ['.pet-card', '.service-card'],
        tagSelectors: ['.filter-tag'],
        searchInputSelector: '.search-input',
        pageName: '宠物服务',
        noResultsIcon: '🐕',
        noResultsTitle: '未找到相关宠物服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部宠物服务'
    },

    // 旅游页面
    tourism: {
        cardSelectors: ['.tourism-card', '.service-card'],
        tagSelectors: ['.filter-tag'],
        searchInputSelector: '.search-input',
        pageName: '旅游服务',
        noResultsIcon: '✈️',
        noResultsTitle: '未找到相关旅游服务',
        noResultsMessage: '请尝试使用其他关键词或浏览全部旅游服务'
    }
};

// ========================
// 核心筛选管理器
// ========================

/**
 * 统一筛选管理器类
 */
class FilterManager {
    constructor(configKey) {
        this.config = this.getConfig(configKey);
        this.configKey = configKey;
        this.animationStyleId = `filter-animation-${configKey}`;
        this.noResultsMessageId = `no-results-${configKey}`;

        if (!this.config) {
            logError(`FilterManager: 未找到配置 "${configKey}"`, { configKey }, 'FILTER_CONFIG_ERROR');
            return;
        }

        this.init();
    }

    /**
     * 获取筛选配置
     */
    getConfig(configKey) {
        // 支持配置键的自动检测
        const possibleKeys = [
            configKey,
            configKey.replace('filter', '').toLowerCase(),
            configKey.replace('search', '').toLowerCase()
        ];

        for (const key of possibleKeys) {
            if (window.FILTER_CONFIGS[key]) {
                return window.FILTER_CONFIGS[key];
            }
        }

        // 默认配置
        return window.FILTER_CONFIGS.services;
    }

    /**
     * 初始化筛选管理器
     */
    init() {
        logInfo(`🔍 Initializing ${this.config.pageName} filter manager...`, { pageName: this.config.pageName }, 'FILTER_INIT');
        this.addAnimationStyles();
        this.bindEvents();
    }

    /**
     * 添加动画样式
     */
    addAnimationStyles() {
        if (document.querySelector(`style[data-filter-animation="${this.animationStyleId}"]`)) {
            return;
        }

        const style = document.createElement('style');
        style.setAttribute('data-filter-animation', this.animationStyleId);
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .filter-hidden-${this.configKey} {
                opacity: 0;
                transform: scale(0.9);
                transition: all 0.3s ease;
            }

            .filter-visible-${this.configKey} {
                opacity: 1;
                transform: scale(1);
                transition: all 0.3s ease;
                animation: fadeInUp 0.5s ease forwards;
            }

            .no-results-container-${this.configKey} {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
                animation: fadeInUp 0.5s ease forwards;
            }

            .no-results-container-${this.configKey} .no-results-icon {
                font-size: 3rem;
                margin-bottom: 20px;
                opacity: 0.6;
            }

            .no-results-container-${this.configKey} .no-results-title {
                color: #374151;
                margin-bottom: 10px;
                font-size: 1.3rem;
            }

            .no-results-container-${this.configKey} .no-results-message {
                color: #6b7280;
                margin-bottom: 25px;
                font-size: 1rem;
            }

            .no-results-container-${this.configKey} .no-results-btn {
                background: var(--success, #10b981);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s ease;
            }

            .no-results-container-${this.configKey} .no-results-btn:hover {
                background: #059669;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 绑定标签点击事件
        document.addEventListener('click', (event) => {
            if (event.target.matches(this.config.tagSelectors.join(', '))) {
                const category = event.target.getAttribute('data-category') || 'all';
                this.filterByCategory(category, event.target);
            }
        });

        // 绑定搜索框输入事件
        document.addEventListener('input', (event) => {
            if (event.target.matches(this.config.searchInputSelector)) {
                this.debounceSearch();
            }
        });
    }

    /**
     * 按类别筛选
     */
    filterByCategory(category, clickedTag = null) {
        const cards = this.getAllCards();
        const tags = this.getAllTags();

        // 更新标签状态
        tags.forEach(tag => tag.classList.remove('active'));
        if (clickedTag) {
            clickedTag.classList.add('active');
        }

        // 显示/隐藏卡片
        let visibleCount = 0;
        cards.forEach((card, index) => {
            const cardCategory = card.getAttribute('data-category');
            const shouldShow = category === 'all' || cardCategory === category;

            if (shouldShow) {
                this.showCard(card, index);
                visibleCount++;
            } else {
                this.hideCard(card);
            }
        });

        logInfo(`筛选${this.config.pageName}: ${category}, 显示 ${visibleCount} 个结果`, { pageName: this.config.pageName, category, visibleCount, totalCount: cards.length }, 'FILTER_RESULT');
        this.showNoResultsMessage(visibleCount, cards.length);
    }

    /**
     * 搜索功能
     */
    search() {
        const searchTerm = this.getSearchTerm();
        const cards = this.getAllCards();

        // 清除所有筛选状态
        const tags = this.getAllTags();
        tags.forEach(tag => tag.classList.remove('active'));

        if (!searchTerm.trim()) {
            // 显示所有卡片
            cards.forEach((card, index) => this.showCard(card, index));
            this.showNoResultsMessage(cards.length, cards.length);
            logInfo(`搜索${this.config.pageName}: 清空搜索，显示所有 ${cards.length} 个结果`, { pageName: this.config.pageName, totalCount: cards.length }, 'FILTER_CLEAR');
            return;
        }

        let visibleCount = 0;
        cards.forEach((card, index) => {
            const cardText = this.getCardSearchText(card);
            const shouldShow = cardText.includes(searchTerm);

            if (shouldShow) {
                this.showCard(card, index);
                visibleCount++;
            } else {
                this.hideCard(card);
            }
        });

        logInfo(`搜索${this.config.pageName}: "${searchTerm}", 找到 ${visibleCount} 个结果`, { pageName: this.config.pageName, searchTerm, visibleCount, totalCount: cards.length }, 'FILTER_SEARCH');
        this.showNoResultsMessage(visibleCount, cards.length);
    }

    /**
     * 获取所有卡片元素
     */
    getAllCards() {
        const allCards = [];
        this.config.cardSelectors.forEach(selector => {
            const cards = document.querySelectorAll(selector);
            allCards.push(...Array.from(cards));
        });
        return allCards;
    }

    /**
     * 获取所有标签元素
     */
    getAllTags() {
        return document.querySelectorAll(this.config.tagSelectors.join(', '));
    }

    /**
     * 获取搜索词
     */
    getSearchTerm() {
        const searchInput = document.querySelector(this.config.searchInputSelector);
        return searchInput ? searchInput.value.toLowerCase() : '';
    }

    /**
     * 获取卡片搜索文本
     */
    getCardSearchText(card) {
        const title = card.querySelector('h3, h4, .title')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p, .description')?.textContent.toLowerCase() || '';
        const listItems = Array.from(card.querySelectorAll('li')).map(li => li.textContent.toLowerCase()).join(' ');
        const fullText = card.textContent.toLowerCase();

        return `${title} ${description} ${listItems} ${fullText}`;
    }

    /**
     * 显示卡片
     */
    showCard(card, index = 0) {
        card.style.display = 'block';
        card.classList.remove(`filter-hidden-${this.configKey}`);
        card.classList.add(`filter-visible-${this.configKey}`);
        card.style.animationDelay = `${index * 0.1}s`;
    }

    /**
     * 隐藏卡片
     */
    hideCard(card) {
        card.style.display = 'none';
        card.classList.remove(`filter-visible-${this.configKey}`);
        card.classList.add(`filter-hidden-${this.configKey}`);
    }

    /**
     * 显示无结果消息
     */
    showNoResultsMessage(visibleCount, totalCount) {
        // 移除现有的无结果消息
        this.removeNoResultsMessage();

        if (visibleCount === 0 && totalCount > 0) {
            const container = this.findResultContainer();
            if (container) {
                const noResultsDiv = this.createNoResultsElement();
                container.appendChild(noResultsDiv);
            }
        }
    }

    /**
     * 安全创建无结果消息元素
     */
    createNoResultsElement() {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = `no-results-container-${this.configKey}`;

        // 使用安全的DOM方法创建内容
        const iconDiv = document.createElement('div');
        iconDiv.className = 'no-results-icon';
        iconDiv.textContent = this.config.noResultsIcon;

        const titleElement = document.createElement('h3');
        titleElement.className = 'no-results-title';
        titleElement.textContent = this.config.noResultsTitle;

        const messageElement = document.createElement('p');
        messageElement.className = 'no-results-message';
        messageElement.textContent = this.config.noResultsMessage;

        const showAllButton = document.createElement('button');
        showAllButton.className = 'no-results-btn';
        showAllButton.textContent = '查看全部';
        showAllButton.onclick = () => this.showAll();

        noResultsDiv.appendChild(iconDiv);
        noResultsDiv.appendChild(titleElement);
        noResultsDiv.appendChild(messageElement);
        noResultsDiv.appendChild(showAllButton);

        return noResultsDiv;
    }

    /**
     * 移除无结果消息
     */
    removeNoResultsMessage() {
        const existingMessage = document.querySelector(`.no-results-container-${this.configKey}`);
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    /**
     * 查找结果容器
     */
    findResultContainer() {
        // 尝试找到合适的容器来显示无结果消息
        const possibleContainers = [
            '.service-grid',
            '.card-grid',
            '.info-grid',
            '.knowledge-grid',
            '.finance-grid',
            '.global-grid',
            '.professional-grid',
            'main',
            '.page-content',
            '.container'
        ];

        for (const selector of possibleContainers) {
            const container = document.querySelector(selector);
            if (container) {
                return container;
            }
        }

        return document.body;
    }

    /**
     * 显示所有结果
     */
    showAll() {
        this.filterByCategory('all');
    }

    /**
     * 防抖搜索
     */
    debounceSearch() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.search();
        }, 300);
    }

    /**
     * 重置筛选状态
     */
    reset() {
        const tags = this.getAllTags();
        tags.forEach(tag => tag.classList.remove('active'));
        this.showAll();
    }
}

// ========================
// 全局筛选管理器实例
// ========================

// 存储筛选管理器实例
window.filterManagers = {};

/**
 * 创建筛选管理器实例
 * @param {string} configKey - 配置键名
 * @returns {FilterManager} 筛选管理器实例
 */
window.createFilterManager = function(configKey) {
    const manager = new FilterManager(configKey);
    window.filterManagers[configKey] = manager;
    window[`filterManager_${configKey}`] = manager; // 为了兼容现有的全局访问方式
    return manager;
};

/**
 * 获取筛选管理器实例
 * @param {string} configKey - 配置键名
 * @returns {FilterManager|null} 筛选管理器实例
 */
window.getFilterManager = function(configKey) {
    return window.filterManagers[configKey] || null;
};

// ========================
// 便捷的全局函数
// ========================

/**
 * 为页面创建便捷的筛选函数
 * 这些函数会自动创建并使用筛选管理器
 */
if (typeof createPageFilterFunctions === 'undefined') {
    const createPageFilterFunctions = (configKey) => {
    const managerName = configKey.charAt(0).toUpperCase() + configKey.slice(1);

    // 创建筛选函数
    window[`filter${managerName}`] = function(category) {
        let manager = window.getFilterManager(configKey);
        if (!manager) {
            manager = window.createFilterManager(configKey);
        }
        manager.filterByCategory(category);
    };

    // 创建搜索函数
    window[`search${managerName}`] = function() {
        let manager = window.getFilterManager(configKey);
        if (!manager) {
            manager = window.createFilterManager(configKey);
        }
        manager.search();
    };
    }

// 自动为所有配置创建便捷函数
if (!window.FILTER_MANAGER_LOADED) {
    Object.keys(window.FILTER_CONFIGS).forEach(configKey => {
        createPageFilterFunctions(configKey);
    });

    // ========================
    // 初始化完成
    // ========================

    logInfo('✅ Filter Manager loaded successfully', null, 'FILTER_LOADED');

    // 向全局暴露工具已加载的标记
    window.FILTER_MANAGER_LOADED = true;
}

// 版本信息
window.FILTER_MANAGER_VERSION = '1.0.0';