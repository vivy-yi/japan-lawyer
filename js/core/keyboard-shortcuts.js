/**
 * Keyboard Shortcuts Manager - 键盘快捷键管理器
 * 提供全局键盘快捷键支持，提升用户操作效率
 * 完全安全的DOM操作，避免XSS攻击
 */

class KeyboardShortcutsManager {
    constructor(config = {}) {
        this.config = {
            enableHelp: true,
            preventDefault: true,
            allowInputInFields: true,
            ...config
        };

        this.shortcuts = new Map();
        this.helpVisible = false;
        this.helpOverlay = null;
        this.active = false;

        this.init();
    }

    init() {
        this.setupDefaultShortcuts();
        this.bindEvents();
        window.logInfo('⌨️ Keyboard Shortcuts Manager initialized');
    }

    setupDefaultShortcuts() {
        // 导航快捷键
        this.addShortcut(['alt', 'h'], 'goHome', '回到首页');
        this.addShortcut(['alt', 'n'], 'toggleNavigation', '切换导航');
        this.addShortcut(['alt', 's'], 'focusSearch', '搜索');
        this.addShortcut(['alt', 't'], 'toggleTheme', '切换主题');
        this.addShortcut(['alt', 'g'], 'toggleSettings', '用户设置');

        // 页面操作
        this.addShortcut(['ctrl', '/'], 'showHelp', '显示快捷键帮助');
        this.addShortcut(['escape'], 'closeModal', '关闭弹窗');
        this.addShortcut(['ctrl', 'r'], 'refreshPage', '刷新页面');
        this.addShortcut(['ctrl', 'p'], 'printPage', '打印页面');

        // 功能切换
        this.addShortcut(['alt', 'd'], 'toggleDevTools', '开发工具');
        this.addShortcut(['alt', 'l'], 'switchLanguage', '切换语言');
        this.addShortcut(['alt', 'f'], 'toggleFullscreen', '全屏切换');

        // 开发者专用
        this.addShortcut(['ctrl', 'shift', 'd'], 'debugMode', '调试模式');
        this.addShortcut(['ctrl', 'shift', 'c'], 'clearCache', '清除缓存');
    }

    addShortcut(keys, callback, description = '') {
        const key = this.normalizeKeys(keys);
        this.shortcuts.set(key, {
            keys,
            callback: callback,
            description,
            category: this.getCategory(callback)
        });
    }

    normalizeKeys(keys) {
        return keys.sort().join('+').toLowerCase();
    }

    getCategory(callback) {
        const categories = {
            goHome: 'navigation',
            toggleNavigation: 'navigation',
            focusSearch: 'navigation',
            toggleTheme: 'appearance',
            toggleSettings: 'settings',
            showHelp: 'help',
            closeModal: 'interaction',
            refreshPage: 'page',
            printPage: 'page',
            toggleDevTools: 'development',
            switchLanguage: 'language',
            toggleFullscreen: 'display',
            debugMode: 'development',
            clearCache: 'development'
        };
        return categories[callback] || 'general';
    }

    bindEvents() {
        document.addEventListener('keydown', (event) => {
            if (!this.active) return;

            // 如果焦点在输入框中，跳过某些快捷键
            if (this.config.allowInputInFields && this.isInputElement(event.target)) {
                const allowedInInput = ['escape', 'ctrl+/'];
                if (!allowedInInput.includes(this.getKeyCombo(event))) {
                    return;
                }
            }

            const keyCombo = this.getKeyCombo(event);
            const shortcut = this.shortcuts.get(keyCombo);

            if (shortcut) {
                event.preventDefault();
                event.stopPropagation();
                this.executeShortcut(shortcut);
            }
        });

        // 激活快捷键系统
        setTimeout(() => {
            this.active = true;
        }, 1000);
    }

    isInputElement(element) {
        const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];
        const contentEditable = element.getAttribute('contenteditable') === 'true';
        return inputTags.includes(element.tagName) || contentEditable;
    }

    getKeyCombo(event) {
        const keys = [];
        if (event.ctrlKey) keys.push('ctrl');
        if (event.altKey) keys.push('alt');
        if (event.shiftKey) keys.push('shift');
        if (event.metaKey) keys.push('meta');

        // 添加主键
        let key = event.key.toLowerCase();

        // 特殊键映射
        const keyMap = {
            ' ': 'space',
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right'
        };

        key = keyMap[key] || key;
        keys.push(key);

        return this.normalizeKeys(keys);
    }

    executeShortcut(shortcut) {
        const { callback } = shortcut;

        // 执行预定义的操作
        switch (callback) {
            case 'goHome':
                window.location.href = '/';
                break;
            case 'toggleNavigation':
                this.toggleNavigation();
                break;
            case 'focusSearch':
                this.focusSearchInput();
                break;
            case 'toggleTheme':
                if (window.themeManager) {
                    window.themeManager.toggleTheme();
                    this.showNotification('主题已切换', 'success');
                }
                break;
            case 'toggleSettings':
                this.toggleUserSettings();
                break;
            case 'showHelp':
                this.toggleHelp();
                break;
            case 'closeModal':
                this.closeActiveModal();
                break;
            case 'refreshPage':
                window.location.reload();
                break;
            case 'printPage':
                window.print();
                break;
            case 'toggleDevTools':
                if (window.devTools) {
                    window.devTools.toggle();
                }
                break;
            case 'switchLanguage':
                this.switchLanguage();
                break;
            case 'toggleFullscreen':
                this.toggleFullscreen();
                break;
            case 'debugMode':
                this.toggleDebugMode();
                break;
            case 'clearCache':
                this.clearBrowserCache();
                break;
            default:
                window.logInfo(`Unknown shortcut callback: ${callback}`);
        }

        // 触发自定义事件
        this.dispatchEvent('shortcut:executed', {
            shortcut: shortcut,
            timestamp: Date.now()
        });
    }

    toggleNavigation() {
        const navbar = document.querySelector('#main-navbar');
        if (navbar) {
            const navToggle = navbar.querySelector('.mobile-menu-toggle') ||
                              navbar.querySelector('[data-nav-toggle]');
            if (navToggle) {
                navToggle.click();
            }
        }
    }

    focusSearchInput() {
        const searchInput = document.querySelector('input[type="search"], .search-input, #search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        } else {
            this.showNotification('未找到搜索框', 'warning');
        }
    }

    toggleUserSettings() {
        // 查找用户设置按钮或触发设置面板
        const settingsBtn = document.querySelector('[data-settings-toggle], .settings-btn, #settings-toggle');
        if (settingsBtn) {
            settingsBtn.click();
        } else if (window.componentLibrary) {
            // 创建设置面板
            this.createSettingsPanel();
        }
    }

    createSettingsPanel() {
        const modal = window.componentLibrary.create('modal', document.body, {
            title: '⚙️ 用户设置',
            content: this.createSettingsContent(),
            size: 'large'
        });
        modal.show();
    }

    createSettingsContent() {
        const container = document.createElement('div');

        const shortcutsInfo = document.createElement('div');
        shortcutsInfo.className = 'shortcuts-info';

        const title = document.createElement('h3');
        title.textContent = '⌨️ 键盘快捷键';

        const description = document.createElement('p');
        description.textContent = '按 Ctrl+/ 显示所有快捷键';

        const statusDiv = document.createElement('div');
        statusDiv.className = 'shortcuts-status';

        const statusPara = document.createElement('p');
        statusPara.textContent = '快捷键系统状态: ✅ 已激活';

        statusDiv.appendChild(statusPara);
        shortcutsInfo.appendChild(title);
        shortcutsInfo.appendChild(description);
        shortcutsInfo.appendChild(statusDiv);
        container.appendChild(shortcutsInfo);

        return container;
    }

    closeActiveModal() {
        const activeModal = document.querySelector('.modal-overlay, .component-modal-overlay');
        if (activeModal) {
            activeModal.remove();
        }
    }

    switchLanguage() {
        const currentLang = document.documentElement.lang || 'zh';
        const languages = ['zh', 'en', 'ja'];
        const currentIndex = languages.indexOf(currentLang);
        const nextLang = languages[(currentIndex + 1) % languages.length];

        // 这里可以集成语言切换逻辑
        this.showNotification(`语言切换为: ${nextLang.toUpperCase()}`, 'info');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.showNotification('进入全屏模式', 'info');
        } else {
            document.exitFullscreen();
            this.showNotification('退出全屏模式', 'info');
        }
    }

    toggleDebugMode() {
        const isDebug = document.body.classList.toggle('debug-mode');
        this.showNotification(`调试模式: ${isDebug ? '开启' : '关闭'}`, 'info');

        // 添加调试样式
        if (isDebug) {
            this.addDebugStyles();
        }
    }

    addDebugStyles() {
        const style = document.createElement('style');
        style.id = 'debug-styles';
        style.textContent = `
            .debug-mode * {
                outline: 1px solid rgba(255, 0, 0, 0.3);
            }
            .debug-mode *:hover {
                outline: 2px solid rgba(255, 0, 0, 0.8);
            }
            .debug-mode .debug-info {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 10000;
            }
        `;
        document.head.appendChild(style);
    }

    clearBrowserCache() {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        localStorage.clear();
        sessionStorage.clear();
        this.showNotification('缓存已清除', 'success');
        setTimeout(() => window.location.reload(), 1000);
    }

    toggleHelp() {
        if (this.helpVisible) {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }

    showHelp() {
        if (this.helpOverlay) return;

        this.helpOverlay = this.createHelpOverlay();
        document.body.appendChild(this.helpOverlay);
        this.helpVisible = true;

        // 绑定关闭事件
        this.helpOverlay.addEventListener('click', (e) => {
            if (e.target === this.helpOverlay) {
                this.hideHelp();
            }
        });

        this.escapeKeyListener = (e) => {
            if (e.key === 'Escape') {
                this.hideHelp();
            }
        };
        document.addEventListener('keydown', this.escapeKeyListener);
    }

    hideHelp() {
        if (this.helpOverlay) {
            this.helpOverlay.remove();
            this.helpOverlay = null;
        }
        this.helpVisible = false;
        if (this.escapeKeyListener) {
            document.removeEventListener('keydown', this.escapeKeyListener);
        }
    }

    createHelpOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'shortcuts-help-overlay';
        this.applyOverlayStyles(overlay);

        const content = this.createHelpContent();
        overlay.appendChild(content);

        return overlay;
    }

    applyOverlayStyles(overlay) {
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
    }

    createHelpContent() {
        const content = document.createElement('div');
        this.applyContentStyles(content);

        // 标题区域
        const header = this.createHelpHeader();
        content.appendChild(header);

        // 快捷键列表
        const categories = this.groupShortcutsByCategory();
        for (const [category, shortcuts] of Object.entries(categories)) {
            const categorySection = this.createCategorySection(category, shortcuts);
            content.appendChild(categorySection);
        }

        // 底部说明
        const footer = this.createHelpFooter();
        content.appendChild(footer);

        return content;
    }

    applyContentStyles(content) {
        content.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
    }

    createHelpHeader() {
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;';

        const title = document.createElement('h2');
        title.textContent = '⌨️ 键盘快捷键';
        title.style.cssText = 'margin: 0; color: #1e3a5f;';

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 0;
            width: 30px;
            height: 30px;
        `;
        closeButton.addEventListener('click', () => this.hideHelp());

        header.appendChild(title);
        header.appendChild(closeButton);
        return header;
    }

    createCategorySection(category, shortcuts) {
        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 20px;';

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = this.getCategoryLabel(category);
        categoryTitle.style.cssText = `
            margin: 0 0 10px 0;
            color: #1e3a5f;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;

        const shortcutsList = document.createElement('div');
        shortcutsList.style.cssText = 'display: grid; gap: 8px;';

        shortcuts.forEach(shortcut => {
            const shortcutItem = this.createShortcutItem(shortcut);
            shortcutsList.appendChild(shortcutItem);
        });

        section.appendChild(categoryTitle);
        section.appendChild(shortcutsList);
        return section;
    }

    createShortcutItem(shortcut) {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 6px;
        `;

        const description = document.createElement('span');
        description.textContent = shortcut.description;
        description.style.cssText = 'color: #333; font-size: 14px;';

        const keys = document.createElement('kbd');
        keys.textContent = this.formatKeys(shortcut.keys);
        keys.style.cssText = `
            background: #e9ecef;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 4px 8px;
            font-family: monospace;
            font-size: 12px;
            color: #495057;
        `;

        item.appendChild(description);
        item.appendChild(keys);
        return item;
    }

    createHelpFooter() {
        const footer = document.createElement('div');
        footer.style.cssText = `
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
        `;

        const footerText = document.createElement('p');
        footerText.textContent = '按 ESC 或点击外部区域关闭';
        footerText.style.cssText = 'margin: 0; color: #666; font-size: 14px;';

        footer.appendChild(footerText);
        return footer;
    }

    groupShortcutsByCategory() {
        const grouped = {};

        this.shortcuts.forEach(shortcut => {
            const category = shortcut.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(shortcut);
        });

        return grouped;
    }

    getCategoryLabel(category) {
        const labels = {
            navigation: '导航',
            appearance: '外观',
            settings: '设置',
            help: '帮助',
            interaction: '交互',
            page: '页面',
            development: '开发',
            language: '语言',
            display: '显示',
            general: '通用'
        };
        return labels[category] || category;
    }

    formatKeys(keys) {
        return keys.map(key => {
            const keyLabels = {
                'ctrl': 'Ctrl',
                'alt': 'Alt',
                'shift': 'Shift',
                'meta': 'Cmd',
                '/': '/',
                'escape': 'Esc',
                'arrowup': '↑',
                'arrowdown': '↓',
                'arrowleft': '←',
                'arrowright': '→'
            };
            return keyLabels[key.toLowerCase()] || key.toUpperCase();
        }).join(' + ');
    }

    showNotification(message, type = 'info') {
        if (window.componentLibrary) {
            const notification = window.componentLibrary.create('notification', document.body, {
                type: type,
                title: '快捷键',
                message: message,
                duration: 3000
            });
            notification.show();
        } else {
            window.logInfo(`[快捷键] ${message}`);
        }
    }

    dispatchEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    // 公共API
    enable() {
        this.active = true;
        window.logInfo('⌨️ Keyboard shortcuts enabled');
    }

    disable() {
        this.active = false;
        window.logInfo('⌨️ Keyboard shortcuts disabled');
    }

    getAllShortcuts() {
        const shortcuts = [];
        this.shortcuts.forEach((value, key) => {
            shortcuts.push({ key, ...value });
        });
        return shortcuts;
    }

    removeShortcut(keys) {
        const key = this.normalizeKeys(keys);
        return this.shortcuts.delete(key);
    }

    destroy() {
        this.active = false;
        this.hideHelp();
        this.shortcuts.clear();
        window.logInfo('⌨️ Keyboard shortcuts manager destroyed');
    }
}

// 自动初始化
let keyboardShortcutsManager;

setTimeout(() => {
    keyboardShortcutsManager = new KeyboardShortcutsManager();
    window.keyboardShortcuts = keyboardShortcutsManager;
    window.logInfo('✅ Keyboard Shortcuts Manager initialized');
}, 500);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardShortcutsManager;
}