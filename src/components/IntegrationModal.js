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

    // Updated to handle trailing spaces and case sensitivity
    const validateShopifyUrl = (url) => {
        const trimmedUrl = url.trim().toLowerCase();
        const regex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*\.myshopify\.com$/;
        return regex.test(trimmedUrl);
    };

    const handleShopifyAdminConnect = async () => {
        setStatusMessage('Connecting to Shopify Admin API...');

        if (!validateShopifyUrl(storeUrl)) {
            setStatusMessage('Invalid Shopify store URL format. Use example.myshopify.com');
            return;
        }

        const adminApiUrl = `https://${storeUrl.trim()}/admin/api/2024-01/products.json`;
        try {
            console.log('Connecting to Admin API:', adminApiUrl);
            const response = await fetch(adminApiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': adminAccessToken,
                },
            });

            console.log('Fetch response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Shopify Admin API Error:', errorText);
                throw new Error(`Request failed: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Shopify Admin API Response:', result);

            if (!result?.products) {
                throw new Error('No products found. Verify API permissions and Admin Access Token.');
            }

            setStatusMessage('Shopify Admin data fetched successfully!');
            onFetchSuccess(result.products);
            onClose();
        } catch (error) {
            console.error('Admin API Connection Error:', error);
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
