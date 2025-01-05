const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const User = require('./api/models/User');
const ShopifyData = require('./api/models/ShopifyData');
const Mapping = require('./api/models/Mapping');
const walmartRoutes = require('./api/walmart/walmart');
const { sendItemToWalmart } = require('./api/utils/sendToWalmart');

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

// **Security Middleware**
app.use(helmet());

// **Rate Limiting Middleware**
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});
app.use('/api/', apiLimiter);

// **CORS Policy**
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));

// **Body Parsing Middleware**
app.use(express.json());

// **MongoDB Connection**
mongoose.set('strictQuery', false); // Avoid deprecated warnings
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));

// **Use Walmart API routes**
app.use('/api/walmart', walmartRoutes);

// **Helper function to verify JWT**
const verifyToken = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required.' });
    }

    const token = authorization.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

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

        const refreshToken = jwt.sign({ clientId: user.clientId }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            token,
            refreshToken,
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
app.get('/api/client/info', verifyToken, async (req, res) => {
    try {
        const { clientId } = req.user;

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
app.post('/api/shopify/fetch', verifyToken, async (req, res) => {
    const { storeUrl, adminAccessToken } = req.body;

    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    try {
        const { clientId } = req.user;
        const shopifyApiUrl = `https://${storeUrl.trim()}/admin/api/2024-01/products.json?limit=250`;
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

// **Save Mappings**
app.post('/api/mappings/save', verifyToken, async (req, res) => {
    const { clientId } = req.user;
    const { productId, mappings } = req.body;

    if (!productId || !mappings) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        const cleanedMappings = {};
        for (const key in mappings) {
            const mappingEntry = mappings[key];
            cleanedMappings[key] = {
                type: mappingEntry?.type || 'Ignore',
                value: mappingEntry?.value || '',
            };
        }

        const existingMapping = await Mapping.findOneAndUpdate(
            { clientId, productId },
            { mappings: cleanedMappings, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Mappings saved successfully.', existingMapping });
    } catch (err) {
        console.error('Error saving mappings:', err.message);
        res.status(500).json({ error: 'Failed to save mappings.', details: err.message });
    }
});

// **Get Mappings**
app.get('/api/mappings/get/:clientId', verifyToken, async (req, res) => {
    const { clientId } = req.params;

    try {
        const mappings = await Mapping.find({ clientId });

        if (!mappings.length) {
            return res.status(200).json({ mappings: [] });
        }

        res.status(200).json({ mappings });
    } catch (err) {
        console.error('Error fetching mappings:', err.message);
        res.status(500).json({ error: 'Failed to fetch mappings.', details: err.message });
    }
});

// **Send Products to Walmart**
app.post('/api/walmart/send', verifyToken, async (req, res) => {
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
app.get('/api/shopify/data', verifyToken, async (req, res) => {
    try {
        const { clientId } = req.user;

        const shopifyData = await ShopifyData.find({ clientId });

        if (!shopifyData.length) {
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

// **Error Handling Middleware**
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// **Start the Server**
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;