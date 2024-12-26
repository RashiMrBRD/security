class Snowflake {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'snowflake';
        this.reset(true);
        this.melting = false;
        this.landed = false;
        this.readyToRemove = false;
    }

    reset(initial = false) {
        // Start well above the visible area
        this.x = Math.random() * window.innerWidth;
        this.y = -100; // Increased starting height
        this.size = Math.random() * 4 + 3;
        this.baseSpeedY = Math.random() * 10 + 5;
        this.speedY = this.baseSpeedY;
        this.speedX = (Math.random() - 0.5) * 2.5;
        this.spin = Math.random() * 360;
        this.spinSpeed = (Math.random() - 0.5) * 4;
        this.element.style.width = this.element.style.height = `${this.size}px`;
        this.melting = false;
        this.landed = false;
        this.readyToRemove = false;
        this.element.classList.remove('melting', 'landed');
        this.landingY = window.innerHeight - (Math.random() * 0 - 30);
        this.meltDelay = Math.random() * 2000 + 1000;
        this.landedTime = 0;
    }

    update(mouseX, mouseY) {
        if (this.melting) return;

        if (this.landed) {
            this.landedTime += 16;
            if (this.landedTime >= this.meltDelay) {
                this.melt();
            }
            return;
        }

        // Calculate wind effect based on mouse position
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        
        const mouseDistanceX = (mouseX - screenCenterX) / screenCenterX;
        const mouseDistanceY = (mouseY - screenCenterY) / screenCenterY;
        
        const windStrength = Math.sqrt(mouseDistanceX * mouseDistanceX + mouseDistanceY * mouseDistanceY);
        const maxWindSpeed = 15;
        
        const windX = mouseDistanceX * maxWindSpeed * windStrength;
        const windY = Math.abs(mouseDistanceY) * 5;
        
        this.speedX = this.speedX * 0.95 + windX * 0.05;
        this.speedY = this.baseSpeedY + windY;

        this.x += this.speedX;
        this.y += this.speedY;
        
        this.spin += this.spinSpeed + (windStrength * 2);

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            const angle = Math.atan2(dy, dx);
            const repelForce = (150 - distance) / 150;
            const turbulence = Math.sin(Date.now() / 100) * repelForce * 2;
            this.speedX -= (Math.cos(angle) * repelForce + turbulence) * 2;
            this.speedY -= (Math.sin(angle) * repelForce + turbulence) * 2;
        }

        // Handle boundaries
        if (this.y >= this.landingY) {
            this.land();
        } else if (this.x < -20) {
            this.x = window.innerWidth + 20;
        } else if (this.x > window.innerWidth + 20) {
            this.x = -20;
        }

        // Remove if it falls too far below the screen
        if (this.y > window.innerHeight + 100) {
            this.readyToRemove = true;
        }

        this.updateTransform();
    }

    updateTransform() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.spin}deg)`;
    }

    land() {
        if (this.landed || this.melting) return;
        this.landed = true;
        this.element.classList.add('landed');
        this.speedX = 0;
        this.speedY = 0;
        this.updateTransform();
    }

    melt() {
        if (this.melting) return;
        this.melting = true;
        this.element.classList.add('melting');
        
        setTimeout(() => {
            this.readyToRemove = true;
        }, 1000);
    }
}

function createSnowfall() {
    const snowfall = document.getElementById('snowfall');
    const snowflakes = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let lastSpawnTime = Date.now();
    const spawnInterval = 50;
    const maxSnowflakes = 300; // Reduced for better performance

    // Initial batch of snowflakes
    for (let i = 0; i < 100; i++) { // Start with fewer snowflakes
        const snowflake = new Snowflake();
        snowfall.appendChild(snowflake.element);
        snowflakes.push(snowflake);
    }

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animation loop with continuous generation
    function animate() {
        const currentTime = Date.now();

        // Generate new snowflakes periodically
        if (currentTime - lastSpawnTime > spawnInterval && snowflakes.length < maxSnowflakes) {
            lastSpawnTime = currentTime;
            const newSnowflake = new Snowflake();
            snowfall.appendChild(newSnowflake.element);
            snowflakes.push(newSnowflake);
        }

        // Update and clean up snowflakes
        for (let i = snowflakes.length - 1; i >= 0; i--) {
            const snowflake = snowflakes[i];
            snowflake.update(mouseX, mouseY);

            // Remove melted snowflakes
            if (snowflake.readyToRemove) {
                snowfall.removeChild(snowflake.element);
                snowflakes.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    // Start animation
    requestAnimationFrame(animate);

    // Handle window resize
    window.addEventListener('resize', () => {
        const height = window.innerHeight;
        
        // Update landing positions for existing snowflakes
        snowflakes.forEach(snowflake => {
            if (!snowflake.landed) {
                snowflake.landingY = height - (Math.random() * 0 - 30);
            }
        });
    });
}

// Diagnostic System
class DiagnosticSystem {
    constructor() {
        this.diagnostics = [
            { name: 'Website Status', status: 'pending', details: '' },
            { name: 'Memory Usage', status: 'pending', details: '' },
            { name: 'CPU Load', status: 'pending', details: '' },
            { name: 'Network Connectivity', status: 'pending', details: '' },
            { name: 'System Response', status: 'pending', details: '' },
            { name: 'Graphics Performance', status: 'pending', details: '' }
        ];
        this.currentTest = 0;
        this.isRunning = false;
        this.popup = document.querySelector('.diagnostic-popup');
        this.messageElement = document.querySelector('.diagnostic-message');
        this.progressBar = document.querySelector('.progress-bar');
        this.websiteUrl = 'https://rashlink.eu.org'; // Replace with actual website URL
        this.setupEventListeners();
    }

    setupEventListeners() {
        const diagnosticButton = document.querySelector('button[data-text="Run Diagnostics"]');
        const closeButton = document.querySelector('.close-diagnostic');
        
        if (diagnosticButton) {
            diagnosticButton.addEventListener('click', () => {
                this.showPopup();
                this.runDiagnostics();
            });
        }

        if (closeButton) {
            closeButton.addEventListener('click', () => this.hidePopup());
        }

        // Close on background click
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.hidePopup();
            }
        });
    }

    showPopup() {
        this.popup.style.display = 'flex';
        setTimeout(() => {
            this.popup.classList.add('active');
        }, 10);
    }

    hidePopup() {
        this.popup.classList.remove('active');
        setTimeout(() => {
            this.popup.style.display = 'none';
        }, 300);
    }

    async runDiagnostics() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.currentTest = 0;
        this.messageElement.textContent = 'Initiating diagnostic sequence...\n';
        this.updateProgress(0);

        for (const diagnostic of this.diagnostics) {
            diagnostic.status = 'pending';
            diagnostic.details = '';
        }

        await this.runNextTest();
    }

    updateProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
    }

    async runNextTest() {
        if (this.currentTest >= this.diagnostics.length) {
            this.finalizeDiagnostics();
            return;
        }

        const currentDiagnostic = this.diagnostics[this.currentTest];
        this.updateMessage(`Running ${currentDiagnostic.name} test...\n`);
        this.updateProgress((this.currentTest / this.diagnostics.length) * 100);

        switch (currentDiagnostic.name) {
            case 'Website Status':
                await this.checkWebsiteStatus();
                break;
            case 'Memory Usage':
                await this.checkMemory();
                break;
            case 'CPU Load':
                await this.checkCPU();
                break;
            case 'Network Connectivity':
                await this.checkNetwork();
                break;
            case 'System Response':
                await this.checkSystemResponse();
                break;
            case 'Graphics Performance':
                await this.checkGraphics();
                break;
        }

        this.currentTest++;
        await this.runNextTest();
    }

    async checkWebsiteStatus() {
        await this.simulateTest();
        const diagnostic = this.diagnostics[0];
        
        try {
            const isActive = Math.random() < 0.5; // Simulated status check
            
            if (isActive) {
                diagnostic.status = 'success';
                diagnostic.details = 'Website is active';
                this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
                this.updateMessage(`Redirection available: ${this.websiteUrl}\n`);
            } else {
                diagnostic.status = 'error';
                diagnostic.details = 'Website is not accessible';
                this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
                this.updateMessage('ERROR: Site cannot be reached. Please contact your administrator.\n');
                this.updateMessage('Contact: admin@example.com\n');
            }
        } catch (error) {
            diagnostic.status = 'error';
            diagnostic.details = 'Error checking website status';
            this.updateMessage(`${diagnostic.details} - ERROR\n`);
        }
    }

    async checkMemory() {
        await this.simulateTest();
        const usage = Math.round(Math.random() * 30 + 60);
        const diagnostic = this.diagnostics[1];
        diagnostic.status = usage > 80 ? 'warning' : 'success';
        diagnostic.details = `Memory usage: ${usage}%`;
        this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async checkCPU() {
        await this.simulateTest();
        const load = Math.round(Math.random() * 40 + 30);
        const diagnostic = this.diagnostics[2];
        diagnostic.status = load > 90 ? 'warning' : 'success';
        diagnostic.details = `CPU load: ${load}%`;
        this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async checkNetwork() {
        await this.simulateTest();
        const latency = Math.round(Math.random() * 100 + 20);
        const diagnostic = this.diagnostics[3];
        diagnostic.status = latency > 100 ? 'warning' : 'success';
        diagnostic.details = `Network latency: ${latency}ms`;
        this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async checkSystemResponse() {
        await this.simulateTest();
        const response = Math.round(Math.random() * 200 + 100);
        const diagnostic = this.diagnostics[4];
        diagnostic.status = response > 250 ? 'warning' : 'success';
        diagnostic.details = `Response time: ${response}ms`;
        this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async checkGraphics() {
        await this.simulateTest();
        const fps = Math.round(Math.random() * 30 + 30);
        const diagnostic = this.diagnostics[5];
        diagnostic.status = fps < 30 ? 'warning' : 'success';
        diagnostic.details = `Graphics FPS: ${fps}`;
        this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async simulateTest() {
        const duration = Math.random() * 1000 + 500;
        await new Promise(resolve => setTimeout(resolve, duration));
    }

    finalizeDiagnostics() {
        this.isRunning = false;
        const warnings = this.diagnostics.filter(d => d.status === 'warning').length;
        const errors = this.diagnostics.filter(d => d.status === 'error').length;
        
        let summary = '';
        if (errors > 0) {
            summary = `Diagnostic complete. Found ${errors} error(s) and ${warnings} warning(s). Critical attention required.\n`;
        } else if (warnings > 0) {
            summary = `Diagnostic complete. Found ${warnings} warning(s). System requires attention.\n`;
        } else {
            summary = 'Diagnostic complete. All systems operating within normal parameters.\n';
        }
        
        this.updateMessage(summary);
        this.updateProgress(100);
    }

    updateMessage(text) {
        if (this.messageElement) {
            this.messageElement.textContent += text;
            this.messageElement.scrollTop = this.messageElement.scrollHeight;
        }
    }
}

class LogSystem {
    constructor() {
        this.logs = [];
        this.popup = document.querySelector('.logs-popup');
        this.messageElement = document.querySelector('.logs-message');
        this.currentFilter = 'all';
        this.setupEventListeners();
        this.generateSampleLogs();
    }

    setupEventListeners() {
        const logsButton = document.querySelector('button[data-text="View Logs"]');
        const closeButton = document.querySelector('.close-logs');
        const filterButtons = document.querySelectorAll('.log-filter');
        
        if (logsButton) {
            logsButton.addEventListener('click', () => this.showPopup());
        }

        if (closeButton) {
            closeButton.addEventListener('click', () => this.hidePopup());
        }

        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.hidePopup();
            }
        });

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentFilter = button.getAttribute('data-filter');
                this.displayLogs();
            });
        });
    }

    showPopup() {
        this.popup.style.display = 'flex';
        setTimeout(() => {
            this.popup.classList.add('active');
        }, 10);
        this.displayLogs();
    }

    hidePopup() {
        this.popup.classList.remove('active');
        setTimeout(() => {
            this.popup.style.display = 'none';
        }, 300);
    }

    addLog(type, message, timestamp = new Date()) {
        this.logs.unshift({
            type,
            message,
            timestamp
        });
        if (this.popup.classList.contains('active')) {
            this.displayLogs();
        }
    }

    generateSampleLogs() {
        const currentTime = new Date('2024-12-26T11:47:39+08:00');
        
        // Sample logs with different timestamps
        this.addLog('error', 'Failed to connect to main server', new Date(currentTime - 1000 * 60 * 5));
        this.addLog('warning', 'High memory usage detected: 85%', new Date(currentTime - 1000 * 60 * 10));
        this.addLog('info', 'System maintenance scheduled for 27/12/2024', new Date(currentTime - 1000 * 60 * 15));
        this.addLog('error', 'Database connection timeout', new Date(currentTime - 1000 * 60 * 20));
        this.addLog('info', 'Backup completed successfully', new Date(currentTime - 1000 * 60 * 25));
        this.addLog('warning', 'CPU temperature above normal: 75°C', new Date(currentTime - 1000 * 60 * 30));
        this.addLog('info', 'System update available: v2.1.0', new Date(currentTime - 1000 * 60 * 35));
        this.addLog('error', 'SSL certificate expiring in 2 days', new Date(currentTime - 1000 * 60 * 40));
        this.addLog('info', 'Automatic backup initiated', new Date(currentTime - 1000 * 60 * 45));
        this.addLog('warning', 'Network latency spike detected: 150ms', new Date(currentTime - 1000 * 60 * 50));
    }

    displayLogs() {
        if (!this.messageElement) return;

        const filteredLogs = this.logs.filter(log => 
            this.currentFilter === 'all' || log.type === this.currentFilter
        );

        this.messageElement.innerHTML = filteredLogs.map(log => {
            const time = log.timestamp.toLocaleTimeString();
            const date = log.timestamp.toLocaleDateString();
            return `<div class="log-entry ${log.type}">
                <span class="log-timestamp">[${date} ${time}]</span>
                <span class="log-type">${log.type.toUpperCase()}</span>
                <span class="log-message">${log.message}</span>
            </div>`;
        }).join('');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createSnowfall();
    new DiagnosticSystem();
    new LogSystem();
});
