import React, { useState } from 'react';

const MappingModal = ({ productData, marketplaceAttributes, onClose, onSave }) => {
    const [mapping, setMapping] = useState({});

    const handleMappingChange = (attributeName, value) => {
        setMapping((prev) => ({
            ...prev,
            [attributeName]: value,
        }));
    };

    const handleSave = () => {
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
                        <div>
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
                        </div>
                    </div>
                ))}
            </div>
            <button className="btn-save-mapping" onClick={handleSave}>
                Save Mapping
            </button>
        </div>
    );
};

export default MappingModal;