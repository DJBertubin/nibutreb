import React, { useState } from 'react';
import './IntegrationModal.css';

const IntegrationModal = ({ onClose }) => {
    const [activeSource, setActiveSource] = useState(null);
    const [storeUrl, setStoreUrl] = useState('');
    const [storefrontAccessToken, setStorefrontAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [fetchedProducts, setFetchedProducts] = useState([]);

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
                            variants(first: 5) {
                                edges {
                                    node {
                                        id
                                        sku
                                        price {
                                            amount
                                            currencyCode
                                        }
                                        inventoryQuantity
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

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Shopify Response Error:', errorText);
                throw new Error(`Request failed: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();

            if (!data?.data?.products?.edges) {
                console.error('Full Shopify Response (debug):', data);
                throw new Error('Invalid response structure from Shopify.');
            }

            // Extract product data
            const products = data.data.products.edges.map(edge => {
                const variants = edge.node.variants.edges.map(variantEdge => variantEdge.node);
                return {
                    id: edge.node.id,
                    title: edge.node.title,
                    variants: variants,
                };
            });

            setFetchedProducts(products);

            // Success
            setStatusMessage('Shopify data fetched successfully.');
            console.log('Fetched Products:', products);

            // Automatically close modal
            onClose();
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

                {fetchedProducts.length > 0 && (
                    <div className="product-table">
                        <h3>Fetched Products</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Title</th>
                                    <th>Variant SKU</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchedProducts.map((product) => (
                                    product.variants.map((variant) => (
                                        <tr key={variant.id}>
                                            <td>{product.title}</td>
                                            <td>{variant.sku}</td>
                                            <td>{`${variant.price.amount} ${variant.price.currencyCode}`}</td>
                                            <td>{variant.inventoryQuantity || 'N/A'}</td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <button className="close-modal" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default IntegrationModal;
