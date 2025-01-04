import React, { useState } from 'react';
import './MappingModal.css';

const MappingModal = ({ products, onClose, onSave, sourceAttributes }) => {
    const [mapping, setMapping] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleMappingChange = (attributeName, type) => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: {
                ...prev[attributeName],
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
        onSave({ mapping, selectedProducts });
        onClose();
    };

    // Walmart attributes based on MP_ITEM_SPEC_4.8
    const walmartAttributes = [
        { name: 'SKU', required: true },
        { name: 'Product ID Type', required: true },
        { name: 'Product ID (UPC)', required: true },
        { name: 'Product Name', required: true },
        { name: 'Brand Name', required: true },
        { name: 'Color', required: false },
        { name: 'Color Category', required: false },
    ];

    const fieldOptions = ['Ignore', 'Map to Field', 'Set Free Text', 'Advanced Rule'];

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
                                {attribute.name} {attribute.required && <span className="required-badge">(Required)</span>}
                            </label>
                            <select
                                className="mapping-select"
                                value={mapping[attribute.name]?.type || ''}
                                onChange={(e) => handleMappingChange(attribute.name, e.target.value)}
                            >
                                <option value="">Select Option</option>
                                {fieldOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            {mapping[attribute.name]?.type === 'Ignore' && (
                                <input
                                    type="text"
                                    disabled
                                    value="N/A"
                                    className="free-text-input"
                                    style={{ backgroundColor: '#e9e9e9', cursor: 'not-allowed' }}
                                />
                            )}
                            {mapping[attribute.name]?.type === 'Map to Field' && (
                                <select
                                    className="free-text-input"
                                    onChange={(e) => handleValueChange(attribute.name, e.target.value)}
                                >
                                    <option value="">Select Source Attribute</option>
                                    {sourceAttributes.map((attr) => (
                                        <option key={attr} value={attr}>
                                            {attr}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {(mapping[attribute.name]?.type === 'Set Free Text' ||
                                mapping[attribute.name]?.type === 'Advanced Rule') && (
                                <input
                                    type="text"
                                    placeholder="Enter value or formula"
                                    className="free-text-input"
                                    value={mapping[attribute.name]?.value || ''}
                                    onChange={(e) => handleValueChange(attribute.name, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>

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