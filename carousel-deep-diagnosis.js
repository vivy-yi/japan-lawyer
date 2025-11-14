/**
 * 轮播图深度诊断脚本
 * 检查轮播图初始化失败的具体原因
 */

function deepCarouselDiagnosis() {
    window.logInfo('🔬 开始深度诊断轮播图系统...');

    // 1. 检查DOM元素存在性
    window.logInfo('\n📋 1. 检查DOM元素存在性');
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselControls = document.querySelector('.carousel-controls');
    const carouselArrows = document.querySelector('.carousel-arrows');

    window.logInfo(`   - carousel容器: ${carouselContainer ? '✅ 存在' : '❌ 不存在'}`);
    window.logInfo(`   - carousel-slides: ${carouselSlides.length} 个`);
    window.logInfo(`   - carousel-controls: ${carouselControls ? '✅ 存在' : '❌ 不存在'}`);
    window.logInfo(`   - carousel-arrows: ${carouselArrows ? '✅ 存在' : '❌ 不存在'}`);

    if (!carouselContainer) {
        window.logError('❌ 致命错误: 找不到.carousel-container元素');
        window.logInfo('   可能原因:');
        window.logInfo('   - HTML结构错误');
        window.logInfo('   - CSS选择器问题');
        window.logInfo('   - DOM还未加载完成');
        return false;
    }

    // 2. 检查CSS样式是否应用
    window.logInfo('\n📋 2. 检查CSS样式状态');
    if (carouselSlides.length > 0) {
        const firstSlide = carouselSlides[0];
        const firstSlideStyle = window.getComputedStyle(firstSlide);

        window.logInfo(`   - 第一个slide的display: ${firstSlideStyle.display}`);
        window.logInfo(`   - 第一个slide的position: ${firstSlideStyle.position}`);
        window.logInfo(`   - 第一个slide的opacity: ${firstSlideStyle.opacity}`);
        window.logInfo(`   - 第一个slide的visibility: ${firstSlideStyle.visibility}`);
        window.logInfo(`   - 第一个slide的z-index: ${firstSlideStyle.zIndex}`);

        // 检查CSS文件是否加载
        const testElement = document.createElement('div');
        testElement.className = 'carousel-slide';
        document.body.appendChild(testElement);
        const testStyle = window.getComputedStyle(testElement);

        window.logInfo(`   - CSS样式应用测试: ${testStyle.position !== 'static' ? '✅ CSS已加载' : '❌ CSS未加载'}`);

        document.body.removeChild(testElement);
    }

    // 3. 检查JavaScript文件和类
    window.logInfo('\n📋 3. 检查JavaScript文件和类');
    window.logInfo(`   - Carousel类存在: ${typeof Carousel !== 'undefined' ? '✅' : '❌'}`);
    window.logInfo(`   - initCarousel函数存在: ${typeof initCarousel === 'function' ? '✅' : '❌'}`);
    window.logInfo(`   - carouselInstance全局变量: ${typeof window.carouselInstance !== 'undefined' ? '✅' : '❌'}`);

    if (typeof Carousel === 'undefined') {
        window.logError('❌ 致命错误: Carousel类未定义');
        window.logInfo('   可能原因:');
        window.logInfo('   - carousel.js文件未加载');
        window.logInfo('   - JavaScript语法错误');
        window.logInfo('   - 脚本执行顺序错误');
        return false;
    }

    // 4. 检查脚本加载状态
    window.logInfo('\n📋 4. 检查脚本加载状态');
    const scripts = document.querySelectorAll('script[src]');
    let carouselScriptLoaded = false;

    scripts.forEach(script => {
        if (script.src.includes('carousel.js')) {
            carouselScriptLoaded = true;
            window.logInfo(`   - carousel.js加载状态: ✅ 已加载 (${script.src})`);
        }
    });

    if (!carouselScriptLoaded) {
        window.logError('❌ 错误: carousel.js脚本未找到');
        return false;
    }

    // 5. 尝试手动创建轮播实例
    window.logInfo('\n📋 5. 尝试手动创建轮播实例');
    try {
        window.logInfo('   - 创建新的Carousel实例...');
        const manualInstance = new Carousel('.carousel-container', {
            enableAutoScroll: false, // 关闭自动滚动，便于调试
            loadDelay: 0 // 去掉加载延迟
        });

        window.logInfo(`   - 手动实例创建: ${manualInstance ? '✅ 成功' : '❌ 失败'}`);

        if (manualInstance) {
            window.logInfo(`   - 实例属性:`);
            window.logInfo(`     * container: ${manualInstance.container ? '✅' : '❌'}`);
            window.logInfo(`     * slides.length: ${manualInstance.slides ? manualInstance.slides.length : 0}`);
            window.logInfo(`     * currentSlide: ${manualInstance.currentSlide}`);
            window.logInfo(`     * isTransitioning: ${manualInstance.isTransitioning}`);

            // 检查slides状态
            if (manualInstance.slides && manualInstance.slides.length > 0) {
                let activeCount = 0;
                manualInstance.slides.forEach((slide, index) => {
                    if (slide.classList.contains('active')) {
                        activeCount++;
                        window.logInfo(`     * slide ${index + 1}: active ✅`);
                    } else {
                        window.logInfo(`     * slide ${index + 1}: inactive ❌`);
                    }
                });

                window.logInfo(`   - 活动slide数量: ${activeCount} (期望: 1)`);

                if (activeCount === 0) {
                    window.logInfo('   - 手动设置第一个slide为active...');
                    manualInstance.showSlide(0);

                    // 重新检查
                    activeCount = 0;
                    manualInstance.slides.forEach(slide => {
                        if (slide.classList.contains('active')) activeCount++;
                    });
                    window.logInfo(`   - 修复后活动slide数量: ${activeCount}`);
                }
            }

            return true;
        }
    } catch (error) {
        window.logError('❌ 手动创建实例失败:', error);
        window.logInfo('   错误详情:', error.message);
        window.logInfo('   错误堆栈:', error.stack);
    }

    return false;
}

// 6. 检查DOM加载时序
function checkDOMTiming() {
    window.logInfo('\n📋 6. 检查DOM加载时序');
    window.logInfo(`   - document.readyState: ${document.readyState}`);
    window.logInfo(`   - DOMContentLoaded是否已触发: ${document.readyState !== 'loading' ? '✅' : '❌'}`);

    // 检查是否有延迟加载的脚本
    const deferredScripts = document.querySelectorAll('script[defer], script[async]');
    window.logInfo(`   - 延迟脚本数量: ${deferredScripts.length}`);
}

// 运行完整诊断
function runCompleteDiagnosis() {
    if (window.APP_DEBUG console.clear();console.clear(); window.APP_DEBUG.logger console.clear();console.clear(); window.APP_DEBUG.logger.config console.clear();console.clear(); window.APP_DEBUG.logger.config.enabled) { console.clear(); }
    window.logInfo('🎯 开始轮播图完整诊断...');
    window.logInfo('=====================================');

    const diagnosisResult = deepCarouselDiagnosis();
    checkDOMTiming();

    window.logInfo('\n📋 诊断总结:');
    window.logInfo('=====================================');

    if (diagnosisResult) {
        window.logInfo('✅ 轮播图系统可以正常工作');
        window.logInfo('💡 建议检查自动初始化逻辑');
    } else {
        window.logInfo('❌ 轮播图系统存在严重问题');
        window.logInfo('🔧 需要修复以下问题:');
        window.logInfo('   1. 确保DOM结构正确');
        window.logInfo('   2. 确保CSS文件加载');
        window.logInfo('   3. 确保JavaScript文件无语法错误');
        window.logInfo('   4. 确保初始化时序正确');
    }

    return diagnosisResult;
}

// 立即运行诊断
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCompleteDiagnosis);
} else {
    runCompleteDiagnosis();
}

// 导出函数
window.deepCarouselDiagnosis = deepCarouselDiagnosis;
window.runCompleteDiagnosis = runCompleteDiagnosis;

window.logInfo('🔬 轮播图深度诊断脚本已加载');
window.logInfo('💡 手动运行诊断: runCompleteDiagnosis()');