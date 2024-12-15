export default async function handler(req, res) {
  if (req.method === 'POST') {
      const { storeUrl, apiKey, apiPassword } = req.body;

      if (!storeUrl || !apiKey || !apiPassword) {
          return res.status(400).json({ error: 'Missing required fields: storeUrl, apiKey, and apiPassword.' });
      }

      const shopifyApiUrl = `https://${storeUrl}/admin/api/2024-01/products.json`;
      const authHeader = Buffer.from(`${apiKey}:${apiPassword}`).toString('base64');

      try {
          console.log('🔎 Sending request to Shopify API:', shopifyApiUrl);

          const response = await fetch(shopifyApiUrl, {
              method: 'GET', // Shopify API requires GET for product fetching
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${authHeader}`, // Using API Key + Password
              },
          });

          console.log('📡 Response Status:', response.status);

          const responseText = await response.text();
          console.log('📄 Raw Shopify API Response:', responseText);

          if (!response.ok) {
              console.error('❌ Shopify API Error:', responseText);
              throw new Error(`Error fetching Shopify products: ${response.statusText}`);
          }

          let data;
          try {
              data = JSON.parse(responseText);
          } catch (error) {
              console.error('❗ Failed to parse JSON:', responseText);
              throw new Error('Invalid JSON response from Shopify API.');
          }

          if (!data || !data.products) {
              throw new Error('Shopify API returned no products.');
          }

          console.log('✅ Fetched Data:', data);

          return res.status(200).json(data);
      } catch (error) {
          console.error('⚠️ Shopify API Error:', error.message);
          return res.status(500).json({ error: error.message || 'Failed to fetch Shopify products.' });
      }
  } else {
      res.setHeader('Allow', ['POST']);
      console.log(`🚫 Invalid Method: ${req.method}`);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

import './IntegrationModal.css';
