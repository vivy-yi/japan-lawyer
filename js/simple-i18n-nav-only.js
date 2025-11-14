/**
 * 简化的导航语言切换系统
 * Simplified Navigation Language Switching System
 * 仅用于导航栏语言切换，不处理页面内容翻译
 */

class SimpleI18nNavOnly {
    constructor() {
        // 默认语言设置为中文
        this.currentLanguage = 'zh';
        this.supportedLanguages = ['zh', 'ja', 'en'];

        // 跨窗口语言切换监听器已禁用
        window.logInfo('📡 跨窗口消息同步已禁用');

        this.init();
    }

    async init() {
        try {
            // 检测浏览器语言
            this.detectBrowserLanguage();

            window.logInfo('✅ 导航语言系统初始化完成');
        } catch (error) {
            window.logError('❌ 导航语言系统初始化失败:', error);
        }
    }

    detectBrowserLanguage() {
        // 1. 首先检查 localStorage 中是否有用户设置的语言
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && ['zh', 'ja', 'en'].includes(savedLang)) {
            this.currentLanguage = savedLang;
            window.logInfo(`📝 使用保存的语言: ${savedLang}`);
            return;
        }

        // 2. 如果没有保存的语言，检查浏览器语言
        const browserLang = navigator.language || navigator.languages?.[0];
        const langCode = browserLang ? browserLang.split('-')[0] : '';

        // 3. 如果浏览器语言是支持的，使用浏览器语言
        if (langCode === 'zh' || langCode === 'ja' || langCode === 'en') {
            this.currentLanguage = langCode;
            window.logInfo(`🌍 使用浏览器语言: ${langCode}`);
        } else {
            // 4. 默认使用中文
            this.currentLanguage = 'zh';
            window.logInfo(`🇨🇳 浏览器语言不支持，使用默认中文: ${browserLang}`);
        }
    }

    // 获取翻译文本（简化版本，只返回基础文本）
    t(key, fallbackText = null) {
        // 由于不再使用内容翻译，直接返回fallback或key
        return fallbackText || key;
    }

    // 切换语言
    async switchLanguage(language) {
        if (!['zh', 'ja', 'en'].includes(language)) {
            window.logWarn('不支持的语言:', language);
            return;
        }

        const oldLanguage = this.currentLanguage;

        // 1. 立即更新当前语言
        this.currentLanguage = language;

        // 2. 立即保存到本地存储
        try {
            localStorage.setItem('preferred-language', language);
            window.logInfo(`💾 语言已保存到本地存储: ${language}`);
        } catch (error) {
            window.logError('❌ 保存语言设置失败:', error);
        }

        window.logInfo(`🌐 语言已切换到: ${language}`);

        // 触发自定义事件（仅限当前窗口）
        const event = new CustomEvent('languageChanged', {
            detail: { language }
        });
        window.dispatchEvent(event);

        // 跨窗口消息发送已禁用
        window.logInfo('📡 跨窗口消息发送已禁用');
    }

    // 更新页面语言（简化版本，不再处理内容翻译）
    updatePageLanguage() {
        // 更新 HTML lang 属性
        document.documentElement.lang =
            language === 'zh' ? 'zh-CN' :
            language === 'ja' ? 'ja-JP' : 'en-US';
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // 获取支持的语言
    getSupportedLanguages() {
        return [
            { code: 'zh', name: '中文', icon: '🇨🇳' },
            { code: 'ja', name: '日本語', icon: '🇯🇵' },
            { code: 'en', name: 'English', icon: '🇺🇸' }
        ];
    }

    // 设置跨窗口语言切换监听器
    setupLanguageMessageListener() {
        try {
            // 方法1: 监听 BroadcastChannel
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('japan-hub-language');
                channel.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'japan-hub-language-change') {
                        this.handleLanguageChangeMessage(event.data);
                    }
                });
            }

            // 方法2: 监听 localStorage 事件（跨窗口）
            window.addEventListener('storage', (event) => {
                if (event.key === 'language-change-sync') {
                    try {
                        const data = JSON.parse(event.newValue);
                        if (data && data.language) {
                            this.handleLanguageChangeMessage({
                                language: data.language,
                                source: data.source,
                                timestamp: data.timestamp
                            });
                        }
                    } catch (error) {
                        window.logWarn('⚠️ 解析语言切换消息失败:', error);
                    }
                }
            });

            window.logInfo('👂 语言消息监听器已设置');

        } catch (error) {
            window.logWarn('⚠️ 设置语言消息监听器失败:', error);
        }
    }

    // 处理来自其他窗口的语言切换消息
    handleLanguageChangeMessage(messageData) {
        try {
            const { language, source, timestamp } = messageData;

            // 忽略自己发送的消息（避免循环）
            if (source === 'simple-i18n-init') {
                return;
            }

            // 验证语言
            if (!this.supportedLanguages.includes(language)) {
                window.logWarn(`⚠️ 收到无效语言消息: ${language}`);
                return;
            }

            // 如果语言已经当前语言，不需要切换
            if (this.currentLanguage === language) {
                return;
            }

            window.logInfo(`🔄 收到来自 ${source} 的语言切换请求: ${this.currentLanguage} -> ${language}`);

            // 切换语言（不再次发送消息，避免循环）
            this.switchLanguageSilently(language);

        } catch (error) {
            window.logWarn('⚠️ 处理语言切换消息失败:', error);
        }
    }

    // 静默切换语言（不发送消息）
    switchLanguageSilently(language) {
        if (!this.supportedLanguages.includes(language)) {
            return;
        }

        const oldLanguage = this.currentLanguage;

        // 更新当前语言
        this.currentLanguage = language;

        // 保存到本地存储
        try {
            localStorage.setItem('preferred-language', language);
        } catch (error) {
            window.logWarn('⚠️ 保存语言设置失败:', error);
        }

        window.logInfo(`🔇 静默切换语言: ${oldLanguage} -> ${language}`);
    }

    // 发送语言切换消息给其他窗口
    sendLanguageChangeMessage() {
        try {
            // 方法1: 使用窗口通信管理器
            if (window.OptimizedWindowCommunicationManager) {
                const commManager = window.OptimizedWindowCommunicationManager;
                if (commManager && commManager.notifyLanguageChange) {
                    commManager.notifyLanguageChange(this.currentLanguage, 'simple-i18n-init');
                    window.logInfo(`📡 通过窗口通信发送语言消息: ${this.currentLanguage}`);
                    return;
                }
            }

            // 方法2: 使用 BroadcastChannel（如果可用）
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('japan-hub-language');
                channel.postMessage({
                    type: 'japan-hub-language-change',
                    language: this.currentLanguage,
                    source: 'simple-i18n-init',
                    timestamp: Date.now()
                });
                window.logInfo(`📡 通过 BroadcastChannel 发送语言消息: ${this.currentLanguage}`);
                return;
            }

            // 方法3: 使用 localStorage 事件
            const event = new StorageEvent('storage', {
                key: 'preferred-language',
                newValue: this.currentLanguage,
                oldValue: null,
                url: window.location.href
            });

            // 在当前窗口触发事件
            window.dispatchEvent(event);

            // 设置 localStorage 触发其他窗口的 storage 事件
            localStorage.setItem('language-change-sync', JSON.stringify({
                language: this.currentLanguage,
                timestamp: Date.now(),
                source: 'simple-i18n-init'
            }));

            setTimeout(() => {
                localStorage.removeItem('language-change-sync');
            }, 100);

            window.logInfo(`📡 通过 localStorage 发送语言消息: ${this.currentLanguage}`);

        } catch (error) {
            window.logWarn('⚠️ 发送语言切换消息失败:', error);
        }
    }
}

// 创建全局实例
window.simpleI18n = new SimpleI18nNavOnly();

// 全局函数
window.t = (key, fallback) => window.simpleI18n.t(key, fallback);
window.switchLanguage = (lang) => window.simpleI18n.switchLanguage(lang);
window.getCurrentLanguage = () => window.simpleI18n.getCurrentLanguage();

window.logInfo('✅ 简化导航语言系统已加载');