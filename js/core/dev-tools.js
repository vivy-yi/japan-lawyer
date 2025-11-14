/**
 * Developer Tools - 开发工具集
 * 简化版本，专注于核心调试功能
 */

class DeveloperTools {
    constructor() {
        this.isActive = false;
        this.panel = null;
        this.metrics = {
            components: 0,
            searchDocs: 0,
            errors: 0,
            themeChanges: 0
        };
        this.init();
    }

    init() {
        // 设置快捷键激活 (Ctrl+Shift+D)
        let konamiCode = [];
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.code);
            if (konamiCode.length > 3) {
                konamiCode.shift();
            }

            if (konamiCode.join(',') === 'ControlLeft,ShiftLeft,KeyD' ||
                konamiCode.join(',') === 'ControlRight,ShiftRight,KeyD') {
                this.toggle();
            }
        });

        // 控制台命令
        window.showDevPanel = () => this.show();
        window.hideDevPanel = () => this.hide();
        window.getMetrics = () => this.getMetrics();

        // 监控组件库
        this.monitorComponents();
        this.monitorSearch();
        this.monitorTheme();
        this.monitorErrors();

        console.log('🛠️ Developer Tools initialized (Press Ctrl+Shift+D to activate)');
    }

    monitorComponents() {
        if (window.componentLibrary) {
            setInterval(() => {
                if (window.componentLibrary.getStats) {
                    const stats = window.componentLibrary.getStats();
                    this.metrics.components = stats.activeInstances || 0;
                }
            }, 1000);
        }
    }

    monitorSearch() {
        if (window.searchManager) {
            setInterval(() => {
                if (window.searchManager.getStats) {
                    const stats = window.searchManager.getStats();
                    this.metrics.searchDocs = stats.totalDocuments || 0;
                }
            }, 2000);
        }
    }

    monitorTheme() {
        if (window.themeManager) {
            window.themeManager.addEventListener?.('themeChanged', () => {
                this.metrics.themeChanges++;
            });
        }
    }

    monitorErrors() {
        const originalError = console.error;
        console.error = (...args) => {
            originalError.apply(console, args);
            this.metrics.errors++;
        };

        window.addEventListener('error', () => {
            this.metrics.errors++;
        });
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'dev-tools-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 350px;
            background: var(--theme-card-bg, #ffffff);
            border: 1px solid var(--theme-border, #e0e0e0);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            display: none;
        `;

        // 头部
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 12px;
            background: var(--primary, #1e3a5f);
            color: white;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('span');
        title.textContent = '🛠️ Developer Tools';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
        `;
        closeBtn.onclick = () => this.hide();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // 内容
        const content = document.createElement('div');
        content.style.cssText = 'padding: 15px;';
        content.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>📊 系统状态</strong>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div style="background: #f0f8f0; padding: 8px; border-radius: 4px;">
                    <div>组件实例</div>
                    <div id="component-count" style="font-weight: bold; color: #2e7d32;">0</div>
                </div>
                <div style="background: #f0f8f0; padding: 8px; border-radius: 4px;">
                    <div>搜索文档</div>
                    <div id="search-count" style="font-weight: bold; color: #2e7d32;">0</div>
                </div>
                <div style="background: #fff0f0; padding: 8px; border-radius: 4px;">
                    <div>错误次数</div>
                    <div id="error-count" style="font-weight: bold; color: #c62828;">0</div>
                </div>
                <div style="background: #f3e5f5; padding: 8px; border-radius: 4px;">
                    <div>主题切换</div>
                    <div id="theme-count" style="font-weight: bold; color: #7b1fa2;">0</div>
                </div>
            </div>
            <div style="margin-bottom: 10px;">
                <strong>🔧 快捷操作</strong>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button onclick="window.componentLibrary?.destroyAll()" style="padding: 6px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    清除所有组件
                </button>
                <button onclick="window.searchManager?.reindex()" style="padding: 6px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    重新索引搜索
                </button>
                <button onclick="window.themeManager?.toggleTheme()" style="padding: 6px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    切换主题
                </button>
                <button onclick="window.location.reload()" style="padding: 6px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    刷新页面
                </button>
            </div>
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #666;">
                按 Ctrl+Shift+D 切换面板 | 最后更新: <span id="last-update">刚刚</span>
            </div>
        `;

        panel.appendChild(header);
        panel.appendChild(content);

        document.body.appendChild(panel);

        // 定期更新显示
        setInterval(() => this.updateDisplay(), 1000);

        return panel;
    }

    updateDisplay() {
        if (!this.panel) return;

        const componentCount = this.panel.querySelector('#component-count');
        const searchCount = this.panel.querySelector('#search-count');
        const errorCount = this.panel.querySelector('#error-count');
        const themeCount = this.panel.querySelector('#theme-count');
        const lastUpdate = this.panel.querySelector('#last-update');

        if (componentCount) componentCount.textContent = this.metrics.components;
        if (searchCount) searchCount.textContent = this.metrics.searchDocs;
        if (errorCount) errorCount.textContent = this.metrics.errors;
        if (themeCount) themeCount.textContent = this.metrics.themeChanges;
        if (lastUpdate) lastUpdate.textContent = new Date().toLocaleTimeString();
    }

    show() {
        if (!this.panel) {
            this.panel = this.createPanel();
        }
        this.panel.style.display = 'block';
        this.isActive = true;
        this.updateDisplay();
    }

    hide() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
        this.isActive = false;
    }

    toggle() {
        if (this.isActive) {
            this.hide();
        } else {
            this.show();
        }
    }

    getMetrics() {
        return { ...this.metrics };
    }

    destroy() {
        if (this.panel) {
            this.panel.remove();
        }
        console.log('🗑️ Developer Tools destroyed');
    }
}

// 自动初始化
setTimeout(() => {
    const devTools = new DeveloperTools();
    window.devTools = devTools;
}, 200);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeveloperTools;
}