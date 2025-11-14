/**
 * 窗口间通信管理器 - 高性能优化版本
 * Performance Optimized Window Communication Manager
 *
 * 优化特性：
 * 1. 减少心跳频率 (从30秒改为2分钟)
 * 2. 消息去重和防抖机制
 * 3. 减少控制台日志输出
 * 4. 优先使用最快的通信方式
 * 5. 延迟初始化和懒加载
 *
 * @author Japan Business Hub Frontend Team
 * @version 2.0.0 (Optimized)
 */

'use strict';

/**
 * 高性能窗口通信管理器类
 */
// 防止重复定义
if (typeof window.OptimizedWindowCommunicationManager === 'undefined') {
    class OptimizedWindowCommunicationManager {
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
            // 优化配置
            retryAttempts: 2, // 减少重试次数
            retryDelay: 500,   // 减少重试延迟
            heartbeatInterval: 120000, // 2分钟心跳（原来是30秒）
            messageTimeout: 3000,      // 减少消息超时时间
            debounceDelay: 100,        // 防抖延迟
            enableLogging: false,       // 默认关闭详细日志
            enablePerformanceMode: true, // 启用性能模式
            ...config
        };

        // 状态管理
        this.state = {
            isInitialized: false,
            currentLanguage: 'zh',
            broadcastChannel: null,
            connectedWindows: new Set(),
            lastHeartbeat: Date.now(),
            isEnabled: true,
            performanceMode: this.config.enablePerformanceMode
        };

        // 事件监听器管理
        this.listeners = {};

        // 性能优化
        this.messageQueue = [];
        this.processedMessages = new Set(); // 消息去重
        this.debounceTimers = new Map();    // 防抖定时器
        this.lastBroadcastTime = 0;         // 最后广播时间
        this.minBroadcastInterval = 50;     // 最小广播间隔

        // 心跳定时器
        this.heartbeatTimer = null;

        // 延迟初始化
        this.initTimer = null;

        // 懒加载初始化
        this.lazyInit();
    }

    /**
     * 懒加载初始化 - 提高页面加载性能
     */
    lazyInit() {
        // 延迟500ms初始化，避免阻塞页面加载
        this.initTimer = setTimeout(() => {
            this.init();
        }, 500);
    }

    /**
     * 初始化窗口通信管理器
     */
    init() {
        try {
            if (this.config.enableLogging) {
                console.log('[WindowCommunication-OPT] 初始化高性能窗口通信管理器...');
            }

            // 检测浏览器兼容性
            if (!this.checkBrowserSupport()) {
                if (this.config.enableLogging) {
                    console.warn('[WindowCommunication-OPT] 当前浏览器不支持部分通信功能');
                }
            }

            // 优先初始化最快的通信方式
            this.initializeOptimizedCommunication();

            // 设置精简的事件监听器
            this.setupOptimizedEventListeners();

            // 发送窗口准备就绪消息（延迟发送）
            setTimeout(() => {
                this.broadcastWindowReady();
            }, 1000);

            // 启动优化的心跳检测
            this.startOptimizedHeartbeat();

            this.state.isInitialized = true;

            if (this.config.enableLogging) {
                console.log('[WindowCommunication-OPT] ✅ 高性能窗口通信管理器初始化完成');
            }

        } catch (error) {
            console.error('[WindowCommunication-OPT] 初始化失败:', error);
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

        return features.broadcastChannel || features.postMessage;
    }

    /**
     * 初始化优化的通信方式
     */
    initializeOptimizedCommunication() {
        // 优先使用 BroadcastChannel (最快)
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.state.broadcastChannel = new BroadcastChannel('japan-hub-lang-sync-opt');
                this.state.broadcastChannel.addEventListener('message', (event) => {
                    this.handleBroadcastMessage(event);
                });
                return; // 使用BroadcastChannel就足够了
            } catch (error) {
                if (this.config.enableLogging) {
                    console.warn('[WindowCommunication-OPT] BroadcastChannel初始化失败');
                }
            }
        }

        // 降级到 postMessage
        this.setupPostMessageCommunication();
    }

    /**
     * 设置postMessage通信
     */
    setupPostMessageCommunication() {
        // postMessage事件监听器在setupOptimizedEventListeners中统一处理
    }

    /**
     * 设置优化的事件监听器
     */
    setupOptimizedEventListeners() {
        // 语言切换事件监听器已禁用 - 不再进行跨窗口通信
        console.log('[WindowCommunication-OPT] 语言跨窗口通信已禁用');

        this.listeners.languageChange = (event) => {
            // 不处理语言切换事件，仅记录日志
            if (this.config.enableLogging && event.detail) {
                console.log(`[WindowCommunication-OPT] 忽略语言切换事件: ${event.detail.language}`);
            }
        };
        // 不再监听 languageChanged 事件
        // window.addEventListener('languageChanged', this.listeners.languageChange);

        // 监听跨窗口消息
        this.listeners.message = (event) => {
            if (this.state.isEnabled) {
                this.handleCrossWindowMessageOptimized(event);
            }
        };
        window.addEventListener('message', this.listeners.message);

        // 只监听必要的存储事件
        if (window.localStorage) {
            this.listeners.storage = (event) => {
                if (this.state.isEnabled && event.key === 'japan-hub-lang-opt' && event.newValue) {
                    this.handleStorageLanguageChangeOptimized(event);
                }
            };
            window.addEventListener('storage', this.listeners.storage);
        }

        // 页面卸载清理
        this.listeners.beforeUnload = () => {
            this.optimizedCleanup();
        };
        window.addEventListener('beforeunload', this.listeners.beforeUnload);

        if (this.config.enableLogging) {
            console.log('[WindowCommunication-OPT] ✅ 优化事件监听器设置完成');
        }
    }

    /**
     * 优化的语言切换事件处理
     */
    handleLanguageChangeEventOptimized(event) {
        const { language, source = 'current-window' } = event.detail || {};

        if (!language || language === this.state.currentLanguage) {
            return;
        }

        if (this.config.enableLogging) {
            console.log(`[WindowCommunication-OPT] 语言切换: ${language} (来源: ${source})`);
        }

        // 更新当前状态
        this.state.currentLanguage = language;

        // 防抖广播
        this.debouncedBroadcastLanguageChange(language, source);
    }

    /**
     * 防抖广播语言切换
     */
    debouncedBroadcastLanguageChange(language, source) {
        const messageKey = `${language}-${source}`;

        // 消息去重
        if (this.processedMessages.has(messageKey)) {
            return;
        }

        // 清除之前的防抖定时器
        if (this.debounceTimers.has(messageKey)) {
            clearTimeout(this.debounceTimers.get(messageKey));
        }

        // 设置新的防抖定时器
        const timer = setTimeout(() => {
            this.optimizedBroadcastLanguageChange(language, source);
            this.processedMessages.add(messageKey);

            // 5秒后清除消息记录，允许重复消息
            setTimeout(() => {
                this.processedMessages.delete(messageKey);
            }, 5000);

            this.debounceTimers.delete(messageKey);
        }, this.config.debounceDelay);

        this.debounceTimers.set(messageKey, timer);
    }

    /**
     * 优化的语言切换广播
     */
    optimizedBroadcastLanguageChange(language, source = 'current-window') {
        // 检查最小广播间隔
        const now = Date.now();
        if (now - this.lastBroadcastTime < this.minBroadcastInterval) {
            return; // 跳过过于频繁的广播
        }
        this.lastBroadcastTime = now;

        const message = {
            type: this.config.messageTypes.LANGUAGE_CHANGE,
            payload: {
                language,
                source,
                timestamp: now,
                windowId: this.getWindowId()
            }
        };

        // 优先使用BroadcastChannel
        if (this.state.broadcastChannel) {
            try {
                this.state.broadcastChannel.postMessage(message);
                return; // BroadcastChannel足够了
            } catch (error) {
                if (this.config.enableLogging) {
                    console.warn('[WindowCommunication-OPT] BroadcastChannel发送失败');
                }
            }
        }

        // 降级到postMessage
        this.broadcastToAllWindows(message);
    }

    /**
     * 优化的跨窗口消息处理
     */
    handleCrossWindowMessageOptimized(event) {
        // 快速安全检查
        if (!this.isMessageAllowed(event)) {
            return;
        }

        const message = event.data;
        if (!message || typeof message !== 'object') {
            return;
        }

        // 语言切换消息处理已禁用
        if (message.type === this.config.messageTypes.LANGUAGE_CHANGE) {
            if (this.config.enableLogging) {
                console.log(`[WindowCommunication-OPT] 忽略语言切换消息: ${message.payload?.language}`);
            }
            return;
        }
    }

    /**
     * 优化的广播消息处理
     */
    handleBroadcastMessage(event) {
        const message = event.data;
        if (message && message.type === this.config.messageTypes.LANGUAGE_CHANGE) {
            // 忽略语言切换广播消息
            if (this.config.enableLogging) {
                console.log(`[WindowCommunication-OPT] 忽略语言切换广播: ${message.payload?.language}`);
            }
            return;
        }
    }

    /**
     * 优化的语言切换消息处理
     */
    handleIncomingLanguageChangeOptimized(message) {
        const { payload } = message;
        if (!payload || !payload.language) {
            return;
        }

        // 忽略自己发送的消息
        if (payload.windowId === this.getWindowId()) {
            return;
        }

        const { language, source, timestamp } = payload;

        // 检查消息时效性（更严格）
        const now = Date.now();
        if (now - timestamp > this.config.messageTimeout) {
            return;
        }

        // 避免重复处理
        const messageKey = `${language}-${source}-${timestamp}`;
        if (this.processedMessages.has(messageKey)) {
            return;
        }
        this.processedMessages.add(messageKey);

        // 如果语言不同，则执行切换
        if (language !== this.state.currentLanguage) {
            this.optimizedApplyLanguageChange(language, `external-window-${source}`);
        }
    }

    /**
     * 优化的语言切换应用
     */
    async optimizedApplyLanguageChange(language, source = 'external') {
        try {
            if (this.config.enableLogging) {
                console.log(`[WindowCommunication-OPT] 应用语言切换: ${language}`);
            }

            // 更新状态
            this.state.currentLanguage = language;

            // 优先使用新的i18next系统
            if (window.i18nManager && window.i18nManager.switchLanguage) {
                await window.i18nManager.switchLanguage(language);
                return;
            }

            // 回退到旧的i18n系统
            if (window.i18nManager && window.i18nManager.setLanguageSilent) {
                await window.i18nManager.setLanguageSilent(language);
                return;
            }

            // 调用现有的语言切换逻辑（兼容性）
            if (window.navigationController && window.navigationController.languageManager) {
                await window.navigationController.languageManager.setLanguage(language);
            } else if (window.languageManager) {
                await window.languageManager.setLanguage(language);
            } else {
                // 直接调用i18n系统
                if (window.i18nManager) {
                    await window.i18nManager.switchLanguage(language);
                }
                this.updatePageLanguageOptimized(language);
            }

        } catch (error) {
            console.error('[WindowCommunication-OPT] 语言切换失败:', error);
        }
    }

    /**
     * 优化的页面语言内容更新
     */
    updatePageLanguageOptimized(language) {
        try {
            // 使用requestAnimationFrame优化DOM更新
            requestAnimationFrame(() => {
                const elements = document.querySelectorAll('[data-lang]');
                const batchSize = 50; // 批量处理
                let processed = 0;

                const processBatch = () => {
                    const end = Math.min(processed + batchSize, elements.length);
                    for (let i = processed; i < end; i++) {
                        const element = elements[i];
                        const key = element.getAttribute('data-lang');
                        if (window.translations && window.translations[key]) {
                            const translation = window.translations[key][language] ||
                                                window.translations[key]['zh'];
                            element.textContent = translation;
                        }
                    }
                    processed = end;

                    if (processed < elements.length) {
                        requestAnimationFrame(processBatch);
                    } else {
                        // 更新HTML lang属性
                        document.documentElement.lang = language === 'zh' ? 'zh-CN' :
                                                          language === 'ja' ? 'ja-JP' : 'en-US';
                    }
                };

                processBatch();
            });

        } catch (error) {
            console.error('[WindowCommunication-OPT] 更新页面语言失败:', error);
        }
    }

    /**
     * 优化的存储语言变化处理 (已禁用)
     */
    handleStorageLanguageChangeOptimized(event) {
        // 忽略存储语言变化事件
        if (this.config.enableLogging && event.newValue) {
            console.log(`[WindowCommunication-OPT] 忽略存储语言变化: ${event.newValue}`);
        }
        return;
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

        if (this.state.broadcastChannel) {
            this.state.broadcastChannel.postMessage(message);
        } else {
            this.broadcastToAllWindows(message);
        }
    }

    /**
     * 向所有其他窗口广播消息
     */
    broadcastToAllWindows(message) {
        try {
            // 向opener窗口发送
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage(message, window.location.origin);
            }
        } catch (error) {
            // 静默处理错误
        }

        try {
            // 向子窗口发送
            const windows = this.getAllChildWindows();
            windows.forEach(childWindow => {
                if (!childWindow.closed) {
                    childWindow.postMessage(message, window.location.origin);
                }
            });
        } catch (error) {
            // 静默处理错误
        }
    }

    /**
     * 获取所有子窗口
     */
    getAllChildWindows() {
        // 这里可以根据实际应用架构来实现
        return [];
    }

    /**
     * 启动优化的心跳检测
     */
    startOptimizedHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.performOptimizedHeartbeat();
        }, this.config.heartbeatInterval);
    }

    /**
     * 执行优化的心跳检测
     */
    performOptimizedHeartbeat() {
        this.state.lastHeartbeat = Date.now();
        // 简化的心跳检测，减少日志输出
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
     * 验证消息是否被允许
     */
    isMessageAllowed(event) {
        return this.config.allowedOrigins.includes(event.origin) ||
               event.origin === window.location.origin;
    }

    /**
     * 获取唯一窗口ID
     */
    getWindowId() {
        // 尝试从sessionStorage获取或生成新ID
        let windowId = sessionStorage.getItem('japan-hub-window-id-opt');

        if (!windowId) {
            windowId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            sessionStorage.setItem('japan-hub-window-id-opt', windowId);
        }

        return windowId;
    }

    /**
     * 启用/禁用窗口通信
     */
    setEnabled(enabled) {
        this.state.isEnabled = enabled;
        if (this.config.enableLogging) {
            console.log(`[WindowCommunication-OPT] 窗口通信${enabled ? '启用' : '禁用'}`);
        }
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
            lastHeartbeat: this.state.lastHeartbeat,
            performanceMode: this.state.performanceMode,
            processedMessagesCount: this.processedMessages.size
        };
    }

    /**
     * 手动触发语言切换（优化版）
     */
    switchLanguage(language, source = 'manual') {
        if (!language || typeof language !== 'string') {
            return;
        }

        // 触发语言切换事件
        const event = new CustomEvent('languageChanged', {
            detail: { language, source }
        });
        window.dispatchEvent(event);
    }

    /**
     * 优化的资源清理
     */
    optimizedCleanup() {
        // 清理定时器
        if (this.initTimer) {
            clearTimeout(this.initTimer);
        }

        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();

        // 停止心跳
        this.stopHeartbeat();

        // 移除事件监听器
        Object.values(this.listeners).forEach(listener => {
            if (listener) {
                window.removeEventListener('languageChanged', listener);
                window.removeEventListener('message', listener);
                window.removeEventListener('storage', listener);
                window.removeEventListener('beforeunload', listener);
            }
        });

        // 关闭广播频道
        if (this.state.broadcastChannel) {
            this.state.broadcastChannel.close();
        }

        // 清理数据
        this.state.connectedWindows.clear();
        this.messageQueue.length = 0;
        this.processedMessages.clear();
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.optimizedCleanup();

        // 清理所有引用
        Object.keys(this.state).forEach(key => {
            this.state[key] = null;
        });

        Object.keys(this.config).forEach(key => {
            this.config[key] = null;
        });
    }
}

/**
 * 导出优化版窗口通信管理器
 */
window.OptimizedWindowCommunicationManager = OptimizedWindowCommunicationManager;

/**
 * 创建全局优化版实例
 */
if (!window.windowCommManagerOptimized) {
    window.windowCommManagerOptimized = new OptimizedWindowCommunicationManager({
        enableLogging: false,        // 生产环境关闭日志
        enablePerformanceMode: true  // 启用性能模式
    });
}

/**
 * 便捷的全局函数
 */
window.switchLanguageOptimized = (language) => {
    if (window.windowCommManagerOptimized) {
        window.windowCommManagerOptimized.switchLanguage(language, 'global-optimized');
    }
};

window.getOptimizedCommStatus = () => {
    return window.windowCommManagerOptimized ? window.windowCommManagerOptimized.getStatus() : null;
};

console.log('✅ Optimized Window Communication Manager loaded');

} // 闭合防护重复定义的if语句