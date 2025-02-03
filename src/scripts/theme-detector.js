// Theme detector functionality
class ThemeDetector {
    constructor() {
        this.currentTheme = null;
        this.backgroundBrightness = 'dark';
    }

    detectBackgroundBrightness() {
        const img = new Image();
        img.src = 'background.jpg';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            let brightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                brightness += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            }
            
            brightness = brightness / (data.length / 4);
            this.backgroundBrightness = brightness > 128 ? 'light' : 'dark';
            
            // Dispatch background brightness event
            document.dispatchEvent(new CustomEvent('backgroundBrightnessChanged', { 
                detail: { brightness: this.backgroundBrightness }
            }));
        };
        
        img.onerror = () => {
            this.backgroundBrightness = 'dark';
            document.dispatchEvent(new CustomEvent('backgroundBrightnessChanged', { 
                detail: { brightness: 'dark' }
            }));
        };
    }

    adjustThemeForBrightness(theme) {
        return `${theme}-${this.backgroundBrightness}`;
    }

    // Initialize the detector
    init() {
        this.detectBackgroundBrightness();
        
        // Listen for theme changes from theme manager
        document.addEventListener('themeChanged', (event) => {
            this.currentTheme = event.detail.theme;
            const adjustedTheme = this.adjustThemeForBrightness(this.currentTheme);
            document.documentElement.setAttribute('data-theme', adjustedTheme);
        });

        // Re-detect on window resize
        window.addEventListener('resize', () => {
            this.detectBackgroundBrightness();
        });
    }
}

function setWinterTheme() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Add data attribute for the current month
    document.body.setAttribute('data-month', currentMonth);
    
    // Set winter theme for January
    if (currentMonth === 0) { // January
        document.body.classList.add('winter-background');
        // Winter theme colors
        document.documentElement.style.setProperty('--primary-color', '#e3f2fd');
        document.documentElement.style.setProperty('--accent-color', '#90caf9');
        document.documentElement.style.setProperty('--background-color', '#0a1929');
        document.documentElement.style.setProperty('--surface-color', '#132f4c');
        document.documentElement.style.setProperty('--text-color', '#e3f2fd');
        document.documentElement.style.setProperty('--secondary-text', '#90caf9');
        document.documentElement.style.setProperty('--border-color', '#1e4976');
        document.documentElement.style.setProperty('--hover-color', '#173a5e');
    } else {
        document.body.classList.remove('winter-background');
        resetThemeColors();
    }
}

function resetThemeColors() {
    // Default AMOLED black theme colors
    document.documentElement.style.setProperty('--primary-color', '#ffffff');
    document.documentElement.style.setProperty('--accent-color', '#404040');
    document.documentElement.style.setProperty('--background-color', '#000000');
    document.documentElement.style.setProperty('--surface-color', '#121212');
    document.documentElement.style.setProperty('--text-color', '#ffffff');
    document.documentElement.style.setProperty('--secondary-text', '#a0a0a0');
    document.documentElement.style.setProperty('--border-color', '#333333');
    document.documentElement.style.setProperty('--hover-color', '#1a1a1a');
}

// Call on load and when theme changes
document.addEventListener('DOMContentLoaded', () => {
    const themeDetector = new ThemeDetector();
    themeDetector.init();
    setWinterTheme();
});

// Update theme when system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addListener(setWinterTheme);

// Export for other modules
window.themeDetector = new ThemeDetector();
