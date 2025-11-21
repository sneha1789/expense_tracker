// header-loader.js
class HeaderLoader {
    static async loadHeader() {
        try {
            const response = await fetch('header.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const headerHTML = await response.text();
            
            // Create a temporary container to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = headerHTML;
            
            // Extract the header content - look for the actual header element
            const headerContent = tempDiv.querySelector('header') || tempDiv.querySelector('.header-container');
            
            if (!headerContent) {
                throw new Error('Header content not found in header.html');
            }
            
            // Extract and handle CSS separately
            const styles = tempDiv.querySelector('style');
            if (styles) {
                this.injectStyles(styles.textContent);
            }
            
            // Insert the header into the DOM
            this.insertHeader(headerContent);
            
            // Extract and execute scripts
            const scripts = tempDiv.querySelectorAll('script');
            await this.executeScripts(scripts);
            
            // Adjust main content padding
            this.adjustContentPadding();
            
            console.log('Header loaded successfully');
            
        } catch (error) {
            console.error('Error loading header:', error);
            this.createFallbackHeader();
        }
    }
    
    static injectStyles(css) {
        // Check if styles already exist to avoid duplicates
        const existingStyle = document.getElementById('header-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'header-styles';
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
    }
    
    static insertHeader(headerContent) {
        // Remove any existing header first
        const existingHeader = document.querySelector('header.header-container');
        if (existingHeader) {
            existingHeader.remove();
        }
        
        const placeholder = document.getElementById('header-placeholder');
        
        if (placeholder) {
            placeholder.innerHTML = '';
            placeholder.appendChild(headerContent);
        } else {
            // Create a placeholder if it doesn't exist
            const newPlaceholder = document.createElement('div');
            newPlaceholder.id = 'header-placeholder';
            document.body.insertBefore(newPlaceholder, document.body.firstChild);
            newPlaceholder.appendChild(headerContent);
        }
    }
    
    static async executeScripts(scripts) {
        for (const script of scripts) {
            try {
                if (script.src) {
                    // External script - load it
                    await new Promise((resolve, reject) => {
                        const newScript = document.createElement('script');
                        newScript.src = script.src;
                        newScript.onload = resolve;
                        newScript.onerror = reject;
                        document.head.appendChild(newScript);
                    });
                } else {
                    // Inline script - execute it
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.head.appendChild(newScript);
                    document.head.removeChild(newScript); // Clean up
                }
            } catch (error) {
                console.warn('Error executing header script:', error);
            }
        }
    }
    
    static adjustContentPadding() {
        // Wait for the header to be fully rendered
        setTimeout(() => {
            const header = document.querySelector('.header-container');
            if (!header) return;
            
            const headerHeight = header.offsetHeight;
            const mainContent = document.querySelector('main') || 
                               document.querySelector('.main-content') || 
                               document.querySelector('.app-container') ||
                               document.querySelector('#app');
            
            if (mainContent) {
                mainContent.style.paddingTop = `${headerHeight + 20}px`;
            }
        }, 150);
    }
    
    static createFallbackHeader() {
        console.log('Creating fallback header');
        
        const fallbackHeader = document.createElement('header');
        fallbackHeader.className = 'header-container';
        fallbackHeader.innerHTML = `
            <div class="header-content">
                <a href="index.html" class="logo-section">
                    <div class="logo-icon">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="#4cc9f0"></path>
                        </svg>
                    </div>
                    <span class="logo-text">ExpenseTracker Pro</span>
                </a>
                <nav class="nav-links">
                    <a href="index.html" class="nav-link">Dashboard</a>
                    <a href="expenses.html" class="nav-link">Expenses</a>
                    <a href="income.html" class="nav-link">Income</a>
                    <a href="reports.html" class="nav-link">Reports</a>
                </nav>
                <div class="header-actions">
                    <button class="notification-btn" aria-label="Notifications">
                        <i class="fas fa-bell"></i>
                    </button>
                    <div class="user-menu">
                        <div class="user-avatar"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add basic fallback styles
        const fallbackStyles = `
            .header-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #1a365d;
                color: white;
                padding: 0 20px;
                height: 70px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                z-index: 1000;
            }
            .logo-section {
                display: flex;
                align-items: center;
                gap: 10px;
                text-decoration: none;
                color: white;
                font-weight: bold;
                font-size: 1.2rem;
            }
            .logo-icon {
                width: 24px;
                height: 24px;
            }
            .nav-links {
                display: flex;
                gap: 20px;
            }
            .nav-link {
                color: white;
                text-decoration: none;
                padding: 5px 10px;
            }
            .nav-link:hover {
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
            }
            .header-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .notification-btn, .user-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.1);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
            }
            .user-avatar {
                background: #4cc9f0;
            }
            @media (max-width: 768px) {
                .nav-links {
                    display: none;
                }
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = fallbackStyles;
        document.head.appendChild(styleElement);
        
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) {
            placeholder.innerHTML = '';
            placeholder.appendChild(fallbackHeader);
        } else {
            // Create placeholder and insert header
            const newPlaceholder = document.createElement('div');
            newPlaceholder.id = 'header-placeholder';
            document.body.insertBefore(newPlaceholder, document.body.firstChild);
            newPlaceholder.appendChild(fallbackHeader);
        }
        
        this.adjustContentPadding();
    }
    
    // Method to update active navigation link based on current page
    static updateActiveNavLink() {
        setTimeout(() => {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                    link.classList.add('active');
                }
            });
        }, 200);
    }
    
    // Method to manually refresh header (useful for SPA navigation)
    static async refreshHeader() {
        await this.loadHeader();
    }
}

// Enhanced initialization with retry logic
let retryCount = 0;
const maxRetries = 2;

async function initializeHeader() {
    try {
        await HeaderLoader.loadHeader();
        
        // Update active nav link after header is loaded
        HeaderLoader.updateActiveNavLink();
        
        // Re-update on navigation (for SPAs)
        window.addEventListener('popstate', () => {
            HeaderLoader.updateActiveNavLink();
        });
        
    } catch (error) {
        console.error('Failed to load header:', error);
        
        if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying header load... (${retryCount}/${maxRetries})`);
            setTimeout(initializeHeader, 1000 * retryCount);
        }
    }
}

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHeader);
} else {
    initializeHeader();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderLoader;
} else {
    window.HeaderLoader = HeaderLoader;
}