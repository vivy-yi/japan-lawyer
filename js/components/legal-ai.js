


    // === AI法律助手功能函数 ===
    // 启动AI法律问答系统
    window.launchAILawQA = function() {
        console.log('🤖 启动AI法律问答系统...');
        showAILawModal('AI法律问答系统', '正在连接到AI法律助手...', 'qa');
    };

    // 智能案例预测分析
    window.analyzeCase = function() {
        console.log('🔍 启动智能案例预测分析...');
        showAILawModal('智能案例预测', '正在分析案件特征和预测结果...', 'case');
    };

    // 合同智能生成
    window.generateContract = function() {
        console.log('📝 启动合同智能生成器...');
        showAILawModal('合同智能生成', '正在准备合同生成向导...', 'contract');
    };

    // 法律文件翻译
    window.translateDocument = function() {
        console.log('🌐 启动法律文件翻译服务...');
        showAILawModal('法律文件翻译', '正在初始化翻译引擎...', 'translate');
    };

    // 法律风险评估
    window.assessRisk = function() {
        console.log('⚖️ 启动法律风险评估系统...');
        showAILawModal('法律风险评估', '正在分析法律风险因素...', 'risk');
    };

    // 法律知识图谱探索
    window.exploreKnowledge = function() {
        console.log('🗺️ 启动法律知识图谱探索...');
        showAILawModal('法律知识图谱', '正在加载法律知识数据库...', 'knowledge');
    };

    // 显示AI法律助手模态窗口
    function showAILawModal(title, message, type) {
        const modal = document.createElement('div');
        modal.className = 'ai-law-modal-overlay';
        modal.innerHTML = `
            <div class="ai-law-modal">
                <div class="ai-law-modal-header">
                    <h3>${title}</h3>
                    <button class="ai-law-modal-close" onclick="this.closest('.ai-law-modal-overlay').remove()">×</button>
                </div>
                <div class="ai-law-modal-content">
                    <div class="ai-thinking">
                        <div class="ai-spinner"></div>
                        <p>${message}</p>
                    </div>
                    <div class="ai-result" style="display: none;">
                        <!-- 动态内容将在这里显示 -->
                    </div>
                </div>
                <div class="ai-law-modal-actions">
                    <button class="ai-law-btn-secondary" onclick="this.closest('.ai-law-modal-overlay').remove()">取消</button>
                    <button class="ai-law-btn-primary" onclick="processAIRequest('${type}', this)">继续</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 添加显示动画
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    // 处理AI请求
    function processAIRequest(type, button) {
        const modal = button.closest('.ai-law-modal');
        const thinkingDiv = modal.querySelector('.ai-thinking');
        const resultDiv = modal.querySelector('.ai-result');
        const actionButtons = modal.querySelector('.ai-law-modal-actions');

        // 显示思考状态
        thinkingDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        button.disabled = true;
        button.textContent = '处理中...';

        // 模拟AI处理时间
        setTimeout(() => {
            thinkingDiv.style.display = 'none';
            resultDiv.style.display = 'block';

            // 根据类型显示不同结果
            let resultContent = '';
            switch(type) {
                case 'qa':
                    resultContent = generateQAContent();
                    break;
                case 'case':
                    resultContent = generateCaseContent();
                    break;
                case 'contract':
                    resultContent = generateContractContent();
                    break;
                case 'translate':
                    resultContent = generateTranslateContent();
                    break;
                case 'risk':
                    resultContent = generateRiskContent();
                    break;
                case 'knowledge':
                    resultContent = generateKnowledgeContent();
                    break;
            }

            resultDiv.innerHTML = resultContent;
            button.disabled = false;
            button.textContent = '完成';
            button.onclick = () => modal.closest('.ai-law-modal-overlay').remove();

            // 更新操作按钮
            actionButtons.innerHTML = `
                <button class="ai-law-btn-secondary" onclick="this.closest('.ai-law-modal-overlay').remove()">关闭</button>
                <button class="ai-law-btn-primary" onclick="requestDemo('${type}')">申请演示</button>
            `;
        }, 2000);
    }

    // 生成问答内容
    function generateQAContent() {
        return `
            <div class="ai-qa-result">
                <h4>💬 AI法律助手已准备就绪</h4>
                <div class="qa-suggestions">
                    <div class="qa-item">
                        <strong>常见问题示例：</strong>
                        <ul>
                            <li>劳动合同纠纷如何处理？</li>
                            <li>房屋租赁合同的注意事项？</li>
                            <li>公司注册流程是怎样的？</li>
                            <li>知识产权保护如何申请？</li>
                        </ul>
                    </div>
                </div>
                <div class="qa-input-area">
                    <input type="text" placeholder="请输入您的法律问题..." class="qa-input">
                    <button class="qa-submit">提问</button>
                </div>
            </div>
        `;
    }

    // 生成案例分析内容
    function generateCaseContent() {
        return `
            <div class="ai-case-result">
                <h4>🔍 案例预测分析结果</h4>
                <div class="case-analysis">
                    <div class="analysis-item">
                        <span class="analysis-label">案件类型：</span>
                        <span class="analysis-value">合同纠纷</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">胜诉概率：</span>
                        <span class="analysis-value high">85%</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">预计周期：</span>
                        <span class="analysis-value">3-6个月</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">风险等级：</span>
                        <span class="analysis-value medium">中等</span>
                    </div>
                </div>
                <div class="case-recommendations">
                    <h5>📋 建议：</h5>
                    <ul>
                        <li>收集相关证据材料</li>
                        <li>寻求专业律师协助</li>
                        <li>考虑调解解决方案</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // 生成合同内容
    function generateContractContent() {
        return `
            <div class="ai-contract-result">
                <h4>📝 合同生成向导</h4>
                <div class="contract-wizard">
                    <div class="wizard-step">
                        <label>合同类型：</label>
                        <select class="contract-type-select">
                            <option>劳动合同</option>
                            <option>租赁合同</option>
                            <option>服务合同</option>
                            <option>销售合同</option>
                        </select>
                    </div>
                    <div class="wizard-step">
                        <label>当事方信息：</label>
                        <input type="text" placeholder="甲方信息" class="party-input">
                        <input type="text" placeholder="乙方信息" class="party-input">
                    </div>
                    <div class="wizard-step">
                        <label>主要条款：</label>
                        <textarea placeholder="请描述合同主要条款..." class="terms-textarea"></textarea>
                    </div>
                    <button class="generate-contract-btn">生成合同草案</button>
                </div>
            </div>
        `;
    }

    // 生成翻译内容
    function generateTranslateContent() {
        return `
            <div class="ai-translate-result">
                <h4>🌐 法律文件翻译</h4>
                <div class="translate-interface">
                    <div class="translate-options">
                        <select class="source-lang">
                            <option value="zh">中文</option>
                            <option value="ja">日文</option>
                            <option value="en">英文</option>
                        </select>
                        <span>→</span>
                        <select class="target-lang">
                            <option value="ja">日文</option>
                            <option value="en">英文</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                    <div class="translate-area">
                        <textarea placeholder="请输入需要翻译的法律文本..." class="source-text"></textarea>
                        <div class="translated-text">
                            <p>翻译结果将在这里显示...</p>
                        </div>
                    </div>
                    <button class="translate-btn">开始翻译</button>
                </div>
            </div>
        `;
    }

    // 生成风险评估内容
    function generateRiskContent() {
        return `
            <div class="ai-risk-result">
                <h4>⚖️ 法律风险评估报告</h4>
                <div class="risk-assessment">
                    <div class="risk-category">
                        <h5>🏢 企业运营风险</h5>
                        <div class="risk-level low">低风险</div>
                    </div>
                    <div class="risk-category">
                        <h5>📋 合同合规风险</h5>
                        <div class="risk-level medium">中风险</div>
                    </div>
                    <div class="risk-category">
                        <h5>👥 人力资源风险</h5>
                        <div class="risk-level high">高风险</div>
                    </div>
                    <div class="risk-category">
                        <h5>💰 税务合规风险</h5>
                        <div class="risk-level low">低风险</div>
                    </div>
                </div>
                <div class="risk-recommendations">
                    <h5>📌 风险防控建议：</h5>
                    <ul>
                        <li>完善劳动合同条款</li>
                        <li>建立合规审查机制</li>
                        <li>定期法律风险评估</li>
                        <li>加强员工法律培训</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // 生成知识图谱内容
    function generateKnowledgeContent() {
        return `
            <div class="ai-knowledge-result">
                <h4>🗺️ 法律知识图谱</h4>
                <div class="knowledge-graph">
                    <div class="knowledge-node" data-topic="contract">合同法</div>
                    <div class="knowledge-node" data-topic="labor">劳动法</div>
                    <div class="knowledge-node" data-topic="corporate">公司法</div>
                    <div class="knowledge-node" data-topic="property">物权法</div>
                    <div class="knowledge-node" data-topic="tort">侵权法</div>
                </div>
                <div class="knowledge-details">
                    <h5>选择一个法律领域探索更多：</h5>
                    <p>点击上方节点查看相关法规、案例和实务指导</p>
                </div>
            </div>
        `;
    }

    // 申请演示功能
    window.requestDemo = function(type) {
        const typeNames = {
            'qa': 'AI法律问答系统',
            'case': '智能案例预测',
            'contract': '合同智能生成',
            'translate': '法律文件翻译',
            'risk': '法律风险评估',
            'knowledge': '法律知识图谱'
        };

        const typeName = typeNames[type] || 'AI法律服务';

        // 移除现有模态窗口
        document.querySelectorAll('.ai-law-modal-overlay').forEach(modal => modal.remove());

        // 显示申请演示模态窗口
        const demoModal = document.createElement('div');
        demoModal.className = 'ai-law-modal-overlay';
        demoModal.innerHTML = `
            <div class="ai-law-modal">
                <div class="ai-law-modal-header">
                    <h3>申请演示 - ${typeName}</h3>
                    <button class="ai-law-modal-close" onclick="this.closest('.ai-law-modal-overlay').remove()">×</button>
                </div>
                <div class="ai-law-modal-content">
                    <form class="demo-request-form">
                        <div class="form-group">
                            <label>姓名 *</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>公司/组织</label>
                            <input type="text" name="company">
                        </div>
                        <div class="form-group">
                            <label>联系电话 *</label>
                            <input type="tel" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label>邮箱地址 *</label>
                            <input type="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label>感兴趣的功能</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="qa"> AI法律问答</label>
                                <label><input type="checkbox" value="case"> 案例预测</label>
                                <label><input type="checkbox" value="contract"> 合同生成</label>
                                <label><input type="checkbox" value="translate"> 文档翻译</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>备注</label>
                            <textarea name="notes" placeholder="请描述您的具体需求..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="ai-law-modal-actions">
                    <button class="ai-law-btn-secondary" onclick="this.closest('.ai-law-modal-overlay').remove()">取消</button>
                    <button class="ai-law-btn-primary" onclick="submitDemoRequest()">提交申请</button>
                </div>
            </div>
        `;

        document.body.appendChild(demoModal);

        setTimeout(() => {
            demoModal.classList.add('show');
        }, 100);
    };

    // 提交演示申请
    window.submitDemoRequest = function() {
        const form = document.querySelector('.demo-request-form');
        const formData = new FormData(form);

        // 简单的表单验证
        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');

        if (!name || !phone || !email) {
            alert('请填写必填项！');
            return;
        }

        // 模拟提交成功
        const modal = document.querySelector('.ai-law-modal');
        const content = modal.querySelector('.ai-law-modal-content');
        const actions = modal.querySelector('.ai-law-modal-actions');

        content.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h4>申请提交成功！</h4>
                <p>我们将在24小时内与您联系，安排在线演示。</p>
                <div class="next-steps">
                    <h5>下一步：</h5>
                    <ul>
                        <li>专业顾问将致电确认需求</li>
                        <li>安排在线演示时间</li>
                        <li>提供定制化解决方案</li>
                        <li>讨论合作细节</li>
                    </ul>
                </div>
            </div>
        `;

        actions.innerHTML = `
            <button class="ai-law-btn-primary" onclick="this.closest('.ai-law-modal-overlay').remove()">完成</button>
        `;

        console.log('📝 Demo request submitted:', Object.fromEntries(formData));
    };

    // 查看定价方案
    window.viewPricing = function() {
        const modal = document.createElement('div');
        modal.className = 'ai-law-modal-overlay';
        modal.innerHTML = `
            <div class="ai-law-modal">
                <div class="ai-law-modal-header">
                    <h3>💰 AI法律服务定价方案</h3>
                    <button class="ai-law-modal-close" onclick="this.closest('.ai-law-modal-overlay').remove()">×</button>
                </div>
                <div class="ai-law-modal-content">
                    <div class="pricing-plans">
                        <div class="pricing-plan">
                            <h4>🥉 基础版</h4>
                            <div class="price">¥9,800<span>/月</span></div>
                            <ul>
                                <li>AI法律问答 (100次/月)</li>
                                <li>基础风险评估</li>
                                <li>标准合同模板</li>
                                <li>邮件支持</li>
                            </ul>
                            <button class="plan-btn">选择方案</button>
                        </div>
                        <div class="pricing-plan popular">
                            <div class="popular-badge">推荐</div>
                            <h4>🥈 专业版</h4>
                            <div class="price">¥28,800<span>/月</span></div>
                            <ul>
                                <li>AI法律问答 (500次/月)</li>
                                <li>深度案例预测</li>
                                <li>智能合同生成</li>
                                <li>文档翻译 (10万字/月)</li>
                                <li>优先客服支持</li>
                            </ul>
                            <button class="plan-btn primary">选择方案</button>
                        </div>
                        <div class="pricing-plan">
                            <h4>🥇 企业版</h4>
                            <div class="price">¥88,800<span>/月</span></div>
                            <ul>
                                <li>AI法律问答 (无限次)</li>
                                <li>全功能风险评估</li>
                                <li>高级合同定制</li>
                                <li>无限文档翻译</li>
                                <li>API接入支持</li>
                                <li>专属客户经理</li>
                            </ul>
                            <button class="plan-btn">选择方案</button>
                        </div>
                    </div>
                </div>
                <div class="ai-law-modal-actions">
                    <button class="ai-law-btn-secondary" onclick="this.closest('.ai-law-modal-overlay').remove()">关闭</button>
                    <button class="ai-law-btn-primary" onclick="requestDemo('enterprise')">联系销售</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    };