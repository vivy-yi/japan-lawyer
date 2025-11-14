// 专业人才页面专用JavaScript函数
// Japan Business Hub - Professional Services

// 筛选专业人才
window.filterProfessionals = function(category) {
    const cards = document.querySelectorAll('.professional-card');
    const tags = document.querySelectorAll('.filter-tag');

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

    window.logInfo(`筛选专业人才: ${category}`);
};

// 搜索专业人才
window.searchProfessionals = function() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.professional-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    window.logInfo(`搜索专业人才: ${searchTerm}`);
};

// 联系专业人才
window.contactProfessional = function(professionalName) {
    alert(`正在为您联系${professionalName}，我们的客服将在1小时内与您联系。`);
    window.logInfo(`联系专业人才: ${professionalName}`);
};

// 查看专业人才详情
window.viewProfile = function(profileId) {
    alert('详细页面正在开发中，敬请期待！');
    window.logInfo(`查看个人资料: ${profileId}`);
};

window.logInfo('✅ Professionals page functions loaded');