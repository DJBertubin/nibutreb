import mongoose from 'mongoose';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define User Schema and Model
const UserSchema = new mongoose.Schema({
    clientId: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyUrl: { type: String },
    shopifyToken: { type: String },
    shopifyData: { type: Object, default: {} },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

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

        // Save Shopify data to the user's record in MongoDB
        const updatedUser = await User.findOneAndUpdate(
            { clientId }, // Match by clientId
            {
                $set: {
                    shopifyUrl: trimmedStoreUrl,
                    shopifyToken: adminAccessToken,
                    shopifyData, // Save the fetched Shopify data
                },
            },
            { new: true, upsert: false } // Ensure user exists; no creation on failure
        );

        if (!updatedUser) {
            console.error('User not found or update failed.');
            return res.status(404).json({ error: 'User not found or update failed.' });
        }

        console.log('Updated User:', updatedUser);

        res.status(200).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData,
        });
    } catch (err) {
        console.error('Error saving Shopify data:', err.message);
        res.status(500).json({ error: 'Failed to save data to MongoDB', details: err.message });
    }
}