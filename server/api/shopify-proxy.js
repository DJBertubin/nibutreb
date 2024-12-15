export default async function handler(req, res) {
  if (req.method === 'POST') {
      const { storeUrl, apiKey, apiPassword } = req.body;

      const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

      try {
          const response = await fetch(shopifyApiUrl, {
              method: 'GET', // Shopify's API requires GET for product fetching
              headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': apiPassword,
              },
          });

          if (!response.ok) {
              throw new Error(`Error fetching Shopify products: ${response.statusText}`);
          }

          const data = await response.json();
          return res.status(200).json(data);
      } catch (error) {
          console.error('Shopify API error:', error);
          return res.status(500).json({ error: 'Failed to fetch Shopify products.' });
      }
  } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
