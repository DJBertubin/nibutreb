export default async function handler(req, res) {
  if (req.method === 'POST') {
      const { storeUrl, apiKey, apiPassword } = req.body;

      // Construct the Shopify API URL
      const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;
      console.log('Shopify API URL:', shopifyApiUrl);

      try {
          // Send a request to Shopify
          const response = await fetch(shopifyApiUrl, {
              method: 'GET', // Shopify API requires GET for fetching products
              headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': apiPassword, // Auth header for Shopify
              },
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
              const errorText = await response.text();
              console.error('Shopify API Error:', errorText);
              throw new Error(`Error fetching Shopify products: ${response.statusText}`);
          }

          const data = await response.json(); // Parse the JSON response
          console.log('Fetched Data:', data);

          // Send the data back to the client
          return res.status(200).json(data);
      } catch (error) {
          console.error('Shopify API error:', error);
          return res.status(500).json({ error: 'Failed to fetch Shopify products.' });
      }
  } else {
      // Handle unsupported methods
      console.log(`Invalid Method: ${req.method}`);
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
