/**
 * Auto Navigation Toast - Automatically generates navigation for h2 elements
 * Usage: Include this script and add <nav class="toast-nav" id="toast-nav"></nav> to your HTML
 */

(function() {
    'use strict';

    function generateId(text) {
        return text.toLowerCase()
                  .replace(/[åä]/g, 'a')
                  .replace(/[ö]/g, 'o')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim();
    }

    function formatNavigationText(text) {
        // Add spaces between concatenated words - more precise approach
        return text
            // Handle specific common cases first
            .replace(/([a-zåäö])([A-ZÅÄÖ])/g, '$1 $2')
            // Clean up any multiple spaces
            .replace(/\s+/g, ' ')
            .trim();
    }

    function updateToastNavigation() {
        const toastNav = document.getElementById('toast-nav');
        if (!toastNav) {
            console.warn('Toast navigation element not found. Make sure you have <nav class="toast-nav" id="toast-nav"></nav> in your HTML.');
            return;
        }

        const headings = document.querySelectorAll('main h2');
        
        // Clear existing navigation items
        toastNav.innerHTML = '';
        
        // Generate navigation items for each h2
        headings.forEach((heading, index) => {
            // Generate ID if it doesn't exist
            if (!heading.id) {
                heading.id = generateId(heading.textContent);
            }
            
            // Add divider before each item (except the first)
            if (index > 0) {
                const divider = document.createElement('span');
                divider.className = 'toast-nav-divider';
                divider.innerHTML = '&nbsp;&nbsp;';
                toastNav.appendChild(divider);
            }
            
            // Create navigation link
            const link = document.createElement('a');
            link.href = '#' + heading.id;
            link.className = 'toast-nav-item';
            link.textContent = formatNavigationText(heading.textContent);
            
            // Add smooth scrolling
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.getElementById(heading.id);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
            
            toastNav.appendChild(link);
        });
        
        // Hide toast nav if no headings found
        if (headings.length === 0) {
            toastNav.style.display = 'none';
        } else {
            toastNav.style.display = 'flex';
        }
    }

    function initializeAutoNavigation() {
        // Initial update when page loads
        // Wait a bit for TeXMe to process the markdown
        setTimeout(updateToastNavigation, 500);

        // Update navigation when content changes (for dynamic content)
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Check if any h2 elements were added or removed
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && (node.tagName === 'H2' || node.querySelector('h2'))) {
                            shouldUpdate = true;
                        }
                    });
                    mutation.removedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && (node.tagName === 'H2' || node.querySelector('h2'))) {
                            shouldUpdate = true;
                        }
                    });
                }
            });
            
            if (shouldUpdate) {
                setTimeout(updateToastNavigation, 100);
            }
        });

        // Start observing the main element for changes
        const main = document.querySelector('main');
        if (main) {
            observer.observe(main, {
                childList: true,
                subtree: true
            });
        } else {
            console.warn('Main element not found. Auto-navigation will only run once on page load.');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAutoNavigation);
    } else {
        initializeAutoNavigation();
    }

    // Expose function globally for manual updates if needed
    window.updateToastNavigation = updateToastNavigation;

})();