// Theme management
function setTheme() {
    const date = new Date();
    const month = date.getMonth();
    let theme;

    switch(month) {
        case 0:  // January
            theme = 'winter';
            break;
        case 1:  // February
            theme = 'valentine';
            break;
        case 2:  // March
            theme = 'spring';
            break;
        case 3:  // April
            theme = 'rain';
            break;
        case 4:  // May
            theme = 'flower';
            break;
        case 5:  // June
            theme = 'summer';
            break;
        case 6:  // July
            theme = 'beach';
            break;
        case 7:  // August
            theme = 'star';
            break;
        case 8:  // September
            theme = 'autumn';
            break;
        case 9:  // October
            theme = 'halloween';
            break;
        case 10: // November
            theme = 'harvest';
            break;
        case 11: // December
            theme = 'christmas';
            break;
        default:
            theme = 'default';
    }

    const oldTheme = document.documentElement.getAttribute('data-theme');
    if (oldTheme !== theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Set December attribute for Christmas animations
        document.documentElement.setAttribute('data-is-december', month === 11 ? 'true' : 'false');
        
        // Dispatch theme change event
        const themeChangeEvent = new CustomEvent('themeChanged', {
            detail: {
                oldTheme: oldTheme || 'default',
                newTheme: theme
            }
        });
        document.dispatchEvent(themeChangeEvent);
    }
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTheme();

    // Update theme at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeToMidnight = tomorrow - now;

    setTimeout(() => {
        setTheme();
        // After first midnight update, update every 24 hours
        setInterval(setTheme, 24 * 60 * 60 * 1000);
    }, timeToMidnight);
});
