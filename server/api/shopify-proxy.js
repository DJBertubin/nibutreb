export default async function handler(req, res) {
    console.log('Incoming request:', req.body); // Log incoming requests for debugging
  
    if (req.method === 'POST') {
      const { storeUrl, apiPassword } = req.body;
  
      // Validate inputs
      if (!storeUrl || !apiPassword) {
        console.error('Missing parameters:', { storeUrl, apiPassword });
        return res.status(400).json({ error: 'Missing store URL or API password.' });
      }
  
      const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;
  
      try {
        // Log API URL for debugging
        console.log('Fetching data from:', shopifyApiUrl);
  
        const response = await fetch(shopifyApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`89ad92a5a46997a7ccb9cecd490d212a:${apiPassword}`).toString('base64')}`,
          },
        });
  
        // Log the response status for debugging
        console.log('Response status:', response.status);
  
        if (!response.ok) {
          const errorText = await response.text(); // Capture the error text for debugging
          console.error('Shopify API Error:', errorText);
          throw new Error(`Shopify API error: ${response.statusText}`);
        }
  
        const data = await response.json();
  
        // Log fetched data for debugging
        console.log('Fetched Shopify data:', data);
  
        res.status(200).json(data);
      } catch (error) {
        console.error('Error connecting to Shopify:', error.message);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
  