const express = require('express');
const jwt = require('jsonwebtoken');
const WalmartData = require('../models/WalmartData'); // Import the database model
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// **POST route to save Walmart credentials**
router.post('/credentials', async (req, res) => {
    const { authorization } = req.headers;
    const { walmartClientID, walmartClientSecret } = req.body;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required.' });
    }

    if (!walmartClientID || !walmartClientSecret) {
        return res.status(400).json({ error: 'Walmart Client ID and Secret are required.' });
    }

    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId.' });
        }

        const walmartData = new WalmartData({ clientId, walmartClientID, walmartClientSecret });
        await walmartData.save();

        res.status(201).json({ message: 'Walmart credentials saved successfully!' });
    } catch (error) {
        console.error('Error saving Walmart credentials:', error.message);
        res.status(500).json({ error: 'Failed to save Walmart credentials', details: error.message });
    }
});

module.exports = router;