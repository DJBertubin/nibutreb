import React, { useState } from 'react';

const IntegrationModal = ({ onClose }) => {
  const [storeUrl, setStoreUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiPassword, setApiPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/shopify-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeUrl,
          apiPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to connect to Shopify');
      } else {
        setSuccess('Connected to Shopify successfully!');
        console.log('Fetched Products:', data.products);
        // TODO: Populate your table here with `data.products`
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Frontend Error:', err);
    }
  };

  return (
    <div className="integration-modal">
      <div className="modal-content">
        <h3>Shopify Integration</h3>
        <label>
          Store URL:
          <input
            type="text"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="example.myshopify.com"
          />
        </label>
        <label>
          API Password:
          <input
            type="password"
            value={apiPassword}
            onChange={(e) => setApiPassword(e.target.value)}
            placeholder="Your Shopify API Password"
          />
        </label>
        <button onClick={handleConnect}>Connect</button>
        <button onClick={onClose}>Close</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </div>
    </div>
  );
};

export default IntegrationModal;
