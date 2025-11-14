// 宠物服务页面专用JavaScript函数
// Japan Business Hub - Pet Services

// 显示宠物服务详情
window.showPetServiceDetails = function(serviceType) {
    // 查找所有服务卡片
    const serviceCards = document.querySelectorAll('.service-card');

    // 移除所有激活状态
    serviceCards.forEach(card => {
        card.classList.remove('active');
    });

    // 激活对应的服务卡片
    const targetCard = document.querySelector(`[data-service="${serviceType}"]`);
    if (targetCard) {
        targetCard.classList.add('active');

        // 滚动到对应卡片（可选）
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 使用语言管理器获取当前语言
    const lang = window.currentLanguage || 'zh';
    const message = lang === 'zh' ?
        '您选择了宠物服务，请联系我们获取更多详情。' :
        'You selected a pet service. Please contact us for more details.';
    alert(message);

    console.log(`显示宠物服务详情: ${serviceType}`);
};

// 显示套餐详情
window.showPackageDetails = function(packageType) {
    const lang = window.currentLanguage || 'zh';
    let message = '';

    switch(packageType) {
        case 'basic':
            message = lang === 'zh' ?
                '基础套餐：提供基本的宠物护理服务，适合日常需求。' :
                'Basic Package: Basic pet care services suitable for daily needs.';
            break;
        case 'professional':
            message = lang === 'zh' ?
                '专业套餐：全面的专业宠物服务，包含医疗和美容。' :
                'Professional Package: Comprehensive pet services including medical and grooming.';
            break;
        case 'vip':
            message = lang === 'zh' ?
                'VIP尊享套餐：顶级宠物服务，个性化定制方案。' :
                'VIP Package: Premium pet services with personalized customization.';
            break;
        default:
            message = lang === 'zh' ? '请选择合适的套餐。' : 'Please select a suitable package.';
    }

    alert(message);
    console.log(`显示宠物套餐详情: ${packageType}`);
};

console.log('✅ Pet services page functions loaded');