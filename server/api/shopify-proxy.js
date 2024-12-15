export default async function handler(req, res) {
  if (req.method === 'POST') {
      const { storeUrl, apiKey, apiPassword } = req.body;

      const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

      try {
          console.log('Sending request to Shopify API:', shopifyApiUrl);

          const response = await fetch(shopifyApiUrl, {
              method: 'GET', // Shopify's API requires GET for product fetching
              headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': apiPassword,
              },
          });

          console.log('Response Status:', response.status);

          const responseText = await response.text();
          console.log('Raw Shopify API Response:', responseText);

          if (!response.ok) {
              console.error('Error Response from Shopify:', responseText);
              throw new Error(`Error fetching Shopify products: ${response.statusText}`);
          }

          let data;
          try {
              data = JSON.parse(responseText);
          } catch (error) {
              console.error('Failed to parse JSON:', responseText);
              throw new Error('Invalid JSON response from Shopify API.');
          }

          if (!data || !data.products) {
              throw new Error('Shopify API returned no products.');
          }

          console.log('Fetched Data:', data);

          return res.status(200).json(data);
      } catch (error) {
          console.error('Shopify API error:', error);
          return res.status(500).json({ error: error.message || 'Failed to fetch Shopify products.' });
      }
  } else {
      res.setHeader('Allow', ['POST']);
      console.log(`Invalid Method: ${req.method}`);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
