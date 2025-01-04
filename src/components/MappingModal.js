import React, { useState, useEffect } from 'react';
import './MappingModal.css';

const MappingModal = ({ products, onClose, onSave }) => {
    const [mapping, setMapping] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [shopifyData, setShopifyData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Pre-fill mapping data and fetch Shopify data for attributes
    useEffect(() => {
        if (products.length > 0 && products[0]?.mapping) {
            const preFilledMapping = {};
            walmartAttributes.forEach((attribute) => {
                const attributeMapping = products[0].mapping[attribute.name] || {};
                preFilledMapping[attribute.name] = {
                    type: attributeMapping.type || 'Ignore',
                    value: attributeMapping.value || '',
                };
            });
            setMapping(preFilledMapping);
        } else {
            setMapping({});
        }
        setSelectedProducts(products.map((p) => p.id)); // Select all products by default
        fetchShopifyData(); // Fetch Shopify product data
    }, [products]);

    const fetchShopifyData = async () => {
        const clientId = localStorage.getItem('clientId');
        try {
            const response = await fetch(`/api/shopify/data?clientId=${clientId}`);
            const data = await response.json();
            if (response.ok) {
                const shopifyProducts = {};
                data.shopifyData.forEach((entry) => {
                    entry.shopifyData.products.forEach((product) => {
                        shopifyProducts[product.id] = product;
                    });
                });
                setShopifyData(shopifyProducts);
            } else {
                console.error('Error fetching Shopify data:', data.error);
            }
        } catch (error) {
            console.error('Error fetching Shopify data:', error);
        }
    };

    const handleMappingChange = (attributeName, type) => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: {
                type,
                value: type === 'Ignore' ? '' : prev[attributeName]?.value || '',
            },
        }));
    };

    const handleValueChange = (attributeName, value) => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: {
                ...prev[attributeName],
                value,
            },
        }));
    };

    const getShopifyAttributeValue = (productId, attribute) => {
        const product = shopifyData[productId];
        if (!product) return 'N/A';

        switch (attribute) {
            case 'variants[].sku':
                return product.variants[0]?.sku || 'N/A';
            case 'variants[].price':
                return product.variants[0]?.price || 'N/A';
            case 'title':
                return product.title || 'N/A';
            case 'vendor':
                return product.vendor || 'N/A';
            default:
                return 'N/A';
        }
    };

    const handleSave = () => {
        if (selectedProducts.length === 0) {
            setErrorMessage('Please select at least one product.');
            return;
        }

        setErrorMessage('');
        const sanitizedMappings = {};
        walmartAttributes.forEach((attribute) => {
            const field = mapping[attribute.name];
            sanitizedMappings[attribute.name] = {
                type: field?.type || 'Ignore',
                value: field?.type === 'Map to Field' ? getShopifyAttributeValue(selectedProducts[0], field.value) : field.value || '',
            };
        });

        const payload = {
            mappings: sanitizedMappings,
            selectedProducts,
        };

        console.log('Final Payload:', JSON.stringify(payload, null, 2)); // Debugging

        onSave(payload); // Send the mappings and selected product IDs to the parent component
        onClose();
    };

    const walmartAttributes = [
        { name: 'SKU', required: true },
        { name: 'Product ID Type', required: true },
        { name: 'Product ID (UPC)', required: true },
        { name: 'Product Name', required: true },
        { name: 'Brand Name', required: true },
        { name: 'Color', required: false },
        { name: 'Color Category', required: false },
    ];

    const shopifyAttributes = [
        'title',
        'vendor',
        'product_type',
        'variants[].sku',
        'variants[].price',
        'variants[].inventory_quantity',
        'body_html',
    ];

    const filteredProducts = products.filter((product) =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="mapping-popup">
            <div className="popup-content">
                <div className="popup-header">
                    <h4>Map Fields to Walmart Attributes</h4>
                </div>

                <div className="product-dropdown-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search Products"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="scrollable-product-list">
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedProducts.length === products.length}
                                onChange={(e) =>
                                    setSelectedProducts(
                                        e.target.checked ? products.map((p) => p.id) : []
                                    )
                                }
                            />
                            Select All
                        </label>
                        {filteredProducts.map((product) => (
                            <div className="product-item" key={product.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => setSelectedProducts((prev) =>
                                            prev.includes(product.id)
                                                ? prev.filter((id) => id !== product.id)
                                                : [...prev, product.id]
                                        )}
                                    />
                                    {product.title}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="attribute-list-container">
                    <h4 className="section-title">Mapping Attributes</h4>
                    {walmartAttributes.map((attribute) => (
                        <div className="attribute-item" key={attribute.name}>
                            <label className="attribute-name">
                                {attribute.name}{' '}
                                {attribute.required && <span className="required-badge">(Required)</span>}
                            </label>
                            <select
                                className="mapping-select"
                                value={mapping[attribute.name]?.type || 'Ignore'}
                                onChange={(e) => handleMappingChange(attribute.name, e.target.value)}
                            >
                                <option value="Ignore">Ignore</option>
                                <option value="Map to Field">Map to Field</option>
                                <option value="Set Free Text">Set Free Text</option>
                            </select>

                            {mapping[attribute.name]?.type === 'Map to Field' && (
                                <div>
                                    <select
                                        className="free-text-input"
                                        value={mapping[attribute.name]?.value || ''}
                                        onChange={(e) => handleValueChange(attribute.name, e.target.value)}
                                    >
                                        <option value="">Select Source Attribute</option>
                                        {shopifyAttributes.map((attr) => (
                                            <option key={attr} value={attr}>
                                                {attr}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="source-value">
                                        Source Value: {getShopifyAttributeValue(selectedProducts[0], mapping[attribute.name]?.value)}
                                    </p>
                                </div>
                            )}

                            {mapping[attribute.name]?.type === 'Set Free Text' && (
                                <input
                                    type="text"
                                    className="free-text-input"
                                    placeholder="Enter static value"
                                    value={mapping[attribute.name]?.value || ''}
                                    onChange={(e) => handleValueChange(attribute.name, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <div className="button-group">
                    <button className="btn-save-mapping" onClick={handleSave}>
                        Save Mapping
                    </button>
                    <button className="btn-close-mapping" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MappingModal;