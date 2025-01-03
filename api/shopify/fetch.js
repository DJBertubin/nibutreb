import mongoose from 'mongoose';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import ShopifyData from '../../models/ShopifyData';

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

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

        // Extract necessary data and structure it for the response
        const formattedProducts = shopifyData.products.map((product) => {
            const variant = product.variants[0]; // Using the first variant as default
            return {
                id: product.id,
                title: product.title,
                price: variant ? variant.price : 'N/A',
                sku: variant ? variant.sku : 'N/A',
                inventory: variant ? variant.inventory_quantity : 'N/A',
                created_at: product.created_at,
                sourceCategory: product.product_type || 'N/A', // Product type/category from Shopify
                image: variant && variant.image ? variant.image.src : product.image ? product.image.src : '', // Variant image or fallback to main product image
            };
        });

        // Save formatted Shopify data to the database
        const newShopifyData = new ShopifyData({
            clientId, // Link to logged-in user's clientId
            shopifyUrl: trimmedStoreUrl,
            shopifyToken: adminAccessToken,
            shopifyData: formattedProducts, // Store the formatted Shopify data
        });

        await newShopifyData.save();

        console.log('New Shopify Data Saved:', newShopifyData);

        res.status(201).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData: formattedProducts,
        });
    } catch (err) {
        console.error('Error saving Shopify data:', err.message);
        res.status(500).json({ error: 'Failed to save data to MongoDB', details: err.message });
    }
}