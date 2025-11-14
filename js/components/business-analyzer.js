/**
 * Business Analyzer Component - 完全安全版本
 * 防止XSS攻击的AI商务分析组件
 * 100% 安全DOM操作，无innerHTML使用
 */
class BusinessAnalyzer {
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
        window.logInfo('BusinessAnalyzer: 完全安全的商务分析组件已初始化');
    }

    /**
     * 创建模态框容器
     */
    createModalContainer() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'business-modal-container';
        this.setStyles(this.modalContainer, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'none',
            zIndex: '10000',
            justifyContent: 'center',
            alignItems: 'center'
        });
        document.body.appendChild(this.modalContainer);
    }

    /**
     * 安全设置样式
     */
    setStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.hideModal();
            }
        });
    }

    /**
     * 显示模态框 - 完全安全版本
     */
    showModal(title, icon, data) {
        try {
            const modal = this.createSecureModal(title, icon, data);
            this.clearModal();
            this.modalContainer.appendChild(modal);
            this.modalContainer.style.display = 'flex';
            this.currentModal = modal;
            document.body.style.overflow = 'hidden';
        } catch (error) {
            window.logError('BusinessAnalyzer: 显示模态框时出错', error);
            this.showError('显示分析界面时出现错误，请稍后重试。');
        }
    }

    /**
     * 清空模态框容器
     */
    clearModal() {
        while (this.modalContainer.firstChild) {
            this.modalContainer.removeChild(this.modalContainer.firstChild);
        }
    }

    /**
     * 创建安全的模态框元素
     */
    createSecureModal(title, icon, data) {
        const modal = document.createElement('div');
        modal.className = 'business-modal';
        this.setStyles(modal, {
            background: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '85vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative'
        });

        const header = this.createModalHeader(title, icon);
        modal.appendChild(header);

        const thinking = this.createThinkingAnimation();
        modal.appendChild(thinking);

        const content = this.createSecureContent(title, data);
        content.style.display = 'none';
        modal.appendChild(content);

        // 模拟AI处理延迟
        setTimeout(() => {
            if (thinking.parentNode) {
                thinking.style.display = 'none';
            }
            content.style.display = 'block';
        }, 2000);

        return modal;
    }

    /**
     * 创建模态框头部
     */
    createModalHeader(title, icon) {
        const header = document.createElement('div');
        header.className = 'modal-header';
        this.setStyles(header, {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        });

        const titleElement = document.createElement('h2');
        titleElement.textContent = `${icon} ${title}`;
        this.setStyles(titleElement, {
            margin: '0',
            fontSize: '24px',
            fontWeight: '600'
        });

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.textContent = '✕';
        this.setStyles(closeBtn, {
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '0',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
        });

        header.appendChild(titleElement);
        header.appendChild(closeBtn);

        return header;
    }

    /**
     * 创建AI处理动画
     */
    createThinkingAnimation() {
        const thinking = document.createElement('div');
        thinking.className = 'ai-thinking';
        this.setStyles(thinking, {
            padding: '40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
        });

        const spinner = document.createElement('div');
        spinner.className = 'ai-spinner';
        this.setStyles(spinner, {
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%'
        });

        const thinkingText = document.createElement('p');
        thinkingText.textContent = '正在进行AI智能分析...';
        this.setStyles(thinkingText, {
            margin: '0',
            color: '#666',
            fontSize: '16px'
        });

        thinking.appendChild(spinner);
        thinking.appendChild(thinkingText);

        // 添加旋转动画
        const style = document.createElement('style');
        style.textContent = `
            .ai-spinner {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        return thinking;
    }

    /**
     * 创建安全的内容区域
     */
    createSecureContent(title, data) {
        const content = document.createElement('div');
        content.className = 'modal-content';
        this.setStyles(content, {
            padding: '30px',
            maxHeight: '60vh',
            overflowY: 'auto'
        });

        const contentMap = {
            'AI智能市场分析': () => this.createMarketAnalysisContent(),
            'AI法律合规助手': () => this.createLegalComplianceContent(),
            'AI全球化营销': () => this.createGlobalMarketingContent(),
            'AI智能运营管理': () => this.createOperationManagementContent(),
            'AI财务税务管理': () => this.createFinanceTaxContent(),
            'AI本地化解决方案': () => this.createLocalizationContent()
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
     * 市场分析内容
     */
    createMarketAnalysisContent() {
        const container = document.createElement('div');

        const title = document.createElement('h4');
        title.textContent = '🎯 推荐目标市场';
        this.setStyles(title, {
            margin: '0 0 20px 0',
            color: '#2d3748'
        });

        container.appendChild(title);

        const markets = [
            {
                name: '🇺🇸 美国市场',
                score: '92%',
                scoreClass: 'high',
                points: [
                    '市场规模大，消费能力强',
                    '技术接受度高，竞争激烈',
                    '需要关注合规和税务问题'
                ]
            },
            {
                name: '🇪🇺 欧盟市场',
                score: '78%',
                scoreClass: 'medium',
                points: [
                    '法规统一，市场稳定',
                    '消费者品质要求高',
                    '需要GDPR等合规考虑'
                ]
            }
        ];

        markets.forEach(market => {
            const marketItem = this.createMarketItem(market);
            container.appendChild(marketItem);
        });

        container.appendChild(this.createActionButtons('市场分析'));
        return container;
    }

    /**
     * 创建市场项目
     */
    createMarketItem(market) {
        const item = document.createElement('div');
        item.className = 'market-item';
        this.setStyles(item, {
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = market.name;
        this.setStyles(title, {
            margin: '0 0 10px 0',
            color: '#2d3748',
            fontSize: '18px'
        });

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'market-score';
        this.setStyles(scoreDiv, {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
        });

        const scoreLabel = document.createElement('span');
        scoreLabel.className = 'score-label';
        scoreLabel.textContent = '匹配度:';
        this.setStyles(scoreLabel, {
            color: '#718096',
            fontWeight: '500'
        });

        const scoreValue = document.createElement('span');
        scoreValue.className = 'score-value ' + market.scoreClass;
        scoreValue.textContent = market.score;
        this.setStyles(scoreValue, {
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '6px',
            background: market.scoreClass === 'high' ? '#48bb78' : '#ed8936',
            color: 'white'
        });

        scoreDiv.appendChild(scoreLabel);
        scoreDiv.appendChild(scoreValue);

        const pointsList = document.createElement('ul');
        this.setStyles(pointsList, {
            margin: '0',
            paddingLeft: '20px',
            color: '#4a5568',
            lineHeight: '1.6'
        });

        market.points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            pointsList.appendChild(li);
        });

        item.appendChild(title);
        item.appendChild(scoreDiv);
        item.appendChild(pointsList);

        return item;
    }

    /**
     * 法律合规内容
     */
    createLegalComplianceContent() {
        const container = document.createElement('div');

        const title = document.createElement('h4');
        title.textContent = '📋 合规检查报告';
        this.setStyles(title, {
            margin: '0 0 20px 0',
            color: '#2d3748'
        });

        container.appendChild(title);

        const areas = [
            {
                title: '🏢 公司注册合规',
                status: '✅ 基本合规',
                statusClass: 'success',
                description: '建议在当地设立子公司或分支机构，满足当地公司法要求'
            },
            {
                title: '🛡️ 数据保护合规',
                status: '⚠️ 需要关注',
                statusClass: 'warning',
                description: '需根据目标市场实施GDPR、CCPA等数据保护法规'
            },
            {
                title: '💼 知识产权保护',
                status: '✅ 建议完善',
                statusClass: 'success',
                description: '建议在目标市场提前申请商标和专利保护'
            }
        ];

        areas.forEach(area => {
            const areaItem = this.createComplianceArea(area);
            container.appendChild(areaItem);
        });

        container.appendChild(this.createActionButtons('法律合规'));
        return container;
    }

    /**
     * 创建合规区域
     */
    createComplianceArea(area) {
        const areaDiv = document.createElement('div');
        areaDiv.className = 'compliance-area';
        this.setStyles(areaDiv, {
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = area.title;
        this.setStyles(title, {
            margin: '0 0 10px 0',
            color: '#2d3748',
            fontSize: '18px'
        });

        const status = document.createElement('div');
        status.className = 'compliance-status ' + area.statusClass;
        status.textContent = area.status;
        this.setStyles(status, {
            fontWeight: 'bold',
            marginBottom: '10px',
            color: area.statusClass === 'success' ? '#38a169' : '#d69e2e'
        });

        const description = document.createElement('p');
        description.textContent = area.description;
        this.setStyles(description, {
            margin: '0',
            color: '#4a5568',
            lineHeight: '1.6'
        });

        areaDiv.appendChild(title);
        areaDiv.appendChild(status);
        areaDiv.appendChild(description);

        return areaDiv;
    }

    /**
     * 全球化营销内容
     */
    createGlobalMarketingContent() {
        const container = document.createElement('div');

        const title = document.createElement('h4');
        title.textContent = '🎯 AI营销策略';
        this.setStyles(title, {
            margin: '0 0 20px 0',
            color: '#2d3748'
        });

        container.appendChild(title);

        const channels = [
            {
                title: '🌐 数字营销渠道',
                items: ['Google Ads - 精准搜索广告', 'Facebook/Instagram - 社交媒体营销', 'LinkedIn - B2B专业营销', 'TikTok - 年轻用户群体']
            },
            {
                title: '📝 内容营销策略',
                items: ['多语言AI内容生成', '本地化文化适配', 'SEO优化策略', '视频内容创作']
            }
        ];

        const channelsDiv = document.createElement('div');
        channelsDiv.className = 'marketing-channels';
        this.setStyles(channelsDiv, {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
        });

        channels.forEach(channel => {
            const channelItem = this.createChannelItem(channel);
            channelsDiv.appendChild(channelItem);
        });

        container.appendChild(channelsDiv);

        const budgetForecast = this.createBudgetForecast();
        container.appendChild(budgetForecast);

        container.appendChild(this.createActionButtons('全球化营销'));
        return container;
    }

    /**
     * 创建渠道项目
     */
    createChannelItem(channel) {
        const item = document.createElement('div');
        item.className = 'channel-item';
        this.setStyles(item, {
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = channel.title;
        this.setStyles(title, {
            margin: '0 0 15px 0',
            color: '#2d3748',
            fontSize: '18px'
        });

        const list = document.createElement('ul');
        this.setStyles(list, {
            margin: '0',
            paddingLeft: '20px',
            color: '#4a5568',
            lineHeight: '1.6'
        });

        channel.items.forEach(itemText => {
            const li = document.createElement('li');
            li.textContent = itemText;
            list.appendChild(li);
        });

        item.appendChild(title);
        item.appendChild(list);

        return item;
    }

    /**
     * 创建预算预测
     */
    createBudgetForecast() {
        const forecast = document.createElement('div');
        forecast.className = 'budget-forecast';
        this.setStyles(forecast, {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = '💰 AI预算预测';
        this.setStyles(title, {
            margin: '0 0 15px 0',
            color: 'white'
        });

        forecast.appendChild(title);

        const budgetItems = [
            { label: '建议初期月预算:', value: '$5,000 - $10,000' },
            { label: '预期ROI:', value: '250% - 400%', valueClass: 'positive' }
        ];

        budgetItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'budget-item';
            this.setStyles(itemDiv, {
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
            });

            const label = document.createElement('span');
            label.className = 'budget-label';
            label.textContent = item.label;

            const value = document.createElement('span');
            value.className = 'budget-value ' + (item.valueClass || '');
            value.textContent = item.value;
            this.setStyles(value, {
                fontWeight: 'bold',
                color: item.valueClass === 'positive' ? '#68d391' : 'white'
            });

            itemDiv.appendChild(label);
            itemDiv.appendChild(value);
            forecast.appendChild(itemDiv);
        });

        return forecast;
    }

    /**
     * 运营管理内容
     */
    createOperationManagementContent() {
        const container = document.createElement('div');

        const title = document.createElement('h4');
        title.textContent = '📊 运营优化建议';
        this.setStyles(title, {
            margin: '0 0 20px 0',
            color: '#2d3748'
        });

        container.appendChild(title);

        const areas = [
            {
                title: '📦 供应链优化',
                potential: '35%',
                potentialClass: 'high',
                points: [
                    '智能库存预测，减少库存成本',
                    '供应商AI评估与优选',
                    '物流路径智能规划'
                ]
            },
            {
                title: '👥 人力资源配置',
                potential: '25%',
                potentialClass: 'medium',
                points: [
                    '跨时区团队协作优化',
                    'AI人员技能匹配',
                    '远程工作效率提升'
                ]
            },
            {
                title: '💰 成本控制',
                potential: '40%',
                potentialClass: 'high',
                points: [
                    '运营成本AI分析',
                    '自动化流程减少人工成本',
                    '资源配置智能优化'
                ]
            }
        ];

        areas.forEach(area => {
            const areaItem = this.createOperationArea(area);
            container.appendChild(areaItem);
        });

        container.appendChild(this.createActionButtons('运营管理'));
        return container;
    }

    /**
     * 创建运营区域
     */
    createOperationArea(area) {
        const areaDiv = document.createElement('div');
        areaDiv.className = 'operation-area';
        this.setStyles(areaDiv, {
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = area.title;
        this.setStyles(title, {
            margin: '0 0 10px 0',
            color: '#2d3748',
            fontSize: '18px'
        });

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'optimization-score';
        this.setStyles(scoreDiv, {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
        });

        const scoreLabel = document.createElement('span');
        scoreLabel.className = 'score-label';
        scoreLabel.textContent = '优化潜力:';
        this.setStyles(scoreLabel, {
            color: '#718096',
            fontWeight: '500'
        });

        const scoreValue = document.createElement('span');
        scoreValue.className = 'score-value ' + area.potentialClass;
        scoreValue.textContent = area.potential;
        this.setStyles(scoreValue, {
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '6px',
            background: area.potentialClass === 'high' ? '#48bb78' : '#ed8936',
            color: 'white'
        });

        scoreDiv.appendChild(scoreLabel);
        scoreDiv.appendChild(scoreValue);

        const pointsList = document.createElement('ul');
        this.setStyles(pointsList, {
            margin: '0',
            paddingLeft: '20px',
            color: '#4a5568',
            lineHeight: '1.6'
        });

        area.points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            pointsList.appendChild(li);
        });

        areaDiv.appendChild(title);
        areaDiv.appendChild(scoreDiv);
        areaDiv.appendChild(pointsList);

        return areaDiv;
    }

    /**
     * 财务税务内容
     */
    createFinanceTaxContent() {
        const container = document.createElement('div');

        const title = document.createElement('h4');
        title.textContent = '📈 财务税务优化方案';
        this.setStyles(title, {
            margin: '0 0 20px 0',
            color: '#2d3748'
        });

        container.appendChild(title);

        const strategies = [
            {
                title: '🌍 全球税务筹划',
                saving: '15% - 25%',
                points: [
                    '利用税收协定优势',
                    '转移定价策略优化',
                    '合规税务结构设计'
                ]
            },
            {
                title: '💱 汇率风险管理',
                risk: '中等',
                riskClass: 'medium',
                points: [
                    '外汇敞口AI对冲',
                    '汇率趋势预测',
                    '多币种资金池管理'
                ]
            }
        ];

        const strategiesDiv = document.createElement('div');
        strategiesDiv.className = 'tax-strategies';
        this.setStyles(strategiesDiv, {
            marginBottom: '20px'
        });

        strategies.forEach(strategy => {
            const strategyItem = this.createTaxItem(strategy);
            strategiesDiv.appendChild(strategyItem);
        });

        container.appendChild(strategiesDiv);

        const paymentOptimization = this.createPaymentOptimization();
        container.appendChild(paymentOptimization);

        container.appendChild(this.createActionButtons('财务税务'));
        return container;
    }

    /**
     * 创建税务项目
     */
    createTaxItem(strategy) {
        const item = document.createElement('div');
        item.className = 'tax-item';
        this.setStyles(item, {
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = strategy.title;
        this.setStyles(title, {
            margin: '0 0 10px 0',
            color: '#2d3748',
            fontSize: '18px'
        });

        if (strategy.saving) {
            const savingDiv = document.createElement('div');
            savingDiv.className = 'tax-saving';
            this.setStyles(savingDiv, {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
            });

            const savingLabel = document.createElement('span');
            savingLabel.className = 'saving-label';
            savingLabel.textContent = '预计节税:';
            this.setStyles(savingLabel, {
                color: '#718096',
                fontWeight: '500'
            });

            const savingValue = document.createElement('span');
            savingValue.className = 'saving-value';
            savingValue.textContent = strategy.saving;
            this.setStyles(savingValue, {
                fontWeight: 'bold',
                color: '#38a169',
                background: '#c6f6d5',
                padding: '4px 8px',
                borderRadius: '6px'
            });

            savingDiv.appendChild(savingLabel);
            savingDiv.appendChild(savingValue);
            item.appendChild(savingDiv);
        }

        if (strategy.risk) {
            const riskDiv = document.createElement('div');
            riskDiv.className = 'risk-level';
            this.setStyles(riskDiv, {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
            });

            const riskLabel = document.createElement('span');
            riskLabel.className = 'risk-label';
            riskLabel.textContent = '风险等级:';
            this.setStyles(riskLabel, {
                color: '#718096',
                fontWeight: '500'
            });

            const riskValue = document.createElement('span');
            riskValue.className = 'risk-value ' + strategy.riskClass;
            riskValue.textContent = strategy.risk;
            this.setStyles(riskValue, {
                fontWeight: 'bold',
                color: '#d69e2e',
                background: '#faf089',
                padding: '4px 8px',
                borderRadius: '6px'
            });

            riskDiv.appendChild(riskLabel);
            riskDiv.appendChild(riskValue);
            item.appendChild(riskDiv);
        }

        const pointsList = document.createElement('ul');
        this.setStyles(pointsList, {
            margin: '0',
            paddingLeft: '20px',
            color: '#4a5568',
            lineHeight: '1.6'
        });

        strategy.points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            pointsList.appendChild(li);
        });

        item.appendChild(title);
        item.appendChild(pointsList);

        return item;
    }

    /**
     * 创建跨境支付优化
     */
    createPaymentOptimization() {
        const optimization = document.createElement('div');
        optimization.className = 'payment-optimization';
        this.setStyles(optimization, {
            background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = '💳 跨境支付优化';
        this.setStyles(title, {
            margin: '0 0 15px 0',
            color: 'white'
        });

        optimization.appendChild(title);

        const pointsList = document.createElement('ul');
        this.setStyles(pointsList, {
            margin: '0',
            paddingLeft: '20px',
            color: 'white',
            lineHeight: '1.6'
        });

        const points = [
            '智能支付路径选择，降低手续费',
            '实时汇率监控，优化结算时机',
            '多币种账户管理'
        ];

        points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            pointsList.appendChild(li);
        });

        optimization.appendChild(pointsList);
        return optimization;
    }

    /**
     * 本地化服务内容
     */
    createLocalizationContent() {
        const container = document.createElement('div');

        const title = document.createElement('h4');
        title.textContent = '🎯 本地化适配建议';
        this.setStyles(title, {
            margin: '0 0 20px 0',
            color: '#2d3748'
        });

        container.appendChild(title);

        const areas = [
            {
                title: '📝 内容本地化',
                score: '85%',
                scoreClass: 'high',
                points: [
                    '专业术语多语言翻译',
                    '文化敏感内容调整',
                    '当地表达习惯适配'
                ]
            },
            {
                title: '🎨 UI/UX本地化',
                score: '70%',
                scoreClass: 'medium',
                points: [
                    '界面布局适应当地习惯',
                    '颜色和图标文化适配',
                    '用户体验习惯优化'
                ]
            },
            {
                title: '🛒 商业模式本地化',
                score: '90%',
                scoreClass: 'high',
                points: [
                    '定价策略本地化',
                    '支付方式适配',
                    '客户服务本地化'
                ]
            }
        ];

        areas.forEach(area => {
            const areaItem = this.createLocalizationArea(area);
            container.appendChild(areaItem);
        });

        const culturalInsights = this.createCulturalInsights();
        container.appendChild(culturalInsights);

        container.appendChild(this.createActionButtons('本地化服务'));
        return container;
    }

    /**
     * 创建本地化区域
     */
    createLocalizationArea(area) {
        const areaDiv = document.createElement('div');
        areaDiv.className = 'localization-area';
        this.setStyles(areaDiv, {
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = area.title;
        this.setStyles(title, {
            margin: '0 0 10px 0',
            color: '#2d3748',
            fontSize: '18px'
        });

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'localization-score';
        this.setStyles(scoreDiv, {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
        });

        const scoreLabel = document.createElement('span');
        scoreLabel.className = 'score-label';
        scoreLabel.textContent = '适配度:';
        this.setStyles(scoreLabel, {
            color: '#718096',
            fontWeight: '500'
        });

        const scoreValue = document.createElement('span');
        scoreValue.className = 'score-value ' + area.scoreClass;
        scoreValue.textContent = area.score;
        this.setStyles(scoreValue, {
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '6px',
            background: area.scoreClass === 'high' ? '#48bb78' : '#ed8936',
            color: 'white'
        });

        scoreDiv.appendChild(scoreLabel);
        scoreDiv.appendChild(scoreValue);

        const pointsList = document.createElement('ul');
        this.setStyles(pointsList, {
            margin: '0',
            paddingLeft: '20px',
            color: '#4a5568',
            lineHeight: '1.6'
        });

        area.points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            pointsList.appendChild(li);
        });

        areaDiv.appendChild(title);
        areaDiv.appendChild(scoreDiv);
        areaDiv.appendChild(pointsList);

        return areaDiv;
    }

    /**
     * 创建文化洞察
     */
    createCulturalInsights() {
        const insights = document.createElement('div');
        insights.className = 'cultural-insights';
        this.setStyles(insights, {
            background: 'linear-gradient(135deg, #9f7aea 0%, #667eea 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        });

        const title = document.createElement('h5');
        title.textContent = '🔍 文化洞察';
        this.setStyles(title, {
            margin: '0 0 15px 0',
            color: 'white'
        });

        insights.appendChild(title);

        const insightItem = document.createElement('div');
        insightItem.className = 'insight-item';
        this.setStyles(insightItem, {
            marginBottom: '10px'
        });

        const strong = document.createElement('strong');
        strong.textContent = '目标市场文化特点: ';

        const text = document.createTextNode('重视个人隐私保护，偏好简洁直接的表达，对数据安全要求高');

        insightItem.appendChild(strong);
        insightItem.appendChild(text);

        insights.appendChild(insightItem);
        return insights;
    }

    /**
     * 创建操作按钮
     */
    createActionButtons(featureType) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'action-buttons';
        this.setStyles(buttonContainer, {
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            marginTop: '30px',
            flexWrap: 'wrap'
        });

        const primaryBtn = document.createElement('button');
        primaryBtn.className = 'action-btn';
        primaryBtn.textContent = this.getPrimaryButtonText(featureType);
        primaryBtn.setAttribute('data-action', 'primary');
        primaryBtn.setAttribute('data-feature', featureType);
        this.setStyles(primaryBtn, {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
        });

        const secondaryBtn = document.createElement('button');
        secondaryBtn.className = 'action-btn';
        secondaryBtn.textContent = '申请演示';
        secondaryBtn.setAttribute('data-action', 'demo');
        this.setStyles(secondaryBtn, {
            background: 'transparent',
            color: '#667eea',
            border: '2px solid #667eea',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
        });

        buttonContainer.appendChild(primaryBtn);
        buttonContainer.appendChild(secondaryBtn);

        return buttonContainer;
    }

    /**
     * 获取主要按钮文本
     */
    getPrimaryButtonText(featureType) {
        const buttonTexts = {
            '市场分析': '深度分析',
            '法律合规': '生成合规清单',
            '全球化营销': '生成营销计划',
            '运营管理': '实施优化',
            '财务税务': '实施税务策略',
            '本地化服务': '实施本地化'
        };

        return buttonTexts[featureType] || '立即体验';
    }

    /**
     * 处理按钮点击
     */
    handleActionClick(e) {
        const action = e.target.getAttribute('data-action');
        const feature = e.target.getAttribute('data-feature');

        if (action === 'primary') {
            this.handlePrimaryAction(feature);
        } else if (action === 'demo') {
            this.requestDemo(feature);
        }
    }

    /**
     * 处理主要操作
     */
    handlePrimaryAction(feature) {
        this.hideModal();
        setTimeout(() => {
            const messages = {
                '市场分析': '正在为您生成深度市场分析报告...',
                '法律合规': '正在为您生成详细的合规检查清单...',
                '全球化营销': '正在为您制定个性化营销计划...',
                '运营管理': '正在为您生成运营优化方案...',
                '财务税务': '正在为您制定税务筹划策略...',
                '本地化服务': '正在为您生成本地化实施方案...'
            };

            alert(`功能演示：${messages[feature] || '正在处理您的请求...'}\n\n在实际应用中，系统将：\n1. 分析您的具体需求\n2. 生成定制化方案\n3. 提供实施步骤指导\n4. 持续跟踪效果`);
        }, 300);
    }

    /**
     * 申请演示功能
     */
    requestDemo(service) {
        this.hideModal();
        setTimeout(() => {
            alert(`演示申请：${service}\n\n感谢您的关注！\n\n请通过以下方式联系我们：\n📧 邮箱：contact@example.com\n📱 电话：+81-123-456-7890\n\n我们将在24小时内与您联系，安排专属演示。`);
        }, 300);
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = message;
        this.setStyles(errorDiv, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#f56565',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            zIndex: '10002',
            fontSize: '14px'
        });
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
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .business-modal {
        position: relative;
        max-height: 85vh;
        overflow: hidden;
        animation: modalSlideIn 0.3s ease-out;
    }

    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .close-btn:hover {
        background: rgba(255, 255, 255, 0.1) !important;
    }
`;
document.head.appendChild(modalStyle);

// 创建全局实例
window.businessAnalyzer = new BusinessAnalyzer();

// 向后兼容的全局函数
window.showMarketAnalysis = () => window.businessAnalyzer.showModal('AI智能市场分析', '📊', {});
window.showLegalCompliance = () => window.businessAnalyzer.showModal('AI法律合规助手', '⚖️', {});
window.showGlobalMarketing = () => window.businessAnalyzer.showModal('AI全球化营销', '📱', {});
window.showOperationManagement = () => window.businessAnalyzer.showModal('AI智能运营管理', '⚙️', {});
window.showFinanceTax = () => window.businessAnalyzer.showModal('AI财务税务管理', '💰', {});
window.showLocalization = () => window.businessAnalyzer.showModal('AI本地化解决方案', '🌐', {});

// 保留原有的requestDemo函数
window.requestDemo = function(service) {
    window.businessAnalyzer.requestDemo(service);
};

window.logInfo('BusinessAnalyzer: 完全安全的商务分析组件加载完成，无XSS风险');