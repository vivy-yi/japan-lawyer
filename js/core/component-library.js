/**
 * Component Library - 组件库系统
 * 安全、可复用的UI组件管理器
 * 遵循安全DOM操作和模块化设计原则
 */

class ComponentLibrary {
    constructor() {
        this.components = new Map();
        this.componentInstances = new Map();
        this.eventListeners = new Map();
        this.componentStyles = new Map();
        this.init();
    }

    init() {
        this.logInfo('🧩 Component Library initialized', null, 'COMPONENT_INIT');
        this.registerCoreComponents();
        this.loadComponentStyles();
    }

    // 日志记录辅助方法
    logInfo(message, data = null, tag = 'COMPONENT') {
        if (window.APP_DEBUG && window.APP_DEBUG.logger) {
            window.APP_DEBUG.logger.info(message, data, tag);
        } else {
            console.log(message, data);
        }
    }

    logWarn(message, data = null, tag = 'COMPONENT') {
        if (window.APP_DEBUG && window.APP_DEBUG.logger) {
            window.APP_DEBUG.logger.warn(message, data, tag);
        } else {
            console.warn(message, data);
        }
    }

    logError(message, error = null, tag = 'COMPONENT_ERROR') {
        if (window.APP_DEBUG && window.APP_DEBUG.logger) {
            window.APP_DEBUG.logger.error(message, error, tag);
        } else {
            console.error(message, error);
        }
    }

    /**
     * 注册核心组件
     */
    registerCoreComponents() {
        // 注册所有组件类
        this.register('ButtonComponent', ButtonComponent);
        this.register('CardComponent', CardComponent);
        this.register('ModalComponent', ModalComponent);
        this.register('NotificationComponent', NotificationComponent);
        this.register('TabsComponent', TabsComponent);
        this.register('DropdownComponent', DropdownComponent);

        this.logInfo(`✅ Registered ${this.components.size} core components`);
    }

    /**
     * 注册组件
     * @param {string} name - 组件名称
     * @param {Class} componentClass - 组件类
     */
    register(name, componentClass) {
        if (!this.isValidComponent(componentClass)) {
            this.logWarn(`❌ Invalid component class: ${name}`);
            return false;
        }

        this.components.set(name, componentClass);
        this.logInfo(`📝 Registered component: ${name}`);
        return true;
    }

    /**
     * 验证组件类
     * @param {Class} componentClass - 组件类
     * @returns {boolean} 是否有效
     */
    isValidComponent(componentClass) {
        return (
            typeof componentClass === 'function' &&
            typeof componentClass.prototype.render === 'function' &&
            typeof componentClass.prototype.destroy === 'function'
        );
    }

    /**
     * 创建组件实例
     * @param {string} name - 组件名称
     * @param {HTMLElement} container - 容器元素
     * @param {Object} config - 配置选项
     * @returns {Object|null} 组件实例
     */
    create(name, container, config = {}) {
        const ComponentClass = this.components.get(name);
        if (!ComponentClass) {
            this.logError(`❌ Component not found: ${name}`);
            return null;
        }

        if (!container || !(container instanceof HTMLElement)) {
            this.logError(`❌ Invalid container for component: ${name}`);
            return null;
        }

        try {
            // 创建组件实例
            const instance = new ComponentClass(container, config);

            // 生成唯一ID
            const instanceId = this.generateInstanceId(name);

            // 存储实例
            this.componentInstances.set(instanceId, instance);

            // 设置实例ID
            instance.id = instanceId;
            instance.name = name;

            // 渲染组件
            const element = instance.render();
            if (element) {
                container.appendChild(element);
                instance.mounted();
            }

            this.logInfo(`🎨 Created component: ${name} (${instanceId})`);
            return instance;

        } catch (error) {
            this.logError(`❌ Failed to create component ${name}:`, error);
            return null;
        }
    }

    /**
     * 销毁组件实例
     * @param {string} instanceId - 实例ID
     * @returns {boolean} 是否成功
     */
    destroy(instanceId) {
        const instance = this.componentInstances.get(instanceId);
        if (!instance) {
            this.logWarn(`⚠️ Component instance not found: ${instanceId}`);
            return false;
        }

        try {
            // 调用组件的销毁方法
            if (typeof instance.destroy === 'function') {
                instance.destroy();
            }

            // 移除DOM元素
            if (instance.element && instance.element.parentNode) {
                instance.element.parentNode.removeChild(instance.element);
            }

            // 清理事件监听器
            this.cleanupInstanceEvents(instanceId);

            // 从存储中移除
            this.componentInstances.delete(instanceId);

            this.logInfo(`🗑️ Destroyed component: ${instanceId}`);
            return true;

        } catch (error) {
            this.logError(`❌ Failed to destroy component ${instanceId}:`, error);
            return false;
        }
    }

    /**
     * 根据选择器销毁组件
     * @param {string} selector - CSS选择器
     * @returns {number} 销毁的组件数量
     */
    destroyBySelector(selector) {
        const container = document.querySelector(selector);
        if (!container) return 0;

        let destroyedCount = 0;
        this.componentInstances.forEach((instance, instanceId) => {
            if (instance.container === container ||
                (instance.element && container.contains(instance.element))) {
                if (this.destroy(instanceId)) {
                    destroyedCount++;
                }
            }
        });

        return destroyedCount;
    }

    /**
     * 获取组件实例
     * @param {string} instanceId - 实例ID
     * @returns {Object|null} 组件实例
     */
    getInstance(instanceId) {
        return this.componentInstances.get(instanceId) || null;
    }

    /**
     * 根据名称获取所有组件实例
     * @param {string} name - 组件名称
     * @returns {Array} 组件实例数组
     */
    getInstancesByName(name) {
        const instances = [];
        this.componentInstances.forEach((instance, instanceId) => {
            if (instance.name === name) {
                instances.push(instance);
            }
        });
        return instances;
    }

    /**
     * 生成实例ID
     * @param {string} name - 组件名称
     * @returns {string} 实例ID
     */
    generateInstanceId(name) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${name}_${timestamp}_${random}`;
    }

    /**
     * 清理实例事件监听器
     * @param {string} instanceId - 实例ID
     */
    cleanupInstanceEvents(instanceId) {
        const events = this.eventListeners.get(instanceId);
        if (events) {
            events.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners.delete(instanceId);
        }
    }

    /**
     * 添加事件监听器
     * @param {string} instanceId - 实例ID
     * @param {HTMLElement} element - 元素
     * @param {string} event - 事件类型
     * @param {Function} handler - 事件处理函数
     */
    addEventListener(instanceId, element, event, handler) {
        if (!this.eventListeners.has(instanceId)) {
            this.eventListeners.set(instanceId, []);
        }

        element.addEventListener(event, handler);
        this.eventListeners.get(instanceId).push({ element, event, handler });
    }

    /**
     * 加载组件样式
     */
    loadComponentStyles() {
        const styleId = 'component-library-styles';

        // 检查是否已加载
        if (document.getElementById(styleId)) {
            return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.getComponentStyles();
        document.head.appendChild(style);

        this.logInfo('🎨 Component library styles loaded');
    }

    /**
     * 获取组件库样式
     * @returns {string} CSS样式
     */
    getComponentStyles() {
        return `
            /* 组件库基础样式 */
            .component {
                box-sizing: border-box;
                font-family: inherit;
            }

            /* 按钮组件样式 */
            .component-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--primary);
                border-radius: var(--radius-md);
                background: var(--primary);
                color: var(--white);
                font-size: var(--font-size-base);
                font-weight: 500;
                cursor: pointer;
                transition: all var(--transition-base);
                text-decoration: none;
                gap: var(--spacing-xs);
            }

            .component-button:hover {
                background: var(--primary-dark);
                border-color: var(--primary-dark);
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }

            .component-button:active {
                transform: translateY(0);
            }

            .component-button.secondary {
                background: transparent;
                color: var(--primary);
            }

            .component-button.secondary:hover {
                background: var(--primary);
                color: var(--white);
            }

            .component-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            /* 卡片组件样式 */
            .component-card {
                background: var(--card-bg);
                border: 1px solid var(--border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                box-shadow: var(--shadow-sm);
                transition: all var(--transition-base);
            }

            .component-card:hover {
                box-shadow: var(--shadow-md);
                transform: translateY(-2px);
            }

            .component-card-header {
                margin-bottom: var(--spacing-md);
                padding-bottom: var(--spacing-md);
                border-bottom: 1px solid var(--border);
            }

            .component-card-title {
                font-size: var(--font-size-lg);
                font-weight: 600;
                color: var(--text);
                margin: 0;
            }

            .component-card-content {
                color: var(--text-secondary);
                line-height: 1.6;
            }

            /* 模态框组件样式 */
            .component-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: var(--z-modal);
                opacity: 0;
                visibility: hidden;
                transition: all var(--transition-base);
            }

            .component-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .component-modal {
                background: var(--background);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow: auto;
                transform: scale(0.9);
                transition: transform var(--transition-base);
            }

            .component-modal-overlay.active .component-modal {
                transform: scale(1);
            }

            .component-modal-header {
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--border);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .component-modal-title {
                font-size: var(--font-size-lg);
                font-weight: 600;
                margin: 0;
            }

            .component-modal-close {
                background: none;
                border: none;
                font-size: var(--font-size-xl);
                cursor: pointer;
                color: var(--text-secondary);
                padding: var(--spacing-xs);
                border-radius: var(--radius-md);
                transition: all var(--transition-fast);
            }

            .component-modal-close:hover {
                background: var(--border);
                color: var(--text);
            }

            .component-modal-body {
                padding: var(--spacing-lg);
            }

            .component-modal-footer {
                padding: var(--spacing-lg);
                border-top: 1px solid var(--border);
                display: flex;
                gap: var(--spacing-md);
                justify-content: flex-end;
            }

            /* 通知组件样式 */
            .component-notification {
                position: fixed;
                top: var(--spacing-lg);
                right: var(--spacing-lg);
                background: var(--background);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                box-shadow: var(--shadow-lg);
                z-index: var(--z-notification);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                min-width: 300px;
                transform: translateX(100%);
                transition: transform var(--transition-base);
            }

            .component-notification.show {
                transform: translateX(0);
            }

            .component-notification.success {
                border-left: 4px solid var(--success);
            }

            .component-notification.error {
                border-left: 4px solid var(--danger);
            }

            .component-notification.warning {
                border-left: 4px solid var(--warning);
            }

            .component-notification.info {
                border-left: 4px solid var(--info);
            }

            .component-notification-icon {
                font-size: var(--font-size-lg);
            }

            .component-notification-content {
                flex: 1;
            }

            .component-notification-title {
                font-weight: 600;
                margin-bottom: var(--spacing-xs);
            }

            .component-notification-message {
                font-size: var(--font-size-sm);
                color: var(--text-secondary);
            }

            .component-notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--text-secondary);
                padding: var(--spacing-xs);
                border-radius: var(--radius-sm);
            }

            /* 标签页组件样式 */
            .component-tabs {
                width: 100%;
            }

            .component-tabs-nav {
                display: flex;
                border-bottom: 1px solid var(--border);
                gap: var(--spacing-md);
            }

            .component-tabs-tab {
                padding: var(--spacing-md) var(--spacing-lg);
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                cursor: pointer;
                transition: all var(--transition-base);
                color: var(--text-secondary);
                font-weight: 500;
            }

            .component-tabs-tab:hover {
                color: var(--text);
                background: var(--border);
            }

            .component-tabs-tab.active {
                color: var(--primary);
                border-bottom-color: var(--primary);
            }

            .component-tabs-content {
                padding: var(--spacing-lg);
            }

            .component-tabs-panel {
                display: none;
            }

            .component-tabs-panel.active {
                display: block;
            }

            /* 下拉菜单组件样式 */
            .component-dropdown {
                position: relative;
                display: inline-block;
            }

            .component-dropdown-toggle {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                background: var(--background);
                color: var(--text);
                cursor: pointer;
                transition: all var(--transition-base);
            }

            .component-dropdown-toggle:hover {
                border-color: var(--primary);
            }

            .component-dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                min-width: 200px;
                background: var(--background);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-lg);
                z-index: var(--z-dropdown);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-5px);
                transition: all var(--transition-base);
            }

            .component-dropdown.open .component-dropdown-menu {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .component-dropdown-item {
                display: block;
                padding: var(--spacing-sm) var(--spacing-md);
                border: none;
                background: none;
                color: var(--text);
                cursor: pointer;
                transition: all var(--transition-fast);
                width: 100%;
                text-align: left;
            }

            .component-dropdown-item:hover {
                background: var(--border);
                color: var(--primary);
            }

            /* 加载器组件样式 */
            .component-loader {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-sm);
                color: var(--text-secondary);
            }

            .component-loader-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid var(--border);
                border-top-color: var(--primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .component-loader-text {
                font-size: var(--font-size-sm);
            }

            /* 表单组件样式 */
            .component-form {
                width: 100%;
            }

            .component-form-group {
                margin-bottom: var(--spacing-md);
            }

            .component-form-label {
                display: block;
                margin-bottom: var(--spacing-xs);
                font-weight: 500;
                color: var(--text);
            }

            .component-form-input {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                background: var(--background);
                color: var(--text);
                font-size: var(--font-size-base);
                transition: all var(--transition-base);
            }

            .component-form-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
            }

            .component-form-input.error {
                border-color: var(--danger);
            }

            .component-form-error {
                color: var(--danger);
                font-size: var(--font-size-sm);
                margin-top: var(--spacing-xs);
            }

            .component-form-help {
                color: var(--text-secondary);
                font-size: var(--font-size-sm);
                margin-top: var(--spacing-xs);
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .component-modal {
                    width: 95%;
                    margin: var(--spacing-md);
                }

                .component-notification {
                    right: var(--spacing-md);
                    left: var(--spacing-md);
                    min-width: auto;
                }

                .component-tabs-nav {
                    overflow-x: auto;
                    white-space: nowrap;
                }

                .component-dropdown-menu {
                    position: fixed;
                    top: auto;
                    bottom: var(--spacing-md);
                    left: var(--spacing-md) !important;
                    right: var(--spacing-md);
                    width: auto;
                }
            }

            /* 主题适配 */
            [data-theme="dark"] .component-card {
                background: var(--theme-card-bg);
                border-color: var(--theme-border);
            }

            [data-theme="dark"] .component-modal {
                background: var(--theme-card-bg);
                border-color: var(--theme-border);
            }

            [data-theme="dark"] .component-notification {
                background: var(--theme-card-bg);
                border-color: var(--theme-border);
            }

            [data-theme="dark"] .component-dropdown-menu {
                background: var(--theme-card-bg);
                border-color: var(--theme-border);
            }

            /* 减少动画模式 */
            @media (prefers-reduced-motion: reduce) {
                .component-button,
                .component-card,
                .component-modal-overlay,
                .component-modal,
                .component-notification,
                .component-tabs-tab,
                .component-dropdown-menu,
                .component-loader-spinner {
                    transition: none;
                    animation: none;
                }
            }

            /* 高对比度模式 */
            @media (prefers-contrast: high) {
                .component-button {
                    border-width: 2px;
                }

                .component-card {
                    border-width: 2px;
                }

                .component-modal {
                    border-width: 2px;
                }
            }
        `;
    }

    /**
     * 获取组件库统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            registeredComponents: this.components.size,
            activeInstances: this.componentInstances.size,
            eventListeners: Array.from(this.eventListeners.values())
                .reduce((total, events) => total + events.length, 0)
        };
    }

    /**
     * 销毁所有组件实例
     */
    destroyAll() {
        const instanceIds = Array.from(this.componentInstances.keys());
        instanceIds.forEach(id => this.destroy(id));
        this.logInfo(`🗑️ Destroyed all ${instanceIds.length} component instances`);
    }
}

/**
 * 基础组件类
 */
class BaseComponent {
    constructor(container, config = {}) {
        this.container = container;
        this.config = { ...this.getDefaultConfig(), ...config };
        this.element = null;
        this.isDestroyed = false;
        this.eventListeners = [];
    }

    /**
     * 获取默认配置
     * @returns {Object} 默认配置
     */
    getDefaultConfig() {
        return {};
    }

    /**
     * 渲染组件 - 子类必须实现
     * @returns {HTMLElement} 组件元素
     */
    render() {
        throw new Error('render() method must be implemented by component class');
    }

    /**
     * 组件挂载后调用
     */
    mounted() {
        // 子类可以重写此方法
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.cleanupEventListeners();
        this.isDestroyed = true;
    }

    /**
     * 添加事件监听器
     * @param {HTMLElement} element - 元素
     * @param {string} event - 事件类型
     * @param {Function} handler - 处理函数
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * 清理事件监听器
     */
    cleanupEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    /**
     * 触发自定义事件
     * @param {string} eventName - 事件名称
     * @param {Object} detail - 事件详情
     */
    trigger(eventName, detail = {}) {
        if (this.element) {
            this.element.dispatchEvent(new CustomEvent(eventName, {
                detail: { component: this, ...detail }
            }));
        }
    }

    /**
     * 安全地创建元素
     * @param {string} tagName - 标签名
     * @param {Object} attributes - 属性
     * @param {string|HTMLElement[]} children - 子元素
     * @returns {HTMLElement} 元素
     */
    createElement(tagName, attributes = {}, children = []) {
        const element = document.createElement(tagName);

        // 设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('data-') || key.startsWith('aria-')) {
                element.setAttribute(key, value);
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element[key] = value;
            }
        });

        // 添加子元素
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        }

        return element;
    }
}

/**
 * 按钮组件
 */
class ButtonComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            text: '按钮',
            variant: 'primary', // primary, secondary, outline, danger
            size: 'medium', // small, medium, large
            disabled: false,
            loading: false,
            icon: null,
            onClick: null
        };
    }

    render() {
        const button = this.createElement('button', {
            className: `btn btn-${this.config.variant} btn-${this.config.size}`,
            disabled: this.config.disabled || this.config.loading
        }, [
            this.config.loading ? this.createLoadingSpinner() : this.config.icon,
            this.config.text
        ]);

        if (this.config.onClick) {
            this.addEventListener(button, 'click', (e) => {
                if (!this.config.disabled && !this.config.loading) {
                    this.config.onClick(e);
                }
            });
        }

        this.element = button;
        return button;
    }

    createLoadingSpinner() {
        return this.createElement('span', { className: 'btn-spinner' });
    }

    setText(text) {
        this.config.text = text;
        if (this.element) {
            this.element.textContent = text;
        }
    }

    setDisabled(disabled) {
        this.config.disabled = disabled;
        if (this.element) {
            this.element.disabled = disabled;
        }
    }

    setLoading(loading) {
        this.config.loading = loading;
        this.render(); // 重新渲染以显示/隐藏加载状态
    }
}

/**
 * 卡片组件
 */
class CardComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            title: null,
            subtitle: null,
            content: '',
            image: null,
            actions: [],
            variant: 'default', // default, elevated, outlined
            clickable: false,
            onClick: null
        };
    }

    render() {
        const card = this.createElement('div', {
            className: `card card-${this.config.variant}`
        });

        // 图片区域
        if (this.config.image) {
            const imageContainer = this.createElement('div', { className: 'card-image' });
            const img = this.createElement('img', {
                src: this.config.image.src,
                alt: this.config.image.alt || ''
            });
            imageContainer.appendChild(img);
            card.appendChild(imageContainer);
        }

        // 内容区域
        const content = this.createElement('div', { className: 'card-content' });

        // 标题
        if (this.config.title) {
            const title = this.createElement('h3', { className: 'card-title' }, this.config.title);
            content.appendChild(title);
        }

        // 副标题
        if (this.config.subtitle) {
            const subtitle = this.createElement('h4', { className: 'card-subtitle' }, this.config.subtitle);
            content.appendChild(subtitle);
        }

        // 正文内容
        const body = this.createElement('div', { className: 'card-body' }, this.config.content);
        content.appendChild(body);

        card.appendChild(content);

        // 操作区域
        if (this.config.actions.length > 0) {
            const actionsContainer = this.createElement('div', { className: 'card-actions' });
            this.config.actions.forEach(action => {
                const button = new ButtonComponent(actionsContainer, {
                    text: action.text,
                    variant: action.variant || 'primary',
                    onClick: action.onClick
                });
                actionsContainer.appendChild(button.render());
            });
            card.appendChild(actionsContainer);
        }

        // 点击事件
        if (this.config.clickable && this.config.onClick) {
            this.addEventListener(card, 'click', this.config.onClick);
            card.style.cursor = 'pointer';
        }

        this.element = card;
        return card;
    }

    setTitle(title) {
        this.config.title = title;
        const titleElement = this.element?.querySelector('.card-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    setContent(content) {
        this.config.content = content;
        const bodyElement = this.element?.querySelector('.card-body');
        if (bodyElement) {
            bodyElement.textContent = content;
        }
    }
}

/**
 * 模态框组件
 */
class ModalComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            title: '模态框',
            content: '',
            size: 'medium', // small, medium, large, fullscreen
            closable: true,
            backdrop: true,
            keyboard: true, // ESC键关闭
            onOpen: null,
            onClose: null,
            actions: []
        };
    }

    render() {
        // 创建遮罩层
        const backdrop = this.createElement('div', {
            className: 'modal-backdrop',
            style: { display: 'none' }
        });

        // 创建模态框容器
        const modal = this.createElement('div', {
            className: `modal modal-${this.config.size}`
        });

        // 创建模态框内容
        const modalDialog = this.createElement('div', { className: 'modal-dialog' });
        const modalContent = this.createElement('div', { className: 'modal-content' });

        // 头部
        if (this.config.title || this.config.closable) {
            const header = this.createElement('div', { className: 'modal-header' });

            if (this.config.title) {
                const title = this.createElement('h5', { className: 'modal-title' }, this.config.title);
                header.appendChild(title);
            }

            if (this.config.closable) {
                const closeBtn = this.createElement('button', {
                    className: 'modal-close',
                    'aria-label': '关闭'
                }, '×');

                this.addEventListener(closeBtn, 'click', () => this.close());
                header.appendChild(closeBtn);
            }

            modalContent.appendChild(header);
        }

        // 主体内容
        const body = this.createElement('div', { className: 'modal-body' }, this.config.content);
        modalContent.appendChild(body);

        // 底部操作
        if (this.config.actions.length > 0) {
            const footer = this.createElement('div', { className: 'modal-footer' });
            this.config.actions.forEach(action => {
                const button = new ButtonComponent(footer, {
                    text: action.text,
                    variant: action.variant || 'primary',
                    onClick: () => {
                        if (action.onClick) {
                            action.onClick();
                        }
                        if (action.autoClose !== false) {
                            this.close();
                        }
                    }
                });
                footer.appendChild(button.render());
            });
            modalContent.appendChild(footer);
        }

        modalDialog.appendChild(modalContent);
        modal.appendChild(modalDialog);
        backdrop.appendChild(modal);

        // 点击背景关闭
        if (this.config.backdrop) {
            this.addEventListener(backdrop, 'click', (e) => {
                if (e.target === backdrop) {
                    this.close();
                }
            });
        }

        // ESC键关闭
        if (this.config.keyboard) {
            this.addEventListener(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this.isVisible()) {
                    this.close();
                }
            });
        }

        this.backdrop = backdrop;
        this.element = backdrop;
        return backdrop;
    }

    open() {
        if (this.element) {
            this.element.style.display = 'flex';
            document.body.appendChild(this.element);
            document.body.style.overflow = 'hidden';

            if (this.config.onOpen) {
                this.config.onOpen();
            }

            this.trigger('open');
        }
    }

    close() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            document.body.style.overflow = '';

            if (this.config.onClose) {
                this.config.onClose();
            }

            this.trigger('close');
        }
    }

    isVisible() {
        return this.element && this.element.style.display === 'flex';
    }

    setTitle(title) {
        this.config.title = title;
        const titleElement = this.element?.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    setContent(content) {
        this.config.content = content;
        const bodyElement = this.element?.querySelector('.modal-body');
        if (bodyElement) {
            bodyElement.textContent = content;
        }
    }
}

/**
 * 通知组件
 */
class NotificationComponent extends BaseComponent {
    static notifications = [];

    getDefaultConfig() {
        return {
            type: 'info', // success, error, warning, info
            title: null,
            message: '',
            duration: 5000, // 0表示不自动关闭
            closable: true,
            position: 'top-right', // top-left, top-right, bottom-left, bottom-right
            onClose: null
        };
    }

    render() {
        const notification = this.createElement('div', {
            className: `notification notification-${this.config.type}`
        });

        // 图标
        const icon = this.createElement('span', { className: 'notification-icon' });
        icon.textContent = this.getIconForType();
        notification.appendChild(icon);

        // 内容
        const content = this.createElement('div', { className: 'notification-content' });

        if (this.config.title) {
            const title = this.createElement('div', { className: 'notification-title' }, this.config.title);
            content.appendChild(title);
        }

        const message = this.createElement('div', { className: 'notification-message' }, this.config.message);
        content.appendChild(message);

        notification.appendChild(content);

        // 关闭按钮
        if (this.config.closable) {
            const closeBtn = this.createElement('button', { className: 'notification-close' }, '×');
            this.addEventListener(closeBtn, 'click', () => this.close());
            notification.appendChild(closeBtn);
        }

        this.element = notification;
        return notification;
    }

    getIconForType() {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[this.config.type] || icons.info;
    }

    show() {
        const container = this.getOrCreateContainer();
        container.appendChild(this.element);

        // 添加到管理列表
        NotificationComponent.notifications.push(this);

        // 自动关闭
        if (this.config.duration > 0) {
            setTimeout(() => this.close(), this.config.duration);
        }

        // 触发显示动画
        requestAnimationFrame(() => {
            this.element.classList.add('notification-show');
        });

        this.trigger('show');
    }

    close() {
        if (this.element && this.element.parentNode) {
            this.element.classList.add('notification-hide');

            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }

                // 从管理列表中移除
                const index = NotificationComponent.notifications.indexOf(this);
                if (index > -1) {
                    NotificationComponent.notifications.splice(index, 1);
                }

                if (this.config.onClose) {
                    this.config.onClose();
                }

                this.trigger('close');
            }, 300);
        }
    }

    getOrCreateContainer() {
        let container = document.querySelector(`.notification-container-${this.config.position}`);
        if (!container) {
            container = this.createElement('div', {
                className: `notification-container notification-container-${this.config.position}`
            });
            document.body.appendChild(container);
        }
        return container;
    }

    // 静态方法：创建并显示通知
    static show(config) {
        const container = document.createElement('div');
        const notification = new NotificationComponent(container, config);
        notification.show();
        return notification;
    }

    // 静态方法：关闭所有通知
    static closeAll() {
        NotificationComponent.notifications.forEach(notification => {
            notification.close();
        });
    }
}

/**
 * 标签页组件
 */
class TabsComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            tabs: [],
            activeTab: 0,
            variant: 'default', // default, pills, vertical
            onTabChange: null
        };
    }

    render() {
        const container = this.createElement('div', {
            className: `tabs tabs-${this.config.variant}`
        });

        // 创建标签导航
        const nav = this.createElement('div', { className: 'tabs-nav' });
        this.config.tabs.forEach((tab, index) => {
            const tabButton = this.createElement('button', {
                className: `tabs-tab ${index === this.config.activeTab ? 'active' : ''}`,
                'data-tab': index
            }, tab.title);

            this.addEventListener(tabButton, 'click', () => {
                this.setActiveTab(index);
            });

            nav.appendChild(tabButton);
        });

        // 创建标签内容
        const content = this.createElement('div', { className: 'tabs-content' });
        this.config.tabs.forEach((tab, index) => {
            const tabPanel = this.createElement('div', {
                className: `tabs-panel ${index === this.config.activeTab ? 'active' : ''}`,
                'data-panel': index,
                style: { display: index === this.config.activeTab ? 'block' : 'none' }
            }, tab.content);

            content.appendChild(tabPanel);
        });

        container.appendChild(nav);
        container.appendChild(content);
        this.element = container;
        return container;
    }

    setActiveTab(index) {
        if (index < 0 || index >= this.config.tabs.length) {
            return;
        }

        // 更新配置
        const previousTab = this.config.activeTab;
        this.config.activeTab = index;

        // 更新导航状态
        const tabButtons = this.element.querySelectorAll('.tabs-tab');
        tabButtons.forEach((button, i) => {
            button.classList.toggle('active', i === index);
        });

        // 更新内容显示
        const panels = this.element.querySelectorAll('.tabs-panel');
        panels.forEach((panel, i) => {
            panel.classList.toggle('active', i === index);
            panel.style.display = i === index ? 'block' : 'none';
        });

        // 触发回调
        if (this.config.onTabChange) {
            this.config.onTabChange(index, previousTab);
        }

        this.trigger('tabChange', { activeTab: index, previousTab });
    }

    addTab(tab) {
        this.config.tabs.push(tab);
        this.render(); // 重新渲染
    }

    removeTab(index) {
        if (index >= 0 && index < this.config.tabs.length) {
            this.config.tabs.splice(index, 1);

            // 如果删除的是当前激活的标签，切换到第一个标签
            if (this.config.activeTab === index && this.config.tabs.length > 0) {
                this.config.activeTab = 0;
            } else if (this.config.activeTab > index) {
                this.config.activeTab--;
            }

            this.render(); // 重新渲染
        }
    }
}

/**
 * 下拉菜单组件
 */
class DropdownComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            trigger: '点击菜单', // 可以是文本或HTML元素
            items: [], // [{ text: '选项', value: 'value', onClick: function }]
            position: 'bottom-left', // bottom-left, bottom-right, top-left, top-right
            triggerType: 'click', // click, hover
            closeOnSelect: true,
            searchable: false
        };
    }

    render() {
        const container = this.createElement('div', {
            className: 'dropdown'
        });

        // 创建触发器
        const trigger = this.createElement('button', {
            className: 'dropdown-trigger'
        }, this.config.trigger);

        // 创建菜单
        const menu = this.createElement('div', {
            className: `dropdown-menu dropdown-${this.config.position}`,
            style: { display: 'none' }
        });

        // 搜索框
        if (this.config.searchable) {
            const searchInput = this.createElement('input', {
                type: 'text',
                className: 'dropdown-search',
                placeholder: '搜索...'
            });

            this.addEventListener(searchInput, 'input', (e) => {
                this.filterItems(e.target.value);
            });

            menu.appendChild(searchInput);
        }

        // 菜单项容器
        const itemsContainer = this.createElement('div', { className: 'dropdown-items' });

        this.config.items.forEach((item, index) => {
            const menuItem = this.createElement('button', {
                className: 'dropdown-item',
                'data-value': item.value,
                'data-index': index
            }, item.text);

            this.addEventListener(menuItem, 'click', (e) => {
                e.preventDefault();
                if (item.onClick) {
                    item.onClick(item);
                }

                if (this.config.closeOnSelect) {
                    this.close();
                }

                this.trigger('select', { item, index });
            });

            itemsContainer.appendChild(menuItem);
        });

        menu.appendChild(itemsContainer);
        container.appendChild(trigger);
        container.appendChild(menu);

        // 事件处理
        if (this.config.triggerType === 'click') {
            this.addEventListener(trigger, 'click', () => this.toggle());
            this.addEventListener(document, 'click', (e) => {
                if (!container.contains(e.target)) {
                    this.close();
                }
            });
        } else if (this.config.triggerType === 'hover') {
            this.addEventListener(container, 'mouseenter', () => this.open());
            this.addEventListener(container, 'mouseleave', () => this.close());
        }

        // 键盘支持
        this.addEventListener(trigger, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        this.trigger = trigger;
        this.menu = menu;
        this.itemsContainer = itemsContainer;
        this.element = container;
        return container;
    }

    toggle() {
        if (this.menu.style.display === 'none') {
            this.open();
        } else {
            this.close();
        }
    }

    open() {
        this.menu.style.display = 'block';
        this.trigger.setAttribute('aria-expanded', 'true');
        this.trigger.classList.add('active');

        // 定位菜单
        this.positionMenu();

        this.trigger('open');
    }

    close() {
        this.menu.style.display = 'none';
        this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.classList.remove('active');

        this.trigger('close');
    }

    positionMenu() {
        const triggerRect = this.trigger.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();

        // 根据位置类型设置菜单位置
        if (this.config.position.includes('bottom')) {
            this.menu.style.top = `${triggerRect.height}px`;
        } else {
            this.menu.style.top = `-${menuRect.height}px`;
        }

        if (this.config.position.includes('right')) {
            this.menu.style.right = '0';
        } else {
            this.menu.style.left = '0';
        }
    }

    filterItems(searchTerm) {
        const items = this.itemsContainer.querySelectorAll('.dropdown-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    addItem(item) {
        this.config.items.push(item);
        this.render(); // 重新渲染
    }

    removeItem(index) {
        if (index >= 0 && index < this.config.items.length) {
            this.config.items.splice(index, 1);
            this.render(); // 重新渲染
        }
    }
}

// 自动初始化组件库
let componentLibrary;

setTimeout(() => {
    componentLibrary = new ComponentLibrary();
    window.componentLibrary = componentLibrary;
    window.logInfo('✅ Component Library ready');
}, 100);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComponentLibrary, BaseComponent };
}

// 导出到全局作用域（用于浏览器环境）
if (typeof window !== 'undefined') {
    window.ComponentLibrary = ComponentLibrary;
    window.BaseComponent = BaseComponent;
    // Component classes are now implemented
    window.ButtonComponent = ButtonComponent;
    window.CardComponent = CardComponent;
    window.ModalComponent = ModalComponent;
    window.NotificationComponent = NotificationComponent;
    window.TabsComponent = TabsComponent;
    window.DropdownComponent = DropdownComponent;
}