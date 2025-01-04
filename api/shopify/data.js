import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import ShopifyData from '../../models/ShopifyData';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB.');
        } catch (err) {
            console.error('Failed to connect to MongoDB:', err.message);
            throw new Error('Database connection failed');
        }
    }
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Token missing.' });
    }

    try {
        await connectDB();

        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            console.error('Missing clientId in token.');
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        console.log(`Fetching Shopify data for clientId: ${clientId}`);
        const shopifyData = await ShopifyData.find({ clientId });

        if (!shopifyData.length) {
            console.log(`No Shopify data found for clientId: ${clientId}`);
            return res.status(200).json({
                message: 'No Shopify data found for this user.',
                shopifyData: [],
            });
        }

        res.status(200).json({
            message: 'Shopify data fetched successfully.',
            shopifyData,
        });
    } catch (err) {
        console.error('Error fetching Shopify data:', err.message);

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid or malformed token.',
                details: err.message,
            });
        }

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired. Please log in again.',
                details: err.message,
            });
        }

        res.status(500).json({
            error: 'Failed to fetch data from MongoDB',
            details: err.message,
        });
    }
}