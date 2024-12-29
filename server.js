const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch'); // Required for Shopify API calls
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
    storeUrl: { type: String }, // Optional: To store Shopify store URL
    adminAccessToken: { type: String }, // Optional: To store Shopify access token
    shopifyData: { type: Object, default: {} }, // Optional: To store fetched Shopify data
});
const User = mongoose.model('User', userSchema);

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
            storeUrl: user.storeUrl || null, // Include store URL if saved
            shopifyData: user.shopifyData || {}, // Include Shopify data if saved
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

        // Optional: Save Shopify Data and Credentials to User Record
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            const user = await User.findOne({ username: decoded.username });
            if (user) {
                user.storeUrl = storeUrl; // Save the store URL
                user.adminAccessToken = adminAccessToken; // Save the access token
                user.shopifyData = data; // Save the fetched Shopify data
                await user.save();
            }
        }

        res.status(200).json({
            message: 'Shopify data fetched successfully.',
            shopifyData: data,
        });
    } catch (error) {
        console.error('Proxy Server Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Export for Vercel
module.exports = app;