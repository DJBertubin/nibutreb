const handleConnect = async () => {
    if (!shopifyStoreUrl || !shopifyApiPassword) {
      setStatusMessage('Please fill in all required fields to connect to Shopify.');
      return;
    }
  
    setStatusMessage('Connecting to Shopify...');
  
    try {
      const response = await fetch('https://nibutreb-5jrx07zn7-daniel-joseph-bertubins-projects.vercel.app/api/shopify-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeUrl: shopifyStoreUrl,
          apiPassword: shopifyApiPassword,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
  
      const shopifyData = await response.json();
  
      setStatusMessage('Data fetched successfully. Importing...');
  
      const formattedData = shopifyData.products.map((product) => ({
        id: product.id,
        name: product.title,
        price: `$${product.variants[0].price}`,
        status: product.status === 'active' ? 'Ready' : 'Not Ready',
        category: product.product_type || 'Uncategorized',
      }));
  
      setStatusMessage('Shopify connection successful. Data has been imported.');
  
      if (typeof onShopifyConnect === 'function') {
        onShopifyConnect({
          storeUrl: shopifyStoreUrl,
          data: formattedData,
        });
      }
  
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setStatusMessage(`Failed to connect to Shopify: ${error.message}`);
    }
  };
  