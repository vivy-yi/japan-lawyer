/**
 * Global Logging Helper - 统一日志管理
 * 统一所有文件的console.log输出到日志系统
 */

// 创建全局日志辅助函数
window.logInfo = function(message, data = null, tag = 'GLOBAL') {
    // 默认关闭所有日志输出，除非日志系统明确开启
    if (window.APP_DEBUG && window.APP_DEBUG.logger && window.APP_DEBUG.logger.config && window.APP_DEBUG.logger.config.enabled) {
        window.APP_DEBUG.logger.info(message, data, tag);
    }
    // 默认不输出到console，保持静默
};

window.logWarn = function(message, data = null, tag = 'GLOBAL') {
    // 默认关闭所有日志输出，除非日志系统明确开启
    if (window.APP_DEBUG && window.APP_DEBUG.logger && window.APP_DEBUG.logger.config && window.APP_DEBUG.logger.config.enabled) {
        window.APP_DEBUG.logger.warn(message, data, tag);
    }
    // 默认不输出到console，保持静默
};

window.logError = function(message, error = null, tag = 'GLOBAL') {
    // 默认关闭所有日志输出，除非日志系统明确开启
    if (window.APP_DEBUG && window.APP_DEBUG.logger && window.APP_DEBUG.logger.config && window.APP_DEBUG.logger.config.enabled) {
        window.APP_DEBUG.logger.error(message, error, tag);
    }
    // 默认不输出到console，保持静默
};

window.logDebug = function(message, tag = 'GLOBAL') {
    // 默认关闭所有日志输出，除非日志系统明确开启
    if (window.APP_DEBUG && window.APP_DEBUG.logger && window.APP_DEBUG.logger.config && window.APP_DEBUG.logger.config.enabled) {
        window.APP_DEBUG.logger.debug(message, null, tag);
    }
    // 默认不输出到console，保持静默
};

// 默认不输出加载信息，保持静默
// window.logInfo('📝 Global logging helper loaded');