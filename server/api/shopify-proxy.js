export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { storeUrl, apiPassword } = req.body;
  
      if (!storeUrl || !apiPassword) {
        return res.status(400).json({ error: 'Missing store URL or API password.' });
      }
  
      const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;
  
      try {
        // Encode API key and password in Base64
        const apiKey = '89ad92a5a46997a7ccb9cecd490d212a'; // Replace with your API key
        const encodedAuth = Buffer.from(`${apiKey}:${apiPassword}`).toString('base64');
  
        const response = await fetch(shopifyApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${encodedAuth}`, // Use Basic Authentication
          },
        });
  
        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
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
  