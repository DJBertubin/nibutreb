// server.js or api source routes
app.get('/api/source-attributes', async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Token missing.' });
    }

    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        const shopifyData = await ShopifyData.findOne({ clientId });

        if (!shopifyData || !shopifyData.products.length) {
            return res.status(404).json({ attributes: [] });
        }

        // Extract attributes from the first product's variants
        const firstProduct = shopifyData.products[0];
        const attributes = Object.keys(firstProduct.variants[0] || {}).filter(
            (key) => !['_id', '__v', 'id'].includes(key)
        );

        res.status(200).json({ attributes });
    } catch (error) {
        console.error('Error fetching source attributes:', error.message);
        res.status(500).json({ error: 'Failed to fetch attributes', details: error.message });
    }
});