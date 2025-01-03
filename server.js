const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./api/models/User'); // User model for login credentials
const WalmartData = require('./api/models/WalmartData'); // Walmart credentials model

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Walmart Save API Route
app.post('/api/walmart/save', async (req, res) => {
    const { authorization } = req.headers;
    const { walmartClientId, clientSecret } = req.body;

    // Check for missing authorization header
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required.' });
    }

    try {
        // Extract and verify the token
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const linkedToClientId = decoded.clientId; // Identify the user who is saving the data

        // Ensure the token contains a valid clientId
        if (!linkedToClientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        // Check if Walmart data already exists for the user
        const existingData = await WalmartData.findOne({ linkedToClientId });

        if (existingData) {
            // Update existing Walmart data
            existingData.walmartClientId = walmartClientId;
            existingData.clientSecret = clientSecret;
            existingData.updatedAt = new Date();
            await existingData.save();
            console.log(`Walmart credentials updated for clientId: ${linkedToClientId}`);
            res.status(200).json({ message: 'Walmart credentials updated successfully.' });
        } else {
            // Create new Walmart data entry
            const walmartData = new WalmartData({
                walmartClientId,
                clientSecret,
                linkedToClientId,
                createdAt: new Date(),
            });
            await walmartData.save();
            console.log(`New Walmart credentials saved for clientId: ${linkedToClientId}`);
            res.status(201).json({ message: 'Walmart credentials saved successfully.' });
        }
    } catch (error) {
        console.error('Error saving Walmart credentials:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Fetch Walmart Data for Logged-In User
app.get('/api/walmart/data', async (req, res) => {
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

        const walmartData = await WalmartData.find({ linkedToClientId: clientId });

        if (!walmartData || walmartData.length === 0) {
            return res.status(404).json({ error: 'No Walmart data found for this user.' });
        }

        res.status(200).json({
            message: 'Walmart data fetched successfully.',
            walmartData,
        });
    } catch (err) {
        console.error('Error fetching Walmart data:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

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
            clientId: user.clientId,
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;