// File: api/shopify/products.js

export default async function handler(req, res) {
    // Allow only POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { storeUrl, adminAccessToken } = req.body;

    // Input validation
    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    // Build Shopify Admin API URL
    const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

    try {
        console.log('Connecting to Shopify Admin API:', shopifyApiUrl);

        // Fetch from Shopify Admin API
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': adminAccessToken,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Shopify API Error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Serverless Function Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', details: error.me
