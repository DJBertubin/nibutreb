const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Install using: npm install node-fetch
const jwt = require('jsonwebtoken'); // Install using: npm install jsonwebtoken
const dotenv = require('dotenv'); // Install using: npm install dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Secret key for JWT (use a strong secret in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });
        req.user = user;
        next();
    });
};

// Route: Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Replace with your authentication logic (e.g., database query)
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ id: 1, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } else if (username === 'client' && password === 'client123') {
        const token = jwt.sign({ id: 2, role: 'client' }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Route: Protected Client Data
app.get('/api/client-data', authenticateToken, (req, res) => {
    if (req.user.role !== 'client') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // Mock client data (replace with a database query)
    const clientData = [
        { id: 1, name: 'Product A' },
        { id: 2, name: 'Product B' },
    ];
    res.status(200).json(clientData);
});

// Route: Fetch Shopify Admin API data
app.post('/api/shopify/products', async (req, res) => {
    const { storeUrl, adminAccessToken } = req.body;

    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

    try {
        // Fetch Shopify Admin API data
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': adminAccessToken,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Shopify API Error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        res.status(200).json(data); // Send response back to frontend
    } catch (error) {
        console.error('Proxy Server Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
});
