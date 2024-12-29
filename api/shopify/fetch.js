import mongoose from 'mongoose';
import fetch from 'node-fetch';

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define User Schema and Model
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyUrl: { type: String, unique: true, required: true }, // Unique identifier
    shopifyToken: { type: String },
    shopifyData: { type: Object, default: {} }, // Default to empty object
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { storeUrl, adminAccessToken } = req.body;

    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    const trimmedStoreUrl = storeUrl.trim().toLowerCase();
    const shopifyApiUrl = `https://${trimmedStoreUrl}/admin/api/2024-01/products.json`;

    try {
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
        console.log('Shopify Data Size:', JSON.stringify(shopifyData).length);

        const updatedUser = await User.findOneAndUpdate(
            { shopifyUrl: trimmedStoreUrl },
            { shopifyToken: adminAccessToken, shopifyData },
            { new: true, upsert: true }
        );

        if (!updatedUser) {
            console.error('User not found or update failed.');
            return res.status(404).json({ error: 'Failed to save Shopify data.' });
        }

        console.log('After Update:', updatedUser);

        res.status(200).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData,
        });
    } catch (err) {
        console.error('Error saving Shopify data:', err.message);
        res.status(500).json({ error: 'Failed to save data to MongoDB', details: err.message });
    }
}