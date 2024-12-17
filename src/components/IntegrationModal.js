// File: src/components/IntegrationModal.js

import React, { useState } from 'react';
import './IntegrationModal.css';

const IntegrationModal = ({ onClose }) => {
    const [activeSource, setActiveSource] = useState(null);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [fetchedData, setFetchedData] = useState(null);

    const handleSourceClick = (source) => {
        setActiveSource(source);
        setStatusMessage('');
        setFetchedData(null);
    };

    const validateShopifyUrl = (url) => {
        const trimmedUrl = url.trim().toLowerCase();
        const regex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*\.myshopify\.com$/;
        return regex.test(trimmedUrl);
    };

    const handleShopifyAdminConnect = async () => {
        setStatusMessage('Connecting to Shopify Admin API...');
        setFetchedData(null);

        if (!validateShopifyUrl(storeUrl)) {
            setStatusMessage('Invalid Shopify store URL format. Use example.myshopify.com');
            return;
        }

        const adminApiUrl = `https://${storeUrl.trim()}/admin/api/2024-01/products.json`;
        try {
            const response = await fetch(adminApiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': adminAccessToken,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            if (!result?.products) {
                throw new Error('No products found. Verify API permissions and Admin Access Token.');
            }

            setStatusMessage('Shopify Admin data fetched successfully!');
            setFetchedData(result.products);
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

                        {/* Display fetched data */}
                        {fetchedData && (
                            <div className="fetched-data">
                                <h4>Fetched Products:</h4>
                                <ul>
                                    {fetchedData.map((product) => (
                                        <li key={product.id}>
                                            <strong>{product.title}</strong>
                                            <p>{product.body_html || 'No description available'}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                <button className="close-modal" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default IntegrationModal;
