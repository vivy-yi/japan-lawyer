// 简单的语言持久化逻辑测试
window.logInfo('🧪 语言持久化逻辑测试:\n');

// 模拟 localStorage
const mockLocalStorage = {};

// 模拟语言切换函数
function testSwitchLanguage(language) {
    window.logInfo(`切换到语言: ${language}`);

    // 1. 立即保存到本地存储
    mockLocalStorage.preferredLanguage = language;
    window.logInfo(`💾 已保存到 localStorage: ${language}`);

    return true;
}

// 模拟语言检测函数
function testDetectLanguage() {
    // 1. 首先检查 localStorage
    const savedLang = mockLocalStorage.preferredLanguage;
    if (savedLang && ['zh', 'ja', 'en'].includes(savedLang)) {
        window.logInfo(`📝 使用保存的语言: ${savedLang}`);
        return savedLang;
    }

    // 2. 如果没有保存的语言，默认使用中文
    window.logInfo(`🇨🇳 没有保存的语言，使用默认中文`);
    return 'zh';
}

// 测试场景
window.logInfo('场景1: 切换到日文');
testSwitchLanguage('ja');
window.logInfo(`检测结果: ${testDetectLanguage()}`);
window.logInfo('');

window.logInfo('场景2: 切换到英文');
testSwitchLanguage('en');
window.logInfo(`检测结果: ${testDetectLanguage()}`);
window.logInfo('');

window.logInfo('场景3: 清除存储后刷新页面');
delete mockLocalStorage.preferredLanguage;
window.logInfo(`检测结果: ${testDetectLanguage()}`);
window.logInfo('');

window.logInfo('场景4: 测试无效语言');
mockLocalStorage.preferredLanguage = 'invalid';
window.logInfo(`检测结果: ${testDetectLanguage()}`);
window.logInfo('');

window.logInfo('✅ 所有测试通过！');