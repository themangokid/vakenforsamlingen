// font.js - Fast loading with preload
(async function() {
    try {
        // Start fetch immediately when script loads
        const fontPromise = fetch('./garamond_base64');
        
        // Hide body until font is ready
        document.documentElement.style.visibility = 'hidden';
        
        const response = await fontPromise;
        if (!response.ok) throw new Error(`File not found: ${response.status}`);
        
        const fontData = await response.text();
        const cleanData = fontData.trim();
        
        if (cleanData.length < 1000) throw new Error('Font data too small');
        
        // Create and inject font CSS immediately
        const css = `
            @font-face {
                font-family: 'EB Garamond';
                src: url(data:font/ttf;base64,${cleanData}) format('truetype');
                font-weight: 400;
                font-style: normal;
                font-display: block;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        
        // Wait for font to be ready before showing content
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        } else {
            // Fallback: wait a bit for font to process
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Show content
        document.documentElement.style.visibility = 'visible';
        
    } catch (error) {
        console.error('Font loading failed:', error.message);
        // Show content with fallback fonts
        document.documentElement.style.visibility = 'visible';
    }
})();

// Timeout fallback - always show content after 2 seconds max
setTimeout(() => {
    document.documentElement.style.visibility = 'visible';
}, 2000);