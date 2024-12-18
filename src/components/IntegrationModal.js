// File: src/components/IntegrationModal.js

import React, { useState } from 'react';
import './IntegrationModal.css';

const IntegrationModal = ({ onClose, onFetchSuccess }) => {
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleShopifyConnect = async () => {
        setStatusMessage('Connecting to Shopify Admin API via Proxy...');

        if (!storeUrl || !adminAccessToken) {
            setStatusMessage('Please provide the Store URL and Admin Access Token.');
            return;
        }

        try {
            const response = await fetch('/api/shopify/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeUrl, adminAccessToken }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            onFetchSuccess(result.products); // Pass sorted data to parent component
            setStatusMessage('Data fetched successfully!');
        } catch (error) {
            console.error('Error fetching from proxy:', error.message);
            setStatusMessage(`Failed to connect: ${error.message}`);
        }
    };

    return (
        <div className="integration-modal">
            <div className="modal-content">
                <h2>Connect to Shopify</h2>
                <label>
                    Store URL:
                    <input
                        type="text"
                        placeholder="example.myshopify.com"
                        value={storeUrl}
                        onChange={(e) => setStoreUrl(e.target.value)}
                    />
                </label>
                <label>
                    Admin Access Token:
                    <input
                        type="password"
                        placeholder="Your Admin Access Token"
                        value={adminAccessToken}
                        onChange={(e) => setAdminAccessToken(e.target.value)}
                    />
                </label>
                <button onClick={handleShopifyConnect}>Fetch Data</button>
                <button onClick={onClose}>Close</button>
                <p>{statusMessage}</p>
            </div>
        </div>
    );
};

export default IntegrationModal;
