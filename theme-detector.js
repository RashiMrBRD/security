// Set cyberpunk theme immediately
document.documentElement.setAttribute('data-theme', 'cyberpunk');

function detectBackgroundBrightness() {
    const img = new Image();
    img.src = 'background.jpg';
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let brightness = 0;
        
        // Calculate average brightness
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate relative luminance
            brightness += (0.299 * r + 0.587 * g + 0.114 * b);
        }
        
        // Get average brightness (0-255)
        brightness = brightness / (data.length / 4);
        
        // Set theme based on brightness
        const theme = brightness > 128 ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    };
    
    img.onerror = function() {
        // Fallback to dark theme if image fails to load
        document.documentElement.setAttribute('data-theme', 'dark');
    };
}

// Optional: Add theme toggle function if needed
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const themes = ['cyberpunk', 'dark', 'light'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    root.setAttribute('data-theme', themes[nextIndex]);
}

// Initialize theme detection when page loads
document.addEventListener('DOMContentLoaded', detectBackgroundBrightness);
