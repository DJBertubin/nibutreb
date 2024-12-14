const handleConnect = async () => {
    if (!shopifyStoreUrl || !shopifyApiPassword) {
      setStatusMessage('Please fill in all required fields to connect to Shopify.');
      return;
    }
  
    setStatusMessage('Connecting to Shopify...');
  
    try {
      // Prepare the Basic Auth header
      const apiKey = "your-shopify-api-key"; // Replace with your API Key
      const authHeader = `Basic ${btoa(`${apiKey}:${shopifyApiPassword}`)}`;
  
      const response = await fetch(`https://${shopifyStoreUrl}/admin/api/2024-01/products.json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
  
      const shopifyData = await response.json();
  
      setStatusMessage('Data fetched successfully. Importing...');
  
      // Map Shopify data to your table's format
      const formattedData = shopifyData.products.map((product) => ({
        id: product.id,
        name: product.title,
        price: `$${product.variants[0].price}`, // Assuming the first variant's price
        status: product.status === 'active' ? 'Ready' : 'Not Ready',
        category: product.product_type || 'Uncategorized',
      }));
  
      setStatusMessage('Shopify connection successful. Data has been imported.');
  
      // Pass collected data to parent for further processing
      if (typeof onShopifyConnect === 'function') {
        onShopifyConnect({
          storeUrl: shopifyStoreUrl,
          data: formattedData,
        });
      }
  
      setTimeout(() => onClose(), 2000); // Close modal after a delay
    } catch (error) {
      setStatusMessage(`Failed to connect to Shopify: ${error.message}`);
    }
  };
  