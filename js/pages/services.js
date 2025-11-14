// 服务详情页面专用JavaScript函数
// Japan Business Hub - Service Details

// 显示服务详情
window.showServiceDetails = function(serviceType) {
    // 检测当前页面类型
    const currentLanguage = window.currentLanguage || 'zh';
    const currentPage = detectCurrentPage();

    // 如果是宠物页面，使用宠物页面的逻辑
    if (currentPage === 'pet') {
        const message = currentLanguage === 'zh' ?
            '您选择了宠物服务，请联系我们获取更多详情。' :
            'You selected a pet service. Please contact us for more details.';
        alert(message);
        console.log(`显示宠物服务详情: ${serviceType}`);
        return;
    }

    // 查找所有服务详情卡片
    const detailCards = document.querySelectorAll('.service-detail, .detail-card, .info-panel');
    const serviceItems = document.querySelectorAll('.service-item, .service-card');

    // 隐藏所有详情卡片
    detailCards.forEach(card => {
        card.style.display = 'none';
    });

    // 移除所有激活状态
    serviceItems.forEach(item => {
        item.classList.remove('active');
    });

    // 显示对应的服务详情
    const targetCard = document.querySelector(`[data-service="${serviceType}"], #${serviceType}-details, .${serviceType}-detail`);
    if (targetCard) {
        targetCard.style.display = 'block';
    }

    // 激活对应的服务项
    const targetItem = document.querySelector(`[data-service="${serviceType}"], [onclick*="${serviceType}"]`);
    if (targetItem) {
        targetItem.classList.add('active');
    }

    // 定义各页面的服务类型
    const lifestyleServices = {
        'translate': { zh: '翻译服务：专业多语种翻译，解决语言沟通障碍', en: 'Translation Service: Professional multilingual translation to solve communication barriers' },
        'errand': { zh: '代跑服务：代办各种日常事务，节省您宝贵时间', en: 'Errand Service: Handle various daily tasks to save your precious time' },
        'repair': { zh: '维修服务：专业维修团队，解决各种设备问题', en: 'Repair Service: Professional repair team to solve various equipment problems' },
        'medical': { zh: '陪同就诊：专业医疗翻译陪同，就医无忧', en: 'Medical Accompaniment: Professional medical translation and accompaniment for worry-free medical visits' },
        'housing': { zh: '住房帮忙：租房买房协助，安家无忧', en: 'Housing Assistance: Help with renting and buying property for worry-free settlement' },
        'transport': { zh: '交通协助：驾照办理、车辆相关事务协助', en: 'Transportation Assistance: Driver\'s license processing and vehicle-related matters' }
    };

    const educationServices = {
        'application': { zh: '留学申请：专业申请指导，提高录取率', en: 'Application Service: Professional application guidance to increase admission rate' },
        'visa': { zh: '签证服务：专业签证办理，确保成功率', en: 'Visa Service: Professional visa processing to ensure success rate' },
        'language': { zh: '语言培训：专业语言课程，快速提升能力', en: 'Language Training: Professional language courses for rapid skill improvement' },
        'accommodation': { zh: '住宿安排：安全舒适住宿，无后顾之忧', en: 'Accommodation Arrangement: Safe and comfortable housing with no worries' },
        'life': { zh: '生活服务：全方位生活支持，适应新环境', en: 'Life Services: Comprehensive life support for adapting to new environment' }
    };

    const laborServices = {
        'enterprise': { zh: '企业服务：专业企业人力资源解决方案', en: 'Enterprise Service: Professional corporate HR solutions' },
        'personal': { zh: '个人服务：个人劳务派遣与就业支持', en: 'Personal Service: Personal labor dispatch and employment support' },
        'special': { zh: '特殊服务：特殊行业专业劳务支持', en: 'Special Service: Professional labor support for special industries' },
        'payroll': { zh: '薪酬服务：专业薪酬管理与发放', en: 'Payroll Service: Professional payroll management and distribution' },
        'hr': { zh: '人力资源：全方位HR解决方案', en: 'HR Service: Comprehensive HR solutions' }
    };

    const tourismServices = {
        'custom': { zh: '定制旅游：个性化旅游路线定制', en: 'Custom Tourism: Personalized travel route customization' },
        'business': { zh: '商务旅游：专业商务行程安排', en: 'Business Tourism: Professional business trip arrangements' },
        'culture': { zh: '文化旅游：深度文化体验游', en: 'Cultural Tourism: In-depth cultural experience tours' }
    };

    // 根据当前页面选择对应的服务类型
    let pageServices = {};
    switch (currentPage) {
        case 'lifestyle':
            pageServices = lifestyleServices;
            break;
        case 'education':
            pageServices = educationServices;
            break;
        case 'labor':
            pageServices = laborServices;
            break;
        case 'tourism':
            pageServices = tourismServices;
            break;
        default:
            // 默认合并所有服务类型（保持向后兼容）
            pageServices = { ...lifestyleServices, ...educationServices, ...laborServices, ...tourismServices };
    }

    // 对于没有详情卡片的服务类型，显示提示信息
    if (pageServices[serviceType] && !targetCard) {
        alert(pageServices[serviceType][currentLanguage]);
    }

    console.log(`显示${currentPage}页面服务详情: ${serviceType}`);
};

// 辅助函数：检测当前页面类型
function detectCurrentPage() {
    // 方法1：检查URL hash
    if (window.location.hash) {
        const pageFromHash = window.location.hash.replace('#', '');
        const validPages = ['lifestyle', 'education', 'labor', 'tourism', 'pet'];
        if (validPages.includes(pageFromHash)) {
            return pageFromHash;
        }
    }

    // 方法2：检查页面标题
    const title = document.title || '';
    if (title.includes('生活方式') || title.includes('Lifestyle')) return 'lifestyle';
    if (title.includes('教育') || title.includes('Education')) return 'education';
    if (title.includes('劳务') || title.includes('Labor')) return 'labor';
    if (title.includes('旅游') || title.includes('Tourism')) return 'tourism';
    if (title.includes('宠物') || title.includes('Pet')) return 'pet';

    // 方法3：检查页面内容特征
    const bodyText = document.body.textContent || document.body.innerText || '';
    if (bodyText.includes('生活方式服务') || bodyText.includes('翻译服务')) return 'lifestyle';
    if (bodyText.includes('留学申请') || bodyText.includes('签证服务')) return 'education';
    if (bodyText.includes('企业服务') || bodyText.includes('人力资源')) return 'labor';
    if (bodyText.includes('定制旅游') || bodyText.includes('文化旅游')) return 'tourism';
    if (bodyText.includes('宠物服务') || bodyText.includes('宠物护理')) return 'pet';

    // 方法4：检查当前SPA状态
    if (window.spaRouter && window.spaRouter.getCurrentPage) {
        const currentPage = window.spaRouter.getCurrentPage();
        if (currentPage) return currentPage;
    }

    // 方法5：检查导航状态
    if (window.navigationController && window.navigationController.stateManager) {
        const currentState = window.navigationController.stateManager.getCurrentState();
        if (currentState && currentState.page) return currentState.page;
    }

    // 默认返回lifestyle（最常见的使用场景）
    return 'lifestyle';
}

// 移动端菜单切换
window.toggleMobileMenu = function() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');

    // 点击菜单项后自动关闭菜单
    if (navMenu.classList.contains('active')) {
        const menuLinks = navMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
};

// 表单提交功能
window.submitConsultation = function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const consultationData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        age: formData.get('age'),
        education: formData.get('education'),
        target: formData.get('target'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };

    console.log('Education consultation submitted:', consultationData);

    // 显示成功消息
    const currentLanguage = window.currentLanguage || 'zh';
    alert(currentLanguage === 'zh' ?
        '评估请求已提交！我们将在24小时内联系您进行详细咨询。' :
        'Assessment request submitted! We will contact you within 24 hours for detailed consultation.'
    );

    // 重置表单
    event.target.reset();
};

// 页面初始化
window.initializeServicePage = function() {
    // 点击页面其他地方关闭移动菜单
    document.addEventListener('click', function (event) {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navMenu && menuToggle &&
            navMenu.classList.contains('active') &&
            !navMenu.contains(event.target) &&
            !menuToggle.contains(event.target)) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    console.log('✅ Service page initialized');
};

// 筛选服务功能 - 适用于劳务、生活、教育页面
window.filterServices = function(category) {
    const currentPage = detectCurrentPage();
    const cards = document.querySelectorAll('.service-card, .professional-card');
    const tags = document.querySelectorAll('.filter-tag');

    // 更新标签状态
    tags.forEach(tag => tag.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    // 根据页面类型选择相应的筛选逻辑
    let dataAttribute = 'data-category';
    let cardClass = '.service-card, .professional-card';

    if (currentPage === 'labor') {
        // 劳务页面筛选逻辑
        cards.forEach(card => {
            const laborCategory = card.getAttribute('data-labor-category') || card.getAttribute('data-category');
            if (category === 'all' || laborCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    } else if (currentPage === 'lifestyle') {
        // 生活页面筛选逻辑
        cards.forEach(card => {
            const lifestyleCategory = card.getAttribute('data-lifestyle-category') || card.getAttribute('data-category');
            if (category === 'all' || lifestyleCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    } else if (currentPage === 'education') {
        // 教育页面筛选逻辑
        cards.forEach(card => {
            const educationCategory = card.getAttribute('data-education-category') || card.getAttribute('data-category');
            if (category === 'all' || educationCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    } else {
        // 默认筛选逻辑
        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    console.log(`筛选${currentPage}页面服务: ${category}`);
};

// 搜索服务功能 - 适用于劳务、生活、教育页面
window.searchServices = function() {
    const currentPage = detectCurrentPage();
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.service-card, .professional-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`搜索${currentPage}页面服务: ${searchTerm}`);
};

// 劳务页面专用功能
window.filterLaborServices = function(category) {
    const cards = document.querySelectorAll('.labor-card, .service-card');
    const tags = document.querySelectorAll('.filter-tag');

    // 更新标签状态
    tags.forEach(tag => tag.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    // 显示/隐藏卡片
    cards.forEach(card => {
        const laborCategory = card.getAttribute('data-labor-category') || card.getAttribute('data-category');
        if (category === 'all' || laborCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`筛选劳务服务: ${category}`);
};

window.searchLaborServices = function() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.labor-card, .service-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`搜索劳务服务: ${searchTerm}`);
};

// 生活方式页面专用功能
window.filterLifestyleServices = function(category) {
    const cards = document.querySelectorAll('.lifestyle-card, .service-card');
    const tags = document.querySelectorAll('.filter-tag');

    // 更新标签状态
    tags.forEach(tag => tag.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    // 显示/隐藏卡片
    cards.forEach(card => {
        const lifestyleCategory = card.getAttribute('data-lifestyle-category') || card.getAttribute('data-category');
        if (category === 'all' || lifestyleCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`筛选生活方式服务: ${category}`);
};

window.searchLifestyleServices = function() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.lifestyle-card, .service-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`搜索生活方式服务: ${searchTerm}`);
};

// 教育页面专用功能
window.filterEducationServices = function(category) {
    const cards = document.querySelectorAll('.education-card, .service-card');
    const tags = document.querySelectorAll('.filter-tag');

    // 更新标签状态
    tags.forEach(tag => tag.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    // 显示/隐藏卡片
    cards.forEach(card => {
        const educationCategory = card.getAttribute('data-education-category') || card.getAttribute('data-category');
        if (category === 'all' || educationCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`筛选教育服务: ${category}`);
};

window.searchEducationServices = function() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.education-card, .service-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`搜索教育服务: ${searchTerm}`);
};

// 联系服务提供商
window.contactServiceProvider = function(serviceName, providerName = '') {
    const currentPage = detectCurrentPage();
    let message = '';

    if (providerName) {
        message = currentPage === 'zh' ?
            `正在为您联系${serviceName}的${providerName}，我们的客服将在1小时内与您联系。` :
            `Connecting you with ${providerName} from ${serviceName}, our customer service will contact you within 1 hour.`;
    } else {
        message = currentPage === 'zh' ?
            `正在为您联系${serviceName}服务，我们的客服将在1小时内与您联系。` :
            `Connecting you with ${serviceName} service, our customer service will contact you within 1 hour.`;
    }

    alert(message);
    console.log(`联系服务提供商: ${serviceName} - ${providerName}`);
};

// 查看服务详情
window.viewServiceDetails = function(serviceId) {
    const currentPage = detectCurrentPage();
    alert(`${currentPage}服务详情页面正在开发中，敬请期待！`);
    console.log(`查看服务详情: ${serviceId}`);
};

console.log('✅ Services page functions loaded');