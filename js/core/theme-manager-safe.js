// Safe Theme Manager - 安全的主题管理器
// 支持亮色主题和暗色主题切换

class SafeThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('preferred-theme') || 'light';
        this.supportedThemes = ['light', 'dark', 'auto'];
        this.systemPreference = null;
        this.init();
    }

    init() {
        window.logInfo('🎨 Safe Theme Manager initialized, current:', this.currentTheme);

        // 检测系统主题偏好
        this.detectSystemPreference();

        // 监听系统主题变化
        this.watchSystemPreference();

        // 应用当前主题
        this.applyTheme(this.getActualTheme());

        // 设置主题切换器
        this.setupThemeSwitcher();
    }

    detectSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.systemPreference = 'dark';
        } else {
            this.systemPreference = 'light';
        }

        window.logInfo('🖥️ System preference detected:', this.systemPreference);
    }

    watchSystemPreference() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            mediaQuery.addEventListener('change', (e) => {
                this.systemPreference = e.matches ? 'dark' : 'light';
                window.logInfo('🖥️ System preference changed to:', this.systemPreference);

                // 如果用户之前选择的是"跟随系统"，则立即切换
                if (this.currentTheme === 'auto') {
                    this.applyTheme(this.systemPreference);
                }
            });
        }
    }

    setupThemeSwitcher() {
        // 检查是否已存在主题切换器
        let themeSwitcher = document.getElementById('theme-switcher');

        if (!themeSwitcher) {
            // 创建主题切换器
            themeSwitcher = this.createSafeThemeSwitcher();

            // 添加到导航栏
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                const languageSwitcher = navbar.querySelector('.language-switcher');
                if (languageSwitcher) {
                    navbar.insertBefore(themeSwitcher, languageSwitcher);
                } else {
                    navbar.appendChild(themeSwitcher);
                }
            }
        }

        // 绑定事件
        this.bindThemeSwitcherEvents(themeSwitcher);

        // 更新按钮状态
        this.updateThemeSwitcherState();
    }

    createSafeThemeSwitcher() {
        const switcher = document.createElement('div');
        switcher.id = 'theme-switcher';
        switcher.className = 'theme-switcher';

        // 安全地创建按钮
        const themes = [
            { theme: 'light', icon: '☀️', title: '亮色主题' },
            { theme: 'dark', icon: '🌙', title: '暗色主题' },
            { theme: 'auto', icon: '🔄', title: '跟随系统' }
        ];

        themes.forEach(({ theme, icon, title }) => {
            const button = document.createElement('button');
            button.className = 'theme-btn';
            button.setAttribute('data-theme', theme);
            button.setAttribute('title', title);

            const iconSpan = document.createElement('span');
            iconSpan.className = 'theme-icon';
            iconSpan.textContent = icon;

            button.appendChild(iconSpan);
            switcher.appendChild(button);
        });

        return switcher;
    }

    bindThemeSwitcherEvents(switcher) {
        const buttons = switcher.querySelectorAll('.theme-btn');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = button.getAttribute('data-theme');
                this.switchTheme(theme);
            });
        });
    }

    switchTheme(theme) {
        if (!this.supportedThemes.includes(theme)) {
            window.logWarn(`Unsupported theme: ${theme}`);
            return;
        }

        const previousTheme = this.currentTheme;
        this.currentTheme = theme;

        // 如果是"跟随系统"，则使用系统主题
        const actualTheme = theme === 'auto' ? this.systemPreference : theme;

        // 应用主题
        this.applyTheme(actualTheme);

        // 保存用户偏好
        if (theme === 'auto') {
            localStorage.removeItem('preferred-theme');
        } else {
            localStorage.setItem('preferred-theme', theme);
        }

        // 更新按钮状态
        this.updateThemeSwitcherState();

        // 触发主题变化事件
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: {
                previousTheme,
                currentTheme: theme,
                actualTheme
            }
        }));

        window.logInfo(`🎨 Theme switched to: ${theme} (${actualTheme})`);
    }

    applyTheme(theme) {
        const root = document.documentElement;

        // 设置data-theme属性
        root.setAttribute('data-theme', theme);

        // 更新body类名
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);

        // 更新meta theme-color
        this.updateMetaThemeColor(theme);

        // 应用主题特定的CSS变量
        this.applyThemeVariables(theme);

        // 更新导航栏样式
        this.updateNavbarTheme(theme);
    }

    updateMetaThemeColor(theme) {
        const themeColors = {
            light: '#1e3a5f',
            dark: '#f7fafc'
        };

        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.content = themeColors[theme] || themeColors.light;
    }

    applyThemeVariables(theme) {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.style.setProperty('--theme-bg', '#1a202c');
            root.style.setProperty('--theme-text', '#f7fafc');
            root.style.setProperty('--theme-border', '#2d3748');
            root.style.setProperty('--theme-card-bg', '#2d3748');
            root.style.setProperty('--theme-shadow', 'rgba(0, 0, 0, 0.3)');
            root.style.setProperty('--theme-nav-bg', 'rgba(26, 32, 44, 0.95)');
            root.style.setProperty('--theme-nav-text', '#f7fafc');
        } else {
            root.style.setProperty('--theme-bg', '#ffffff');
            root.style.setProperty('--theme-text', '#1a202c');
            root.style.setProperty('--theme-border', '#e2e8f0');
            root.style.setProperty('--theme-card-bg', '#ffffff');
            root.style.setProperty('--theme-shadow', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--theme-nav-bg', 'rgba(255, 255, 255, 0.95)');
            root.style.setProperty('--theme-nav-text', '#1a202c');
        }
    }

    updateNavbarTheme(theme) {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        if (theme === 'dark') {
            navbar.style.background = 'var(--theme-nav-bg)';
            navbar.style.color = 'var(--theme-nav-text)';
            navbar.style.borderBottom = '1px solid var(--theme-border)';
        } else {
            navbar.style.background = 'var(--theme-nav-bg)';
            navbar.style.color = 'var(--theme-nav-text)';
            navbar.style.borderBottom = '1px solid var(--theme-border)';
        }
    }

    updateThemeSwitcherState() {
        const buttons = document.querySelectorAll('.theme-btn');

        buttons.forEach(button => {
            button.classList.remove('active');
            const buttonTheme = button.getAttribute('data-theme');

            if (buttonTheme === this.currentTheme) {
                button.classList.add('active');
            }
        });
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getActualTheme() {
        return this.currentTheme === 'auto' ? this.systemPreference : this.currentTheme;
    }

    // 自动切换主题（基于时间）
    enableAutoTimeBasedTheme() {
        const hour = new Date().getHours();
        const timeBasedTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';

        if (this.currentTheme === 'auto') {
            this.applyTheme(timeBasedTheme);
        }
    }

    // 获取主题配置
    getThemeConfig() {
        return {
            current: this.currentTheme,
            actual: this.getActualTheme(),
            system: this.systemPreference,
            supported: this.supportedThemes
        };
    }

    // 重置主题设置
    reset() {
        this.currentTheme = 'light';
        localStorage.removeItem('preferred-theme');
        this.applyTheme('light');
        this.updateThemeSwitcherState();

        window.logInfo('🔄 Theme reset to light');
    }

    // 切换到下一个主题
    toggleTheme() {
        const currentIndex = this.supportedThemes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.supportedThemes.length;
        const nextTheme = this.supportedThemes[nextIndex];

        this.switchTheme(nextTheme);
    }
}

// 自动初始化
let themeManager;

// 延迟初始化以确保DOM加载完成
setTimeout(() => {
    themeManager = new SafeThemeManager();
    window.themeManager = themeManager;
    window.logInfo('✅ Safe Theme Manager initialized');
}, 100);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafeThemeManager;
}