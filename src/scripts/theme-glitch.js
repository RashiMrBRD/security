// List of available themes
const themes = [
    'winter', 'valentine', 'spring', 'rain', 'flower', 
    'summer', 'beach', 'star', 'autumn', 'halloween', 
    'harvest', 'christmas'
];
let currentThemeIndex = 0;

// Set current month's theme as the default
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const date = new Date();
    const month = date.getMonth();
    const theme = themes[month];
    body.setAttribute('data-theme', theme);
    
    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: theme }
    }));
});

// Theme glitch effects
class ThemeGlitch {
    constructor() {
        this.glitchInterval = null;
        this.isGlitching = false;
    }

    startGlitchEffect(duration = 2000) {
        if (this.isGlitching) return;
        
        this.isGlitching = true;
        const root = document.documentElement;
        const originalTheme = root.getAttribute('data-theme');
        
        // Get current month's theme and adjacent months
        const date = new Date();
        const month = date.getMonth();
        const themes = [
            'winter', 'valentine', 'spring', 'rain', 'flower', 
            'summer', 'beach', 'star', 'autumn', 'halloween', 
            'harvest', 'christmas'
        ];
        
        this.glitchInterval = setInterval(() => {
            // Randomly choose between current theme and adjacent months
            const randomOffset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const glitchMonth = (month + randomOffset + 12) % 12;
            const glitchTheme = themes[glitchMonth];
            
            root.setAttribute('data-theme', glitchTheme);
            
            // Add glitch animation class
            root.classList.add('theme-glitch');
            
            // Remove glitch class after a short delay
            setTimeout(() => {
                root.classList.remove('theme-glitch');
            }, 150);
        }, 200);
        
        // Stop glitch effect after duration
        setTimeout(() => {
            this.stopGlitchEffect();
            root.setAttribute('data-theme', originalTheme);
        }, duration);
    }
    
    stopGlitchEffect() {
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
            this.glitchInterval = null;
        }
        this.isGlitching = false;
        document.documentElement.classList.remove('theme-glitch');
    }
}

// Initialize glitch effects
const themeGlitch = new ThemeGlitch();

// Export for other modules
window.themeGlitch = themeGlitch;

// Listen for theme transitions
document.addEventListener('themeChanged', () => {
    // Random chance to trigger glitch effect during theme changes
    if (Math.random() < 0.3) { // 30% chance
        themeGlitch.startGlitchEffect(1500);
    }
});
