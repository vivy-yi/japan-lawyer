/**
 * Search Manager - 搜索管理器
 * 安全、高效的全文搜索系统
 * 支持多语言搜索和实时索引
 */

class SearchManager {
    constructor(config = {}) {
        this.config = {
            searchInputSelector: '#search-input',
            searchResultsSelector: '#search-results',
            searchButtonSelector: '#search-button',
            minQueryLength: 2,
            maxResults: 20,
            highlightTag: 'mark',
            ...config
        };

        this.index = new Map();
        this.documents = new Map();
        this.isIndexing = false;
        this.currentResults = [];
        this.init();
    }

    init() {
        // 搜索功能已禁用
        window.logInfo('🔍 Search Manager disabled - no search functionality will be created');
        return;
    }

    /**
     * 设置搜索相关元素
     */
    setupSearchElements() {
        this.searchInput = document.querySelector(this.config.searchInputSelector);
        this.searchResults = document.querySelector(this.config.searchResultsSelector);
        this.searchButton = document.querySelector(this.config.searchButtonSelector);

        // 如果元素不存在，创建它们
        this.createSearchWidget();
    }

    /**
     * 创建搜索控件 - 已禁用
     * 搜索功能已被移除，不再创建搜索控件
     */
    createSearchWidget() {
        // 搜索功能已禁用，不再创建搜索控件
        window.logInfo('🔍 Search widget creation disabled');
        return;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索输入事件
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(() => {
                const query = this.searchInput.value.trim();
                if (query.length >= this.config.minQueryLength) {
                    this.search(query);
                } else {
                    this.hideResults();
                }
            }, 300));

            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.search(this.searchInput.value.trim());
                } else if (e.key === 'Escape') {
                    this.hideResults();
                }
            });
        }

        // 搜索按钮事件
        if (this.searchButton) {
            this.searchButton.addEventListener('click', () => {
                this.search(this.searchInput.value.trim());
            });
        }

        // 点击外部关闭结果
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-widget')) {
                this.hideResults();
            }
        });
    }

    /**
     * 自动索引页面内容
     */
    autoIndex() {
        this.isIndexing = true;
        window.logInfo('📚 Starting content indexing...');

        // 索引主要内容区域
        this.indexMainContent();

        // 索引导航项目
        this.indexNavigation();

        // 索引页面标题
        this.indexPageTitle();

        this.isIndexing = false;
        window.logInfo(`✅ Indexing complete. Indexed ${this.documents.size} documents`);
    }

    /**
     * 索引主要内容
     */
    indexMainContent() {
        const contentSelectors = [
            'main',
            '.page-content',
            'article',
            '.content',
            'h1, h2, h3, h4, h5, h6',
            'p',
            '.card',
            '.service-item'
        ];

        contentSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => this.indexElement(element));
        });
    }

    /**
     * 索引导航
     */
    indexNavigation() {
        const navLinks = document.querySelectorAll('nav a, .navbar a, .nav a');
        navLinks.forEach(link => {
            if (link.textContent.trim()) {
                this.addDocument({
                    id: `nav-${this.generateId()}`,
                    title: link.textContent.trim(),
                    content: link.textContent.trim(),
                    url: link.href || link.getAttribute('href'),
                    type: 'navigation',
                    element: link
                });
            }
        });
    }

    /**
     * 索引页面标题
     */
    indexPageTitle() {
        const title = document.title;
        if (title) {
            this.addDocument({
                id: 'page-title',
                title: title,
                content: title,
                url: window.location.href,
                type: 'page'
            });
        }
    }

    /**
     * 索引单个元素
     */
    indexElement(element) {
        if (!element || this.shouldSkipElement(element)) return;

        const id = element.id || `elem-${this.generateId()}`;
        const title = this.extractTitle(element);
        const content = this.extractContent(element);
        const url = this.extractUrl(element);

        if (content.length > 10) { // 只索引有意义的内容
            this.addDocument({
                id,
                title,
                content,
                url,
                type: this.getElementType(element),
                element
            });
        }
    }

    /**
     * 判断是否应该跳过元素
     */
    shouldSkipElement(element) {
        const skipTags = ['script', 'style', 'noscript', 'nav', 'footer'];
        const skipClasses = ['search-widget', 'search-results'];

        return (
            skipTags.includes(element.tagName.toLowerCase()) ||
            skipClasses.some(cls => element.classList.contains(cls)) ||
            element.style.display === 'none' ||
            element.hidden
        );
    }

    /**
     * 提取元素标题
     */
    extractTitle(element) {
        const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

        if (headingTags.includes(element.tagName.toLowerCase())) {
            return element.textContent.trim();
        }

        // 查找子元素中的标题
        const titleElement = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .card-title');
        if (titleElement) {
            return titleElement.textContent.trim();
        }

        // 如果没有找到标题，使用前50个字符作为标题
        const text = element.textContent.trim();
        return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }

    /**
     * 提取元素内容
     */
    extractContent(element) {
        return element.textContent.trim().replace(/\s+/g, ' ');
    }

    /**
     * 提取元素URL
     */
    extractUrl(element) {
        if (element.href) {
            return element.href;
        }

        const linkElement = element.querySelector('a');
        if (linkElement && linkElement.href) {
            return linkElement.href;
        }

        return window.location.href;
    }

    /**
     * 获取元素类型
     */
    getElementType(element) {
        if (element.tagName.toLowerCase().startsWith('h')) return 'heading';
        if (element.classList.contains('card')) return 'card';
        if (element.classList.contains('service')) return 'service';
        if (element.tagName.toLowerCase() === 'nav') return 'navigation';
        return 'content';
    }

    /**
     * 添加文档到索引
     */
    addDocument(doc) {
        this.documents.set(doc.id, doc);

        // 建立关键词索引
        const keywords = this.extractKeywords(doc.content);
        keywords.forEach(keyword => {
            if (!this.index.has(keyword)) {
                this.index.set(keyword, new Set());
            }
            this.index.get(keyword).add(doc.id);
        });
    }

    /**
     * 提取关键词
     */
    extractKeywords(text) {
        // 支持中英文分词
        const words = text
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中文字符
            .split(/\s+/)
            .filter(word => word.length >= 2);

        // 对于中文，添加单个字符索引
        const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];

        return [...new Set([...words, ...chineseChars])];
    }

    /**
     * 执行搜索
     */
    search(query) {
        if (query.length < this.config.minQueryLength) {
            this.hideResults();
            return;
        }

        window.logInfo(`🔍 Searching for: "${query}"`);

        const keywords = this.extractKeywords(query);
        const matchingDocs = this.findMatchingDocuments(keywords);
        const rankedResults = this.rankResults(matchingDocs, keywords);

        this.currentResults = rankedResults.slice(0, this.config.maxResults);
        this.displayResults(this.currentResults);
    }

    /**
     * 查找匹配的文档
     */
    findMatchingDocuments(keywords) {
        const docScores = new Map();

        keywords.forEach(keyword => {
            const docIds = this.index.get(keyword);
            if (docIds) {
                docIds.forEach(docId => {
                    docScores.set(docId, (docScores.get(docId) || 0) + 1);
                });
            }
        });

        return Array.from(docScores.entries())
            .filter(([docId, score]) => score > 0)
            .map(([docId, score]) => ({
                docId,
                score,
                document: this.documents.get(docId)
            }));
    }

    /**
     * 对结果进行排序
     */
    rankResults(results, keywords) {
        return results.sort((a, b) => {
            // 首先按分数排序
            if (a.score !== b.score) {
                return b.score - a.score;
            }

            // 然后按标题匹配度排序
            const aTitleMatch = this.calculateTitleMatch(a.document.title, keywords);
            const bTitleMatch = this.calculateTitleMatch(b.document.title, keywords);

            if (aTitleMatch !== bTitleMatch) {
                return bTitleMatch - aTitleMatch;
            }

            // 最后按类型排序
            const typeOrder = { navigation: 0, heading: 1, page: 2, card: 3, content: 4 };
            return typeOrder[a.document.type] - typeOrder[b.document.type];
        });
    }

    /**
     * 计算标题匹配度
     */
    calculateTitleMatch(title, keywords) {
        const titleLower = title.toLowerCase();
        return keywords.reduce((score, keyword) => {
            if (titleLower.includes(keyword.toLowerCase())) {
                return score + (keyword.length / title.length);
            }
            return score;
        }, 0);
    }

    /**
     * 显示搜索结果
     */
    displayResults(results) {
        if (!this.searchResults) return;

        // 清空现有结果
        while (this.searchResults.firstChild) {
            this.searchResults.removeChild(this.searchResults.firstChild);
        }

        if (results.length === 0) {
            this.displayNoResults();
            return;
        }

        results.forEach(result => {
            const resultElement = this.createResultElement(result);
            this.searchResults.appendChild(resultElement);
        });

        this.showResults();
    }

    /**
     * 创建结果元素
     */
    createResultElement(result) {
        const { document } = result;

        const resultDiv = document.createElement('div');
        resultDiv.className = 'search-result';
        resultDiv.style.cssText = `
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            cursor: pointer;
            transition: background-color 0.2s;
        `;

        resultDiv.addEventListener('mouseenter', () => {
            resultDiv.style.backgroundColor = 'var(--border)';
        });

        resultDiv.addEventListener('mouseleave', () => {
            resultDiv.style.backgroundColor = 'transparent';
        });

        // 标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'search-result-title';
        titleDiv.style.cssText = `
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 4px;
            font-size: 14px;
        `;
        titleDiv.textContent = document.title;

        // 内容预览
        const contentDiv = document.createElement('div');
        contentDiv.className = 'search-result-content';
        contentDiv.style.cssText = `
            color: var(--text-secondary);
            font-size: 12px;
            line-height: 1.4;
        `;
        contentDiv.textContent = document.content.length > 100
            ? document.content.substring(0, 100) + '...'
            : document.content;

        // 类型标签
        if (document.type !== 'content') {
            const typeSpan = document.createElement('span');
            typeSpan.className = 'search-result-type';
            typeSpan.style.cssText = `
                display: inline-block;
                background: var(--primary);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                margin-left: 8px;
                text-transform: uppercase;
            `;
            typeSpan.textContent = document.type;
            titleDiv.appendChild(typeSpan);
        }

        resultDiv.appendChild(titleDiv);
        resultDiv.appendChild(contentDiv);

        // 点击事件
        resultDiv.addEventListener('click', () => {
            this.handleResultClick(document);
        });

        return resultDiv;
    }

    /**
     * 处理结果点击
     */
    handleResultClick(document) {
        // 高亮原始元素
        if (document.element) {
            document.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.element.style.backgroundColor = 'yellow';
            setTimeout(() => {
                document.element.style.backgroundColor = '';
            }, 2000);
        }

        // 如果是链接，进行导航
        if (document.url && document.url !== window.location.href) {
            if (document.url.startsWith('#')) {
                // 页面内锚点
                const target = document.querySelector(document.url);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // 外部链接，在新标签页打开
                window.open(document.url, '_blank');
            }
        }

        this.hideResults();
    }

    /**
     * 显示无结果消息
     */
    displayNoResults() {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'search-no-results';
        noResultsDiv.style.cssText = `
            padding: 20px;
            text-align: center;
            color: var(--text-secondary);
            font-style: italic;
        `;
        noResultsDiv.textContent = '未找到相关内容';

        this.searchResults.appendChild(noResultsDiv);
        this.showResults();
    }

    /**
     * 显示搜索结果
     */
    showResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'block';
        }
    }

    /**
     * 隐藏搜索结果
     */
    hideResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }

    /**
     * 清除搜索
     */
    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.hideResults();
        this.currentResults = [];
    }

    /**
     * 重新建立索引
     */
    reindex() {
        this.index.clear();
        this.documents.clear();
        this.autoIndex();
    }

    /**
     * 获取搜索统计
     */
    getStats() {
        return {
            totalDocuments: this.documents.size,
            totalKeywords: this.index.size,
            currentResults: this.currentResults.length,
            isIndexing: this.isIndexing
        };
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 搜索管理器初始化已禁用
let searchManager;

// 搜索功能已禁用，不再初始化
// setTimeout(() => {
//     searchManager = new SearchManager();
//     window.searchManager = searchManager;
//     window.logInfo('✅ Search Manager ready');
// }, 150);

window.logInfo('🔍 Search Manager initialization disabled');

// 移除页面上可能存在的搜索框
function removeExistingSearchWidget() {
    const existingWidgets = document.querySelectorAll('.search-widget');
    existingWidgets.forEach(widget => {
        widget.remove();
        window.logInfo('🗑️ Removed existing search widget');
    });
}

// 页面加载完成后移除搜索框
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeExistingSearchWidget);
} else {
    removeExistingSearchWidget();
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
}