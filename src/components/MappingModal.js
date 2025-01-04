import React, { useState, useEffect } from 'react';
import './MappingModal.css';

const MappingModal = ({ products, onClose, onSave }) => {
    const [mapping, setMapping] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Pre-fill mapping if the product already has mapping data
    useEffect(() => {
        if (products.length > 0 && products[0]?.mapping) {
            setMapping(products[0].mapping); // Pre-fill the existing mapping for single product
        } else {
            setMapping({});
        }
        setSelectedProducts(products.map((p) => p.id)); // Automatically select the current product
    }, [products]);

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

    const handleProductSelect = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
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
            sanitizedMappings[attribute.name] = field?.type === 'Ignore' ? '' : field?.value || '';
        });

        const payload = {
            mappings: sanitizedMappings,
            selectedProducts,
        };

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

    const fieldOptions = [
        { label: 'Ignore', value: 'Ignore' },
        { label: 'Map to Field', value: 'Map to Field' },
        { label: 'Set Free Text', value: 'Set Free Text' },
        { label: 'Advanced Rule', value: 'Advanced Rule' },
    ];

    const shopifyAttributes = [
        'id',
        'title',
        'body_html',
        'vendor',
        'product_type',
        'tags',
        'status',
        'created_at',
        'updated_at',
        'published_at',
        'variants[].title',
        'variants[].sku',
        'variants[].price',
        'variants[].inventory_quantity',
        'variants[].weight',
        'variants[].weight_unit',
        'variants[].barcode',
        'variants[].grams',
        'images[].src',
        'options[].name',
    ];

    const filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="mapping-popup">
            <div className="popup-content">
                <div className="popup-header">
                    <h4>Map Fields to Walmart Attributes</h4>
                </div>

                {/* Product Selection */}
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
                                        onChange={() => handleProductSelect(product.id)}
                                    />
                                    {product.title}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attribute Mapping */}
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
                                {fieldOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                        disabled={attribute.required && option.value === 'Ignore'}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Input field */}
                            {mapping[attribute.name]?.type === 'Map to Field' ? (
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
                            ) : (
                                <input
                                    type="text"
                                    className="free-text-input"
                                    placeholder={
                                        mapping[attribute.name]?.type === 'Set Free Text'
                                            ? 'Enter static value'
                                            : 'Enter advanced rule or leave blank'
                                    }
                                    value={mapping[attribute.name]?.value || ''}
                                    disabled={mapping[attribute.name]?.type === 'Ignore'}
                                    onChange={(e) => handleValueChange(attribute.name, e.target.value)}
                                    style={
                                        mapping[attribute.name]?.type === 'Ignore'
                                            ? { backgroundColor: '#e9e9e9', cursor: 'not-allowed' }
                                            : {}
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error Message */}
                {errorMessage && <p className="error-message">{errorMessage}</p>}

                {/* Save and Cancel Buttons */}
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