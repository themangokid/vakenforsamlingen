/**
 * Auto Navigation Toast - Optimized for faster loading
 * Usage: Include this script and add <nav class="toast-nav" id="toast-nav"></nav> to your HTML
 */

(function() {
    'use strict';

    let isInitialized = false;
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 200; // Start with 200ms, increase exponentially

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
        return text
            .replace(/([a-zåäö])([A-ZÅÄÖ])/g, '$1 $2')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function updateToastNavigation() {
        const toastNav = document.getElementById('toast-nav');
        if (!toastNav) {
            console.warn('Toast navigation element not found.');
            return false;
        }

        const headings = document.querySelectorAll('main h2');
        
        // If no headings found and we haven't exceeded retry limit, try again
        if (headings.length === 0 && retryCount < maxRetries) {
            retryCount++;
            const delay = Math.min(retryInterval * Math.pow(1.5, retryCount), 2000);
            setTimeout(updateToastNavigation, delay);
            return false;
        }
        
        // Clear existing navigation items
        toastNav.innerHTML = '';
        
        if (headings.length === 0) {
            toastNav.style.display = 'none';
            return true;
        }

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
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
                fragment.appendChild(divider);
            }
            
            // Create navigation link
            const link = document.createElement('a');
            link.href = '#' + heading.id;
            link.className = 'toast-nav-item';
            link.textContent = formatNavigationText(heading.textContent);
            
            // Add smooth scrolling using event delegation (attached later)
            link.dataset.targetId = heading.id;
            
            fragment.appendChild(link);
        });
        
        // Append all elements at once
        toastNav.appendChild(fragment);
        toastNav.style.display = 'flex';
        
        // Add event delegation for click handling
        if (!toastNav.hasAttribute('data-listeners-attached')) {
            toastNav.addEventListener('click', function(e) {
                if (e.target.classList.contains('toast-nav-item')) {
                    e.preventDefault();
                    const targetId = e.target.dataset.targetId;
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
            toastNav.setAttribute('data-listeners-attached', 'true');
        }
        
        isInitialized = true;
        return true;
    }

    function checkForTeXMe() {
        // Check if TeXMe has processed content by looking for specific indicators
        const main = document.querySelector('main');
        if (!main) return false;
        
        // Check if TeXMe has added content to main
        const hasContent = main.children.length > 0;
        const hasH2Elements = main.querySelectorAll('h2').length > 0;
        
        return hasContent || hasH2Elements;
    }

    function initializeAutoNavigation() {
        if (isInitialized) return;
        
        // First, try immediate update in case content is already ready
        if (checkForTeXMe()) {
            updateToastNavigation();
            setupMutationObserver();
            return;
        }
        
        // Use requestAnimationFrame for better performance
        function attemptUpdate() {
            if (checkForTeXMe() && updateToastNavigation()) {
                setupMutationObserver();
                return;
            }
            
            if (retryCount < maxRetries) {
                requestAnimationFrame(attemptUpdate);
            }
        }
        
        requestAnimationFrame(attemptUpdate);
    }

    function setupMutationObserver() {
        // Only set up observer once
        if (window.toastNavObserver) return;
        
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    // Check if any h2 elements were added or removed
                    for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
                        if (node.nodeType === 1 && (node.tagName === 'H2' || node.querySelector('h2'))) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                    if (shouldUpdate) break;
                }
            }
            
            if (shouldUpdate) {
                // Use requestAnimationFrame to batch DOM updates
                requestAnimationFrame(() => {
                    retryCount = 0; // Reset retry count for dynamic updates
                    updateToastNavigation();
                });
            }
        });

        const main = document.querySelector('main');
        if (main) {
            observer.observe(main, {
                childList: true,
                subtree: true
            });
            window.toastNavObserver = observer;
        }
    }

    // Initialize based on document state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAutoNavigation);
    } else {
        // Use setTimeout to ensure this runs after other scripts
        setTimeout(initializeAutoNavigation, 0);
    }

    // Expose function globally for manual updates if needed
    window.updateToastNavigation = updateToastNavigation;

})();