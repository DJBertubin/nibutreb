import React, { useState } from 'react';

const MappingModal = ({ productData, marketplaceAttributes, onClose, onSave }) => {
    const [mapping, setMapping] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleMappingChange = (attributeName, option, value) => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: { option, value },
        }));
    };

    const handleProductSelect = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAllProducts = (e) => {
        if (e.target.checked) {
            setSelectedProducts(productData.map((product) => product.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSave = () => {
        const filteredProducts = productData.filter((product) => selectedProducts.includes(product.id));
        onSave(mapping, filteredProducts);
        onClose();
    };

    return (
        <div className="mapping-popup">
            <div className="popup-header">
                <span className="popup-title">Map Product Attributes</span>
                <button className="btn-close-mapping" onClick={onClose}>
                    Close
                </button>
            </div>

            <div className="popup-content">
                <h4>Select Products to Update</h4>
                <div className="product-dropdown">
                    <label>
                        <input
                            type="checkbox"
                            onChange={handleSelectAllProducts}
                            checked={selectedProducts.length === productData.length}
                        />
                        Select All
                    </label>
                    <div className="dropdown-wrapper">
                        <select multiple className="product-multi-select">
                            {productData.map((product) => (
                                <option key={product.id}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => handleProductSelect(product.id)}
                                        />
                                        {product.title}
                                    </label>
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <h4>Map Attributes</h4>
                {marketplaceAttributes.map((attribute) => (
                    <div className="attribute-item" key={attribute.name}>
                        <label className="attribute-name">
                            {attribute.name} {attribute.required && <span className="required-badge">(Required)</span>}
                        </label>
                        <div className="mapping-select">
                            <select
                                className="dropdown"
                                value={mapping[attribute.name]?.option || ''}
                                onChange={(e) => handleMappingChange(attribute.name, e.target.value, '')}
                            >
                                <option value="">Select Option</option>
                                <option value="ignore">Ignore</option>
                                <option value="mapToField">Map to Field</option>
                                <option value="setFreeText">Set Free Text</option>
                                <option value="advancedRule">Advanced Rule</option>
                            </select>
                            {mapping[attribute.name]?.option === 'mapToField' && (
                                <select
                                    className="field-select"
                                    onChange={(e) =>
                                        handleMappingChange(attribute.name, 'mapToField', e.target.value)
                                    }
                                >
                                    <option value="">Select Field</option>
                                    {Object.keys(productData[0] || {}).map((field) => (
                                        <option key={field} value={field}>
                                            {field}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {mapping[attribute.name]?.option === 'setFreeText' && (
                                <input
                                    type="text"
                                    className="free-text-input"
                                    placeholder="Enter value"
                                    onChange={(e) =>
                                        handleMappingChange(attribute.name, 'setFreeText', e.target.value)
                                    }
                                />
                            )}
                        </div>
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