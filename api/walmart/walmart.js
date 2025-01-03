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
            walmartData.walmartClientID = walmartClientID;
            walmartData.walmartClientSecret = walmartClientSecret;
            await walmartData.save();
        } else {
            walmartData = new WalmartData({ clientId, walmartClientID, walmartClientSecret, role: 'Target Marketplace' });
            await walmartData.save();
        }

        // **Update `targetMarketplaces` in `ShopifyData`**
        const shopifyData = await ShopifyData.findOne({ clientId });
        if (shopifyData) {
            if (!Array.isArray(shopifyData.targetMarketplaces)) {
                shopifyData.targetMarketplaces = [];
            }
            if (!shopifyData.targetMarketplaces.includes('Walmart')) {
                shopifyData.targetMarketplaces.push('Walmart');
                await shopifyData.save();
            }
        } else {
            return res.status(404).json({ error: 'No Shopify source data found for this client.' });
        }

        res.status(201).json({ message: 'Walmart credentials and target marketplace saved successfully!' });
    } catch (error) {
        console.error('Error saving Walmart credentials:', error.message);
        res.status(500).json({ error: 'Failed to save Walmart credentials', details: error.message });
    }
});

// **GET route to retrieve Walmart target marketplaces for the client**
router.get('/target-marketplaces', async (req, res) => {
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

        const shopifyData = await ShopifyData.findOne({ clientId });
        if (!shopifyData) {
            return res.status(404).json({ error: 'No Shopify data found for this client.' });
        }

        res.status(200).json({
            targetMarketplaces: shopifyData.targetMarketplaces || [],
            message: 'Target marketplaces fetched successfully!',
        });
    } catch (error) {
        console.error('Error fetching target marketplaces:', error.message);
        res.status(500).json({ error: 'Failed to fetch target marketplaces', details: error.message });
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

// **DELETE route to remove Walmart credentials and update role**
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

        const shopifyData = await ShopifyData.findOne({ clientId });
        if (shopifyData && Array.isArray(shopifyData.targetMarketplaces)) {
            shopifyData.targetMarketplaces = shopifyData.targetMarketplaces.filter((marketplace) => marketplace !== 'Walmart');
            await shopifyData.save();
        }

        res.status(200).json({ message: 'Walmart credentials and target marketplace removed successfully!' });
    } catch (error) {
        console.error('Error deleting Walmart credentials:', error.message);
        res.status(500).json({ error: 'Failed to delete Walmart credentials', details: error.message });
    }
});

module.exports = router;