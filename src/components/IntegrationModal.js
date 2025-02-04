import React, { useState } from 'react';
import './IntegrationModal.css';
import './ProductList.css';

const IntegrationModal = ({ onClose, onFetchSuccess, onAddStoreName }) => {
    const [activeSource, setActiveSource] = useState(null);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    // Validate Shopify URL
    const validateShopifyUrl = (url) => {
        const regex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*\.myshopify\.com$/;
        return regex.test(url.trim().toLowerCase());
    };

    // Extract store name from Shopify URL
    const extractStoreName = (url) => {
        return url.split('.myshopify.com')[0];
    };

    // Handle connection to Shopify Admin API
    const handleShopifyAdminConnect = async () => {
        setStatusMessage('Connecting to Shopify Admin API via Proxy...');

        if (!validateShopifyUrl(storeUrl)) {
            setStatusMessage('Invalid Shopify store URL format. Use example.myshopify.com');
            return;
        }

        try {
            const token = localStorage.getItem('token'); // Retrieve token from localStorage
            if (!token) {
                throw new Error('User is not authenticated. Please log in again.');
            }

            const response = await fetch('/api/shopify/fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Include Authorization header with the token
                },
                body: JSON.stringify({
                    storeUrl: storeUrl.trim(),
                    adminAccessToken: adminAccessToken,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Shopify API Error: ${errorText}`);
            }

            const data = await response.json();
            const storeName = extractStoreName(storeUrl);
            setStatusMessage(`Successfully fetched data from ${storeName}`);

            // Pass store name back to the parent if needed
            if (typeof onAddStoreName === 'function') {
                onAddStoreName(storeName, true);
            }

            // Pass fetched Shopify products to parent component
            if (typeof onFetchSuccess === 'function') {
                onFetchSuccess(data.shopifyData.products || []);
            }

            onClose();
        } catch (error) {
            setStatusMessage(`Failed to connect: ${error.message}`);
        }
    };

    return (
        <div className="integration-modal">
            <div className="modal-content">
                <h2>Add New Source</h2>
                <div className="source-buttons">
                    <button
                        className={`source-button ${activeSource === 'shopify' ? 'active' : ''}`}
                        onClick={() => setActiveSource('shopify')}
                    >
                        Shopify
                    </button>
                </div>

                {activeSource === 'shopify' && (
                    <div className="shopify-integration">
                        <h3>Shopify Admin API Integration</h3>
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
                        <button className="connect-button" onClick={handleShopifyAdminConnect}>
                            Connect
                        </button>
                        <p>{statusMessage}</p>
                    </div>
                )}
                <button className="close-modal" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default IntegrationModal;