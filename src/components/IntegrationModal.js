import React, { useState } from 'react';
import './IntegrationModal.css';

const IntegrationModal = ({ onClose }) => {
    const [activeSource, setActiveSource] = useState(null);
    const [storeUrl, setStoreUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiPassword, setApiPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSourceClick = (source) => {
        setActiveSource(source);
        setStatusMessage('');
    };

    const handleShopifyConnect = async () => {
        setStatusMessage('Connecting to Shopify...');
        try {
            const response = await fetch('https://{storeUrl}/admin/api/2024-01/products.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeUrl,
                    apiKey,
                    apiPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to connect to Shopify');
            }

            const data = await response.json();
            setStatusMessage('Shopify data fetched successfully.');
            console.log(data.products);
        } catch (error) {
            setStatusMessage(`Failed to connect to Shopify: ${error.message}`);
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
                    <button
                        className={`source-button ${activeSource === 'walmart' ? 'active' : ''}`}
                        onClick={() => handleSourceClick('walmart')}
                    >
                        Walmart
                    </button>
                </div>

                {activeSource === 'shopify' && (
                    <div className="shopify-integration">
                        <h3>Shopify Integration</h3>
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
                            API Key:
                            <input
                                type="text"
                                placeholder="Your Shopify API Key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                        </label>
                        <label>
                            API Password:
                            <input
                                type="password"
                                placeholder="Your Shopify API Password"
                                value={apiPassword}
                                onChange={(e) => setApiPassword(e.target.value)}
                            />
                        </label>
                        <button className="connect-button" onClick={handleShopifyConnect}>Connect</button>
                        <p>{statusMessage}</p>
                    </div>
                )}

                {activeSource === 'walmart' && (
                    <div className="walmart-integration">
                        <h3>Walmart Integration</h3>
                        <p>Walmart integration form goes here.</p>
                    </div>
                )}

                <button className="close-modal" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default IntegrationModal;
