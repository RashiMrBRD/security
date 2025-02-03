// Advanced encryption using AES
class SecurityManager {
    constructor() {
        this.key = null;
        this.iv = null;
        this.token = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Get token from server
            const response = await fetch('/api/token');
            const data = await response.json();
            this.token = data.token;

            // Generate encryption key and IV from token
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(this.token),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            this.key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: new TextEncoder().encode('secure-salt'),
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            this.iv = window.crypto.getRandomValues(new Uint8Array(12));
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize security', error);
        }
    }

    async encrypt(text) {
        if (!this.initialized) await this.initialize();
        
        const encodedText = new TextEncoder().encode(text);
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: this.iv
            },
            this.key,
            encodedText
        );

        const encryptedArray = new Uint8Array(encryptedData);
        return btoa(String.fromCharCode.apply(null, [...this.iv, ...encryptedArray]));
    }

    async decrypt(encryptedText) {
        if (!this.initialized) await this.initialize();
        
        const encryptedData = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
        const iv = encryptedData.slice(0, 12);
        const data = encryptedData.slice(12);

        try {
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.key,
                data
            );

            return new TextDecoder().decode(decryptedData);
        } catch (error) {
            console.error('Decryption failed', error);
            return '';
        }
    }
}

const securityManager = new SecurityManager();

// Content protection with advanced features
async function protectContent() {
    await securityManager.initialize();
    
    const container = document.querySelector('.container');
    if (!container.getAttribute('data-protected')) {
        const originalContent = container.innerHTML;
        const encrypted = await securityManager.encrypt(originalContent);
        
        container.setAttribute('data-protected', encrypted);
        
        // Enhanced mutation observer
        const observer = new MutationObserver(async (mutations) => {
            mutations.forEach(async (mutation) => {
                if (!mutation.target.isDecrypting) {
                    const encrypted = container.getAttribute('data-protected');
                    if (encrypted) {
                        mutation.target.isDecrypting = true;
                        container.innerHTML = await securityManager.decrypt(encrypted);
                        mutation.target.isDecrypting = false;
                    }
                }
            });
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Initial decryption
        container.innerHTML = await securityManager.decrypt(encrypted);
    }
}

// Advanced anti-debugging techniques
function implementAntiDebugging() {
    // Detect and prevent DevTools
    const devToolsDetector = () => {
        const threshold = 160;
        const check = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            if (widthThreshold || heightThreshold) {
                document.body.innerHTML = 'Security violation detected';
            }
        };
        setInterval(check, 1000);
        window.addEventListener('resize', check);
    };

    // Prevent right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Prevent keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Check for various browser implementations of Ctrl+U
        const isCtrlU = (
            (e.ctrlKey && (e.key === 'U' || e.key === 'u')) || // Handle both upper and lowercase
            (e.ctrlKey && (e.keyCode === 85)) ||              // Handle keyCode for older browsers
            (e.metaKey && (e.key === 'U' || e.key === 'u'))   // Handle Command key for Mac
        );

        if (isCtrlU || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') || // Chrome dev tools
            (e.ctrlKey && e.shiftKey && e.key === 'J') || // Chrome dev tools
            (e.ctrlKey && e.key === 'S') ||              // Save page
            e.key === 'F12') {                           // F12 key (Dev Tools)
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    // Prevent copy/paste
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());

    devToolsDetector();
}

// Initialize protection
document.addEventListener('DOMContentLoaded', () => {
    protectContent();
    implementAntiDebugging();
    
    // Continuous protection check
    setInterval(async () => {
        const container = document.querySelector('.container');
        if (container && !container.getAttribute('data-protected')) {
            await protectContent();
        }
    }, 1000);
});
