/**
 * AI服务页面脚本模板 - 安全版本
 * 提供一站式AI服务交互功能
 * 使用安全的DOM操作方法，防止XSS攻击
 */

class AIServiceManager {
    constructor(serviceConfig) {
        this.serviceConfig = {
            name: serviceConfig.name || 'AI服务',
            type: serviceConfig.type || 'general',
            features: serviceConfig.features || [],
            processSteps: serviceConfig.processSteps || [],
            benefits: serviceConfig.benefits || [],
            contactMethod: serviceConfig.contactMethod || 'chat',
            ...serviceConfig
        };

        this.modal = null;
        this.currentStep = 0;
        this.userProgress = new Map();
        this.init();
    }

    /**
     * 初始化服务管理器
     */
    init() {
        this.createModal();
        this.bindEvents();
        this.setupProgressTracking();
        console.log(`✅ ${this.serviceConfig.name} 服务管理器已初始化`);
    }

    /**
     * 安全地创建模态框
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'ai-service-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-labelledby', 'modal-title');

        // 设置模态框内容
        const modalContent = this.createSecureModalContent();
        this.modal.appendChild(modalContent);

        // 添加到页面
        document.body.appendChild(this.modal);
    }

    /**
     * 安全地创建模态框内容
     */
    createSecureModalContent() {
        const container = document.createElement('div');
        container.className = 'modal-overlay';

        const modalBox = document.createElement('div');
        modalBox.className = 'modal-box';

        // 标题区域
        const header = document.createElement('div');
        header.className = 'modal-header';

        const title = document.createElement('h2');
        title.id = 'modal-title';
        title.textContent = `${this.serviceConfig.name} 服务`;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.setAttribute('aria-label', '关闭对话框');
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.closeModal());

        header.appendChild(title);
        header.appendChild(closeBtn);

        // 内容区域
        const content = document.createElement('div');
        content.className = 'modal-content';

        // 服务介绍
        const intro = document.createElement('div');
        intro.className = 'service-intro';

        const introText = document.createElement('p');
        introText.textContent = `欢迎使用${this.serviceConfig.name}！我们将为您提供专业的${this.serviceConfig.type}解决方案。`;
        intro.appendChild(introText);

        // 进度指示器
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = '0%';

        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = '步骤 0 / 0';

        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);

        // 步骤容器
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'steps-container';
        stepsContainer.id = 'steps-container';

        // 控制按钮
        const controls = document.createElement('div');
        controls.className = 'modal-controls';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn btn-secondary';
        prevBtn.textContent = '上一步';
        prevBtn.disabled = true;
        prevBtn.addEventListener('click', () => this.previousStep());

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        nextBtn.textContent = '下一步';
        nextBtn.addEventListener('click', () => this.nextStep());

        const startBtn = document.createElement('button');
        startBtn.className = 'btn btn-success';
        startBtn.textContent = '开始服务';
        startBtn.addEventListener('click', () => this.startService());

        controls.appendChild(prevBtn);
        controls.appendChild(nextBtn);
        controls.appendChild(startBtn);

        // 组装内容
        content.appendChild(intro);
        content.appendChild(progressContainer);
        content.appendChild(stepsContainer);
        content.appendChild(controls);

        modalBox.appendChild(header);
        modalBox.appendChild(content);
        container.appendChild(modalBox);

        // 点击遮罩关闭
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                this.closeModal();
            }
        });

        return container;
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 绑定开始体验按钮
        const startButtons = document.querySelectorAll('[onclick*="startService"]');
        startButtons.forEach(btn => {
            // 克隆按钮以移除内联事件
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => this.showModal());
        });

        // 键盘事件支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }

    /**
     * 设置进度跟踪
     */
    setupProgressTracking() {
        this.totalSteps = this.serviceConfig.processSteps.length + 1; // +1 for introduction
        this.updateProgress();
    }

    /**
     * 显示模态框
     */
    showModal() {
        if (!this.modal) {
            this.createModal();
        }

        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // 初始化第一步
        this.showStep(0);

        // 焦点管理
        const focusElement = this.modal.querySelector('#modal-title');
        if (focusElement) {
            setTimeout(() => focusElement.focus(), 100);
        }
    }

    /**
     * 关闭模态框
     */
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * 显示特定步骤
     */
    showStep(stepIndex) {
        const container = document.getElementById('steps-container');
        if (!container) return;

        container.innerHTML = '';

        if (stepIndex === 0) {
            // 介绍步骤
            container.appendChild(this.createIntroductionStep());
        } else if (stepIndex <= this.serviceConfig.processSteps.length) {
            // 流程步骤
            const stepData = this.serviceConfig.processSteps[stepIndex - 1];
            container.appendChild(this.createProcessStep(stepIndex, stepData));
        }

        // 更新按钮状态
        this.updateButtonStates(stepIndex);

        // 更新进度
        this.currentStep = stepIndex;
        this.updateProgress();
    }

    /**
     * 创建介绍步骤
     */
    createIntroductionStep() {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-introduction';

        const title = document.createElement('h3');
        title.textContent = '服务介绍';

        const description = document.createElement('p');
        description.textContent = `${this.serviceConfig.name}为您提供以下核心功能：`;

        const featuresList = document.createElement('ul');
        featuresList.className = 'features-list';

        this.serviceConfig.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });

        stepDiv.appendChild(title);
        stepDiv.appendChild(description);
        stepDiv.appendChild(featuresList);

        return stepDiv;
    }

    /**
     * 创建流程步骤
     */
    createProcessStep(stepNumber, stepData) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'process-step';

        const stepHeader = document.createElement('div');
        stepHeader.className = 'step-header';

        const stepNumberSpan = document.createElement('span');
        stepNumberSpan.className = 'step-number';
        stepNumberSpan.textContent = `步骤 ${stepNumber}`;

        const stepTitle = document.createElement('h3');
        stepTitle.textContent = stepData.title || `步骤 ${stepNumber}`;

        stepHeader.appendChild(stepNumberSpan);
        stepHeader.appendChild(stepTitle);

        const stepDescription = document.createElement('p');
        stepDescription.className = 'step-description';
        stepDescription.textContent = stepData.description || '';

        stepDiv.appendChild(stepHeader);
        stepDiv.appendChild(stepDescription);

        // 如果有输入字段
        if (stepData.inputs) {
            const inputsContainer = document.createElement('div');
            inputsContainer.className = 'step-inputs';

            stepData.inputs.forEach(input => {
                const inputGroup = this.createInputGroup(input);
                inputsContainer.appendChild(inputGroup);
            });

            stepDiv.appendChild(inputsContainer);
        }

        return stepDiv;
    }

    /**
     * 安全地创建输入组
     */
    createInputGroup(inputConfig) {
        const group = document.createElement('div');
        group.className = 'input-group';

        const label = document.createElement('label');
        label.textContent = inputConfig.label || '';
        label.setAttribute('for', inputConfig.id || '');

        const input = document.createElement('input');
        input.type = inputConfig.type || 'text';
        input.id = inputConfig.id || '';
        input.name = inputConfig.name || '';
        input.placeholder = inputConfig.placeholder || '';
        input.required = inputConfig.required || false;

        group.appendChild(label);
        group.appendChild(input);

        return group;
    }

    /**
     * 更新按钮状态
     */
    updateButtonStates(stepIndex) {
        const prevBtn = this.modal.querySelector('.btn-secondary');
        const nextBtn = this.modal.querySelector('.btn-primary');
        const startBtn = this.modal.querySelector('.btn-success');

        if (!prevBtn || !nextBtn || !startBtn) return;

        // 上一步按钮
        prevBtn.disabled = stepIndex === 0;

        // 下一步和开始按钮
        const isLastStep = stepIndex >= this.serviceConfig.processSteps.length;
        nextBtn.style.display = isLastStep ? 'none' : 'inline-block';
        startBtn.style.display = isLastStep ? 'inline-block' : 'none';

        // 验证当前步骤
        const isValid = this.validateCurrentStep(stepIndex);
        nextBtn.disabled = !isValid;
        startBtn.disabled = !isValid;
    }

    /**
     * 验证当前步骤
     */
    validateCurrentStep(stepIndex) {
        if (stepIndex === 0) return true; // 介绍步骤总是有效

        const stepData = this.serviceConfig.processSteps[stepIndex - 1];
        if (!stepData.inputs) return true;

        for (const input of stepData.inputs) {
            if (input.required) {
                const inputElement = document.getElementById(input.id);
                if (!inputElement || !inputElement.value.trim()) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 更新进度显示
     */
    updateProgress() {
        const progressFill = this.modal.querySelector('.progress-fill');
        const progressText = this.modal.querySelector('.progress-text');

        if (progressFill && progressText) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `步骤 ${this.currentStep} / ${this.totalSteps}`;
        }
    }

    /**
     * 上一步
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * 下一步
     */
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // 保存当前步骤的数据
            this.saveStepData(this.currentStep);
            this.showStep(this.currentStep + 1);
        }
    }

    /**
     * 保存步骤数据
     */
    saveStepData(stepIndex) {
        if (stepIndex === 0) return; // 介绍步骤不需要保存

        const stepData = this.serviceConfig.processSteps[stepIndex - 1];
        if (!stepData.inputs) return;

        const stepDataMap = new Map();

        stepData.inputs.forEach(input => {
            const inputElement = document.getElementById(input.id);
            if (inputElement) {
                stepDataMap.set(input.name, inputElement.value);
            }
        });

        this.userProgress.set(stepIndex, stepDataMap);
    }

    /**
     * 开始服务
     */
    startService() {
        // 保存最后一步的数据
        this.saveStepData(this.currentStep);

        // 收集所有数据
        const allData = this.collectAllData();

        // 显示处理中状态
        this.showProcessingState();

        // 模拟服务处理
        setTimeout(() => {
            this.showCompletionState(allData);
        }, 2000);
    }

    /**
     * 收集所有用户数据
     */
    collectAllData() {
        const allData = {
            serviceType: this.serviceConfig.type,
            serviceName: this.serviceConfig.name,
            steps: []
        };

        this.userProgress.forEach((stepData, stepIndex) => {
            const stepObject = Object.fromEntries(stepData);
            allData.steps.push({
                step: stepIndex,
                data: stepObject
            });
        });

        return allData;
    }

    /**
     * 显示处理中状态
     */
    showProcessingState() {
        const container = document.getElementById('steps-container');
        if (!container) return;

        container.innerHTML = '';

        const processing = document.createElement('div');
        processing.className = 'processing-state';

        const spinner = document.createElement('div');
        spinner.className = 'spinner';

        const message = document.createElement('p');
        message.textContent = '正在处理您的请求，请稍候...';

        processing.appendChild(spinner);
        processing.appendChild(message);
        container.appendChild(processing);

        // 禁用所有按钮
        const buttons = this.modal.querySelectorAll('.modal-controls button');
        buttons.forEach(btn => btn.disabled = true);
    }

    /**
     * 显示完成状态
     */
    showCompletionState(data) {
        const container = document.getElementById('steps-container');
        if (!container) return;

        container.innerHTML = '';

        const completion = document.createElement('div');
        completion.className = 'completion-state';

        const successIcon = document.createElement('div');
        successIcon.className = 'success-icon';
        successIcon.textContent = '✓';

        const title = document.createElement('h3');
        title.textContent = '服务申请已提交！';

        const message = document.createElement('p');
        message.textContent = `感谢您使用${this.serviceConfig.name}，我们将在24小时内与您联系。`;

        const reference = document.createElement('p');
        reference.className = 'reference-number';
        reference.textContent = `参考编号：${this.generateReferenceNumber()}`;

        const actions = document.createElement('div');
        actions.className = 'completion-actions';

        const contactBtn = document.createElement('button');
        contactBtn.className = 'btn btn-primary';
        contactBtn.textContent = '立即联系';
        contactBtn.addEventListener('click', () => this.contactUs());

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-secondary';
        closeBtn.textContent = '关闭';
        closeBtn.addEventListener('click', () => this.closeModal());

        actions.appendChild(contactBtn);
        actions.appendChild(closeBtn);

        completion.appendChild(successIcon);
        completion.appendChild(title);
        completion.appendChild(message);
        completion.appendChild(reference);
        completion.appendChild(actions);

        container.appendChild(completion);

        // 记录完成事件
        this.trackServiceCompletion(data);
    }

    /**
     * 生成参考编号
     */
    generateReferenceNumber() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${this.serviceConfig.type.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * 记录服务完成事件
     */
    trackServiceCompletion(data) {
        // 这里可以集成分析服务
        console.log('📊 服务申请完成:', {
            serviceType: data.serviceType,
            timestamp: new Date().toISOString(),
            referenceNumber: this.generateReferenceNumber()
        });
    }

    /**
     * 联系我们功能
     */
    contactUs() {
        const contactMethods = {
            chat: () => this.openChat(),
            phone: () => this.openPhone(),
            email: () => this.openEmail(),
            form: () => this.openContactForm()
        };

        const method = contactMethods[this.serviceConfig.contactMethod];
        if (method) {
            method();
        } else {
            this.openContactForm();
        }
    }

    /**
     * 打开聊天窗口
     */
    openChat() {
        alert('正在连接客服聊天...');
        // 这里可以集成第三方聊天服务
    }

    /**
     * 拨打电话
     */
    openPhone() {
        window.location.href = 'tel:+81-3-1234-5678';
    }

    /**
     * 发送邮件
     */
    openEmail() {
        const subject = encodeURIComponent(`${this.serviceConfig.name}服务咨询`);
        const body = encodeURIComponent(`我想咨询${this.serviceConfig.name}服务。`);
        window.location.href = `mailto:contact@example.com?subject=${subject}&body=${body}`;
    }

    /**
     * 打开联系表单
     */
    openContactForm() {
        this.closeModal();
        // 滚动到页面联系表单位置
        const contactSection = document.querySelector('.contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

/**
 * 全局函数 - 保持向后兼容性
 */
function startService() {
    if (window.aiServiceManager) {
        window.aiServiceManager.showModal();
    }
}

function showDemo() {
    alert('演示功能正在开发中，敬请期待！');
}

function contactUs() {
    if (window.aiServiceManager) {
        window.aiServiceManager.contactUs();
    } else {
        window.location.href = 'tel:+81-3-1234-5678';
    }
}

function learnMore() {
    // 滚动到功能特色部分
    const featuresSection = document.querySelector('.service-features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 从全局配置获取服务信息
    const serviceConfig = window.SERVICE_CONFIG || {
        name: 'AI服务',
        type: 'general',
        features: ['智能分析', '自动化处理', '专业咨询'],
        processSteps: [
            {
                title: '需求确认',
                description: '请描述您的具体需求',
                inputs: [
                    {
                        id: 'requirement',
                        name: 'requirement',
                        type: 'textarea',
                        label: '需求描述',
                        placeholder: '请详细描述您的需求...',
                        required: true
                    }
                ]
            }
        ],
        benefits: ['高效便捷', '专业可靠', '成本优化'],
        contactMethod: 'chat'
    };

    // 初始化AI服务管理器
    window.aiServiceManager = new AIServiceManager(serviceConfig);

    console.log('🎯 AI服务页面已加载完成');
});