// Theme-specific flying objects
const themeObjects = {
    dark: ['⚡', '✧', '☆', '⚪', '○', '◈', '◇'],
    light: ['☀', '⚡', '★', '✦', '✧', '♦', '◆'],
    christmas: ['🎄', '⭐', '🎁', '🔔', '❄', '🎅', '🦌'],
    cyberpunk: ['⚡', '◈', '▲', '◤', '◢', '⬡', '⬢'],
    valentine: ['❤', '💕', '💝', '🌹', '✨', '💖', '💘']
};

class FlyingObject {
    constructor(type, layer = 'back') {
        this.element = document.createElement('div');
        this.element.className = `flying-object ${type}`;
        this.reset();
        
        // Set initial styles for performance
        this.element.style.willChange = 'transform, opacity';
        this.element.style.backfaceVisibility = 'hidden';
        this.element.style.webkitFontSmoothing = 'antialiased';
    }

    getThemeObject() {
        const themeStyle = getComputedStyle(document.documentElement);
        const objects = themeStyle.getPropertyValue('--flying-object')
            .replace(/'/g, '')  // Remove single quotes
            .replace(/"/g, '')  // Remove double quotes
            .split(',')         // Split into array
            .map(obj => obj.trim()) // Trim whitespace
            .filter(obj => obj);    // Remove empty strings
        
        return objects[Math.floor(Math.random() * objects.length)];
    }

    reset() {
        // Get theme-specific object
        const object = this.getThemeObject();
        if (object) {
            this.element.textContent = object;
        }

        // Reset position to start from left
        this.element.style.left = '-5vw';
        
        // Set random y position within viewport
        const randomY = 10 + Math.random() * 60;
        this.element.style.setProperty('--fly-y', `${randomY}vh`);
        
        // Set random rotation
        const rotateStart = -180 + Math.random() * 360;
        const rotateEnd = rotateStart + (Math.random() < 0.5 ? 360 : -360);
        this.element.style.setProperty('--rotate-start', `${rotateStart}deg`);
        this.element.style.setProperty('--rotate-end', `${rotateEnd}deg`);
        
        // Set random animation duration
        const duration = 15 + Math.random() * 10;
        this.element.style.animationDuration = `${duration}s`;
        
        // Reset animation
        this.element.style.animation = 'none';
        this.element.offsetHeight; // Force reflow
        this.element.style.animation = null;
        
        if (Math.random() < 0.3) { // 30% chance to add bobbing animation
            this.element.style.animation += `, bobUpDown ${2 + Math.random() * 2}s ease-in-out infinite`;
        }
    }
}

class FlyingObjectsSystem {
    constructor(count = 8) { // Reduced count for better performance
        this.objects = [];
        this.backLayer = document.createElement('div');
        this.frontLayer = document.createElement('div');
        
        this.backLayer.className = 'flying-objects-back';
        this.frontLayer.className = 'flying-objects-front';
        
        // Set styles for performance
        const layerStyle = {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden'
        };
        
        Object.assign(this.backLayer.style, layerStyle);
        Object.assign(this.frontLayer.style, layerStyle);
        
        // Adjust z-index to work better with particles
        this.backLayer.style.zIndex = '2';
        this.frontLayer.style.zIndex = '1002';
        
        document.body.insertBefore(this.backLayer, document.body.firstChild);
        document.body.appendChild(this.frontLayer);
        
        // Initialize objects in batches
        this.initializeObjects(count);
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    initializeObjects(count) {
        const batchSize = 2;
        let created = 0;
        
        const createBatch = () => {
            const batchCount = Math.min(batchSize, count - created);
            for (let i = 0; i < batchCount; i++) {
                const isBackLayer = Math.random() < 0.7; // 70% chance for back layer
                const object = new FlyingObject(this.getRandomType(), isBackLayer ? 'back' : 'front');
                const layer = isBackLayer ? this.backLayer : this.frontLayer;
                
                layer.appendChild(object.element);
                this.objects.push(object);
                created++;
            }
            
            if (created < count) {
                setTimeout(createBatch, 100);
            }
        };
        
        createBatch();
    }
    
    getRandomType() {
        const types = ['star', 'gift'];
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        // Add theme-specific types
        switch(currentTheme) {
            case 'christmas':
                types.push('sleigh', 'reindeer');
                break;
            case 'winter':
                types.push('snowflake', 'penguin');
                break;
            case 'valentine':
                types.push('heart', 'cupid');
                break;
            case 'spring':
                types.push('butterfly', 'flower');
                break;
            case 'summer':
                types.push('sun', 'bird');
                break;
            case 'autumn':
                types.push('leaf', 'acorn');
                break;
            case 'halloween':
                types.push('bat', 'ghost');
                break;
        }
        
        return types[Math.floor(Math.random() * types.length)];
    }
    
    pause() {
        this.objects.forEach(obj => {
            obj.element.style.animationPlayState = 'paused';
        });
    }
    
    resume() {
        this.objects.forEach(obj => {
            obj.element.style.animationPlayState = 'running';
        });
    }
}

// Handle theme changes
document.addEventListener('themeChanged', (event) => {
    const { oldTheme, newTheme } = event.detail;
    
    // Add transition class for smooth theme change
    document.querySelectorAll('.flying-object').forEach(obj => {
        obj.classList.add('theme-transition');
    });
    
    // Reset all flying objects with new theme
    setTimeout(() => {
        if (flyingObjectsSystem) {
            flyingObjectsSystem.objects.forEach(obj => obj.reset());
        }
        
        // Remove transition class
        document.querySelectorAll('.flying-object').forEach(obj => {
            obj.classList.remove('theme-transition');
        });
    }, 300);
});

// Initialize the flying objects system with performance optimization
let flyingObjectsSystem;
document.addEventListener('DOMContentLoaded', () => {
    // Detect if device is low-end
    const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Adjust object count based on device capability
    const objectCount = isLowEnd ? 4 : 8;
    
    // Initialize with slight delay to allow other systems to load
    setTimeout(() => {
        flyingObjectsSystem = new FlyingObjectsSystem(objectCount);
    }, 100);
});
