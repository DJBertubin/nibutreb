import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method not allowed. Use POST instead.' });
    }

    const { storeUrl, apiKey, apiPassword } = req.body;

    if (!storeUrl || !apiKey || !apiPassword) {
        return res.status(400).json({ error: 'Missing required fields: storeUrl, apiKey, and apiPassword.' });
    }

    try {
        const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': apiPassword,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Shopify API Error:', errorText);
            return res.status(response.status).json({ error: `Shopify API error: ${errorText}` });
        }

        const data = await response.json();
        res.status(200).json({ products: data.products });
    } catch (error) {
        console.error('Error connecting to Shopify API:', error);
        res.status(500).json({ error: 'Failed to connect to Shopify API.' });
    }
}
