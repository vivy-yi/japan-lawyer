// 知识库页面专用JavaScript函数
// Japan Business Hub - Knowledge Base

// 筛选知识库内容
window.filterKnowledge = function(category) {
    const cards = document.querySelectorAll('.knowledge-card, .info-card, .card');
    const tags = document.querySelectorAll('.filter-tag, .filter-btn');

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

    console.log(`筛选知识库: ${category}`);
};

// 搜索知识库内容
window.searchKnowledge = function() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.knowledge-card, .info-card, .card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`搜索知识库: ${searchTerm}`);
};

console.log('✅ Knowledge page functions loaded');