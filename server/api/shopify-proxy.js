// File: server/api/shopify-proxy.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST instead.' });
    }

    const { storeUrl, apiKey, apiPassword } = req.body;

    if (!storeUrl || !apiKey || !apiPassword) {
        return res.status(400).json({ error: 'Missing required fields: storeUrl, apiKey, and apiPassword.' });
    }

    try {
        const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

        const authString = `${apiKey}:${apiPassword}`;
        const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
            },
        });

        const rawBody = await response.text(); // Read response as text to inspect

        // Log the response for debugging
        console.log('Shopify API Raw Response:', rawBody);

        if (!response.ok) {
            console.error('Shopify API Error:', rawBody);
            return res.status(response.status).json({ error: `Shopify API error: ${rawBody}` });
        }

        let data;
        try {
            data = JSON.parse(rawBody); // Attempt to parse the JSON
        } catch (error) {
            console.error('JSON Parse Error:', error.message);
            return res.status(500).json({ error: 'Unexpected response format from Shopify API.' });
        }

        if (!data.products) {
            return res.status(500).json({ error: 'No products found in Shopify API response.' });
        }

        res.status(200).json({ products: data.products });
    } catch (error) {
        console.error('Error connecting to Shopify API:', error.message);
        res.status(500).json({ error: 'Failed to connect to Shopify API.' });
    }
}
