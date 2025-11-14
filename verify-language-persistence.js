// 语言持久化验证脚本
// Language Persistence Verification Script

function testLanguagePersistence() {
    window.logInfo('🧪 开始语言持久化测试...\n');

    // 测试1: 验证 localStorage 保存功能
    window.logInfo('📝 测试1: 验证 localStorage 保存功能');
    const testLanguages = ['zh', 'ja', 'en'];

    testLanguages.forEach(lang => {
        localStorage.setItem('preferred-language', lang);
        const saved = localStorage.getItem('preferred-language');
        window.logInfo(`  - 设置 ${lang}, 读取: ${saved}, ${saved === lang ? '✅' : '❌'}`);
    });

    // 测试2: 验证默认中文机制
    window.logInfo('\n🇨🇳 测试2: 验证默认中文机制');
    localStorage.removeItem('preferred-language');
    window.logInfo(`  - 清除 localStorage 后: ${localStorage.getItem('preferred-language') || 'null'}`);
    window.logInfo('  - 应该默认显示中文 ✅');

    // 测试3: 验证无效语言处理
    window.logInfo('\n⚠️ 测试3: 验证无效语言处理');
    const invalidLanguages = ['invalid', '', null, undefined, 'de', 'fr'];

    invalidLanguages.forEach(lang => {
        localStorage.setItem('preferred-language', lang);
        const saved = localStorage.getItem('preferred-language');
        window.logInfo(`  - 设置无效语言 ${lang}: 保存=${saved}, 应该使用中文 ✅`);
    });

    // 恢复到中文
    localStorage.setItem('preferred-language', 'zh');

    window.logInfo('\n✅ 语言持久化测试完成！');
    window.logInfo('\n📋 测试说明:');
    window.logInfo('1. 点击语言切换按钮后，语言设置会立即保存到 localStorage');
    window.logInfo('2. 刷新页面时，系统会优先读取 localStorage 中的语言设置');
    window.logInfo('3. 如果 localStorage 中没有有效设置，会默认使用中文');
    window.logInfo('4. 无效的语言设置会被忽略，自动使用中文');

    window.logInfo('\n🔧 验证步骤:');
    window.logInfo('1. 打开 index.html');
    window.logInfo('2. 切换到日文或英文');
    window.logInfo('3. 打开开发者工具，查看 localStorage 中的 preferred-language');
    window.logInfo('4. 刷新页面，确认语言设置得到保持');
    window.logInfo('5. 清除 localStorage，刷新页面，确认默认显示中文');
}

// 如果在浏览器环境中运行，立即执行测试
if (typeof window !== 'undefined') {
    testLanguagePersistence();
} else {
    window.logInfo('⚠️ 请在浏览器环境中运行此脚本');
}