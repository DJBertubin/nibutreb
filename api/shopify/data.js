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
        // Decode the token and get clientId
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            console.error('Missing clientId in token.');
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        // Fetch the Shopify data for this clientId
        const shopifyData = await ShopifyData.findOne({ clientId });

        if (!shopifyData) {
            console.log(`No Shopify data found for clientId: ${clientId}`);
            return res.status(200).json({
                message: 'No Shopify data found for this user.',
                shopifyData: [],
            });
        }

        // Format data to be consistent with frontend expectations
        const formattedProducts = (shopifyData.products || []).map((product) => ({
            id: product.id || '',
            product_id: product.product_id || '',
            title: product.title || 'Untitled Product',
            price: product.price || 'N/A',
            sku: product.sku || 'N/A',
            inventory: product.inventory || 0,
            created_at: product.created_at || '',
            sourceCategory: product.sourceCategory || 'N/A',
            image: product.image || 'https://via.placeholder.com/50',
            description: product.description || '',
        }));

        const formattedData = {
            shopifyUrl: shopifyData.shopifyUrl || 'N/A',
            lastUpdated: shopifyData.lastUpdated || new Date(),
            products: formattedProducts,
        };

        console.log(`Shopify data fetched successfully for clientId: ${clientId}`);
        res.status(200).json({
            message: 'Shopify data fetched successfully.',
            shopifyData: [formattedData], // Frontend expects an array
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