const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cron = require('node-cron');
const User = require('./api/models/User');
const ShopifyData = require('./api/models/ShopifyData');
const Mapping = require('./api/models/Mapping'); // Import Mapping model
const walmartRoutes = require('./api/walmart/walmart');
const { sendItemToWalmart } = require('./api/utils/sendToWalmart');

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

// **Use Walmart API routes**
app.use('/api/walmart', walmartRoutes);

// **Login Route**
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
            clientId: user.clientId,
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// **Signup Route**
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
            role: role || 'client',
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            userId: newUser._id,
            clientId: newUser.clientId,
        });
    } catch (error) {
        console.error('Signup Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// **Fetch Client Info Route**
app.get('/api/client/info', async (req, res) => {
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

        const user = await User.findOne({ clientId });

        if (!user) {
            return res.status(404).json({ error: 'Client not found.' });
        }

        res.status(200).json({
            clientId: user.clientId,
            name: user.name,
            username: user.username,
            role: user.role,
        });
    } catch (err) {
        console.error('Error fetching client info:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// **Shopify Fetch API Route**
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

        const updatedData = await ShopifyData.findOneAndUpdate(
            { clientId, shopifyUrl: storeUrl.trim() },
            {
                shopifyData,
                shopifyToken: adminAccessToken,
                lastUpdated: new Date(),
                targetMarketplaces: [],
            },
            { upsert: true, new: true }
        );

        res.status(201).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData: updatedData,
        });
    } catch (err) {
        console.error('Error fetching Shopify data:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// **POST /api/mappings/save - Save Mappings**
app.post('/api/mappings/save', async (req, res) => {
    const { clientId, productId, mappings } = req.body;

    console.log('Incoming Request Payload:', JSON.stringify(req.body, null, 2));

    if (!clientId || !productId || !mappings) {
        console.error('Missing required fields:', { clientId, productId, mappings });
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        const cleanedMappings = {};

        // Iterate over mappings to ensure proper structure
        for (const key in mappings) {
            const mappingEntry = mappings[key];

            if (typeof mappingEntry === 'string') {
                cleanedMappings[key] = { type: 'Set Free Text', value: mappingEntry }; // Convert string to object
            } else if (typeof mappingEntry === 'object' && mappingEntry !== null) {
                cleanedMappings[key] = {
                    type: mappingEntry.type || 'Ignore',
                    value: mappingEntry.value || '',
                };
            } else {
                cleanedMappings[key] = { type: 'Ignore', value: '' }; // Default to "Ignore"
            }
        }

        console.log('Cleaned Mappings (to be saved):', cleanedMappings);

        const existingMapping = await Mapping.findOne({ clientId, productId });

        if (existingMapping) {
            existingMapping.mappings = cleanedMappings;
            existingMapping.updatedAt = new Date();
            await existingMapping.save();
            console.log(`Updated mapping for productId: ${productId}`);
        } else {
            const newMapping = new Mapping({ clientId, productId, mappings: cleanedMappings });
            await newMapping.save();
            console.log(`Saved new mapping for productId: ${productId}`);
        }

        res.status(200).json({
            message: 'Mappings saved successfully.',
        });
    } catch (err) {
        console.error('Error saving mappings:', err.message);
        res.status(500).json({ error: 'Failed to save mappings.', details: err.message });
    }
});

// **GET /api/mappings/get/:clientId - Get Mappings**
app.get('/api/mappings/get/:clientId', async (req, res) => {
    const { clientId } = req.params;

    try {
        const mappings = await Mapping.find({ clientId });

        if (!mappings || mappings.length === 0) {
            return res.status(200).json({ mappings: [] });
        }

        res.status(200).json({ mappings });
    } catch (err) {
        console.error('Error fetching mappings:', err.message);
        res.status(500).json({ error: 'Failed to fetch mappings.', details: err.message });
    }
});

// **Walmart Send API Route**
app.post('/api/walmart/send', async (req, res) => {
    try {
        const { itemData } = req.body;
        if (!itemData || itemData.length === 0) {
            return res.status(400).json({ error: 'Item data is required.' });
        }

        const result = await sendItemToWalmart(itemData);
        if (result.success) {
            res.status(200).json({ message: result.message, feedId: result.feedId });
        } else {
            res.status(500).json({ error: result.message });
        }
    } catch (error) {
        console.error('Error sending to Walmart:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// **Fetch Shopify Data for Logged-In User**
app.get('/api/shopify/data', async (req, res) => {
    // existing code to fetch Shopify data
    const shopifyData = await ShopifyData.findOne({ clientId });
    if (!shopifyData || !shopifyData.products) {
        return res.status(404).json({ error: 'No Shopify data found for this user.' });
    }

    const products = shopifyData.products.map(product => ({
        id: product.id,
        title: product.title,
        sku: (product.variants[0] || {}).sku,
        price: (product.variants[0] || {}).price,
        inventory: (product.variants[0] || {}).inventory,
        created_at: product.created_at,
        sourceCategory: product.product_type,
    }));

    res.status(200).json({ shopifyData: products });
});
// **Error Handling Middleware**
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// **Export app**
module.exports = app;