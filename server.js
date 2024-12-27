const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Dummy user data (use a database in production)
const users = {
    admin: bcrypt.hashSync('admin123', 10),
    client: bcrypt.hashSync('client123', 10),
};

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = users[username];
    if (!hashedPassword || !bcrypt.compareSync(password, hashedPassword)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const role = username === 'admin' ? 'admin' : 'client';
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

// Shopify integration route
app.post('/api/shopify/products', async (req, res) => {
    try {
        const { storeUrl, adminAccessToken } = req.body;

        if (!storeUrl || !adminAccessToken) {
            return res.status(400).json({ error: 'Store URL and Admin Access Token are required' });
        }

        const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': adminAccessToken,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});