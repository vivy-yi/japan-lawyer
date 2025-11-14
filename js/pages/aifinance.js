// AI财务服务页面脚本
window.logInfo('✅ AI Finance Services page loaded successfully');

// 确保filterFinance函数在全局作用域中可用
window.filterFinance = window.filterFinance || function(category) {
    window.logInfo('🔧 Fallback filterFinance called with category:', category);
    // 临时实现，等待主函数加载
    setTimeout(() => {
        if (window.filterFinance && window.filterFinance !== arguments.callee) {
            window.filterFinance(category);
        }
    }, 100);
};

// Fallback已移除 - 现在使用统一的筛选管理器

// 工具函数 - 使用全局共享函数避免重复定义
// escapeHtml 现在在 js/shared/utils.js 中定义

// AI财务服务筛选功能 - 使用统一筛选管理器
window.filterFinance = function(category) {
    window.logInfo('💰 Using unified filter manager for AI Finance services');
    let manager = window.getFilterManager('aifinance');
    if (!manager) {
        manager = window.createFilterManager('aifinance');
    }
    manager.filterByCategory(category);
};

// AI财务服务搜索功能 - 使用统一筛选管理器
window.searchFinance = function() {
    window.logInfo('💰 Using unified filter manager for AI Finance search');
    let manager = window.getFilterManager('aifinance');
    if (!manager) {
        manager = window.createFilterManager('aifinance');
    }
    manager.search();
};

// 显示AI财务无结果消息
function showFinanceNoResultsMessage(visibleCount, totalCount) {
    // 移除现有的无结果消息
    const existingMessage = document.querySelector('.finance-no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    if (visibleCount === 0 && totalCount > 0) {
        const grid = document.querySelector('.finance-grid');
        if (grid) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'finance-no-results-message';
            noResultsDiv.innerHTML = `
                <div class="no-results-icon">💰</div>
                <h3>未找到相关财务服务</h3>
                <p>请尝试使用其他关键词或浏览全部财务服务</p>
                <button class="no-results-btn" onclick="filterFinance('all')">查看全部服务</button>
            `;
            noResultsDiv.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            `;
            grid.appendChild(noResultsDiv);
        }
    }
}

// 添加AI财务动画样式
const financeFadeInUpStyle = document.createElement('style');
financeFadeInUpStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .finance-no-results-message {
        animation: fadeInUp 0.5s ease forwards;
    }

    .filter-hidden {
        opacity: 0;
        transform: scale(0.9);
        transition: all 0.3s ease;
    }

    .filter-visible {
        opacity: 1;
        transform: scale(1);
        transition: all 0.3s ease;
    }

    .finance-no-results-message .no-results-icon {
        font-size: 3rem;
        margin-bottom: 20px;
        opacity: 0.6;
    }

    .finance-no-results-message h3 {
        color: #374151;
        margin-bottom: 10px;
        font-size: 1.3rem;
    }

    .finance-no-results-message p {
        color: #6b7280;
        margin-bottom: 25px;
        font-size: 1rem;
    }

    .finance-no-results-message .no-results-btn {
        background: var(--success);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .finance-no-results-message .no-results-btn:hover {
        background: #059669;
        transform: translateY(-2px);
    }
`;

// 确保样式只添加一次
if (!document.querySelector('style[data-finance-animation]')) {
    financeFadeInUpStyle.setAttribute('data-finance-animation', 'true');
    document.head.appendChild(financeFadeInUpStyle);
}

// AI财务服务初始化
window.initAifinancePage = function() {
    window.logInfo('💰 Initializing AI Finance Services functionality...');

    // 预先创建筛选管理器，确保筛选功能可用
    let manager = window.getFilterManager('aifinance');
    if (!manager) {
        window.logInfo('💰 Creating AI Finance filter manager during initialization...');
        manager = window.createFilterManager('aifinance');
    }

    // 添加页面特定的功能按钮事件
    const financeButtons = document.querySelectorAll('[data-finance-action]');
    financeButtons.forEach(button => {
        button.addEventListener('click', handleFinanceAction);
    });

    // 延迟检查筛选管理器状态，确保DOM已完全加载
    setTimeout(() => {
        const cards = document.querySelectorAll('.finance-card');
        const tags = document.querySelectorAll('.tag');
        window.logInfo(`💰 Filter check: Found ${cards.length} cards and ${tags.length} tags`);

        if (cards.length > 0) {
            window.logInfo('✅ AI Finance filter manager initialized successfully');
        } else {
            window.logWarn('⚠️ AI Finance cards not found, filter may not work properly');
        }
    }, 100);
};

// 处理AI财务服务操作
function handleFinanceAction(event) {
    const action = event.target.getAttribute('data-finance-action');
    window.logInfo(`💰 Finance action triggered: ${action}`);

    switch (action) {
        case 'smart-accounting':
            window.showSmartAccounting();
            break;
        case 'tax-planning':
            window.showTaxPlanning();
            break;
        case 'investment-analysis':
            window.showInvestmentAnalysis();
            break;
        case 'risk-management':
            window.showRiskManagement();
            break;
        case 'financial-reporting':
            window.showFinancialReporting();
            break;
        case 'budget-management':
            window.showBudgetManagement();
            break;
        default:
            window.logInfo(`Unknown finance action: ${action}`);
    }
}

// 安全创建DOM元素
function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = escapeHtml(textContent);
    return element;
}

// 创建模态窗口的安全方法
function createFinanceModal(title, contentHtml) {
    const modal = createElement('div', 'ai-finance-modal-overlay');

    const modalContent = createElement('div', 'ai-finance-modal');

    const header = createElement('div', 'ai-finance-modal-header');
    const titleElement = createElement('h3');
    titleElement.textContent = title;
    header.appendChild(titleElement);

    const closeButton = createElement('button', 'ai-finance-modal-close');
    closeButton.textContent = '×';
    closeButton.onclick = () => modal.remove();
    header.appendChild(closeButton);

    const content = createElement('div', 'ai-finance-modal-content');
    content.innerHTML = contentHtml; // 注意：这里使用了innerHTML，但在实际项目中应该使用DOMPurify等安全库

    modalContent.appendChild(header);
    modalContent.appendChild(content);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    // 添加显示动画
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);

    return modal;
}

// 显示智能会计
window.showSmartAccounting = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在分析您的会计数据，准备智能记账方案...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="accounting-result">
                <h4>📊 智能会计分析报告</h4>
                <div class="accounting-metrics">
                    <div class="metric-item">
                        <h5>📈 自动化处理率</h5>
                        <div class="metric-value high">85%</div>
                        <p>基于历史数据分析，可自动处理85%的日常会计事务</p>
                    </div>
                    <div class="metric-item">
                        <h5>⚡ 处理效率提升</h5>
                        <div class="metric-value medium">3.2倍</div>
                        <p>相比传统手工记账，处理效率提升3.2倍</p>
                    </div>
                    <div class="metric-item">
                        <h5>🎯 准确率</h5>
                        <div class="metric-value high">99.8%</div>
                        <p>AI识别和分类准确率达到99.8%</p>
                    </div>
                </div>
                <div class="automation-features">
                    <h5>🤖 自动化功能</h5>
                    <ul>
                        <li>发票智能识别与分类</li>
                        <li>银行流水自动对账</li>
                        <li>费用报销智能审核</li>
                        <li>财务报表自动生成</li>
                        <li>异常交易智能预警</li>
                    </ul>
                </div>
                <div class="action-buttons">
                    <button class="accounting-btn" onclick="startAccountingSetup()">开始设置</button>
                    <button class="accounting-btn secondary" onclick="requestAccountingDemo()">申请演示</button>
                </div>
            </div>
        </div>
    `;

    const modal = createFinanceModal('📊 AI智能会计', content);

    // 模拟AI处理
    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示税务筹划
window.showTaxPlanning = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在分析您的税务结构，制定优化方案...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="tax-result">
                <h4>💰 AI税务筹划方案</h4>
                <div class="tax-analysis">
                    <div class="tax-item">
                        <h5>📉 预计节税空间</h5>
                        <div class="saving-amount">
                            <span class="amount-value">¥125,000 - ¥280,000</span>
                            <span class="amount-period">/年</span>
                        </div>
                        <p>基于当前业务结构，通过合理筹划可节省约15-25%的税负</p>
                    </div>
                    <div class="tax-strategies">
                        <h5>🎯 优化策略</h5>
                        <ul>
                            <li>利用税收优惠政策</li>
                            <li>合理费用结构调整</li>
                            <li>折旧方法优化</li>
                            <li>跨期收入确认策略</li>
                            <li>研发费用加计扣除</li>
                        </ul>
                    </div>
                    <div class="risk-assessment">
                        <h5>🛡️ 合规风险评估</h5>
                        <div class="risk-level low">低风险</div>
                        <p>所有筹划方案均在合法合规范围内，风险等级低</p>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="tax-btn" onclick="implementTaxStrategy()">实施筹划</button>
                    <button class="tax-btn secondary" onclick="consultTaxExpert()">咨询专家</button>
                </div>
            </div>
        </div>
    `;

    const modal = createFinanceModal('📑 AI税务筹划', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示投资分析
window.showInvestmentAnalysis = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在进行AI投资分析，评估市场机会...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="investment-result">
                <h4>📈 AI投资分析报告</h4>
                <div class="market-overview">
                    <h5>🌍 市场机会评估</h5>
                    <div class="opportunity-items">
                        <div class="opportunity-item">
                            <h6>科技股票</h6>
                            <div class="opportunity-score high">8.5/10</div>
                            <p>AI驱动的科技公司具有较高增长潜力</p>
                        </div>
                        <div class="opportunity-item">
                            <h6>绿色能源</h6>
                            <div class="opportunity-score medium">7.2/10</div>
                            <p>碳中和政策推动，长期发展前景良好</p>
                        </div>
                        <div class="opportunity-item">
                            <h6>医疗健康</h6>
                            <div class="opportunity-score high">8.0/10</div>
                            <p>人口老龄化趋势，需求稳定增长</p>
                        </div>
                    </div>
                </div>
                <div class="risk-analysis">
                    <h5>⚠️ 风险分析</h5>
                    <div class="risk-factors">
                        <div class="risk-factor">
                            <span class="risk-type">市场风险</span>
                            <span class="risk-level medium">中等</span>
                        </div>
                        <div class="risk-factor">
                            <span class="risk-type">流动性风险</span>
                            <span class="risk-level low">较低</span>
                        </div>
                        <div class="risk-factor">
                            <span class="risk-type">政策风险</span>
                            <span class="risk-level medium">中等</span>
                        </div>
                    </div>
                </div>
                <div class="portfolio-suggestion">
                    <h5>💼 投资组合建议</h5>
                    <ul>
                        <li>股票投资: 60% - 分散配置不同行业</li>
                        <li>债券投资: 25% - 稳定收益，降低风险</li>
                        <li>另类投资: 15% - 房地产信托、商品等</li>
                    </ul>
                </div>
                <div class="action-buttons">
                    <button class="investment-btn" onclick="createPortfolio()">创建投资组合</button>
                    <button class="investment-btn secondary" onclick="scheduleInvestmentConsultation()">预约咨询</button>
                </div>
            </div>
        </div>
    `;

    const modal = createFinanceModal('📈 AI投资分析', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示风控管理
window.showRiskManagement = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在进行风险评估，识别潜在风险...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="risk-result">
                <h4>🛡️ AI风控分析报告</h4>
                <div class="risk-assessment">
                    <h5>🎯 综合风险评级</h5>
                    <div class="overall-risk">
                        <span class="risk-grade medium">B+</span>
                        <p>中等风险水平，需要适当管控措施</p>
                    </div>
                </div>
                <div class="risk-categories">
                    <div class="risk-category">
                        <h6>🏛️ 信用风险</h6>
                        <div class="risk-score">
                            <span class="score-label">风险评分:</span>
                            <span class="score-value medium">65/100</span>
                        </div>
                        <p>建议加强客户信用评估，完善授信政策</p>
                    </div>
                    <div class="risk-category">
                        <h6>💧 流动性风险</h6>
                        <div class="risk-score">
                            <span class="score-label">风险评分:</span>
                            <span class="score-value low">35/100</span>
                        </div>
                        <p>现金流状况良好，流动性风险较低</p>
                    </div>
                    <div class="risk-category">
                        <h6>⚙️ 操作风险</h6>
                        <div class="risk-score">
                            <span class="score-label">风险评分:</span>
                            <span class="score-value medium">58/100</span>
                        </div>
                        <p>建议完善内控制度，加强员工培训</p>
                    </div>
                    <div class="risk-category">
                        <h6>📊 市场风险</h6>
                        <div class="risk-score">
                            <span class="score-label">风险评分:</span>
                            <span class="score-value high">72/100</span>
                        </div>
                        <p>市场波动较大，需要加强风险管理</p>
                    </div>
                </div>
                <div class="risk-recommendations">
                    <h5>💡 风险管控建议</h5>
                    <ul>
                        <li>建立完善的风险预警机制</li>
                        <li>定期进行风险评估和压力测试</li>
                        <li>优化资产配置，分散投资风险</li>
                        <li>加强内部控制和合规管理</li>
                        <li>建立应急预案和风险处置流程</li>
                    </ul>
                </div>
                <div class="action-buttons">
                    <button class="risk-btn" onclick="implementRiskControls()">实施风控措施</button>
                    <button class="risk-btn secondary" onclick="requestRiskReport()">详细报告</button>
                </div>
            </div>
        </div>
    `;

    const modal = createFinanceModal('🛡️ AI风控管理', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示财务报表
window.showFinancialReporting = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在生成智能财务报表，分析关键指标...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="reporting-result">
                <h4>📋 AI财务报表分析</h4>
                <div class="report-summary">
                    <h5>📊 财务概况</h5>
                    <div class="financial-metrics">
                        <div class="metric">
                            <span class="metric-label">营业收入</span>
                            <span class="metric-value positive">¥2,850,000</span>
                            <span class="metric-change">+15.2%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">净利润</span>
                            <span class="metric-value positive">¥425,000</span>
                            <span class="metric-change">+8.7%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">总资产</span>
                            <span class="metric-value">¥5,680,000</span>
                            <span class="metric-change">+6.3%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">净资产</span>
                            <span class="metric-value">¥3,420,000</span>
                            <span class="metric-change">+12.1%</span>
                        </div>
                    </div>
                </div>
                <div class="report-analysis">
                    <h5>🔍 财务分析</h5>
                    <div class="analysis-items">
                        <div class="analysis-item">
                            <h6>💰 盈利能力</h6>
                            <div class="analysis-score good">良好</div>
                            <p>毛利率35.2%，净利率14.9%，处于行业较好水平</p>
                        </div>
                        <div class="analysis-item">
                            <h6>📈 成长性</h6>
                            <div class="analysis-score good">良好</div>
                            <p>营收增长15.2%，显示良好的发展势头</p>
                        </div>
                        <div class="analysis-item">
                            <h6>⚖️ 偿债能力</h6>
                            <div class="analysis-score normal">正常</div>
                            <p>流动比率1.8，速动比率1.2，短期偿债能力正常</p>
                        </div>
                    </div>
                </div>
                <div class="report-suggestions">
                    <h5>💡 优化建议</h5>
                    <ul>
                        <li>加强成本控制，提高毛利率</li>
                        <li>优化库存管理，提高资金使用效率</li>
                        <li>关注现金流管理，确保流动性安全</li>
                        <li>考虑增加研发投入，提升核心竞争力</li>
                    </ul>
                </div>
                <div class="action-buttons">
                    <button class="reporting-btn" onclick="generateCustomReport()">生成自定义报表</button>
                    <button class="reporting-btn secondary" onclick="downloadReport()">下载完整报告</button>
                </div>
            </div>
        </div>
    `;

    const modal = createFinanceModal('📋 AI财务报表', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示预算管理
window.showBudgetManagement = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在分析预算执行情况，提供优化建议...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="budget-result">
                <h4>💎 AI预算管理分析</h4>
                <div class="budget-overview">
                    <h5>📊 预算执行概况</h5>
                    <div class="budget-stats">
                        <div class="budget-stat">
                            <span class="stat-label">总预算</span>
                            <span class="stat-value">¥1,200,000</span>
                        </div>
                        <div class="budget-stat">
                            <span class="stat-label">已执行</span>
                            <span class="stat-value">¥850,000</span>
                            <span class="stat-percentage">70.8%</span>
                        </div>
                        <div class="budget-stat">
                            <span class="stat-label">剩余预算</span>
                            <span class="stat-value">¥350,000</span>
                            <span class="stat-percentage">29.2%</span>
                        </div>
                    </div>
                </div>
                <div class="budget-analysis">
                    <h5>🎯 预算执行分析</h5>
                    <div class="budget-categories">
                        <div class="budget-category">
                            <h6>🏢 营销费用</h6>
                            <div class="budget-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 85%"></div>
                                </div>
                                <span class="progress-text">¥320,000 / ¥376,000 (85%)</span>
                            </div>
                        </div>
                        <div class="budget-category">
                            <h6>👥 人力成本</h6>
                            <div class="budget-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 72%"></div>
                                </div>
                                <span class="progress-text">¥432,000 / ¥600,000 (72%)</span>
                            </div>
                        </div>
                        <div class="budget-category">
                            <h6>⚙️ 运营费用</h6>
                            <div class="budget-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 58%"></div>
                                </div>
                                <span class="progress-text">¥98,000 / ¥169,000 (58%)</span>
                            </div>
                        </div>
                        <div class="budget-category">
                            <h6>🔧 研发投入</h6>
                            <div class="budget-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill warning" style="width: 95%"></div>
                                </div>
                                <span class="progress-text warning">¥142,500 / ¥150,000 (95%)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="budget-optimization">
                    <h5>💡 预算优化建议</h5>
                    <ul>
                        <li>研发投入即将超预算，建议追加投入或调整项目优先级</li>
                        <li>营销费用执行良好，可考虑增加高效渠道投入</li>
                        <li>运营费用有结余，可优化资源配置或转入其他项目</li>
                        <li>人力成本控制在预算范围内，维持当前水平</li>
                    </ul>
                </div>
                <div class="action-buttons">
                    <button class="budget-btn" onclick="adjustBudget()">调整预算分配</button>
                    <button class="budget-btn secondary" onclick="generateBudgetReport()">生成预算报告</button>
                </div>
            </div>
        </div>
    `;

    const modal = createFinanceModal('💎 AI预算管理', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 辅助功能实现
window.startAccountingSetup = function() {
    alert('智能会计设置功能正在开发中，敬请期待！');
};

window.requestAccountingDemo = function() {
    alert('会计演示申请功能正在开发中，敬请期待！');
};

window.implementTaxStrategy = function() {
    alert('税务筹划实施功能正在开发中，敬请期待！');
};

window.consultTaxExpert = function() {
    alert('税务专家咨询功能正在开发中，敬请期待！');
};

window.createPortfolio = function() {
    alert('投资组合创建功能正在开发中，敬请期待！');
};

window.scheduleInvestmentConsultation = function() {
    alert('投资咨询预约功能正在开发中，敬请期待！');
};

window.implementRiskControls = function() {
    alert('风控措施实施功能正在开发中，敬请期待！');
};

window.requestRiskReport = function() {
    alert('风险报告申请功能正在开发中，敬请期待！');
};

window.generateCustomReport = function() {
    alert('自定义报表生成功能正在开发中，敬请期待！');
};

window.downloadReport = function() {
    alert('报告下载功能正在开发中，敬请期待！');
};

window.adjustBudget = function() {
    alert('预算调整功能正在开发中，敬请期待！');
};

window.generateBudgetReport = function() {
    alert('预算报告生成功能正在开发中，敬请期待！');
};

// 页面加载完成后初始化 - 支持SPA和直接访问
document.addEventListener('DOMContentLoaded', function() {
    // 等待其他脚本加载完成
    setTimeout(() => {
        if (document.body) {
            window.initAifinancePage();
        }
    }, 500);
});

// SPA页面加载时的额外初始化
window.initAifinancePageForSPA = function() {
    window.logInfo('💰 AI Finance SPA initialization triggered...');
    // 立即初始化，不等待DOMContentLoaded
    if (document.body) {
        window.initAifinancePage();
    }
};

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        window.initAifinancePageForSPA();
    }, 100);
}