/**
 * 轮播图调试脚本
 * 用于全面测试轮播图功能的修复效果
 */

function debugCarousel() {
    console.log('🔍 开始调试轮播图系统...');

    // 1. 检查基础结构
    console.log('\n📋 1. 检查基础结构');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const carouselInstance = window.carouselInstance;

    console.log(`   - 找到 ${slides.length} 个轮播slide`);
    console.log(`   - 找到 ${dots.length} 个控制点`);
    console.log(`   - 轮播实例: ${carouselInstance ? '✅ 存在' : '❌ 不存在'}`);

    if (slides.length === 0) {
        console.error('❌ 未找到任何轮播slide！');
        return false;
    }

    if (dots.length === 0) {
        console.error('❌ 未找到任何控制点！');
        return false;
    }

    // 2. 检查slide状态
    console.log('\n📋 2. 检查slide状态');
    let activeSlideCount = 0;
    let activeDotCount = 0;

    slides.forEach((slide, index) => {
        const isActive = slide.classList.contains('active');
        const hasInlineStyles = slide.getAttribute('style');
        const slideContent = slide.querySelector('.slide-content');
        const contentInlineStyles = slideContent ? slideContent.getAttribute('style') : null;

        console.log(`   Slide ${index + 1}:`);
        console.log(`     - active: ${isActive}`);
        console.log(`     - 内联样式: ${hasInlineStyles || '无'}`);
        console.log(`     - slide-content内联样式: ${contentInlineStyles || '无'}`);

        if (isActive) {
            activeSlideCount++;
            console.log(`     - content可见性: ${slideContent ?
                (window.getComputedStyle(slideContent).visibility) : 'N/A'}`);
        }
    });

    dots.forEach((dot, index) => {
        const isActive = dot.classList.contains('active');
        console.log(`   Dot ${index + 1}: active = ${isActive}`);
        if (isActive) activeDotCount++;
    });

    console.log(`   - 活动slide数量: ${activeSlideCount} (应该为1)`);
    console.log(`   - 活动控制点数量: ${activeDotCount} (应该为1)`);

    // 3. 检查CSS计算样式
    console.log('\n📋 3. 检查CSS计算样式');
    if (slides.length > 0) {
        const firstSlide = slides[0];
        const firstSlideStyle = window.getComputedStyle(firstSlide);
        const firstContent = firstSlide.querySelector('.slide-content');
        const firstContentStyle = firstContent ? window.getComputedStyle(firstContent) : null;

        console.log(`   第一个slide的样式:`);
        console.log(`     - opacity: ${firstSlideStyle.opacity}`);
        console.log(`     - visibility: ${firstSlideStyle.visibility}`);
        console.log(`     - z-index: ${firstSlideStyle.zIndex}`);

        if (firstContentStyle) {
            console.log(`   第一个slide-content的样式:`);
            console.log(`     - opacity: ${firstContentStyle.opacity}`);
            console.log(`     - visibility: ${firstContentStyle.visibility}`);
        }
    }

    // 4. 测试轮播功能
    console.log('\n📋 4. 测试轮播功能');
    if (carouselInstance) {
        console.log(`   - 当前slide索引: ${carouselInstance.currentSlide}`);
        console.log(`   - 过渡状态: ${carouselInstance.isTransitioning}`);
        console.log(`   - slide数组长度: ${carouselInstance.slides ? carouselInstance.slides.length : 'N/A'}`);
        console.log(`   - dots数组长度: ${carouselInstance.dots ? carouselInstance.dots.length : 'N/A'}`);

        // 测试showSlide方法
        if (carouselInstance.slides && carouselInstance.slides.length > 1) {
            console.log('\n🔄 测试切换到第2个slide...');
            try {
                carouselInstance.showSlide(1);
                setTimeout(() => {
                    const newActiveSlide = document.querySelector('.carousel-slide.active');
                    const newActiveDot = document.querySelector('.carousel-dot.active');
                    const slideIndex = Array.from(carouselInstance.slides).indexOf(newActiveSlide);
                    const dotIndex = Array.from(carouselInstance.dots).indexOf(newActiveDot);

                    console.log(`   - 切换后活动slide索引: ${slideIndex + 1}`);
                    console.log(`   - 切换后活动控制点索引: ${dotIndex + 1}`);
                    console.log(`   - 当前slide索引: ${carouselInstance.currentSlide}`);

                    if (slideIndex === 1 && dotIndex === 1 && carouselInstance.currentSlide === 1) {
                        console.log('✅ 轮播切换功能正常！');
                    } else {
                        console.error('❌ 轮播切换功能异常！');
                    }

                    // 切换回第一个slide
                    setTimeout(() => {
                        carouselInstance.showSlide(0);
                        console.log('🔄 已切换回第1个slide');
                    }, 1000);
                }, 500);
            } catch (error) {
                console.error('❌ 轮播切换测试失败:', error);
            }
        }
    } else {
        console.error('❌ 轮播实例不存在，无法测试功能');
    }

    // 5. 检查HTML结构完整性
    console.log('\n📋 5. 检查HTML结构完整性');
    slides.forEach((slide, index) => {
        const slideBackground = slide.querySelector('.slide-background');
        const slideContent = slide.querySelector('.slide-content');
        const slideTitle = slide.querySelector('.slide-title');
        const slideSubtitle = slide.querySelector('.slide-subtitle');

        console.log(`   Slide ${index + 1} 结构:`);
        console.log(`     - slide-background: ${slideBackground ? '✅' : '❌'}`);
        console.log(`     - slide-content: ${slideContent ? '✅' : '❌'}`);
        console.log(`     - slide-title: ${slideTitle ? '✅' : '❌'}`);
        console.log(`     - slide-subtitle: ${slideSubtitle ? '✅' : '❌'}`);
    });

    // 总结
    const allGood = activeSlideCount === 1 &&
                     activeDotCount === 1 &&
                     slides.length === dots.length &&
                     carouselInstance !== null;

    console.log('\n📋 调试总结:');
    console.log(`   - HTML结构: ${slides.length > 0 ? '✅' : '❌'}`);
    console.log(`   - CSS样式: ${allGood ? '✅' : '❌'}`);
    console.log(`   - JavaScript: ${carouselInstance ? '✅' : '❌'}`);
    console.log(`   - 整体状态: ${allGood ? '✅ 修复成功！' : '❌ 仍有问题'}`);

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

console.log('🔧 轮播调试脚本已加载，输入 debugCarousel() 开始调试');