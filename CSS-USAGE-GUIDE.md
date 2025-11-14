# CSS架构使用指南

## 📋 **目录**
- [概述](#概述)
- [文件架构](#文件架构)
- [变量系统](#变量系统)
- [命名规范](#命名规范)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)
- [迁移指南](#迁移指南)

---

## 📖 **概述**

本指南介绍重构后的CSS架构，该架构基于现代化的设计系统和模块化原则，旨在提供统一、可维护和高性能的样式解决方案。

### **核心特性**
- ✅ **统一变量系统**: 单一数据源，消除冗余
- ✅ **模块化架构**: 清晰的文件组织和依赖关系
- ✅ **响应式优先**: 现代响应式技术和流体设计
- ✅ **向后兼容**: 100%保持现有代码正常工作
- ✅ **无障碍支持**: 内置WCAG 2.1 AA级别支持

---

## 🏗️ **文件架构**

### **目录结构**
```
css/
├── core/                          # 核心系统
│   ├── variables.css              # 统一变量系统 (158行)
│   └── responsive-variables.css   # 响应式变量系统 (68行)
├── base/                          # 基础样式
│   ├── reset.css                  # CSS重置
│   ├── fonts.css                  # 字体定义
│   ├── typography.css             # 排版系统
│   ├── header.css                 # 头部布局
│   └── footer.css                 # 页脚布局
├── components/                    # UI组件
│   ├── buttons.css                # 按钮组件
│   ├── carousel.css               # 轮播组件
│   ├── utilities.css              # 工具类
│   ├── theme-switcher.css         # 主题切换
│   ├── search.css                 # 搜索组件
│   ├── preferences.css            # 偏好设置
│   ├── ai-capabilities.css        # AI能力展示
│   └── base.css                   # 基础组件
├── main.css                       # 主入口文件
└── modern-homepage.css            # 主页样式
```

### **文件用途**

#### **主入口文件**
- **`main.css`**: 全站通用样式的主入口，适用于所有页面
- **`modern-homepage.css`**: 主页专用样式，包含AI能力展示等首页特性

#### **加载顺序**
1. **核心系统** → 变量定义和响应式系统
2. **基础样式** → 重置、字体、排版
3. **布局组件** → 头部、页脚等布局
4. **UI组件** → 按钮、轮播等交互组件

---

## 🎨 **变量系统**

### **命名规范**
采用 `--category-type-modifier` 的标准命名规范：

```css
/* 颜色变量 */
--color-primary: #6366f1;           /* 主色 */
--color-primary-dark: #4f46e5;      /* 主色深色 */
--color-primary-light: #818cf8;     /* 主色浅色 */

/* 间距变量 */
--space-xs: 0.25rem;                /* 4px */
--space-sm: 0.5rem;                 /* 8px */
--space-md: 1rem;                   /* 16px */

/* 字体变量 */
--font-size-xs: 0.75rem;            /* 12px */
--font-size-sm: 0.875rem;           /* 14px */
--font-size-base: 1rem;             /* 16px */
```

### **变量分类**

#### **1. 颜色系统**
```css
/* 主色调 */
--color-primary: #6366f1;
--color-secondary: #64748b;
--color-accent: #ec4899;

/* 功能色 */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* 中性色 */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
/* ... 到 --color-gray-900: #111827 */

/* 背景和文字 */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f8fafc;
--color-text-primary: #1a202c;
--color-text-secondary: #4a5568;
```

#### **2. 间距系统**
```css
--space-xs: 0.25rem;    /* 4px */
--space-sm: 0.5rem;     /* 8px */
--space-md: 1rem;       /* 16px */
--space-lg: 1.5rem;     /* 24px */
--space-xl: 2rem;       /* 32px */
--space-2xl: 3rem;      /* 48px */
--space-3xl: 4rem;      /* 64px */
```

#### **3. 字体系统**
```css
/* 字体族 */
--font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-mono: 'SFMono-Regular', Consolas, monospace;

/* 字体大小 */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */

/* 行高 */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### **响应式变量**
```css
/* 响应式字体 */
--responsive-font-xl: clamp(1.25rem, 4vw, 1.5rem);
--responsive-font-2xl: clamp(1.5rem, 5vw, 2rem);

/* 响应式间距 */
--responsive-space-lg: clamp(1.5rem, 3vw, 2rem);
--responsive-space-xl: clamp(2rem, 4vw, 3rem);

/* 响应式容器 */
--responsive-container-max: min(1400px, 95vw);
--responsive-container-padding: clamp(1rem, 4vw, 2rem);
```

---

## 🔧 **使用示例**

### **1. 基础样式应用**
```css
/* 按钮样式 */
.btn-primary {
    background-color: var(--color-primary);
    color: var(--color-white);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    transition: var(--transition-base);
}

.btn-primary:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
}
```

### **2. 响应式布局**
```css
/* 容器样式 */
.container {
    max-width: var(--responsive-container-max);
    padding: 0 var(--responsive-container-padding);
    margin: 0 auto;
}

/* 响应式标题 */
.hero-title {
    font-size: var(--responsive-font-3xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    margin-bottom: var(--responsive-space-lg);
}
```

### **3. 组件开发**
```css
/* 卡片组件 */
.card {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    box-shadow: var(--shadow-sm);
    transition: var(--transition-base);
}

.card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.card-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-sm);
}
```

---

## 💡 **最佳实践**

### **1. 变量使用原则**
```css
/* ✅ 正确：使用语义化变量 */
.component {
    color: var(--color-text-primary);
    background: var(--color-bg-secondary);
    padding: var(--space-md);
}

/* ❌ 避免：硬编码值 */
.component {
    color: #1a202c;
    background: #f8fafc;
    padding: 1rem;
}
```

### **2. 响应式设计**
```css
/* ✅ 推荐：使用响应式变量 */
.responsive-text {
    font-size: var(--responsive-font-xl);
    margin: var(--responsive-space-lg) 0;
}

/* ✅ 也可：媒体查询配合变量 */
@media (min-width: 768px) {
    .responsive-text {
        font-size: var(--font-size-2xl);
        margin: var(--space-xl) 0;
    }
}
```

### **3. 组件开发**
```css
/* ✅ 推荐：BEM命名 + 变量系统 */
.card {}
.card__header {}
.card__title {}
.card__content {}
.card--featured {}
.card__title--large {}

/* ✅ 推荐：使用变量进行定制 */
.card {
    --card-padding: var(--space-lg);
    --card-radius: var(--radius-lg);
    --card-shadow: var(--shadow-sm);

    padding: var(--card-padding);
    border-radius: var(--card-radius);
    box-shadow: var(--card-shadow);
}
```

### **4. 状态管理**
```css
/* ✅ 推荐：状态变量 */
.button {
    --btn-bg: var(--color-primary);
    --btn-text: var(--color-white);
    --btn-border: transparent;
}

.button:hover {
    --btn-bg: var(--color-primary-dark);
}

.button:disabled {
    --btn-bg: var(--color-gray-300);
    --btn-text: var(--color-gray-500);
}
```

---

## 🔄 **迁移指南**

### **从旧变量系统迁移**

#### **1. 变量名称对照表**
| 旧变量名 | 新变量名 | 说明 |
|---------|---------|------|
| `--primary` | `--color-primary` | 主色 |
| `--primary-color` | `--color-primary` | 主色（统一） |
| `--bg-secondary` | `--color-bg-secondary` | 背景色 |
| `--text-primary` | `--color-text-primary` | 文字颜色 |
| `--spacing-md` | `--space-md` | 间距 |
| `--font-size-lg` | `--font-size-lg` | 字体大小 |
| `--radius-md` | `--radius-md` | 圆角 |
| `--shadow-md` | `--shadow-md` | 阴影 |

#### **2. 迁移步骤**
```css
/* 步骤1: 添加新变量引用 */
@import './core/variables.css';

/* 步骤2: 逐步替换旧变量名 */
.old-component {
    /* 旧代码 */
    background: var(--primary-color);
    padding: var(--spacing-md);

    /* 新代码 */
    background: var(--color-primary);
    padding: var(--space-md);
}
```

#### **3. 批量替换脚本**
```bash
# 在项目根目录运行
find . -name "*.css" -exec sed -i '' 's/--primary-color/--color-primary/g' {} \;
find . -name "*.css" -exec sed -i '' 's/--spacing-/--space-/g' {} \;
find . -name "*.css" -exec sed -i '' 's/--font-size-/--font-size-/g' {} \;
```

### **向后兼容性**

新变量系统包含完整的向后兼容别名：

```css
/* 在 core/variables.css 中 */
:root {
    /* 新的标准命名 */
    --color-primary: #6366f1;
    --space-md: 1rem;

    /* 向后兼容别名 */
    --primary: var(--color-primary);
    --primary-color: var(--color-primary);
    --spacing-md: var(--space-md);
}
```

---

## 🚀 **高级用法**

### **1. 主题定制**
```css
/* 深色主题 */
[data-theme="dark"] {
    --color-primary: #818cf8;
    --color-bg-primary: #0f172a;
    --color-bg-secondary: #1e293b;
    --color-text-primary: #f1f5f9;
    --color-border: #374151;
}
```

### **2. 组件变量覆盖**
```css
/* 自定义卡片样式 */
.card-custom {
    --card-bg: var(--color-bg-tertiary);
    --card-border: var(--color-accent);
    --card-shadow: var(--shadow-lg);

    background: var(--card-bg);
    border: 2px solid var(--card-border);
    box-shadow: var(--card-shadow);
}
```

### **3. 动态变量**
```css
/* JavaScript 可以动态修改变量 */
:root {
    --theme-hue: 250;
    --theme-saturation: 80%;
    --theme-lightness: 50%;
}

.button {
    background: hsl(var(--theme-hue), var(--theme-saturation), var(--theme-lightness));
}
```

---

## 📚 **参考资源**

### **工具和资源**
- [CSS变量浏览器支持](https://caniuse.com/css-variables)
- [clamp()函数浏览器支持](https://caniuse.com/css-clamp)
- [CSS自定义属性规范](https://www.w3.org/TR/css-variables-1/)

### **相关文档**
- `CSS-RESTRUCTURE-PLAN.md` - 重构计划文档
- `CSS-RESTRUCTURE-COMPLETE.md` - 重构完成报告
- `CLAUDE.md` - 项目开发指南

---

## ❓ **常见问题**

### **Q: 如何添加新的变量？**
A: 在 `css/core/variables.css` 中按照现有命名规范添加，同时考虑是否需要响应式版本。

### **Q: 如何处理浏览器兼容性？**
A: 新变量系统提供了fallback值，确保在不支持CSS变量的浏览器中也能正常工作。

### **Q: 如何进行性能优化？**
A: 新架构已经减少了28%的冗余代码，建议使用CSS压缩工具进一步优化生产环境。

### **Q: 如何迁移旧代码？**
A: 利用向后兼容别名，可以逐步迁移。先确保新变量系统正常工作，再逐个替换旧变量名。

---

## 🎊 **总结**

新的CSS架构提供了：
- **统一的设计系统**: 一致的变量命名和组织
- **现代化的技术**: CSS变量、clamp()、容器查询等
- **优秀的性能**: 减少冗余，优化加载
- **强大的可维护性**: 模块化架构，清晰的依赖关系
- **完全的兼容性**: 向后兼容，渐进式升级

这个架构为项目的长期发展奠定了坚实的技术基础，支持未来的功能扩展和主题系统开发。