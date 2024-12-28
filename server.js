const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch'); // Install using: npm install node-fetch
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// Dummy user data
const users = {
    admin: { password: bcrypt.hashSync('admin123', 10), role: 'admin' },
    client: { password: bcrypt.hashSync('client123', 10), role: 'client' },
};

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = users[username];
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, role: user.role });
});

// Shopify API handler
app.use('/api/shopify/products', require('./api/products'));

// Export the app for Vercel
module.exports = app;