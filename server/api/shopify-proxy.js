// --- api/shopify-proxy.js ---

export default async function handler(req, res) {
    try {
      // Log the incoming request data for debugging
      console.log('Incoming request body:', req.body);
  
      const { storeUrl, apiPassword } = req.body;
  
      if (!storeUrl || !apiPassword) {
        console.error('Missing storeUrl or apiPassword.');
        return res.status(400).json({ error: 'Missing storeUrl or apiPassword.' });
      }
  
      const apiEndpoint = `https://${storeUrl}/admin/api/2024-01/products.json`;
      console.log(`Attempting to connect to Shopify API at ${apiEndpoint}`);
  
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`:${apiPassword}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Shopify API error (${response.status}):`, errorText);
        return res.status(response.status).json({ error: errorText });
      }
  
      const data = await response.json();
      console.log('Fetched data from Shopify:', data);
  
      res.status(200).json(data);
    } catch (error) {
      console.error('Unexpected error:', error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
  