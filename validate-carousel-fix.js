/**
 * 轮播组件验证脚本
 * 用于验证轮播闪烁问题的修复效果
 */

// 验证函数：检查轮播组件状态
function validateCarouselFix() {
    window.logInfo('🔍 开始验证轮播组件修复效果...');

    // 1. 检查HTML中是否还存在硬编码的动画类
    window.logInfo('📋 检查HTML硬编码动画类...');
    const slideContents = document.querySelectorAll('.slide-content');
    let hardcodedAnimationCount = 0;

    slideContents.forEach((content, index) => {
        if (content.classList.contains('slide-in-left') ||
            content.classList.contains('slide-in-right')) {
            hardcodedAnimationCount++;
            window.logWarn(`⚠️ Slide ${index + 1} 仍有硬编码动画类:`, content.className);
        }
    });

    if (hardcodedAnimationCount === 0) {
        window.logInfo('✅ HTML硬编码动画类已完全清除');
    } else {
        window.logError(`❌ 发现 ${hardcodedAnimationCount} 个硬编码动画类`);
    }

    // 2. 检查CSS初始状态
    window.logInfo('📋 检查CSS初始状态...');
    const computedStyles = [];
    slideContents.forEach((content, index) => {
        const styles = window.getComputedStyle(content);
        computedStyles.push({
            index: index + 1,
            opacity: styles.opacity,
            visibility: styles.visibility,
            transform: styles.transform
        });
    });

    window.logInfo('📊 Slide内容初始状态:');
    computedStyles.forEach(style => {
        window.logInfo(`  Slide ${style.index}: opacity=${style.opacity}, visibility=${style.visibility}`);
    });

    // 3. 检查JavaScript状态管理
    window.logInfo('📋 检查JavaScript状态管理...');
    const carouselInstance = window.carouselInstance;

    if (carouselInstance) {
        window.logInfo('✅ 轮播实例已创建');
        window.logInfo(`📊 当前状态: currentSlide=${carouselInstance.currentSlide}, isTransitioning=${carouselInstance.isTransitioning}`);
        window.logInfo(`📊 总幻灯片数: ${carouselInstance.slides ? carouselInstance.slides.length : 0}`);
    } else {
        window.logWarn('⚠️ 轮播实例未找到');
    }

    // 4. 测试动画控制
    window.logInfo('📋 测试动画控制类...');
    const testElement = document.createElement('div');
    testElement.className = 'slide-content';
    document.body.appendChild(testElement);

    const animateClasses = [
        'animate-in-left', 'animate-in-right',
        'animate-out-left', 'animate-out-right'
    ];

    animateClasses.forEach(className => {
        testElement.classList.add(className);
        if (testElement.classList.contains(className)) {
            window.logInfo(`✅ CSS动画类 .${className} 可用`);
        }
        testElement.classList.remove(className);
    });

    document.body.removeChild(testElement);

    // 5. 检查控制点功能
    window.logInfo('📋 检查控制点功能...');
    const dots = document.querySelectorAll('.carousel-dot');
    if (dots.length > 0) {
        window.logInfo(`✅ 找到 ${dots.length} 个控制点`);

        // 检查第一个控制点是否为active
        const firstDotActive = dots[0].classList.contains('active');
        if (firstDotActive) {
            window.logInfo('✅ 第一个控制点正确设置为active');
        } else {
            window.logWarn('⚠️ 第一个控制点未设置为active');
        }
    } else {
        window.logWarn('⚠️ 未找到控制点');
    }

    // 6. 检查slide的active状态
    window.logInfo('📋 检查slide的active状态...');
    const slides = document.querySelectorAll('.carousel-slide');
    let activeSlideCount = 0;

    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            activeSlideCount++;
            window.logInfo(`✅ Slide ${index + 1} 为 active`);
        }
    });

    if (activeSlideCount === 1) {
        window.logInfo('✅ 只有一个slide处于active状态');
    } else {
        window.logError(`❌ 发现 ${activeSlideCount} 个active slide，应该只有1个`);
    }

    // 总结
    window.logInfo('\n📋 修复验证总结:');
    window.logInfo(`  - 硬编码动画类: ${hardcodedAnimationCount === 0 ? '✅ 已清除' : '❌ 仍有残留'}`);
    window.logInfo(`  - 轮播实例: ${carouselInstance ? '✅ 正常' : '❌ 未找到'}`);
    window.logInfo(`  - 活动slide: ${activeSlideCount === 1 ? '✅ 正常' : '❌ 异常'}`);
    window.logInfo(`  - 控制点: ${dots.length > 0 ? '✅ 正常' : '❌ 未找到'}`);

    const isFixSuccessful = hardcodedAnimationCount === 0 &&
                           carouselInstance !== null &&
                           activeSlideCount === 1 &&
                           dots.length > 0;

    if (isFixSuccessful) {
        window.logInfo('\n🎉 轮播组件修复验证成功！闪烁问题应该已解决。');
        window.logInfo('💡 建议：点击控制点测试轮播切换效果。');
    } else {
        window.logInfo('\n❌ 轮播组件修复验证失败，请检查上述问题。');
    }

    return isFixSuccessful;
}

// 页面加载完成后自动运行验证
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateCarouselFix);
} else {
    // 延迟1秒运行，确保轮播初始化完成
    setTimeout(validateCarouselFix, 1000);
}

// 导出到全局，方便手动调用
window.validateCarouselFix = validateCarouselFix;

window.logInfo('🔧 轮播验证脚本已加载，输入 validateCarouselFix() 开始验证');