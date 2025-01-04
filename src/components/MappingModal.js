import React, { useState } from 'react';

const MappingModal = ({ productData, marketplaceAttributes, products, onClose, onSave }) => {
    const [mapping, setMapping] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(products.length ? products[0].id : '');

    const handleProductSelect = (event) => {
        setSelectedProduct(event.target.value);
    };

    const handleMappingChange = (attributeName, option, value = '') => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: { option, value },
        }));
    };

    const handleSave = () => {
        if (!selectedProduct) {
            alert('Please select a product.');
            return;
        }
        if (Object.keys(mapping).length === 0) {
            alert('Please map at least one attribute.');
            return;
        }
        const selectedProductData = products.find((p) => p.id === selectedProduct);
        onSave({ mapping, selectedProductData });
        onClose();
    };

    return (
        <div className="mapping-popup">
            <div className="popup-header">
                <h4>Map Product Attributes</h4>
                <button onClick={onClose} className="btn-close-mapping">Close</button>
            </div>
            <div className="popup-content">
                <div className="product-dropdown">
                    <label>Select Product</label>
                    <select value={selectedProduct} onChange={handleProductSelect} className="dropdown">
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.title}
                            </option>
                        ))}
                    </select>
                </div>

                <h5 className="section-title">Attribute Mapping</h5>
                {marketplaceAttributes.map((attribute) => (
                    <div className="attribute-item" key={attribute.name}>
                        <span className="attribute-name">
                            {attribute.name} {attribute.required && <span className="required-badge">(Required)</span>}
                        </span>
                        <select
                            className="mapping-select"
                            value={mapping[attribute.name]?.option || ''}
                            onChange={(e) =>
                                handleMappingChange(attribute.name, e.target.value)
                            }
                        >
                            <option value="">Select Option</option>
                            <option value="ignore">Ignore</option>
                            <option value="mapToField">Map to Field</option>
                            <option value="setFreeText">Set Free Text</option>
                        </select>
                        {mapping[attribute.name]?.option === 'mapToField' && (
                            <select
                                className="field-select"
                                value={mapping[attribute.name]?.value || ''}
                                onChange={(e) => handleMappingChange(attribute.name, 'mapToField', e.target.value)}
                            >
                                <option value="">Select Product Field</option>
                                {Object.keys(productData).map((key) => (
                                    <option key={key} value={productData[key]}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                        )}
                        {mapping[attribute.name]?.option === 'setFreeText' && (
                            <input
                                type="text"
                                className="free-text-input"
                                placeholder={`Enter value for ${attribute.name}`}
                                value={mapping[attribute.name]?.value || ''}
                                onChange={(e) => handleMappingChange(attribute.name, 'setFreeText', e.target.value)}
                            />
                        )}
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