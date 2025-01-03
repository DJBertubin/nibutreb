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

        // **Check if Walmart credentials already exist for the client**
        let walmartData = await WalmartData.findOne({ clientId });
        if (walmartData) {
            // Update existing credentials
            walmartData.walmartClientID = walmartClientID;
            walmartData.walmartClientSecret = walmartClientSecret;
            await walmartData.save();
        } else {
            // Save new Walmart credentials
            walmartData = new WalmartData({ clientId, walmartClientID, walmartClientSecret });
            await walmartData.save();
        }

        // **Update `targetMarketplaces` in `ShopifyData`**
        const shopifyData = await ShopifyData.findOne({ clientId });
        if (shopifyData) {
            if (!Array.isArray(shopifyData.targetMarketplaces)) {
                shopifyData.targetMarketplaces = []; // Ensure it is an array
            }
            if (!shopifyData.targetMarketplaces.includes('Walmart')) {
                shopifyData.targetMarketplaces.push('Walmart'); // Add Walmart as a target marketplace
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

// **DELETE route to remove Walmart credentials**
router.delete('/credentials', async (req, res) => {
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

        const walmartData = await WalmartData.findOneAndDelete({ clientId });
        if (!walmartData) {
            return res.status(404).json({ error: 'No Walmart credentials found to delete.' });
        }

        // Remove Walmart from target marketplaces
        const shopifyData = await ShopifyData.findOne({ clientId });
        if (shopifyData && Array.isArray(shopifyData.targetMarketplaces)) {
            shopifyData.targetMarketplaces = shopifyData.targetMarketplaces.filter(
                (marketplace) => marketplace !== 'Walmart'
            );
            await shopifyData.save();
        }

        res.status(200).json({ message: 'Walmart credentials and target marketplace removed successfully!' });
    } catch (error) {
        console.error('Error deleting Walmart credentials:', error.message);
        res.status(500).json({ error: 'Failed to delete Walmart credentials', details: error.message });
    }
});

module.exports = router;