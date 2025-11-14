/**
 * 窗口间通信管理器 - Window Communication Manager
 *
 * 功能：
 * 1. 监听语言切换事件并广播到其他窗口
 * 2. 接收其他窗口的语言切换消息并同步语言
 * 3. 管理多窗口间的状态同步
 * 4. 提供安全的跨窗口通信机制
 *
 * @author Japan Business Hub Frontend Team
 * @version 1.0.0
 */

'use strict';

/**
 * 窗口通信管理器类
 * 负责管理多个浏览器窗口/标签页之间的语言状态同步
 */
class WindowCommunicationManager {
    constructor(config = {}) {
        this.config = {
            // 通信目标窗口的来源（白名单机制）
            allowedOrigins: [
                window.location.origin,
                ...(config.allowedOrigins || [])
            ],
            // 消息类型标识
            messageTypes: {
                LANGUAGE_CHANGE: 'japan-hub-language-change',
                LANGUAGE_SYNC_REQUEST: 'japan-hub-language-sync-request',
                LANGUAGE_SYNC_RESPONSE: 'japan-hub-language-sync-response',
                WINDOW_READY: 'japan-hub-window-ready'
            },
            // 重试机制配置
            retryAttempts: 3,
            retryDelay: 1000,
            // 心跳检测间隔
            heartbeatInterval: 30000,
            // 消息超时时间
            messageTimeout: 5000,
            ...config
        };

        // 状态管理
        this.state = {
            isInitialized: false,
            currentLanguage: 'zh',
            broadcastChannel: null,
            connectedWindows: new Set(),
            pendingMessages: new Map(),
            lastHeartbeat: Date.now(),
            isEnabled: true
        };

        // 事件监听器管理
        this.listeners = {
            message: null,
            languageChange: null,
            beforeUnload: null,
            storage: null,
            focus: null,
            blur: null
        };

        // 消息队列（用于离线窗口重新上线时同步）
        this.messageQueue = [];

        // 心跳定时器
        this.heartbeatTimer = null;

        // 初始化
        this.init();
    }

    /**
     * 初始化窗口通信管理器
     */
    init() {
        try {
            console.log('[WindowCommunication] 初始化窗口间通信管理器...');

            // 检测浏览器兼容性
            if (!this.checkBrowserSupport()) {
                console.warn('[WindowCommunication] 当前浏览器不支持部分通信功能');
                // 继续初始化，使用降级方案
            }

            // 初始化广播频道（现代浏览器）
            this.initializeBroadcastChannel();

            // 设置事件监听器
            this.setupEventListeners();

            // 发送窗口准备就绪消息
            this.broadcastWindowReady();

            // 启动心跳检测
            this.startHeartbeat();

            // 请求同步当前语言状态
            this.requestLanguageSync();

            this.state.isInitialized = true;
            console.log('[WindowCommunication] ✅ 窗口通信管理器初始化完成');

        } catch (error) {
            console.error('[WindowCommunication] 初始化失败:', error);
            this.state.isEnabled = false;
        }
    }

    /**
     * 检查浏览器功能支持
     */
    checkBrowserSupport() {
        const features = {
            broadcastChannel: typeof BroadcastChannel !== 'undefined',
            localStorage: typeof Storage !== 'undefined' && window.localStorage,
            postMessage: typeof window.postMessage === 'function',
            customEvent: typeof CustomEvent === 'function'
        };

        console.log('[WindowCommunication] 浏览器功能支持检查:', features);
        return Object.values(features).some(Boolean);
    }

    /**
     * 初始化广播频道
     */
    initializeBroadcastChannel() {
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                this.state.broadcastChannel = new BroadcastChannel('japan-hub-language-sync');

                this.state.broadcastChannel.addEventListener('message', (event) => {
                    this.handleBroadcastMessage(event);
                });

                console.log('[WindowCommunication] ✅ 广播频道初始化成功');
            }
        } catch (error) {
            console.warn('[WindowCommunication] 广播频道初始化失败，使用降级方案:', error);
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听语言切换事件（来自现有的SecureLanguageManager）
        this.listeners.languageChange = (event) => {
            if (this.state.isEnabled) {
                this.handleLanguageChangeEvent(event);
            }
        };
        window.addEventListener('languageChanged', this.listeners.languageChange);

        // 监听跨窗口消息
        this.listeners.message = (event) => {
            if (this.state.isEnabled) {
                this.handleCrossWindowMessage(event);
            }
        };
        window.addEventListener('message', this.listeners.message);

        // 监听页面卸载事件
        this.listeners.beforeUnload = () => {
            this.cleanup();
        };
        window.addEventListener('beforeunload', this.listeners.beforeUnload);

        // 监听本地存储变化（降级方案）
        if (window.localStorage) {
            this.listeners.storage = (event) => {
                if (this.state.isEnabled && event.key === 'japan-hub-language') {
                    this.handleStorageLanguageChange(event);
                }
            };
            window.addEventListener('storage', this.listeners.storage);
        }

        // 监听窗口焦点变化
        this.listeners.focus = () => {
            this.handleWindowFocus();
        };
        window.addEventListener('focus', this.listeners.focus);

        this.listeners.blur = () => {
            this.handleWindowBlur();
        };
        window.addEventListener('blur', this.listeners.blur);

        console.log('[WindowCommunication] ✅ 事件监听器设置完成');
    }

    /**
     * 处理语言切换事件
     */
    handleLanguageChangeEvent(event) {
        const { language, source = 'current-window' } = event.detail || {};

        if (!language || language === this.state.currentLanguage) {
            return;
        }

        console.log(`[WindowCommunication] 检测到语言切换事件: ${language} (来源: ${source})`);

        // 更新当前状态
        this.state.currentLanguage = language;

        // 广播到其他窗口
        this.broadcastLanguageChange(language, source);

        // 存储到本地存储（降级方案）
        this.storeLanguagePreference(language);
    }

    /**
     * 广播语言切换消息到其他窗口
     */
    broadcastLanguageChange(language, source = 'current-window') {
        const message = {
            type: this.config.messageTypes.LANGUAGE_CHANGE,
            payload: {
                language,
                source,
                timestamp: Date.now(),
                windowId: this.getWindowId()
            }
        };

        // 方式1: 使用BroadcastChannel（现代浏览器）
        if (this.state.broadcastChannel) {
            try {
                this.state.broadcastChannel.postMessage(message);
                console.log('[WindowCommunication] 通过BroadcastChannel发送语言切换消息');
            } catch (error) {
                console.warn('[WindowCommunication] BroadcastChannel发送失败:', error);
            }
        }

        // 方式2: 使用postMessage（兼容所有浏览器）
        this.broadcastToAllWindows(message);

        // 方式3: 使用localStorage（降级方案）
        this.storeLanguageMessage(message);

        console.log(`[WindowCommunication] 📢 广播语言切换: ${language}`);
    }

    /**
     * 向所有其他窗口广播消息
     */
    broadcastToAllWindows(message) {
        // 向所有打开的窗口发送消息
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage(message, window.location.origin);
            } catch (error) {
                console.warn('[WindowCommunication] 发送消息到opener窗口失败:', error);
            }
        }

        // 向由当前窗口打开的子窗口发送消息
        try {
            // 遍历所有可能的子窗口
            const windows = this.getAllChildWindows();
            windows.forEach(childWindow => {
                if (!childWindow.closed) {
                    childWindow.postMessage(message, window.location.origin);
                }
            });
        } catch (error) {
            console.warn('[WindowCommunication] 广播到子窗口失败:', error);
        }
    }

    /**
     * 处理跨窗口消息
     */
    handleCrossWindowMessage(event) {
        // 安全检查：验证消息来源
        if (!this.isMessageAllowed(event)) {
            console.warn('[WindowCommunication] 忽略未授权来源的消息:', event.origin);
            return;
        }

        const message = event.data;
        if (!message || typeof message !== 'object') {
            return;
        }

        // 处理不同类型的消息
        switch (message.type) {
            case this.config.messageTypes.LANGUAGE_CHANGE:
                this.handleIncomingLanguageChange(message);
                break;

            case this.config.messageTypes.LANGUAGE_SYNC_REQUEST:
                this.handleLanguageSyncRequest(message);
                break;

            case this.config.messageTypes.LANGUAGE_SYNC_RESPONSE:
                this.handleLanguageSyncResponse(message);
                break;

            case this.config.messageTypes.WINDOW_READY:
                this.handleWindowReady(message);
                break;

            default:
                console.log('[WindowCommunication] 收到未知类型的消息:', message.type);
        }
    }

    /**
     * 处理广播消息
     */
    handleBroadcastMessage(event) {
        const message = event.data;
        if (message && message.type === this.config.messageTypes.LANGUAGE_CHANGE) {
            this.handleIncomingLanguageChange(message);
        }
    }

    /**
     * 处理收到的语言切换消息
     */
    handleIncomingLanguageChange(message) {
        const { payload } = message;
        if (!payload || !payload.language) {
            return;
        }

        // 忽略自己发送的消息
        if (payload.windowId === this.getWindowId()) {
            return;
        }

        const { language, source, timestamp } = payload;

        // 检查消息时效性
        const now = Date.now();
        if (now - timestamp > this.config.messageTimeout) {
            console.log('[WindowCommunication] 忽略过期的语言切换消息');
            return;
        }

        console.log(`[WindowCommunication] 收到语言切换消息: ${language} (来源: ${source})`);

        // 如果语言不同，则执行切换
        if (language !== this.state.currentLanguage) {
            this.applyLanguageChange(language, `external-window-${source}`);
        }
    }

    /**
     * 应用语言切换
     */
    async applyLanguageChange(language, source = 'external') {
        try {
            console.log(`[WindowCommunication] 应用语言切换: ${language}`);

            // 更新状态
            this.state.currentLanguage = language;

            // 调用现有的语言切换逻辑（通过SecureLanguageManager）
            if (window.navigationController && window.navigationController.languageManager) {
                await window.navigationController.languageManager.setLanguage(language);
            } else if (window.languageManager) {
                await window.languageManager.setLanguage(language);
            } else {
                // 直接调用i18n系统
                if (window.i18nManager) {
                    window.i18nManager.setLanguage(language);
                }

                // 更新页面内容
                this.updatePageLanguage(language);
            }

            console.log(`[WindowCommunication] ✅ 语言切换完成: ${language}`);

        } catch (error) {
            console.error('[WindowCommunication] 语言切换失败:', error);
        }
    }

    /**
     * 更新页面语言内容
     */
    updatePageLanguage(language) {
        try {
            // 更新所有带有data-lang属性的元素
            const elements = document.querySelectorAll('[data-lang]');
            elements.forEach(element => {
                const key = element.getAttribute('data-lang');
                if (window.translations && window.translations[key]) {
                    const translation = window.translations[key][language] || window.translations[key]['zh'];
                    element.textContent = translation;
                }
            });

            // 更新HTML lang属性
            document.documentElement.lang = language === 'zh' ? 'zh-CN' :
                                              language === 'ja' ? 'ja-JP' : 'en-US';

        } catch (error) {
            console.error('[WindowCommunication] 更新页面语言失败:', error);
        }
    }

    /**
     * 请求语言同步
     */
    requestLanguageSync() {
        const message = {
            type: this.config.messageTypes.LANGUAGE_SYNC_REQUEST,
            payload: {
                windowId: this.getWindowId(),
                timestamp: Date.now()
            }
        };

        this.broadcastToAllWindows(message);

        // 也通过广播频道发送
        if (this.state.broadcastChannel) {
            this.state.broadcastChannel.postMessage(message);
        }

        console.log('[WindowCommunication] 📤 发送语言同步请求');
    }

    /**
     * 处理语言同步请求
     */
    handleLanguageSyncRequest(message) {
        const { payload } = message;
        if (!payload || payload.windowId === this.getWindowId()) {
            return;
        }

        // 发送当前语言状态作为响应
        const response = {
            type: this.config.messageTypes.LANGUAGE_SYNC_RESPONSE,
            payload: {
                language: this.state.currentLanguage,
                windowId: this.getWindowId(),
                timestamp: Date.now(),
                requestId: payload.windowId
            }
        };

        this.broadcastToAllWindows(response);

        if (this.state.broadcastChannel) {
            this.state.broadcastChannel.postMessage(response);
        }

        console.log(`[WindowCommunication] 📥 响应语言同步请求: ${this.state.currentLanguage}`);
    }

    /**
     * 处理语言同步响应
     */
    handleLanguageSyncResponse(message) {
        const { payload } = message;
        if (!payload || payload.windowId === this.getWindowId()) {
            return;
        }

        console.log(`[WindowCommunication] 收到语言同步响应: ${payload.language}`);

        // 如果响应的语言与当前不同，则应用切换
        if (payload.language !== this.state.currentLanguage) {
            this.applyLanguageChange(payload.language, 'sync-response');
        }
    }

    /**
     * 发送窗口准备就绪消息
     */
    broadcastWindowReady() {
        const message = {
            type: this.config.messageTypes.WINDOW_READY,
            payload: {
                windowId: this.getWindowId(),
                language: this.state.currentLanguage,
                timestamp: Date.now()
            }
        };

        this.broadcastToAllWindows(message);

        if (this.state.broadcastChannel) {
            this.state.broadcastChannel.postMessage(message);
        }

        console.log('[WindowCommunication] 📢 广播窗口准备就绪');
    }

    /**
     * 处理窗口准备就绪消息
     */
    handleWindowReady(message) {
        const { payload } = message;
        if (!payload || payload.windowId === this.getWindowId()) {
            return;
        }

        console.log(`[WindowCommunication] 检测到新窗口准备就绪: ${payload.language}`);

        // 记录连接的窗口
        this.state.connectedWindows.add(payload.windowId);

        // 如果语言不同，发送语言切换消息给新窗口
        if (payload.language !== this.state.currentLanguage) {
            setTimeout(() => {
                this.broadcastLanguageChange(this.state.currentLanguage, 'sync-to-new-window');
            }, 1000); // 延迟1秒发送，确保新窗口完全加载
        }
    }

    /**
     * 处理本地存储语言变化
     */
    handleStorageLanguageChange(event) {
        if (event.newValue && event.newValue !== this.state.currentLanguage) {
            console.log(`[WindowCommunication] 检测到本地存储语言变化: ${event.newValue}`);
            this.applyLanguageChange(event.newValue, 'localStorage');
        }
    }

    /**
     * 处理窗口获得焦点
     */
    handleWindowFocus() {
        console.log('[WindowCommunication] 窗口获得焦点，检查语言同步');

        // 重新请求语言同步（防止失焦期间错过消息）
        setTimeout(() => {
            this.requestLanguageSync();
        }, 100);
    }

    /**
     * 处理窗口失去焦点
     */
    handleWindowBlur() {
        console.log('[WindowCommunication] 窗口失去焦点');
    }

    /**
     * 验证消息是否被允许
     */
    isMessageAllowed(event) {
        // 检查来源是否在白名单中
        return this.config.allowedOrigins.includes(event.origin) ||
               event.origin === window.location.origin;
    }

    /**
     * 获取唯一窗口ID
     */
    getWindowId() {
        // 尝试从sessionStorage获取或生成新ID
        let windowId = sessionStorage.getItem('japan-hub-window-id');

        if (!windowId) {
            windowId = `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('japan-hub-window-id', windowId);
        }

        return windowId;
    }

    /**
     * 获取所有子窗口
     */
    getAllChildWindows() {
        // 这里需要根据实际应用架构来实现
        // 可能需要维护一个子窗口的引用列表
        return [];
    }

    /**
     * 存储语言偏好
     */
    storeLanguagePreference(language) {
        try {
            if (window.localStorage) {
                localStorage.setItem('japan-hub-language', language);
                localStorage.setItem('japan-hub-language-timestamp', Date.now().toString());
            }
        } catch (error) {
            console.warn('[WindowCommunication] 存储语言偏好失败:', error);
        }
    }

    /**
     * 存储语言消息到本地存储
     */
    storeLanguageMessage(message) {
        try {
            if (window.localStorage) {
                localStorage.setItem('japan-hub-language-message', JSON.stringify(message));
                // 设置过期时间
                setTimeout(() => {
                    localStorage.removeItem('japan-hub-language-message');
                }, this.config.messageTimeout);
            }
        } catch (error) {
            console.warn('[WindowCommunication] 存储语言消息失败:', error);
        }
    }

    /**
     * 启动心跳检测
     */
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.performHeartbeat();
        }, this.config.heartbeatInterval);
    }

    /**
     * 执行心跳检测
     */
    performHeartbeat() {
        const now = Date.now();
        this.state.lastHeartbeat = now;

        // 可以在这里实现连接健康检查
        console.log('[WindowCommunication] 心跳检测');
    }

    /**
     * 停止心跳检测
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 启用/禁用窗口通信
     */
    setEnabled(enabled) {
        this.state.isEnabled = enabled;
        console.log(`[WindowCommunication] 窗口通信${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isInitialized: this.state.isInitialized,
            isEnabled: this.state.isEnabled,
            currentLanguage: this.state.currentLanguage,
            connectedWindows: Array.from(this.state.connectedWindows),
            hasBroadcastChannel: !!this.state.broadcastChannel,
            lastHeartbeat: this.state.lastHeartbeat
        };
    }

    /**
     * 手动触发语言切换
     */
    switchLanguage(language, source = 'manual') {
        if (!language || typeof language !== 'string') {
            console.warn('[WindowCommunication] 无效的语言参数');
            return;
        }

        console.log(`[WindowCommunication] 手动切换语言: ${language}`);

        // 触发语言切换事件（会被事件监听器捕获并广播）
        const event = new CustomEvent('languageChanged', {
            detail: { language, source }
        });
        window.dispatchEvent(event);
    }

    /**
     * 清理资源
     */
    cleanup() {
        console.log('[WindowCommunication] 清理资源...');

        // 停止心跳
        this.stopHeartbeat();

        // 移除事件监听器
        if (this.listeners.languageChange) {
            window.removeEventListener('languageChanged', this.listeners.languageChange);
        }
        if (this.listeners.message) {
            window.removeEventListener('message', this.listeners.message);
        }
        if (this.listeners.beforeUnload) {
            window.removeEventListener('beforeunload', this.listeners.beforeUnload);
        }
        if (this.listeners.storage) {
            window.removeEventListener('storage', this.listeners.storage);
        }
        if (this.listeners.focus) {
            window.removeEventListener('focus', this.listeners.focus);
        }
        if (this.listeners.blur) {
            window.removeEventListener('blur', this.listeners.blur);
        }

        // 关闭广播频道
        if (this.state.broadcastChannel) {
            this.state.broadcastChannel.close();
        }

        // 清理状态
        this.state.connectedWindows.clear();
        this.messageQueue.length = 0;
        this.state.pendingMessages.clear();

        console.log('[WindowCommunication] ✅ 资源清理完成');
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.cleanup();

        // 清理所有引用
        Object.keys(this.state).forEach(key => {
            this.state[key] = null;
        });

        Object.keys(this.config).forEach(key => {
            this.config[key] = null;
        });

        console.log('[WindowCommunication] ✅ 窗口通信管理器已销毁');
    }
}

/**
 * 导出窗口通信管理器
 */
window.WindowCommunicationManager = WindowCommunicationManager;

/**
 * 创建全局实例
 */
window.windowCommManager = new WindowCommunicationManager();

/**
 * 便捷的全局函数
 */
window.switchLanguageInAllWindows = (language) => {
    if (window.windowCommManager) {
        window.windowCommManager.switchLanguage(language, 'global-function');
    }
};

window.getWindowCommStatus = () => {
    return window.windowCommManager ? window.windowCommManager.getStatus() : null;
};

window.toggleWindowComm = (enabled) => {
    if (window.windowCommManager) {
        window.windowCommManager.setEnabled(enabled);
    }
};

console.log('✅ Window Communication Manager loaded');