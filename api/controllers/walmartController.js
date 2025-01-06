const { sendItemToWalmart } = require('../utils/sendToWalmart');

exports.sendToWalmart = async (req, res) => {
    const { itemData } = req.body;
    if (!itemData || itemData.length === 0) {
        return res.status(400).json({ error: 'Item data is required.' });
    }
    try {
        const result = await sendItemToWalmart(itemData);
        if (result.success) {
            res.status(200).json({ message: result.message, feedId: result.feedId });
        } else {
            res.status(500).json({ error: result.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};