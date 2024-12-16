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
            const apiUrl = `https://${storeUrl}/api/2024-01/graphql.json`;
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

            if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);

            const data = await response.json();

            if (!data?.data?.products?.edges) throw new Error('Invalid response structure from Shopify.');

            const products = data.data.products.edges.map(edge => ({
                title: edge.node.title,
                variants: edge.node.variants.edges.map(variantEdge => ({
                    id: variantEdge.node.id,
                    sku: variantEdge.node.sku,
                    price: variantEdge.node.price,
                    inventoryQuantity: variantEdge.node.inventoryQuantity || 'N/A',
                })),
            }));

            setFetchedProducts(products);
            setStatusMessage('Shopify data fetched successfully.');
        } catch (error) {
            console.error('Error:', error);
            setStatusMessage(`Failed to connect to Shopify: ${error.message}`);
        }
    };

    const exportToCSV = () => {
        const csvRows = [];
        csvRows.push(['Product Title', 'Variant SKU', 'Price', 'Quantity'].join(','));

        fetchedProducts.forEach((product) => {
            product.variants.forEach((variant) => {
                csvRows.push([
                    product.title,
                    variant.sku,
                    `${variant.price.amount} ${variant.price.currencyCode}`,
                    variant.inventoryQuantity,
                ].join(','));
            });
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.csv';
        a.click();
        URL.revokeObjectURL(url);
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
                        <button className="connect-button" onClick={handleShopifyConnect}>
                            Connect
                        </button>
                        <p>{statusMessage}</p>
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchedProducts.map((product) =>
                                    product.variants.map((variant) => (
                                        <tr key={variant.id}>
                                            <td>{product.title}</td>
                                            <td>{variant.sku}</td>
                                            <td>
                                                {variant.price.amount} {variant.price.currencyCode}
                                            </td>
                                            <td>{variant.inventoryQuantity}</td>
                                            <td>
                                                <button onClick={() => alert(`Editing ${variant.sku}`)}>
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <button className="export-button" onClick={exportToCSV}>
                            Export to CSV
                        </button>
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
