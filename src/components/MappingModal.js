import React, { useState } from 'react';

const MappingModal = ({ productData, marketplaceAttributes, onClose, onSave }) => {
    const [mapping, setMapping] = useState({});
    const [freeTextInputs, setFreeTextInputs] = useState({});

    const handleMappingChange = (attributeName, value) => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: value,
        }));
    };

    const handleFreeTextChange = (attributeName, value) => {
        setFreeTextInputs((prev) => ({
            ...prev,
            [attributeName]: value,
        }));
        setMapping((prev) => ({
            ...prev,
            [attributeName]: value,
        }));
    };

    const handleSave = () => {
        if (Object.keys(mapping).length === 0) {
            alert('Please map at least one attribute.');
            return;
        }
        onSave(mapping);
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
                {marketplaceAttributes.map((attribute) => (
                    <div className="attribute-item" key={attribute.name}>
                        <div className="attribute-label">
                            <span className="attribute-name">
                                {attribute.name} {attribute.required && <span className="required-badge">(Required)</span>}
                            </span>
                            <div className="attribute-description">{attribute.description}</div>
                        </div>
                        <div className="attribute-dropdown">
                            <select
                                className="dropdown"
                                value={mapping[attribute.name] || ''}
                                onChange={(e) => handleMappingChange(attribute.name, e.target.value)}
                            >
                                <option value="">Select Option</option>
                                <option value="ignore">Ignore</option>
                                <option value="mapToField">Map to Field</option>
                                <option value="setFreeText">Set Free Text</option>
                                <option value="advancedRule">Advanced Rule</option>
                            </select>
                            {mapping[attribute.name] === 'setFreeText' && (
                                <input
                                    type="text"
                                    className="free-text-input"
                                    placeholder={`Enter value for ${attribute.name}`}
                                    value={freeTextInputs[attribute.name] || ''}
                                    onChange={(e) => handleFreeTextChange(attribute.name, e.target.value)}
                                />
                            )}
                            {mapping[attribute.name] === 'mapToField' && (
                                <select
                                    className="dropdown-field"
                                    onChange={(e) => handleMappingChange(attribute.name, e.target.value)}
                                >
                                    <option value="">Select Field</option>
                                    {Object.keys(productData).map((key) => (
                                        <option key={key} value={productData[key]}>
                                            {key}
                                        </option>
                                    ))}
                                </select>
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