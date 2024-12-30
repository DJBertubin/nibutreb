import mongoose from 'mongoose';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define Shopify Data Schema
const ShopifyDataSchema = new mongoose.Schema({
    clientId: { type: String, required: true }, // Link to the logged-in user's clientId
    shopifyUrl: { type: String, required: true },
    shopifyToken: { type: String, required: true },
    shopifyData: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }, // Track when the data was created
});

const ShopifyData = mongoose.models.ShopifyData || mongoose.model('ShopifyData', ShopifyDataSchema);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { authorization } = req.headers;
    const { storeUrl, adminAccessToken } = req.body;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Token missing.' });
    }

    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    const trimmedStoreUrl = storeUrl.trim().toLowerCase();
    const shopifyApiUrl = `https://${trimmedStoreUrl}/admin/api/2024-01/products.json`;

    try {
        // Decode JWT token to identify the requesting user
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        // Fetch data from Shopify API
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': adminAccessToken,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Shopify API Error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const shopifyData = await response.json();

        // Save the Shopify data as a new document linked to the clientId
        const newShopifyData = new ShopifyData({
            clientId,
            shopifyUrl: trimmedStoreUrl,
            shopifyToken: adminAccessToken,
            shopifyData, // Save the fetched Shopify data
        });

        await newShopifyData.save();

        console.log('New Shopify Data Saved:', newShopifyData);

        res.status(201).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData: newShopifyData.shopifyData,
        });
    } catch (err) {
        console.error('Error saving Shopify data:', err.message);
        res.status(500).json({ error: 'Failed to save data to MongoDB', details: err.message });
    }
}