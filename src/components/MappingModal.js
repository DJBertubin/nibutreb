import React, { useState } from 'react';
import './MappingModal.css';

const MappingModalPage = ({ products, onClose, onSave }) => {
    const [mapping, setMapping] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(''); // Single product selection

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
        'Ignore - The field will not be added to the feed.',
        'Map to field - Set a product data field from "edit product".',
        'Set free text - Set free text/number static value.',
        'Advanced rule - Advanced filters and rules like lookup, combine, etc. to map data.',
    ];

    const handleMappingChange = (attributeName, value) => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: value,
        }));
    };

    const handleProductSelection = (e) => {
        setSelectedProduct(e.target.value);
    };

    const handleSave = () => {
        if (!selectedProduct) {
            alert('Please select a product.');
            return;
        }
        onSave({ mapping, selectedProduct });
        onClose();
    };

    return (
        <div className="mapping-popup">
            <div className="popup-header">
                <h4>Map Fields to Walmart Attributes</h4>
                <button className="btn-close-mapping" onClick={onClose}>
                    ✖
                </button>
            </div>
            <div className="popup-content">
                <div className="product-selection">
                    <label htmlFor="product-select">Select a Product</label>
                    <select
                        id="product-select"
                        className="mapping-select"
                        value={selectedProduct}
                        onChange={handleProductSelection}
                    >
                        <option value="">-- Select Product --</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.title}
                            </option>
                        ))}
                    </select>
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
                            {mapping[attribute.name] === 'Set free text - Set free text/number static value.' && (
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

export default MappingModalPage;