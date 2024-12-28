const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch'); // Required for Shopify API calls
const mongoose = require('mongoose'); // MongoDB integration
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' }, // Default role is client
});

const User = mongoose.model('User', userSchema);

// Helper function to process responses
const processResponse = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text); // Try parsing JSON
    } catch {
        return { error: true, message: text }; // Fallback to plain text
    }
};

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: true, message: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ error: false, message: 'User created successfully' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: true, message: 'Username already exists' });
        }
        res.status(500).json({ error: true, message: 'Internal Server Error', details: err.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: true, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ error: false, token, role: user.role });
});

// Shopify Products API Route
app.post('/api/shopify/products', async (req, res) => {
    const { storeUrl, adminAccessToken } = req.body;

    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: true, message: 'Store URL and Admin Access Token are required.' });
    }

    const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

    try {
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
            return res.status(response.status).json({ error: true, message: errorText });
        }

        const data = await processResponse(response);
        if (data.error) {
            return res.status(500).json({ error: true, message: data.message });
        }

        res.status(200).json({ error: false, data }); // Send products back to the frontend
    } catch (error) {
        console.error('Proxy Server Error:', error.message);
        res.status(500).json({ error: true, message: 'Internal Server Error', details: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({
        error: true,
        message: 'Internal Server Error',
        details: err.message || 'An unexpected error occurred',
    });
});

// Export for Vercel
module.exports = app;