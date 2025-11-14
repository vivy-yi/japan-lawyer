# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Frontend Agent 执行原则

### 🚫 **绝对禁止的操作**
1. **删除或覆盖用户内容** - 任何时候都不能删除用户的现有内容
2. **重写整个文件** - 只能在明确要求时进行重构
3. **引入外部依赖** - 不得添加未授权的第三方库或框架
4. **破坏现有功能** - 修改前必须确保现有功能正常工作
5. **擅自更改架构** - 不得改变SPA结构或导航系统

### ✅ **必须遵守的流程**
1. **先读取现有内容** - 开始任何任务前，必须完整读取相关文件
2. **备份重要文件** - 修改任何核心文件前必须创建备份
3. **增量修改** - 只修改必要的部分，保留原有代码结构
4. **功能验证** - 修改后立即验证功能是否正常
5. **用户确认** - 重大修改需要用户明确确认

### 📋 **任务执行检查清单**
- [ ] 是否已读取所有相关文件内容？
- [ ] 是否理解现有代码结构和逻辑？
- [ ] 是否创建了必要备份？
- [ ] 修改是否只针对需要更改的部分？
- [ ] 是否保留了所有原有功能？
- [ ] 是否测试了修改后的功能？

## Development Commands

### Local Development Environment
```bash
# Primary development server (recommended)
./start-server.sh

# Alternative development server with enhanced security
./start-simple-server.sh

# Manual server options
python3 -m http.server 8000
python server.py  # Custom Python server with security headers
```

### Development Tools
- **Debug Console**: Built-in debugging commands for navigation and system status
- **Performance Monitor**: Real-time performance tracking and optimization
- **Security Scanner**: Continuous XSS and vulnerability monitoring
- **SEO Manager**: Dynamic meta tag management and search optimization

### Browser Console Debugging Commands
```javascript
// Test navigation functionality
window.testStaticNavigation();
window.testNavigationClick('professionals');

// Check system status
window.checkSPAStatus();
window.getNavigationSystemStatus();

// Force rebind event listeners
window.forceRebindNavigation();
```

## 项目概述

这是一个日本商务服务平台的单页面应用(SPA)，主要为在日华人及中日商业用户提供法律咨询、CRM系统、生活服务等综合性服务。

### 核心技术栈
- **前端**: 纯HTML5 + CSS3 + 原生JavaScript (无框架依赖)
- **架构**: SPA单页面应用，PJAX导航系统
- **样式**: 内联CSS + CSS变量系统
- **响应式**: 移动优先设计原则
- **无障碍**: WCAG 2.1 AA标准

## Architecture Overview

This is a **Japanese Business Hub** - a sophisticated single-page application (SPA) designed for Chinese and Japanese business users in Japan. The platform provides AI legal services, CRM systems, professional talent matching, and comprehensive lifestyle services.

### Core Technical Stack
- **Frontend**: Pure HTML5 + CSS3 + Native JavaScript (no frameworks)
- **Architecture**: SPA with PJAX navigation system
- **Security**: Advanced XSS protection, CSP headers, URL validation
- **Internationalization**: Full Chinese/English/Japanese translation system
- **Performance**: Built-in monitoring and optimization systems

### 完整文件结构
```
temp-repo/
├── index.html                      # 主页面 - SPA入口 (从staticSPA恢复)
├── css/                            # 样式系统 (模块化CSS架构)
│   ├── main.css                   # 主CSS文件 - @import所有模块
│   ├── consolidated.css           # 整合CSS文件 (消除@import依赖)
│   ├── responsive.css             # 响应式CSS文件
│   ├── base/                      # 基础样式层
│   │   ├── variables.css          # CSS变量定义
│   │   ├── reset.css              # CSS重置
│   │   └── typography.css        # 字体系统
│   ├── layouts/                   # 布局层
│   │   └── header.css             # 头部布局
│   └── components/                # 组件层
│       ├── navbar.css             # 导航栏样式
│       ├── navbar-new.css         # 新导航栏样式
│       ├── buttons.css            # 按钮组件
│       ├── carousel.css           # 轮播组件
│       ├── utilities.css          # 工具类
│       ├── theme-switcher.css     # 主题切换
│       ├── search.css             # 搜索组件
│       └── preferences.css        # 偏好设置
├── js/                             # JavaScript系统
│   ├── nav.js                     # 核心导航系统 (739行, 23KB)
│   ├── main.js                    # 主入口脚本 (206行)
│   ├── carousel.js                # 轮播功能 (546行)
│   ├── core/                      # 核心功能模块
│   │   ├── component-library.js   # 组件库 (924行)
│   │   ├── spa-router-secure.js   # 安全SPA路由 (625行)
│   │   ├── security-monitor.js    # 安全监控 (639行)
│   │   ├── user-preferences.js    # 用户偏好 (737行)
│   │   ├── search-manager.js      # 搜索管理 (685行)
│   │   ├── advanced-features.js   # 高级功能 (682行)
│   │   ├── seo-manager.js         # SEO管理 (788行)
│   │   ├── keyboard-shortcuts.js  # 键盘快捷键 (669行)
│   │   ├── error-handler.js       # 错误处理 (662行)
│   │   ├── performance-optimizer.js # 性能优化 (641行)
│   │   ├── header-manager.js      # 头部管理 (459行)
│   │   ├── performance-monitor.js # 性能监控 (437行)
│   │   ├── theme-manager-safe.js  # 安全主题管理 (305行)
│   │   ├── dev-tools.js           # 开发工具 (258行)
│   │   ├── router.js              # 基础路由 (221行)
│   │   └── i18n.js                # 国际化 (114行)
│   └── components/                # UI组件
│       ├── preferences-ui.js      # 偏好UI组件
│       └── ui-components.js       # 通用UI组件
├── html/                           # 子页面文件 (12个页面)
│   ├── ai-crm.html                # AI CRM页面 (18KB)
│   ├── ai-legal.html              # AI法律页面 (18KB)
│   ├── knowledge.html             # 知识库页面 (18KB)
│   ├── professionals.html         # 专业人才页面 (74KB)
│   ├── services.html              # 服务页面 (16KB)
│   ├── community.html             # 社区页面 (29KB)
│   ├── education.html             # 教育页面 (38KB)
│   ├── lifestyle.html             # 生活方式页面 (27KB)
│   ├── labor.html                 # 劳务页面 (44KB)
│   ├── tourism.html               # 旅游页面 (48KB)
│   ├── pet.html                   # 宠物页面 (45KB)
│   └── complete-demo.html         # 完整演示页面 (89KB)
├── data/                           # 数据文件
│   └── translations.json           # 多语言翻译数据 (中日英三语)
└── CLAUDE.md                      # 本文件
```

### 核心组件详解
1. **SPA导航系统** (`js/nav.js` - 739行)
   - 安全HTML转义 (`escapeHtml`)
   - URL安全验证 (`sanitizeUrl`)
   - 安全事件管理器 (`SecureEventManager`)
   - 单头部架构实现
   - PJAX页面切换
   - XSS防护机制

2. **CSS架构系统**
   - **主入口**: `css/main.css` - @import所有模块
   - **基础层**: CSS变量、重置、字体系统
   - **布局层**: 页面布局组件
   - **组件层**: 可复用UI组件
   - **备用文件**: `consolidated.css` (消除@import依赖)
   - **响应式**: `responsive.css` (现代响应式设计)

3. **国际化系统** (`data/translations.json`)
   - **中文(zh)**: 完整的中文翻译
   - **英文(en)**: 完整的英文翻译
   - **日文(ja)**: 完整的日文翻译
   - **覆盖范围**: 导航、表单、按钮、服务、统计等

4. **核心模块系统** (`js/core/`)
   - **组件库**: 924行 - 可复用UI组件
   - **安全路由**: 625行 - 安全的SPA路由
   - **用户偏好**: 737行 - 个性化设置
   - **搜索管理**: 685行 - 全站搜索功能
   - **性能优化**: 641行 - 性能监控和优化

5. **页面系统** (`html/` - 12个子页面)
   - 每个页面都是独立的HTML文件
   - 统一的header结构 (`<nav id="main-navbar"></nav>`)
   - 支持SPA导航和直接访问
   - 完整的服务内容展示

## Key Architectural Patterns

### 1. SPA Navigation System (js/nav.js)
- **Single Header Architecture**: Prevents navigation bar duplication
- **Secure Event Management**: Uses WeakMap for memory-efficient event handling
- **PJAX Implementation**: Fast page transitions without full reloads
- **Security Features**: URL sanitization, HTML escaping, XSS prevention
- **Performance Optimization**: Page caching and transition management

### 2. Security-First Design
- **XSS Prevention**: HTML escaping on all dynamic content via `escapeHtml()`
- **URL Validation**: Sanitization for all navigation links via `sanitizeUrl()`
- **CSP Headers**: Comprehensive Content Security Policy
- **Event Management**: Secure event cleanup and validation via `SecureEventManager`

### 3. Modular JavaScript Architecture (js/core/)
The core modules provide specialized functionality:
- `spa-router-secure.js` (863 lines): Safe SPA routing with dependency management
- `component-library.js` (924 lines): Reusable UI components
- `user-preferences.js` (759 lines): Personalization system
- `search-manager.js` (626 lines): Global search functionality
- `performance-optimizer.js` (641 lines): Performance monitoring and optimization
- `security-monitor.js` (639 lines): Continuous security scanning
- `i18n.js` (114 lines): Internationalization system

### 4. CSS Architecture System
- **Layered Architecture**: `base/` → `layouts/` → `components/`
- **CSS Variables**: Centralized design system in `base/variables.css`
- **Modern AI Design**: Unified AI-themed styling with gradients and animations
- **Responsive Design**: Mobile-first with `responsive.css`
- **Fallback System**: `consolidated.css` eliminates @import dependencies

### 5. Multi-Language Support System
- **Translation Keys**: Consistent `data-lang` attributes throughout HTML
- **Dynamic Switching**: Real-time language changes without page reload
- **Three Languages**: Chinese (zh), English (en), Japanese (ja)
- **Cultural Adaptation**: Content tailored for Japanese market

## 开发约束

### 技术约束
- **无构建工具** - 直接使用HTML/CSS/JS，无需编译
- **浏览器兼容性** - 支持现代浏览器 (ES6+)
- **性能要求** - 首屏加载 < 3秒
- **SEO友好** - 服务端渲染准备
- **安全要求** - XSS防护、URL验证、HTML转义
- **模块化架构** - CSS @import层级、JS模块化组织

### 设计约束
- **品牌一致性** - 保持日本商务通品牌色彩和风格
- **用户体验** - 遵循日本用户使用习惯
- **多语言支持** - 完整的中日英三语翻译系统
- **移动优先** - 响应式设计，移动体验优先
- **无障碍标准** - WCAG 2.1 AA级别无障碍支持

### CSS架构约束
- **主CSS文件**: `css/main.css` - 使用@import导入模块
- **备用方案**: `css/consolidated.css` - 单文件消除依赖
- **响应式**: `css/responsive.css` - 现代响应式设计
- **层级结构**: base → layouts → components → pages
- **变量系统**: 统一的CSS变量定义在 `base/variables.css`

## CSS开发规范与最佳实践

 ### 📋 质量保证清单

  - ✅ 代码质量: 使用BEM规范，避免过度嵌套
  - ✅ 响应式设计: 移动优先，测试所有断点
  - ✅ 性能优化: 选择器性能优化，避免重复代码
  - ✅ 可访问性: 完整焦点状态，键盘导航支持
  - ✅ 兼容性: 向后兼容，平滑迁移



### 整个项目的CSS代码：
  - 100%符合规范: 遵循文档化的开发标准
  - 性能优化: 消除了所有性能瓶颈
  - 冲突避免: 通过命名空间和选择器管理
  - 可维护性: 统一的命名和变量系统
  - 可访问性: 完整的键盘和屏幕阅读器支持
  - 响应式: 现代移动优先设计

### 🎯 CSS命名规则

#### BEM命名规范
```css
/* Block - 块 */
.card { }
.button { }
.nav { }

/* Element - 元素 */
.card__title { }
.button__icon { }
.nav__item { }

/* Modifier - 修饰符 */
.card--featured { }
.button--primary { }
.nav--vertical { }
```

#### 组件命名约定
- **页面区域**: `[page]-[section]` (例: `home-hero`, `services-grid`)
- **组件**: `[component]-[subcomponent]` (例: `modal-header`, `form-input`)
- **状态**: `[component]--[state]` (例: `button--disabled`, `card--active`)
- **工具类**: `[utility]-[value]` (例: `text-center`, `mb-20`)

#### 特殊前缀规则
- **JavaScript钩子**: `js-*` (例: `js-modal-trigger`)
- **测试属性**: `data-test="*"` (例: `data-test="submit-button"`)
- **无障碍**: `aria-*` 属性 (例: `aria-label="close modal"`)

### 📱 响应式设计规则

#### 断点标准
```css
/* 移动优先设计 */
/* 小手机 */     @media (max-width: 575px) { }
/* 大手机 */     @media (min-width: 576px) and (max-width: 767px) { }
/* 平板 */       @media (min-width: 768px) and (max-width: 1023px) { }
/* 小桌面 */     @media (min-width: 1024px) and (max-width: 1199px) { }
/* 大桌面 */     @media (min-width: 1200px) { }

/* 特殊设备 */
/* 超小屏幕 */   @media (max-width: 380px) { }
/* 超大屏幕 */   @media (min-width: 1400px) { }
```

#### 响应式设计原则
1. **移动优先**: 从小屏幕开始设计，逐步增强
2. **相对单位**: 优先使用 `rem`, `em`, `%`, `vw/vh`
3. **弹性布局**: 使用 Flexbox 和 Grid
4. **容器查询**: 考虑组件级别的响应式

#### CSS Grid 响应式
```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
}

/* 或使用明确断点 */
.grid {
    grid-template-columns: 1fr;
}
@media (min-width: 768px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media (min-width: 1024px) {
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### 🔒 避免CSS冲突规则

#### 1. 命名空间隔离
```css
/* ❌ 错误 - 可能冲突 */
.card { }
.modal { }

/* ✅ 正确 - 带命名空间 */
.product-card { }
.auth-modal { }
.ai-footer .modal { }  /* 限定在footer内 */
```

#### 2. 选择器特异性管理
```css
/* 避免过高特异性 */
/* ❌ 错误 */
.page .section .container .card .title .text { }

/* ✅ 正确 */
.card__title { }

/* 当需要覆盖时使用明确的选择器 */
.footer .link { /* 专门处理footer中的链接 */ }
```

#### 3. 作用域限制
```css
/* 组件内样式 */
.ai-capabilities {
    /* 组件级别的样式 */
}

/* 特定上下文的样式 */
.ai-footer .ai-capabilities {
    /* 仅在footer中的样式 */
}
```

#### 4. CSS变量作用域
```css
:root {
    /* 全局变量 */
    --primary-color: #1e3a5f;
}

.component {
    /* 组件局部变量 */
    --card-padding: var(--spacing-lg);
    --card-radius: 8px;
}
```

### 🎨 CSS架构原则

#### 1. 分层组织
```css
/* Base Layer - 基础样式 */
:root { /* CSS变量 */ }
*, *::before, *::after { /* 重置 */ }
body { /* 基础样式 */ }

/* Layout Layer - 布局样式 */
.container { }
.header { }
.main { }

/* Component Layer - 组件样式 */
.button { }
.card { }
.modal { }

/* Page Layer - 页面特定样式 */
.home-hero { }
.services-grid { }
```

#### 2. 组件化思维
```css
/* 每个组件应该有清晰的边界 */
.modal {
    /* 容器样式 */
}
.modal__header {
    /* 头部样式 */
}
.modal__content {
    /* 内容样式 */
}
.modal__footer {
    /* 底部样式 */
}
.modal--large {
    /* 变体样式 */
}
```

#### 3. 状态管理
```css
/* 使用类名管理状态 */
.button {
    /* 基础样式 */
}
.button--loading {
    /* 加载状态 */
}
.button--disabled {
    /* 禁用状态 */
}
.button--active {
    /* 激活状态 */
}
```

### ⚡ 性能优化规则

#### 1. 选择器性能
```css
/* ✅ 快速 */
.class { }
.tag-name.class { }

/* ❌ 缓慢 */
* { }
[type="text"] { }
.parent .child .grandchild .deep { }
```

#### 2. 避免重复代码
```css
/* ❌ 重复 */
.card-1 { padding: 20px; border-radius: 8px; }
.card-2 { padding: 20px; border-radius: 8px; }

/* ✅ 复用 */
.card {
    padding: 20px;
    border-radius: 8px;
}
.card--featured { /* 特殊样式 */ }
```

#### 3. 关键CSS内联
```html
<!-- 关键渲染路径CSS -->
<style>
/* 首屏关键样式 */
.hero { display: block; }
</style>

<!-- 非关键CSS异步加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 🌈 可访问性与主题

#### 1. 颜色对比度
```css
/* 确保文字对比度符合WCAG标准 */
.text-primary {
    color: var(--text-primary); /* 至少4.5:1对比度 */
}
.text-secondary {
    color: var(--text-secondary); /* 至少3:1对比度 */
}
```

#### 2. 焦点状态
```css
/* 所有交互元素都需要焦点状态 */
.button:focus,
.link:focus,
.input:focus {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
}
```

#### 3. 减少动画偏好
```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

#### 4. 深色模式支持
```css
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: #1a202c;
        --text-primary: #f7fafc;
        --border-color: #2d3748;
    }
}
```

### 🛠️ 实用工具类

#### 间距系统
```css
/* 使用CSS变量统一间距 */
.m-0 { margin: 0; }
.mt-1 { margin-top: var(--spacing-xs); }
.mt-2 { margin-top: var(--spacing-sm); }
.mt-3 { margin-top: var(--spacing-md); }
.mt-4 { margin-top: var(--spacing-lg); }
.mt-5 { margin-top: var(--spacing-xl); }
```

#### 布局工具
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.grid { display: grid; }
.gap-4 { gap: var(--spacing-md); }
```

### 📋 CSS检查清单

#### 代码质量
- [ ] 使用BEM命名规范
- [ ] 避免过度嵌套（最多3层）
- [ ] 使用相对单位（rem, em, %）
- [ ] 避免使用 `!important`（除非必要）
- [ ] 合理使用CSS变量

#### 响应式设计
- [ ] 移动优先设计
- [ ] 测试所有断点
- [ ] 触摸设备优化
- [ ] 文字可读性在小屏幕上

#### 性能优化
- [ ] 选择器性能优化
- [ ] 避免重复样式
- [ ] 合理使用关键CSS
- [ ] 图片响应式处理

#### 可访问性
- [ ] 颜色对比度检查
- [ ] 焦点状态明确
- [ ] 键盘导航支持
- [ ] 屏幕阅读器友好

#### 兼容性
- [ ] 浏览器兼容性测试
- [ ] 降级处理
- [ ] 前缀添加
- [ ] 错误处理

### 🚫 禁止的CSS实践

1. **内联样式**（除非绝对必要）
2. **`!important` 滥用**
3. **过度嵌套选择器**
4. **硬编码的魔法数字**
5. **无意义的类名**
6. **忽略可访问性**
7. **不测试的媒体查询**
8. **混乱的z-index管理**

### 📝 注释规范

```css
/* ==========================================================================
   组件名称 - 简短描述
   ========================================================================== */

/* 子组件描述 */
.component__element { }

/* 状态说明 */
.component--modifier { }

/* 响应式断点注释 */
@media (min-width: 768px) {
    /* 平板及以上样式 */
}
```

### JavaScript架构约束
- **核心导航**: `js/nav.js` - 739行，包含安全防护
- **模块化**: `js/core/` - 17个核心功能模块
- **总代码量**: 约10,337行JavaScript代码
- **安全优先**: 所有HTML操作使用转义和验证
- **性能监控**: 内置性能监控和优化系统

## Common Development Tasks Guide

### 样式修改
1. **检查CSS变量** - 优先修改 `css/base/variables.css` 中的变量
2. **模块化修改** - 在对应的 `css/components/` 文件中修改
3. **响应式测试** - 确保在移动端、平板、桌面都正常显示
4. **备用方案** - 如遇@import问题，可使用 `css/consolidated.css`

### 功能添加
1. **保持SPA结构** - 不破坏 `js/nav.js` 的导航逻辑
2. **模块化开发** - 新功能放在 `js/core/` 或 `js/components/`
3. **安全第一** - 使用 `escapeHtml()` 和 `sanitizeUrl()` 确保安全
4. **性能考虑** - 避免阻塞主线程，使用事件委托

### 内容更新
1. **多语言同步** - 同时更新 `data/translations.json` 中的 zh/en/ja
2. **语义化标签** - 使用正确的HTML5语义标签
3. **data属性** - 保持 `data-lang` 属性的一致性
4. **链接验证** - 确保所有内部链接使用正确的相对路径

### 国际化修改
1. **翻译文件** - `data/translations.json` 包含完整三语翻译
2. **语言切换** - 通过 `js/core/i18n.js` 实现语言切换
3. **动态内容** - 使用 `data-lang` 属性标记需要翻译的内容
4. **测试验证** - 测试所有语言的显示效果

### CSS架构操作
1. **主CSS修改** - 修改 `css/main.css` 的@import顺序
2. **组件样式** - 在 `css/components/` 中添加新组件样式
3. **变量管理** - 在 `css/base/variables.css` 中定义全局变量
4. **响应式** - 使用 `css/responsive.css` 的现代响应式技术

### JavaScript模块操作
1. **核心模块** - 新功能优先考虑放在 `js/core/`
2. **安全要求** - 所有DOM操作必须使用安全转义
3. **事件管理** - 使用 `SecureEventManager` 管理事件监听
4. **性能监控** - 利用内置的性能监控系统

### 页面管理
1. **新增页面** - 在 `html/` 目录创建新的HTML文件
2. **导航集成** - 在 `js/nav.js` 的导航模板中添加链接
3. **SEO优化** - 使用 `js/core/seo-manager.js` 进行SEO管理
4. **统一结构** - 所有页面必须包含 `<nav id="main-navbar"></nav>`

## Important Development Constraints

### ✅ Required Practices
1. **Read existing content** before making any changes
2. **Backup important files** before modifying core components
3. **Incremental changes only** - preserve existing code structure
4. **Function verification** - test functionality immediately after changes
5. **Security first** - use `escapeHtml()` and `sanitizeUrl()` for all dynamic content

### 🚫 Prohibited Operations
1. **Delete or overwrite user content** - never remove existing functionality
2. **Rewrite entire files** - only refactor when explicitly requested
3. **Introduce external dependencies** - no unauthorized third-party libraries
4. **Break existing functionality** - ensure all features work before deploying
5. **Change SPA architecture** - don't alter navigation system structure

### File Organization Principles
- **Main Entry Points**: `index.html` (SPA), `css/main.css` (styles), `js/nav.js` (navigation)
- **Modular Development**: New features go in `js/core/` or appropriate component files
- **Page Management**: HTML pages in `html/` directory with unified structure
- **Shared Utilities**: Common functionality in `js/shared/` to prevent code duplication

## Special Features and Implementation Details

### Advanced Filtering System
- **Unified Filter Manager**: `js/shared/filter-manager.js` provides consistent filtering across all pages
- **Event Delegation**: Efficient event handling with animation management
- **Safe DOM Creation**: Prevents XSS attacks in filtered content
- **Configuration-Driven**: Each page has specific filter configurations

### Performance Optimization
- **Lazy Loading**: Page content loaded on-demand
- **Caching System**: Page and style caching with intelligent invalidation
- **Performance Monitoring**: Real-time metrics and optimization suggestions
- **Memory Management**: WeakMap-based event listener cleanup

### SEO and Accessibility
- **Dynamic Meta Tags**: `js/core/seo-manager.js` handles search optimization
- **WCAG 2.1 AA Compliance**: ARIA labels and screen reader support
- **Semantic HTML**: Proper use of HTML5 semantic elements
- **Keyboard Navigation**: Full keyboard accessibility support

## Quality Standards

### Performance Requirements
- Page load time < 3 seconds
- Interactive response time < 200ms
- Smooth page transitions without flicker
- Mobile-optimized experience

### Security Standards
- All HTML content must be escaped using `escapeHtml()`
- All URLs must be validated using `sanitizeUrl()`
- Event listeners must use `SecureEventManager`
- Content Security Policy headers enforced

### Code Quality
- Modular JavaScript with clear separation of concerns
- Semantic HTML5 markup
- Maintainable CSS with consistent naming conventions
- Comprehensive error handling and recovery

## Emergency Procedures

### Error Recovery
1. **Stop immediately** - halt all modification operations
2. **Assess impact** - determine error scope
3. **Use backups** - restore from recent backup files
4. **Analyze cause** - identify root cause
5. **Restart safely** - begin again with proper procedure

### Critical File Backups
- **Primary files**: `index.html`, `js/nav.js`, `css/main.css`
- **Core modules**: All files in `js/core/`
- **Translation data**: `data/translations.json`
- **Configuration**: Server scripts and configuration files

## Server and Deployment

### Local Development
Always use the provided server scripts to avoid browser security issues:
```bash
cd frontend
./start-server.sh
# Open http://localhost:8000 in browser
```

### Supported Pages
- ⚖️ AI Legal Services (`ai-legal`)
- 🤖 AI CRM System (`ai-crm`)
- 🌍 AI Global Expansion (`aiglobal`)
- 💰 AI Finance Services (`aifinance`)
- 📚 Knowledge Base (`knowledge`)
- 👥 Professional Talent (`professionals`)
- 🌟 Lifestyle (`lifestyle`)
- 🎓 Education (`education`)
- 💼 Labor Services (`labor`)
- 🐾 Pet Services (`pet`)
- ✈️ Tourism (`tourism`)
- 🌐 Community (`community`)

## 错误恢复

### 如果出现错误
1. **立即停止** - 停止所有修改操作
2. **评估影响** - 确定错误影响范围
3. **使用备份** - 从最近的备份恢复文件
4. **分析原因** - 确定错误根本原因
5. **重新开始** - 按正确流程重新操作

### 备份策略
- **重要文件备份**: `index.html`, `js/nav.js`, `css/main.css`
- **时间戳命名**: `backup-YYYY-MM-DD-HH-mm-ss.ext`
- **关键节点备份**: 重大修改前创建完整项目备份
- **保留版本**: 至少保留最近3个版本的备份

### 紧急恢复文件
- **原始内容**: `/staticSPA/index.html` - 完整原始版本
- **工作版本**: `/temp-repo/index.html` - 当前工作版本
- **CSS文件**: 备份 `css/` 目录下的关键文件
- **JS文件**: 备份 `js/nav.js` 和 `js/core/` 核心模块

### 常见问题解决
1. **CSS加载失败**: 切换到 `css/consolidated.css`
2. **导航不工作**: 检查 `js/nav.js` 是否正确加载
3. **页面空白**: 检查安全监控是否过于严格
4. **多语言失效**: 检查 `data/translations.json` 格式
5. **性能问题**: 检查 `js/core/performance-monitor.js` 日志

### 联系方式
如遇到无法解决的技术问题：
- 检查浏览器控制台错误信息
- 查看网络请求状态
- 验证文件路径和权限
- 确认服务器运行状态

## 沟通原则

### 向用户报告
- 清晰说明修改内容
- 解释修改原因和影响
- 提供测试验证方法
- 询问是否满足要求

### 遇到不确定情况
- 立即询问用户确认
- 提供多个解决方案选项
- 解释各方案的优缺点
- 等待用户明确指示

## 质量标准

### 代码质量
- 语义化HTML标签
- 可维护的CSS结构
- 模块化JavaScript
- 完整的注释说明

### 用户体验
- 快速响应交互
- 流畅的页面切换
- 清晰的视觉反馈
- 友好的错误提示

### 性能标准
- 页面加载时间 < 3秒
- 交互响应时间 < 200ms
- 页面切换流畅无闪烁
- 移动端体验优化

---

**重要提醒**: 每次执行任务前必须重新阅读本文件，确保完全理解项目要求和技术约束。有任何不确定的地方，必须先询问用户确认！

**Important**: This codebase represents a mature, production-ready SPA system with advanced security, performance optimization, and comprehensive internationalization support specifically designed for the Japanese business market. Always prioritize security, performance, and user experience in all development work.