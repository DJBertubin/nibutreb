// File: src/components/MarketplaceDropdowns.js

import React, { useState, useEffect } from 'react';
import './MarketplaceDropdowns.css';

const MarketplaceDropdowns = ({ storeName }) => {
    const [selectedStore, setSelectedStore] = useState(storeName || '');

    useEffect(() => {
        if (storeName) {
            setSelectedStore(storeName);
        }
    }, [storeName]);

    return (
        <div className="marketplace-dropdowns">
            <div className="dropdown">
                <label htmlFor="import-source">
                    <i className="fas fa-download"></i> Import From
                </label>
                <select
                    id="import-source"
                    value={selectedStore}
                    className="store-name-dropdown"
                    disabled
                >
                    {selectedStore && <option value={selectedStore}>{selectedStore}</option>}
                </select>
            </div>
        </div>
    );
};

export default MarketplaceDropdowns;
