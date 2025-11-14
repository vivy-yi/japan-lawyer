/**
 * 智能网格布局管理器
 * 自动根据子元素数量调整 capabilities-grid 布局
 * 提供对不支持 :has() 选择器的浏览器的兼容性支持
 */

class SmartGridLayout {
    constructor() {
        this.gridSelectors = ['.capabilities-grid'];
        this.init();
    }

    init() {
        // 页面加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGrids());
        } else {
            this.setupGrids();
        }

        // 监听窗口大小变化
        window.addEventListener('resize', this.debounce(() => this.setupGrids(), 300));

        // 监听动态内容变化
        this.observeContentChanges();
    }

    setupGrids() {
        this.gridSelectors.forEach(selector => {
            const grids = document.querySelectorAll(selector);
            grids.forEach(grid => this.configureGrid(grid));
        });
    }

    configureGrid(grid) {
        const children = grid.children.length;
        const viewportWidth = window.innerWidth;

        // 重置所有自定义样式
        this.resetGridStyles(grid);

        // 根据子元素数量配置布局
        this.applyLayoutByChildCount(grid, children, viewportWidth);

        // 添加数据属性用于CSS选择器
        grid.setAttribute('data-child-count', children);
        grid.setAttribute('data-viewport', this.getViewportCategory(viewportWidth));
    }

    resetGridStyles(grid) {
        // 保留基础样式，只重置动态样式
        const originalStyle = grid.getAttribute('data-original-style') || '';
        grid.style.cssText = originalStyle;

        // 保存原始样式
        if (!grid.getAttribute('data-original-style')) {
            grid.setAttribute('data-original-style', originalStyle);
        }
    }

    applyLayoutByChildCount(grid, childCount, viewportWidth) {
        const isMobile = viewportWidth < 768;
        const isLarge = viewportWidth >= 1400;

        // 根据子元素数量和视口宽度应用布局
        switch (childCount) {
            case 1:
                this.applySingleItemLayout(grid);
                break;
            case 2:
                this.applyTwoItemLayout(grid, isMobile);
                break;
            case 3:
                this.applyThreeItemLayout(grid, isMobile);
                break;
            case 4:
                this.applyFourItemLayout(grid, isMobile);
                break;
            case 5:
            case 6:
                this.applyFiveOrSixItemLayout(grid, isMobile, isLarge);
                break;
            case 7:
            case 8:
            case 9:
                this.applySevenToNineItemLayout(grid, isMobile, isLarge);
                break;
            default:
                if (childCount >= 10) {
                    this.applyManyItemsLayout(grid, isMobile);
                } else {
                    this.applyDefaultLayout(grid, isMobile);
                }
        }
    }

    applySingleItemLayout(grid) {
        grid.style.gridTemplateColumns = '1fr';
        grid.style.maxWidth = '400px';
        grid.style.marginLeft = 'auto';
        grid.style.marginRight = 'auto';
    }

    applyTwoItemLayout(grid, isMobile) {
        if (isMobile) {
            grid.style.gridTemplateColumns = '1fr';
            grid.style.maxWidth = '100%';
            grid.style.marginLeft = '0';
            grid.style.marginRight = '0';
        } else {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.maxWidth = '800px';
            grid.style.marginLeft = 'auto';
            grid.style.marginRight = 'auto';
        }
    }

    applyThreeItemLayout(grid, isMobile) {
        if (isMobile) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.maxWidth = '100%';
            grid.style.marginLeft = '0';
            grid.style.marginRight = '0';
        } else {
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            grid.style.maxWidth = '1200px';
            grid.style.marginLeft = 'auto';
            grid.style.marginRight = 'auto';
        }
    }

    applyFourItemLayout(grid, isMobile) {
        if (isMobile) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.maxWidth = '100%';
            grid.style.marginLeft = '0';
            grid.style.marginRight = '0';
        } else {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.maxWidth = '800px';
            grid.style.marginLeft = 'auto';
            grid.style.marginRight = 'auto';
        }
    }

    applyFiveOrSixItemLayout(grid, isMobile, isLarge) {
        if (isMobile) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.maxWidth = '100%';
            grid.style.marginLeft = '0';
            grid.style.marginRight = '0';
        } else {
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            grid.style.maxWidth = isLarge ? '1400px' : '1200px';
            grid.style.marginLeft = 'auto';
            grid.style.marginRight = 'auto';
        }
    }

    applySevenToNineItemLayout(grid, isMobile, isLarge) {
        if (isMobile) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.maxWidth = '100%';
            grid.style.marginLeft = '0';
            grid.style.marginRight = '0';
        } else if (isLarge) {
            grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            grid.style.maxWidth = '1600px';
            grid.style.marginLeft = 'auto';
            grid.style.marginRight = 'auto';
        } else {
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            grid.style.maxWidth = '1200px';
            grid.style.marginLeft = 'auto';
            grid.style.marginRight = 'auto';
        }
    }

    applyManyItemsLayout(grid, isMobile) {
        if (isMobile) {
            grid.style.gridTemplateColumns = '1fr';
            grid.style.maxWidth = '100%';
            grid.style.marginLeft = '0';
            grid.style.marginRight = '0';
        } else {
            grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
            grid.style.maxWidth = '100%';
            grid.style.marginLeft = '0';
            grid.style.marginRight = '0';
        }
    }

    applyDefaultLayout(grid, isMobile) {
        if (isMobile) {
            grid.style.gridTemplateColumns = '1fr';
        } else {
            grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        }
    }

    getViewportCategory(width) {
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        if (width < 1400) return 'desktop';
        return 'large';
    }

    observeContentChanges() {
        // 监听DOM变化，自动重新配置网格
        const observer = new MutationObserver(this.debounce((mutations) => {
            let needsUpdate = false;

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // 检查是否有能力网格的子元素变化
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('capabilities-grid')) {
                                needsUpdate = true;
                            } else if (node.parentElement && node.parentElement.classList && node.parentElement.classList.contains('capabilities-grid')) {
                                needsUpdate = true;
                            }
                        }
                    });

                    mutation.removedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('capabilities-grid')) {
                                needsUpdate = true;
                            } else if (node.parentElement && node.parentElement.classList && node.parentElement.classList.contains('capabilities-grid')) {
                                needsUpdate = true;
                            }
                        }
                    });
                }
            });

            if (needsUpdate) {
                this.setupGrids();
            }
        }, 300));

        // 监听整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 公共API方法
    addGrid(selector) {
        this.gridSelectors.push(selector);
        this.setupGrids();
    }

    refreshGrids() {
        this.setupGrids();
    }

    getGridInfo(selector) {
        const grid = document.querySelector(selector);
        if (!grid) return null;

        return {
            childCount: grid.children.length,
            viewport: grid.getAttribute('data-viewport'),
            currentLayout: grid.style.gridTemplateColumns,
            maxWidth: grid.style.maxWidth
        };
    }
}

// 初始化智能网格布局
window.smartGridLayout = new SmartGridLayout();

// 导出类以便外部使用
window.SmartGridLayout = SmartGridLayout;

// 开发者工具
window.testSmartGrid = function() {
    const grids = document.querySelectorAll('.capabilities-grid');
    console.log('🎯 智能网格布局测试结果:');
    console.log('=====================================');

    grids.forEach((grid, index) => {
        const info = window.smartGridLayout.getGridInfo('.capabilities-grid');
        if (info) {
            console.log(`网格 ${index + 1}:`);
            console.log(`  - 子元素数量: ${info.childCount}`);
            console.log(`  - 视口类型: ${info.viewport}`);
            console.log(`  - 当前布局: ${info.currentLayout}`);
            console.log(`  - 最大宽度: ${info.maxWidth}`);
        }
    });

    console.log('💡 调整浏览器窗口大小查看动态变化');
};

console.log('🎯 智能网格布局管理器已加载');
console.log('💡 测试命令: testSmartGrid()');