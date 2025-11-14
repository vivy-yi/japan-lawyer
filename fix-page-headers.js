/**
 * 批量修复页面头部组件的脚本
 * 将所有HTML页面中的page-header转换为统一的BEM命名结构
 */

const fs = require('fs');
const path = require('path');

// 页面类型映射
const pageTypeMapping = {
    'ailegal': 'legal',
    'aicrm': 'crm',
    'aiglobal': 'ai',
    'aifinance': 'finance',
    'professionals': 'service',
    'knowledge': 'knowledge',
    'community': 'community',
    'education': 'service',
    'tourism': 'service',
    'pet': 'service',
    'labor': 'service',
    'lifestyle': 'service',
    'services': 'service'
};

// 需要处理的页面列表
const pages = [
    'html/ailegal.html',
    'html/aicrm.html',
    'html/aiglobal.html',
    'html/aifinance.html',
    'html/professionals.html',
    'html/knowledge.html',
    'html/community.html',
    'html/education.html',
    'html/tourism.html',
    'html/pet.html',
    'html/labor.html',
    'html/lifestyle.html',
    'html/services.html'
];

/**
 * 修复单个页面的page-header结构
 */
function fixPageHeader(filePath) {
    try {
        window.logInfo(`正在处理: ${filePath}`);

        // 读取文件内容
        let content = fs.readFileSync(filePath, 'utf8');

        // 提取页面类型
        const pageName = path.basename(filePath, '.html');
        const pageType = pageTypeMapping[pageName] || 'default';

        // 记录修改统计
        let changes = {
            pageHeaderReplaced: 0,
            titleClassReplaced: 0,
            subtitleClassReplaced: 0,
            descriptionClassReplaced: 0
        };

        // 1. 替换page-header的class属性
        content = content.replace(
            /class="page-header"/g,
            () => {
                changes.pageHeaderReplaced++;
                return `class="page-header page-header--${pageType}"`;
            }
        );

        // 2. 替换page-title的class属性
        content = content.replace(
            /class="page-title"/g,
            () => {
                changes.titleClassReplaced++;
                return 'class="page-header__title"';
            }
        );

        // 3. 替换page-subtitle的class属性
        content = content.replace(
            /class="page-subtitle"/g,
            () => {
                changes.subtitleClassReplaced++;
                return 'class="page-header__subtitle"';
            }
        );

        // 4. 替换page-description的class属性（如果存在）
        content = content.replace(
            /class="page-description"/g,
            () => {
                changes.descriptionClassReplaced++;
                return 'class="page-header__description"';
            }
        );

        // 5. 清理重复的CSS样式（移除内联的page-header样式）
        content = cleanupDuplicateStyles(content, changes);

        // 写回文件
        fs.writeFileSync(filePath, content, 'utf8');

        window.logInfo(`✅ ${pageName}: 修复完成`);
        window.logInfo(`   - page-header: ${changes.pageHeaderReplaced} 处`);
        window.logInfo(`   - page-title: ${changes.titleClassReplaced} 处`);
        window.logInfo(`   - page-subtitle: ${changes.subtitleClassReplaced} 处`);
        window.logInfo(`   - page-description: ${changes.descriptionClassReplaced} 处`);

        return changes;

    } catch (error) {
        window.logError(`❌ 处理 ${filePath} 时出错:`, error.message);
        return null;
    }
}

/**
 * 清理重复的CSS样式
 */
function cleanupDuplicateStyles(content, changes) {
    // 移除常见的重复CSS样式定义
    const patterns = [
        // 移除.page-header的内联样式
        /\.page-header\s*\{[^}]*\}/g,
        // 移除.page-title的内联样式
        /\.page-title\s*\{[^}]*\}/g,
        // 移除.page-subtitle的内联样式
        /\.page-subtitle\s*\{[^}]*\}/g,
        // 移除.page-description的内联样式
        /\.page-description\s*\{[^}]*\}/g
    ];

    patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
            matches.forEach(match => {
                // 只移除在<style>标签内的样式
                const styleTagMatch = match.match(/<style[^>]*>([\s\S]*?)<\/style>/);
                if (styleTagMatch) {
                    content = content.replace(match, '');
                }
            });
        }
    });

    return content;
}

/**
 * 批量处理所有页面
 */
function fixAllPages() {
    window.logInfo('🚀 开始批量修复页面头部组件...\n');

    let totalChanges = {
        total: 0,
        pages: []
    };

    for (const page of pages) {
        const filePath = path.resolve(__dirname, page);

        if (fs.existsSync(filePath)) {
            const changes = fixPageHeader(filePath);
            if (changes) {
                totalChanges.total++;
                totalChanges.pages.push({
                    page: page,
                    changes: changes
                });
            }
        } else {
            window.logInfo(`⚠️  跳过不存在的文件: ${page}`);
        }
    }

    // 输出统计报告
    window.logInfo('\n📊 修复统计报告:');
    window.logInfo(`总共处理页面: ${totalChanges.total} 个`);

    totalChanges.pages.forEach(({ page, changes }) => {
        const totalChangesForPage = changes.pageHeaderReplaced +
                                          changes.titleClassReplaced +
                                          changes.subtitleClassReplaced +
                                          changes.descriptionClassReplaced;
        window.logInfo(`${page}: ${totalChangesForPage} 处变更`);
    });

    window.logInfo('\n✅ 批量修复完成！');
    window.logInfo('\n📋 接下来需要手动处理的任务:');
    window.logInfo('1. 测试每个页面的显示效果');
    window.logInfo('2. 检查CSS样式是否正确应用');
    window.logInfo('3. 验证JavaScript功能是否正常');
    window.logInfo('4. 测试响应式布局');
}

// 执行批量修复
if (require.main === module) {
    fixAllPages();
}

module.exports = {
    fixPageHeader,
    fixAllPages,
    pageTypeMapping
};