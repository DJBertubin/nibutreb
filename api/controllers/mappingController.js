const Mapping = require('../models/Mapping');

exports.saveMapping = async (req, res) => {
    const { clientId, productId, mappings } = req.body;
    if (!clientId || !productId || !mappings) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    try {
        const newMapping = new Mapping({ clientId, productId, mappings });
        await newMapping.save();
        res.status(200).json({ message: 'Mapping saved successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save mapping.' });
    }
};

exports.getMappings = async (req, res) => {
    const { clientId } = req.params;
    try {
        const mappings = await Mapping.find({ clientId });
        res.status(200).json({ mappings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mappings.' });
    }
};