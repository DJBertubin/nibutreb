import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import ShopifyData from '../../models/ShopifyData';

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Token missing.' });
    }

    try {
        // Extract the token and decode it
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        // Fetch all Shopify data linked to the user's clientId
        const shopifyData = await ShopifyData.find({ clientId });

        if (!shopifyData.length) {
            return res.status(404).json({ error: 'No Shopify data found for this user.' });
        }

        res.status(200).json({
            message: 'Shopify data fetched successfully.',
            shopifyData,
        });
    } catch (err) {
        console.error('Error fetching Shopify data:', err.message);
        res.status(500).json({
            error: 'Failed to fetch data from MongoDB',
            details: err.message,
        });
    }
}