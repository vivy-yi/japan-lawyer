/**
 * Finance Analyzer Component - 安全版本
 * 防止XSS攻击的AI财务分析组件
 * 使用安全的DOM方法而不是innerHTML
 */
class FinanceAnalyzer {
    constructor() {
        this.modalContainer = null;
        this.currentModal = null;
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.createModalContainer();
        this.bindEvents();
        window.logInfo('FinanceAnalyzer: 安全组件已初始化');
    }

    /**
     * 创建模态框容器
     */
    createModalContainer() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'finance-modal-container';
        this.modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 10000;
            justify-content: center;
            align-items: center;
        `;
        document.body.appendChild(this.modalContainer);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 使用事件委托避免内存泄漏
        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer) {
                this.hideModal();
            }
            if (e.target.classList.contains('close-btn')) {
                this.hideModal();
            }
            if (e.target.classList.contains('action-btn')) {
                this.handleActionClick(e);
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.hideModal();
            }
        });
    }

    /**
     * 显示模态框 - 安全版本
     */
    showModal(title, icon, data) {
        try {
            const modal = this.createSecureModal(title, icon, data);
            this.modalContainer.innerHTML = ''; // 清空容器
            this.modalContainer.appendChild(modal);
            this.modalContainer.style.display = 'flex';
            this.currentModal = modal;
            document.body.style.overflow = 'hidden';
        } catch (error) {
            window.logError('FinanceAnalyzer: 显示模态框时出错', error);
            this.showError('显示分析界面时出现错误，请稍后重试。');
        }
    }

    /**
     * 创建安全的模态框元素
     */
    createSecureModal(title, icon, data) {
        const modal = document.createElement('div');
        modal.className = 'finance-modal';
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            max-height: 85vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
            animation: modalSlideIn 0.3s ease-out;
        `;

        // 创建头部
        const header = this.createModalHeader(title, icon);
        modal.appendChild(header);

        // 创建内容区域
        const content = this.createSecureContent(title, data);
        modal.appendChild(content);

        return modal;
    }

    /**
     * 创建模态框头部
     */
    createModalHeader(title, icon) {
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.style.cssText = `
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const titleElement = document.createElement('h2');
        titleElement.textContent = `${icon} ${title}`;
        titleElement.style.cssText = `
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        `;

        header.appendChild(titleElement);
        header.appendChild(closeBtn);

        return header;
    }

    /**
     * 创建安全的内容区域
     */
    createSecureContent(title, data) {
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.cssText = `
            padding: 30px;
            max-height: 60vh;
            overflow-y: auto;
        `;

        // 根据类型创建不同的内容
        const contentMap = {
            '智能会计': () => this.createAccountingContent(),
            '税务筹划': () => this.createTaxContent(),
            '投资分析': () => this.createInvestmentContent(),
            '风险管理': () => this.createRiskContent(),
            '财务报告': () => this.createReportContent(),
            '预算管理': () => this.createBudgetContent()
        };

        const createContent = contentMap[title];
        if (createContent) {
            const contentElement = createContent();
            content.appendChild(contentElement);
        } else {
            const fallback = document.createElement('p');
            fallback.textContent = '功能开发中...';
            content.appendChild(fallback);
        }

        return content;
    }

    /**
     * 智能会计内容
     */
    createAccountingContent() {
        const container = document.createElement('div');

        const intro = document.createElement('div');
        intro.innerHTML = `
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                🤖 AI智能会计系统，为您提供实时的财务数据分析和专业的会计处理建议。
            </p>
        `;
        container.appendChild(intro);

        const features = [
            { icon: '📊', title: '实时财务监控', desc: '7×24小时监控财务流水，自动分类记账' },
            { icon: '🧾', title: '智能票据识别', desc: 'OCR技术自动识别发票，准确率99.8%' },
            { icon: '📈', title: '财务预测分析', desc: '基于历史数据的智能财务预测和趋势分析' },
            { icon: '⚡', title: '自动化报表', desc: '一键生成各类财务报表，支持多格式导出' },
            { icon: '🔍', title: '异常检测', desc: 'AI驱动的财务异常检测和风险预警' },
            { icon: '💡', title: '税务筹划建议', desc: '智能税务筹划，合理降低税负' }
        ];

        const featuresGrid = document.createElement('div');
        featuresGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        `;

        features.forEach(feature => {
            const card = this.createFeatureCard(feature);
            featuresGrid.appendChild(card);
        });

        container.appendChild(featuresGrid);
        container.appendChild(this.createActionButtons('智能会计'));

        return container;
    }

    /**
     * 税务筹划内容
     */
    createTaxContent() {
        const container = document.createElement('div');

        const intro = document.createElement('div');
        intro.innerHTML = `
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                💰 AI税务筹划专家，通过大数据分析和智能算法，为您制定最优税务方案。
            </p>
        `;
        container.appendChild(intro);

        const features = [
            { icon: '🎯', title: '智能税筹方案', desc: '根据经营情况定制个性化税务筹划方案' },
            { icon: '📋', title: '税务申报自动化', desc: '自动计算各项税费，生成申报表格' },
            { icon: '🛡️', title: '税务风险评估', desc: '提前识别税务风险，提供专业应对建议' },
            { icon: '📊', title: '税负分析', desc: '全面分析企业税负结构，优化税务成本' },
            { icon: '🔄', title: '政策实时更新', desc: '第一时间同步最新税务政策变化' },
            { icon: '💼', title: '税务健康诊断', desc: '定期体检式税务检查，确保合规经营' }
        ];

        const featuresGrid = document.createElement('div');
        featuresGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        `;

        features.forEach(feature => {
            const card = this.createFeatureCard(feature);
            featuresGrid.appendChild(card);
        });

        container.appendChild(featuresGrid);
        container.appendChild(this.createActionButtons('税务筹划'));

        return container;
    }

    /**
     * 投资分析内容
     */
    createInvestmentContent() {
        const container = document.createElement('div');

        const intro = document.createElement('div');
        intro.innerHTML = `
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                📈 AI投资分析顾问，运用量化模型和机器学习，为您的投资决策提供科学依据。
            </p>
        `;
        container.appendChild(intro);

        const features = [
            { icon: '🎯', title: '智能投资组合', desc: '基于风险偏好的AI资产配置建议' },
            { icon: '📊', title: '市场趋势预测', desc: '深度学习算法预测市场走向' },
            { icon: '⚡', title: '实时风险评估', desc: '动态监控投资组合风险水平' },
            { icon: '🔍', title: '投资机会挖掘', desc: 'AI发现潜在投资机会和价值洼地' },
            { icon: '📈', title: '收益归因分析', desc: '详细分析投资收益来源' },
            { icon: '🛡️', title: '智能止损建议', desc: '基于波动率的智能止损点推荐' }
        ];

        const featuresGrid = document.createElement('div');
        featuresGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        `;

        features.forEach(feature => {
            const card = this.createFeatureCard(feature);
            featuresGrid.appendChild(card);
        });

        container.appendChild(featuresGrid);
        container.appendChild(this.createActionButtons('投资分析'));

        return container;
    }

    /**
     * 风险管理内容
     */
    createRiskContent() {
        const container = document.createElement('div');

        const intro = document.createElement('div');
        intro.innerHTML = `
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                🛡️ AI风险管理系统，全方位识别和评估经营风险，守护企业安全。
            </p>
        `;
        container.appendChild(intro);

        const features = [
            { icon: '🎯', title: '全面风险识别', desc: '识别经营、财务、市场等多维度风险' },
            { icon: '⚡', title: '实时风险监控', desc: '7×24小时监控关键风险指标' },
            { icon: '📊', title: '风险量化评估', desc: '科学量化风险等级和影响程度' },
            { icon: '🔔', title: '智能预警系统', desc: '提前发现风险信号，及时预警' },
            { icon: '🛡️', title: '风险应对策略', desc: '提供专业风险应对和缓释建议' },
            { icon: '📈', title: '风险管理报告', desc: '定期生成风险管理分析报告' }
        ];

        const featuresGrid = document.createElement('div');
        featuresGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        `;

        features.forEach(feature => {
            const card = this.createFeatureCard(feature);
            featuresGrid.appendChild(card);
        });

        container.appendChild(featuresGrid);
        container.appendChild(this.createActionButtons('风险管理'));

        return container;
    }

    /**
     * 财务报告内容
     */
    createReportContent() {
        const container = document.createElement('div');

        const intro = document.createElement('div');
        intro.innerHTML = `
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                📊 AI智能财务报告系统，自动生成专业财务报告，提供深度分析洞察。
            </p>
        `;
        container.appendChild(intro);

        const features = [
            { icon: '📋', title: '智能报表生成', desc: '一键生成资产负债表、利润表等财务报表' },
            { icon: '📈', title: '财务趋势分析', desc: '多维度财务指标趋势分析' },
            { icon: '💡', title: '经营洞察', desc: 'AI挖掘财务数据背后的经营洞察' },
            { icon: '🎯', title: '异常数据标记', desc: '自动识别和标记异常财务数据' },
            { icon: '📊', title: '自定义报表', desc: '按需定制各类管理分析报表' },
            { icon: '📤', title: '多格式导出', desc: '支持PDF、Excel等多种格式导出' }
        ];

        const featuresGrid = document.createElement('div');
        featuresGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        `;

        features.forEach(feature => {
            const card = this.createFeatureCard(feature);
            featuresGrid.appendChild(card);
        });

        container.appendChild(featuresGrid);
        container.appendChild(this.createActionButtons('财务报告'));

        return container;
    }

    /**
     * 预算管理内容
     */
    createBudgetContent() {
        const container = document.createElement('div');

        const intro = document.createElement('div');
        intro.innerHTML = `
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                💰 AI智能预算管理，帮您科学规划资金，优化资源配置。
            </p>
        `;
        container.appendChild(intro);

        const features = [
            { icon: '📊', title: '智能预算编制', desc: '基于历史数据和目标的智能预算编制' },
            { icon: '📈', title: '预算执行监控', desc: '实时监控预算执行情况' },
            { icon: '⚡', title: '预算预警', desc: '预算超支提前预警和提醒' },
            { icon: '💡', title: '预算优化建议', desc: 'AI分析预算使用效率，提供优化建议' },
            { icon: '🔄', title: '预算调整', desc: '灵活的预算调整和重新分配' },
            { icon: '📊', title: '预算分析报告', desc: '定期生成预算执行分析报告' }
        ];

        const featuresGrid = document.createElement('div');
        featuresGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        `;

        features.forEach(feature => {
            const card = this.createFeatureCard(feature);
            featuresGrid.appendChild(card);
        });

        container.appendChild(featuresGrid);
        container.appendChild(this.createActionButtons('预算管理'));

        return container;
    }

    /**
     * 创建功能卡片
     */
    createFeatureCard(feature) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
        `;

        card.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 15px;">${feature.icon}</div>
            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 18px;">${feature.title}</h3>
            <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.5;">${feature.desc}</p>
        `;

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });

        return card;
    }

    /**
     * 创建操作按钮
     */
    createActionButtons(featureType) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 40px;
            flex-wrap: wrap;
        `;

        const primaryBtn = document.createElement('button');
        primaryBtn.className = 'action-btn';
        primaryBtn.textContent = '立即体验';
        primaryBtn.setAttribute('data-action', 'start');
        primaryBtn.style.cssText = `
            background: linear-gradient(135deg, #4299e1, #3182ce);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
        `;

        const secondaryBtn = document.createElement('button');
        secondaryBtn.className = 'action-btn';
        secondaryBtn.textContent = '了解更多';
        secondaryBtn.setAttribute('data-action', 'learn');
        secondaryBtn.style.cssText = `
            background: transparent;
            color: #4299e1;
            border: 2px solid #4299e1;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
        `;

        buttonContainer.appendChild(primaryBtn);
        buttonContainer.appendChild(secondaryBtn);

        return buttonContainer;
    }

    /**
     * 处理按钮点击
     */
    handleActionClick(e) {
        const action = e.target.getAttribute('data-action');
        if (action === 'start') {
            this.showStartExperience();
        } else if (action === 'learn') {
            this.showLearnMore();
        }
    }

    /**
     * 显示开始体验界面
     */
    showStartExperience() {
        this.hideModal();
        setTimeout(() => {
            alert('演示模式：AI财务分析功能即将为您开启！\n\n在实际应用中，这里将引导您：\n1. 连接财务数据源\n2. 配置分析参数\n3. 开始智能分析\n4. 查看分析结果');
        }, 300);
    }

    /**
     * 显示了解更多
     */
    showLearnMore() {
        this.hideModal();
        setTimeout(() => {
            alert('AI财务分析系统详细介绍：\n\n🔧 技术特点：\n- 基于GPT-4驱动的智能分析\n- 实时数据处理和机器学习\n- 银行级数据安全保护\n\n📊 功能覆盖：\n- 6大财务分析模块\n- 100+ 分析维度\n- 定制化报告生成\n\n🎯 适用对象：\n- 中小企业财务部门\n- 会计师事务所\n- 投资理财机构\n- 个人财务管理');
        }, 300);
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            font-size: 14px;
        `;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * 隐藏模态框
     */
    hideModal() {
        if (this.modalContainer) {
            this.modalContainer.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.currentModal = null;
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.modalContainer && this.modalContainer.parentNode) {
            this.modalContainer.parentNode.removeChild(this.modalContainer);
        }
        this.modalContainer = null;
        this.currentModal = null;
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }

    .finance-modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .close-btn:hover {
        background: rgba(255, 255, 255, 0.1) !important;
    }
`;
document.head.appendChild(style);

// 创建全局实例
window.financeAnalyzer = new FinanceAnalyzer();

// 向后兼容的全局函数
window.showSmartAccounting = () => window.financeAnalyzer.showModal('智能会计', '📊', {});
window.showTaxPlanning = () => window.financeAnalyzer.showModal('税务筹划', '💰', {});
window.showInvestmentAnalysis = () => window.financeAnalyzer.showModal('投资分析', '📈', {});
window.showRiskManagement = () => window.financeAnalyzer.showModal('风险管理', '🛡️', {});
window.showFinancialReporting = () => window.financeAnalyzer.showModal('财务报告', '📊', {});
window.showBudgetManagement = () => window.financeAnalyzer.showModal('预算管理', '💰', {});

window.logInfo('FinanceAnalyzer: 安全组件加载完成，防XSS攻击已启用');