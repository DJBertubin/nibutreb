import React, { useState } from 'react';
import './IntegrationModal.css';

export default function IntegrationModal({ onClose }) {
    const [activeSource, setActiveSource] = useState('');
    const [shopifyUrl, setShopifyUrl] = useState('');
    const [shopifyPassword, setShopifyPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSourceClick = (source) => {
        setActiveSource(source);
        setStatusMessage('');
    };

    const handleShopifyConnect = async () => {
        setStatusMessage('Connecting to Shopify...');
        try {
            const response = await fetch('/api/shopify-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeUrl: shopifyUrl,
                    apiPassword: shopifyPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to connect to Shopify');
            }

            const data = await response.json();
            setStatusMessage('Successfully connected to Shopify!');
            console.log('Fetched data:', data);
        } catch (error) {
            setStatusMessage(`Failed to connect to Shopify: ${error.message}`);
        }
    };

    return (
        <div className="integration-modal">
            <div className="modal-content">
                <h2>Add New Source</h2>
                <div className="integration-buttons">
                    <button
                        className={activeSource === 'shopify' ? 'active' : ''}
                        onClick={() => handleSourceClick('shopify')}
                    >
                        Shopify
                    </button>
                    <button
                        className={activeSource === 'walmart' ? 'active' : ''}
                        onClick={() => handleSourceClick('walmart')}
                    >
                        Walmart
                    </button>
                </div>

                {activeSource === 'shopify' && (
                    <div className="shopify-form">
                        <h3>Shopify Integration</h3>
                        <input
                            type="text"
                            placeholder="Store URL (e.g., example.myshopify.com)"
                            value={shopifyUrl}
                            onChange={(e) => setShopifyUrl(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Your Shopify API Password"
                            value={shopifyPassword}
                            onChange={(e) => setShopifyPassword(e.target.value)}
                        />
                        <button onClick={handleShopifyConnect}>Connect</button>
                        {statusMessage && <p>{statusMessage}</p>}
                    </div>
                )}

                <button className="close-modal" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}