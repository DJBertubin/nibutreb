// /api/walmart/send.js

import { sendItemToWalmart } from '../../utils/sendToWalmart';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { itemData } = req.body;

        if (!itemData || itemData.length === 0) {
            return res.status(400).json({ error: 'No item data provided.' });
        }

        const result = await sendItemToWalmart(itemData); // Call the utility function

        if (result.success) {
            res.status(200).json({
                message: result.message,
                feedId: result.feedId,
            });
        } else {
            res.status(500).json({
                error: result.message || 'Failed to send data to Walmart.',
            });
        }
    } catch (error) {
        console.error('Error in API /api/walmart/send:', error.message);
        res.status(500).json({ error: error.message });
    }
}