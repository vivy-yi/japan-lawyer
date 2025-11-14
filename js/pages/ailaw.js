// AI法律服务页面脚本
console.log('✅ AI Legal Services page loaded successfully');

// AI法律服务筛选功能
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

    console.log(`筛选AI法律服务: ${category}`);
};

// AI法律服务搜索功能
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

    console.log(`搜索AI法律服务: ${searchTerm}`);
};

// 页面加载完成后初始化
// 注意：模态窗口逻辑现在由 legal-modal-manager.js 处理
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 AI Legal page content filtering initialized');

    // 页面特有的初始化逻辑可以在这里添加
    // 模态窗口相关逻辑已移动到 legal-modal-manager.js
});
