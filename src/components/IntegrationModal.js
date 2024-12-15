import React, { useState } from 'react';
import './IntegrationModal.css';

const IntegrationModal = ({ onClose, onConnect }) => {
  const [storeUrl, setStoreUrl] = useState('');
  const [apiPassword, setApiPassword] = useState('');

  const handleConnect = () => {
    if (!storeUrl || !apiPassword) {
      alert('Please fill in all fields.');
      return;
    }

    onConnect({ storeUrl, apiPassword });
  };

  return (
    <div className="integration-modal">
      <div className="modal-content">
        <h2 className="modal-title">Shopify Integration</h2>
        <div className="input-group">
          <label htmlFor="storeUrl">Store URL:</label>
          <input
            type="text"
            id="storeUrl"
            placeholder="example.myshopify.com"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="apiPassword">API Password:</label>
          <input
            type="password"
            id="apiPassword"
            placeholder="Your Shopify API Password"
            value={apiPassword}
            onChange={(e) => setApiPassword(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="connect-button" onClick={handleConnect}>Connect</button>
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationModal;
