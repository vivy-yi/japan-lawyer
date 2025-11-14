// nav.js - Navigation control logic (Secure Version)
// Consolidated from nav-secure.js for single header architecture
// Prevents XSS attacks and implements proper security measures

// Import logger system
import('./core/logger.js').then(({ logger }) => {
    logger.info('🧭 Loading secure navigation system (single header mode)...', null, 'NAVIGATION');

    // 性能监控开始
    logger.startPerformanceMark('navigation-system-load');
}).catch(error => {
    console.warn('Failed to load logger system:', error);
    console.log('🧭 Loading secure navigation system (single header mode)...');
});

// Secure HTML escaping utility
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

// Validate and sanitize URLs
const sanitizeUrl = (url) => {
    try {
        const parsed = new URL(url, window.location.origin);
        // Only allow same-origin URLs
        if (parsed.origin !== window.location.origin) {
            console.warn('Blocked external URL:', url);
            return '#';
        }
        // Disallow javascript: protocol
        if (parsed.protocol === 'javascript:') {
            console.warn('Blocked javascript URL:', url);
            return '#';
        }
        return url;
    } catch (e) {
        console.warn('Invalid URL:', url);
        return '#';
    }
};

// Enhanced event cleanup system with WeakMap for better memory management
class SecureEventManager {
    constructor() {
        this.listeners = new WeakMap();
        this.globalListeners = [];
    }

    add(element, event, handler, options = {}) {
        // Validate handler is a function
        if (typeof handler !== 'function') {
            throw new Error('Event handler must be a function');
        }

        // Add listener
        element.addEventListener(event, handler, options);

        // Store reference for cleanup
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        this.listeners.get(element).push({ event, handler, options });
    }

    addGlobal(event, handler, options = {}) {
        if (typeof handler !== 'function') {
            throw new Error('Event handler must be a function');
        }
        document.addEventListener(event, handler, options);
        this.globalListeners.push({ event, handler, options });
    }

    cleanupElement(element) {
        const elementListeners = this.listeners.get(element);
        if (elementListeners) {
            elementListeners.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
            this.listeners.delete(element);
        }
    }

    cleanup() {
        // Clean global listeners
        this.globalListeners.forEach(({ event, handler, options }) => {
            document.removeEventListener(event, handler, options);
        });
        this.globalListeners = [];
    }
}

// Initialize secure event manager
const eventManager = new SecureEventManager();

// Secure language management class
class SecureLanguageManager {
    constructor() {
        this.supportedLanguages = ['zh', 'ja', 'en'];
        this.currentLanguage = this.getValidLanguage(localStorage.getItem('preferred-language'));
        this.init();
    }

    getValidLanguage(lang) {
        // 如果语言无效或为空，默认返回中文
        if (!lang || typeof lang !== 'string') {
            console.log('⚠️ 语言参数无效，使用默认中文');
            return 'zh';
        }

        lang = lang.trim().substring(0, 5); // Limit length

        if (this.supportedLanguages.includes(lang)) {
            return lang;
        } else {
            console.log(`⚠️ 不支持的语言: ${lang}，使用默认中文`);
            return 'zh';
        }
    }

    init() {
        console.log('🌐 Secure language manager initialized, current:', this.currentLanguage);

        // 确保与 simple-i18n 系统同步
        this.synchronizeWithI18n();

        this.updateLanguageDisplay();
        this.setupLanguageSwitcher();
    }

    // 同步与 simple-i18n 系统的语言状态
    synchronizeWithI18n() {
        // 如果 simple-i18n 可用，确保语言状态一致
        if (window.simpleI18n && window.simpleI18n.currentLanguage !== this.currentLanguage) {
            console.log(`🔄 Synchronizing language: ${this.currentLanguage} -> ${window.simpleI18n.currentLanguage}`);
            this.currentLanguage = window.simpleI18n.currentLanguage;
            // 保存到 localStorage
            localStorage.setItem('preferred-language', this.currentLanguage);
        }
    }

    updateLanguageDisplay() {
        // Hide all language versions
        document.querySelectorAll('.nav-text-zh, .nav-text-en, .nav-text-ja').forEach(element => {
            element.style.display = 'none';
        });

        // Show current language version
        const currentClass = `.nav-text-${this.currentLanguage}`;
        document.querySelectorAll(currentClass).forEach(element => {
            element.style.display = 'inline';
        });

        // Update language dropdown display
        const currentLangSpan = document.querySelector('.current-lang');
        const langOptions = document.querySelectorAll('.lang-option');

        if (currentLangSpan) {
            const langNames = {
                'zh': '中',
                'ja': '日',
                'en': 'EN'
            };
            currentLangSpan.textContent = langNames[this.currentLanguage] || '中';
        }

        // 更新语言选项的视觉反馈
        langOptions.forEach(option => {
            const optionLang = option.getAttribute('data-lang');
            if (optionLang === this.currentLanguage) {
                option.style.background = 'rgba(30, 58, 95, 0.1)';
                option.style.fontWeight = '600';
            } else {
                option.style.background = 'none';
                option.style.fontWeight = '500';
            }
        });

        // 保留旧的语言按钮状态（以防同时存在）
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === this.currentLanguage) {
                btn.classList.add('active');
            }
        });

        // Update page title
        this.updatePageTitle();
    }

    updatePageTitle() {
        const titles = {
            'zh': '日本商务通 - 一站式日本商业服务平台',
            'ja': '日本ビジネスハブ - 一站式日本商业服务平台',
            'en': 'Japan Business Hub - One-stop Japan Business Platform'
        };

        const safeTitle = escapeHtml(titles[this.currentLanguage] || titles['zh']);
        document.title = safeTitle;
    }

    setupLanguageSwitcher() {
        const langToggle = document.getElementById('language-toggle');
        const langOptions = document.querySelectorAll('.lang-option');
        const langDropdown = document.querySelector('.language-dropdown');

        if (!langToggle || langOptions.length === 0) {
            console.warn('Language dropdown elements not found');
            return;
        }

        // 检查是否已经有事件监听器
        if (langToggle.hasAttribute('data-listeners-added')) {
            console.log('🔄 Language switcher listeners already exist');
            this.updateLanguageDisplay(); // 只更新状态
            return;
        }

        // 切换下拉菜单
        eventManager.add(langToggle, 'click', (e) => {
            e.preventDefault();
            const isExpanded = langToggle.getAttribute('aria-expanded') === 'true';
            langToggle.setAttribute('aria-expanded', (!isExpanded).toString());
            langDropdown.setAttribute('aria-expanded', (!isExpanded).toString());
        });

        // 语言选项点击
        langOptions.forEach(option => {
            eventManager.add(option, 'click', (e) => {
                e.preventDefault();
                const newLang = this.getValidLanguage(option.getAttribute('data-lang'));
                if (newLang && newLang !== this.currentLanguage) {
                    this.switchLanguage(newLang);
                    // 关闭下拉菜单
                    langToggle.setAttribute('aria-expanded', 'false');
                    langDropdown.setAttribute('aria-expanded', 'false');
                }
            });

            // 键盘导航
            eventManager.add(option, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });

        // 点击外部关闭下拉菜单
        eventManager.add(document, 'click', (e) => {
            if (!langDropdown.contains(e.target)) {
                langToggle.setAttribute('aria-expanded', 'false');
                langDropdown.setAttribute('aria-expanded', 'false');
            }
        });

        // 键盘导航支持
        eventManager.add(langToggle, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                langToggle.click();
                // 焦点移动到第一个选项
                if (langOptions.length > 0) {
                    langOptions[0].focus();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                langToggle.setAttribute('aria-expanded', 'false');
                langDropdown.setAttribute('aria-expanded', 'false');
            }
        });

        // 语言选项键盘导航
        langOptions.forEach((option, index) => {
            eventManager.add(option, 'keydown', (e) => {
                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        option.click();
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextIndex = (index + 1) % langOptions.length;
                        langOptions[nextIndex].focus();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevIndex = (index - 1 + langOptions.length) % langOptions.length;
                        langOptions[prevIndex].focus();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        langToggle.setAttribute('aria-expanded', 'false');
                        langDropdown.setAttribute('aria-expanded', 'false');
                        langToggle.focus();
                        break;
                }
            });
        });

        // 标记已经添加了监听器
        langToggle.setAttribute('data-listeners-added', 'true');

        // 设置初始状态
        this.updateLanguageDisplay();
        console.log('🌐 Language dropdown switcher setup completed');
    }

    switchLanguage(lang) {
        lang = this.getValidLanguage(lang);
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        const oldLang = this.currentLanguage;

        // 1. 立即更新当前语言
        this.currentLanguage = lang;

        // 2. 立即保存到本地存储
        try {
            localStorage.setItem('preferred-language', lang);
            console.log(`💾 导航系统已保存语言: ${oldLang} -> ${lang}`);
        } catch (error) {
            console.error('❌ 导航系统保存语言失败:', error);
        }

        // 3. 更新语言显示
        this.updateLanguageDisplay();

        // 4. 使用简单的本地翻译系统（直接调用内部函数避免递归）
        if (window.simpleI18n && window.simpleI18n.switchLanguage) {
            window.simpleI18n.switchLanguage(lang);
        } else if (window.navigationController && window.navigationController.updateNavigationLanguage) {
            window.navigationController.updateNavigationLanguage(lang);
        }

        console.log(`🌐 Language switched to: ${lang}`);

        // Trigger language change event
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang }
        });
        window.dispatchEvent(event);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Secure mobile menu management
class SecureMobileMenuManager {
    constructor() {
        this.isMenuOpen = false;
        this.menuTransitionTimer = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.init();
    }

    init() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.nav-menu');

        if (toggle && menu) {
            eventManager.add(toggle, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });

            // Click outside to close menu
            eventManager.add(document, 'click', (e) => {
                if (this.isMenuOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
                    this.closeMenu();
                }
            });

            // ESC key to close menu
            eventManager.add(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMenu();
                }
            });

            // Prevent focus trap issues
            eventManager.add(menu, 'keydown', (e) => {
                if (e.key === 'Tab') {
                    // Implement focus trapping logic
                    this.handleFocusTrap(e, menu);
                }
            });

            // Add touch gesture support
            this.setupTouchGestures();
        }
    }

    setupTouchGestures() {
        // Touch start
        eventManager.addGlobal('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        // Touch end
        eventManager.addGlobal('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;
            this.handleSwipeGesture();
        }, { passive: true });
    }

    handleSwipeGesture() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = Math.abs(this.touchEndY - this.touchStartY);

        // Only handle horizontal swipes
        if (Math.abs(deltaX) > this.minSwipeDistance && deltaY < 100) {
            if (deltaX > 0) {
                // Swipe right - open menu
                if (!this.isMenuOpen && this.touchStartX < 50) {
                    // Only if swipe starts from left edge
                    this.openMenu();
                }
            } else {
                // Swipe left - close menu
                if (this.isMenuOpen) {
                    this.closeMenu();
                }
            }
        }
    }

    handleFocusTrap(e, menu) {
        const focusableElements = menu.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.nav-menu');

        if (toggle) {
            toggle.classList.toggle('active', this.isMenuOpen);
            toggle.setAttribute('aria-expanded', this.isMenuOpen);
        }

        if (menu) {
            menu.classList.toggle('active', this.isMenuOpen);
            menu.setAttribute('aria-hidden', !this.isMenuOpen);
        }

        // Prevent page scroll
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';

        // Clear any existing timer
        if (this.menuTransitionTimer) {
            clearTimeout(this.menuTransitionTimer);
        }

        // Set timer for cleanup
        if (!this.isMenuOpen) {
            this.menuTransitionTimer = setTimeout(() => {
                // Cleanup after transition
            }, 300);
        }

        // 发送移动菜单切换事件
        const event = new CustomEvent('mobileMenuToggled', {
            detail: {
                isOpen: this.isMenuOpen,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);

        console.log(`Mobile menu ${this.isMenuOpen ? 'opened' : 'closed'}`);
    }

    openMenu() {
        if (!this.isMenuOpen) {
            this.isMenuOpen = true;
            const toggle = document.querySelector('.mobile-menu-toggle');
            const menu = document.querySelector('.nav-menu');

            if (toggle) {
                toggle.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
            }

            if (menu) {
                menu.classList.add('active');
                menu.setAttribute('aria-hidden', 'false');
            }

            document.body.style.overflow = 'hidden';

            console.log('Mobile menu opened via gesture');
        }
    }

    closeMenu() {
        if (this.isMenuOpen) {
            this.isMenuOpen = false;
            const toggle = document.querySelector('.mobile-menu-toggle');
            const menu = document.querySelector('.nav-menu');

            if (toggle) {
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }

            if (menu) {
                menu.classList.remove('active');
                menu.setAttribute('aria-hidden', 'true');
            }

            document.body.style.overflow = '';
        }
    }
}

// Secure navigation state management
class SecureNavigationStateManager {
    constructor() {
        this.currentPage = this.getCurrentPageFromHash();
        this.pageTransitionTimer = null;
        this.init();
    }

    init() {
        this.updateActiveNavigation();
        this.setupNavigationHandlers();
        this.initializeNavbarState();
        this.setupScrollEffects();
    }

    getCurrentPageFromHash() {
        const hash = window.location.hash.slice(1);
        // Validate hash
        if (!hash || typeof hash !== 'string') return 'home';
        // Allow only alphanumeric characters and hyphens
        if (!/^[a-zA-Z0-9-]+$/.test(hash)) {
            console.warn('Invalid page hash:', hash);
            return 'home';
        }
        return hash;
    }

    updateActiveNavigation() {
        // Clear all active states
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
        });

        // Set current active link
        const currentPage = this.getCurrentPageFromHash();
        const activeLink = document.querySelector(`[data-page="${currentPage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }
    }

    initializeNavbarState() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            // 设置初始状态为可见
            navbar.classList.add('navbar-visible');
            navbar.classList.remove('navbar-hidden');

            // 如果页面已经滚动，设置scrolled状态
            if (window.scrollY > 10) {
                navbar.classList.add('navbar-scrolled');
            }

            console.log('🎯 Initial navbar state set:', {
                visible: navbar.classList.contains('navbar-visible'),
                hidden: navbar.classList.contains('navbar-hidden'),
                scrolled: navbar.classList.contains('navbar-scrolled'),
                scrollY: window.scrollY
            });
        }
    }

    setupNavigationHandlers() {
        // 注意：这个方法现在被setupNavigationEventListeners替代
        // 保留这个方法是为了向后兼容，但不添加重复的事件监听器
        console.log('🔄 Navigation handlers method called - delegating to setupNavigationEventListeners');

        // 委托给控制器的setupNavigationEventListeners方法
        if (window.navigationController && typeof window.navigationController.setupNavigationEventListeners === 'function') {
            window.navigationController.setupNavigationEventListeners();
        }

        // Monitor browser history
        const eventManager = this.eventManager || window.secureEventManager;
        if (eventManager) {
            eventManager.addGlobal('popstate', () => {
                const newPage = this.getCurrentPageFromHash();
                if (newPage !== this.currentPage) {
                    this.currentPage = newPage;
                    this.updateActiveNavigation();
                }
            });
        }
    }

    setupInPageNavigation() {
        // Handle in-page anchor navigation
        const eventManager = this.eventManager || window.secureEventManager;
        if (eventManager) {
            document.querySelectorAll('[data-nav-target]').forEach(link => {
                eventManager.add(link, 'click', (e) => {
                    e.preventDefault();
                    const target = e.target.closest('[data-nav-target]').getAttribute('data-nav-target');
                    if (target && target.startsWith('#')) {
                        this.scrollToSection(target.substring(1));
                    }
                });
            });
        }
    }

    navigateToPage(page) {
        // Validate page
        if (!page || typeof page !== 'string' || !/^[a-zA-Z0-9-]+$/.test(page)) {
            console.warn('Invalid page navigation:', page);
            return false;
        }

        if (page === this.currentPage) return true;

        this.currentPage = page;

        // Special handling for "home" page - return to index.html
        if (page === 'home') {
            console.log(`🏠 Navigating to home page (index.html)`);
            try {
                // Clear any hash and reload to main page
                window.location.hash = '';
                window.location.reload();
                return true;
            } catch (e) {
                console.error('Failed to navigate to home:', e);
                return false;
            }
        }

        // Update navigation state only - let SPA router handle URL and page loading
        this.updateActiveNavigation();

        // Delegate to SPA router for actual page loading
        if (window.spaRouter && typeof window.spaRouter.loadPage === 'function') {
            console.log(`🧭 Delegating navigation to SPA router: ${page}`);
            return window.spaRouter.loadPage(page);
        }

        // Fallback: just update URL hash
        try {
            history.pushState({ page: page }, '', `#${page}`);
        } catch (e) {
            console.error('Failed to update history:', e);
            return false;
        }

        // Close mobile menu
        if (window.mobileMenuManager) {
            window.mobileMenuManager.closeMenu();
        }

        console.log(`🧭 Navigation state updated: ${page}`);
        return true;
    }

    scrollToSection(sectionId) {
        // Validate section ID
        if (!sectionId || typeof sectionId !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(sectionId)) {
            console.warn('Invalid section ID:', sectionId);
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            // Check if element has proper accessibility attributes
            if (!element.getAttribute('tabindex')) {
                element.setAttribute('tabindex', '-1');
            }

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Focus element for accessibility
            setTimeout(() => element.focus(), 1000);
        }

        // Close mobile menu
        if (window.mobileMenuManager) {
            window.mobileMenuManager.closeMenu();
        }

        console.log(`📍 Scrolled to section: ${sectionId}`);
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        let scrollTimer = null;
        let isAtTop = window.scrollY <= 10;
        let isAtBottom = false;

        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            const navbar = document.querySelector('.navbar');

            if (!navbar) return;

            // 计算滚动方向
            const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            const scrollDelta = Math.abs(currentScrollY - lastScrollY);

            // 边界检测
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const atTop = currentScrollY <= 10;
            const atBottom = currentScrollY >= documentHeight - windowHeight - 50;

            // 只在有意义滚动时更新（避免微小抖动）
            if (scrollDelta > 2) {
                // 顶部强制显示导航栏
                if (atTop) {
                    navbar.classList.add('navbar-visible');
                    navbar.classList.remove('navbar-hidden');
                    isAtTop = true;
                }
                // 底部强制显示导航栏
                else if (atBottom) {
                    navbar.classList.add('navbar-visible');
                    navbar.classList.remove('navbar-hidden');
                    isAtBottom = true;
                }
                // 中间区域根据滚动方向隐藏/显示
                else {
                    isAtTop = false;
                    isAtBottom = false;

                    // 检查移动端菜单是否打开，如果打开则不隐藏导航栏
                    const mobileMenuOpen = navbar.querySelector('.nav-menu.active');
                    const canHide = !mobileMenuOpen;

                    if (scrollDirection === 'down' && currentScrollY > 100 && canHide) {
                        // 向下滚动且超过100px时隐藏（仅在移动菜单关闭时）
                        navbar.classList.add('navbar-hidden');
                        navbar.classList.remove('navbar-visible');
                    } else if (scrollDirection === 'up') {
                        // 向上滚动时显示
                        navbar.classList.add('navbar-visible');
                        navbar.classList.remove('navbar-hidden');
                    }
                }

                // 滚动阴影效果
                if (currentScrollY > 10) {
                    navbar.classList.add('navbar-scrolled');
                } else {
                    navbar.classList.remove('navbar-scrolled');
                }

                // console.log(`📜 Scroll ${scrollDirection}: hidden=${navbar.classList.contains('navbar-hidden')}, scrollY=${currentScrollY}`); // 减少日志输出
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        // 优化的滚动处理器
        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }

            // 清除现有定时器
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }

            // 设置滚动结束检测
            scrollTimer = setTimeout(() => {
                // 滚动结束后的最终状态确保
                const navbar = document.querySelector('.navbar');
                if (navbar && window.scrollY <= 10) {
                    navbar.classList.add('navbar-visible');
                    navbar.classList.remove('navbar-hidden');
                }
            }, 150);
        };

        eventManager.addGlobal('scroll', scrollHandler, { passive: true });

        console.log('📜 Scroll effects initialized with hide/show behavior');
    }
}

// Secure dropdown management
class SecureDropdownManager {
    constructor() {
        this.currentOpenDropdown = null;
        this.init();
    }

    init() {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (toggle && menu) {
                // Mouse events
                eventManager.add(dropdown, 'mouseenter', () => {
                    this.openDropdown(dropdown);
                });

                eventManager.add(dropdown, 'mouseleave', () => {
                    this.closeDropdown(dropdown);
                });

                // Keyboard navigation
                eventManager.add(toggle, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleDropdown(dropdown);
                    } else if (e.key === 'Escape') {
                        this.closeDropdown(dropdown);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        this.focusFirstMenuItem(menu);
                    }
                });

                // Menu keyboard navigation
                eventManager.add(menu, 'keydown', (e) => {
                    this.handleMenuKeyNavigation(e, menu);
                });
            }
        });

        // Click outside to close
        eventManager.addGlobal('click', (e) => {
            if (this.currentOpenDropdown && !this.currentOpenDropdown.contains(e.target)) {
                this.closeDropdown(this.currentOpenDropdown);
            }
        });
    }

    handleMenuKeyNavigation(e, menu) {
        const items = menu.querySelectorAll('[role="menuitem"]');
        const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            items[prevIndex].focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.closeDropdown(this.openDropdown);
            const toggle = this.openDropdown.querySelector('.dropdown-toggle');
            if (toggle) toggle.focus();
        }
    }

    focusFirstMenuItem(menu) {
        const firstItem = menu.querySelector('[role="menuitem"]');
        if (firstItem) {
            firstItem.focus();
        }
    }

    toggleDropdown(dropdown) {
        if (dropdown.classList.contains('dropdown-open')) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }

    openDropdown(dropdown) {
        // Close any open dropdown
        if (this.currentOpenDropdown && this.currentOpenDropdown !== dropdown) {
            this.closeDropdown(this.currentOpenDropdown);
        }

        this.currentOpenDropdown = dropdown;
        dropdown.classList.add('dropdown-open');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.setAttribute('aria-hidden', 'false');
        }
    }

    closeDropdown(dropdown) {
        if (dropdown) {
            dropdown.classList.remove('dropdown-open');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.setAttribute('aria-hidden', 'true');
            }
            if (this.currentOpenDropdown === dropdown) {
                this.currentOpenDropdown = null;
            }
        }
    }
}

// Secure Navigation Template Renderer - 安全的导航栏模板渲染器
class SecureNavigationRenderer {
    constructor() {
        this.navigationData = null;
        this.currentLanguage = 'zh';
        this.isRendered = false;
    }

    // 获取导航栏数据配置
    getNavigationData() {
        return {
            logo: {
                text: {
                    zh: '日本商务通',
                    ja: '日本ビジネスハブ',
                    en: 'Japan Business Hub'
                },
                icon: '🏢',
                href: '#home'
            },
            mainNav: [
                {
                    id: 'nav-home',
                    page: 'home',
                    text: {
                        zh: '首页',
                        ja: 'ホーム',
                        en: 'Home'
                    },
                    icon: '🏠',
                    description: {
                        zh: '回到主页',
                        ja: 'ホームページ',
                        en: 'Back to Homepage'
                    }
                },
                {
                    id: 'nav-ai-architecture',
                    page: 'ai-architecture',
                    text: {
                        zh: 'AI架构',
                        ja: 'AIアーキテクチャ',
                        en: 'AI Architecture'
                    },
                    icon: '🧠',
                    description: {
                        zh: 'AI技术架构全景图',
                        ja: 'AI技術アーキテクチャ全景図',
                        en: 'AI Technology Architecture Overview'
                    }
                },
                {
                    id: 'nav-ailegal',
                    page: 'ailegal',
                    text: {
                        zh: 'AI法律服务',
                        ja: 'AI法務サービス',
                        en: 'AI Legal Services'
                    },
                    icon: '⚖️',
                    description: {
                        zh: '智能化法律解决方案',
                        ja: 'インテリジェント法務ソリューション',
                        en: 'Intelligent Legal Solutions'
                    }
                },
                {
                    id: 'nav-aicrm',
                    page: 'aicrm',
                    text: {
                        zh: 'AI CRM系统',
                        ja: 'AI CRMシステム',
                        en: 'AI CRM System'
                    },
                    icon: '📊',
                    description: {
                        zh: '智能客户关系管理',
                        ja: 'インテリジェント顧客関係管理',
                        en: 'Intelligent Customer Management'
                    }
                },
                {
                    id: 'nav-knowledge',
                    page: 'knowledge',
                    text: {
                        zh: '知识库',
                        ja: 'ナレッジベース',
                        en: 'Knowledge Base'
                    },
                    icon: '📚',
                    description: {
                        zh: '专业知识分享平台',
                        ja: '専門知識共有プラットフォーム',
                        en: 'Professional Knowledge Platform'
                    }
                },
                {
                    id: 'nav-professionals',
                    page: 'professionals',
                    text: {
                        zh: '专业人才',
                        ja: '専門人材',
                        en: 'Professionals'
                    },
                    icon: '👥',
                    description: {
                        zh: '连接专业人才网络',
                        ja: '専門人材ネットワーク接続',
                        en: 'Connect Professional Network'
                    }
                }
            ],
            services: [
                {
                    id: 'nav-services',
                    text: {
                        zh: '更多服务',
                        ja: 'その他サービス',
                        en: 'More Services'
                    },
                    icon: '🔧',
                    dropdown: [
                        {
                            id: 'nav-pet',
                            page: 'pet',
                            text: {
                                zh: '宠物帮帮忙',
                                ja: 'ペットサービス',
                                en: 'Pet Services'
                            },
                            icon: '🐕'
                        },
                        {
                            id: 'nav-lifestyle',
                            page: 'lifestyle',
                            text: {
                                zh: '生活帮帮忙',
                                ja: 'ライフヘルプ',
                                en: 'Lifestyle Help'
                            },
                            icon: '🏠'
                        },
                        {
                            id: 'nav-education',
                            page: 'education',
                            text: {
                                zh: '出国留学',
                                ja: '留学教育',
                                en: 'Education'
                            },
                            icon: '🎓'
                        },
                        {
                            id: 'nav-labor',
                            page: 'labor',
                            text: {
                                zh: '国外务工',
                                ja: '労働派遣',
                                en: 'Labor Services'
                            },
                            icon: '💼'
                        },
                        {
                            id: 'nav-tourism',
                            page: 'tourism',
                            text: {
                                zh: '国外旅游',
                                ja: '観光サービス',
                                en: 'Tourism'
                            },
                            icon: '✈️'
                        },
                        {
                            id: 'nav-community',
                            page: 'community',
                            text: {
                                zh: '社群网络',
                                ja: 'コミュニティ',
                                en: 'Community'
                            },
                            icon: '🌐'
                        }
                    ]
                }
            ]
        };
    }

    // 安全地创建DOM元素
    createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);

        // 设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('data-') || key === 'id' || key === 'href') {
                element.setAttribute(key, escapeHtml(value));
            } else {
                element[key] = value;
            }
        });

        // 安全地设置文本内容
        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    }

    // 渲染Logo
    renderLogo(logoData) {
        const logoLink = this.createElement('a', {
            href: logoData.href,
            className: 'logo',
            'data-page': 'home',
            'aria-label': logoData.text[this.currentLanguage]
        });

        const logoIcon = this.createElement('div', {
            className: 'logo-icon'
        }, logoData.icon);

        const logoText = this.createElement('span', {
            className: 'logo-text'
        }, logoData.text[this.currentLanguage]);

        logoLink.appendChild(logoIcon);
        logoLink.appendChild(logoText);

        return logoLink;
    }

    // 渲染主导航项
    renderMainNavItem(navItem, index = 0) {
        const li = this.createElement('li');

        // 特殊处理AI架构页面，使用直接链接而不是SPA导航
        const isExternalPage = navItem.page === 'ai-architecture';
        const linkHref = isExternalPage ? 'ai-architecture.html' : `#${navItem.page}`;

        const link = this.createElement('a', {
            href: linkHref,
            'data-page': navItem.page,
            'role': 'menuitem',
            'aria-label': `${navItem.text[this.currentLanguage]} - ${navItem.description[this.currentLanguage]}`,
            'title': navItem.description[this.currentLanguage],
            'tabindex': index === 0 ? '0' : '-1'
        });

        // 如果是外部页面，添加特殊样式和属性
        if (isExternalPage) {
            link.setAttribute('target', '_self');
            link.setAttribute('data-external-page', 'true');
        }

        const icon = this.createElement('span', {
            className: 'nav-icon',
            'aria-hidden': 'true'
        }, navItem.icon);

        const text = this.createElement('span', {
            className: 'nav-text'
        }, navItem.text[this.currentLanguage]);

        link.appendChild(icon);
        link.appendChild(text);
        li.appendChild(link);

        return li;
    }

    // 渲染下拉菜单
    renderDropdown(dropdownData) {
        const li = this.createElement('li', {
            className: 'dropdown'
        });

        const toggle = this.createElement('button', {
            className: 'dropdown-toggle',
            'aria-haspopup': 'true',
            'aria-expanded': 'false',
            'aria-label': dropdownData.text[this.currentLanguage]
        });

        const icon = this.createElement('span', {
            className: 'nav-icon'
        }, dropdownData.icon);

        const text = this.createElement('span', {
            className: 'nav-text'
        }, dropdownData.text[this.currentLanguage]);

        const arrow = this.createElement('span', {
            className: 'dropdown-arrow'
        });

        toggle.appendChild(icon);
        toggle.appendChild(text);
        toggle.appendChild(arrow);

        const menu = this.createElement('ul', {
            className: 'dropdown-menu',
            'role': 'menu',
            'aria-hidden': 'true'
        });

        dropdownData.dropdown.forEach(item => {
            const itemLi = this.createElement('li', {
                'role': 'menuitem'
            });

            const itemLink = this.createElement('a', {
                href: `#${item.page}`,
                'data-page': item.page,
                'role': 'menuitem'
            });

            const itemIcon = this.createElement('span', {
                className: 'nav-icon'
            }, item.icon);

            const itemText = this.createElement('span', {
                className: 'nav-text'
            }, item.text[this.currentLanguage]);

            itemLink.appendChild(itemIcon);
            itemLink.appendChild(itemText);
            itemLi.appendChild(itemLink);
            menu.appendChild(itemLi);
        });

        li.appendChild(toggle);
        li.appendChild(menu);

        return li;
    }

    // 渲染语言切换器
    renderLanguageSwitcher() {
        const switcher = this.createElement('div', {
            className: 'language-switcher',
            'role': 'group',
            'aria-label': '语言选择 Language Selection'
        });

        const languages = [
            { code: 'zh', text: '中', label: '中文' },
            { code: 'ja', text: '日', label: '日本語' },
            { code: 'en', text: 'EN', label: 'English' }
        ];

        languages.forEach(lang => {
            const button = this.createElement('button', {
                className: `lang-btn ${lang.code === this.currentLanguage ? 'active' : ''}`,
                'data-lang': lang.code,
                'aria-label': lang.label,
                'aria-pressed': lang.code === this.currentLanguage ? 'true' : 'false'
            }, lang.text);

            switcher.appendChild(button);
        });

        return switcher;
    }

    // 渲染移动端菜单切换按钮
    renderMobileToggle() {
        const toggle = this.createElement('button', {
            className: 'mobile-menu-toggle',
            'aria-label': '切换导航菜单',
            'aria-expanded': 'false',
            'aria-controls': 'main-nav-menu'
        });

        for (let i = 0; i < 3; i++) {
            const span = this.createElement('span', {
                'aria-hidden': 'true'
            });
            toggle.appendChild(span);
        }

        return toggle;
    }

    // 渲染完整导航栏
    renderNavigation(language = 'zh') {
        this.currentLanguage = language;
        this.navigationData = this.getNavigationData();

        console.log('📝 Rendering navigation with language:', language);
        console.log('📝 Navigation data:', this.navigationData);

        // 创建导航栏容器
        const navbar = this.createElement('nav', {
            className: 'navbar',
            'role': 'navigation',
            'aria-label': '主导航'
        });

        // 创建Logo
        const logo = this.renderLogo(this.navigationData.logo);

        // 创建主导航菜单
        const mainNav = this.createElement('ul', {
            className: 'nav-menu',
            id: 'main-nav-menu',
            'role': 'menubar'
        });

        // 渲染主导航项
        this.navigationData.mainNav.forEach((item, index) => {
            mainNav.appendChild(this.renderMainNavItem(item, index));
        });

        // 渲染下拉菜单
        this.navigationData.services.forEach(item => {
            mainNav.appendChild(this.renderDropdown(item));
        });

        // 渲染语言切换器
        const languageSwitcher = this.renderLanguageSwitcher();

        // 渲染移动端切换按钮
        const mobileToggle = this.renderMobileToggle();

        // 组装导航栏
        navbar.appendChild(logo);
        navbar.appendChild(mainNav);
        navbar.appendChild(languageSwitcher);
        navbar.appendChild(mobileToggle);

        this.isRendered = true;
        console.log('✅ Navigation rendered successfully');
        console.log('📝 Navbar element:', navbar);

        return navbar;
    }

    // 更新语言
    updateLanguage(newLanguage) {
        if (this.currentLanguage === newLanguage) return;

        this.currentLanguage = newLanguage;
        if (this.isRendered) {
            // 重新渲染导航栏
            const navbar = document.getElementById('main-navbar');
            if (navbar) {
                const newNavbar = this.renderNavigation(newLanguage);
                navbar.innerHTML = '';
                navbar.appendChild(newNavbar);
            }
        }
    }
}

// Dynamic Navigation Content Loader - 动态导航内容加载器
class DynamicNavigationLoader {
    constructor() {
        this.contentCache = new Map();
        this.loadPromises = new Map();
        this.updateCallbacks = [];
    }

    // 动态获取导航栏配置
    async fetchNavigationConfig() {
        try {
            // 这里可以从API获取配置，目前使用本地配置
            const config = {
                userPermissions: await this.getUserPermissions(),
                navigationItems: await this.getNavigationItems(),
                languageSettings: await this.getLanguageSettings(),
                featureFlags: await this.getFeatureFlags()
            };

            return config;
        } catch (error) {
            console.warn('Failed to fetch navigation config:', error);
            return this.getDefaultConfig();
        }
    }

    // 获取用户权限（模拟）
    async getUserPermissions() {
        // 在实际应用中，这里会调用API
        return {
            canAccessLegal: true,
            canAccessCRM: true,
            canAccessAdmin: false,
            canAccessPremium: localStorage.getItem('user_premium') === 'true'
        };
    }

    // 获取导航项目（模拟API调用）
    async getNavigationItems() {
        const cacheKey = 'nav_items';
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }

        if (this.loadPromises.has(cacheKey)) {
            return await this.loadPromises.get(cacheKey);
        }

        const loadPromise = this.simulateAPICall('navigation-items');
        this.loadPromises.set(cacheKey, loadPromise);

        try {
            const items = await loadPromise;
            this.contentCache.set(cacheKey, items);
            return items;
        } finally {
            this.loadPromises.delete(cacheKey);
        }
    }

    // 模拟API调用
    async simulateAPICall(endpoint, delay = 500) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockData = {
                    'navigation-items': {
                        featured: [
                            {
                                id: 'nav-dashboard',
                                page: 'dashboard',
                                text: {
                                    zh: '控制台',
                                    ja: 'ダッシュボード',
                                    en: 'Dashboard'
                                },
                                icon: '📈',
                                badge: 'new',
                                requiresAuth: true
                            },
                            {
                                id: 'nav-premium',
                                page: 'premium',
                                text: {
                                    zh: '高级功能',
                                    ja: 'プレミアム機能',
                                    en: 'Premium Features'
                                },
                                icon: '⭐',
                                badge: 'pro',
                                requiresPremium: true
                            }
                        ],
                        contextual: []
                    },
                    'user-preferences': {
                        theme: 'auto',
                        language: 'zh',
        ကြော်ငြာ: false,
                        compact: false
                    },
                    'feature-flags': {
                        beta_features: true,
                        new_ui: true,
                        ai_search: true
                    }
                };
                resolve(mockData[endpoint] || {});
            }, delay);
        });
    }

    // 获取语言设置
    async getLanguageSettings() {
        const savedLang = localStorage.getItem('preferred-language') || 'zh';
        return {
            current: savedLang,
            available: ['zh', 'ja', 'en'],
            autoDetect: true
        };
    }

    // 获取功能开关
    async getFeatureFlags() {
        return {
            betaFeatures: true,
            newNavigation: true,
            enhancedSearch: true,
            premiumFeatures: localStorage.getItem('user_premium') === 'true'
        };
    }

    // 获取默认配置
    getDefaultConfig() {
        return {
            userPermissions: {
                canAccessLegal: true,
                canAccessCRM: true,
                canAccessAdmin: false,
                canAccessPremium: false
            },
            navigationItems: {
                featured: [],
                contextual: []
            },
            languageSettings: {
                current: 'zh',
                available: ['zh', 'ja', 'en'],
                autoDetect: false
            },
            featureFlags: {
                betaFeatures: false,
                newNavigation: true,
                enhancedSearch: false,
                premiumFeatures: false
            }
        };
    }

    // 根据权限过滤导航项
    filterNavigationByPermissions(items, permissions) {
        return items.filter(item => {
            if (item.requiresAuth && !permissions.canAccessLegal) return false;
            if (item.requiresAdmin && !permissions.canAccessAdmin) return false;
            if (item.requiresPremium && !permissions.canAccessPremium) return false;
            return true;
        });
    }

    // 根据功能开关过滤导航项
    filterNavigationByFlags(items, flags) {
        return items.filter(item => {
            if (item.beta && !flags.betaFeatures) return false;
            if (item.premium && !flags.premiumFeatures) return false;
            return true;
        });
    }

    // 获取上下文导航项
    async getContextualItems(currentPage, userContext) {
        try {
            const baseItems = await this.getNavigationItems();

            // 根据当前页面提供相关的导航项
            const contextualMap = {
                'ailegal': [
                    {
                        id: 'nav-legal-docs',
                        text: { zh: '法律文档', ja: '法律文書', en: 'Legal Documents' },
                        icon: '📄',
                        href: '#legal-docs'
                    }
                ],
                'aicrm': [
                    {
                        id: 'nav-crm-analytics',
                        text: { zh: '数据分析', ja: 'データ分析', en: 'Analytics' },
                        icon: '📊',
                        href: '#analytics'
                    }
                ]
            };

            return contextualMap[currentPage] || baseItems.contextual || [];
        } catch (error) {
            console.warn('Failed to load contextual items:', error);
            return [];
        }
    }

    // 注册更新回调
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    // 通知更新
    notifyUpdate(type, data) {
        this.updateCallbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.warn('Update callback error:', error);
            }
        });
    }

    // 预加载导航资源
    async preloadResources() {
        try {
            console.log('🔄 Preloading navigation resources...');

            // 并行加载所有必要资源
            const [config, items, settings, flags] = await Promise.all([
                this.fetchNavigationConfig(),
                this.getNavigationItems(),
                this.getLanguageSettings(),
                this.getFeatureFlags()
            ]);

            console.log('✅ Navigation resources preloaded');
            return { config, items, settings, flags };
        } catch (error) {
            console.warn('Failed to preload resources:', error);
            return null;
        }
    }

    // 清除缓存
    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.contentCache.keys()) {
                if (key.includes(pattern)) {
                    this.contentCache.delete(key);
                }
            }
        } else {
            this.contentCache.clear();
        }
    }

    // 获取缓存状态
    getCacheStatus() {
        return {
            cacheSize: this.contentCache.size,
            pendingRequests: this.loadPromises.size,
            cachedKeys: Array.from(this.contentCache.keys())
        };
    }
}

// Secure navigation controller
class SecureNavigationController {
    constructor() {
        this.languageManager = null;
        this.mobileMenuManager = null;
        this.stateManager = null;
        this.dropdownManager = null;
        this.renderer = null;
        this.dynamicLoader = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Secure Navigation Controller...');

        try {
            // Wait for DOM
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                });
            }

            // Initialize navigation renderer
            this.renderer = new SecureNavigationRenderer();

            // Initialize dynamic content loader
            this.dynamicLoader = new DynamicNavigationLoader();

            // Initialize SEO and accessibility enhancer
            if (typeof NavigationSEOEnhancer !== 'undefined') {
                this.seoEnhancer = new NavigationSEOEnhancer();
                console.log('🔍 SEO enhancer initialized');
            }

            // Initialize performance monitor
            if (typeof NavigationPerformanceMonitor !== 'undefined') {
                this.performanceMonitor = new NavigationPerformanceMonitor();
                console.log('📊 Performance monitor initialized');
            }

            // Initialize keyboard shortcuts manager
            if (typeof KeyboardShortcutsManager !== 'undefined') {
                this.keyboardManager = new KeyboardShortcutsManager();
                this.setupNavigationShortcuts();
                console.log('⌨️ Keyboard shortcuts manager initialized');
            }

            // Preload dynamic content
            this.dynamicLoader.preloadResources().then(resources => {
                if (resources) {
                    console.log('📦 Dynamic navigation content loaded');
                    this.updateDynamicNavigation();
                }
            }).catch(error => {
                console.warn('Failed to preload dynamic content:', error);
            });

            // Check navigation bar and render if needed
            const navbar = document.getElementById('main-navbar');
            if (!navbar) {
                console.error('❌ Navigation bar container not found!');
                return;
            }

            // If navbar already has content, enhance existing navigation instead of re-rendering
            if (navbar.children.length > 0) {
                console.log('📝 Enhancing existing navigation...');
                this.enhanceExistingNavigation();
            } else {
                console.log('📝 Rendering default navigation...');
                const currentLanguage = localStorage.getItem('preferred-language') || 'zh';
                const renderedNav = this.renderer.renderNavigation(currentLanguage);
                navbar.appendChild(renderedNav);

                // 发送导航渲染完成事件
                setTimeout(() => {
                    const event = new CustomEvent('navigationRendered', {
                        detail: { language: currentLanguage, timestamp: Date.now() }
                    });
                    window.dispatchEvent(event);
                }, 100);
            }

            // Initialize managers
            this.languageManager = new SecureLanguageManager();
            this.mobileMenuManager = new SecureMobileMenuManager();
            this.stateManager = new SecureNavigationStateManager();
            this.dropdownManager = new SecureDropdownManager();

            // Set global references
            window.languageManager = this.languageManager;
            window.mobileMenuManager = this.mobileMenuManager;
            window.navigationController = this;

            // 等待 simple-i18n 系统完全加载后同步语言状态
            this.waitForI18nAndSyncLanguage();

            // Export safe global functions (保留简单翻译系统的函数)
            if (!window.switchLanguage || !window.simpleI18n) {
                window.switchLanguage = (lang) => {
                    if (this.languageManager) {
                        return this.languageManager.switchLanguage(lang);
                    }
                };
            }

            window.scrollToSection = (sectionId) => {
                if (this.stateManager) {
                    return this.stateManager.scrollToSection(sectionId);
                }
            };

            // 添加导航栏滚动测试函数
            window.testNavbarScroll = () => {
                const navbar = document.querySelector('.navbar');
                if (!navbar) {
                    console.log('❌ Navbar not found');
                    return;
                }

                console.log('🔍 Testing navbar scroll behavior:');
                console.log('- Current classes:', navbar.className);
                console.log('- Window width:', window.innerWidth);
                console.log('- Is mobile:', window.innerWidth <= 1024);
                console.log('- Scroll position:', window.scrollY);

                // 测试隐藏
                navbar.classList.add('navbar-hidden');
                navbar.classList.remove('navbar-visible');
                console.log('✅ Added navbar-hidden class');

                setTimeout(() => {
                    // 测试显示
                    navbar.classList.remove('navbar-hidden');
                    navbar.classList.add('navbar-visible');
                    console.log('✅ Added navbar-visible class');
                }, 2000);
            };

            this.initialized = true;
            navbar.classList.add('nav-initialized');

            // 应用无障碍增强
            setTimeout(() => {
                this.enhanceAccessibility();
            }, 100);

            console.log('✅ Secure Navigation Controller initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize navigation:', error);
        }
    }

    // 等待 simple-i18n 系统完全加载后同步语言状态
    async waitForI18nAndSyncLanguage() {
        const maxWaitTime = 5000; // 最大等待5秒
        const checkInterval = 100; // 每100ms检查一次
        let waitedTime = 0;

        const checkI18n = () => {
            if (window.simpleI18n && window.simpleI18n.translations && Object.keys(window.simpleI18n.translations).length > 0) {
                // simple-i18n 已完全加载，现在同步语言状态
                console.log('🔄 simple-i18n is ready, synchronizing language...');

                // 优先使用保存的语言设置
                const savedLang = localStorage.getItem('preferred-language');
                if (savedLang && ['zh', 'ja', 'en'].includes(savedLang)) {
                    console.log(`📝 Using saved language: ${savedLang}`);

                    // 同步两个系统的语言状态
                    this.languageManager.currentLanguage = savedLang;
                    window.simpleI18n.currentLanguage = savedLang;

                    // 更新页面语言
                    window.simpleI18n.updatePageLanguage();
                    this.languageManager.updateLanguageDisplay();

                    console.log(`✅ Language synchronized to: ${savedLang}`);
                } else {
                    // 如果没有保存的语言，使用 simple-i18n 检测到的语言
                    this.languageManager.synchronizeWithI18n();
                }
            } else if (waitedTime < maxWaitTime) {
                // 继续等待
                waitedTime += checkInterval;
                setTimeout(checkI18n, checkInterval);
            } else {
                console.warn('⚠️ Timeout waiting for simple-i18n to initialize');
            }
        };

        // 开始检查
        setTimeout(checkI18n, checkInterval);
    }

    // Public API
    navigateTo(page) {
        if (this.stateManager) {
            return this.stateManager.navigateToPage(page);
        }
        console.warn('Navigation state manager not available');
    }

    switchLanguage(lang) {
        if (this.languageManager) {
            const result = this.languageManager.switchLanguage(lang);

            // 同时更新导航栏渲染
            if (this.renderer && this.languageManager.currentLanguage !== lang) {
                this.renderer.updateLanguage(lang);
            }

            return result;
        }
        console.warn('Language manager not available');
    }

    getCurrentLanguage() {
        return this.languageManager ? this.languageManager.getCurrentLanguage() : null;
    }

    getCurrentPage() {
        return this.stateManager ? this.stateManager.currentPage : null;
    }

    closeMobileMenu() {
        if (this.mobileMenuManager) {
            return this.mobileMenuManager.closeMenu();
        }
    }

    // 更新动态导航内容
    async updateDynamicNavigation() {
        if (!this.dynamicLoader || !this.renderer) {
            return;
        }

        try {
            console.log('🔄 Updating dynamic navigation...');

            // 获取当前页面和权限
            const currentPage = this.getCurrentPage();
            const config = await this.dynamicLoader.fetchNavigationConfig();

            // 获取上下文导航项
            const contextualItems = await this.dynamicLoader.getContextualItems(currentPage, config.userPermissions);

            // 根据权限过滤特色导航项
            const featuredItems = this.dynamicLoader.filterNavigationByPermissions(
                config.navigationItems.featured,
                config.userPermissions
            );

            // 根据功能开关进一步过滤
            const filteredFeatured = this.dynamicLoader.filterNavigationByFlags(
                featuredItems,
                config.featureFlags
            );

            // 更新渲染器的导航数据
            if (this.renderer.navigationData) {
                // 添加动态项目到导航数据
                this.renderer.navigationData.dynamicItems = {
                    featured: filteredFeatured,
                    contextual: contextualItems
                };

                // 如果有动态内容，重新渲染导航栏
                if (filteredFeatured.length > 0 || contextualItems.length > 0) {
                    console.log('📝 Rendering navigation with dynamic items');
                    this.renderNavigationWithDynamicItems();
                }
            }

            console.log('✅ Dynamic navigation updated');
        } catch (error) {
            console.warn('Failed to update dynamic navigation:', error);
        }
    }

    // 渲染包含动态项目的导航栏
    renderNavigationWithDynamicItems() {
        if (!this.renderer || !this.renderer.navigationData) return;

        const navbar = document.getElementById('main-navbar');
        if (!navbar) return;

        // 获取当前语言
        const currentLanguage = this.getCurrentLanguage() || 'zh';

        // 清除现有内容并重新渲染
        while (navbar.firstChild) {
            navbar.removeChild(navbar.firstChild);
        }

        const renderedNav = this.renderer.renderNavigation(currentLanguage);
        navbar.appendChild(renderedNav);

        // 重新初始化各个管理器以处理新的DOM元素
        this.reinitializeManagers();
    }

    // 重新初始化管理器
    reinitializeManagers() {
        // 重新设置语言切换器
        if (this.languageManager) {
            this.languageManager.setupLanguageSwitcher();
        }

        // 重新设置移动菜单
        if (this.mobileMenuManager) {
            this.mobileMenuManager.init();
        }

        // 重新设置下拉菜单
        if (this.dropdownManager) {
            this.dropdownManager.init();
        }

        // 重新设置导航状态管理
        if (this.stateManager) {
            this.stateManager.updateActiveNavigation();
            this.stateManager.setupNavigationHandlers();
        }
    }

    // 清除动态导航缓存
    clearDynamicCache() {
        if (this.dynamicLoader) {
            this.dynamicLoader.clearCache();
            console.log('🧹 Dynamic navigation cache cleared');
        }
    }

    // 设置导航专用快捷键
    setupNavigationShortcuts() {
        if (!this.keyboardManager) return;

        // 导航相关快捷键
        this.keyboardManager.addShortcut(['alt', 'h'], () => {
            this.navigateToPage('home');
        }, '回到首页');

        this.keyboardManager.addShortcut(['alt', '1'], () => {
            this.navigateToPage('ailegal');
        }, 'AI法律服务');

        this.keyboardManager.addShortcut(['alt', '2'], () => {
            this.navigateToPage('aicrm');
        }, 'AI CRM系统');

        this.keyboardManager.addShortcut(['alt', '3'], () => {
            this.navigateToPage('knowledge');
        }, '知识库');

        this.keyboardManager.addShortcut(['alt', '4'], () => {
            this.navigateToPage('professionals');
        }, '专业人才');

        // 移动端菜单切换
        this.keyboardManager.addShortcut(['alt', 'm'], () => {
            this.toggleMobileMenu();
        }, '切换移动菜单');

        // 语言切换
        this.keyboardManager.addShortcut(['alt', 'l'], () => {
            this.switchLanguage();
        }, '切换语言');

        // 搜索框聚焦
        this.keyboardManager.addShortcut(['alt', 's'], () => {
            this.focusSearchInput();
        }, '聚焦搜索框');

        // 返回上一页
        this.keyboardManager.addShortcut(['alt', 'b'], () => {
            history.back();
        }, '返回上一页');
    }

    // 页面导航辅助方法
    navigateToPage(pageId) {
        if (this.stateManager) {
            this.stateManager.navigateToPage(pageId);
        } else {
            window.location.hash = `#${pageId}`;
        }
    }

    // 切换移动菜单
    toggleMobileMenu() {
        if (this.mobileMenuManager) {
            this.mobileMenuManager.toggle();
        } else {
            const navMenu = document.querySelector('.nav-menu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            if (navMenu && toggle) {
                navMenu.classList.toggle('active');
                toggle.classList.toggle('active');
            }
        }
    }

    // 切换语言
    switchLanguage() {
        if (this.languageManager) {
            const currentLang = this.languageManager.getCurrentLanguage();
            const nextLang = currentLang === 'zh' ? 'ja' : (currentLang === 'ja' ? 'en' : 'zh');
            this.languageManager.setLanguage(nextLang);
        }
    }

    // 聚焦搜索输入
    focusSearchInput() {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="搜索"], input[placeholder*="Search"]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
            // 为屏幕阅读器宣布
            this.announceToScreenReader('搜索框已聚焦');
        } else {
            // 如果没有搜索框，尝试跳转到搜索页面
            this.navigateToPage('search');
        }
    }

    // 增强现有导航栏
    enhanceExistingNavigation() {
        const navbar = document.getElementById('main-navbar');
        if (!navbar) return;

        console.log('🔧 Enhancing existing navigation bar...');

        // 设置初始语言
        const currentLanguage = this.getCurrentLanguage() || 'zh';
        this.updateNavigationLanguage(currentLanguage);

        // 设置事件监听器（只在没有监听器的情况下添加）
        this.setupNavigationEventListeners();

        // 设置当前活跃页面状态
        if (this.stateManager && typeof this.stateManager.updateActiveNavigation === 'function') {
            this.stateManager.updateActiveNavigation();
        }

        // 设置移动菜单
        this.setupMobileMenu();

        // 设置语言切换器
        if (this.languageManager && typeof this.languageManager.setupLanguageSwitcher === 'function') {
            this.languageManager.setupLanguageSwitcher();
        }

        // 应用无障碍增强
        this.enhanceAccessibility();

        console.log('✅ Existing navigation enhanced successfully');

        // 强制重新绑定事件监听器以确保可靠性
        setTimeout(() => {
            console.log('🔄 Re-checking and re-binding navigation event listeners...');
            this.setupNavigationEventListeners();
        }, 500);

        // 发送导航增强完成事件
        setTimeout(() => {
            const event = new CustomEvent('navigationEnhanced', {
                detail: { language: currentLanguage, enhanced: true, timestamp: Date.now() }
            });
            window.dispatchEvent(event);
        }, 100);
    }

    // 设置导航事件监听器
    setupNavigationEventListeners() {
        const navLinks = document.querySelectorAll('[data-page]');
        if (navLinks.length === 0) {
            console.warn('❌ No navigation links with data-page found');
            return;
        }

        let addedCount = 0;
        navLinks.forEach(link => {
            // 检查每个链接是否已经有监听器（通过自定义属性标记）
            if (!link.hasAttribute('data-listeners-added')) {
                eventManager.add(link, 'click', (e) => {
                    const target = e.target.closest('[data-page]');
                    if (!target) {
                        this.logger?.warn('❌ Could not find target with data-page attribute', {
                            event: e.type,
                            target: e.target.tagName
                        }, 'NAVIGATION') || console.warn('❌ Could not find target with data-page attribute');
                        return;
                    }

                    const page = target.getAttribute('data-page');
                    const isExternalPage = target.hasAttribute('data-external-page');

                    // 记录导航事件
                    this.logger?.info(`🎯 Navigation clicked: ${page}`, {
                        page: page,
                        isExternalPage: isExternalPage,
                        href: target.href,
                        text: target.textContent
                    }, 'NAVIGATION') || console.log(`🎯 Navigation clicked: ${page}, external: ${isExternalPage}`);

                    if (page && /^[a-zA-Z0-9-]+$/.test(page)) {
                        // 特殊处理外部页面（如AI架构页面）
                        if (isExternalPage || page === 'ai-architecture') {
                            // 直接跳转到外部页面，不阻止默认行为
                            this.logger?.info(`🔗 Navigating to external page: ${page}`, {
                                targetUrl: target.href,
                                navigationType: 'external'
                            }, 'NAVIGATION') || console.log(`🔗 Navigating to external page: ${page}`);
                            return; // 让浏览器处理默认跳转
                        }

                        // 内部SPA页面导航
                        e.preventDefault();
                        if (this.navigateTo) {
                            this.logger?.debug(`🔄 Initiating SPA navigation to: ${page}`, {
                                currentPage: this.currentPage || 'unknown'
                            }, 'NAVIGATION');
                            this.navigateTo(page);
                        } else {
                            this.logger?.error('❌ navigateTo method not available', null, 'NAVIGATION_ERROR') || console.warn('❌ navigateTo method not available');
                        }
                    } else {
                        this.logger?.warn(`❌ Invalid page name: ${page}`, {
                            page: page,
                            pattern: /^[a-zA-Z0-9-]+$/.test(page)
                        }, 'NAVIGATION_ERROR') || console.warn(`❌ Invalid page name: ${page}`);
                    }
                });

                // 添加键盘支持
                eventManager.add(link, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        link.click();
                    }
                });

                // 标记已经添加了监听器
                link.setAttribute('data-listeners-added', 'true');
                addedCount++;
            }
        });

        if (addedCount > 0) {
            console.log(`👂 Added event listeners to ${addedCount} new navigation links (total: ${navLinks.length})`);
        } else {
            console.log(`🔄 All ${navLinks.length} navigation links already have listeners`);
        }
    }

    // 更新导航栏语言
    updateNavigationLanguage(language) {
        const translations = this.getNavigationTranslations();

        // 更新Logo文字
        const logoText = document.querySelector('.logo-text');
        if (logoText) {
            logoText.textContent = translations.logo[language] || translations.logo.zh;
        }

        // 更新主导航链接
        const mainNavLinks = document.querySelectorAll('.nav-menu > li > a[data-page]:not(.dropdown-toggle)');
        mainNavLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (translations.mainNav[page] && translations.mainNav[page][language]) {
                // 保留emoji，只更新文字部分
                const emoji = link.textContent.match(/[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/)?.[0] || '';
                link.innerHTML = `${emoji} ${translations.mainNav[page][language]}`;
            }
        });

        console.log(`🌐 Navigation language updated to: ${language}`);
    }

    // 获取导航翻译
    getNavigationTranslations() {
        return {
            logo: {
                zh: '日本商务通',
                ja: '日本ビジネスハブ',
                en: 'Japan Business Hub'
            },
            mainNav: {
                'ailegal': {
                    zh: 'AI法律服务',
                    ja: 'AI法務サービス',
                    en: 'AI Legal Services'
                },
                'aicrm': {
                    zh: 'AI CRM系统',
                    ja: 'AI CRMシステム',
                    en: 'AI CRM System'
                },
                'knowledge': {
                    zh: '知识库',
                    ja: '知識ベース',
                    en: 'Knowledge Base'
                },
                'professionals': {
                    zh: '专业人才',
                    ja: '専門人材',
                    en: 'Professionals'
                },
                'lifestyle': {
                    zh: '生活帮帮忙',
                    ja: 'ライフヘルプ',
                    en: 'Lifestyle Help'
                },
                'education': {
                    zh: '出国留学',
                    ja: '留学教育',
                    en: 'Education'
                },
                'labor': {
                    zh: '国外务工',
                    ja: '労働派遣',
                    en: 'Labor Services'
                },
                'pet': {
                    zh: '宠物帮帮忙',
                    ja: 'ペットサービス',
                    en: 'Pet Services'
                },
                'tourism': {
                    zh: '国外旅游',
                    ja: '観光サービス',
                    en: 'Tourism'
                },
                'community': {
                    zh: '社区交流',
                    ja: 'コミュニティ',
                    en: 'Community'
                }
            }
        };
    }

    // 设置移动菜单
    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileToggle && navMenu) {
            // 检查是否已经有事件监听器
            if (!mobileToggle.hasAttribute('data-listeners-added')) {
                eventManager.add(mobileToggle, 'click', () => {
                    navMenu.classList.toggle('active');
                    mobileToggle.classList.toggle('active');

                    // 更新aria属性
                    const isExpanded = navMenu.classList.contains('active');
                    mobileToggle.setAttribute('aria-expanded', isExpanded.toString());

                    // 为屏幕阅读器宣布
                    this.announceToScreenReader(isExpanded ? '导航菜单已打开' : '导航菜单已关闭');
                });

                mobileToggle.setAttribute('data-listeners-added', 'true');
                console.log('📱 Mobile menu toggle setup completed');
            }
        }
    }

    // 为屏幕阅读器宣布消息
    announceToScreenReader(message, priority = 'polite') {
        // 创建或获取屏幕阅读器专用的live region
        let announcer = document.getElementById('sr-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }

        announcer.textContent = message;
    }

    // 无障碍功能增强
    enhanceAccessibility() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // 添加主要导航landmark
        navbar.setAttribute('role', 'navigation');
        navbar.setAttribute('aria-label', '主导航栏');

        // 为所有链接添加更好的描述
        const navLinks = navbar.querySelectorAll('a[data-page]');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            const pageNames = {
                'home': '首页，当前页面',
                'ailegal': 'AI法律服务，智能法律咨询',
                'aicrm': 'AI CRM系统，客户关系管理',
                'knowledge': '知识库，法律知识文档',
                'professionals': '专业人才，法律服务专家'
            };

            const linkText = link.textContent.trim();
            const description = pageNames[page];
            if (description && !link.getAttribute('aria-label')) {
                link.setAttribute('aria-label', `${linkText}，${description}`);
            }

            // 添加键盘支持
            link.setAttribute('tabindex', '0');

            // 为新页面添加外部链接指示
            if (link.getAttribute('target') === '_blank') {
                link.setAttribute('aria-label', `${link.textContent}，在新窗口打开`);
            }
        });

        // 改进语言切换下拉框的无障碍性
        const langToggle = navbar.querySelector('.language-toggle');
        const langDropdown = navbar.querySelector('.language-dropdown');
        const langOptions = navbar.querySelectorAll('.lang-option');

        if (langToggle) {
            langToggle.setAttribute('aria-label', '选择语言');
            langToggle.setAttribute('role', 'button');
            langToggle.setAttribute('tabindex', '0');
        }

        if (langDropdown) {
            langDropdown.setAttribute('role', 'menu');
        }

        langOptions.forEach((option, index) => {
            const lang = option.getAttribute('data-lang');
            const langName = option.querySelector('.name')?.textContent || lang;
            option.setAttribute('role', 'menuitem');
            option.setAttribute('tabindex', '-1'); // 菜单项默认不按Tab序列
            option.setAttribute('aria-label', `切换到${langName}`);

            // 为当前激活语言添加特殊标记
            if (lang === this.currentLanguage) {
                option.setAttribute('aria-checked', 'true');
                option.setAttribute('aria-current', 'lang');
            } else {
                option.setAttribute('aria-checked', 'false');
            }
        });

        // 保留旧的语言按钮无障碍性（以防同时存在）
        const langButtons = navbar.querySelectorAll('.lang-btn');
        langButtons.forEach((btn, index) => {
            const lang = btn.getAttribute('data-lang') || btn.textContent;
            btn.setAttribute('aria-label', `切换到${lang}语言`);
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');

            // 添加屏幕阅读器友好的状态
            if (btn.classList.contains('active')) {
                btn.setAttribute('aria-pressed', 'true');
                btn.setAttribute('aria-current', 'lang');
            } else {
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // 改进移动菜单按钮的无障碍性
        const mobileToggle = navbar.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-label', '切换导航菜单');
            mobileToggle.setAttribute('aria-expanded', 'false');
            mobileToggle.setAttribute('aria-controls', 'main-nav-menu');

            // 监听菜单状态变化
            const observer = new MutationObserver(() => {
                const isExpanded = mobileToggle.classList.contains('active');
                mobileToggle.setAttribute('aria-expanded', isExpanded.toString());
                this.announceToScreenReader(isExpanded ? '导航菜单已打开' : '导航菜单已关闭');
            });

            observer.observe(mobileToggle, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        // 为导航栏添加skip-to-content链接的动态更新
        const skipLink = document.getElementById('skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', () => {
                this.announceToScreenReader('已跳转到主要内容');
            });
        }

        console.log('♿ Accessibility enhancements applied to navigation');
    }

    // 获取导航系统状态
    getNavigationStatus() {
        return {
            initialized: this.initialized,
            currentPage: this.getCurrentPage(),
            currentLanguage: this.getCurrentLanguage(),
            rendererActive: !!(this.renderer && this.renderer.isRendered),
            dynamicLoaderActive: !!this.dynamicLoader,
            managersActive: {
                language: !!this.languageManager,
                mobile: !!this.mobileMenuManager,
                state: !!this.stateManager,
                dropdown: !!this.dropdownManager,
                seo: !!this.seoEnhancer,
                performance: !!this.performanceMonitor,
                keyboard: !!this.keyboardManager
            },
            cacheStatus: this.dynamicLoader ? this.dynamicLoader.getCacheStatus() : null
        };
    }

    // Cleanup resources
    destroy() {
        eventManager.cleanup();

        // 清理动态加载器
        if (this.dynamicLoader) {
            this.dynamicLoader.clearCache();
        }

        console.log('🧹 Secure navigation resources cleaned up');
    }
}

// Auto-initialize with error handling
let navigationController;

const initializeNavigation = () => {
    try {
        navigationController = new SecureNavigationController();
    } catch (error) {
        console.error('Failed to initialize navigation:', error);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation, { once: true });
} else {
    // Small delay to ensure other scripts have loaded
    setTimeout(initializeNavigation, 100);
}

// Cleanup on page unload
eventManager.addGlobal('beforeunload', () => {
    if (navigationController) {
        navigationController.destroy();
    }
});

// Export for debugging
window.SecureNavigationController = SecureNavigationController;
window.navigationController = navigationController;

// 添加调试命令
window.checkRouterStatus = () => {
    console.group('🔍 Router Status Check');
    console.log('window.spaRouter exists:', !!window.spaRouter);
    if (window.spaRouter) {
        console.log('spaRouter type:', typeof window.spaRouter);
        console.log('loadPage method exists:', typeof window.spaRouter.loadPage);
        console.log('currentPage:', window.spaRouter.currentPage);
    }
    console.log('Content container exists:', !!document.getElementById('page-content'));
    console.groupEnd();
};

window.testPageLoad = (pageName) => {
    console.log(`🧪 Testing page load for: ${pageName}`);
    console.log('📊 SPA Router Status:', !!window.spaRouter);
    if (window.spaRouter) {
        console.log('🔧 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.spaRouter)));
        if (window.spaRouter.loadPage) {
            console.log('✅ loadPage method found, attempting to load page...');
            window.spaRouter.loadPage(pageName);
        } else {
            console.error('❌ loadPage method not found on spaRouter');
        }
    } else {
        console.error('❌ SPA router not available');
        console.log('🔍 Checking global spaRouter variable:', typeof window.spaRouter);
    }
};

// 测试静态导航栏
window.testStaticNavigation = () => {
    console.group('🔍 Static Navigation Test');

    const navbar = document.getElementById('main-navbar');
    console.log('Navbar exists:', !!navbar);

    const navLinks = document.querySelectorAll('[data-page]');
    console.log('Navigation links found:', navLinks.length);

    navLinks.forEach((link, index) => {
        console.log(`${index + 1}. ${link.textContent.trim()} -> ${link.getAttribute('data-page')}`);
        console.log(`   Has listeners: ${link.hasAttribute('data-listeners-added')}`);
        console.log(`   Event listeners: ${getEventListeners ? Object.keys(getEventListeners(link)).length : 'N/A'}`);
    });

    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('Language buttons found:', langButtons.length);

    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    console.log('Mobile toggle exists:', !!mobileToggle);

    console.groupEnd();

    return {
        navbar: !!navbar,
        navLinks: navLinks.length,
        langButtons: langButtons.length,
        mobileToggle: !!mobileToggle
    };
};

// 测试导航点击
window.testNavigationClick = (pageName) => {
    console.log(`🧪 Testing navigation click for: ${pageName}`);

    // 查找对应的链接
    const link = document.querySelector(`[data-page="${pageName}"]`);
    if (!link) {
        console.error(`❌ Link not found for page: ${pageName}`);
        return false;
    }

    console.log('✅ Link found:', link.textContent.trim());
    console.log('🎯 Simulating click...');

    // 模拟点击事件
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    link.dispatchEvent(clickEvent);
    return true;
};

// 检查SPA路由器状态
window.checkSPAStatus = () => {
    console.group('🔍 SPA Router Status');
    console.log('spaRouter exists:', !!window.spaRouter);
    console.log('navController exists:', !!window.navigationController);

    if (window.spaRouter) {
        console.log('spaRouter methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.spaRouter)));
        console.log('spaRouter.currentPage:', window.spaRouter.currentPage);
        console.log('contentContainer exists:', !!window.spaRouter.contentContainer);
    }

    if (window.navigationController) {
        console.log('navController currentPage:', window.navigationController.getCurrentPage());
    }

    console.groupEnd();
};

window.getNavigationSystemStatus = () => {
    if (window.navigationController) {
        const status = window.navigationController.getNavigationStatus();
        console.group('🧭 Navigation System Status Report');
        console.log('📊 Overall Status:', status.initialized ? '✅ Initialized' : '❌ Not Initialized');
        console.log('📍 Current Page:', status.currentPage);
        console.log('🌐 Current Language:', status.currentLanguage);
        console.log('🎨 Renderer:', status.rendererActive ? '✅ Active' : '❌ Inactive');
        console.log('📦 Dynamic Loader:', status.dynamicLoaderActive ? '✅ Active' : '❌ Inactive');

        console.group('🔧 Managers Status:');
        Object.entries(status.managersActive).forEach(([name, active]) => {
            console.log(`${name}: ${active ? '✅' : '❌'}`);
        });
        console.groupEnd();

        if (status.cacheStatus) {
            console.group('💾 Cache Status');
            console.log('Size:', status.cacheStatus.size);
            console.log('Last Updated:', new Date(status.cacheStatus.lastUpdated).toLocaleString());
            console.groupEnd();
        }

        console.group('🎯 Performance Metrics');
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            console.log('Navbar Height:', navbar.offsetHeight + 'px');
            console.log('Navbar Classes:', navbar.className);
            console.log('Navbar Position:', getComputedStyle(navbar).position);
            console.log('Current Scroll:', window.scrollY + 'px');
        } else {
            console.log('❌ Navbar element not found');
        }
        console.groupEnd();

        console.groupEnd();

        return status;
    } else {
        console.error('❌ Navigation controller not found');
        return null;
    }
};

console.log('🧭 Secure navigation system loaded');
console.log('💡 Debug: Run window.testNavbarScroll() to test navbar hide/show');

// 强制重新绑定导航事件监听器
window.forceRebindNavigation = () => {
    console.log('🔄 Force rebinding navigation event listeners...');

    // 清除所有现有的监听器标记
    document.querySelectorAll('[data-page]').forEach(link => {
        link.removeAttribute('data-listeners-added');
    });

    // 重新绑定
    if (window.navigationController && window.navigationController.enhanceExistingNavigation) {
        window.navigationController.setupNavigationEventListeners();
        console.log('✅ Navigation event listeners rebound');
    } else {
        console.error('❌ Navigation controller not available');
    }
};

// 检查网络连接和服务器状态
window.checkNetworkStatus = () => {
    console.group('🌐 Network Status Check');

    const currentURL = window.location.href;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    console.log('Current URL:', currentURL);
    console.log('Protocol:', protocol);
    console.log('Hostname:', hostname);
    console.log('Port:', port);
    console.log('User Agent:', navigator.userAgent);

    // 检测是否在HTTPS环境中
    const isHTTPS = protocol === 'https:';
    if (isHTTPS) {
        console.warn('⚠️ HTTPS detected - may cause TLS errors with local resources');
        console.log('💡 Consider using HTTP for local development');
    }

    // 测试服务器连接
    if (window.spaRouter) {
        console.log('SPA Router Status:', '✅ Available');
    } else {
        console.log('SPA Router Status:', '❌ Not available');
    }

    if (window.navigationController) {
        console.log('Navigation Controller Status:', '✅ Available');
    } else {
        console.log('Navigation Controller Status:', '❌ Not available');
    }

    console.groupEnd();

    return {
        protocol: protocol,
        hostname: hostname,
        port: port,
        isHTTPS: isHTTPS,
        serverAvailable: !!window.spaRouter,
        navControllerAvailable: !!window.navigationController
    };
};

// 解决TLS错误的工具函数
window.fixTLSErrors = () => {
    console.log('🔧 Attempting to fix TLS errors...');

    const networkStatus = window.checkNetworkStatus();

    if (networkStatus.isHTTPS && networkStatus.hostname === 'localhost') {
        console.log('💡 Detected localhost HTTPS, suggesting HTTP alternative');
        const httpURL = `http://localhost:8080`;
        console.log(`🌐 Try accessing: ${httpURL}`);
        return httpURL;
    }

    console.log('✅ No TLS fixes needed for current environment');
    return null;
};