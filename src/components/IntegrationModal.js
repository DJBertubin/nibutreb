import React, { useState } from 'react';
import './IntegrationModal.css';

const IntegrationModal = ({ onClose }) => {
    const [activeSource, setActiveSource] = useState(null);
    const [storeUrl, setStoreUrl] = useState('');
    const [storefrontAccessToken, setStorefrontAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSourceClick = (source) => {
        setActiveSource(source);
        setStatusMessage('');
    };

    const handleShopifyConnect = async () => {
        setStatusMessage('Connecting to Shopify...');
        try {
            const apiUrl = `https://${storeUrl}/api/2024-01/graphql.json`; // Shopify Storefront API endpoint
            const query = `{
                products(first: 10) {
                    edges {
                        node {
                            id
                            title
                            descriptionHtml
                            variants(first: 5) {
                                edges {
                                    node {
                                        id
                                        title
                                        price
                                    }
                                }
                            }
                        }
                    }
                }
            }`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
                },
                body: JSON.stringify({ query }),
            });

            // Check for non-200 responses
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Shopify Response Error:', errorText);
                throw new Error(`Request failed: ${response.status} - ${response.statusText}`);
            }

            // Parse the JSON response
            const data = await response.json();

            // Log the entire response for debugging
            console.log('Shopify Full Response:', data);

            // Validate the response structure
            if (!data || !data.data) {
                throw new Error('No data field in Shopify response.');
            }

            if (!data.data.products) {
                throw new Error('No products field in Shopify response.');
            }

            if (!Array.isArray(data.data.products.edges)) {
                throw new Error('Invalid structure: products.edges is not an array.');
            }

            // Success
            setStatusMessage('Shopify data fetched successfully.');
            console.log('Fetched Products:', data.data.products.edges);
        } catch (error) {
            console.error('Error Connecting to Shopify:', error);
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
                            Storefront Access Token:
                            <input
                                type="password"
                                placeholder="Your Storefront Access Token"
                                value={storefrontAccessToken}
                                onChange={(e) => setStorefrontAccessToken(e.target.value)}
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
