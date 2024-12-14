export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { storeUrl, apiPassword } = req.body;
      const shopifyApiUrl = `https://${storeUrl}/admin/api/2023-04/products.json`;
  
      try {
        const response = await fetch(shopifyApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': apiPassword,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
  
        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
  