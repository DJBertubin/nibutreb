import React, { useState, useEffect } from 'react';
import './MarketplaceDropdowns.css';

const MarketplaceDropdowns = ({ onAddNewSource, storeName }) => {
    const [selectedStore, setSelectedStore] = useState('');

    useEffect(() => {
        if (storeName) {
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
                    {storeName ? (
                        <>
                            <option value={storeName}>{storeName}</option>
                            <option value="AddNew">Add New Source</option>
                        </>
                    ) : (
                        <>
                            <option value="">Select Source</option>
                            <option value="AddNew">Add New Source</option>
                        </>
                    )}
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