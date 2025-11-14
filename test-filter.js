// 筛选功能测试脚本
console.log('🧪 Testing filter functionality...');

// 测试AI出海页面筛选
function testAiglobalFilter() {
    console.log('🌍 Testing AI Global filter...');

    // 检查筛选管理器是否存在
    let manager = window.getFilterManager('aiglobal');
    if (!manager) {
        console.log('Creating AI Global filter manager...');
        manager = window.createFilterManager('aiglobal');
    }

    // 检查卡片元素
    const cards = document.querySelectorAll('.global-card');
    console.log(`Found ${cards.length} global cards`);

    cards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        console.log(`Card ${index}: ${card.querySelector('h3')?.textContent} - Category: ${category}`);
    });

    // 检查标签元素
    const tags = document.querySelectorAll('.tag');
    console.log(`Found ${tags.length} filter tags`);

    // 测试筛选
    if (manager && cards.length > 0) {
        console.log('Testing filter with category "market"...');
        manager.filterByCategory('market');

        setTimeout(() => {
            const visibleCards = document.querySelectorAll('.global-card:not([style*="display: none"])');
            console.log(`Visible cards after filtering: ${visibleCards.length}`);
        }, 100);
    }
}

// 测试AI财务页面筛选
function testAifinanceFilter() {
    console.log('💰 Testing AI Finance filter...');

    let manager = window.getFilterManager('aifinance');
    if (!manager) {
        console.log('Creating AI Finance filter manager...');
        manager = window.createFilterManager('aifinance');
    }

    const cards = document.querySelectorAll('.finance-card');
    console.log(`Found ${cards.length} finance cards`);

    cards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        console.log(`Card ${index}: ${card.querySelector('h3')?.textContent} - Category: ${category}`);
    });

    if (manager && cards.length > 0) {
        console.log('Testing filter with category "accounting"...');
        manager.filterByCategory('accounting');

        setTimeout(() => {
            const visibleCards = document.querySelectorAll('.finance-card:not([style*="display: none"])');
            console.log(`Visible cards after filtering: ${visibleCards.length}`);
        }, 100);
    }
}

// 页面加载完成后运行测试
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('aiglobal') || currentPath.includes('global')) {
            testAiglobalFilter();
        } else if (currentPath.includes('aifinance') || currentPath.includes('finance')) {
            testAifinanceFilter();
        }
    }, 1000);
});

// 导出到全局作用域，供手动调用
window.testFilters = {
    aiglobal: testAiglobalFilter,
    aifinance: testAifinanceFilter
};

console.log('✅ Filter test script loaded');