const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Generate a random token on server start
const serverToken = crypto.randomBytes(32).toString('hex');

app.use(express.static('.')); // Serve static files
app.use(express.json());

// Middleware to check for valid token
app.use((req, res, next) => {
    const clientToken = req.headers['x-auth-token'];
    if (!clientToken || !validateToken(clientToken)) {
        res.status(403).json({ error: 'Invalid access' });
        return;
    }
    next();
});

// Validate client token
function validateToken(clientToken) {
    // Add your token validation logic here
    return crypto.timingSafeEqual(
        Buffer.from(clientToken),
        Buffer.from(serverToken)
    );
}

// Endpoint to get initial token
app.get('/api/token', (req, res) => {
    res.json({ token: serverToken });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
