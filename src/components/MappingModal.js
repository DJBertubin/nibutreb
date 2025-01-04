import React, { useState } from 'react';

const MappingModal = ({ products, marketplaceAttributes, onClose, onSave }) => {
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
                        <div className="product-dropdown open">
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
                    )}
                </div>
                <h4 className="section-title">Mapping Attributes</h4>
                {marketplaceAttributes.map((attribute) => (
                    <div className="attribute-item" key={attribute.name}>
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
                            <option value="ignore">Ignore</option>
                            <option value="mapToField">Map to Field</option>
                            <option value="setFreeText">Set Free Text</option>
                            <option value="advancedRule">Advanced Rule</option>
                        </select>
                    </div>
                ))}
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