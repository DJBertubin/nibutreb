import React, { useState } from 'react';
import './IntegrationModal.css';

const IntegrationModal = ({ type, onClose, onShopifyConnect }) => {
  const [activeTab, setActiveTab] = useState('');
  const [shopifyStoreUrl, setShopifyStoreUrl] = useState('');
  const [shopifyApiPassword, setShopifyApiPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setStatusMessage('');
  };

  const handleConnect = async () => {
    if (!shopifyStoreUrl || !shopifyApiPassword) {
      setStatusMessage('Please fill in all required fields to connect to Shopify.');
      return;
    }

    setStatusMessage('Connecting to Shopify...');

    try {
      // Fetch products using the deployed proxy server
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

  return (
    <div className="integration-modal">
      <div className="modal-content">
        <h3>Add New {type === 'source' ? 'Source' : 'Target'}</h3>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'Shopify' ? 'active' : ''}`}
            onClick={() => handleTabClick('Shopify')}
          >
            Shopify
          </button>
          <button
            className={`tab ${activeTab === 'Walmart' ? 'active' : ''}`}
            onClick={() => handleTabClick('Walmart')}
          >
            Walmart
          </button>
        </div>

        {activeTab === 'Shopify' && (
          <div className="tab-content">
            <h4>Shopify Integration</h4>
            <form onSubmit={(e) => e.preventDefault()}>
              <label>
                Store URL:
                <input
                  type="text"
                  placeholder="Enter your Shopify store URL (e.g., mystore.myshopify.com)"
                  value={shopifyStoreUrl}
                  onChange={(e) => setShopifyStoreUrl(e.target.value)}
                />
              </label>
              <label>
                API Password:
                <input
                  type="password"
                  placeholder="Enter your Shopify API Password"
                  value={shopifyApiPassword}
                  onChange={(e) => setShopifyApiPassword(e.target.value)}
                />
              </label>
              <button type="button" className="connect-btn" onClick={handleConnect}>Connect</button>
            </form>
            {statusMessage && <p className="status-message">{statusMessage}</p>}
          </div>
        )}

        {activeTab === 'Walmart' && (
          <div className="tab-content">
            <h4>Walmart Integration</h4>
            <p>Click integrate to begin Walmart integration process.</p>
            <button type="button" onClick={() => alert('Starting Walmart integration process...')}>
              Integrate
            </button>
          </div>
        )}

        <button className="close-modal" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default IntegrationModal;