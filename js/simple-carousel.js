/**
 * 简单但功能完整的轮播图
 * 功能：自动滚动、手动控制、悬停暂停、配置选项、多语言支持
 */

let currentSlide = 0;
let autoScrollInterval;
let isAutoScrolling = true;
let isTransitioning = false;

// 默认配置
const config = {
    autoScrollInterval: 5000, // 5秒自动切换
    enableAutoScroll: true,
    enableHoverPause: true,
    animationDuration: 300
};

function initSimpleCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');

    if (slides.length === 0) {
        window.logInfo('❌ 没有找到轮播slides');
        return;
    }

    window.logInfo(`✅ 找到 ${slides.length} 个轮播slides`);

    // 设置第一个slide为活动状态
    slides.forEach((slide, index) => {
        if (index === 0) {
            slide.classList.add('active');
            slide.style.display = 'flex';
            slide.style.opacity = '1';
            slide.style.visibility = 'visible';
            slide.style.zIndex = '2';
        } else {
            slide.classList.remove('active');
            slide.style.display = 'none';
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
            slide.style.zIndex = '1';
        }
    });

    // 更新控制点
    dots.forEach((dot, index) => {
        if (index === 0) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // 设置点击事件
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoScroll();
        });
    });

    // 设置箭头点击
    const prevArrow = document.querySelector('.carousel-arrow[data-direction="-1"]');
    const nextArrow = document.querySelector('.carousel-arrow[data-direction="1"]');

    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            changeSlide(-1);
            resetAutoScroll();
        });
    }

    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            changeSlide(1);
            resetAutoScroll();
        });
    }

    // 设置悬停暂停
    if (config.enableHoverPause) {
        setupHoverPause();
    }

    // 开始自动轮播
    if (config.enableAutoScroll) {
        startAutoScroll();
    }

    window.logInfo('✅ 简单轮播图初始化完成');
}

function setupHoverPause() {
    const container = document.querySelector('.carousel-container');
    if (!container) return;

    container.addEventListener('mouseenter', () => {
        isAutoScrolling = false;
        window.logInfo('🎠 鼠标悬停，暂停自动轮播');
    });

    container.addEventListener('mouseleave', () => {
        isAutoScrolling = true;
        window.logInfo('🎠 鼠标离开，恢复自动轮播');
    });
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');

    if (slides.length === 0) return;

    // 防止重复操作
    if (isTransitioning || index === currentSlide) return;

    // 设置过渡状态
    isTransitioning = true;

    // 边界检查
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    const currentSlideElement = slides[currentSlide];
    const newSlideElement = slides[index];

    // 隐藏当前slide
    currentSlideElement.classList.remove('active');
    currentSlideElement.style.display = 'none';
    currentSlideElement.style.opacity = '0';
    currentSlideElement.style.visibility = 'hidden';
    currentSlideElement.style.zIndex = '1';

    // 显示新slide
    newSlideElement.classList.add('active');
    newSlideElement.style.display = 'flex';
    newSlideElement.style.opacity = '1';
    newSlideElement.style.visibility = 'visible';
    newSlideElement.style.zIndex = '2';

    // 更新控制点
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[index]) {
        dots[index].classList.add('active');
    }

    currentSlide = index;
    window.logInfo(`🎠 显示第 ${index + 1} 个slide`);

    // 解除过渡状态
    setTimeout(() => {
        isTransitioning = false;
    }, config.animationDuration);
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
}

function nextSlide() {
    changeSlide(1);
}

function prevSlide() {
    changeSlide(-1);
}

function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
        if (isAutoScrolling && !isTransitioning) {
            nextSlide();
        }
    }, config.autoScrollInterval);
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSimpleCarousel);

// 备用初始化
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initSimpleCarousel, 100);
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoScroll();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoScroll();
    }
});

// 导出函数和配置
window.initSimpleCarousel = initSimpleCarousel;
window.showSlide = showSlide;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.resetAutoScroll = resetAutoScroll;
window.startAutoScroll = startAutoScroll;
window.stopAutoScroll = stopAutoScroll;

// 状态管理
window.getCarouselState = () => ({
    currentSlide,
    isAutoScrolling,
    isTransitioning,
    totalSlides: document.querySelectorAll('.carousel-slide').length,
    config: { ...config }
});

// 配置更新
window.updateCarouselConfig = (newConfig) => {
    Object.assign(config, newConfig);
    if (newConfig.autoScrollInterval) {
        resetAutoScroll();
    }
};

window.logInfo('🎠 简单轮播图脚本已加载');
window.logInfo('🎠 功能: 自动滚动、悬停暂停、平滑过渡、防抖处理');