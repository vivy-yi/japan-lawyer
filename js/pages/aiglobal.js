// AI出海服务页面脚本
window.logInfo('✅ AI Global Expansion Services page loaded successfully');

// 确保共享工具已加载
if (typeof window.escapeHtml === 'undefined') {
    window.logWarn('⚠️ Shared utilities not loaded, using fallback');
}

// AI出海服务筛选功能 - 使用统一筛选管理器
window.filterGlobal = function(category) {
    window.logInfo('🌍 Using unified filter manager for AI Global services');
    let manager = window.getFilterManager('aiglobal');
    if (!manager) {
        manager = window.createFilterManager('aiglobal');
    }
    manager.filterByCategory(category);
};

// AI出海服务搜索功能 - 使用统一筛选管理器
window.searchGlobal = function() {
    window.logInfo('🌍 Using unified filter manager for AI Global search');
    let manager = window.getFilterManager('aiglobal');
    if (!manager) {
        manager = window.createFilterManager('aiglobal');
    }
    manager.search();
};

// 显示无结果消息
function showNoResultsMessage(visibleCount, totalCount) {
    // 移除现有的无结果消息
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    if (visibleCount === 0 && totalCount > 0) {
        const grid = document.querySelector('.global-grid');
        if (grid) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results-message';
            noResultsDiv.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <h3>未找到相关服务</h3>
                <p>请尝试使用其他关键词或浏览全部服务</p>
                <button class="no-results-btn" onclick="filterGlobal('all')">查看全部服务</button>
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

// 添加动画样式
const fadeInUpStyle = document.createElement('style');
fadeInUpStyle.textContent = `
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

    .no-results-icon {
        font-size: 3rem;
        margin-bottom: 20px;
        opacity: 0.6;
    }

    .no-results-message h3 {
        color: #374151;
        margin-bottom: 10px;
        font-size: 1.3rem;
    }

    .no-results-message p {
        color: #6b7280;
        margin-bottom: 25px;
        font-size: 1rem;
    }

    .no-results-btn {
        background: var(--primary);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .no-results-btn:hover {
        background: var(--secondary);
        transform: translateY(-2px);
    }
`;

// 确保样式只添加一次
if (!document.querySelector('style[data-fade-animation]')) {
    fadeInUpStyle.setAttribute('data-fade-animation', 'true');
    document.head.appendChild(fadeInUpStyle);
}

// AI出海服务初始化
window.initAiglobalPage = function() {
    window.logInfo('🌍 Initializing AI Global Expansion Services functionality...');

    // 预先创建筛选管理器，确保筛选功能可用
    let manager = window.getFilterManager('aiglobal');
    if (!manager) {
        window.logInfo('🌍 Creating AI Global filter manager during initialization...');
        manager = window.createFilterManager('aiglobal');
    }

    // 添加页面特定的功能按钮事件
    const globalButtons = document.querySelectorAll('[data-global-action]');
    globalButtons.forEach(button => {
        button.addEventListener('click', handleGlobalAction);
    });

    // 延迟检查筛选管理器状态，确保DOM已完全加载
    setTimeout(() => {
        const cards = document.querySelectorAll('.global-card');
        const tags = document.querySelectorAll('.tag');
        window.logInfo(`🌍 Filter check: Found ${cards.length} cards and ${tags.length} tags`);

        if (cards.length > 0) {
            window.logInfo('✅ AI Global filter manager initialized successfully');
        } else {
            window.logWarn('⚠️ AI Global cards not found, filter may not work properly');
        }
    }, 100);
};

// 处理AI出海服务操作
function handleGlobalAction(event) {
    const action = event.target.getAttribute('data-global-action');
    window.logInfo(`🔍 Global action triggered: ${action}`);

    switch (action) {
        case 'market-analysis':
            window.showMarketAnalysis();
            break;
        case 'legal-compliance':
            window.showLegalCompliance();
            break;
        case 'global-marketing':
            window.showGlobalMarketing();
            break;
        case 'operation-management':
            window.showOperationManagement();
            break;
        case 'finance-tax':
            window.showFinanceTax();
            break;
        case 'localization':
            window.showLocalization();
            break;
        default:
            window.logInfo(`Unknown global action: ${action}`);
    }
}

// 安全创建DOM元素 - 使用全局函数
function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = window.escapeHtml(textContent);
    return element;
}

// 创建模态窗口的安全方法
function createGlobalModal(title, contentHtml) {
    const modal = createElement('div', 'ai-global-modal-overlay');

    const modalContent = createElement('div', 'ai-global-modal');

    const header = createElement('div', 'ai-global-modal-header');
    const titleElement = createElement('h3');
    titleElement.textContent = title;
    header.appendChild(titleElement);

    const closeButton = createElement('button', 'ai-global-modal-close');
    closeButton.textContent = '×';
    closeButton.onclick = () => modal.remove();
    header.appendChild(closeButton);

    const content = createElement('div', 'ai-global-modal-content');
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

// 显示市场分析
window.showMarketAnalysis = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在分析全球市场数据和商业机会...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="market-analysis-result">
                <h4>🎯 推荐目标市场</h4>
                <div class="market-recommendations">
                    <div class="market-item">
                        <h5>🇺🇸 美国市场</h5>
                        <div class="market-score">
                            <span class="score-label">匹配度:</span>
                            <span class="score-value high">92%</span>
                        </div>
                        <ul>
                            <li>市场规模大，消费能力强</li>
                            <li>技术接受度高，竞争激烈</li>
                            <li>需要关注合规和税务问题</li>
                        </ul>
                    </div>
                    <div class="market-item">
                        <h5>🇪🇺 欧盟市场</h5>
                        <div class="market-score">
                            <span class="score-label">匹配度:</span>
                            <span class="score-value medium">78%</span>
                        </div>
                        <ul>
                            <li>法规统一，市场稳定</li>
                            <li>消费者品质要求高</li>
                            <li>需要GDPR等合规考虑</li>
                        </ul>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="analysis-btn" onclick="performDetailedAnalysis()">深度分析</button>
                    <button class="analysis-btn secondary" onclick="requestDemo('market-analysis')">申请演示</button>
                </div>
            </div>
        </div>
    `;

    const modal = createGlobalModal('📊 AI智能市场分析', content);

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

// 显示法律合规
window.showLegalCompliance = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在检查目标市场的法律合规要求...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="compliance-result">
                <h4>📋 合规检查报告</h4>
                <div class="compliance-areas">
                    <div class="compliance-area">
                        <h5>🏢 公司注册合规</h5>
                        <div class="compliance-status success">✅ 基本合规</div>
                        <p>建议在当地设立子公司或分支机构，满足当地公司法要求</p>
                    </div>
                    <div class="compliance-area">
                        <h5>🛡️ 数据保护合规</h5>
                        <div class="compliance-status warning">⚠️ 需要关注</div>
                        <p>需根据目标市场实施GDPR、CCPA等数据保护法规</p>
                    </div>
                    <div class="compliance-area">
                        <h5>💼 知识产权保护</h5>
                        <div class="compliance-status success">✅ 建议完善</div>
                        <p>建议在目标市场提前申请商标和专利保护</p>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="compliance-btn" onclick="generateComplianceChecklist()">生成合规清单</button>
                    <button class="compliance-btn secondary" onclick="consultLegalExpert()">咨询专家</button>
                </div>
            </div>
        </div>
    `;

    const modal = createGlobalModal('⚖️ AI法律合规助手', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示全球化营销
window.showGlobalMarketing = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在生成全球营销策略...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="marketing-result">
                <h4>🎯 AI营销策略</h4>
                <div class="marketing-channels">
                    <div class="channel-item">
                        <h5>🌐 数字营销渠道</h5>
                        <ul>
                            <li>Google Ads - 精准搜索广告</li>
                            <li>Facebook/Instagram - 社交媒体营销</li>
                            <li>LinkedIn - B2B专业营销</li>
                            <li>TikTok - 年轻用户群体</li>
                        </ul>
                    </div>
                    <div class="channel-item">
                        <h5>📝 内容营销策略</h5>
                        <ul>
                            <li>多语言AI内容生成</li>
                            <li>本地化文化适配</li>
                            <li>SEO优化策略</li>
                            <li>视频内容创作</li>
                        </ul>
                    </div>
                </div>
                <div class="budget-forecast">
                    <h5>💰 AI预算预测</h5>
                    <div class="budget-item">
                        <span class="budget-label">建议初期月预算:</span>
                        <span class="budget-value">$5,000 - $10,000</span>
                    </div>
                    <div class="budget-item">
                        <span class="budget-label">预期ROI:</span>
                        <span class="budget-value positive">250% - 400%</span>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="marketing-btn" onclick="createMarketingPlan()">生成营销计划</button>
                    <button class="marketing-btn secondary" onclick="launchCampaign()">启动推广</button>
                </div>
            </div>
        </div>
    `;

    const modal = createGlobalModal('📱 AI全球化营销', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示运营管理
window.showOperationManagement = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在优化运营管理方案...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="operation-result">
                <h4>📊 运营优化建议</h4>
                <div class="operation-areas">
                    <div class="operation-area">
                        <h5>📦 供应链优化</h5>
                        <div class="optimization-score">
                            <span class="score-label">优化潜力:</span>
                            <span class="score-value high">35%</span>
                        </div>
                        <ul>
                            <li>智能库存预测，减少库存成本</li>
                            <li>供应商AI评估与优选</li>
                            <li>物流路径智能规划</li>
                        </ul>
                    </div>
                    <div class="operation-area">
                        <h5>👥 人力资源配置</h5>
                        <div class="optimization-score">
                            <span class="score-label">优化潜力:</span>
                            <span class="score-value medium">25%</span>
                        </div>
                        <ul>
                            <li>跨时区团队协作优化</li>
                            <li>AI人员技能匹配</li>
                            <li>远程工作效率提升</li>
                        </ul>
                    </div>
                    <div class="operation-area">
                        <h5>💰 成本控制</h5>
                        <div class="optimization-score">
                            <span class="score-label">优化潜力:</span>
                            <span class="score-value high">40%</span>
                        </div>
                        <ul>
                            <li>运营成本AI分析</li>
                            <li>自动化流程减少人工成本</li>
                            <li>资源配置智能优化</li>
                        </ul>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="operation-btn" onclick="implementOptimization()">实施优化</button>
                    <button class="operation-btn secondary" onclick="requestDetailedReport()">详细报告</button>
                </div>
            </div>
        </div>
    `;

    const modal = createGlobalModal('⚙️ AI智能运营管理', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示财务税务
window.showFinanceTax = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在分析全球财务税务策略...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="finance-result">
                <h4>📈 财务税务优化方案</h4>
                <div class="tax-strategies">
                    <div class="tax-item">
                        <h5>🌍 全球税务筹划</h5>
                        <div class="tax-saving">
                            <span class="saving-label">预计节税:</span>
                            <span class="saving-value">15% - 25%</span>
                        </div>
                        <ul>
                            <li>利用税收协定优势</li>
                            <li>转移定价策略优化</li>
                            <li>合规税务结构设计</li>
                        </ul>
                    </div>
                    <div class="tax-item">
                        <h5>💱 汇率风险管理</h5>
                        <div class="risk-level">
                            <span class="risk-label">风险等级:</span>
                            <span class="risk-value medium">中等</span>
                        </div>
                        <ul>
                            <li>外汇敞口AI对冲</li>
                            <li>汇率趋势预测</li>
                            <li>多币种资金池管理</li>
                        </ul>
                    </div>
                </div>
                <div class="payment-optimization">
                    <h5>💳 跨境支付优化</h5>
                    <ul>
                        <li>智能支付路径选择，降低手续费</li>
                        <li>实时汇率监控，优化结算时机</li>
                        <li>多币种账户管理</li>
                    </ul>
                </div>
                <div class="action-buttons">
                    <button class="finance-btn" onclick="implementTaxStrategy()">实施税务策略</button>
                    <button class="finance-btn secondary" onclick="consultFinanceExpert()">咨询专家</button>
                </div>
            </div>
        </div>
    `;

    const modal = createGlobalModal('💰 AI财务税务管理', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 显示本地化服务
window.showLocalization = function() {
    const content = `
        <div class="ai-thinking">
            <div class="ai-spinner"></div>
            <p>正在分析本地化需求和文化适配...</p>
        </div>
        <div class="ai-result" style="display: none;">
            <div class="localization-result">
                <h4>🎯 本地化适配建议</h4>
                <div class="localization-areas">
                    <div class="localization-area">
                        <h5>📝 内容本地化</h5>
                        <div class="localization-score">
                            <span class="score-label">适配度:</span>
                            <span class="score-value high">85%</span>
                        </div>
                        <ul>
                            <li>专业术语多语言翻译</li>
                            <li>文化敏感内容调整</li>
                            <li>当地表达习惯适配</li>
                        </ul>
                    </div>
                    <div class="localization-area">
                        <h5>🎨 UI/UX本地化</h5>
                        <div class="localization-score">
                            <span class="score-label">适配度:</span>
                            <span class="score-value medium">70%</span>
                        </div>
                        <ul>
                            <li>界面布局适应当地习惯</li>
                            <li>颜色和图标文化适配</li>
                            <li>用户体验习惯优化</li>
                        </ul>
                    </div>
                    <div class="localization-area">
                        <h5>🛒 商业模式本地化</h5>
                        <div class="localization-score">
                            <span class="score-label">适配度:</span>
                            <span class="score-value high">90%</span>
                        </div>
                        <ul>
                            <li>定价策略本地化</li>
                            <li>支付方式适配</li>
                            <li>客户服务本地化</li>
                        </ul>
                    </div>
                </div>
                <div class="cultural-insights">
                    <h5>🔍 文化洞察</h5>
                    <div class="insight-item">
                        <strong>目标市场文化特点:</strong>
                        <p>重视个人隐私保护，偏好简洁直接的表达，对数据安全要求高</p>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="localization-btn" onclick="implementLocalization()">实施本地化</button>
                    <button class="localization-btn secondary" onclick="getDetailedAnalysis()">详细分析</button>
                </div>
            </div>
        </div>
    `;

    const modal = createGlobalModal('🌐 AI本地化解决方案', content);

    setTimeout(() => {
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        if (thinkingDiv && resultDiv) {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
        }
    }, 2000);
};

// 申请演示功能
window.requestDemo = function(service) {
    const content = `
        <form class="demo-request-form">
            <div class="form-group">
                <label>公司名称 *</label>
                <input type="text" name="company" required>
            </div>
            <div class="form-group">
                <label>联系人姓名 *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>邮箱地址 *</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>联系电话 *</label>
                <input type="tel" name="phone" required>
            </div>
            <div class="form-group">
                <label>目标市场</label>
                <select name="targetMarket">
                    <option value="">请选择目标市场</option>
                    <option value="north-america">北美市场</option>
                    <option value="europe">欧洲市场</option>
                    <option value="asia-pacific">亚太市场</option>
                    <option value="latin-america">拉美市场</option>
                    <option value="middle-east">中东市场</option>
                    <option value="africa">非洲市场</option>
                </select>
            </div>
            <div class="form-group">
                <label>预计出海时间</label>
                <select name="timeline">
                    <option value="">请选择时间</option>
                    <option value="immediate">立即</option>
                    <option value="3-months">3个月内</option>
                    <option value="6-months">6个月内</option>
                    <option value="1-year">1年内</option>
                    <option value="planning">规划阶段</option>
                </select>
            </div>
            <div class="form-group">
                <label>具体需求描述</label>
                <textarea name="requirements" placeholder="请描述您的出海需求和具体要求..." rows="4"></textarea>
            </div>
        </form>
    `;

    const modal = createElement('div', 'ai-global-modal-overlay');
    const modalContent = createElement('div', 'ai-global-modal');

    const header = createElement('div', 'ai-global-modal-header');
    const titleElement = createElement('h3');
    titleElement.textContent = `申请演示 - ${service}`;
    header.appendChild(titleElement);

    const closeButton = createElement('button', 'ai-global-modal-close');
    closeButton.textContent = '×';
    closeButton.onclick = () => modal.remove();
    header.appendChild(closeButton);

    const contentDiv = createElement('div', 'ai-global-modal-content');
    contentDiv.innerHTML = content;

    const actions = createElement('div', 'ai-global-modal-actions');

    const cancelBtn = createElement('button', 'global-btn-secondary');
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => modal.remove();

    const submitBtn = createElement('button', 'global-btn-primary');
    submitBtn.textContent = '提交申请';
    submitBtn.onclick = window.submitGlobalDemoRequest;

    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);

    modalContent.appendChild(header);
    modalContent.appendChild(contentDiv);
    modalContent.appendChild(actions);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
};

// 提交演示申请
window.submitGlobalDemoRequest = function() {
    const form = document.querySelector('.demo-request-form');
    if (!form) return;

    const formData = new FormData(form);

    // 简单的表单验证
    const company = formData.get('company');
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');

    if (!company || !name || !email || !phone) {
        alert('请填写必填项！');
        return;
    }

    // 模拟提交成功
    const modal = document.querySelector('.ai-global-modal');
    if (!modal) return;

    const content = modal.querySelector('.ai-global-modal-content');
    const actions = modal.querySelector('.ai-global-modal-actions');

    if (content && actions) {
        content.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h4>演示申请提交成功！</h4>
                <p>我们的AI出海专家将在24小时内与您联系，为您安排专属演示。</p>
                <div class="next-steps">
                    <h5>下一步：</h5>
                    <ul>
                        <li>专家致电了解您的具体需求</li>
                        <li>安排在线产品演示</li>
                        <li>提供定制化出海方案</li>
                        <li>讨论合作细节和报价</li>
                    </ul>
                </div>
            </div>
        `;

        actions.innerHTML = `
            <button class="global-btn-primary" onclick="this.closest('.ai-global-modal-overlay').remove()">完成</button>
        `;
    }

    window.logInfo('📝 Global demo request submitted:', Object.fromEntries(formData));
};

// 其他AI功能（简化实现）
window.performDetailedAnalysis = function() {
    alert('深度分析功能正在开发中，敬请期待！');
};

window.generateComplianceChecklist = function() {
    alert('合规清单生成功能正在开发中，敬请期待！');
};

window.consultLegalExpert = function() {
    alert('法律专家咨询功能正在开发中，敬请期待！');
};

window.createMarketingPlan = function() {
    alert('营销计划生成功能正在开发中，敬请期待！');
};

window.launchCampaign = function() {
    alert('推广启动功能正在开发中，敬请期待！');
};

window.implementOptimization = function() {
    alert('优化实施功能正在开发中，敬请期待！');
};

window.requestDetailedReport = function() {
    alert('详细报告功能正在开发中，敬请期待！');
};

window.implementTaxStrategy = function() {
    alert('税务策略实施功能正在开发中，敬请期待！');
};

window.consultFinanceExpert = function() {
    alert('财务专家咨询功能正在开发中，敬请期待！');
};

window.implementLocalization = function() {
    alert('本地化实施功能正在开发中，敬请期待！');
};

window.getDetailedAnalysis = function() {
    alert('详细分析功能正在开发中，敬请期待！');
};

// 页面加载完成后初始化 - 支持SPA和直接访问
document.addEventListener('DOMContentLoaded', function() {
    // 等待其他脚本加载完成
    setTimeout(() => {
        if (document.body) {
            window.initAiglobalPage();
        }
    }, 500);
});

// SPA页面加载时的额外初始化
window.initAiglobalPageForSPA = function() {
    window.logInfo('🌍 AI Global SPA initialization triggered...');
    // 立即初始化，不等待DOMContentLoaded
    if (document.body) {
        window.initAiglobalPage();
    }
};

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        window.initAiglobalPageForSPA();
    }, 100);
}