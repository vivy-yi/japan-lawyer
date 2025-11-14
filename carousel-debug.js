/**
 * 轮播图调试脚本
 * 用于全面测试轮播图功能的修复效果
 */

function debugCarousel() {
    window.logInfo('🔍 开始调试轮播图系统...');

    // 1. 检查基础结构
    window.logInfo('\n📋 1. 检查基础结构');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const carouselInstance = window.carouselInstance;

    window.logInfo(`   - 找到 ${slides.length} 个轮播slide`);
    window.logInfo(`   - 找到 ${dots.length} 个控制点`);
    window.logInfo(`   - 轮播实例: ${carouselInstance ? '✅ 存在' : '❌ 不存在'}`);

    if (slides.length === 0) {
        window.logError('❌ 未找到任何轮播slide！');
        return false;
    }

    if (dots.length === 0) {
        window.logError('❌ 未找到任何控制点！');
        return false;
    }

    // 2. 检查slide状态
    window.logInfo('\n📋 2. 检查slide状态');
    let activeSlideCount = 0;
    let activeDotCount = 0;

    slides.forEach((slide, index) => {
        const isActive = slide.classList.contains('active');
        const hasInlineStyles = slide.getAttribute('style');
        const slideContent = slide.querySelector('.slide-content');
        const contentInlineStyles = slideContent ? slideContent.getAttribute('style') : null;

        window.logInfo(`   Slide ${index + 1}:`);
        window.logInfo(`     - active: ${isActive}`);
        window.logInfo(`     - 内联样式: ${hasInlineStyles || '无'}`);
        window.logInfo(`     - slide-content内联样式: ${contentInlineStyles || '无'}`);

        if (isActive) {
            activeSlideCount++;
            window.logInfo(`     - content可见性: ${slideContent ?
                (window.getComputedStyle(slideContent).visibility) : 'N/A'}`);
        }
    });

    dots.forEach((dot, index) => {
        const isActive = dot.classList.contains('active');
        window.logInfo(`   Dot ${index + 1}: active = ${isActive}`);
        if (isActive) activeDotCount++;
    });

    window.logInfo(`   - 活动slide数量: ${activeSlideCount} (应该为1)`);
    window.logInfo(`   - 活动控制点数量: ${activeDotCount} (应该为1)`);

    // 3. 检查CSS计算样式
    window.logInfo('\n📋 3. 检查CSS计算样式');
    if (slides.length > 0) {
        const firstSlide = slides[0];
        const firstSlideStyle = window.getComputedStyle(firstSlide);
        const firstContent = firstSlide.querySelector('.slide-content');
        const firstContentStyle = firstContent ? window.getComputedStyle(firstContent) : null;

        window.logInfo(`   第一个slide的样式:`);
        window.logInfo(`     - opacity: ${firstSlideStyle.opacity}`);
        window.logInfo(`     - visibility: ${firstSlideStyle.visibility}`);
        window.logInfo(`     - z-index: ${firstSlideStyle.zIndex}`);

        if (firstContentStyle) {
            window.logInfo(`   第一个slide-content的样式:`);
            window.logInfo(`     - opacity: ${firstContentStyle.opacity}`);
            window.logInfo(`     - visibility: ${firstContentStyle.visibility}`);
        }
    }

    // 4. 测试轮播功能
    window.logInfo('\n📋 4. 测试轮播功能');
    if (carouselInstance) {
        window.logInfo(`   - 当前slide索引: ${carouselInstance.currentSlide}`);
        window.logInfo(`   - 过渡状态: ${carouselInstance.isTransitioning}`);
        window.logInfo(`   - slide数组长度: ${carouselInstance.slides ? carouselInstance.slides.length : 'N/A'}`);
        window.logInfo(`   - dots数组长度: ${carouselInstance.dots ? carouselInstance.dots.length : 'N/A'}`);

        // 测试showSlide方法
        if (carouselInstance.slides && carouselInstance.slides.length > 1) {
            window.logInfo('\n🔄 测试切换到第2个slide...');
            try {
                carouselInstance.showSlide(1);
                setTimeout(() => {
                    const newActiveSlide = document.querySelector('.carousel-slide.active');
                    const newActiveDot = document.querySelector('.carousel-dot.active');
                    const slideIndex = Array.from(carouselInstance.slides).indexOf(newActiveSlide);
                    const dotIndex = Array.from(carouselInstance.dots).indexOf(newActiveDot);

                    window.logInfo(`   - 切换后活动slide索引: ${slideIndex + 1}`);
                    window.logInfo(`   - 切换后活动控制点索引: ${dotIndex + 1}`);
                    window.logInfo(`   - 当前slide索引: ${carouselInstance.currentSlide}`);

                    if (slideIndex === 1 && dotIndex === 1 && carouselInstance.currentSlide === 1) {
                        window.logInfo('✅ 轮播切换功能正常！');
                    } else {
                        window.logError('❌ 轮播切换功能异常！');
                    }

                    // 切换回第一个slide
                    setTimeout(() => {
                        carouselInstance.showSlide(0);
                        window.logInfo('🔄 已切换回第1个slide');
                    }, 1000);
                }, 500);
            } catch (error) {
                window.logError('❌ 轮播切换测试失败:', error);
            }
        }
    } else {
        window.logError('❌ 轮播实例不存在，无法测试功能');
    }

    // 5. 检查HTML结构完整性
    window.logInfo('\n📋 5. 检查HTML结构完整性');
    slides.forEach((slide, index) => {
        const slideBackground = slide.querySelector('.slide-background');
        const slideContent = slide.querySelector('.slide-content');
        const slideTitle = slide.querySelector('.slide-title');
        const slideSubtitle = slide.querySelector('.slide-subtitle');

        window.logInfo(`   Slide ${index + 1} 结构:`);
        window.logInfo(`     - slide-background: ${slideBackground ? '✅' : '❌'}`);
        window.logInfo(`     - slide-content: ${slideContent ? '✅' : '❌'}`);
        window.logInfo(`     - slide-title: ${slideTitle ? '✅' : '❌'}`);
        window.logInfo(`     - slide-subtitle: ${slideSubtitle ? '✅' : '❌'}`);
    });

    // 总结
    const allGood = activeSlideCount === 1 &&
                     activeDotCount === 1 &&
                     slides.length === dots.length &&
                     carouselInstance !== null;

    window.logInfo('\n📋 调试总结:');
    window.logInfo(`   - HTML结构: ${slides.length > 0 ? '✅' : '❌'}`);
    window.logInfo(`   - CSS样式: ${allGood ? '✅' : '❌'}`);
    window.logInfo(`   - JavaScript: ${carouselInstance ? '✅' : '❌'}`);
    window.logInfo(`   - 整体状态: ${allGood ? '✅ 修复成功！' : '❌ 仍有问题'}`);

    return allGood;
}

// 页面加载完成后自动运行调试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(debugCarousel, 2000); // 延迟2秒运行，确保轮播初始化完成
    });
} else {
    setTimeout(debugCarousel, 2000);
}

// 导出到全局，方便手动调用
window.debugCarousel = debugCarousel;

window.logInfo('🔧 轮播调试脚本已加载，输入 debugCarousel() 开始调试');