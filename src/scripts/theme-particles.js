class ThemeParticle {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'theme-particle';
        
        // Use transform3d for hardware acceleration
        this.element.style.willChange = 'transform';
        this.element.style.backfaceVisibility = 'hidden';
        this.element.style.webkitFontSmoothing = 'antialiased';
        
        this.reset();
    }

    getThemeSymbols() {
        const themeStyle = getComputedStyle(document.documentElement);
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let particleChars;

        // Get theme-specific particle characters
        if (currentTheme) {
            const themeElement = document.createElement('div');
            themeElement.setAttribute('data-theme', currentTheme);
            document.body.appendChild(themeElement);
            const themeStyle = getComputedStyle(themeElement);
            particleChars = themeStyle.getPropertyValue('--particle-characters');
            document.body.removeChild(themeElement);
        } else {
            // Fallback to root theme if no specific theme
            particleChars = themeStyle.getPropertyValue('--particle-characters');
        }

        const chars = particleChars
            .replace(/'/g, '')  // Remove single quotes
            .replace(/"/g, '')  // Remove double quotes
            .split(',')         // Split into array
            .map(char => char.trim()) // Trim whitespace
            .filter(char => char);    // Remove empty strings
        
        // Ensure all characters are used by repeating the array if needed
        const minParticles = 30; // Minimum number of particles
        while (chars.length < minParticles) {
            chars.push(...chars);
        }
        return chars;
    }

    reset() {
        const symbols = this.getThemeSymbols();
        const themeStyle = getComputedStyle(document.documentElement);
        const theme = themeStyle.getPropertyValue('--animation-name').trim();
        
        // For winter theme, ensure even distribution of particles
        if (theme === 'newBeginning') {
            // Get the particle index based on the total count to ensure all types are used
            const particleCount = document.querySelectorAll('.theme-particle').length;
            const currentIndex = Array.from(document.querySelectorAll('.theme-particle')).indexOf(this.element);
            this.element.textContent = symbols[currentIndex % symbols.length];
        } else {
            this.element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        }

        // Position and movement
        this.x = Math.random() * window.innerWidth;
        this.y = -50;
        this.size = Math.random() * 10 + 8;
        
        // Get animation style from CSS
        const animationName = themeStyle.getPropertyValue('--animation-name')
            .replace(/'/g, '')
            .replace(/"/g, '')
            .trim();
        
        // Reset transform and opacity
        this.element.style.transform = 'translate3d(0, 0, 0) scale(1)';
        this.element.style.opacity = '1';
        
        // Theme-specific animations
        switch(animationName) {
            case 'newBeginning':
                // Enhanced winter animation with particle-specific behavior
                const particleType = this.element.textContent;
                switch(particleType) {
                    case '❄': // Snowflake
                        this.speedX = (Math.random() - 0.5) * 0.8;
                        this.speedY = Math.random() * 0.3 + 0.2;
                        this.rotation = Math.random() * 360;
                        this.rotationSpeed = (Math.random() - 0.5) * 3;
                        break;
                    case '❅': // Different snowflake
                        this.speedX = (Math.random() - 0.5) * 0.6;
                        this.speedY = Math.random() * 0.4 + 0.15;
                        this.rotation = Math.random() * 360;
                        this.rotationSpeed = (Math.random() - 0.5) * 2;
                        break;
                    case '❆': // Crystal
                        this.speedX = (Math.random() - 0.5) * 0.4;
                        this.speedY = Math.random() * 0.5 + 0.1;
                        this.rotation = Math.random() * 360;
                        this.rotationSpeed = (Math.random() - 0.5) * 4;
                        break;
                    case '✧': // Star
                        this.speedX = (Math.random() - 0.5) * 0.3;
                        this.speedY = Math.random() * 0.2 + 0.1;
                        this.rotation = Math.random() * 360;
                        this.rotationSpeed = (Math.random() - 0.5) * 1;
                        break;
                    case '✦': // Different star
                        this.speedX = (Math.random() - 0.5) * 0.5;
                        this.speedY = Math.random() * 0.3 + 0.15;
                        this.rotation = Math.random() * 360;
                        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
                        break;
                }
                // Common properties for all winter particles
                this.scale = Math.random() * 0.5 + 0.8;
                this.scaleSpeed = (Math.random() - 0.5) * 0.01;
                this.opacity = Math.random() * 0.3 + 0.7;
                this.opacitySpeed = (Math.random() - 0.5) * 0.01;
                break;
            case 'snowfall':
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = Math.random() * 0.3 + 0.2;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = (Math.random() - 0.5) * 2;
                break;
            case 'float':
                this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.4;
                this.speedY = Math.random() * 0.2 + 0.1;
                this.amplitude = Math.random() * 50 + 25;
                this.period = Math.random() * 4 + 2;
                this.phase = Math.random() * Math.PI * 2;
                break;
            case 'sparkle':
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = Math.random() * 0.3 + 0.15;
                this.scale = 1;
                this.scaleSpeed = (Math.random() - 0.5) * 0.02;
                break;
            case 'flutter':
                this.speedX = (Math.random() - 0.5) * 0.6;
                this.speedY = Math.random() * 0.2 + 0.1;
                this.amplitude = Math.random() * 30 + 15;
                this.period = Math.random() * 3 + 1.5;
                this.phase = Math.random() * Math.PI * 2;
                break;
            case 'wave':
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = Math.random() * 0.2 + 0.1;
                this.amplitude = Math.random() * 40 + 20;
                this.period = Math.random() * 5 + 3;
                this.phase = Math.random() * Math.PI * 2;
                break;
            case 'spooky':
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = Math.random() * 0.4 + 0.2;
                this.scale = 1;
                this.scaleSpeed = (Math.random() - 0.5) * 0.03;
                this.opacity = 1;
                this.opacitySpeed = (Math.random() - 0.5) * 0.02;
                break;
            default:
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = Math.random() * 0.5 + 0.2;
        }
        
        // Apply initial styles
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.fontSize = `${this.size}px`;
    }

    updatePosition() {
        // Use transform3d for better performance
        let transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.rotation}deg)`;
        
        const themeStyle = getComputedStyle(document.documentElement);
        const animationName = themeStyle.getPropertyValue('--animation-name').trim();
        
        if (animationName === 'newBeginning') {
            // Update winter particle effects
            transform += ` scale(${this.scale})`;
            this.element.style.opacity = this.opacity;
        }
        if (animationName === 'sparkle') {
            transform += ` scale(${this.scale})`;
        }
        if (animationName === 'flutter') {
            const offsetX = Math.sin(this.angle) * this.amplitude;
            transform = `translate3d(${this.x + offsetX}px, ${this.y}px, 0) rotate(${this.rotation}deg)`;
        }
        if (animationName === 'shine') {
            this.element.style.opacity = this.opacity;
        }
        
        this.element.style.transform = transform;
    }

    update(deltaTime) {
        // Use delta time for frame-rate independent movement
        this.x += this.speedX * deltaTime;
        this.y += this.speedY * deltaTime;
        this.rotation += this.rotationSpeed * deltaTime;

        const themeStyle = getComputedStyle(document.documentElement);
        const animationName = themeStyle.getPropertyValue('--animation-name').trim();
        
        if (animationName === 'newBeginning') {
            // Update winter particle effects
            this.scale += this.scaleSpeed * deltaTime;
            if (this.scale < 0.8 || this.scale > 1.3) this.scaleSpeed *= -1;
            
            this.opacity += this.opacitySpeed * deltaTime;
            if (this.opacity < 0.7 || this.opacity > 1) this.opacitySpeed *= -1;
        }
        if (animationName === 'sparkle') {
            this.scale += this.scaleSpeed * deltaTime;
            if (this.scale < 0.5 || this.scale > 1.5) this.scaleSpeed *= -1;
        }
        if (animationName === 'flutter') {
            this.angle += 0.01 * deltaTime;
        }
        if (animationName === 'shine') {
            this.opacity += this.opacitySpeed * deltaTime;
            if (this.opacity < 0.3 || this.opacity > 1) this.opacitySpeed *= -1;
        }

        if (this.y > window.innerHeight + 50) {
            this.reset();
        }

        if (this.x < -50) this.x = window.innerWidth + 50;
        if (this.x > window.innerWidth + 50) this.x = -50;

        this.updatePosition();
    }
}

class ParticleSystem {
    constructor(count = 30) { // Reduced particle count for better performance
        this.particles = [];
        this.container = document.createElement('div');
        this.container.className = 'particle-container';
        
        // Position the container behind other content
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.zIndex = '1';
        this.container.style.pointerEvents = 'none';
        this.container.style.overflow = 'hidden';
        
        document.body.insertBefore(this.container, document.body.firstChild);
        
        // Create particles in batches for better initial load
        this.initializeParticles(count);
        
        // Handle visibility change to pause/resume animations
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Handle theme changes with transition effect
        document.addEventListener('themeChanged', (event) => {
            const { oldTheme, newTheme } = event.detail;
            
            // Add transition class for smooth theme change
            document.querySelectorAll('.theme-particle').forEach(particle => {
                particle.classList.add('theme-transition');
            });
            
            // Reset particles with new theme
            setTimeout(() => {
                if (particleSystem) {
                    particleSystem.particles.forEach(particle => particle.reset());
                }
                
                // Remove transition class
                document.querySelectorAll('.theme-particle').forEach(particle => {
                    particle.classList.remove('theme-transition');
                });
            }, 300);
        });
    }

    initializeParticles(count) {
        const batchSize = 10; // Increased from 5 to 10
        let created = 0;
        
        const createBatch = () => {
            const batchCount = Math.min(batchSize, count - created);
            for (let i = 0; i < batchCount; i++) {
                const particle = new ThemeParticle();
                // Set initial position to spread particles across the screen
                particle.x = (window.innerWidth * ((created + i) / count)) % window.innerWidth;
                particle.y = Math.random() * window.innerHeight;
                this.container.appendChild(particle.element);
                this.particles.push(particle);
                created++;
            }
            
            if (created < count) {
                setTimeout(createBatch, 50); // Reduced delay from 100ms to 50ms
            }
        };
        
        createBatch();
    }

    pause() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    resume() {
        if (!this.animationFrame) {
            this.lastTime = performance.now();
            this.animate();
        }
    }

    updateParticles(deltaTime) {
        this.particles.forEach(particle => particle.update(deltaTime));
    }

    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 16; // Normalize to ~60fps
        this.lastTime = currentTime;

        this.updateParticles(deltaTime);
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

// Initialize the particle system with performance optimization
let particleSystem;
document.addEventListener('DOMContentLoaded', () => {
    // Detect if device is low-end
    const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Adjust particle count based on device capability
    const particleCount = isLowEnd ? 30 : 60; // Increased from 15/30 to 30/60
    
    // Initialize with slight delay to allow other systems to load
    setTimeout(() => {
        particleSystem = new ParticleSystem(particleCount);
        particleSystem.resume();
    }, 200);
});

// Listen for theme changes to update particles
document.addEventListener('themeChanged', () => {
    if (particleSystem && particleSystem.particles) {
        // Ensure particles are evenly distributed across the screen
        particleSystem.particles.forEach((particle, index) => {
            // Set initial x position to spread particles across the screen width
            particle.x = (window.innerWidth * (index / particleSystem.particles.length)) % window.innerWidth;
            particle.y = Math.random() * window.innerHeight; // Random height
            particle.reset();
        });
    }
});
