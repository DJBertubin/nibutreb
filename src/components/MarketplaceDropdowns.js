// File: src/components/MarketplaceDropdowns.js

import React from 'react';
import './MarketplaceDropdowns.css';

const MarketplaceDropdowns = ({ onAddNewSource, storeList, onStoreSelect }) => {
    const handleDropdownChange = (event) => {
        const selectedValue = event.target.value;
        if (selectedValue === 'AddNew') {
            onAddNewSource('source');
        } else {
            onStoreSelect(selectedValue); // Notify parent of selected store
        }
    };

    return (
        <div className="marketplace-dropdowns">
            <div className="dropdown">
                <label htmlFor="import-source">
                    <i className="fas fa-download"></i> Import From
                </label>
                <select id="import-source" onChange={handleDropdownChange} className="store-name-dropdown">
                    <option value="">Select Source</option>
                    {storeList.map((store, index) => (
                        <option key={index} value={store}>
                            {store}
                        </option>
                    ))}
                    <option value="AddNew">Add New Source</option>
                </select>
            </div>
            <div className="dropdown">
                <label htmlFor="export-target">
                    <i className="fas fa-upload"></i> Export To
                </label>
                <select id="export-target">
                    <option value="">Select Target</option>
                    <option value="AddNew">Add New Target</option>
                </select>
            </div>
        </div>
    );
};

export default MarketplaceDropdowns;
