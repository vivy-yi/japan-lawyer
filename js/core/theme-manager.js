/**
 * 主题管理器 - 动态主题切换系统 (安全版本)
 * Created: 2025-11-14
 * Purpose: 提供完整的主题切换功能，包括自动检测、用户交互和持久化存储
 * Security: 使用安全的DOM操作，避免XSS攻击
 */

class ThemeManager {
    constructor() {
        this.themes = {
            'default': {
                name: '默认主题',
                icon: '🎨',
                description: '经典蓝紫色主题，适合通用场景',
                color: '#6366f1'
            },
            'tech-blue': {
                name: '科技蓝',
                icon: '💻',
                description: '专业科技蓝，适合AI服务和技术平台',
                color: '#2563eb'
            },
            'legal-gold': {
                name: '法律金',
                icon: '⚖️',
                description: '权威金色，适合法律和商务咨询',
                color: '#d97706'
            },
            'business-purple': {
                name: '商务紫',
                icon: '💼',
                description: '高端紫色，适合企业管理平台',
                color: '#7c3aed'
            }
        };

        this.currentPage = '';
        this.currentTheme = 'default';
        this.isTransitioning = false;
        this.observers = [];

        this.init();
    }

    /**
     * 初始化主题管理器
     */
    init() {
        this.loadSavedTheme();
        this.detectCurrentPage();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupPageSpecificThemes();
        this.applyInitialTheme();
        this.notifyObservers('init');
    }

    /**
     * 安全地设置HTML内容
     * @param {Element} element - 目标元素
     * @param {string} html - HTML内容
     */
    safeSetHTML(element, html) {
        // 使用安全的DOM解析方式
        const template = document.createElement('template');
        template.innerHTML = html; // template.innerHTML相对安全

        element.innerHTML = '';
        element.appendChild(template.content.cloneNode(true));
    }

    /**
     * 安全地创建元素
     * @param {string} tagName - 标签名
     * @param {Object} attributes - 属性对象
     * @param {string|Element|Array} children - 子元素
     */
    safeCreateElement(tagName, attributes = {}, children = []) {
        const element = document.createElement(tagName);

        // 设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        // 添加子元素
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Element) {
                    element.appendChild(child);
                }
            });
        } else if (children instanceof Element) {
            element.appendChild(children);
        }

        return element;
    }

    /**
     * 加载保存的主题设置
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('selected-theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
    }

    /**
     * 检测当前页面
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'home';

        // 映射页面到主题
        const pageThemeMap = {
            'ailegal': 'legal-gold',      // AI法律页面 -> 法律金
            'aifinance': 'business-purple', // AI金融页面 -> 商务紫
            'aiglobal': 'tech-blue',      // AI全球 -> 科技蓝
            'aicrm': 'business-purple',   // AI CRM -> 商务紫
            'professionals': 'business-purple', // 专业人才 -> 商务紫
            'knowledge': 'tech-blue',     // 知识库 -> 科技蓝
            'default': 'default'
        };

        this.currentPage = page;
        this.pageDefaultTheme = pageThemeMap[page] || 'default';
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听页面变化（SPA导航）
        window.addEventListener('popstate', () => {
            this.detectCurrentPage();
            this.setupPageSpecificThemes();
        });

        // 监听DOM变化，自动初始化主题切换器
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.initializeThemeSwitchers(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 监听系统主题变化
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addListener((e) => {
                this.handleSystemThemeChange(e);
            });
        }
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + T 快速切换主题
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.showThemeSelector();
            }

            // Ctrl/Cmd + 数字键切换到对应主题
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                const themeKeys = {
                    '1': 'default',
                    '2': 'tech-blue',
                    '3': 'legal-gold',
                    '4': 'business-purple'
                };

                if (themeKeys[e.key]) {
                    e.preventDefault();
                    this.switchTheme(themeKeys[e.key]);
                }
            }

            // Ctrl/Cmd + 0 恢复页面默认主题
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                this.switchToPageDefault();
            }
        });
    }

    /**
     * 设置页面特定主题
     */
    setupPageSpecificThemes() {
        // 为特定页面自动设置推荐主题
        if (this.pageDefaultTheme !== 'default') {
            // 如果用户没有手动设置主题，使用页面推荐主题
            const hasUserPreference = localStorage.getItem('user-theme-choice');
            if (!hasUserPreference) {
                this.switchTheme(this.pageDefaultTheme, false); // false = 不保存为用户偏好
            }
        }
    }

    /**
     * 应用初始主题
     */
    applyInitialTheme() {
        this.applyTheme(this.currentTheme, false);
        this.createThemeIndicator();
    }

    /**
     * 切换到指定主题
     * @param {string} themeName - 主题名称
     * @param {boolean} savePreference - 是否保存为用户偏好
     * @param {boolean} showNotification - 是否显示通知
     */
    switchTheme(themeName, savePreference = true, showNotification = true) {
        if (!this.themes[themeName]) {
            window.logWarn(`Unknown theme: ${themeName}`);
            return;
        }

        if (this.isTransitioning) {
            return;
        }

        const previousTheme = this.currentTheme;
        this.currentTheme = themeName;
        this.isTransitioning = true;

        // 应用主题
        this.applyTheme(themeName, true);

        // 保存用户偏好
        if (savePreference) {
            localStorage.setItem('selected-theme', themeName);
            localStorage.setItem('user-theme-choice', 'true');
        }

        // 更新UI
        this.updateThemeSwitchers();
        this.updateThemeIndicator();

        // 显示通知
        if (showNotification) {
            this.showThemeNotification(themeName);
        }

        // 通知观察者
        this.notifyObservers('themeChanged', {
            previousTheme,
            currentTheme: themeName,
            page: this.currentPage
        });

        // 重置过渡状态
        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);
    }

    /**
     * 应用主题到DOM
     * @param {string} themeName - 主题名称
     * @param {boolean} animate - 是否使用动画
     */
    applyTheme(themeName, animate = false) {
        const html = document.documentElement;

        if (animate) {
            // 添加过渡类
            html.classList.add('theme-transitioning');

            setTimeout(() => {
                html.setAttribute('data-theme', themeName);

                setTimeout(() => {
                    html.classList.remove('theme-transitioning');
                }, 50);
            }, 50);
        } else {
            html.setAttribute('data-theme', themeName);
        }
    }

    /**
     * 切换到页面默认主题
     */
    switchToPageDefault() {
        this.switchTheme(this.pageDefaultTheme, false);
    }

    /**
     * 循环切换主题
     */
    cycleTheme() {
        const themeKeys = Object.keys(this.themes);
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        const nextTheme = themeKeys[nextIndex];

        this.switchTheme(nextTheme);
    }

    /**
     * 获取当前主题信息
     */
    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }

    /**
     * 获取所有可用主题
     */
    getAllThemes() {
        return this.themes;
    }

    /**
     * 初始化主题切换器组件
     * @param {Element} container - 容器元素
     */
    initializeThemeSwitchers(container = document) {
        const switchers = container.querySelectorAll('.theme-switcher, [data-theme-switcher]');

        switchers.forEach(switcher => {
            if (!switcher.hasAttribute('data-initialized')) {
                this.createThemeSwitcher(switcher);
                switcher.setAttribute('data-initialized', 'true');
            }
        });
    }

    /**
     * 创建主题切换器UI
     * @param {Element} container - 容器元素
     */
    createThemeSwitcher(container) {
        // 清空容器
        container.innerHTML = '';

        // 创建主题切换器结构
        const switcher = this.safeCreateElement('div', {
            className: 'theme-switcher'
        });

        // 创建头部
        const header = this.safeCreateElement('div', {
            className: 'theme-switcher__header'
        });

        const label = this.safeCreateElement('span', {
            className: 'theme-switcher__label'
        }, '主题');

        const toggle = this.safeCreateElement('button', {
            className: 'theme-switcher__toggle',
            'aria-label': '切换主题',
            'title': '点击选择主题'
        });

        const currentIcon = this.safeCreateElement('span', {
            className: 'theme-switcher__current-icon'
        }, this.themes[this.currentTheme].icon);

        toggle.appendChild(currentIcon);
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showThemeSelector();
        });

        header.appendChild(label);
        header.appendChild(toggle);
        switcher.appendChild(header);

        // 创建下拉菜单
        const dropdown = this.safeCreateElement('div', {
            className: 'theme-switcher__dropdown',
            id: 'theme-dropdown'
        });

        // 添加主题按钮
        Object.entries(this.themes).forEach(([key, theme]) => {
            const button = this.safeCreateElement('button', {
                className: `theme-btn ${key === this.currentTheme ? 'active' : ''}`,
                'data-theme': key,
                'title': theme.description,
                'aria-pressed': key === this.currentTheme ? 'true' : 'false'
            });

            const icon = this.safeCreateElement('span', {
                className: 'theme-icon'
            }, theme.icon);

            const name = this.safeCreateElement('span', {
                className: 'theme-name'
            }, theme.name);

            button.appendChild(icon);
            button.appendChild(name);

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.switchTheme(key);
                this.hideDropdown(dropdown);
            });

            dropdown.appendChild(button);
        });

        switcher.appendChild(dropdown);

        // 设置下拉菜单行为
        this.setupDropdownBehavior(switcher, dropdown);

        // 添加到容器
        container.appendChild(switcher);
    }

    /**
     * 设置下拉菜单行为
     * @param {Element} container - 容器元素
     * @param {Element} dropdown - 下拉菜单元素
     */
    setupDropdownBehavior(container, dropdown) {
        // 点击外部关闭
        const handleClickOutside = (e) => {
            if (!container.contains(e.target)) {
                this.hideDropdown(dropdown);
            }
        };

        document.addEventListener('click', handleClickOutside);

        // 键盘导航
        dropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDropdown(dropdown);
                const toggle = container.querySelector('.theme-switcher__toggle');
                if (toggle) toggle.focus();
            }
        });
    }

    /**
     * 切换下拉菜单显示状态
     * @param {Element} dropdown - 下拉菜单元素
     */
    toggleDropdown(dropdown) {
        const isActive = dropdown.classList.contains('active');

        if (isActive) {
            this.hideDropdown(dropdown);
        } else {
            this.showDropdown(dropdown);
        }
    }

    /**
     * 显示下拉菜单
     * @param {Element} dropdown - 下拉菜单元素
     */
    showDropdown(dropdown) {
        dropdown.classList.add('active');

        // 聚焦到当前选中的主题按钮
        const activeButton = dropdown.querySelector('.theme-btn.active');
        if (activeButton) {
            setTimeout(() => activeButton.focus(), 100);
        }
    }

    /**
     * 隐藏下拉菜单
     * @param {Element} dropdown - 下拉菜单元素
     */
    hideDropdown(dropdown) {
        dropdown.classList.remove('active');
    }

    /**
     * 更新所有主题切换器的状态
     */
    updateThemeSwitchers() {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(button => {
            const theme = button.getAttribute('data-theme');
            if (theme === this.currentTheme) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            }
        });

        // 更新当前主题图标
        const currentIcons = document.querySelectorAll('.theme-switcher__current-icon');
        currentIcons.forEach(icon => {
            icon.textContent = this.themes[this.currentTheme].icon;
        });
    }

    /**
     * 创建主题指示器
     */
    createThemeIndicator() {
        // 移除现有指示器
        const existingIndicator = document.getElementById('theme-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // 创建新指示器
        const indicator = this.safeCreateElement('div', {
            id: 'theme-indicator',
            className: 'theme-indicator'
        });

        const content = this.safeCreateElement('div', {
            className: 'theme-indicator__content'
        });

        const icon = this.safeCreateElement('span', {
            className: 'theme-indicator__icon'
        }, this.themes[this.currentTheme].icon);

        const name = this.safeCreateElement('span', {
            className: 'theme-indicator__name'
        }, this.themes[this.currentTheme].name);

        content.appendChild(icon);
        content.appendChild(name);
        indicator.appendChild(content);

        // 添加到页面
        document.body.appendChild(indicator);

        // 3秒后自动隐藏
        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 3000);
    }

    /**
     * 更新主题指示器
     */
    updateThemeIndicator() {
        const indicator = document.getElementById('theme-indicator');
        if (indicator) {
            const icon = indicator.querySelector('.theme-indicator__icon');
            const name = indicator.querySelector('.theme-indicator__name');

            if (icon) icon.textContent = this.themes[this.currentTheme].icon;
            if (name) name.textContent = this.themes[this.currentTheme].name;

            // 重新显示指示器
            indicator.classList.remove('hidden');
            setTimeout(() => {
                indicator.classList.add('hidden');
            }, 3000);
        } else {
            this.createThemeIndicator();
        }
    }

    /**
     * 显示主题选择器模态框
     */
    showThemeSelector() {
        // 移除现有选择器
        const existingSelector = document.getElementById('theme-selector-modal');
        if (existingSelector) {
            existingSelector.remove();
        }

        // 创建模态框
        const modal = this.safeCreateElement('div', {
            id: 'theme-selector-modal',
            className: 'theme-selector-modal'
        });

        // 背景
        const backdrop = this.safeCreateElement('div', {
            className: 'theme-selector__backdrop'
        });
        backdrop.addEventListener('click', () => this.hideThemeSelector());

        // 内容区域
        const content = this.safeCreateElement('div', {
            className: 'theme-selector__content'
        });

        // 头部
        const header = this.safeCreateElement('div', {
            className: 'theme-selector__header'
        });

        const title = this.safeCreateElement('h3', {}, '选择主题');
        const closeButton = this.safeCreateElement('button', {
            className: 'theme-selector__close',
            'aria-label': '关闭'
        }, '×');
        closeButton.addEventListener('click', () => this.hideThemeSelector());

        header.appendChild(title);
        header.appendChild(closeButton);

        // 主题列表
        const themesContainer = this.safeCreateElement('div', {
            className: 'theme-selector__themes'
        });

        Object.entries(this.themes).forEach(([key, theme]) => {
            const option = this.safeCreateElement('div', {
                className: `theme-option ${key === this.currentTheme ? 'active' : ''}`,
                'data-theme': key,
                'tabindex': '0',
                'role': 'button',
                'aria-pressed': key === this.currentTheme ? 'true' : 'false'
            });

            // 预览区域
            const preview = this.safeCreateElement('div', {
                className: 'theme-option__preview',
                style: `background: ${theme.color}20; border-color: ${theme.color}`
            });

            const previewIcon = this.safeCreateElement('span', {
                className: 'theme-option__icon'
            }, theme.icon);

            preview.appendChild(previewIcon);

            // 信息区域
            const info = this.safeCreateElement('div', {
                className: 'theme-option__info'
            });

            const optionTitle = this.safeCreateElement('h4', {}, theme.name);
            const description = this.safeCreateElement('p', {}, theme.description);

            info.appendChild(optionTitle);
            info.appendChild(description);

            // 选中标记
            let checkmark = null;
            if (key === this.currentTheme) {
                checkmark = this.safeCreateElement('div', {
                    className: 'theme-option__check'
                }, '✓');
            }

            // 组装选项
            option.appendChild(preview);
            option.appendChild(info);
            if (checkmark) option.appendChild(checkmark);

            // 添加点击事件
            option.addEventListener('click', () => {
                this.switchTheme(key);
                this.hideThemeSelector();
            });

            // 键盘支持
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchTheme(key);
                    this.hideThemeSelector();
                }
            });

            themesContainer.appendChild(option);
        });

        // 操作按钮
        const actions = this.safeCreateElement('div', {
            className: 'theme-selector__actions'
        });

        const pageDefaultBtn = this.safeCreateElement('button', {
            className: 'btn btn-secondary'
        }, '使用页面默认');
        pageDefaultBtn.addEventListener('click', () => {
            this.switchToPageDefault();
            this.hideThemeSelector();
        });

        const confirmBtn = this.safeCreateElement('button', {
            className: 'btn btn-primary'
        }, '确定');
        confirmBtn.addEventListener('click', () => this.hideThemeSelector());

        actions.appendChild(pageDefaultBtn);
        actions.appendChild(confirmBtn);

        // 组装模态框
        content.appendChild(header);
        content.appendChild(themesContainer);
        content.appendChild(actions);
        modal.appendChild(backdrop);
        modal.appendChild(content);

        // 添加到页面
        document.body.appendChild(modal);

        // 添加动画
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // 焦点管理
        closeButton.focus();

        // ESC键关闭
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideThemeSelector();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * 隐藏主题选择器模态框
     */
    hideThemeSelector() {
        const modal = document.getElementById('theme-selector-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    /**
     * 显示主题切换通知
     * @param {string} themeName - 主题名称
     */
    showThemeNotification(themeName) {
        const theme = this.themes[themeName];

        // 移除现有通知
        const existingNotification = document.getElementById('theme-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 创建通知
        const notification = this.safeCreateElement('div', {
            id: 'theme-notification',
            className: 'theme-notification'
        });

        const content = this.safeCreateElement('div', {
            className: 'theme-notification__content'
        });

        const icon = this.safeCreateElement('span', {
            className: 'theme-notification__icon'
        }, theme.icon);

        const text = this.safeCreateElement('span', {
            className: 'theme-notification__text'
        }, `已切换到 ${theme.name}`);

        content.appendChild(icon);
        content.appendChild(text);
        notification.appendChild(content);

        document.body.appendChild(notification);

        // 添加动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 2秒后移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }

    /**
     * 处理系统主题变化
     * @param {MediaQueryListEvent} e - 媒体查询事件
     */
    handleSystemThemeChange(e) {
        // 如果用户没有手动选择主题，跟随系统主题
        const hasUserPreference = localStorage.getItem('user-theme-choice');
        if (!hasUserPreference) {
            // 可以根据系统深色/浅色模式自动调整
            // 这里暂不实现，保持当前主题
        }
    }

    /**
     * 添加观察者
     * @param {Function} callback - 回调函数
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * 移除观察者
     * @param {Function} callback - 回调函数
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * 通知所有观察者
     * @param {string} event - 事件类型
     * @param {Object} data - 事件数据
     */
    notifyObservers(event, data = {}) {
        this.observers.forEach(callback => {
            try {
                callback(event, { ...data, themeManager: this });
            } catch (error) {
                window.logError('Theme observer error:', error);
            }
        });
    }

    /**
     * 获取主题统计信息
     */
    getThemeStats() {
        return {
            currentTheme: this.currentTheme,
            currentPage: this.currentPage,
            pageDefaultTheme: this.pageDefaultTheme,
            availableThemes: Object.keys(this.themes),
            hasUserPreference: !!localStorage.getItem('user-theme-choice')
        };
    }

    /**
     * 重置主题设置
     */
    reset() {
        localStorage.removeItem('selected-theme');
        localStorage.removeItem('user-theme-choice');
        this.currentTheme = this.pageDefaultTheme;
        this.applyTheme(this.currentTheme, true);
        this.updateThemeSwitchers();
        this.updateThemeIndicator();
        this.notifyObservers('reset');
    }
}

// 自动初始化主题管理器
let themeManager;

document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();

    // 挂载到全局对象
    window.themeManager = themeManager;

    // 初始化所有主题切换器
    themeManager.initializeThemeSwitchers();
});

// 导出模块（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}