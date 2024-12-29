import mongoose from 'mongoose';
import fetch from 'node-fetch';

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define User Schema and Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyData: Object, // Field for storing Shopify data
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { username, shopifyUrl, shopifyToken } = req.body;

    if (!username || !shopifyUrl || !shopifyToken) {
        return res.status(400).json({
            error: 'Username, Shopify URL, and Shopify Token are required.',
        });
    }

    const shopifyApiUrl = `${shopifyUrl}/admin/api/2024-01/products.json`;

    try {
        // Fetch Shopify data
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': shopifyToken,
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            return res.status(response.status).json({ error: errorData });
        }

        const shopifyData = await response.json();

        // Find the user and update their record
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        user.shopifyData = shopifyData; // Save Shopify data to the user's record
        await user.save();

        res.status(200).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData,
        });
    } catch (err) {
        console.error('Error fetching Shopify data:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
}