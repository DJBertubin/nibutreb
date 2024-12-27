import React, { useState, useEffect } from 'react';
import './MarketplaceDropdowns.css';

const MarketplaceDropdowns = ({ onAddNewSource, storeList, defaultSelectedStore }) => {
    const [selectedStore, setSelectedStore] = useState(defaultSelectedStore || '');

    useEffect(() => {
        // Update the selected store when defaultSelectedStore changes
        if (defaultSelectedStore) {
            setSelectedStore(defaultSelectedStore);
        }
    }, [defaultSelectedStore]);

    const handleDropdownChange = (event) => {
        const selectedValue = event.target.value;
        if (selectedValue === 'AddNew') {
            onAddNewSource();
        } else {
            setSelectedStore(selectedValue);
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