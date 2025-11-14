/**
 * Advanced Features - 高级功能模块
 * 提供高级的企业级功能：数据可视化、图表、文件上传、拖拽等
 * 完全安全的DOM操作，避免XSS攻击
 */

class AdvancedFeaturesManager {
    constructor(config = {}) {
        this.config = {
            enableCharts: true,
            enableFileUpload: true,
            enableDragDrop: true,
            enableDataVisualization: true,
            enableNotifications: true,
            enableTooltips: true,
            ...config
        };

        this.charts = new Map();
        this.uploadHandlers = new Map();
        this.tooltips = new Map();
        this.notifications = [];

        this.init();
    }

    init() {
        this.setupGlobalStyles();
        this.setupEventListeners();
        window.logInfo('🚀 Advanced Features Manager initialized');
    }

    setupGlobalStyles() {
        if (!document.getElementById('advanced-features-styles')) {
            const style = document.createElement('style');
            style.id = 'advanced-features-styles';
            style.textContent = `
                /* 高级功能全局样式 */
                .chart-container {
                    position: relative;
                    width: 100%;
                    height: 300px;
                    background: var(--theme-card-bg, #ffffff);
                    border: 1px solid var(--theme-border, #e0e0e0);
                    border-radius: 8px;
                    padding: 20px;
                    margin: 15px 0;
                }

                .chart-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--theme-text, #333);
                    margin-bottom: 15px;
                    text-align: center;
                }

                .file-upload-area {
                    border: 2px dashed var(--theme-border, #ccc);
                    border-radius: 8px;
                    padding: 40px 20px;
                    text-align: center;
                    background: var(--theme-hover, #f9f9f9);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    margin: 15px 0;
                }

                .file-upload-area:hover {
                    border-color: var(--primary, #1e3a5f);
                    background: var(--theme-bg, #f5f5f5);
                }

                .file-upload-area.dragover {
                    border-color: var(--success, #28a745);
                    background: rgba(40, 167, 69, 0.1);
                }

                .upload-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                    color: var(--theme-text-secondary, #666);
                }

                .upload-text {
                    color: var(--theme-text, #333);
                    font-size: 16px;
                    margin-bottom: 10px;
                }

                .upload-hint {
                    color: var(--theme-text-secondary, #666);
                    font-size: 14px;
                }

                .file-list {
                    margin-top: 15px;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px;
                    background: var(--theme-card-bg, #ffffff);
                    border: 1px solid var(--theme-border, #e0e0e0);
                    border-radius: 6px;
                    margin-bottom: 8px;
                }

                .file-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .file-icon {
                    font-size: 20px;
                }

                .file-name {
                    font-weight: 500;
                    color: var(--theme-text, #333);
                }

                .file-size {
                    font-size: 12px;
                    color: var(--theme-text-secondary, #666);
                }

                .file-remove {
                    background: var(--danger, #dc3545);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 8px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .tooltip {
                    position: absolute;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    z-index: 10000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    max-width: 200px;
                    word-wrap: break-word;
                }

                .tooltip.visible {
                    opacity: 1;
                }

                .data-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }

                .data-card {
                    background: var(--theme-card-bg, #ffffff);
                    border: 1px solid var(--theme-border, #e0e0e0);
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .data-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .data-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: var(--primary, #1e3a5f);
                    margin-bottom: 5px;
                }

                .data-label {
                    color: var(--theme-text-secondary, #666);
                    font-size: 14px;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: var(--theme-border, #e0e0e0);
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 10px 0;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary, #1e3a5f), var(--secondary, #2c5282));
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .fade-in-up {
                    animation: fadeInUp 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupEventListeners() {
        // 全局文件拖拽支持
        if (this.config.enableDragDrop) {
            document.addEventListener('dragover', (e) => {
                if (e.dataTransfer.types.includes('Files')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            document.addEventListener('drop', (e) => {
                if (e.dataTransfer.types.includes('Files')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleGlobalFileDrop(e.dataTransfer.files);
                }
            });
        }
    }

    // 图表功能
    createChart(container, type, data, options = {}) {
        if (!this.config.enableCharts) {
            window.logWarn('Charts are disabled');
            return null;
        }

        const chartId = 'chart-' + Date.now();
        const chartElement = this.createChartElement(container, type, data, options, chartId);

        const chart = {
            id: chartId,
            type: type,
            data: data,
            options: options,
            element: chartElement,
            update: (newData) => this.updateChart(chartId, newData),
            destroy: () => this.destroyChart(chartId)
        };

        this.charts.set(chartId, chart);
        return chart;
    }

    createChartElement(container, type, data, options, chartId) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container fade-in-up';
        chartContainer.id = chartId;

        if (options.title) {
            const title = document.createElement('div');
            title.className = 'chart-title';
            title.textContent = options.title;
            chartContainer.appendChild(title);
        }

        const canvas = document.createElement('canvas');
        canvas.width = container.offsetWidth - 40;
        canvas.height = 250;
        chartContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        this.drawChart(ctx, type, data, options);

        container.appendChild(chartContainer);
        return chartContainer;
    }

    drawChart(ctx, type, data, options) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        switch (type) {
            case 'bar':
                this.drawBarChart(ctx, data, options, width, height, padding);
                break;
            case 'line':
                this.drawLineChart(ctx, data, options, width, height, padding);
                break;
            case 'pie':
                this.drawPieChart(ctx, data, options, width, height, padding);
                break;
            case 'doughnut':
                this.drawDoughnutChart(ctx, data, options, width, height, padding);
                break;
            default:
                window.logWarn('Unsupported chart type:', type);
        }
    }

    drawBarChart(ctx, data, options, width, height, padding) {
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const barWidth = chartWidth / data.labels.length * 0.6;
        const maxValue = Math.max(...data.values);

        // 绘制坐标轴
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // 绘制柱状图
        data.values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + (index * (chartWidth / data.labels.length)) +
                      (chartWidth / data.labels.length - barWidth) / 2;
            const y = height - padding - barHeight;

            // 柱状图渐变
            const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
            gradient.addColorStop(0, options.primaryColor || '#1e3a5f');
            gradient.addColorStop(1, options.secondaryColor || '#2c5282');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // 标签
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(data.labels[index], x + barWidth / 2, height - padding + 20);

            // 数值
            ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        });
    }

    drawLineChart(ctx, data, options, width, height, padding) {
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const maxValue = Math.max(...data.values);

        // 绘制坐标轴
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // 绘制折线
        ctx.strokeStyle = options.primaryColor || '#1e3a5f';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.values.forEach((value, index) => {
            const x = padding + (index * chartWidth / (data.values.length - 1));
            const y = height - padding - (value / maxValue) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // 数据点
            ctx.fillStyle = options.primaryColor || '#1e3a5f';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // 标签
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(data.labels[index], x, height - padding + 20);
        });

        ctx.stroke();
    }

    drawPieChart(ctx, data, options, width, height, padding) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - padding;
        const total = data.values.reduce((sum, value) => sum + value, 0);
        let currentAngle = -Math.PI / 2;

        const colors = options.colors || [
            '#1e3a5f', '#2c5282', '#3182ce', '#4299e1', '#63b3ed'
        ];

        data.values.forEach((value, index) => {
            const sliceAngle = (value / total) * Math.PI * 2;

            // 绘制扇形
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            // 标签
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(data.labels[index], labelX, labelY);
            ctx.fillText(`${((value / total) * 100).toFixed(1)}%`, labelX, labelY + 15);

            currentAngle += sliceAngle;
        });
    }

    drawDoughnutChart(ctx, data, options, width, height, padding) {
        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = Math.min(width, height) / 2 - padding;
        const innerRadius = outerRadius * 0.6;
        const total = data.values.reduce((sum, value) => sum + value, 0);
        let currentAngle = -Math.PI / 2;

        const colors = options.colors || [
            '#1e3a5f', '#2c5282', '#3182ce', '#4299e1', '#63b3ed'
        ];

        data.values.forEach((value, index) => {
            const sliceAngle = (value / total) * Math.PI * 2;

            // 绘制环形
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(currentAngle) * innerRadius,
                      centerY + Math.sin(currentAngle) * innerRadius);
            ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fill();

            currentAngle += sliceAngle;
        });

        // 中心文字
        if (options.centerText) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(options.centerText, centerX, centerY);
        }
    }

    updateChart(chartId, newData) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.data = newData;
            const canvas = chart.element.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            this.drawChart(ctx, chart.type, newData, chart.options);
        }
    }

    destroyChart(chartId) {
        const chart = this.charts.get(chartId);
        if (chart && chart.element) {
            chart.element.remove();
            this.charts.delete(chartId);
        }
    }

    // 数据可视化功能
    createDataVisualization(container, data, options = {}) {
        if (!this.config.enableDataVisualization) return null;

        const vizContainer = document.createElement('div');
        vizContainer.className = 'data-visualization';

        if (options.type === 'grid') {
            this.createDataGrid(vizContainer, data, options);
        } else if (options.type === 'progress') {
            this.createProgressBars(vizContainer, data, options);
        }

        container.appendChild(vizContainer);
        return vizContainer;
    }

    createDataGrid(container, data, options) {
        const grid = document.createElement('div');
        grid.className = 'data-grid';

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'data-card';

            const value = document.createElement('div');
            value.className = 'data-value';
            value.textContent = item.value;

            const label = document.createElement('div');
            label.className = 'data-label';
            label.textContent = item.label;

            card.appendChild(value);
            card.appendChild(label);
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    createProgressBars(container, data, options) {
        data.forEach(item => {
            const progressContainer = document.createElement('div');
            progressContainer.style.marginBottom = '15px';

            const label = document.createElement('div');
            label.textContent = item.label;
            label.style.marginBottom = '5px';

            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';

            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressFill.style.width = item.value + '%';

            const value = document.createElement('div');
            value.textContent = item.value + '%';
            value.style.fontSize = '12px';
            value.style.color = '#666';
            value.style.marginTop = '5px';

            progressBar.appendChild(progressFill);
            progressContainer.appendChild(label);
            progressContainer.appendChild(progressBar);
            progressContainer.appendChild(value);
            container.appendChild(progressContainer);
        });
    }

    // 通知功能
    showNotification(type, title, message, duration = 5000) {
        if (!this.config.enableNotifications) {
            window.logInfo(`[${type}] ${title}: ${message}`);
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'advanced-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        const notificationTitle = document.createElement('div');
        notificationTitle.style.fontWeight = '600';
        notificationTitle.style.marginBottom = '5px';
        notificationTitle.textContent = title;

        const notificationMessage = document.createElement('div');
        notificationMessage.style.fontSize = '14px';
        notificationMessage.textContent = message;

        notification.appendChild(notificationTitle);
        notification.appendChild(notificationMessage);

        document.body.appendChild(notification);

        // 动画显示
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    // 公共API
    getStats() {
        return {
            charts: this.charts.size,
            uploadHandlers: this.uploadHandlers.size,
            tooltips: this.tooltips.size,
            notifications: this.notifications.length
        };
    }

    destroy() {
        // 清理所有图表
        this.charts.forEach(chart => this.destroyChart(chart.id));

        // 清理所有文件上传
        this.uploadHandlers.forEach(handler => this.destroyFileUpload(handler.id));

        // 清理所有工具提示
        this.tooltips.forEach(tooltip => this.destroyTooltip(tooltip.id));

        // 清理全局样式
        const globalStyles = document.getElementById('advanced-features-styles');
        if (globalStyles) {
            globalStyles.remove();
        }

        window.logInfo('🚀 Advanced Features Manager destroyed');
    }
}

// 自动初始化
let advancedFeaturesManager;

setTimeout(() => {
    advancedFeaturesManager = new AdvancedFeaturesManager();
    window.advancedFeatures = advancedFeaturesManager;
    window.logInfo('✅ Advanced Features Manager initialized');
}, 800);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedFeaturesManager;
}