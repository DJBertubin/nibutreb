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

// Helper function to generate a 5-digit random number
const generateClientId = () => Math.floor(10000 + Math.random() * 90000).toString();

// User Schema and Model
const userSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        default: generateClientId, // Generate a unique 5-digit clientId
    },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Shopify Data Schema and Model
const shopifyDataSchema = new mongoose.Schema({
    clientId: { type: String, required: true }, // Link to the user's clientId
    shopifyUrl: { type: String, required: true },
    shopifyToken: { type: String, required: true },
    shopifyData: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }, // Timestamp for tracking
});
const ShopifyData =
    mongoose.models.ShopifyData || mongoose.model('ShopifyData', shopifyDataSchema);

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

        const token = jwt.sign(
            { clientId: user.clientId, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            role: user.role,
            name: user.name,
            clientId: user.clientId, // Include clientId in the response
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ error: 'Name, username, and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            password: hashedPassword,
            role: role || 'client', // Default to `client`
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            userId: newUser._id, // Return MongoDB ID for reference
            clientId: newUser.clientId, // Return the generated clientId for reference
        });
    } catch (error) {
        console.error('Signup Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Shopify Fetch API Route
app.post('/api/shopify/fetch', async (req, res) => {
    const { authorization } = req.headers;
    const { storeUrl, adminAccessToken } = req.body;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required.' });
    }

    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        const shopifyApiUrl = `https://${storeUrl.trim()}/admin/api/2024-01/products.json`;
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

        const shopifyData = await response.json();

        const newShopifyData = new ShopifyData({
            clientId,
            shopifyUrl: storeUrl.trim(),
            shopifyToken: adminAccessToken,
            shopifyData,
        });

        await newShopifyData.save();

        res.status(201).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData,
        });
    } catch (err) {
        console.error('Error fetching Shopify data:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Fetch Shopify Data for Logged-In User
app.get('/api/shopify/data', async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required.' });
    }

    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        const shopifyData = await ShopifyData.find({ clientId });

        if (!shopifyData || shopifyData.length === 0) {
            return res.status(404).json({ error: 'No Shopify data found for this user.' });
        }

        res.status(200).json({
            message: 'Shopify data fetched successfully.',
            shopifyData,
        });
    } catch (err) {
        console.error('Error fetching Shopify data:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;