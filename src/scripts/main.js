// Enhanced snowfall effect with cursor interaction
function createSnowfall() {
    const snowfall = document.getElementById('snowfall');
    const snowflakes = ['❄', '❅', '❆', '*', '•'];
    const numberOfSnowflakes = 50;
    let mouseX = 0;
    let mouseY = 0;
    const interactionDistance = 100; // Distance in pixels where cursor affects snowflakes
    const maxDeflection = 50; // Maximum pixels a snowflake can be pushed

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        snowflake.style.opacity = Math.random();
        snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        
        // Store original position
        snowflake.originalLeft = parseFloat(snowflake.style.left);
        
        snowfall.appendChild(snowflake);

        // Reset snowflake position when animation ends
        snowflake.addEventListener('animationend', () => {
            snowflake.style.left = `${Math.random() * 100}vw`;
            snowflake.originalLeft = parseFloat(snowflake.style.left);
            snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        });

        return snowflake;
    }

    // Create initial snowflakes
    const snowflakeElements = Array.from({ length: numberOfSnowflakes }, createSnowflake);

    // Update snowflake positions based on cursor
    function updateSnowflakes() {
        snowflakeElements.forEach(snowflake => {
            const rect = snowflake.getBoundingClientRect();
            const snowflakeX = rect.left + rect.width / 2;
            const snowflakeY = rect.top + rect.height / 2;

            // Calculate distance from cursor to snowflake
            const dx = mouseX - snowflakeX;
            const dy = mouseY - snowflakeY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < interactionDistance) {
                // Calculate deflection amount
                const deflection = (1 - distance / interactionDistance) * maxDeflection;
                const angle = Math.atan2(dy, dx);
                
                // Push snowflake away from cursor
                const pushX = -Math.cos(angle) * deflection;
                
                // Apply transform
                snowflake.style.transform = `translateX(${pushX}px)`;
            } else {
                // Reset transform when cursor is far away
                snowflake.style.transform = 'none';
            }
        });

        requestAnimationFrame(updateSnowflakes);
    }

    // Start the animation loop
    updateSnowflakes();
}

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
        this.websiteUrl = this.detectWebsiteUrl();
        this.setupEventListeners();
    }

    detectWebsiteUrl() {
        // Default fallback URL
        const defaultUrl = 'https://rashlink.eu.org';
        
        try {
            // Get the current hostname
            const currentHostname = window.location.hostname;
            
            // Define known domain mappings
            const domainMappings = {
                'rashlink.eu.org': 'https://rashlink.eu.org',
                'transmit.rashlink.eu.org': 'https://transmit.rashlink.eu.org',
                'localhost': 'https://rashlink.eu.org', // Local development fallback
                '127.0.0.1': 'https://rashlink.eu.org'  // Local development fallback
            };
            
            // Check if we're running locally (file protocol)
            if (window.location.protocol === 'file:') {
                console.log('Running from local file system, using default URL');
                return defaultUrl;
            }
            
            // Get the mapped URL or use the current origin
            const mappedUrl = domainMappings[currentHostname];
            if (mappedUrl) {
                console.log(`Domain mapping found: ${mappedUrl}`);
                return mappedUrl;
            }
            
            // If no mapping found, construct URL from current origin
            const currentUrl = window.location.origin;
            console.log(`Using current origin: ${currentUrl}`);
            return currentUrl;
            
        } catch (error) {
            console.warn('Error detecting website URL:', error);
            return defaultUrl;
        }
    }

    updateWebsiteUrl() {
        const newUrl = this.detectWebsiteUrl();
        if (this.websiteUrl !== newUrl) {
            console.log(`Updating website URL from ${this.websiteUrl} to ${newUrl}`);
            this.websiteUrl = newUrl;
        }
    }

    formatDomainDisplay(url) {
        try {
            const hostname = new URL(url).hostname;
            // Convert 127.0.0.1 to localhost
            if (hostname === '127.0.0.1') {
                return 'localhost';
            }
            return hostname;
        } catch (error) {
            return url;
        }
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
        
        // Clear previous messages
        this.messageElement.innerHTML = '';
        
        await this.updateMessage('=== SYSTEM DIAGNOSTIC SEQUENCE ===\n\n');
        await this.updateMessage('Initializing diagnostic protocols...\n');
        await this.simulateTest(800, 1200);
        await this.updateMessage('Loading test modules...\n');
        await this.simulateTest(500, 800);
        await this.updateMessage('Beginning system analysis...\n\n');
        
        this.updateProgress(0);

        for (const diagnostic of this.diagnostics) {
            diagnostic.status = 'pending';
            diagnostic.details = '';
        }

        await this.runNextTest();
    }

    async updateMessage(text, speed = 30) {
        // Create a new div for this message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'diagnostic-line';
        this.messageElement.appendChild(messageDiv);

        // Type the text with animation
        await typeText(messageDiv, text, speed);

        // Scroll to the bottom
        this.messageElement.scrollTop = this.messageElement.scrollHeight;
    }

    async simulateTest(minDuration = 500, maxDuration = 1500) {
        const duration = Math.random() * (maxDuration - minDuration) + minDuration;
        await new Promise(resolve => setTimeout(resolve, duration));
    }

    async runNextTest() {
        if (this.currentTest >= this.diagnostics.length) {
            await this.finalizeDiagnostics();
            return;
        }

        const currentDiagnostic = this.diagnostics[this.currentTest];
        await this.updateMessage(`\n>>> Running ${currentDiagnostic.name} test...\n`, 40);
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

    async finalizeDiagnostics() {
        this.updateProgress(100);
        this.isRunning = false;

        await this.updateMessage('\n=== DIAGNOSTIC SUMMARY ===\n\n');
        
        for (const diagnostic of this.diagnostics) {
            const statusSymbol = diagnostic.status === 'success' ? '✓' :
                               diagnostic.status === 'warning' ? '⚠' : '✗';
            const statusColor = diagnostic.status === 'success' ? 'color: #4CAF50' :
                              diagnostic.status === 'warning' ? 'color: #FFC107' : 'color: #F44336';
            
            await this.updateMessage(`${statusSymbol} ${diagnostic.name}: ${diagnostic.details}\n`);
        }

        await this.updateMessage('\nDiagnostic sequence complete.\n');
        await this.simulateTest(500, 800);
        await this.updateMessage('Generating final report...\n');
        
        const overallStatus = this.diagnostics.every(d => d.status === 'success') ? 'HEALTHY' :
                            this.diagnostics.some(d => d.status === 'error') ? 'CRITICAL' : 'WARNING';
        
        await this.updateMessage(`\nSystem Status: ${overallStatus}\n`);
        await this.updateMessage('Time: ' + new Date().toLocaleString() + '\n');
    }

    updateProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
    }

    async checkWebsiteStatus() {
        await this.simulateTest();
        const diagnostic = this.diagnostics[0];
        
        // Update website URL before checking
        this.updateWebsiteUrl();
        
        const currentDomain = window.location.hostname || 'Local File System';
        
        await this.updateMessage('\n=== INITIATING WEBSITE STATUS CHECK ===\n');
        await this.updateMessage(`Current Domain: ${currentDomain === '127.0.0.1' ? 'localhost' : currentDomain}\n`);
        await this.updateMessage('Performing DNS lookup...\n');
        
        try {
            // First, try DNS resolution
            try {
                const dnsCheck = await fetch(`https://dns.google/resolve?name=${new URL(this.websiteUrl).hostname}`);
                const dnsResult = await dnsCheck.json();
                
                if (!dnsResult.Answer) {
                    diagnostic.status = 'error';
                    diagnostic.details = 'DNS Resolution Failed';
                    await this.updateMessage('\n=== DNS ERROR REPORT ===\n');
                    await this.updateMessage('Status: DNS ERROR\n');
                    await this.updateMessage('Technical Details: Unable to resolve domain name\n');
                    await this.updateMessage(`Domain: ${new URL(this.websiteUrl).hostname}\n`);
                    await this.updateMessage('Impact: Domain name cannot be found on the internet\n');
                    await this.updateMessage('\nTroubleshooting Steps:\n');
                    await this.updateMessage('1. Verify the domain name is correct\n');
                    await this.updateMessage('2. Check if the domain has expired\n');
                    await this.updateMessage('3. Contact your DNS provider\n');
                    return;
                }
            } catch (dnsError) {
                // Continue even if DNS check fails, as the main fetch might still work
                await this.updateMessage('DNS check unavailable, proceeding with direct connection...\n');
            }
            
            await this.updateMessage('Establishing connection...\n');
            
            // Attempt to fetch with timeout
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            try {
                const response = await fetch(this.websiteUrl, {
                    signal: controller.signal,
                    mode: 'cors',
                    credentials: 'omit'
                });
                
                clearTimeout(timeout);
                const text = await response.text();
                
                // Check for specific error conditions
                const isArgoTunnelError = text.includes('Error 1033') || text.includes('Argo Tunnel error');
                const isBadGateway = response.status === 502 || text.includes('Bad gateway') || text.includes('Error code 502');
                const isDNSError = text.includes('DNS_PROBE_FINISHED') || text.includes('ERR_NAME_NOT_RESOLVED');
                
                if (isArgoTunnelError) {
                    diagnostic.status = 'error';
                    diagnostic.details = 'Argo Tunnel Connection Error';
                    await this.updateMessage('\n=== CLOUDFLARE TUNNEL ERROR ===\n');
                    await this.updateMessage('Status: ERROR 1033\n');
                    await this.updateMessage('Technical Details: Argo Tunnel connectivity issue detected\n');
                    await this.updateMessage('Impact: Unable to establish secure tunnel connection\n');
                    await this.updateMessage('\nTroubleshooting Steps:\n');
                    await this.updateMessage('1. Cloudflare Tunnel service may be down\n');
                    await this.updateMessage('2. Server might be experiencing connectivity issues\n');
                    await this.updateMessage('3. Please try again in a few minutes\n');
                    return;
                }
                
                if (isBadGateway) {
                    diagnostic.status = 'error';
                    diagnostic.details = 'Bad Gateway Error';
                    await this.updateMessage('\n=== BAD GATEWAY ERROR ===\n');
                    await this.updateMessage('Status: ERROR 502\n');
                    await this.updateMessage('Technical Details: Server returned Bad Gateway response\n');
                    await this.updateMessage('Impact: Server is unable to process the request\n');
                    await this.updateMessage('\nTroubleshooting Steps:\n');
                    await this.updateMessage('1. Server might be overloaded\n');
                    await this.updateMessage('2. Backend service might be down\n');
                    await this.updateMessage('3. Please try again in a few minutes\n');
                    return;
                }
                
                if (response.ok) {
                    diagnostic.status = 'success';
                    diagnostic.details = 'Website is active and responding normally';
                    await this.updateMessage('\n=== WEBSITE STATUS: HEALTHY ===\n');
                    await this.updateMessage(`HTTP Status: ${response.status} ${response.statusText}\n`);
                    await this.updateMessage('Connection: Established successfully\n');
                    await this.updateMessage('Security: Connection is secure (HTTPS)\n');
                    await this.updateMessage('\nRedirecting to website in 3 seconds...\n');
                    
                    setTimeout(() => {
                        window.location.href = this.websiteUrl;
                    }, 3000);
                } else {
                    diagnostic.status = 'error';
                    diagnostic.details = `Server Error: ${response.status}`;
                    await this.updateMessage('\n=== SERVER ERROR REPORT ===\n');
                    await this.updateMessage(`Status: HTTP ${response.status} ${response.statusText}\n`);
                    await this.updateMessage('Technical Details: Server returned an error response\n');
                    await this.updateMessage(`Impact: Server responded with status code ${response.status}\n`);
                    await this.updateMessage('\nTroubleshooting Steps:\n');
                    await this.updateMessage('1. The server might be experiencing issues\n');
                    await this.updateMessage('2. Please try again in a few minutes\n');
                }
            } catch (fetchError) {
                clearTimeout(timeout);
                throw fetchError; // Re-throw to be caught by outer try-catch
            }
            
        } catch (error) {
            diagnostic.status = 'error';
            diagnostic.details = 'Connection Failed';
            
            await this.updateMessage('\n=== CONNECTION ERROR REPORT ===\n');
            await this.updateMessage('Status: CRITICAL ERROR\n');
            await this.updateMessage('Technical Details: Unable to establish connection to the server\n');
            
            if (error.name === 'AbortError') {
                await this.updateMessage('Error Type: Connection Timeout\n');
                await this.updateMessage('Impact: Server took too long to respond\n');
            } else {
                await this.updateMessage(`Error Type: ${error.name}\n`);
                await this.updateMessage(`Error Details: ${error.message}\n`);
            }
            
            await this.updateMessage('\nTroubleshooting Steps:\n');
            await this.updateMessage('1. Check your internet connection\n');
            await this.updateMessage('2. Verify the website URL is correct\n');
            await this.updateMessage('3. Try accessing the website in a different browser\n');
            await this.updateMessage('4. The server might be temporarily unavailable\n');
        }
        
        if (diagnostic.status === 'error') {
            await this.updateMessage('\nFor assistance:\n');
            await this.updateMessage('Contact administrator: mail@rashlink.eu.org\n');
            await this.updateMessage(`Reference Time: ${new Date().toISOString()}\n`);
        }
    }

    async checkMemory() {
        await this.simulateTest();
        const diagnostic = this.diagnostics[1];
        
        try {
            const performanceMemory = performance.memory;
            if (performanceMemory) {
                const usedMemory = performanceMemory.usedJSHeapSize;
                const totalMemory = performanceMemory.jsHeapSizeLimit;
                const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);
                
                diagnostic.status = memoryUsagePercent > 80 ? 'warning' : 'success';
                diagnostic.details = `Memory Usage: ${memoryUsagePercent}% (${this.formatBytes(usedMemory)} / ${this.formatBytes(totalMemory)})`;
            } else {
                // Fallback to navigator.deviceMemory if available
                const deviceMemory = navigator.deviceMemory;
                if (deviceMemory) {
                    diagnostic.status = 'success';
                    diagnostic.details = `Available Device Memory: ${deviceMemory}GB`;
                } else {
                    diagnostic.status = 'warning';
                    diagnostic.details = 'Memory information unavailable';
                }
            }
        } catch (error) {
            diagnostic.status = 'warning';
            diagnostic.details = 'Unable to measure memory usage';
        }
        await this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async checkCPU() {
        await this.simulateTest();
        const diagnostic = this.diagnostics[2];
        const startTime = performance.now();
        
        try {
            // Measure CPU load by timing a complex operation
            let load = 0;
            const measurements = [];
            
            for (let i = 0; i < 5; i++) {
                const start = performance.now();
                // Perform a CPU-intensive task
                for (let j = 0; j < 1000000; j++) {
                    Math.sqrt(j);
                }
                const end = performance.now();
                measurements.push(end - start);
            }
            
            // Calculate average time and normalize to a percentage
            const avgTime = measurements.reduce((a, b) => a + b) / measurements.length;
            const baselineTime = 50; // baseline time for a modern CPU
            load = Math.min(Math.round((avgTime / baselineTime) * 100), 100);
            
            diagnostic.status = load > 90 ? 'warning' : 'success';
            diagnostic.details = `CPU Performance: ${100 - load}% (Lower load is better)`;
            
        } catch (error) {
            diagnostic.status = 'warning';
            diagnostic.details = 'Unable to measure CPU performance';
        }
        await this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async checkNetwork() {
        await this.simulateTest();
        const diagnostic = this.diagnostics[3];
        
        try {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            if (connection) {
                const networkInfo = [];
                
                if (connection.effectiveType) {
                    networkInfo.push(`Type: ${connection.effectiveType}`);
                }
                if (connection.downlink) {
                    networkInfo.push(`Speed: ${connection.downlink} Mbps`);
                }
                if (connection.rtt) {
                    networkInfo.push(`Latency: ${connection.rtt}ms`);
                }
                
                diagnostic.status = connection.rtt > 100 ? 'warning' : 'success';
                diagnostic.details = `Network Status: ${networkInfo.join(', ')}`;
            } else {
                // Fallback to ping test
                const startTime = performance.now();
                await fetch(this.websiteUrl, { method: 'HEAD' });
                const latency = Math.round(performance.now() - startTime);
                
                diagnostic.status = latency > 100 ? 'warning' : 'success';
                diagnostic.details = `Network Latency: ${latency}ms`;
            }
        } catch (error) {
            diagnostic.status = 'warning';
            diagnostic.details = 'Network connectivity check failed';
        }
        await this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async checkSystemResponse() {
        await this.simulateTest();
        const diagnostic = this.diagnostics[4];
        
        try {
            const startTime = performance.now();
            const measurements = [];
            
            // Measure response time for multiple DOM operations
            for (let i = 0; i < 100; i++) {
                const tempDiv = document.createElement('div');
                const start = performance.now();
                document.body.appendChild(tempDiv);
                document.body.removeChild(tempDiv);
                measurements.push(performance.now() - start);
            }
            
            const avgResponseTime = Math.round(measurements.reduce((a, b) => a + b) / measurements.length);
            diagnostic.status = avgResponseTime > 16 ? 'warning' : 'success'; // 16ms = 60fps threshold
            diagnostic.details = `System Response Time: ${avgResponseTime}ms (DOM Operations)`;
            
        } catch (error) {
            diagnostic.status = 'warning';
            diagnostic.details = 'Unable to measure system response time';
        }
        await this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
    }

    async checkGraphics() {
        await this.simulateTest();
        const diagnostic = this.diagnostics[5];
        
        try {
            let frameCount = 0;
            let lastTime = performance.now();
            const measureDuration = 1000; // Measure for 1 second
            
            return new Promise((resolve) => {
                const measureFPS = () => {
                    frameCount++;
                    const currentTime = performance.now();
                    const elapsedTime = currentTime - lastTime;
                    
                    if (elapsedTime >= measureDuration) {
                        const fps = Math.round((frameCount * 1000) / elapsedTime);
                        diagnostic.status = fps < 30 ? 'warning' : 'success';
                        diagnostic.details = `Graphics Performance: ${fps} FPS`;
                        this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
                        resolve();
                        return;
                    }
                    
                    requestAnimationFrame(measureFPS);
                };
                
                requestAnimationFrame(measureFPS);
            });
            
        } catch (error) {
            diagnostic.status = 'warning';
            diagnostic.details = 'Unable to measure graphics performance';
            this.updateMessage(`${diagnostic.details} - ${diagnostic.status.toUpperCase()}\n`);
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async simulateTest() {
        const duration = Math.random() * 1000 + 500;
        await new Promise(resolve => setTimeout(resolve, duration));
    }

    finalizeDiagnostics() {
        this.isRunning = false;
        this.updateProgress(100);
        
        // Calculate overall status
        const hasErrors = this.diagnostics.some(d => d.status === 'error');
        const hasWarnings = this.diagnostics.some(d => d.status === 'warning');
        const overallStatus = hasErrors ? 'ERROR' : hasWarnings ? 'WARNING' : 'SUCCESS';
        
        // Add final summary
        this.updateMessage('\n=== DIAGNOSTIC COMPLETE ===\n');
        this.updateMessage(`Overall Status: ${overallStatus}\n`);
        this.updateMessage(`Timestamp: ${new Date().toISOString()}\n`);
        
        if (hasErrors || hasWarnings) {
            this.updateMessage('\nRecommended Actions:\n');
            if (hasErrors) {
                this.updateMessage('- Critical issues found. Please address errors before proceeding.\n');
            }
            if (hasWarnings) {
                this.updateMessage('- Performance warnings detected. System may not operate optimally.\n');
            }
            this.updateMessage('- Contact administrator if issues persist: mail@rashlink.eu.org\n');
        }
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
        const currentDate = new Date();
        const isJanuary = currentDate.getMonth() === 0;
        const isDecember = currentDate.getMonth() === 11;

        if (isJanuary) {
            // January-specific logs
            this.addLog('update', '[UPDATE] Initializing system for the new year (2025.1.0)');
            this.addLog('notice', '[NOTICE] Fresh start protocols activated');
            this.addLog('status', '[STATUS] Winter theme enhancement: Crystal clear performance');
            this.addLog('info', '[INFO] New year optimization complete');
            this.addLog('update', '[UPDATE] System refresh cycle: Embracing the winter calm');
            this.addLog('progress', '[PROGRESS] Quantum core stabilized for winter operations');
            this.addLog('status', '[STATUS] Northern lights mode: Active and harmonized');
            this.addLog('notice', '[NOTICE] Frost protection protocols: Optimal');
            this.addLog('info', '[INFO] Winter diagnostics: All systems nominal');
            this.addLog('update', '[UPDATE] Crystalline matrix synchronization: 100%');
        } else if (isDecember) {
            // December-specific logs
            this.addLog('update', '[UPDATE] System core synchronized');
            this.addLog('notice', '[NOTICE] Routine maintenance check');
            this.addLog('status', '[STATUS] All systems operational');
            this.addLog('info', '[INFO] Performance optimization complete');
            this.addLog('update', '[UPDATE] Holiday module activated (12.25.1)');
            this.addLog('progress', '[PROGRESS] Festive theme applied');
            this.addLog('status', '[STATUS] Holiday mode: Engaged');
            this.addLog('notice', '[NOTICE] Seasonal greetings protocols: Online');
            this.addLog('info', '[INFO] Holiday diagnostics: All systems nominal');
            this.addLog('update', '[UPDATE] Gift wrapping module: Ready');
        } else {
            // Default logs for other months
            this.addLog('update', '[UPDATE] System core synchronized');
            this.addLog('notice', '[NOTICE] Routine maintenance check');
            this.addLog('status', '[STATUS] All systems operational');
            this.addLog('info', '[INFO] Performance optimization complete');
        }

        // Real-time system logs based on actual diagnostics
        this.addLog('info', 'System diagnostic sequence initiated', new Date(currentDate - 1000 * 5));
        
        // Website connectivity status
        this.addLog('info', `Checking website status: ${this.websiteUrl}`, new Date(currentDate - 1000 * 10));
        
        // DNS check
        try {
            const url = new URL(this.websiteUrl);
            this.addLog('info', `Performing DNS lookup for ${url.hostname}`, new Date(currentDate - 1000 * 15));
        } catch (e) {
            this.addLog('error', 'Invalid website URL format', new Date(currentDate - 1000 * 15));
        }

        // Memory status with detailed metrics
        try {
            const memory = performance.memory;
            if (memory) {
                const usedMemory = (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(1);
                const totalMemoryGB = (memory.jsHeapSizeLimit / (1024 * 1024 * 1024)).toFixed(2);
                this.addLog('info', `Total Memory Available: ${totalMemoryGB}GB`, new Date(currentDate - 1000 * 20));
                this.addLog('info', `Current Memory Usage: ${usedMemory}%`, new Date(currentDate - 1000 * 21));
                if (usedMemory > 80) {
                    this.addLog('warning', `High memory usage detected: ${usedMemory}%`, new Date(currentDate - 1000 * 22));
                }
            }
        } catch (e) {
            this.addLog('info', 'Memory metrics collection completed', new Date(currentDate - 1000 * 20));
        }

        // Network connectivity details
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            this.addLog('info', `Network Connection Type: ${connection.effectiveType || 'Unknown'}`, new Date(currentDate - 1000 * 25));
            this.addLog('info', `Network Downlink: ${connection.downlink || 'Unknown'} Mbps`, new Date(currentDate - 1000 * 26));
            this.addLog('info', `Network RTT: ${connection.rtt || 'Unknown'} ms`, new Date(currentDate - 1000 * 27));
            if (connection.rtt > 100) {
                this.addLog('warning', `High network latency detected: ${connection.rtt}ms`, new Date(currentDate - 1000 * 28));
            }
        }

        // Browser and System Information
        const browserInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cores: navigator.hardwareConcurrency || 'Unknown',
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            onLine: navigator.onLine
        };

        this.addLog('info', `System Platform: ${browserInfo.platform}`, new Date(currentDate - 1000 * 30));
        this.addLog('info', `CPU Cores Available: ${browserInfo.cores}`, new Date(currentDate - 1000 * 31));
        this.addLog('info', `System Language: ${browserInfo.language}`, new Date(currentDate - 1000 * 32));
        this.addLog('info', `Network Status: ${browserInfo.onLine ? 'Online' : 'Offline'}`, new Date(currentDate - 1000 * 33));

        // Security Status
        this.addLog('info', 'Performing security checks...', new Date(currentDate - 1000 * 35));
        this.addLog('info', `Connection Security: ${window.location.protocol}`, new Date(currentDate - 1000 * 36));
        if (window.location.protocol === 'https:') {
            this.addLog('info', 'SSL/TLS: Active and verified', new Date(currentDate - 1000 * 37));
        } else {
            this.addLog('warning', 'Insecure connection detected', new Date(currentDate - 1000 * 37));
        }

        // Performance Metrics
        if (window.performance) {
            const navTiming = performance.getEntriesByType('navigation')[0];
            if (navTiming) {
                const loadTime = navTiming.loadEventEnd - navTiming.navigationStart;
                const dnsTime = navTiming.domainLookupEnd - navTiming.domainLookupStart;
                const connectTime = navTiming.connectEnd - navTiming.connectStart;
                
                this.addLog('info', `Page Load Time: ${Math.round(loadTime)}ms`, new Date(currentDate - 1000 * 40));
                this.addLog('info', `DNS Lookup Time: ${Math.round(dnsTime)}ms`, new Date(currentDate - 1000 * 41));
                this.addLog('info', `Server Connect Time: ${Math.round(connectTime)}ms`, new Date(currentDate - 1000 * 42));
                
                if (loadTime > 3000) {
                    this.addLog('warning', 'Slow page load time detected', new Date(currentDate - 1000 * 43));
                }
            }
        }

        // Graphics and Display
        if (window.screen) {
            this.addLog('info', `Display Resolution: ${window.screen.width}x${window.screen.height}`, new Date(currentDate - 1000 * 45));
            this.addLog('info', `Color Depth: ${window.screen.colorDepth}-bit`, new Date(currentDate - 1000 * 46));
            if (window.screen.refresh) {
                this.addLog('info', `Display Refresh Rate: ${window.screen.refresh}Hz`, new Date(currentDate - 1000 * 47));
            }
        }

        // Retained sample logs with updated timestamps
        this.addLog('info', 'System update check completed', new Date(currentDate - 1000 * 60 * 15));
        this.addLog('warning', 'CPU utilization above 75%', new Date(currentDate - 1000 * 60 * 20));
        this.addLog('info', 'Automatic backup completed', new Date(currentDate - 1000 * 60 * 25));
        this.addLog('warning', 'CPU temperature: 75°C', new Date(currentDate - 1000 * 60 * 30));
        this.addLog('info', 'System update v2.1.0 available', new Date(currentDate - 1000 * 60 * 35));
        this.addLog('error', 'SSL certificate should be updated', new Date(currentDate - 1000 * 60 * 40));
        this.addLog('info', 'Scheduled backup initiated', new Date(currentDate - 1000 * 60 * 45));
        this.addLog('warning', 'Network latency spike: 150ms', new Date(currentDate - 1000 * 60 * 50));

        // Final Diagnostic Summary
        const errorCount = this.logs.filter(log => log.type === 'error').length;
        const warningCount = this.logs.filter(log => log.type === 'warning').length;
        
        this.addLog('info', `Diagnostic Summary - Errors: ${errorCount}, Warnings: ${warningCount}`, new Date(currentDate));
        if (errorCount > 0 || warningCount > 0) {
            this.addLog('info', 'System requires attention - Check logs for details', new Date(currentDate));
        } else {
            this.addLog('info', 'All systems operating within normal parameters', new Date(currentDate));
        }

        // Sort logs by timestamp (most recent first)
        this.logs.sort((a, b) => b.timestamp - a.timestamp);
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

// Typing effect for logs
function typeText(element, text, speed = 50, forceScroll = false) {
    let index = 0;
    element.classList.add('typing');
    
    return new Promise(resolve => {
        const errorLog = document.querySelector('.error-log');
        const logContent = document.getElementById('log-content');
        
        function addChar() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                
                // Calculate if the element is partially or fully out of view
                const elementRect = element.getBoundingClientRect();
                const containerRect = errorLog.getBoundingClientRect();
                const isPartiallyHidden = elementRect.bottom > containerRect.bottom;
                
                // Only scroll enough to make the element fully visible
                if (forceScroll || (!errorLog.matches(':hover') && isPartiallyHidden)) {
                    const scrollAmount = elementRect.bottom - containerRect.bottom;
                    errorLog.scrollTop += scrollAmount;
                }
                
                setTimeout(addChar, speed);
            } else {
                element.classList.remove('typing');
                resolve();
            }
        }
        addChar();
    });
}

// Simulate package installation
async function simulateInstallation() {
    const logContent = document.getElementById('log-content');
    const errorLog = document.querySelector('.error-log');
    logContent.innerHTML = ''; // Clear existing content
    errorLog.scrollTop = 0; // Reset scroll position

    let lineCount = 0;
    let pastDiagnostics = false;

    const currentDate = new Date();
    const isJanuary = currentDate.getMonth() === 0;
    const isDecember = currentDate.getMonth() === 11;

    let packages;
    if (isJanuary) {
        packages = [
            { name: 'system-core', version: '2025.1.0', size: '156MB' },
            { name: 'winter-framework', version: '1.2.0', size: '78MB' },
            { name: 'frost-utils', version: '2.1.0', size: '64MB' },
            { name: 'crystal-renderer', version: '3.0.1', size: '92MB' },
            { name: 'aurora-effects', version: '1.5.0', size: '45MB' }
        ];
    } else if (isDecember) {
        packages = [
            { name: 'system-core', version: '2024.1.1', size: '156MB' },
            { name: 'holiday-module', version: '12.25.1', size: '42MB' },
            { name: 'performance-utils', version: '3.2.1', size: '89MB' },
            { name: 'security-updates', version: '1.9.0', size: '123MB' }
        ];
    } else {
        packages = [
            { name: 'system-core', version: '2025.1.0', size: '156MB' },
            { name: 'performance-utils', version: '3.2.1', size: '89MB' },
            { name: 'security-updates', version: '1.9.0', size: '123MB' }
        ];
    }

    // Initial messages before diagnostics
    const scanEntry = document.createElement('span');
    scanEntry.className = 'log-entry info';
    logContent.appendChild(scanEntry);
    await typeText(scanEntry, '[INFO] Initiating system maintenance protocol...');
    await new Promise(r => setTimeout(r, 1000));

    const dependencyEntry = document.createElement('span');
    dependencyEntry.className = 'log-entry info';
    logContent.appendChild(dependencyEntry);
    await typeText(dependencyEntry, '[INFO] Analyzing system dependencies...');
    await new Promise(r => setTimeout(r, 1500));

    // ASCII Art
    const asciiArt = document.createElement('div');
    asciiArt.className = 'ascii-art';
    asciiArt.setAttribute('data-text', `System Maintenance Protocol

   W   W  EEEE  EEEE  BBBBB  FFFFF III L      EEEE  SSSS
   W   W  E     E     B     B F      I  L     E     S
   W W W  EEEE  EEEE  BBBBB  FFF    I  L      EEEE   SSS
   W   W  E     E     B     B F      I  L     E         S
   W   W  EEEE  EEEE  BBBBB  F      III LLLLL EEEE  SSSS
                           Powered by Debian GNU/Linux 12

╔══════════════════════════════════════════════════╗
║            System Update In Progress             ║
╚══════════════════════════════════════════════════╝`);
    asciiArt.textContent = asciiArt.getAttribute('data-text');
    logContent.appendChild(asciiArt);

    // System diagnostics - mark the start of two-line scrolling
    const diagEntry = document.createElement('span');
    diagEntry.className = 'log-entry status';
    logContent.appendChild(diagEntry);
    await typeText(diagEntry, '[STATUS] Running system diagnostics...');
    pastDiagnostics = true;
    await new Promise(r => setTimeout(r, 1200));

    // Update packages with two-line scrolling
    for (const pkg of packages) {
        lineCount++;
        const updateEntry = document.createElement('span');
        updateEntry.className = 'log-entry progress';
        logContent.appendChild(updateEntry);
        await typeText(updateEntry, `[UPDATE] Updating <span class="package-name">${pkg.name}</span> <span class="version-number">(${pkg.version})</span> <span class="size-info">[${pkg.size}]</span>`, 50, lineCount % 2 === 0);
        
        const progressLine = document.createElement('div');
        progressLine.className = 'progress-line';
        progressLine.innerHTML = `
            <div class="progress-bar-mini">
                <div class="fill"></div>
            </div>
            <span class="loading-dots">Updating</span>
        `;
        updateEntry.appendChild(progressLine);

        // Show user message between updates
        await new Promise(r => setTimeout(r, 2000));

        // Simulate progress
        const fill = progressLine.querySelector('.fill');
        await new Promise(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    resolve();
                }
                fill.style.width = `${progress}%`;
            }, 100);
        });
    }

    // After package updates, show seasonal message
    lineCount++;
    const completeEntry = document.createElement('span');
    completeEntry.className = 'log-entry success';
    logContent.appendChild(completeEntry);
    await typeText(completeEntry, '[SUCCESS] System optimization complete', 50, lineCount % 2 === 0);

    lineCount++;
    const readyEntry = document.createElement('span');
    readyEntry.className = 'log-entry info';
    logContent.appendChild(readyEntry);
    await typeText(readyEntry, '[INFO] System ready for operation', 50, lineCount % 2 === 0);

    // Final messages
    lineCount++;
    const completeEntry2 = document.createElement('span');
    completeEntry2.className = 'log-entry notice';
    logContent.appendChild(completeEntry2);
    await typeText(completeEntry2, '[NOTICE] System update phase complete', 50, lineCount % 2 === 0);

    lineCount++;
    const refreshEntry = document.createElement('span');
    refreshEntry.className = 'log-entry info';
    logContent.appendChild(refreshEntry);
    await typeText(refreshEntry, '[INFO] The page will refresh automatically when all maintenance tasks are complete', 50, lineCount % 2 === 0);

    // Restart simulation after delay
    setTimeout(simulateInstallation, 5000);
}

// Progress and completion time calculation
function updateProgress() {
    const startTime = new Date('2024-12-25T18:00:00+08:00');
    const endTime = new Date('2024-12-25T23:59:59+08:00');
    const currentTime = new Date('2024-12-25T19:25:28+08:00'); // Using provided time

    const totalDuration = endTime - startTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

    // Update progress bar
    const progressBar = document.getElementById('maintenance-progress');
    progressBar.style.width = progress + '%';

    // Calculate remaining time
    const remainingTime = endTime - currentTime;
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    // Update completion time
    const completionTime = document.getElementById('completion-time');
    completionTime.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update maintenance status text
    const statusText = document.querySelector('.status-box p');
    if (progress < 25) {
        statusText.textContent = 'Maintenance initializing...';
    } else if (progress < 50) {
        statusText.textContent = 'Core systems updating...';
    } else if (progress < 75) {
        statusText.textContent = 'Optimizing performance...';
    } else if (progress < 100) {
        statusText.textContent = 'Final checks in progress...';
    } else {
        statusText.textContent = 'Maintenance complete!';
    }

    // Pulse effect for status indicator
    const statusIndicator = document.querySelector('.status-indicator');
    statusIndicator.style.backgroundColor = progress === 100 ? '#4CAF50' : '#FFA500';
}

// Performance optimizations
const isMobile = window.innerWidth <= 768;
const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Throttle function to limit execution frequency
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll and resize handlers
window.addEventListener('scroll', throttle(() => {
    // Your scroll handling code
}, 16), { passive: true });

window.addEventListener('resize', debounce(() => {
    // Your resize handling code
}, 250));

// Optimize animations for mobile
if (isMobile || hasReducedMotion) {
    // Disable heavy animations
    document.body.classList.add('reduced-motion');
}

// Use requestAnimationFrame for smooth animations
function animate() {
    // Your animation code here
    requestAnimationFrame(animate);
}

// Lazy load images and resources
function lazyLoad() {
    const images = document.querySelectorAll('[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Error log scroll handling
function initializeErrorLog() {
    const errorLog = document.querySelector('.error-log');
    let userScrolled = false;
    let scrollTimeout;

    // Handle manual scrolling
    errorLog.addEventListener('scroll', () => {
        userScrolled = true;
        
        // Clear existing timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        // Reset userScrolled after 2 seconds of no scrolling
        scrollTimeout = setTimeout(() => {
            userScrolled = false;
            scrollTimeout = null;
        }, 2000);
    });

    // Add new log entry with auto-scroll
    window.addLogEntry = async (text, className = 'info') => {
        const entry = document.createElement('span');
        entry.className = `log-entry ${className}`;
        logContent.appendChild(entry);
        
        // Scroll to bottom if user hasn't manually scrolled
        if (!userScrolled && !errorLog.matches(':hover')) {
            errorLog.scrollTop = errorLog.scrollHeight;
        }
    };
}

// System status updates
function updateSystemStatus() {
    const statusMessages = [
        "<strong>System Analysis:</strong> Please wait while we diagnose the current situation",
        "<strong>Team Update:</strong> Our engineers are working to resolve the maintenance requirements",
        "<strong>Progress:</strong> Running essential system checks and optimizations",
        "<strong>Status:</strong> Performing scheduled maintenance tasks",
        "<strong>Notice:</strong> The page will refresh automatically once maintenance is complete",
        "<strong>Update:</strong> Optimizing system performance for better user experience",
        "<strong>Security:</strong> Implementing latest security protocols and updates",
        "<strong>Network:</strong> Verifying connection stability across all services",
        "<strong>Maintenance:</strong> Updating core system components",
        "<strong>Progress:</strong> Running final system verifications",
        "<strong>Holiday Update:</strong> Optimizing festive features for the season ",
        "<strong>System:</strong> Calibrating performance parameters",
        "<strong>Notice:</strong> Thank you for your patience during this maintenance",
        "<strong>Status:</strong> Ensuring all systems are functioning correctly",
        "<strong>Update:</strong> Making final adjustments to system settings"
    ];

    // Update status message every 10 seconds
    if (!window.messageInterval) {
        let messageIndex = 0;
        const messageElement = document.querySelector('.message-content');
        
        const updateMessage = () => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.innerHTML = statusMessages[messageIndex];
                messageElement.style.opacity = '1';
                messageIndex = (messageIndex + 1) % statusMessages.length;
            }, 500);
        };

        window.messageInterval = setInterval(updateMessage, 10000);
        messageElement.innerHTML = statusMessages[0];
    }

    function triggerGlitch(element) {
        element.classList.add('glitching');
        setTimeout(() => {
            element.classList.remove('glitching');
        }, 1000);
    }

    // CPU Load simulation (30-80%)
    const cpuLoad = Math.floor(30 + Math.random() * 50);
    const cpuElement = document.getElementById('cpu-load');
    cpuElement.textContent = `${cpuLoad}%`;
    triggerGlitch(cpuElement);

    // Memory usage simulation (4-12GB of 16GB)
    const memoryUsage = (4 + Math.random() * 8).toFixed(1);
    const memoryElement = document.getElementById('memory-usage');
    memoryElement.textContent = `${memoryUsage}GB`;
    triggerGlitch(memoryElement);

    // Network traffic simulation
    const networkDown = (Math.random() * 50 + 10).toFixed(1);
    const networkUp = (Math.random() * 20 + 5).toFixed(1);
    const networkDownElement = document.getElementById('network-down');
    const networkUpElement = document.getElementById('network-up');
    networkDownElement.textContent = `${networkDown} MB/s`;
    networkUpElement.textContent = `${networkUp} MB/s`;
    triggerGlitch(networkDownElement);
    triggerGlitch(networkUpElement);

    // Update system load graph
    const graphFill = document.querySelector('.mini-graph-fill');
    const loadPercentage = Math.floor(20 + Math.random() * 60);
    graphFill.style.width = `${loadPercentage}%`;

    document.querySelectorAll('.status-item').forEach(item => {
        const value = parseInt(item.querySelector('.status-value').textContent);
        if (value > 50) {
            item.style.borderColor = 'rgba(255, 87, 34, 0.4)';
        } else {
            item.style.borderColor = 'rgba(32, 128, 32, 0.2)';
        }
    });
}

// Initial update
updateSystemStatus();

// Update system metrics every 3 seconds
setInterval(updateSystemStatus, 3000);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createSnowfall();
    new DiagnosticSystem();
    new LogSystem();
    updateProgress();
    setInterval(updateProgress, 1000);
    initializeErrorLog();
    simulateInstallation();
    updateSystemStatus();
    setInterval(updateSystemStatus, 2000);

    // Add refresh button functionality
    const refreshButton = document.querySelector('.refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', async () => {
            try {
                // Clear all caches
                if ('caches' in window) {
                    const cacheKeys = await caches.keys();
                    await Promise.all(cacheKeys.map(key => caches.delete(key)));
                }
                
                // Clear cookies
                document.cookie.split(";").forEach(cookie => {
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                });

                // Refresh the page
                window.location.reload(true);
            } catch (error) {
                console.error('Error clearing cache/cookies:', error);
                // Fallback to normal refresh if clearing fails
                window.location.reload();
            }
        });
    }

    const currentDate = new Date();
    const isJanuary = currentDate.getMonth() === 0;
    const isDecember = currentDate.getMonth() === 11;

    // Hide/show seasonal codes based on month
    const holidayCode = document.querySelector('.log-entry.holiday');
    const winterCode = document.querySelector('.log-entry.winter-code');

    if (holidayCode) {
        holidayCode.style.display = isDecember ? 'block' : 'none';
    }
    if (winterCode) {
        winterCode.style.display = isJanuary ? 'block' : 'none';
    }
});

// System Status Management
class SystemStatus {
    constructor() {
        this.statusCodes = {
            200: { message: 'All systems operational', state: 'Operational', class: 'status-ok' },
            503: { message: 'System maintenance in progress', state: 'Maintenance', class: 'status-maintenance' },
            502: { message: 'Temporary system instability detected', state: 'Unstable', class: 'status-error' },
            500: { message: 'Critical system error detected', state: 'Error', class: 'status-critical' },
            429: { message: 'System processing queue at capacity', state: 'Overload', class: 'status-warning' },
            404: { message: 'System component not found', state: 'Missing', class: 'status-error' },
            403: { message: 'Access verification required', state: 'Restricted', class: 'status-warning' },
            401: { message: 'Security protocol violation', state: 'Unauthorized', class: 'status-error' }
        };
        
        this.elements = {
            statusCode: document.querySelector('.status-code'),
            versionInfo: document.querySelector('.version-info'),
            updateTime: document.querySelector('.update-time'),
            systemState: document.querySelector('.system-state'),
            statusMessage: document.querySelector('.status-message'),
            statusBox: document.querySelector('.status-box'),
            uptime: document.querySelector('.system-uptime'),
            memoryUsage: document.querySelector('.memory-usage'),
            cpuLoad: document.querySelector('.cpu-load'),
            networkStatus: document.querySelector('.network-status'),
            responseTime: document.querySelector('.response-time'),
            requestRate: document.querySelector('.request-rate'),
            errorRate: document.querySelector('.error-rate'),
            cacheRatio: document.querySelector('.cache-ratio'),
            systemAlerts: document.querySelector('.system-alerts'),
            charts: {
                response: document.querySelector('.response-chart'),
                request: document.querySelector('.request-chart'),
                error: document.querySelector('.error-chart'),
                cache: document.querySelector('.cache-chart')
            }
        };

        this.metrics = {
            uptime: 0,
            memoryUsage: 0,
            cpuLoad: 0,
            responseTime: 0,
            requestRate: 0,
            errorRate: 0,
            cacheRatio: 0,
            alerts: []
        };

        this.startTime = Date.now();
        this.updateMetrics();
    }

    updateMetrics() {
        // Update uptime
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        this.elements.uptime.textContent = `${days}d ${hours}h ${minutes}m`;

        // Simulate memory usage (40-90%)
        this.metrics.memoryUsage = Math.floor(Math.random() * 50 + 40);
        this.elements.memoryUsage.textContent = `${this.metrics.memoryUsage}%`;

        // Simulate CPU load (20-100%)
        this.metrics.cpuLoad = Math.floor(Math.random() * 80 + 20);
        this.elements.cpuLoad.textContent = `${this.metrics.cpuLoad}%`;

        // Simulate response time (50-500ms)
        this.metrics.responseTime = Math.floor(Math.random() * 450 + 50);
        this.elements.responseTime.textContent = `${this.metrics.responseTime}ms`;
        this.updateChart('response', this.metrics.responseTime / 500 * 100);

        // Simulate request rate (0-100/s)
        this.metrics.requestRate = Math.floor(Math.random() * 100);
        this.elements.requestRate.textContent = `${this.metrics.requestRate}/s`;
        this.updateChart('request', this.metrics.requestRate);

        // Simulate error rate (0-5%)
        this.metrics.errorRate = (Math.random() * 5).toFixed(2);
        this.elements.errorRate.textContent = `${this.metrics.errorRate}%`;
        this.updateChart('error', this.metrics.errorRate * 20);

        // Simulate cache hit ratio (60-100%)
        this.metrics.cacheRatio = Math.floor(Math.random() * 40 + 60);
        this.elements.cacheRatio.textContent = `${this.metrics.cacheRatio}%`;
        this.updateChart('cache', this.metrics.cacheRatio);

        // Check for alerts
        this.checkAlerts();

        // Schedule next update
        setTimeout(() => this.updateMetrics(), 2000);
    }

    updateChart(type, value) {
        const chart = this.elements.charts[type];
        if (chart) {
            chart.style.setProperty('--chart-value', `${value}%`);
        }
    }

    checkAlerts() {
        const alerts = [];
        
        if (this.metrics.memoryUsage > 85) {
            alerts.push({
                type: 'error',
                message: 'High memory usage detected'
            });
        }
        if (this.metrics.cpuLoad > 90) {
            alerts.push({
                type: 'warning',
                message: 'CPU load approaching critical levels'
            });
        }
        if (this.metrics.responseTime > 400) {
            alerts.push({
                type: 'warning',
                message: 'High response time detected'
            });
        }
        if (this.metrics.errorRate > 3) {
            alerts.push({
                type: 'error',
                message: 'Error rate above threshold'
            });
        }
        if (this.metrics.cacheRatio < 70) {
            alerts.push({
                type: 'warning',
                message: 'Low cache hit ratio'
            });
        }

        // Update alerts display
        if (alerts.length > 0) {
            const alertsHtml = alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                    <span class="status-indicator"></span>
                    ${alert.message}
                </div>
            `).join('');
            this.elements.systemAlerts.innerHTML = alertsHtml;
        } else {
            this.elements.systemAlerts.innerHTML = '';
        }
    }

    updateStatus(code) {
        const status = this.statusCodes[code] || this.statusCodes[500];
        this.elements.statusCode.textContent = code;
        this.elements.systemState.textContent = status.state;
        this.elements.statusMessage.textContent = status.message;
        this.elements.statusBox.classList.add(status.class);

        // Add glitch effect on status change
        this.elements.statusBox.classList.add('glitch-effect');
        setTimeout(() => {
            this.elements.statusBox.classList.remove('glitch-effect');
        }, 1000);
    }

    updateVersion(version) {
        this.elements.versionInfo.textContent = version;
    }

    updateLastUpdated(date) {
        this.elements.updateTime.textContent = date;
    }

    startStatusSimulation() {
        const simulateStatusChange = () => {
            // 80% chance of being operational
            const rand = Math.random();
            let newStatus;

            if (rand > 0.8) {
                // Generate random error status
                const errorCodes = [401, 403, 404, 429, 500, 502, 503];
                newStatus = errorCodes[Math.floor(Math.random() * errorCodes.length)];
            } else {
                newStatus = 200;
            }

            if (newStatus !== this.elements.statusCode.textContent) {
                this.updateStatus(newStatus);
            }

            // Schedule next update
            setTimeout(simulateStatusChange, Math.random() * 30000 + 15000); // 15-45 seconds
        };

        simulateStatusChange();
    }
}

// Initialize system status on load
document.addEventListener('DOMContentLoaded', () => {
    window.systemStatus = new SystemStatus();
});
