import React, { useState } from 'react';
import './IntegrationModal.css';

const IntegrationModal = ({ onClose, onFetchSuccess }) => {
    const [activeSource, setActiveSource] = useState(null);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSourceClick = (source) => {
        setActiveSource(source);
        setStatusMessage('');
    };

    const validateShopifyUrl = (url) => {
        const trimmedUrl = url.trim().toLowerCase();
        const regex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*\.myshopify\.com$/;
        return regex.test(trimmedUrl);
    };

    const handleShopifyAdminConnect = async () => {
        setStatusMessage('Connecting to Shopify Admin API via Proxy...');

        if (!validateShopifyUrl(storeUrl)) {
            setStatusMessage('Invalid Shopify store URL format. Use example.myshopify.com');
            return;
        }

        try {
            const response = await fetch('/api/shopify/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeUrl: storeUrl.trim(),
                    adminAccessToken: adminAccessToken,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Proxy API Error:', errorText);
                throw new Error(`Request failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Proxy API Response:', result);

            if (!result?.products) {
                throw new Error('No products returned. Verify API permissions and Admin Access Token.');
            }

            setStatusMessage('Shopify Admin data fetched successfully!');
            onFetchSuccess(result.products);
            onClose();
        } catch (error) {
            console.error('Error fetching from proxy:', error.message);
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
                        onClick={() => handleSourceClick('shopify')}
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
                        <button className="connect-button" onClick={handleShopifyAdminConnect}>Connect</button>
                        <p>{statusMessage}</p>
                    </div>
                )}
                <button className="close-modal" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default IntegrationModal;