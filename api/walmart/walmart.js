const express = require('express');
const jwt = require('jsonwebtoken');
const WalmartData = require('../models/WalmartData'); // Import the Walmart database model
const ShopifyData = require('../models/ShopifyData'); // Import ShopifyData to update target marketplaces
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// **POST route to save Walmart credentials and update target marketplaces**
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

        // Save Walmart credentials
        const walmartData = new WalmartData({ clientId, walmartClientID, walmartClientSecret });
        await walmartData.save();

        // **Update `targetMarketplaces` in `ShopifyData`**
        const shopifyData = await ShopifyData.findOne({ clientId });
        if (shopifyData) {
            if (!shopifyData.targetMarketplaces.includes('Walmart')) {
                shopifyData.targetMarketplaces.push('Walmart');
                await shopifyData.save();
            }
        }

        res.status(201).json({ message: 'Walmart credentials and target marketplace saved successfully!' });
    } catch (error) {
        console.error('Error saving Walmart credentials:', error.message);
        res.status(500).json({ error: 'Failed to save Walmart credentials', details: error.message });
    }
});

// **GET route to retrieve Walmart credentials**
router.get('/credentials', async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required.' });
    }

    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId.' });
        }

        const walmartData = await WalmartData.findOne({ clientId });
        if (!walmartData) {
            return res.status(404).json({ error: 'No Walmart credentials found for this client.' });
        }

        res.status(200).json({
            walmartClientID: walmartData.walmartClientID,
            message: 'Walmart credentials fetched successfully!',
        });
    } catch (error) {
        console.error('Error fetching Walmart credentials:', error.message);
        res.status(500).json({ error: 'Failed to fetch Walmart credentials', details: error.message });
    }
});

module.exports = router;