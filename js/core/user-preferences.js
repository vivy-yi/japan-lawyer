/**
 * User Preferences Manager - 用户偏好设置管理器
 * 管理用户的个性化设置，包括主题、语言、布局等偏好
 */

class UserPreferencesManager {
    constructor(config = {}) {
        this.config = {
            storageKey: 'user-preferences',
            autoSave: true,
            defaultPreferences: {
                // 外观设置
                theme: 'light', // light, dark, auto
                fontSize: 'medium', // small, medium, large
                fontFamily: 'default', // default, serif, sans-serif, monospace
                primaryColor: '#1e3a5f',
                accentColor: '#d69e2e',

                // 语言设置
                language: 'zh-CN', // zh-CN, en-US, ja-JP
                dateFormat: 'YYYY-MM-DD', // YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
                timeFormat: '24h', // 12h, 24h

                // 导航设置
                fixedHeader: true,
                stickySidebar: false,
                autoHideHeader: false,
                breadcrumbs: true,

                // 内容设置
                animations: true,
                reducedMotion: false,
                highContrast: false,
                largeText: false,

                // 搜索设置
                searchHistory: true,
                searchSuggestions: true,
                instantSearch: true,
                maxSearchResults: 20,

                // 通知设置
                enableNotifications: true,
                notificationPosition: 'top-right', // top-left, top-right, bottom-left, bottom-right
                notificationDuration: 4000,
                enableSounds: false,

                // 性能设置
                lazyLoading: true,
                preloadImages: false,
                cacheEnabled: true,

                // 隐私设置
                allowAnalytics: true,
                allowPersonalization: true,
                allowCookies: true,
                dataRetentionDays: 30,

                // 实验性功能
                enableBetaFeatures: false,
                debugMode: false
            },
            ...config
        };

        this.preferences = { ...this.config.defaultPreferences };
        this.listeners = new Map();
        this.init();
    }

    init() {
        window.logInfo('⚙️ User Preferences Manager initialized');
        this.loadPreferences();
        this.applyPreferences();
        this.setupSystemPreferenceDetection();
        this.setupAutoSave();
    }

    /**
     * 加载用户偏好设置
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved) {
                const savedPreferences = JSON.parse(saved);
                this.preferences = { ...this.preferences, ...savedPreferences };
                window.logInfo('📥 User preferences loaded');
            }
        } catch (error) {
            window.logWarn('❌ Failed to load user preferences:', error);
            this.preferences = { ...this.config.defaultPreferences };
        }
    }

    /**
     * 保存用户偏好设置
     */
    savePreferences() {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.preferences));
            window.logInfo('💾 User preferences saved');
            this.trigger('saved', { preferences: this.preferences });
        } catch (error) {
            window.logWarn('❌ Failed to save user preferences:', error);
        }
    }

    /**
     * 应用偏好设置
     */
    applyPreferences() {
        this.applyThemePreferences();
        this.applyFontPreferences();
        this.applyLanguagePreferences();
        this.applyNavigationPreferences();
        this.applyContentPreferences();
        this.applySearchPreferences();
        this.applyNotificationPreferences();
        this.applyPerformancePreferences();
        this.applyPrivacyPreferences();

        window.logInfo('✨ User preferences applied');
        this.trigger('applied', { preferences: this.preferences });
    }

    /**
     * 应用主题偏好
     */
    applyThemePreferences() {
        const root = document.documentElement;

        // 应用主题
        root.setAttribute('data-theme', this.preferences.theme);

        // 应用字体大小
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        root.style.setProperty('--user-font-size', fontSizeMap[this.preferences.fontSize]);

        // 应用字体族
        const fontFamilyMap = {
            default: 'system-ui, -apple-system, sans-serif',
            serif: 'Georgia, serif',
            'sans-serif': 'Arial, sans-serif',
            monospace: 'Monaco, monospace'
        };
        root.style.setProperty('--user-font-family', fontFamilyMap[this.preferences.fontFamily]);

        // 应用颜色
        root.style.setProperty('--user-primary-color', this.preferences.primaryColor);
        root.style.setProperty('--user-accent-color', this.preferences.accentColor);
    }

    /**
     * 应用字体偏好
     */
    applyFontPreferences() {
        if (this.preferences.largeText) {
            document.body.classList.add('large-text-mode');
        } else {
            document.body.classList.remove('large-text-mode');
        }
    }

    /**
     * 应用语言偏好
     */
    applyLanguagePreferences() {
        document.documentElement.lang = this.preferences.language;

        // 设置日期格式
        if (window.Intl && window.Intl.DateTimeFormat) {
            try {
                const locale = this.preferences.language;
                const dateOptions = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                };
                const timeOptions = {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: this.preferences.timeFormat === '12h'
                };

                // 可以在这里保存格式化器供其他模块使用
                this.dateFormatter = new Intl.DateTimeFormat(locale, dateOptions);
                this.timeFormatter = new Intl.DateTimeFormat(locale, timeOptions);
            } catch (error) {
                window.logWarn('❌ Failed to create formatters:', error);
            }
        }
    }

    /**
     * 应用导航偏好
     */
    applyNavigationPreferences() {
        const body = document.body;

        // 固定头部
        if (this.preferences.fixedHeader) {
            body.classList.add('fixed-header');
        } else {
            body.classList.remove('fixed-header');
        }

        // 自动隐藏头部
        if (this.preferences.autoHideHeader) {
            body.classList.add('auto-hide-header');
            this.setupAutoHideHeader();
        } else {
            body.classList.remove('auto-hide-header');
        }

        // 面包屑导航
        if (this.preferences.breadcrumbs) {
            body.classList.add('show-breadcrumbs');
        } else {
            body.classList.remove('show-breadcrumbs');
        }
    }

    /**
     * 应用内容偏好
     */
    applyContentPreferences() {
        const body = document.body;

        // 动画
        if (!this.preferences.animations) {
            body.classList.add('no-animations');
        } else {
            body.classList.remove('no-animations');
        }

        // 减少动画
        if (this.preferences.reducedMotion) {
            body.classList.add('reduced-motion');
        } else {
            body.classList.remove('reduced-motion');
        }

        // 高对比度
        if (this.preferences.highContrast) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
    }

    /**
     * 应用搜索偏好
     */
    applySearchPreferences() {
        if (window.searchManager) {
            // 这里可以与搜索管理器集成
            window.logInfo('🔍 Search preferences applied:', {
                history: this.preferences.searchHistory,
                suggestions: this.preferences.searchSuggestions,
                instant: this.preferences.instantSearch,
                maxResults: this.preferences.maxSearchResults
            });
        }
    }

    /**
     * 应用通知偏好
     */
    applyNotificationPreferences() {
        if (window.componentLibrary) {
            // 设置通知位置
            document.body.setAttribute('data-notification-position', this.preferences.notificationPosition);

            // 设置默认持续时间
            document.body.setAttribute('data-notification-duration', this.preferences.notificationDuration);
        }

        // 延迟请求通知权限，避免初始化时的手势错误
        // 通知权限请求只能响应用户手势，所以我们将在用户第一次交互时请求
        this.setupNotificationRequest();
    }

    /**
     * 设置通知权限请求
     * 延迟到用户第一次交互时请求权限
     */
    setupNotificationRequest() {
        if (this.preferences.enableNotifications && 'Notification' in window && Notification.permission === 'default') {
            // 添加一次性事件监听器来检测用户交互
            const requestNotificationPermission = () => {
                Notification.requestPermission().then(permission => {
                    window.logInfo('🔔 Notification permission:', permission);
                }).catch(error => {
                    window.logInfo('🔔 Notification permission request failed:', error);
                });

                // 移除事件监听器
                document.removeEventListener('click', requestNotificationPermission);
                document.removeEventListener('keydown', requestNotificationPermission);
                document.removeEventListener('touchstart', requestNotificationPermission);
            };

            // 监听用户交互事件
            document.addEventListener('click', requestNotificationPermission, { once: true });
            document.addEventListener('keydown', requestNotificationPermission, { once: true });
            document.addEventListener('touchstart', requestNotificationPermission, { once: true });
        }
    }

    /**
     * 应用性能偏好
     */
    applyPerformancePreferences() {
        const body = document.body;

        // 懒加载
        if (this.preferences.lazyLoading) {
            body.classList.add('lazy-loading-enabled');
        } else {
            body.classList.remove('lazy-loading-enabled');
        }

        // 预加载图片
        if (this.preferences.preloadImages) {
            this.preloadCriticalImages();
        }
    }

    /**
     * 应用隐私偏好
     */
    applyPrivacyPreferences() {
        if (!this.preferences.allowAnalytics) {
            // 禁用分析追踪
            window.logInfo('🚫 Analytics disabled by user preference');
        }

        if (!this.preferences.allowPersonalization) {
            // 禁用个性化功能
            window.logInfo('🚫 Personalization disabled by user preference');
        }
    }

    /**
     * 设置自动隐藏头部
     */
    setupAutoHideHeader() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeaderVisibility = () => {
            const currentScrollY = window.scrollY;
            const header = document.querySelector('.navbar');

            if (header) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeaderVisibility);
                ticking = true;
            }
        });
    }

    /**
     * 设置系统偏好检测
     */
    setupSystemPreferenceDetection() {
        // 检测系统主题偏好
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

            darkModeQuery.addEventListener('change', (e) => {
                if (this.preferences.theme === 'auto') {
                    window.logInfo('🌙 System theme changed:', e.matches ? 'dark' : 'light');
                    this.applyThemePreferences();
                }
            });

            reducedMotionQuery.addEventListener('change', (e) => {
                window.logInfo('🏃‍♂️ System motion preference changed:', e.matches);
                if (e.matches && !this.preferences.animations) {
                    this.preferences.reducedMotion = true;
                    this.applyContentPreferences();
                }
            });

            highContrastQuery.addEventListener('change', (e) => {
                window.logInfo('👁️ System contrast preference changed:', e.matches);
                if (e.matches) {
                    this.preferences.highContrast = true;
                    this.applyContentPreferences();
                }
            });
        }
    }

    /**
     * 设置自动保存
     */
    setupAutoSave() {
        if (this.config.autoSave) {
            // 每30秒自动保存一次
            setInterval(() => {
                this.savePreferences();
            }, 30000);

            // 页面卸载时保存
            window.addEventListener('beforeunload', () => {
                this.savePreferences();
            });
        }
    }

    /**
     * 设置偏好值
     */
    set(key, value) {
        if (this.hasOwnProperty(key)) {
            window.logWarn(`⚠️ Cannot set reserved property: ${key}`);
            return false;
        }

        const oldValue = this.preferences[key];
        this.preferences[key] = value;

        // 应用更改
        this.applyPreferenceChange(key, value, oldValue);

        // 触发事件
        this.trigger('changed', { key, value, oldValue });

        // 自动保存
        if (this.config.autoSave) {
            this.savePreferences();
        }

        window.logInfo(`⚙️ Preference changed: ${key} = ${value}`);
        return true;
    }

    /**
     * 获取偏好值
     */
    get(key) {
        return this.preferences[key];
    }

    /**
     * 批量设置偏好
     */
    setMultiple(preferences) {
        const changes = {};

        Object.entries(preferences).forEach(([key, value]) => {
            const oldValue = this.preferences[key];
            changes[key] = { value, oldValue };
            this.preferences[key] = value;
            this.applyPreferenceChange(key, value, oldValue);
        });

        this.trigger('batchChanged', changes);

        if (this.config.autoSave) {
            this.savePreferences();
        }

        window.logInfo('⚙️ Multiple preferences changed:', changes);
    }

    /**
     * 应用单个偏好更改
     */
    applyPreferenceChange(key, value, oldValue) {
        switch (key) {
            case 'theme':
            case 'fontSize':
            case 'fontFamily':
            case 'primaryColor':
            case 'accentColor':
                this.applyThemePreferences();
                break;
            case 'largeText':
                this.applyFontPreferences();
                break;
            case 'language':
            case 'dateFormat':
            case 'timeFormat':
                this.applyLanguagePreferences();
                break;
            case 'fixedHeader':
            case 'autoHideHeader':
            case 'breadcrumbs':
                this.applyNavigationPreferences();
                break;
            case 'animations':
            case 'reducedMotion':
            case 'highContrast':
                this.applyContentPreferences();
                break;
            case 'enableNotifications':
            case 'notificationPosition':
            case 'notificationDuration':
                this.applyNotificationPreferences();
                break;
            case 'lazyLoading':
            case 'preloadImages':
                this.applyPerformancePreferences();
                break;
            case 'allowAnalytics':
            case 'allowPersonalization':
                this.applyPrivacyPreferences();
                break;
        }
    }

    /**
     * 重置为默认设置
     */
    reset() {
        const oldPreferences = { ...this.preferences };
        this.preferences = { ...this.config.defaultPreferences };
        this.applyPreferences();
        this.savePreferences();

        this.trigger('reset', { oldPreferences, newPreferences: this.preferences });
        window.logInfo('🔄 Preferences reset to defaults');
    }

    /**
     * 重置特定类别
     */
    resetCategory(category) {
        const categoryDefaults = this.getCategoryDefaults(category);
        const changes = {};

        Object.entries(categoryDefaults).forEach(([key, value]) => {
            changes[key] = { oldValue: this.preferences[key], value };
            this.preferences[key] = value;
        });

        this.applyPreferences();
        this.savePreferences();

        this.trigger('categoryReset', { category, changes });
        window.logInfo(`🔄 ${category} preferences reset`);
    }

    /**
     * 获取类别默认值
     */
    getCategoryDefaults(category) {
        const categories = {
            appearance: ['theme', 'fontSize', 'fontFamily', 'primaryColor', 'accentColor'],
            language: ['language', 'dateFormat', 'timeFormat'],
            navigation: ['fixedHeader', 'stickySidebar', 'autoHideHeader', 'breadcrumbs'],
            content: ['animations', 'reducedMotion', 'highContrast', 'largeText'],
            search: ['searchHistory', 'searchSuggestions', 'instantSearch', 'maxSearchResults'],
            notifications: ['enableNotifications', 'notificationPosition', 'notificationDuration', 'enableSounds'],
            performance: ['lazyLoading', 'preloadImages', 'cacheEnabled'],
            privacy: ['allowAnalytics', 'allowPersonalization', 'allowCookies', 'dataRetentionDays']
        };

        const defaults = {};
        const keys = categories[category] || [];
        keys.forEach(key => {
            if (this.config.defaultPreferences.hasOwnProperty(key)) {
                defaults[key] = this.config.defaultPreferences[key];
            }
        });

        return defaults;
    }

    /**
     * 导出偏好设置
     */
    export() {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            preferences: this.preferences
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `user-preferences-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        window.logInfo('📤 Preferences exported');
    }

    /**
     * 导入偏好设置
     */
    import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.preferences && typeof data.preferences === 'object') {
                        this.preferences = { ...this.config.defaultPreferences, ...data.preferences };
                        this.applyPreferences();
                        this.savePreferences();

                        this.trigger('imported', { data });
                        window.logInfo('📥 Preferences imported successfully');
                        resolve(data);
                    } else {
                        reject(new Error('Invalid preferences file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * 添加事件监听器
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * 移除事件监听器
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     */
    trigger(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    window.logError(`❌ Error in preference event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * 预加载关键图片
     */
    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[critical], img[data-critical]');

        criticalImages.forEach(img => {
            if (img.src && !img.complete) {
                const preloadImg = new Image();
                preloadImg.src = img.src;
            }
        });
    }

    /**
     * 获取偏好设置摘要
     */
    getSummary() {
        return {
            total: Object.keys(this.preferences).length,
            customized: Object.keys(this.preferences).filter(key =>
                this.preferences[key] !== this.config.defaultPreferences[key]
            ).length,
            categories: {
                appearance: this.countCustomizedCategory(['theme', 'fontSize', 'fontFamily', 'primaryColor', 'accentColor']),
                language: this.countCustomizedCategory(['language', 'dateFormat', 'timeFormat']),
                navigation: this.countCustomizedCategory(['fixedHeader', 'stickySidebar', 'autoHideHeader', 'breadcrumbs']),
                content: this.countCustomizedCategory(['animations', 'reducedMotion', 'highContrast', 'largeText']),
                accessibility: this.countCustomizedCategory(['reducedMotion', 'highContrast', 'largeText']),
                search: this.countCustomizedCategory(['searchHistory', 'searchSuggestions', 'instantSearch', 'maxSearchResults']),
                notifications: this.countCustomizedCategory(['enableNotifications', 'notificationPosition', 'notificationDuration', 'enableSounds']),
                performance: this.countCustomizedCategory(['lazyLoading', 'preloadImages', 'cacheEnabled']),
                privacy: this.countCustomizedCategory(['allowAnalytics', 'allowPersonalization', 'allowCookies', 'dataRetentionDays'])
            }
        };
    }

    /**
     * 计算类别的自定义数量
     */
    countCustomizedCategory(keys) {
        return keys.filter(key => this.preferences[key] !== this.config.defaultPreferences[key]).length;
    }

    /**
     * 获取当前设置
     */
    getAll() {
        return { ...this.preferences };
    }

    /**
     * 销毁管理器
     */
    destroy() {
        if (this.config.autoSave) {
            this.savePreferences();
        }

        this.listeners.clear();
        window.logInfo('🗑️ User Preferences Manager destroyed');
    }
}

// 自动初始化用户偏好管理器
let userPreferencesManager;

setTimeout(() => {
    userPreferencesManager = new UserPreferencesManager();
    window.userPreferencesManager = userPreferencesManager;
    window.logInfo('✅ User Preferences Manager ready');
}, 100);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserPreferencesManager;
}