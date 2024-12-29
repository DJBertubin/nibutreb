const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyUrl: { type: String }, // Store Shopify store URL
    shopifyToken: { type: String }, // Store Shopify token
    shopifyData: { type: Object, default: {} }, // Store fetched Shopify data
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            token,
            role: user.role,
            shopifyUrl: user.shopifyUrl || null,
            shopifyData: user.shopifyData || {},
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Shopify Fetch API Route
app.post('/api/shopify/fetch', async (req, res) => {
    const { username, shopifyUrl, shopifyToken } = req.body;

    if (!username || !shopifyUrl || !shopifyToken) {
        return res.status(400).json({
            error: 'Username, Shopify URL, and Shopify Token are required.',
        });
    }

    const shopifyApiUrl = `${shopifyUrl}/admin/api/2024-01/products.json`;

    try {
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': shopifyToken,
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Shopify API Error:', errorData);
            return res.status(response.status).json({ error: errorData });
        }

        const shopifyData = await response.json();

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Save Shopify URL, token, and data
        user.shopifyUrl = shopifyUrl;
        user.shopifyToken = shopifyToken;
        user.shopifyData = shopifyData;
        await user.save();

        res.status(200).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData,
        });
    } catch (err) {
        console.error('Error fetching Shopify data:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Backward Compatibility Alias
app.post('/api/shopify/products', (req, res, next) => {
    req.url = '/api/shopify/fetch'; // Redirect to /api/shopify/fetch
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Export for Vercel
module.exports = app;