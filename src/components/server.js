import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc: ["'self'", 'https://gpsconnect.rashlink.eu.org', 'http://localhost:3000', 'https://*.tile.openstreetmap.org'],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Enable CORS with specific options
const corsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = process.env.CORS_ORIGINS.split(',');
        if (!origin || allowedOrigins.some(allowed => origin.match(new RegExp(allowed.replace('*', '.*'))))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Version', 'X-Request-Time'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Create logs and data directories if they don't exist
const logsDir = path.join(__dirname, 'logs');
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(logsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${req.method} ${req.url} - ${req.ip}\n`;
    fs.appendFile(path.join(logsDir, 'access.log'), log, (err) => {
        if (err) console.error('Error writing to log:', err);
    });
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const timestamp = new Date().toISOString();
    const errorLog = `[${timestamp}] Error: ${err.message}\nStack: ${err.stack}\n`;
    fs.appendFile(path.join(logsDir, 'error.log'), errorLog, (err) => {
        if (err) console.error('Error writing to error log:', err);
    });
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static(__dirname));

// Root and dashboard routes both serve index.html
app.get(['/', '/dashboard'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Location history endpoint
app.get('/history', (req, res) => {
    try {
        const historyFile = path.join(dataDir, 'location-history.json');
        if (fs.existsSync(historyFile)) {
            const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
            res.json(history);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading location history:', error);
        res.status(500).json({ error: 'Error reading location history' });
    }
});

// Location update endpoint
app.post('/location', async (req, res) => {
    try {
        const locationData = req.body;
        const timestamp = new Date().toISOString();
        const historyFile = path.join(dataDir, 'location-history.json');
        
        // Create history file if it doesn't exist
        if (!fs.existsSync(historyFile)) {
            fs.writeFileSync(historyFile, '[]', 'utf8');
        }

        // Read existing history
        const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));

        // Add new location data
        const newLocation = {
            ...locationData,
            timestamp,
            ip: req.ip,
            headers: {
                userAgent: req.get('User-Agent'),
                referer: req.get('Referer'),
                host: req.get('Host')
            }
        };

        // Add to history and keep last 1000 entries
        history.push(newLocation);
        if (history.length > 1000) {
            history.shift(); // Remove oldest entry
        }

        // Save updated history
        fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');

        // Log location update
        const logEntry = `[${timestamp}] New location: ${newLocation.latitude}, ${newLocation.longitude} from ${req.ip}\n`;
        fs.appendFileSync(path.join(logsDir, 'locations.log'), logEntry);

        res.json({ 
            success: true, 
            message: 'Location updated successfully',
            timestamp 
        });
    } catch (error) {
        console.error('Error updating location:', error);
        const errorLog = `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\n`;
        fs.appendFileSync(path.join(logsDir, 'error.log'), errorLog);
        res.status(500).json({ error: 'Error updating location' });
    }
});

// API endpoints
app.post('/api/init', (req, res) => {
    try {
        const { timestamp, userAgent, screen } = req.body;
        // Validate required fields
        if (!timestamp || !userAgent) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Process initialization
        res.json({
            status: 'initialized',
            timestamp: new Date().toISOString(),
            sessionId: Math.random().toString(36).substring(7),
            serverTime: Date.now()
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve gpsconnect.js with correct MIME type and versioning
app.get('/gpsconnect.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('X-Content-Version', process.env.npm_package_version || '1.0.0');
    res.sendFile(join(__dirname, 'gpsconnect.js'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS origins: ${process.env.CORS_ORIGINS}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
