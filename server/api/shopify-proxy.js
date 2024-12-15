export default async function handler(req, res) {
  if (req.method === 'POST') {
      const { storeUrl, apiKey, apiPassword } = req.body;

      if (!storeUrl || !apiKey || !apiPassword) {
          return res.status(400).json({ error: 'Missing required fields: storeUrl, apiKey, and apiPassword.' });
      }

      // Shopify API URL
      const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;

      // Authorization Header for Basic Auth
      const authHeader = Buffer.from(`${apiKey}:${apiPassword}`).toString('base64');

      try {
          console.log('🔎 Requesting Shopify API:', shopifyApiUrl);

          // Make request to Shopify API
          const response = await fetch(shopifyApiUrl, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${authHeader}`,
              },
          });

          // Log response status
          console.log('📡 Shopify Response Status:', response.status);

          if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ Shopify API Error Response:', errorText);
              throw new Error(`Error fetching Shopify products: ${response.statusText}`);
          }

          // Parse the JSON response
          const data = await response.json();
          console.log('✅ Shopify Products Fetched:', data);

          // Send the response back to the frontend
          return res.status(200).json(data);
      } catch (error) {
          console.error('❗ Shopify API Error:', error.message);
          return res.status(500).json({ error: error.message || 'Failed to fetch Shopify products.' });
      }
  } else {
      res.setHeader('Allow', ['POST']);
      console.log(`🚫 Invalid Method Used: ${req.method}`);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
