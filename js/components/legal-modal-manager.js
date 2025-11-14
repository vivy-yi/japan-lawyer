/**
 * 法律服务模态窗口管理器
 * 统一管理AI法律服务页面的模态窗口逻辑
 */

class LegalModalManager {
    constructor() {
        this.initialized = false;
        this.modals = {};
    }

    /**
     * 初始化法律服务模态管理器
     */
    init() {
        if (this.initialized) return;

        window.logInfo('⚖️ Initializing Legal Modal Manager...');

        // 确保ModalComponent已加载
        if (typeof ModalComponent === 'undefined') {
            window.logWarn('ModalComponent not found, waiting for it to load...');
            setTimeout(() => this.init(), 100);
            return;
        }

        this.setupEventListeners();
        this.initialized = true;
        window.logInfo('✅ Legal Modal Manager initialized');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 等待DOM加载完成后绑定事件
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.bindModalEvents();
            });
        } else {
            this.bindModalEvents();
        }
    }

    /**
     * 绑定模态窗口事件
     */
    bindModalEvents() {
        // 绑定带有data-legal-action属性的按钮
        const legalButtons = document.querySelectorAll('[data-legal-action]');
        legalButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-legal-action');
                this.handleLegalAction(action);
            });
        });

        // 为其他btn-primary按钮添加通用模态窗口
        const otherButtons = document.querySelectorAll('.btn-primary:not([data-legal-action])');
        otherButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.knowledge-card');
                if (card) {
                    const title = card.querySelector('h3').textContent;
                    const description = card.querySelector('p').textContent;
                    this.showGenericModal(title, description);
                }
            });
        });

        window.logInfo(`🔗 Bound events to ${legalButtons.length + otherButtons.length} buttons`);
    }

    /**
     * 处理法律服务操作
     */
    handleLegalAction(action) {
        window.logInfo(`🔍 Legal action triggered: ${action}`);

        switch (action) {
            case 'consultation':
                this.showLegalConsultation();
                break;
            case 'document-review':
                this.showDocumentReview();
                break;
            case 'risk-analysis':
                this.showRiskAnalysis();
                break;
            default:
                window.logInfo(`Unknown legal action: ${action}`);
                this.showGenericModal('功能开发中', '该功能正在开发中，敬请期待！');
        }
    }

    /**
     * 创建模态窗口的通用方法
     */
    createModal(title, content, buttonText = '确定', options = {}) {
        if (typeof ModalComponent === 'undefined') {
            window.logWarn('ModalComponent not available, using fallback');
            alert(`${title}\n\n${content}`);
            return null;
        }

        const config = {
            title: title,
            content: content,
            size: 'medium',
            closable: true,
            backdrop: true,
            keyboard: true,
            actions: [
                {
                    text: buttonText,
                    variant: 'primary',
                    onClick: () => {
                        window.logInfo(`Modal button clicked: ${buttonText}`);
                        if (options.onButtonClick) {
                            options.onButtonClick();
                        }
                    }
                }
            ],
            ...options
        };

        const modal = new ModalComponent(document.body, config);
        modal.open();

        // 存储模态窗口引用
        const modalId = `modal_${Date.now()}`;
        this.modals[modalId] = modal;

        // 监听关闭事件，清理引用
        modal.on('close', () => {
            delete this.modals[modalId];
        });

        return modal;
    }

    /**
     * 显示法律咨询模态窗口
     */
    showLegalConsultation() {
        const content = `
            <div style="text-align: left;">
                <p>我们的AI法律助手可以为您提供专业的法律建议和咨询：</p>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>智能法律问题诊断</li>
                    <li>个性化法律建议</li>
                    <li>多语言咨询服务</li>
                    <li>案例匹配分析</li>
                    <li>实时在线解答</li>
                </ul>
                <p><strong>服务特点：</strong>24小时在线，3分钟响应，95%准确率</p>
            </div>
        `;

        return this.createModal(
            '⚖️ AI法律咨询',
            content,
            '开始咨询',
            {
                size: 'large',
                onButtonClick: () => {
                    window.logInfo('Legal consultation started');
                    // 这里可以添加具体的咨询逻辑
                }
            }
        );
    }

    /**
     * 显示文档审查模态窗口
     */
    showDocumentReview() {
        const content = `
            <div style="text-align: left;">
                <p>上传您的合同或法律文档，AI将为您提供专业的风险分析和修改建议：</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px dashed #d1d5db; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📄</div>
                    <p style="margin: 0; color: #64748b;">点击或拖拽上传文档</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">支持 PDF、DOC、DOCX 格式</p>
                </div>
                <p><strong>分析内容：</strong>合同风险、条款合规性、法律漏洞、标准化建议</p>
            </div>
        `;

        return this.createModal(
            '📋 AI文档审查',
            content,
            '开始分析',
            {
                size: 'large',
                onButtonClick: () => {
                    window.logInfo('Document review started');
                    // 这里可以添加文档上传逻辑
                }
            }
        );
    }

    /**
     * 显示风险评估模态窗口
     */
    showRiskAnalysis() {
        const content = `
            <div style="text-align: left;">
                <p>通过智能分析，为企业经营提供全面的法律风险评估和防控建议：</p>
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444;">
                    <h4 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ 评估范围：</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
                        <li>合同履行风险</li>
                        <li>知识产权风险</li>
                        <li>劳动用工风险</li>
                        <li>税务合规风险</li>
                        <li>数据安全风险</li>
                    </ul>
                </div>
                <p><strong>输出报告：</strong>风险等级评估、具体风险点、防控建议、合规指导</p>
            </div>
        `;

        return this.createModal(
            '⚠️ AI风险评估',
            content,
            '开始评估',
            {
                size: 'large',
                onButtonClick: () => {
                    window.logInfo('Risk analysis started');
                    // 这里可以添加风险评估逻辑
                }
            }
        );
    }

    /**
     * 显示通用模态窗口
     */
    showGenericModal(title, description) {
        return this.createModal(title, description, '了解更多');
    }

    /**
     * 关闭所有模态窗口
     */
    closeAllModals() {
        Object.keys(this.modals).forEach(id => {
            if (this.modals[id] && this.modals[id].close) {
                this.modals[id].close();
            }
        });
        this.modals = {};
    }

    /**
     * 销毁管理器
     */
    destroy() {
        this.closeAllModals();
        this.initialized = false;
    }
}

// 创建全局实例
window.legalModalManager = new LegalModalManager();

// 自动初始化
window.legalModalManager.init();

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (window.legalModalManager) {
        window.legalModalManager.destroy();
    }
});

// 导出类（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LegalModalManager;
}