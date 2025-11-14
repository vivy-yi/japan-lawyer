/**
 * Preferences UI Component - 用户偏好设置界面组件
 * 提供直观的偏好设置界面，支持分类管理和实时预览
 */

class PreferencesUIComponent extends BaseComponent {
    constructor(container, config = {}) {
        super(container, config);
        this.currentCategory = 'appearance';
        this.panels = new Map();
        this.previewMode = false;
    }

    getDefaultConfig() {
        return {
            title: '用户偏好设置',
            showPreview: true,
            categories: [
                'appearance', 'language', 'navigation', 'content',
                'search', 'notifications', 'performance', 'privacy'
            ],
            onSave: null,
            onReset: null,
            onExport: null,
            onImport: null
        };
    }

    render() {
        const preferences = this.createElement('div', {
            className: 'preferences-ui'
        });

        // 创建头部
        const header = this.createHeader();
        preferences.appendChild(header);

        // 创建主要内容区域
        const mainContent = this.createElement('div', {
            className: 'preferences-main'
        });

        // 创建侧边栏导航
        const sidebar = this.createSidebar();
        mainContent.appendChild(sidebar);

        // 创建设置面板容器
        const panelsContainer = this.createElement('div', {
            className: 'preferences-panels'
        });

        // 创建各个设置面板
        this.config.categories.forEach(category => {
            const panel = this.createPanel(category);
            this.panels.set(category, panel);
            panelsContainer.appendChild(panel);
        });

        mainContent.appendChild(panelsContainer);

        // 创建底部操作栏
        const footer = this.createFooter();
        preferences.appendChild(footer);

        this.element = preferences;

        // 显示默认面板
        this.showPanel('appearance');

        return preferences;
    }

    createHeader() {
        const header = this.createElement('div', {
            className: 'preferences-header'
        });

        const title = this.createElement('h2', {
            className: 'preferences-title'
        }, this.config.title);

        const description = this.createElement('p', {
            className: 'preferences-description'
        }, '自定义您的体验设置，包括外观、语言、通知等偏好');

        const closeButton = this.createElement('button', {
            className: 'preferences-close'
        }, '×');

        this.addEventListener(closeButton, 'click', () => this.close());

        header.appendChild(title);
        header.appendChild(description);
        header.appendChild(closeButton);

        return header;
    }

    createSidebar() {
        const sidebar = this.createElement('nav', {
            className: 'preferences-sidebar'
        });

        const navItems = [
            { key: 'appearance', icon: '🎨', label: '外观设置' },
            { key: 'language', icon: '🌐', label: '语言设置' },
            { key: 'navigation', icon: '🧭', label: '导航设置' },
            { key: 'content', icon: '📝', label: '内容设置' },
            { key: 'search', icon: '🔍', label: '搜索设置' },
            { key: 'notifications', icon: '🔔', label: '通知设置' },
            { key: 'performance', icon: '⚡', label: '性能设置' },
            { key: 'privacy', icon: '🔒', label: '隐私设置' }
        ];

        navItems.forEach(item => {
            if (this.config.categories.includes(item.key)) {
                const navButton = this.createElement('button', {
                    className: `preferences-nav-item ${item.key === this.currentCategory ? 'active' : ''}`,
                    'data-category': item.key
                }, [
                    this.createElement('span', { className: 'nav-icon' }, item.icon),
                    this.createElement('span', { className: 'nav-label' }, item.label)
                ]);

                this.addEventListener(navButton, 'click', () => this.showPanel(item.key));
                sidebar.appendChild(navButton);
            }
        });

        return sidebar;
    }

    createPanel(category) {
        const panel = this.createElement('div', {
            className: `preferences-panel ${category}`,
            'data-category': category,
            style: { display: category === this.currentCategory ? 'block' : 'none' }
        });

        const panelContent = this[`create${this.capitalize(category)}Panel`]();
        panel.appendChild(panelContent);

        return panel;
    }

    createAppearancePanel() {
        const content = this.createElement('div', {
            className: 'panel-content'
        });

        // 主题设置
        const themeGroup = this.createSettingGroup({
            title: '主题设置',
            description: '选择您喜欢的界面主题'
        });

        const themeOptions = [
            { value: 'light', label: '亮色主题', icon: '☀️' },
            { value: 'dark', label: '暗色主题', icon: '🌙' },
            { value: 'auto', label: '跟随系统', icon: '🔄' }
        ];

        const themeSelector = this.createRadioGroup({
            name: 'theme',
            options: themeOptions,
            value: window.userPreferencesManager.get('theme'),
            onChange: (value) => this.updatePreference('theme', value)
        });

        themeGroup.appendChild(themeSelector);
        content.appendChild(themeGroup);

        // 字体设置
        const fontGroup = this.createSettingGroup({
            title: '字体设置',
            description: '调整字体大小和样式'
        });

        // 字体大小
        const fontSizeLabel = this.createElement('label', {}, '字体大小');
        const fontSizeSelect = this.createSelect({
            options: [
                { value: 'small', label: '小号 (14px)' },
                { value: 'medium', label: '中号 (16px)' },
                { value: 'large', label: '大号 (18px)' }
            ],
            value: window.userPreferencesManager.get('fontSize'),
            onChange: (value) => this.updatePreference('fontSize', value)
        });

        fontGroup.appendChild(fontSizeLabel);
        fontGroup.appendChild(fontSizeSelect);

        // 字体族
        const fontFamilyLabel = this.createElement('label', {}, '字体样式');
        const fontFamilySelect = this.createSelect({
            options: [
                { value: 'default', label: '系统默认' },
                { value: 'serif', label: '衬线字体' },
                { value: 'sans-serif', label: '无衬线字体' },
                { value: 'monospace', label: '等宽字体' }
            ],
            value: window.userPreferencesManager.get('fontFamily'),
            onChange: (value) => this.updatePreference('fontFamily', value)
        });

        fontGroup.appendChild(fontFamilyLabel);
        fontGroup.appendChild(fontFamilySelect);

        content.appendChild(fontGroup);

        // 颜色设置
        const colorGroup = this.createSettingGroup({
            title: '颜色设置',
            description: '自定义主题颜色'
        });

        const primaryColorLabel = this.createElement('label', {}, '主要颜色');
        const primaryColorInput = this.createElement('input', {
            type: 'color',
            value: window.userPreferencesManager.get('primaryColor'),
            onChange: (e) => this.updatePreference('primaryColor', e.target.value)
        });

        const accentColorLabel = this.createElement('label', {}, '强调颜色');
        const accentColorInput = this.createElement('input', {
            type: 'color',
            value: window.userPreferencesManager.get('accentColor'),
            onChange: (e) => this.updatePreference('accentColor', e.target.value)
        });

        colorGroup.appendChild(primaryColorLabel);
        colorGroup.appendChild(primaryColorInput);
        colorGroup.appendChild(accentColorLabel);
        colorGroup.appendChild(accentColorInput);

        content.appendChild(colorGroup);

        return content;
    }

    createLanguagePanel() {
        const content = this.createElement('div', {
            className: 'panel-content'
        });

        // 语言设置
        const languageGroup = this.createSettingGroup({
            title: '界面语言',
            description: '选择界面显示语言'
        });

        const languageOptions = [
            { value: 'zh-CN', label: '简体中文' },
            { value: 'en-US', label: 'English' },
            { value: 'ja-JP', label: '日本語' }
        ];

        const languageSelect = this.createSelect({
            options: languageOptions,
            value: window.userPreferencesManager.get('language'),
            onChange: (value) => this.updatePreference('language', value)
        });

        languageGroup.appendChild(languageSelect);
        content.appendChild(languageGroup);

        // 日期时间格式
        const formatGroup = this.createSettingGroup({
            title: '日期时间格式',
            description: '设置日期和时间的显示格式'
        });

        const dateFormatLabel = this.createElement('label', {}, '日期格式');
        const dateFormatSelect = this.createSelect({
            options: [
                { value: 'YYYY-MM-DD', label: '2024-01-15' },
                { value: 'MM/DD/YYYY', label: '01/15/2024' },
                { value: 'DD/MM/YYYY', label: '15/01/2024' }
            ],
            value: window.userPreferencesManager.get('dateFormat'),
            onChange: (value) => this.updatePreference('dateFormat', value)
        });

        const timeFormatLabel = this.createElement('label', {}, '时间格式');
        const timeFormatOptions = [
            { value: '24h', label: '24小时制 (14:30)' },
            { value: '12h', label: '12小时制 (2:30 PM)' }
        ];

        const timeFormatSelect = this.createSelect({
            options: timeFormatOptions,
            value: window.userPreferencesManager.get('timeFormat'),
            onChange: (value) => this.updatePreference('timeFormat', value)
        });

        formatGroup.appendChild(dateFormatLabel);
        formatGroup.appendChild(dateFormatSelect);
        formatGroup.appendChild(timeFormatLabel);
        formatGroup.appendChild(timeFormatSelect);

        content.appendChild(formatGroup);

        return content;
    }

    createNavigationPanel() {
        const content = this.createElement('div', {
            className: 'panel-content'
        });

        const settings = [
            {
                key: 'fixedHeader',
                label: '固定头部导航',
                description: '保持导航栏始终可见'
            },
            {
                key: 'autoHideHeader',
                label: '自动隐藏头部',
                description: '向下滚动时自动隐藏导航栏'
            },
            {
                key: 'breadcrumbs',
                label: '显示面包屑导航',
                description: '在页面顶部显示当前位置路径'
            }
        ];

        settings.forEach(setting => {
            const group = this.createSettingGroup({
                title: setting.label,
                description: setting.description
            });

            const checkbox = this.createCheckbox({
                checked: window.userPreferencesManager.get(setting.key),
                onChange: (checked) => this.updatePreference(setting.key, checked)
            });

            group.appendChild(checkbox);
            content.appendChild(group);
        });

        return content;
    }

    createContentPanel() {
        const content = this.createElement('div', {
            className: 'panel-content'
        });

        const settings = [
            {
                key: 'animations',
                label: '启用动画效果',
                description: '显示界面过渡和交互动画'
            },
            {
                key: 'reducedMotion',
                label: '减少动画',
                description: '降低动画强度，提升性能'
            },
            {
                key: 'highContrast',
                label: '高对比度模式',
                description: '增强界面对比度，提升可读性'
            },
            {
                key: 'largeText',
                label: '大字体模式',
                description: '增大字体尺寸，便于阅读'
            }
        ];

        settings.forEach(setting => {
            const group = this.createSettingGroup({
                title: setting.label,
                description: setting.description
            });

            const checkbox = this.createCheckbox({
                checked: window.userPreferencesManager.get(setting.key),
                onChange: (checked) => this.updatePreference(setting.key, checked)
            });

            group.appendChild(checkbox);
            content.appendChild(group);
        });

        return content;
    }

    createSearchPanel() {
        const content = this.createElement('div', {
            className: 'panel-content'
        });

        const settings = [
            {
                key: 'searchHistory',
                label: '保存搜索历史',
                description: '记录您的搜索查询以便快速访问'
            },
            {
                key: 'searchSuggestions',
                label: '搜索建议',
                description: '在输入时显示相关搜索建议'
            },
            {
                key: 'instantSearch',
                label: '即时搜索',
                description: '输入时自动执行搜索'
            }
        ];

        settings.forEach(setting => {
            const group = this.createSettingGroup({
                title: setting.label,
                description: setting.description
            });

            const checkbox = this.createCheckbox({
                checked: window.userPreferencesManager.get(setting.key),
                onChange: (checked) => this.updatePreference(setting.key, checked)
            });

            group.appendChild(checkbox);
            content.appendChild(group);
        });

        // 搜索结果数量
        const maxResultsGroup = this.createSettingGroup({
            title: '搜索结果数量',
            description: '设置每次搜索显示的最大结果数'
        });

        const maxResultsSelect = this.createSelect({
            options: [
                { value: '10', label: '10个结果' },
                { value: '20', label: '20个结果' },
                { value: '50', label: '50个结果' },
                { value: '100', label: '100个结果' }
            ],
            value: window.userPreferencesManager.get('maxSearchResults').toString(),
            onChange: (value) => this.updatePreference('maxSearchResults', parseInt(value))
        });

        maxResultsGroup.appendChild(maxResultsSelect);
        content.appendChild(maxResultsGroup);

        return content;
    }

    createNotificationsPanel() {
        const content = this.createElement('div', {
            className: 'panel-content'
        });

        const settings = [
            {
                key: 'enableNotifications',
                label: '启用通知',
                description: '显示系统通知和提醒'
            },
            {
                key: 'enableSounds',
                label: '启用声音',
                description: '通知时播放提示音'
            }
        ];

        settings.forEach(setting => {
            const group = this.createSettingGroup({
                title: setting.label,
                description: setting.description
            });

            const checkbox = this.createCheckbox({
                checked: window.userPreferencesManager.get(setting.key),
                onChange: (checked) => this.updatePreference(setting.key, checked)
            });

            group.appendChild(checkbox);
            content.appendChild(group);
        });

        // 通知位置
        const positionGroup = this.createSettingGroup({
            title: '通知位置',
            description: '选择通知显示的位置'
        });

        const positionOptions = [
            { value: 'top-right', label: '右上角' },
            { value: 'top-left', label: '左上角' },
            { value: 'bottom-right', label: '右下角' },
            { value: 'bottom-left', label: '左下角' }
        ];

        const positionSelect = this.createSelect({
            options: positionOptions,
            value: window.userPreferencesManager.get('notificationPosition'),
            onChange: (value) => this.updatePreference('notificationPosition', value)
        });

        positionGroup.appendChild(positionSelect);
        content.appendChild(positionGroup);

        // 通知持续时间
        const durationGroup = this.createSettingGroup({
            title: '通知持续时间',
            description: '设置通知显示的时间长度'
        });

        const durationSelect = this.createSelect({
            options: [
                { value: '2000', label: '2秒' },
                { value: '4000', label: '4秒' },
                { value: '6000', label: '6秒' },
                { value: '10000', label: '10秒' },
                { value: '0', label: '不自动关闭' }
            ],
            value: window.userPreferencesManager.get('notificationDuration').toString(),
            onChange: (value) => this.updatePreference('notificationDuration', parseInt(value))
        });

        durationGroup.appendChild(durationSelect);
        content.appendChild(durationGroup);

        return content;
    }

    createPerformancePanel() {
        const content = this.createElement('div', {
            className: 'panel-content'
        });

        const settings = [
            {
                key: 'lazyLoading',
                label: '启用懒加载',
                description: '延迟加载图片和非关键内容'
            },
            {
                key: 'preloadImages',
                label: '预加载关键图片',
                description: '提前加载重要图片资源'
            },
            {
                key: 'cacheEnabled',
                label: '启用缓存',
                description: '缓存数据以提升加载速度'
            }
        ];

        settings.forEach(setting => {
            const group = this.createSettingGroup({
                title: setting.label,
                description: setting.description
            });

            const checkbox = this.createCheckbox({
                checked: window.userPreferencesManager.get(setting.key),
                onChange: (checked) => this.updatePreference(setting.key, checked)
            });

            group.appendChild(checkbox);
            content.appendChild(group);
        });

        return content;
    }

    createPrivacyPanel() {
        const content = this.createElement('div', {
            className: 'panel-content'
        });

        const settings = [
            {
                key: 'allowAnalytics',
                label: '允许分析追踪',
                description: '帮助改进产品体验'
            },
            {
                key: 'allowPersonalization',
                label: '允许个性化',
                description: '根据使用习惯提供个性化内容'
            },
            {
                key: 'allowCookies',
                label: '允许Cookie',
                description: '使用Cookie保存您的偏好设置'
            }
        ];

        settings.forEach(setting => {
            const group = this.createSettingGroup({
                title: setting.label,
                description: setting.description
            });

            const checkbox = this.createCheckbox({
                checked: window.userPreferencesManager.get(setting.key),
                onChange: (checked) => this.updatePreference(setting.key, checked)
            });

            group.appendChild(checkbox);
            content.appendChild(group);
        });

        // 数据保留设置
        const retentionGroup = this.createSettingGroup({
            title: '数据保留时间',
            description: '设置用户数据的保留天数'
        });

        const retentionSelect = this.createSelect({
            options: [
                { value: '7', label: '7天' },
                { value: '30', label: '30天' },
                { value: '90', label: '90天' },
                { value: '365', label: '1年' }
            ],
            value: window.userPreferencesManager.get('dataRetentionDays').toString(),
            onChange: (value) => this.updatePreference('dataRetentionDays', parseInt(value))
        });

        retentionGroup.appendChild(retentionSelect);
        content.appendChild(retentionGroup);

        return content;
    }

    createFooter() {
        const footer = this.createElement('div', {
            className: 'preferences-footer'
        });

        // 左侧按钮组
        const leftActions = this.createElement('div', {
            className: 'footer-left'
        });

        const resetButton = this.createElement('button', {
            className: 'preferences-button reset'
        }, '重置为默认');

        this.addEventListener(resetButton, 'click', () => this.resetPreferences());
        leftActions.appendChild(resetButton);

        // 右侧按钮组
        const rightActions = this.createElement('div', {
            className: 'footer-right'
        });

        const exportButton = this.createElement('button', {
            className: 'preferences-button secondary'
        }, '导出设置');

        const importButton = this.createElement('button', {
            className: 'preferences-button secondary'
        }, '导入设置');

        const saveButton = this.createElement('button', {
            className: 'preferences-button primary'
        }, '保存并关闭');

        this.addEventListener(exportButton, 'click', () => this.exportPreferences());
        this.addEventListener(importButton, 'click', () => this.importPreferences());
        this.addEventListener(saveButton, 'click', () => this.saveAndClose());

        rightActions.appendChild(exportButton);
        rightActions.appendChild(importButton);
        rightActions.appendChild(saveButton);

        footer.appendChild(leftActions);
        footer.appendChild(rightActions);

        return footer;
    }

    // 辅助方法创建表单组件
    createSettingGroup({ title, description }) {
        const group = this.createElement('div', {
            className: 'setting-group'
        });

        const groupTitle = this.createElement('h4', {
            className: 'setting-title'
        }, title);

        const groupDescription = this.createElement('p', {
            className: 'setting-description'
        }, description);

        group.appendChild(groupTitle);
        group.appendChild(groupDescription);

        return group;
    }

    createRadioGroup({ name, options, value, onChange }) {
        const group = this.createElement('div', {
            className: 'radio-group'
        });

        options.forEach(option => {
            const label = this.createElement('label', {
                className: 'radio-option'
            });

            const input = this.createElement('input', {
                type: 'radio',
                name: name,
                value: option.value,
                checked: value === option.value
            });

            this.addEventListener(input, 'change', () => onChange(option.value));

            const icon = this.createElement('span', {
                className: 'option-icon'
            }, option.icon);

            const text = this.createElement('span', {
                className: 'option-label'
            }, option.label);

            label.appendChild(input);
            label.appendChild(icon);
            label.appendChild(text);
            group.appendChild(label);
        });

        return group;
    }

    createSelect({ options, value, onChange }) {
        const select = this.createElement('select', {
            className: 'select-input'
        });

        options.forEach(option => {
            const optionElement = this.createElement('option', {
                value: option.value
            }, option.label);

            select.appendChild(optionElement);
        });

        select.value = value;
        this.addEventListener(select, 'change', () => onChange(select.value));

        return select;
    }

    createCheckbox({ checked, onChange }) {
        const label = this.createElement('label', {
            className: 'checkbox-label'
        });

        const input = this.createElement('input', {
            type: 'checkbox',
            checked: checked
        });

        const slider = this.createElement('span', {
            className: 'checkbox-slider'
        });

        this.addEventListener(input, 'change', () => onChange(input.checked));

        label.appendChild(input);
        label.appendChild(slider);

        return label;
    }

    // 面板切换方法
    showPanel(category) {
        // 隐藏所有面板
        this.panels.forEach((panel, key) => {
            panel.style.display = 'none';
        });

        // 显示目标面板
        const targetPanel = this.panels.get(category);
        if (targetPanel) {
            targetPanel.style.display = 'block';
        }

        // 更新导航状态
        const navItems = this.element.querySelectorAll('.preferences-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-category') === category) {
                item.classList.add('active');
            }
        });

        this.currentCategory = category;
    }

    // 偏好设置操作方法
    updatePreference(key, value) {
        window.userPreferencesManager.set(key, value);
        this.trigger('preferenceChanged', { key, value });
    }

    resetPreferences() {
        if (confirm('确定要重置所有设置为默认值吗？此操作不可撤销。')) {
            window.userPreferencesManager.reset();
            this.showNotification('success', '设置已重置', '所有偏好设置已恢复为默认值');
            setTimeout(() => location.reload(), 1000);
        }
    }

    exportPreferences() {
        window.userPreferencesManager.export();
        this.showNotification('success', '导出成功', '偏好设置已导出到文件');
    }

    importPreferences() {
        const input = this.createElement('input', {
            type: 'file',
            accept: '.json'
        });

        this.addEventListener(input, 'change', (e) => {
            const file = e.target.files[0];
            if (file) {
                window.userPreferencesManager.import(file)
                    .then(() => {
                        this.showNotification('success', '导入成功', '偏好设置已成功导入');
                        setTimeout(() => location.reload(), 1000);
                    })
                    .catch(error => {
                        this.showNotification('error', '导入失败', error.message);
                    });
            }
        });

        input.click();
    }

    saveAndClose() {
        if (this.config.onSave) {
            this.config.onSave(window.userPreferencesManager.getAll());
        }
        this.close();
    }

    showNotification(type, title, message) {
        if (window.componentLibrary) {
            const notification = window.componentLibrary.create('notification', document.body, {
                type: type,
                title: title,
                message: message,
                duration: 3000
            });
            notification.show();
        }
    }

    show() {
        if (this.element) {
            this.element.style.display = 'block';
            document.body.classList.add('preferences-open');
            this.trigger('shown');
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            document.body.classList.remove('preferences-open');
            this.trigger('hidden');
        }
    }

    close() {
        this.hide();
    }

    // 工具方法
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// 注册组件到组件库
if (window.componentLibrary) {
    window.componentLibrary.register('preferences', PreferencesUIComponent);
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreferencesUIComponent;
}