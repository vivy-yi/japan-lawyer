// AI CRM系统页面脚本
console.log('✅ AI CRM System page loaded successfully');

// AI CRM系统筛选功能
window.filterKnowledge = function(category) {
    const cards = document.querySelectorAll('.knowledge-card');
    const tags = document.querySelectorAll('.tag');

    // 更新标签状态
    tags.forEach(tag => tag.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    // 显示/隐藏卡片
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`筛选AI CRM系统: ${category}`);
};

// AI CRM系统搜索功能
window.searchKnowledge = function() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.knowledge-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`搜索AI CRM系统: ${searchTerm}`);
};

// AI CRM系统初始化
window.initAicrmPage = function() {
    console.log('🤖 Initializing AI CRM System functionality...');

    // 添加页面特定的功能按钮事件
    const crmButtons = document.querySelectorAll('[data-crm-action]');
    crmButtons.forEach(button => {
        button.addEventListener('click', handleCrmAction);
    });
};

// 处理CRM系统操作
function handleCrmAction(event) {
    const action = event.target.getAttribute('data-crm-action');
    console.log(`🔍 CRM action triggered: ${action}`);

    switch (action) {
        case 'customer-management':
            window.showCustomerManagement();
            break;
        case 'sales-automation':
            window.showSalesAutomation();
            break;
        case 'data-analytics':
            window.showDataAnalytics();
            break;
        case 'ai-assistant':
            window.showAiAssistant();
            break;
        default:
            console.log(`Unknown CRM action: ${action}`);
    }
}

// 显示客户管理
window.showCustomerManagement = function() {
    const modal = document.createElement('div');
    modal.className = 'crm-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>👥 AI客户管理</h3>
            <p>智能客户关系管理系统，提供360度客户视图和个性化服务。</p>
            <button class="btn-primary" onclick="this.closest('.crm-modal').remove()">
                进入系统
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};

// 显示销售自动化
window.showSalesAutomation = function() {
    const modal = document.createElement('div');
    modal.className = 'crm-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>🚀 AI销售自动化</h3>
            <p>智能销售流程自动化，提升销售效率和转化率。</p>
            <button class="btn-primary" onclick="this.closest('.crm-modal').remove()">
                开始配置
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};

// 显示数据分析
window.showDataAnalytics = function() {
    const modal = document.createElement('div');
    modal.className = 'crm-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>📊 AI数据分析</h3>
            <p>深度业务数据分析，提供决策支持和预测洞察。</p>
            <button class="btn-primary" onclick="this.closest('.crm-modal').remove()">
                查看报表
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};

// 显示AI助手
window.showAiAssistant = function() {
    const modal = document.createElement('div');
    modal.className = 'crm-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>🤖 AI助手</h3>
            <p>智能CRM助手，提供业务建议和操作指导。</p>
            <button class="btn-primary" onclick="this.closest('.crm-modal').remove()">
                启动助手
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待其他脚本加载完成
    setTimeout(() => {
        if (document.body) {
            window.initAicrmPage();
        }
    }, 500);
});
