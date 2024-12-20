import React, { useState, useEffect } from 'react';
import './MarketplaceDropdowns.css';

const MarketplaceDropdowns = ({ onAddNewSource, storeName }) => {
    const [selectedStore, setSelectedStore] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState([]);

    useEffect(() => {
        // Add storeName to the dropdown options and select it
        if (storeName) {
            setDropdownOptions((prevOptions) => {
                if (!prevOptions.includes(storeName)) {
                    return [storeName];
                }
                return prevOptions;
            });
            setSelectedStore(storeName);
        }
    }, [storeName]);

    const handleDropdownChange = (event) => {
        const selectedValue = event.target.value;
        if (selectedValue !== 'AddNew') {
            setSelectedStore(selectedValue);
        }

        if (selectedValue === 'AddNew') {
            onAddNewSource('source');
        }
    };

    return (
        <div className="marketplace-dropdowns">
            <div className="dropdown">
                <label htmlFor="import-source">
                    <i className="fas fa-download"></i> Import From
                </label>
                <select
                    id="import-source"
                    value={selectedStore}
                    onChange={handleDropdownChange}
                    className="store-name-dropdown"
                >
                    {dropdownOptions.length > 0 ? (
                        dropdownOptions.map((store, index) => (
                            <option key={index} value={store}>
                                {store}
                            </option>
                        ))
                    ) : (
                        <option value="">Select Source</option>
                    )}
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