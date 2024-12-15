// File: server/api/shopify-proxy.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST instead.' });
    }

    const { storeUrl, apiPassword } = req.body;

    if (!storeUrl || !apiPassword) {
        return res.status(400).json({ error: 'Missing required fields: storeUrl and apiPassword.' });
    }

    try {
        const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${Buffer.from(`:${apiPassword}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Shopify API Error Response:', errorText);
            return res.status(response.status).json({ error: `Shopify API error: ${errorText}` });
        }

        // Handle potential empty or malformed responses
        const responseBody = await response.text();
        try {
            const data = JSON.parse(responseBody);
            if (!data.products) {
                throw new Error('No products found in the response');
            }
            res.status(200).json({ products: data.products });
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError.message);
            console.error('Response Body:', responseBody);
            return res.status(500).json({ error: 'Unexpected response format from Shopify API.' });
        }
    } catch (error) {
        console.error('Error connecting to Shopify API:', error.message);
        res.status(500).json({ error: 'Failed to connect to Shopify API.' });
    }
}
