/**
 * 日志开关工具
 * 提供便捷的日志系统开启/关闭功能
 */

class LoggerToggle {
    constructor() {
        this.configKey = 'logger_config';
        this.defaultConfig = {
            enabled: true,
            console: true,
            storage: true,
            performance: true,
            level: 0 // DEBUG
        };
    }

    /**
     * 开启日志系统 - 完整功能
     */
    enableFull() {
        const config = {
            ...this.defaultConfig,
            enabled: true,
            console: true,
            storage: true,
            performance: true,
            level: 0 // DEBUG
        };
        this.setConfig(config);
        this.notifyStatus('已开启完整日志功能', 'success');
    }

    /**
     * 开启基础日志 - 仅控制台输出
     */
    enableBasic() {
        const config = {
            ...this.defaultConfig,
            enabled: true,
            console: true,
            storage: false,
            performance: false,
            level: 1 // INFO
        };
        this.setConfig(config);
        this.notifyStatus('已开启基础日志功能', 'success');
    }

    /**
     * 关闭日志系统
     */
    disable() {
        const config = {
            enabled: false,
            console: false,
            storage: false,
            performance: false
        };
        this.setConfig(config);
        this.notifyStatus('已关闭日志系统', 'info');
    }

    /**
     * 切换日志系统状态
     */
    toggle() {
        const currentConfig = this.getConfig();
        const newState = !currentConfig.enabled;

        if (newState) {
            this.enableBasic();
        } else {
            this.disable();
        }

        return newState;
    }

    /**
     * 获取当前配置
     */
    getConfig() {
        try {
            const stored = localStorage.getItem(this.configKey);
            return stored ? JSON.parse(stored) : { enabled: false };
        } catch (error) {
            window.logWarn('Failed to parse logger config:', error);
            return { enabled: false };
        }
    }

    /**
     * 设置配置
     */
    setConfig(config) {
        try {
            localStorage.setItem(this.configKey, JSON.stringify(config));

            // 如果logger实例存在，立即更新配置
            if (window.APP_LOGGER && window.APP_LOGGER.config) {
                Object.assign(window.APP_LOGGER.config, config);

                // 重新初始化logger以应用新配置
                if (config.enabled && !window.APP_LOGGER.config.enabled) {
                    window.logInfo('🔧 Logger reinitialized with new config');
                }
            }

            // 页面刷新以应用配置更改
            if (confirm('配置已保存，是否刷新页面以应用更改？')) {
                window.location.reload();
            }
        } catch (error) {
            window.logError('Failed to save logger config:', error);
            this.notifyStatus('保存配置失败', 'error');
        }
    }

    /**
     * 显示状态通知
     */
    notifyStatus(message, type) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 6px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-size: 14px;
        `;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * 创建快捷控制面板
     */
    createControlPanel() {
        // 移除现有面板（如果存在）
        this.removeControlPanel();

        // 创建面板容器
        const panel = document.createElement('div');
        panel.id = 'logger-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            min-width: 200px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
        `;

        // 面板标题
        const title = document.createElement('div');
        title.textContent = '🔧 日志控制';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
        `;
        panel.appendChild(title);

        // 当前状态显示
        const config = this.getConfig();
        const status = document.createElement('div');
        status.textContent = `状态: ${config.enabled ? '✅ 开启' : '❌ 关闭'}`;
        status.style.cssText = `
            margin-bottom: 15px;
            padding: 8px;
            background: ${config.enabled ? '#d4edda' : '#f8d7da'};
            border-radius: 4px;
            text-align: center;
        `;
        panel.appendChild(status);

        // 按钮容器
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        // 创建按钮
        const buttonConfigs = [
            { text: '🟢 完整日志', action: () => this.enableFull(), color: '#28a745' },
            { text: '🟡 基础日志', action: () => this.enableBasic(), color: '#ffc107' },
            { text: '🔴 关闭日志', action: () => this.disable(), color: '#dc3545' },
            { text: '🔄 切换状态', action: () => this.toggle(), color: '#6c757d' }
        ];

        buttonConfigs.forEach(({ text, action, color }) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.style.cssText = `
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                background: ${color};
                color: white;
                transition: opacity 0.2s;
            `;
            button.onmouseover = () => button.style.opacity = '0.8';
            button.onmouseout = () => button.style.opacity = '1';
            button.onclick = action;
            buttons.appendChild(button);
        });

        panel.appendChild(buttons);

        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            color: #999;
            padding: 2px 6px;
        `;
        closeBtn.onclick = () => this.removeControlPanel();
        panel.appendChild(closeBtn);

        document.body.appendChild(panel);
    }

    /**
     * 移除控制面板
     */
    removeControlPanel() {
        const panel = document.getElementById('logger-control-panel');
        if (panel) {
            panel.parentNode.removeChild(panel);
        }
    }

    /**
     * 生成URL开启参数
     */
    generateEnableUrl(full = false) {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams(window.location.search);

        params.set('debug', 'true');
        if (full) {
            params.set('logger', 'full');
        }

        return baseUrl + '?' + params.toString();
    }

    /**
     * 复制开启URL到剪贴板
     */
    copyEnableUrl(full = false) {
        const url = this.generateEnableUrl(full);

        navigator.clipboard.writeText(url).then(() => {
            this.notifyStatus(`已复制URL到剪贴板: ${full ? '完整模式' : '基础模式'}`, 'success');
            window.logInfo('📋 复制的URL:', url);
        }).catch(err => {
            window.logError('复制失败:', err);
            // 降级方案：选中文本
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.notifyStatus('已复制URL到剪贴板', 'success');
        });
    }

    /**
     * 显示使用说明
     */
    showUsage() {
        const usage = `
🔧 日志系统使用说明:

1. URL参数方式 (刷新页面生效):
   ?debug=true        开启基础日志
   ?logger=true       开启完整日志
   ?logger=full       开启完整日志+性能监控
   ?silent=true       强制关闭日志

2. 本地配置方式 (即时生效):
   localStorage.setItem('logger_config', JSON.stringify({
     enabled: true,
     console: true,
     storage: true,
     performance: true
   }));

3. 代码控制方式:
   window.loggerToggle.enableFull()   // 完整日志
   window.loggerToggle.enableBasic()  // 基础日志
   window.loggerToggle.disable()      // 关闭日志
   window.loggerToggle.toggle()       // 切换状态

4. 控制面板:
   window.loggerToggle.createControlPanel()

5. 一键复制URL:
   window.loggerToggle.copyEnableUrl()     // 基础模式
   window.loggerToggle.copyEnableUrl(true) // 完整模式
        `;

        window.logInfo(usage);
        this.notifyStatus('使用说明已输出到控制台', 'info');
    }
}

// 创建全局实例
const loggerToggle = new LoggerToggle();

// 开发环境下暴露全局方法
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.loggerToggle = loggerToggle;

    // 开发者快捷方法
    window.enableLogger = () => loggerToggle.enableBasic();
    window.enableFullLogger = () => loggerToggle.enableFull();
    window.disableLogger = () => loggerToggle.disable();
    window.toggleLogger = () => loggerToggle.toggle();
    window.showLoggerPanel = () => loggerToggle.createControlPanel();
    window.showLoggerUsage = () => loggerToggle.showUsage();

    window.logInfo('🔧 Logger toggle tools available:');
    window.logInfo('- enableLogger() / enableFullLogger() / disableLogger()');
    window.logInfo('- toggleLogger() / showLoggerPanel() / showLoggerUsage()');
    window.logInfo('- window.loggerToggle.* for advanced options');
}

export { LoggerToggle, loggerToggle };
export default loggerToggle;