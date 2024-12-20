import React, { useState, useEffect } from 'react';
import './MarketplaceDropdowns.css';

const MarketplaceDropdowns = ({ onAddNewSource, storeName }) => {
    const [selectedStore, setSelectedStore] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState(['AddNew']);

    useEffect(() => {
        if (storeName) {
            setDropdownOptions((prevOptions) => {
                const updatedOptions = prevOptions.filter((option) => option !== 'AddNew');
                return [storeName, ...updatedOptions, 'AddNew'];
            });
            setSelectedStore(storeName);
        }
    }, [storeName]);

    const handleDropdownChange = (event) => {
        const selectedValue = event.target.value;
        if (selectedValue === 'AddNew') {
            onAddNewSource('source');
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
                    {dropdownOptions.map((option, index) => (
                        <option key={index} value={option}>
                            {option === 'AddNew' ? 'Add New Source' : option}
                        </option>
                    ))}
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