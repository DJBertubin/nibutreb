import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import WalmartData from '../../models/WalmartData';

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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

        const linkedToClientId = decoded.clientId;

        if (!linkedToClientId) {
            console.error('Missing clientId in token.');
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        const { clientId: walmartClientId, clientSecret } = req.body;

        if (!walmartClientId || !clientSecret) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if Walmart data for the client already exists
        const existingData = await WalmartData.findOne({ linkedToClientId });

        if (existingData) {
            // Update the existing data
            existingData.clientId = walmartClientId;
            existingData.clientSecret = clientSecret;
            existingData.updatedAt = new Date();
            await existingData.save();
        } else {
            // Create a new record
            const walmartData = new WalmartData({
                clientId: walmartClientId,
                clientSecret,
                linkedToClientId,
                createdAt: new Date(),
            });
            await walmartData.save();
        }

        console.log('Walmart credentials saved successfully.');
        res.status(200).json({ message: 'Walmart credentials saved successfully' });
    } catch (err) {
        console.error('Error saving Walmart credentials:', err.message);

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
            error: 'Failed to save Walmart data to MongoDB',
            details: err.message,
        });
    }
}