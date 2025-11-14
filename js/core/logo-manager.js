/**
 * Logo管理器 - 工业级Logo系统 (安全版本)
 * Created: 2025-11-14
 * Purpose: 动态Logo管理和业务场景适配
 * Security: 使用安全的DOM操作，避免XSS攻击
 */

class LogoManager {
    constructor() {
        this.logoConfig = {
            // 基础Logo配置
            base: {
                name: '日本商务通',
                tagline: 'Japanese Business Hub',
                icon: '🏢',
                style: 'modern'
            },

            // 业务场景配置
            scenarios: {
                // AI相关页面
                ai: {
                    name: 'AI商务通',
                    tagline: 'AI-Powered Business Solutions',
                    icon: '🤖',
                    style: 'tech',
                    colorScheme: 'tech-blue'
                },

                // 法律服务
                legal: {
                    name: '法务通',
                    tagline: 'Professional Legal Services',
                    icon: '⚖️',
                    style: 'legal',
                    colorScheme: 'legal-gold'
                },

                // 金融服务
                finance: {
                    name: '金融通',
                    tagline: 'Smart Financial Solutions',
                    icon: '💰',
                    style: 'business',
                    colorScheme: 'business-purple'
                },

                // 专业人才
                professionals: {
                    name: '人才通',
                    tagline: 'Professional Talent Network',
                    icon: '👥',
                    style: 'business',
                    colorScheme: 'business-purple'
                },

                // 知识库
                knowledge: {
                    name: '知识通',
                    tagline: 'Knowledge & Resources',
                    icon: '📚',
                    style: 'tech',
                    colorScheme: 'tech-blue'
                },

                // 教育培训
                education: {
                    name: '教育通',
                    tagline: 'Education & Training',
                    icon: '🎓',
                    style: 'modern',
                    colorScheme: 'default'
                },

                // 生活服务
                lifestyle: {
                    name: '生活通',
                    tagline: 'Lifestyle Services',
                    icon: '🌸',
                    style: 'lifestyle',
                    colorScheme: 'default'
                },

                // 劳务服务
                labor: {
                    name: '劳务通',
                    tagline: 'Labor & Employment',
                    icon: '👷',
                    style: 'business',
                    colorScheme: 'business-purple'
                },

                // 旅游服务
                tourism: {
                    name: '旅游通',
                    tagline: 'Travel & Tourism',
                    icon: '✈️',
                    style: 'lifestyle',
                    colorScheme: 'default'
                },

                // 宠物服务
                pet: {
                    name: '宠物通',
                    tagline: 'Pet Care Services',
                    icon: '🐾',
                    style: 'pet',
                    colorScheme: 'default'
                },

                // 社区服务
                community: {
                    name: '社区通',
                    tagline: 'Community Hub',
                    icon: '🏘️',
                    style: 'lifestyle',
                    colorScheme: 'default'
                },

                // 全球服务
                global: {
                    name: '全球通',
                    tagline: 'Global Business Network',
                    icon: '🌍',
                    style: 'business',
                    colorScheme: 'tech-blue'
                },

                // CRM系统
                crm: {
                    name: 'CRM通',
                    tagline: 'Customer Management',
                    icon: '📊',
                    style: 'tech',
                    colorScheme: 'business-purple'
                }
            }
        };

        this.currentScenario = 'base';
        this.currentTheme = 'default';
        this.logos = new Map();
        this.observers = [];

        this.init();
    }

    /**
     * 初始化Logo管理器
     */
    init() {
        this.detectCurrentScenario();
        this.detectCurrentTheme();
        this.setupEventListeners();
        this.initializeLogos();
        this.setupThemeSync();
    }

    /**
     * 检测当前业务场景
     */
    detectCurrentScenario() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'home';

        // 页面与场景映射
        const scenarioMap = {
            'ailegal': 'legal',
            'aifinance': 'finance',
            'aiglobal': 'global',
            'aicrm': 'crm',
            'professionals': 'professionals',
            'knowledge': 'knowledge',
            'education': 'education',
            'lifestyle': 'lifestyle',
            'labor': 'labor',
            'tourism': 'tourism',
            'pet': 'pet',
            'community': 'community',
            'home': 'base'
        };

        this.currentScenario = scenarioMap[page] || 'base';
    }

    /**
     * 检测当前主题
     */
    detectCurrentTheme() {
        const html = document.documentElement;
        this.currentTheme = html.getAttribute('data-theme') || 'default';
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听主题变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'data-theme') {
                    this.detectCurrentTheme();
                    this.updateAllLogos();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // 监听SPA页面变化
        window.addEventListener('popstate', () => {
            this.detectCurrentScenario();
            this.updateAllLogos();
        });

        // 监听Logo点击事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logo')) {
                this.handleLogoClick(e.target.closest('.logo'));
            }
        });
    }

    /**
     * 初始化所有Logo
     */
    initializeLogos() {
        const logoElements = document.querySelectorAll('.logo');
        logoElements.forEach(logo => {
            this.initializeLogo(logo);
        });

        // 监听新增Logo
        const logoObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList.contains('logo')) {
                            this.initializeLogo(node);
                        } else {
                            const logos = node.querySelectorAll('.logo');
                            logos.forEach(logo => this.initializeLogo(logo));
                        }
                    }
                });
            });
        });

        logoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 初始化单个Logo
     * @param {Element} logoElement - Logo元素
     */
    initializeLogo(logoElement) {
        if (this.logos.has(logoElement)) {
            return; // 已初始化
        }

        const logoId = this.generateLogoId();
        this.logos.set(logoElement, {
            id: logoId,
            element: logoElement,
            scenario: this.determineLogoScenario(logoElement),
            config: this.getLogoConfig(logoElement),
            originalContent: logoElement.innerHTML
        });

        // 渲染Logo
        this.renderLogo(logoElement);

        // 标记为已初始化
        logoElement.setAttribute('data-logo-id', logoId);
        logoElement.classList.add('logo-initialized');
    }

    /**
     * 生成Logo ID
     */
    generateLogoId() {
        return `logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 确定Logo场景
     * @param {Element} logoElement - Logo元素
     */
    determineLogoScenario(logoElement) {
        // 检查显式场景设置
        const scenarioAttr = logoElement.getAttribute('data-logo-scenario');
        if (scenarioAttr && this.logoConfig.scenarios[scenarioAttr]) {
            return scenarioAttr;
        }

        // 检查类名设置
        const classList = logoElement.classList;
        for (const className of classList) {
            if (className.startsWith('logo--scenario-')) {
                const scenario = className.replace('logo--scenario-', '');
                if (this.logoConfig.scenarios[scenario]) {
                    return scenario;
                }
            }
        }

        // 使用页面默认场景
        return this.currentScenario;
    }

    /**
     * 获取Logo配置
     * @param {Element} logoElement - Logo元素
     */
    getLogoConfig(logoElement) {
        const scenario = this.determineLogoScenario(logoElement);
        const baseConfig = this.logoConfig.base;
        const scenarioConfig = this.logoConfig.scenarios[scenario] || {};

        // 合并配置
        const config = {
            ...baseConfig,
            ...scenarioConfig
        };

        // 覆盖配置
        const overrideAttrs = [
            'data-logo-name',
            'data-logo-tagline',
            'data-logo-icon',
            'data-logo-style'
        ];

        overrideAttrs.forEach(attr => {
            const value = logoElement.getAttribute(attr);
            if (value) {
                const configKey = attr.replace('data-logo-', '');
                config[configKey] = value;
            }
        });

        return config;
    }

    /**
     * 安全地创建Logo元素
     * @param {Object} config - Logo配置
     * @param {string} size - 尺寸
     * @param {string} layout - 布局
     */
    createLogoElements(config, size, layout) {
        const fragment = document.createDocumentFragment();
        const hasIcon = !config.hideIcon;
        const hasText = !config.hideText;
        const hasTagline = config.tagline && size !== 'xs' && size !== 'sm';

        // 创建图标
        if (hasIcon) {
            const icon = document.createElement('span');
            icon.className = 'logo__icon';
            icon.textContent = config.icon;
            fragment.appendChild(icon);
        }

        // 创建文字容器
        if (hasText) {
            const textContainer = document.createElement('div');
            textContainer.className = 'logo__text-container';

            const text = document.createElement('span');
            text.className = 'logo__text';
            text.textContent = config.name;
            textContainer.appendChild(text);

            if (hasTagline) {
                const tagline = document.createElement('span');
                tagline.className = 'logo__tagline';
                tagline.textContent = config.tagline;
                textContainer.appendChild(tagline);
            }

            fragment.appendChild(textContainer);
        }

        return fragment;
    }

    /**
     * 渲染Logo
     * @param {Element} logoElement - Logo元素
     */
    renderLogo(logoElement) {
        const logoData = this.logos.get(logoElement);
        if (!logoData) return;

        const config = logoData.config;
        const size = this.determineLogoSize(logoElement);
        const layout = this.determineLogoLayout(logoElement);

        // 安全地清空元素
        while (logoElement.firstChild) {
            logoElement.removeChild(logoElement.firstChild);
        }

        // 创建并添加Logo元素
        const logoElements = this.createLogoElements(config, size, layout);
        logoElement.appendChild(logoElements);

        // 应用样式类
        this.applyLogoClasses(logoElement, config, size, layout);

        // 设置数据属性
        this.setLogoDataAttributes(logoElement, config);
    }

    /**
     * 确定Logo尺寸
     * @param {Element} logoElement - Logo元素
     */
    determineLogoSize(logoElement) {
        const classList = logoElement.classList;

        if (classList.contains('logo--xs')) return 'xs';
        if (classList.contains('logo--sm')) return 'sm';
        if (classList.contains('logo--md')) return 'md';
        if (classList.contains('logo--lg')) return 'lg';
        if (classList.contains('logo--xl')) return 'xl';
        if (classList.contains('logo--2xl')) return '2xl';

        return 'sm'; // 默认尺寸
    }

    /**
     * 确定Logo布局
     * @param {Element} logoElement - Logo元素
     */
    determineLogoLayout(logoElement) {
        const classList = logoElement.classList;

        if (classList.contains('logo--vertical')) return 'vertical';
        if (classList.contains('logo--compact')) return 'compact';
        if (classList.contains('logo--spacious')) return 'spacious';

        return 'horizontal'; // 默认布局
    }

    /**
     * 应用Logo样式类
     * @param {Element} logoElement - Logo元素
     * @param {Object} config - Logo配置
     * @param {string} size - 尺寸
     * @param {string} layout - 布局
     */
    applyLogoClasses(logoElement, config, size, layout) {
        // 基础类
        logoElement.className = 'logo logo-initialized';

        // 尺寸类
        logoElement.classList.add(`logo--${size}`);

        // 布局类
        if (layout !== 'horizontal') {
            logoElement.classList.add(`logo--${layout}`);
        }

        // 样式类
        if (config.style) {
            logoElement.classList.add(`logo--${config.style}`);
        }

        // 状态类
        if (config.disabled) {
            logoElement.classList.add('logo--disabled');
        }

        if (config.loading) {
            logoElement.classList.add('logo--loading');
        }

        // 工具类
        if (config.hideIcon) {
            logoElement.classList.add('logo--text-only');
        }

        if (config.hideText) {
            logoElement.classList.add('logo--icon-only');
        }
    }

    /**
     * 设置Logo数据属性
     * @param {Element} logoElement - Logo元素
     * @param {Object} config - Logo配置
     */
    setLogoDataAttributes(logoElement, config) {
        logoElement.setAttribute('data-logo-name', config.name);
        logoElement.setAttribute('data-logo-scenario', config.scenario || 'base');
        logoElement.setAttribute('data-logo-style', config.style);

        if (config.colorScheme) {
            logoElement.setAttribute('data-logo-color-scheme', config.colorScheme);
        }
    }

    /**
     * 更新所有Logo
     */
    updateAllLogos() {
        this.logos.forEach((logoData, element) => {
            logoData.scenario = this.determineLogoScenario(element);
            logoData.config = this.getLogoConfig(element);
            this.renderLogo(element);
        });

        this.notifyObservers('updated', {
            scenario: this.currentScenario,
            theme: this.currentTheme
        });
    }

    /**
     * 设置主题同步
     */
    setupThemeSync() {
        // 监听主题管理器
        if (window.themeManager) {
            window.themeManager.addObserver((event, data) => {
                if (event === 'themeChanged') {
                    this.detectCurrentTheme();
                    this.updateAllLogos();
                }
            });
        }
    }

    /**
     * 处理Logo点击事件
     * @param {Element} logoElement - Logo元素
     */
    handleLogoClick(logoElement) {
        const logoData = this.logos.get(logoElement);
        if (!logoData) return;

        // 触发自定义事件
        const event = new CustomEvent('logoClick', {
            detail: {
                logoId: logoData.id,
                scenario: logoData.scenario,
                config: logoData.config,
                element: logoElement
            }
        });

        logoElement.dispatchEvent(event);

        // 通知观察者
        this.notifyObservers('click', {
            logoId: logoData.id,
            scenario: logoData.scenario,
            config: logoData.config,
            element: logoElement
        });
    }

    /**
     * 切换Logo场景
     * @param {string} scenario - 场景名称
     * @param {Element|string} target - 目标Logo元素或选择器
     */
    switchScenario(scenario, target = null) {
        if (!this.logoConfig.scenarios[scenario]) {
            window.logWarn(`Unknown logo scenario: ${scenario}`);
            return;
        }

        let logos;
        if (target) {
            if (typeof target === 'string') {
                logos = document.querySelectorAll(target);
            } else if (target instanceof Element) {
                logos = [target];
            }
        } else {
            logos = document.querySelectorAll('.logo');
        }

        logos.forEach(logo => {
            logo.setAttribute('data-logo-scenario', scenario);

            const logoData = this.logos.get(logo);
            if (logoData) {
                logoData.scenario = scenario;
                logoData.config = this.getLogoConfig(logo);
                this.renderLogo(logo);
            }
        });
    }

    /**
     * 动态创建Logo
     * @param {Object} options - Logo选项
     * @param {Element} container - 容器元素
     */
    createLogo(options = {}, container = null) {
        const logo = document.createElement('a');
        logo.href = '/';
        logo.className = 'logo';

        // 设置选项
        Object.entries(options).forEach(([key, value]) => {
            if (key === 'scenario') {
                logo.setAttribute('data-logo-scenario', value);
            } else if (key === 'size') {
                logo.classList.add(`logo--${value}`);
            } else if (key === 'style') {
                logo.classList.add(`logo--${value}`);
            } else if (key.startsWith('data-')) {
                logo.setAttribute(key, value);
            }
        });

        // 初始化Logo
        this.initializeLogo(logo);

        // 添加到容器
        if (container) {
            container.appendChild(logo);
        }

        return logo;
    }

    /**
     * 获取Logo统计信息
     */
    getStats() {
        const scenarioCounts = {};
        const styleCounts = {};

        this.logos.forEach((logoData) => {
            const scenario = logoData.scenario;
            const style = logoData.config.style;

            scenarioCounts[scenario] = (scenarioCounts[scenario] || 0) + 1;
            styleCounts[style] = (styleCounts[style] || 0) + 1;
        });

        return {
            totalLogos: this.logos.size,
            currentScenario: this.currentScenario,
            currentTheme: this.currentTheme,
            scenarioCounts,
            styleCounts,
            availableScenarios: Object.keys(this.logoConfig.scenarios)
        };
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
     * 通知观察者
     * @param {string} event - 事件类型
     * @param {Object} data - 事件数据
     */
    notifyObservers(event, data = {}) {
        this.observers.forEach(callback => {
            try {
                callback(event, { ...data, logoManager: this });
            } catch (error) {
                window.logError('Logo observer error:', error);
            }
        });
    }

    /**
     * 重置Logo系统
     */
    reset() {
        this.logos.clear();
        this.currentScenario = 'base';
        this.detectCurrentScenario();
        this.initializeLogos();
        this.notifyObservers('reset');
    }
}

// 自动初始化Logo管理器
let logoManager;

document.addEventListener('DOMContentLoaded', () => {
    logoManager = new LogoManager();

    // 挂载到全局对象
    window.logoManager = logoManager;

    // 初始化Logo CSS
    const logoCSS = document.createElement('link');
    logoCSS.rel = 'stylesheet';
    logoCSS.href = '/css/components/logo-system.css';
    document.head.appendChild(logoCSS);
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LogoManager;
}