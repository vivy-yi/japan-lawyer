/**
 * 轮播图深度诊断脚本
 * 检查轮播图初始化失败的具体原因
 */

function deepCarouselDiagnosis() {
    console.log('🔬 开始深度诊断轮播图系统...');

    // 1. 检查DOM元素存在性
    console.log('\n📋 1. 检查DOM元素存在性');
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselControls = document.querySelector('.carousel-controls');
    const carouselArrows = document.querySelector('.carousel-arrows');

    console.log(`   - carousel容器: ${carouselContainer ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`   - carousel-slides: ${carouselSlides.length} 个`);
    console.log(`   - carousel-controls: ${carouselControls ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`   - carousel-arrows: ${carouselArrows ? '✅ 存在' : '❌ 不存在'}`);

    if (!carouselContainer) {
        console.error('❌ 致命错误: 找不到.carousel-container元素');
        console.log('   可能原因:');
        console.log('   - HTML结构错误');
        console.log('   - CSS选择器问题');
        console.log('   - DOM还未加载完成');
        return false;
    }

    // 2. 检查CSS样式是否应用
    console.log('\n📋 2. 检查CSS样式状态');
    if (carouselSlides.length > 0) {
        const firstSlide = carouselSlides[0];
        const firstSlideStyle = window.getComputedStyle(firstSlide);

        console.log(`   - 第一个slide的display: ${firstSlideStyle.display}`);
        console.log(`   - 第一个slide的position: ${firstSlideStyle.position}`);
        console.log(`   - 第一个slide的opacity: ${firstSlideStyle.opacity}`);
        console.log(`   - 第一个slide的visibility: ${firstSlideStyle.visibility}`);
        console.log(`   - 第一个slide的z-index: ${firstSlideStyle.zIndex}`);

        // 检查CSS文件是否加载
        const testElement = document.createElement('div');
        testElement.className = 'carousel-slide';
        document.body.appendChild(testElement);
        const testStyle = window.getComputedStyle(testElement);

        console.log(`   - CSS样式应用测试: ${testStyle.position !== 'static' ? '✅ CSS已加载' : '❌ CSS未加载'}`);

        document.body.removeChild(testElement);
    }

    // 3. 检查JavaScript文件和类
    console.log('\n📋 3. 检查JavaScript文件和类');
    console.log(`   - Carousel类存在: ${typeof Carousel !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   - initCarousel函数存在: ${typeof initCarousel === 'function' ? '✅' : '❌'}`);
    console.log(`   - carouselInstance全局变量: ${typeof window.carouselInstance !== 'undefined' ? '✅' : '❌'}`);

    if (typeof Carousel === 'undefined') {
        console.error('❌ 致命错误: Carousel类未定义');
        console.log('   可能原因:');
        console.log('   - carousel.js文件未加载');
        console.log('   - JavaScript语法错误');
        console.log('   - 脚本执行顺序错误');
        return false;
    }

    // 4. 检查脚本加载状态
    console.log('\n📋 4. 检查脚本加载状态');
    const scripts = document.querySelectorAll('script[src]');
    let carouselScriptLoaded = false;

    scripts.forEach(script => {
        if (script.src.includes('carousel.js')) {
            carouselScriptLoaded = true;
            console.log(`   - carousel.js加载状态: ✅ 已加载 (${script.src})`);
        }
    });

    if (!carouselScriptLoaded) {
        console.error('❌ 错误: carousel.js脚本未找到');
        return false;
    }

    // 5. 尝试手动创建轮播实例
    console.log('\n📋 5. 尝试手动创建轮播实例');
    try {
        console.log('   - 创建新的Carousel实例...');
        const manualInstance = new Carousel('.carousel-container', {
            enableAutoScroll: false, // 关闭自动滚动，便于调试
            loadDelay: 0 // 去掉加载延迟
        });

        console.log(`   - 手动实例创建: ${manualInstance ? '✅ 成功' : '❌ 失败'}`);

        if (manualInstance) {
            console.log(`   - 实例属性:`);
            console.log(`     * container: ${manualInstance.container ? '✅' : '❌'}`);
            console.log(`     * slides.length: ${manualInstance.slides ? manualInstance.slides.length : 0}`);
            console.log(`     * currentSlide: ${manualInstance.currentSlide}`);
            console.log(`     * isTransitioning: ${manualInstance.isTransitioning}`);

            // 检查slides状态
            if (manualInstance.slides && manualInstance.slides.length > 0) {
                let activeCount = 0;
                manualInstance.slides.forEach((slide, index) => {
                    if (slide.classList.contains('active')) {
                        activeCount++;
                        console.log(`     * slide ${index + 1}: active ✅`);
                    } else {
                        console.log(`     * slide ${index + 1}: inactive ❌`);
                    }
                });

                console.log(`   - 活动slide数量: ${activeCount} (期望: 1)`);

                if (activeCount === 0) {
                    console.log('   - 手动设置第一个slide为active...');
                    manualInstance.showSlide(0);

                    // 重新检查
                    activeCount = 0;
                    manualInstance.slides.forEach(slide => {
                        if (slide.classList.contains('active')) activeCount++;
                    });
                    console.log(`   - 修复后活动slide数量: ${activeCount}`);
                }
            }

            return true;
        }
    } catch (error) {
        console.error('❌ 手动创建实例失败:', error);
        console.log('   错误详情:', error.message);
        console.log('   错误堆栈:', error.stack);
    }

    return false;
}

// 6. 检查DOM加载时序
function checkDOMTiming() {
    console.log('\n📋 6. 检查DOM加载时序');
    console.log(`   - document.readyState: ${document.readyState}`);
    console.log(`   - DOMContentLoaded是否已触发: ${document.readyState !== 'loading' ? '✅' : '❌'}`);

    // 检查是否有延迟加载的脚本
    const deferredScripts = document.querySelectorAll('script[defer], script[async]');
    console.log(`   - 延迟脚本数量: ${deferredScripts.length}`);
}

// 运行完整诊断
function runCompleteDiagnosis() {
    console.clear();
    console.log('🎯 开始轮播图完整诊断...');
    console.log('=====================================');

    const diagnosisResult = deepCarouselDiagnosis();
    checkDOMTiming();

    console.log('\n📋 诊断总结:');
    console.log('=====================================');

    if (diagnosisResult) {
        console.log('✅ 轮播图系统可以正常工作');
        console.log('💡 建议检查自动初始化逻辑');
    } else {
        console.log('❌ 轮播图系统存在严重问题');
        console.log('🔧 需要修复以下问题:');
        console.log('   1. 确保DOM结构正确');
        console.log('   2. 确保CSS文件加载');
        console.log('   3. 确保JavaScript文件无语法错误');
        console.log('   4. 确保初始化时序正确');
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

console.log('🔬 轮播图深度诊断脚本已加载');
console.log('💡 手动运行诊断: runCompleteDiagnosis()');