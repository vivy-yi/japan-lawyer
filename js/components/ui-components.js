/**
 * UI Components - 用户界面组件实现
 * 安全、可复用的UI组件集合
 */

/**
 * 按钮组件
 */
class ButtonComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            text: 'Button',
            type: 'primary', // primary, secondary, danger, success
            size: 'medium', // small, medium, large
            disabled: false,
            icon: null,
            onClick: null
        };
    }

    render() {
        const button = this.createElement('button', {
            className: `component-button ${this.config.type}`,
            disabled: this.config.disabled
        });

        // 添加图标
        if (this.config.icon) {
            const icon = this.createElement('span', {
                className: 'component-button-icon'
            }, this.config.icon);
            button.appendChild(icon);
        }

        // 添加文本
        const text = this.createElement('span', {
            className: 'component-button-text'
        }, this.config.text);
        button.appendChild(text);

        this.element = button;

        // 绑定点击事件
        if (this.config.onClick) {
            this.addEventListener(button, 'click', (e) => {
                if (!this.config.disabled) {
                    this.config.onClick(e);
                }
            });
        }

        return button;
    }
}

/**
 * 卡片组件
 */
class CardComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            title: 'Card Title',
            content: 'Card content goes here.',
            footer: null,
            hover: true,
            shadow: true
        };
    }

    render() {
        const card = this.createElement('div', {
            className: `component-card ${this.config.hover ? 'hover' : ''} ${this.config.shadow ? 'shadow' : ''}`
        });

        // 卡片头部
        if (this.config.title) {
            const header = this.createElement('div', {
                className: 'component-card-header'
            });

            const title = this.createElement('h3', {
                className: 'component-card-title'
            }, this.config.title);

            header.appendChild(title);
            card.appendChild(header);
        }

        // 卡片内容
        const content = this.createElement('div', {
            className: 'component-card-content'
        }, this.config.content);
        card.appendChild(content);

        // 卡片底部
        if (this.config.footer) {
            const footer = this.createElement('div', {
                className: 'component-card-footer'
            }, this.config.footer);
            card.appendChild(footer);
        }

        this.element = card;
        return card;
    }
}

/**
 * 模态框组件
 */
class ModalComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            title: 'Modal Title',
            content: 'Modal content goes here.',
            footer: null,
            closeOnOverlay: true,
            showClose: true,
            width: '500px'
        };
    }

    render() {
        // 创建遮罩层
        const overlay = this.createElement('div', {
            className: 'component-modal-overlay'
        });

        // 创建模态框
        const modal = this.createElement('div', {
            className: 'component-modal',
            style: { maxWidth: this.config.width }
        });

        // 模态框头部
        const header = this.createElement('div', {
            className: 'component-modal-header'
        });

        const title = this.createElement('h2', {
            className: 'component-modal-title'
        }, this.config.title);

        header.appendChild(title);

        // 关闭按钮
        if (this.config.showClose) {
            const closeBtn = this.createElement('button', {
                className: 'component-modal-close'
            }, '×');

            this.addEventListener(closeBtn, 'click', () => this.close());
            header.appendChild(closeBtn);
        }

        modal.appendChild(header);

        // 模态框内容
        const body = this.createElement('div', {
            className: 'component-modal-body'
        }, this.config.content);
        modal.appendChild(body);

        // 模态框底部
        if (this.config.footer) {
            const footer = this.createElement('div', {
                className: 'component-modal-footer'
            }, this.config.footer);
            modal.appendChild(footer);
        }

        overlay.appendChild(modal);
        this.element = overlay;

        // 绑定遮罩层点击事件
        if (this.config.closeOnOverlay) {
            this.addEventListener(overlay, 'click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        return overlay;
    }

    show() {
        if (this.element) {
            this.element.classList.add('active');
            this.trigger('show');
        }
    }

    hide() {
        if (this.element) {
            this.element.classList.remove('active');
            this.trigger('hide');
        }
    }

    close() {
        this.hide();
    }
}

/**
 * 通知组件
 */
class NotificationComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            type: 'info', // success, error, warning, info
            title: 'Notification',
            message: 'Notification message',
            duration: 5000, // 0 表示不自动关闭
            closable: true
        };
    }

    render() {
        const notification = this.createElement('div', {
            className: `component-notification ${this.config.type}`
        });

        // 图标
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const icon = this.createElement('span', {
            className: 'component-notification-icon'
        }, iconMap[this.config.type] || iconMap.info);

        notification.appendChild(icon);

        // 内容区域
        const content = this.createElement('div', {
            className: 'component-notification-content'
        });

        const title = this.createElement('div', {
            className: 'component-notification-title'
        }, this.config.title);

        const message = this.createElement('div', {
            className: 'component-notification-message'
        }, this.config.message);

        content.appendChild(title);
        content.appendChild(message);
        notification.appendChild(content);

        // 关闭按钮
        if (this.config.closable) {
            const closeBtn = this.createElement('button', {
                className: 'component-notification-close'
            }, '×');

            this.addEventListener(closeBtn, 'click', () => this.hide());
            notification.appendChild(closeBtn);
        }

        this.element = notification;

        // 自动关闭
        if (this.config.duration > 0) {
            setTimeout(() => this.hide(), this.config.duration);
        }

        return notification;
    }

    show() {
        if (this.element) {
            document.body.appendChild(this.element);
            // 触发显示动画
            setTimeout(() => this.element.classList.add('show'), 10);
            this.trigger('show');
        }
    }

    hide() {
        if (this.element) {
            this.element.classList.remove('show');
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.trigger('hide');
            }, 300);
        }
    }
}

/**
 * 标签页组件
 */
class TabsComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            tabs: [
                { title: 'Tab 1', content: 'Content 1' },
                { title: 'Tab 2', content: 'Content 2' }
            ],
            activeTab: 0,
            onChange: null
        };
    }

    render() {
        const tabs = this.createElement('div', {
            className: 'component-tabs'
        });

        // 导航区域
        const nav = this.createElement('div', {
            className: 'component-tabs-nav'
        });

        // 内容区域
        const content = this.createElement('div', {
            className: 'component-tabs-content'
        });

        this.config.tabs.forEach((tab, index) => {
            // 标签按钮
            const tabButton = this.createElement('button', {
                className: `component-tabs-tab ${index === this.config.activeTab ? 'active' : ''}`,
                'data-tab': index
            }, tab.title);

            this.addEventListener(tabButton, 'click', () => this.setActiveTab(index));
            nav.appendChild(tabButton);

            // 内容面板
            const panel = this.createElement('div', {
                className: `component-tabs-panel ${index === this.config.activeTab ? 'active' : ''}`,
                'data-panel': index
            }, tab.content);

            content.appendChild(panel);
        });

        tabs.appendChild(nav);
        tabs.appendChild(content);

        this.element = tabs;
        return tabs;
    }

    setActiveTab(index) {
        if (index < 0 || index >= this.config.tabs.length) return;

        const previousTab = this.config.activeTab;
        this.config.activeTab = index;

        // 更新标签状态
        const tabButtons = this.element.querySelectorAll('.component-tabs-tab');
        const panels = this.element.querySelectorAll('.component-tabs-panel');

        tabButtons.forEach((button, i) => {
            button.classList.toggle('active', i === index);
        });

        panels.forEach((panel, i) => {
            panel.classList.toggle('active', i === index);
        });

        // 触发变化事件
        if (this.config.onChange) {
            this.config.onChange(index, previousTab);
        }

        this.trigger('tabChange', { activeTab: index, previousTab });
    }
}

/**
 * 下拉菜单组件
 */
class DropdownComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            trigger: 'Dropdown',
            items: [
                { label: 'Option 1', value: '1', onClick: null },
                { label: 'Option 2', value: '2', onClick: null }
            ],
            placement: 'bottom-start'
        };
    }

    render() {
        const dropdown = this.createElement('div', {
            className: 'component-dropdown'
        });

        // 触发按钮
        const toggle = this.createElement('button', {
            className: 'component-dropdown-toggle'
        }, [
            this.config.trigger,
            this.createElement('span', { className: 'component-dropdown-arrow' }, '▼')
        ]);

        this.addEventListener(toggle, 'click', () => this.toggle());
        dropdown.appendChild(toggle);

        // 菜单
        const menu = this.createElement('div', {
            className: 'component-dropdown-menu'
        });

        this.config.items.forEach((item, index) => {
            const menuItem = this.createElement('button', {
                className: 'component-dropdown-item',
                'data-value': item.value
            }, item.label);

            this.addEventListener(menuItem, 'click', (e) => {
                e.preventDefault();
                if (item.onClick) {
                    item.onClick(item.value, e);
                }
                this.hide();
                this.trigger('itemSelect', { item, value: item.value });
            });

            menu.appendChild(menuItem);
        });

        dropdown.appendChild(menu);
        this.element = dropdown;

        // 点击外部关闭
        this.addEventListener(document, 'click', (e) => {
            if (!dropdown.contains(e.target)) {
                this.hide();
            }
        });

        return dropdown;
    }

    show() {
        if (this.element) {
            this.element.classList.add('open');
            this.trigger('show');
        }
    }

    hide() {
        if (this.element) {
            this.element.classList.remove('open');
            this.trigger('hide');
        }
    }

    toggle() {
        if (this.element.classList.contains('open')) {
            this.hide();
        } else {
            this.show();
        }
    }
}

/**
 * 加载器组件
 */
class LoaderComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            text: 'Loading...',
            size: 'medium', // small, medium, large
            type: 'spinner' // spinner, dots, pulse
        };
    }

    render() {
        const loader = this.createElement('div', {
            className: `component-loader ${this.config.size}`
        });

        // 根据类型创建不同的加载动画
        let spinner;
        switch (this.config.type) {
            case 'dots':
                spinner = this.createElement('div', {
                    className: 'component-loader-dots'
                }, '...');
                break;
            case 'pulse':
                spinner = this.createElement('div', {
                    className: 'component-loader-pulse'
                }, '●');
                break;
            default:
                spinner = this.createElement('div', {
                    className: 'component-loader-spinner'
                });
        }

        loader.appendChild(spinner);

        if (this.config.text) {
            const text = this.createElement('span', {
                className: 'component-loader-text'
            }, this.config.text);
            loader.appendChild(text);
        }

        this.element = loader;
        return loader;
    }
}

/**
 * 表单组件
 */
class FormComponent extends BaseComponent {
    getDefaultConfig() {
        return {
            fields: [],
            onSubmit: null,
            submitText: 'Submit',
            resetText: 'Reset'
        };
    }

    render() {
        const form = this.createElement('form', {
            className: 'component-form'
        });

        this.config.fields.forEach((field, index) => {
            const fieldGroup = this.createField(field, index);
            form.appendChild(fieldGroup);
        });

        // 按钮组
        const buttonGroup = this.createElement('div', {
            className: 'component-form-buttons'
        });

        const submitBtn = this.createElement('button', {
            type: 'submit',
            className: 'component-button primary'
        }, this.config.submitText);

        const resetBtn = this.createElement('button', {
            type: 'reset',
            className: 'component-button secondary'
        }, this.config.resetText);

        buttonGroup.appendChild(submitBtn);
        buttonGroup.appendChild(resetBtn);
        form.appendChild(buttonGroup);

        this.element = form;

        // 绑定表单提交事件
        this.addEventListener(form, 'submit', (e) => {
            e.preventDefault();
            const formData = this.getFormData();
            if (this.config.onSubmit) {
                this.config.onSubmit(formData);
            }
            this.trigger('submit', { data: formData });
        });

        return form;
    }

    createField(field, index) {
        const fieldGroup = this.createElement('div', {
            className: 'component-form-group'
        });

        // 标签
        if (field.label) {
            const label = this.createElement('label', {
                className: 'component-form-label',
                htmlFor: `field-${index}`
            }, field.label);
            fieldGroup.appendChild(label);
        }

        // 输入控件
        let input;
        switch (field.type) {
            case 'textarea':
                input = this.createElement('textarea', {
                    className: 'component-form-input',
                    id: `field-${index}`,
                    name: field.name,
                    placeholder: field.placeholder,
                    required: field.required
                });
                break;
            case 'select':
                input = this.createElement('select', {
                    className: 'component-form-input',
                    id: `field-${index}`,
                    name: field.name,
                    required: field.required
                });

                if (field.options) {
                    field.options.forEach(option => {
                        const optionElement = this.createElement('option', {
                            value: option.value
                        }, option.label);
                        input.appendChild(optionElement);
                    });
                }
                break;
            default:
                input = this.createElement('input', {
                    className: 'component-form-input',
                    id: `field-${index}`,
                    type: field.type || 'text',
                    name: field.name,
                    placeholder: field.placeholder,
                    required: field.required
                });
        }

        fieldGroup.appendChild(input);

        // 帮助文本
        if (field.help) {
            const help = this.createElement('div', {
                className: 'component-form-help'
            }, field.help);
            fieldGroup.appendChild(help);
        }

        // 错误提示
        const error = this.createElement('div', {
            className: 'component-form-error',
            id: `error-${index}`
        });
        fieldGroup.appendChild(error);

        return fieldGroup;
    }

    getFormData() {
        const formData = {};
        const inputs = this.element.querySelectorAll('.component-form-input');

        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else {
                formData[input.name] = input.value;
            }
        });

        return formData;
    }

    setFieldValue(name, value) {
        const input = this.element.querySelector(`[name="${name}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
        }
    }

    getFieldValue(name) {
        const input = this.element.querySelector(`[name="${name}"]`);
        if (input) {
            return input.type === 'checkbox' ? input.checked : input.value;
        }
        return null;
    }

    showFieldError(name, message) {
        const input = this.element.querySelector(`[name="${name}"]`);
        if (input) {
            input.classList.add('error');
            const errorElement = input.parentElement.querySelector('.component-form-error');
            if (errorElement) {
                errorElement.textContent = message;
            }
        }
    }

    clearFieldError(name) {
        const input = this.element.querySelector(`[name="${name}"]`);
        if (input) {
            input.classList.remove('error');
            const errorElement = input.parentElement.querySelector('.component-form-error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }

    reset() {
        this.element.reset();
        this.element.querySelectorAll('.component-form-input').forEach(input => {
            input.classList.remove('error');
        });
        this.element.querySelectorAll('.component-form-error').forEach(error => {
            error.textContent = '';
        });
    }
}

// 导出所有组件
if (typeof window !== 'undefined') {
    window.ButtonComponent = ButtonComponent;
    window.CardComponent = CardComponent;
    window.ModalComponent = ModalComponent;
    window.NotificationComponent = NotificationComponent;
    window.TabsComponent = TabsComponent;
    window.DropdownComponent = DropdownComponent;
    window.LoaderComponent = LoaderComponent;
    window.FormComponent = FormComponent;
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ButtonComponent,
        CardComponent,
        ModalComponent,
        NotificationComponent,
        TabsComponent,
        DropdownComponent,
        LoaderComponent,
        FormComponent
    };
}