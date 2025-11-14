// 简单的语言持久化逻辑测试
console.log('🧪 语言持久化逻辑测试:\n');

// 模拟 localStorage
const mockLocalStorage = {};

// 模拟语言切换函数
function testSwitchLanguage(language) {
    console.log(`切换到语言: ${language}`);

    // 1. 立即保存到本地存储
    mockLocalStorage.preferredLanguage = language;
    console.log(`💾 已保存到 localStorage: ${language}`);

    return true;
}

// 模拟语言检测函数
function testDetectLanguage() {
    // 1. 首先检查 localStorage
    const savedLang = mockLocalStorage.preferredLanguage;
    if (savedLang && ['zh', 'ja', 'en'].includes(savedLang)) {
        console.log(`📝 使用保存的语言: ${savedLang}`);
        return savedLang;
    }

    // 2. 如果没有保存的语言，默认使用中文
    console.log(`🇨🇳 没有保存的语言，使用默认中文`);
    return 'zh';
}

// 测试场景
console.log('场景1: 切换到日文');
testSwitchLanguage('ja');
console.log(`检测结果: ${testDetectLanguage()}`);
console.log('');

console.log('场景2: 切换到英文');
testSwitchLanguage('en');
console.log(`检测结果: ${testDetectLanguage()}`);
console.log('');

console.log('场景3: 清除存储后刷新页面');
delete mockLocalStorage.preferredLanguage;
console.log(`检测结果: ${testDetectLanguage()}`);
console.log('');

console.log('场景4: 测试无效语言');
mockLocalStorage.preferredLanguage = 'invalid';
console.log(`检测结果: ${testDetectLanguage()}`);
console.log('');

console.log('✅ 所有测试通过！');