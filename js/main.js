// Main Application Entry Point
// Japan Business Hub - Modular Architecture

// Import modules (in production, these would be bundled)
// For now, we'll use script tags in HTML

// Event Listener Cleanup System (Global)
const eventCleanup = {
    listeners: [],

    add(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        this.listeners.push({ element, event, handler, options });
    },

    cleanup() {
        this.listeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.listeners = [];
    },

    cleanupElement(element) {
        this.listeners = this.listeners.filter(listener => {
            if (listener.element === element) {
                element.removeEventListener(listener.event, listener.handler, listener.options);
                return false;
            }
            return true;
        });
    }
};

// Application Controller
class JapanBusinessHub {
    constructor() {
        this.router = null;
        this.i18n = null;
        this.navbar = null;
        this.init();
    }

    async init() {
        window.logInfo('🏢 日本商务通 - Initializing Application...');

        try {
            // Wait for DOM
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core modules
            await this.initializeModules();

            // Setup global handlers
            this.setupGlobalHandlers();

            window.logInfo('✅ Application initialized successfully');

        } catch (error) {
            window.logError('❌ Failed to initialize application:', error);
        }
    }

    async initializeModules() {
        // Note: In a real build system, these would be ES6 imports
        // For now, we assume the modules are loaded via script tags

        // i18n functionality has been disabled
        this.i18n = null;
        window.logInfo('🌐 i18n module disabled');

        // Initialize router
        if (typeof SPARouter !== 'undefined') {
            this.router = new SPARouter();
            window.spaRouter = this.router;
            window.logInfo('🔄 Router module loaded');
        }

        // Initialize navbar (i18n disabled)
        if (typeof NavbarComponent !== 'undefined') {
            this.navbar = new NavbarComponent();
            window.logInfo('🧭 Navbar component loaded');
        }

        // Fallback: use original nav.js if modules aren't available
        if (!this.router && typeof initNavigation === 'function') {
            await initNavigation();
            window.logInfo('📦 Fallback navigation loaded');
        }
    }

    setupGlobalHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            window.logError('Global error:', event.error);
        });

        // Global unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            window.logError('Unhandled promise rejection:', event.reason);
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            eventCleanup.cleanup();
        });

        // Setup global button handlers
        this.setupGlobalButtonHandlers();
    }

    setupGlobalButtonHandlers() {
        // Handle navigation-related buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-nav-target]');
            if (!button) return;

            e.preventDefault();
            const target = button.getAttribute('data-nav-target');

            // Handle different navigation targets
            if (target.startsWith('#')) {
                // Scroll to section
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (this.router) {
                // Navigate to page
                this.router.loadPage(target);
            }
        });

        // Handle language switching
        document.addEventListener('click', (e) => {
            const langButton = e.target.closest('[data-switch-lang]');
            if (!langButton) return;

            const lang = langButton.getAttribute('data-switch-lang');
            if (typeof switchLanguage === 'function') {
                switchLanguage(lang);
            }
        });
    }

    // Public API
    navigateTo(page) {
        if (this.router) {
            return this.router.loadPage(page);
        }
        window.logWarn('Router not available');
    }

    switchLanguage(lang) {
        if (typeof switchLanguage === 'function') {
            return switchLanguage(lang);
        }
        window.logWarn('switchLanguage function not available');
    }

    getCurrentPage() {
        return this.router ? this.router.currentPage : null;
    }

    getCurrentLanguage() {
        return window.getCurrentLanguage ? window.getCurrentLanguage() : null;
    }
}

// Global utility functions for backward compatibility
window.switchLanguage = (lang) => {
    if (window.japanBusinessHub) {
        return window.japanBusinessHub.switchLanguage(lang);
    }
    window.logWarn('Application not initialized');
};

window.scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// Initialize application when DOM is ready
const initializeApp = async () => {
    window.japanBusinessHub = new JapanBusinessHub();
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM already ready
    setTimeout(initializeApp, 0);
}

// Export for debugging
window.JapanBusinessHub = JapanBusinessHub;
window.eventCleanup = eventCleanup;