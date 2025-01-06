const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const ShopifyData = require('../models/ShopifyData');

exports.fetchShopifyData = async (req, res) => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = decoded.clientId;

        const shopifyApiUrl = `https://${storeUrl.trim()}/admin/api/2024-01/products.json`;
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminAccessToken },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: await response.text() });
        }

        const shopifyData = await response.json();
        await ShopifyData.findOneAndUpdate(
            { clientId, shopifyUrl: storeUrl.trim() },
            { shopifyData, shopifyToken: adminAccessToken, lastUpdated: new Date() },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: 'Shopify data fetched and stored successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};