/**
 * 统一搜索管理器 - js/shared/search-manager.js
 *
 * 提供统一的搜索框架，支持各页面配置自己的搜索策略
 * 统一UI管理和用户体验，差异化数据处理
 *
 * @author Claude Code
 * @version 1.0.0
 */

console.log('🔍 Loading Search Manager...');

// ========================
// 搜索配置定义
// ========================

/**
 * 各页面的搜索配置
 * 每个配置包含：搜索策略、数据提取器、权重设置等
 */
window.SEARCH_CONFIGS = {
    // AI财务页面 - 复杂搜索策略
    aifinance: {
        cardSelectors: ['.finance-card', '.finance-grid > div'],
        searchInputSelector: '.search-input',
        pageName: 'AI财务',
        searchStrategy: 'weighted', // 加权搜索
        dataExtractors: {
            title: { selector: 'h3, .title', weight: 3.0 },
            description: { selector: 'p, .description', weight: 2.0 },
            features: { selector: 'li, .feature', weight: 1.0 },
            content: { selector: '.content', weight: 1.5 }
        },
        fuzzySearch: true,
        highlightMatches: true
    },

    // AI出海页面 - 全局搜索策略
    aiglobal: {
        cardSelectors: ['.global-card', '.service-grid > div'],
        searchInputSelector: '.search-input',
        pageName: 'AI出海',
        searchStrategy: 'comprehensive', // 全面搜索
        dataExtractors: {
            title: { selector: 'h3, .title', weight: 2.5 },
            description: { selector: 'p, .description', weight: 2.0 },
            benefits: { selector: 'li, .benefit', weight: 1.5 },
            content: { selector: '.content', weight: 1.0 }
        },
        fuzzySearch: true,
        highlightMatches: true
    },

    // 专业人才页面 - 精确搜索策略
    professionals: {
        cardSelectors: ['.professional-card'],
        searchInputSelector: '.search-input',
        pageName: '专业人才',
        searchStrategy: 'precise', // 精确搜索
        dataExtractors: {
            name: { selector: 'h3, .name', weight: 3.0 },
            title: { selector: '.professional-title, .title', weight: 2.5 },
            skills: { selector: '.skills, .skill', weight: 2.0 },
            experience: { selector: '.experience', weight: 1.5 },
            content: { selector: '.content', weight: 1.0 }
        },
        fuzzySearch: false,
        highlightMatches: true
    },

    // 知识库页面 - 内容搜索策略
    knowledge: {
        cardSelectors: ['.knowledge-card', '.info-card', '.card'],
        searchInputSelector: '.search-input',
        pageName: '知识库',
        searchStrategy: 'content', // 内容搜索
        dataExtractors: {
            title: { selector: 'h3, h4, .title', weight: 2.5 },
            summary: { selector: '.summary, .description', weight: 2.0 },
            content: { selector: '.content, p', weight: 1.0 },
            tags: { selector: '.tags, .tag', weight: 1.5 }
        },
        fuzzySearch: true,
        highlightMatches: false
    },

    // AI法律页面 - 专业搜索策略
    ailaw: {
        cardSelectors: ['.knowledge-card'],
        searchInputSelector: '.search-input',
        pageName: 'AI法律',
        searchStrategy: 'legal', // 法律专业搜索
        dataExtractors: {
            title: { selector: 'h3, .title', weight: 3.0 },
            description: { selector: 'p, .description', weight: 2.0 },
            services: { selector: 'li, .service', weight: 2.5 },
            content: { selector: '.content', weight: 1.0 }
        },
        fuzzySearch: true,
        highlightMatches: true,
        legalTerms: ['合同', '诉讼', '咨询', '知识产权', '公司设立', '劳动法']
    },

    // AI CRM页面 - 功能搜索策略
    aicrm: {
        cardSelectors: ['.knowledge-card'],
        searchInputSelector: '.search-input',
        pageName: 'AI CRM',
        searchStrategy: 'feature', // 功能搜索
        dataExtractors: {
            title: { selector: 'h3, .title', weight: 3.0 },
            description: { selector: 'p, .description', weight: 2.0 },
            features: { selector: 'li, .feature', weight: 2.5 },
            benefits: { selector: '.benefit', weight: 1.5 }
        },
        fuzzySearch: true,
        highlightMatches: true
    },

    // 通用服务页面 - 简单搜索策略
    services: {
        cardSelectors: ['.service-card', '.professional-card'],
        searchInputSelector: '.search-input',
        pageName: '服务',
        searchStrategy: 'simple', // 简单搜索
        dataExtractors: {
            title: { selector: 'h3, .title', weight: 2.0 },
            description: { selector: 'p, .description', weight: 1.5 },
            content: { selector: '.content', weight: 1.0 }
        },
        fuzzySearch: false,
        highlightMatches: false
    },

    // 劳务页面 - 行业搜索策略
    labor: {
        cardSelectors: ['.labor-card', '.service-card'],
        searchInputSelector: '.search-input',
        pageName: '劳务服务',
        searchStrategy: 'industry', // 行业搜索
        dataExtractors: {
            title: { selector: 'h3, .title', weight: 2.5 },
            industry: { selector: '.industry, .sector', weight: 3.0 },
            requirements: { selector: '.requirements, li', weight: 2.0 },
            content: { selector: '.content', weight: 1.0 }
        },
        fuzzySearch: true,
        highlightMatches: true
    },

    // 生活方式页面 - 生活服务搜索策略
    lifestyle: {
        cardSelectors: ['.lifestyle-card', '.service-card'],
        searchInputSelector: '.search-input',
        pageName: '生活方式',
        searchStrategy: 'lifestyle', // 生活方式搜索
        dataExtractors: {
            title: { selector: 'h3, .title', weight: 2.5 },
            category: { selector: '.category, .type', weight: 2.0 },
            features: { selector: '.features, li', weight: 1.5 },
            content: { selector: '.content', weight: 1.0 }
        },
        fuzzySearch: true,
        highlightMatches: false
    },

    // 教育页面 - 教育搜索策略
    education: {
        cardSelectors: ['.education-card', '.service-card'],
        searchInputSelector: '.search-input',
        pageName: '教育培训',
        searchStrategy: 'education', // 教育搜索
        dataExtractors: {
            title: { selector: 'h3, .title', weight: 3.0 },
            subject: { selector: '.subject, .course', weight: 2.5 },
            level: { selector: '.level, .grade', weight: 2.0 },
            content: { selector: '.content', weight: 1.0 }
        },
        fuzzySearch: true,
        highlightMatches: true
    }
};

// ========================
// 核心搜索管理器
// ========================

/**
 * 统一搜索管理器类
 */
class SearchManager {
    constructor(configKey) {
        this.config = this.getConfig(configKey);
        this.configKey = configKey;
        this.searchTimeout = null;

        if (!this.config) {
            console.error(`SearchManager: 未找到配置 "${configKey}"`);
            return;
        }

        this.init();
    }

    /**
     * 获取搜索配置
     */
    getConfig(configKey) {
        // 支持配置键的自动检测
        const possibleKeys = [
            configKey,
            configKey.replace('search', '').toLowerCase(),
            configKey.replace('filter', '').toLowerCase()
        ];

        for (const key of possibleKeys) {
            if (window.SEARCH_CONFIGS[key]) {
                return window.SEARCH_CONFIGS[key];
            }
        }

        // 默认配置
        return window.SEARCH_CONFIGS.services;
    }

    /**
     * 初始化搜索管理器
     */
    init() {
        console.log(`🔍 Initializing ${this.config.pageName} search manager...`);
        this.bindEvents();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 绑定搜索框输入事件
        document.addEventListener('input', (event) => {
            if (event.target.matches(this.config.searchInputSelector)) {
                this.debounceSearch();
            }
        });

        // 绑定搜索框键盘事件
        document.addEventListener('keydown', (event) => {
            if (event.target.matches(this.config.searchInputSelector)) {
                if (event.key === 'Enter') {
                    this.performSearch();
                } else if (event.key === 'Escape') {
                    this.clearSearch();
                }
            }
        });
    }

    /**
     * 防抖搜索
     */
    debounceSearch() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 300);
    }

    /**
     * 执行搜索
     */
    performSearch() {
        const searchTerm = this.getSearchTerm();
        const cards = this.getAllCards();

        // 清除筛选状态
        this.clearFilterStates();

        if (!searchTerm.trim()) {
            this.showAllCards(cards);
            this.showNoResultsMessage(cards.length, cards.length);
            console.log(`搜索${this.config.pageName}: 清空搜索，显示所有 ${cards.length} 个结果`);
            return;
        }

        let visibleCount = 0;
        const searchResults = [];

        cards.forEach((card, index) => {
            const searchScore = this.calculateSearchScore(card, searchTerm);

            if (searchScore > 0) {
                card.style.display = 'block';
                card.classList.remove('search-hidden');
                card.classList.add('search-visible');

                // 添加搜索分数到卡片（用于排序）
                card.setAttribute('data-search-score', searchScore);
                searchResults.push({ card, score: searchScore, index });
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('search-visible');
                card.classList.add('search-hidden');
            }
        });

        // 按搜索分数排序
        this.sortSearchResults(searchResults);

        console.log(`搜索${this.config.pageName}: "${searchTerm}", 找到 ${visibleCount} 个结果`);
        this.showNoResultsMessage(visibleCount, cards.length);
    }

    /**
     * 计算搜索分数
     */
    calculateSearchScore(card, searchTerm) {
        let totalScore = 0;
        const searchTerms = searchTerm.toLowerCase().split(/\s+/);

        for (const [fieldType, config] of Object.entries(this.config.dataExtractors)) {
            const elements = card.querySelectorAll(config.selector);
            let fieldScore = 0;

            elements.forEach(element => {
                const text = element.textContent.toLowerCase();
                fieldScore += this.calculateFieldScore(text, searchTerms, config.weight);
            });

            totalScore += fieldScore;
        }

        return totalScore;
    }

    /**
     * 计算字段分数
     */
    calculateFieldScore(text, searchTerms, weight) {
        let score = 0;

        for (const term of searchTerms) {
            if (this.config.fuzzySearch) {
                // 模糊搜索
                score += this.fuzzyMatch(text, term) * weight;
            } else {
                // 精确搜索
                if (text.includes(term)) {
                    score += weight;
                }
            }
        }

        return score;
    }

    /**
     * 模糊匹配
     */
    fuzzyMatch(text, term) {
        if (!term || term.length === 0) return 0;

        // 简单的模糊匹配算法
        let score = 0;
        let textIndex = 0;
        let termIndex = 0;

        while (textIndex < text.length && termIndex < term.length) {
            if (text[textIndex] === term[termIndex]) {
                score++;
                termIndex++;
            }
            textIndex++;
        }

        // 完全匹配得满分，部分匹配按比例得分
        return termIndex === term.length ? 1 : score / term.length;
    }

    /**
     * 按搜索分数排序结果
     */
    sortSearchResults(searchResults) {
        searchResults.sort((a, b) => b.score - a.score);

        // 重新排序DOM元素
        searchResults.forEach((result, index) => {
            result.card.style.order = index;
            result.card.style.animationDelay = `${index * 0.05}s`;
        });
    }

    /**
     * 清除搜索
     */
    clearSearch() {
        const searchInput = document.querySelector(this.config.searchInputSelector);
        if (searchInput) {
            searchInput.value = '';
        }
        this.performSearch();
    }

    /**
     * 清除筛选状态
     */
    clearFilterStates() {
        const tags = document.querySelectorAll('.tag, .filter-tag');
        tags.forEach(tag => tag.classList.remove('active'));
    }

    /**
     * 显示所有卡片
     */
    showAllCards(cards) {
        cards.forEach(card => {
            card.style.display = 'block';
            card.classList.remove('search-hidden');
            card.classList.add('search-visible');
            card.style.order = '';
            card.removeAttribute('data-search-score');
        });
    }

    /**
     * 获取搜索词
     */
    getSearchTerm() {
        const searchInput = document.querySelector(this.config.searchInputSelector);
        return searchInput ? searchInput.value.trim().toLowerCase() : '';
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
        noResultsDiv.className = 'no-results-container-search';

        // 使用安全的DOM方法创建内容
        const iconDiv = document.createElement('div');
        iconDiv.className = 'no-results-icon';
        iconDiv.textContent = '🔍';

        const titleElement = document.createElement('h3');
        titleElement.className = 'no-results-title';
        titleElement.textContent = `未找到匹配的${this.config.pageName}内容`;

        const messageElement = document.createElement('p');
        messageElement.className = 'no-results-message';
        messageElement.textContent = '请尝试使用其他关键词或检查拼写';

        const clearButton = document.createElement('button');
        clearButton.className = 'no-results-btn';
        clearButton.textContent = '清除搜索';
        clearButton.onclick = () => this.clearSearch();

        noResultsDiv.appendChild(iconDiv);
        noResultsDiv.appendChild(titleElement);
        noResultsDiv.appendChild(messageElement);
        noResultsDiv.appendChild(clearButton);

        // 设置样式
        noResultsDiv.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
            animation: fadeInUp 0.5s ease forwards;
        `;

        return noResultsDiv;
    }

    /**
     * 移除无结果消息
     */
    removeNoResultsMessage() {
        const existingMessage = document.querySelector('.no-results-container-search');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    /**
     * 查找结果容器
     */
    findResultContainer() {
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
}

// ========================
// 全局搜索管理器实例
// ========================

// 存储搜索管理器实例
window.searchManagers = {};

/**
 * 创建搜索管理器实例
 * @param {string} configKey - 配置键名
 * @returns {SearchManager} 搜索管理器实例
 */
window.createSearchManager = function(configKey) {
    const manager = new SearchManager(configKey);
    window.searchManagers[configKey] = manager;
    window[`searchManager_${configKey}`] = manager;
    return manager;
};

/**
 * 获取搜索管理器实例
 * @param {string} configKey - 配置键名
 * @returns {SearchManager|null} 搜索管理器实例
 */
window.getSearchManager = function(configKey) {
    return window.searchManagers[configKey] || null;
};

// ========================
// 便捷的全局函数
// ========================

/**
 * 为页面创建便捷的搜索函数
 * 这些函数会自动创建并使用搜索管理器
 */
const createPageSearchFunctions = (configKey) => {
    const managerName = configKey.charAt(0).toUpperCase() + configKey.slice(1);

    // 创建搜索函数
    window[`search${managerName}`] = function() {
        let manager = window.getSearchManager(configKey);
        if (!manager) {
            manager = window.createSearchManager(configKey);
        }
        manager.performSearch();
    };
};

// 自动为所有配置创建便捷函数
Object.keys(window.SEARCH_CONFIGS).forEach(configKey => {
    createPageSearchFunctions(configKey);
});

// ========================
// 搜索样式定义
// ========================

/**
 * 添加搜索相关的CSS样式
 */
window.addSearchStyles = function() {
    if (document.querySelector('#search-manager-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'search-manager-styles';
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

        .search-hidden {
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.3s ease;
            display: none !important;
        }

        .search-visible {
            opacity: 1;
            transform: scale(1);
            transition: all 0.3s ease;
            animation: fadeInUp 0.5s ease forwards;
        }

        .no-results-container-search .no-results-icon {
            font-size: 3rem;
            margin-bottom: 20px;
            opacity: 0.6;
        }

        .no-results-container-search .no-results-title {
            color: #374151;
            margin-bottom: 10px;
            font-size: 1.3rem;
        }

        .no-results-container-search .no-results-message {
            color: #6b7280;
            margin-bottom: 25px;
            font-size: 1rem;
        }

        .no-results-container-search .no-results-btn {
            background: var(--primary, #3b82f6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .no-results-container-search .no-results-btn:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
};

// 自动添加搜索样式
addSearchStyles();

// ========================
// 初始化完成
// ========================

console.log('✅ Search Manager loaded successfully');

// 向全局暴露工具已加载的标记
window.SEARCH_MANAGER_LOADED = true;

// 版本信息
window.SEARCH_MANAGER_VERSION = '1.0.0';