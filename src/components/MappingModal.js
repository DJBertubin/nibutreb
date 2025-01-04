import React, { useState } from 'react';
import './MappingModal.css';

const MappingModal = ({ products, onClose, onSave }) => {
    const [mapping, setMapping] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleMappingChange = (attributeName, value) => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: value,
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
        { name: 'SKU', required: true, description: 'Alphanumeric, 50 characters max' },
        { name: 'Product ID Type', required: true, description: 'Closed list - UPC, GTIN, etc.' },
        { name: 'Product ID (UPC)', required: true, description: '14-character numeric value' },
        { name: 'Product Name', required: true, description: 'Max length: 199 characters' },
        { name: 'Brand Name', required: true, description: 'Max length: 60 characters' },
        { name: 'Color', required: false, description: 'Max length: 600 characters' },
        { name: 'Color Category', required: false, description: 'Closed list: Color categories' },
    ];

    const fieldOptions = [
        'SKU',
        'UPC',
        'Title',
        'Brand',
        'COLOR',
        'CASE COLOR',
        'Ignore',
        'Set Free Text',
    ];

    return (
        <div className="mapping-popup">
            <div className="popup-header">
                <h4>Map Fields to Walmart Attributes</h4>
                <button className="btn-close-mapping" onClick={onClose}>
                    Close
                </button>
            </div>
            <div className="popup-content">
                <div className="product-dropdown-wrapper">
                    <div
                        className="product-dropdown-header"
                        onClick={() => setShowDropdown((prev) => !prev)}
                    >
                        <span>Select Products</span>
                        <span>{showDropdown ? '▲' : '▼'}</span>
                    </div>
                    {showDropdown && (
                        <div className="product-dropdown open scrollable-dropdown">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedProducts.length === products.length
                                    }
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedProducts(products.map((p) => p.id));
                                        } else {
                                            setSelectedProducts([]);
                                        }
                                    }}
                                />
                                Select All
                            </label>
                            <div className="scrollable-product-list">
                                {products.map((product) => (
                                    <div className="product-item" key={product.id}>
                                        <label className="product-checkbox-label">
                                            <input
                                                className="product-checkbox"
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
                    )}
                </div>

                <h4 className="section-title">Mapping Attributes</h4>
                <div className="attribute-list scrollable-attributes">
                    {walmartAttributes.map((attribute) => (
                        <div className="attribute-item horizontal-line" key={attribute.name}>
                            <label className="attribute-name">
                                {attribute.name}{' '}
                                {attribute.required && (
                                    <span className="required-badge">(Required)</span>
                                )}
                            </label>
                            <select
                                className="mapping-select"
                                value={mapping[attribute.name] || ''}
                                onChange={(e) =>
                                    handleMappingChange(attribute.name, e.target.value)
                                }
                            >
                                <option value="">Select Option</option>
                                {fieldOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            {mapping[attribute.name] === 'Set Free Text' && (
                                <input
                                    type="text"
                                    placeholder={`Enter static value for ${attribute.name}`}
                                    className="free-text-input"
                                    onChange={(e) =>
                                        handleMappingChange(attribute.name, e.target.value)
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="button-group">
                <button className="btn-save-mapping" onClick={handleSave}>
                    Save Mapping
                </button>
                <button className="btn-close-mapping" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default MappingModal;