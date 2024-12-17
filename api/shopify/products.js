// File: api/shopify/products.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { storeUrl, adminAccessToken } = req.body;

    // Input Validation
    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

    try {
        console.log('Connecting to Shopify Admin API:', shopifyApiUrl);

        // Fetch request to Shopify Admin API
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': adminAccessToken,
            },
        });

        // Log response for debugging
        console.log('Shopify Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Shopify Admin API Error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        console.log('Shopify Admin API Success:', data);

        // Return the successful response
        return res.status(200).json(data);
    } catch (error) {
        console.error('Internal Serverless Function Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
