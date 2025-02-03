// Developer Controls Configuration
const DEV_CONTROLS = {
    enabled: true,  // Set to false to disable all developer controls
    defaultState: {
        animationsPaused: false,
        particlesHidden: false,
        objectsHidden: false,
        currentThemeIndex: -1
    }
};

// Available themes for testing
const TEST_THEMES = [
    'winter', 'valentine', 'spring', 'rain', 'flower', 
    'summer', 'beach', 'star', 'autumn', 'halloween', 
    'harvest', 'christmas'
];

// Update animation state for all elements
function updateAnimationState(isPaused) {
    // Update particles
    const particleContainer = document.querySelector('.particle-container');
    if (particleContainer) {
        particleContainer.style.animationPlayState = isPaused ? 'paused' : 'running';
        particleContainer.querySelectorAll('.theme-particle').forEach(particle => {
            particle.style.animationPlayState = isPaused ? 'paused' : 'running';
        });
    }

    // Update flying objects
    const flyingObjectsLayers = document.querySelectorAll('.flying-objects-back, .flying-objects-front');
    flyingObjectsLayers.forEach(layer => {
        layer.style.animationPlayState = isPaused ? 'paused' : 'running';
        layer.querySelectorAll('.flying-object').forEach(obj => {
            obj.style.animationPlayState = isPaused ? 'paused' : 'running';
            // Also pause the movement animation
            if (obj.movement) {
                obj.movement.pause();
            }
        });
    });

    // Update button states
    const toggleButton = document.getElementById('toggleButton');
    if (toggleButton) {
        toggleButton.textContent = isPaused ? 'Resume Animation' : 'Pause Animation';
        toggleButton.classList.toggle('paused', isPaused);
    }
}

// Function to disable/enable all control buttons
function setControlButtonsDisabled(disabled) {
    if (!DEV_CONTROLS.enabled) return;
    
    const buttons = [
        'toggleButton',
        'toggleParticles',
        'toggleObjects',
        'testThemes'
    ];
    
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = disabled;
            if (disabled) {
                button.classList.add('disabled');
                button.style.display = 'none';  // Hide the button when disabled
            } else {
                button.classList.remove('disabled');
                button.style.display = '';  // Show the button when enabled
            }
        }
    });
}

// Toggle animation state
function toggleAnimation() {
    if (!DEV_CONTROLS.enabled || document.getElementById('toggleButton').disabled) return;
    
    // Toggle state
    DEV_CONTROLS.defaultState.animationsPaused = !DEV_CONTROLS.defaultState.animationsPaused;
    
    // Update all animations
    updateAnimationState(DEV_CONTROLS.defaultState.animationsPaused);
    
    // Update particle system
    if (particleSystem) {
        if (DEV_CONTROLS.defaultState.animationsPaused) {
            particleSystem.pause();
            if (flyingObjectsSystem) flyingObjectsSystem.pause();
        } else {
            particleSystem.resume();
            if (flyingObjectsSystem) flyingObjectsSystem.resume();
        }
    }
}

// Toggle particles visibility
function toggleParticles() {
    if (!DEV_CONTROLS.enabled || document.getElementById('toggleParticles').disabled) return;
    
    const button = document.getElementById('toggleParticles');
    const container = document.querySelector('.particle-container');
    if (container) {
        DEV_CONTROLS.defaultState.particlesHidden = !DEV_CONTROLS.defaultState.particlesHidden;
        if (!DEV_CONTROLS.defaultState.particlesHidden) {
            container.style.display = 'block';
            button.textContent = 'Hide Particles';
            button.classList.remove('hidden');
        } else {
            container.style.display = 'none';
            button.textContent = 'Show Particles';
            button.classList.add('hidden');
        }
    }
}

// Toggle flying objects visibility
function toggleObjects() {
    if (!DEV_CONTROLS.enabled || document.getElementById('toggleObjects').disabled) return;
    
    const button = document.getElementById('toggleObjects');
    const backLayer = document.querySelector('.flying-objects-back');
    const frontLayer = document.querySelector('.flying-objects-front');
    
    if (backLayer && frontLayer) {
        DEV_CONTROLS.defaultState.objectsHidden = !DEV_CONTROLS.defaultState.objectsHidden;
        
        // Just toggle visibility without recreating objects
        [backLayer, frontLayer].forEach(layer => {
            layer.style.visibility = DEV_CONTROLS.defaultState.objectsHidden ? 'hidden' : 'visible';
        });
        
        // Update button state
        button.textContent = DEV_CONTROLS.defaultState.objectsHidden ? 'Show Objects' : 'Hide Objects';
        button.classList.toggle('hidden', DEV_CONTROLS.defaultState.objectsHidden);
        
        // Ensure animation state is consistent if objects are visible
        if (!DEV_CONTROLS.defaultState.objectsHidden && DEV_CONTROLS.defaultState.animationsPaused) {
            updateAnimationState(true);
        }
    }
}

// Test themes by cycling through them
function toggleThemeTest() {
    if (!DEV_CONTROLS.enabled || document.getElementById('testThemes').disabled) return;
    
    const button = document.getElementById('testThemes');
    
    // Move to next theme
    DEV_CONTROLS.defaultState.currentThemeIndex = 
        (DEV_CONTROLS.defaultState.currentThemeIndex + 1) % TEST_THEMES.length;
    
    // Get current and next theme names
    const currentTheme = TEST_THEMES[DEV_CONTROLS.defaultState.currentThemeIndex];
    const nextTheme = TEST_THEMES[(DEV_CONTROLS.defaultState.currentThemeIndex + 1) % TEST_THEMES.length];
    
    // Update theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update button text to show current and next theme
    button.textContent = `Theme: ${currentTheme} (Next: ${nextTheme})`;
    
    // Dispatch theme change event
    const themeChangeEvent = new CustomEvent('themeChanged', {
        detail: {
            oldTheme: TEST_THEMES[(DEV_CONTROLS.defaultState.currentThemeIndex - 1 + TEST_THEMES.length) % TEST_THEMES.length],
            newTheme: currentTheme
        }
    });
    document.dispatchEvent(themeChangeEvent);
}

// Initialize developer controls
function initDevControls() {
    if (!DEV_CONTROLS.enabled) {
        // Hide developer control buttons if disabled
        const devButtons = [
            'toggleButton',
            'toggleParticles',
            'toggleObjects',
            'testThemes'
        ];
        devButtons.forEach(id => {
            const button = document.getElementById(id);
            if (button) button.style.display = 'none';
        });
    } else {
        // Set initial states
        setControlButtonsDisabled(true);  // Disable all control buttons by default
        // Initialize theme test button text
        const button = document.getElementById('testThemes');
        if (button) {
            button.textContent = `Theme: Current (Next: ${TEST_THEMES[0]})`;
        }
    }
}

// Listen for theme changes to maintain animation state
document.addEventListener('themeChanged', () => {
    if (DEV_CONTROLS.defaultState.animationsPaused) {
        // Re-apply paused state after theme change
        setTimeout(() => updateAnimationState(true), 100);
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDevControls);
