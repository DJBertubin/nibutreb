import React from 'react';
import './MarketplaceDropdowns.css';

const MarketplaceDropdowns = ({ onAddNewSource }) => {
  const handleDropdownChange = (event) => {
    if (event.target.value === 'AddNew') {
      onAddNewSource('source');
    }
  };

  return (
    <div className="marketplace-dropdowns">
      <div className="dropdown">
        <label htmlFor="import-source">
          <i className="fas fa-download"></i> Import From
        </label>
        <select id="import-source" onChange={handleDropdownChange}>
          <option value="">Select Source</option>
          <option value="Walmart">Walmart</option>
          <option value="Shopify">Shopify</option>
          <option value="AddNew">Add New Source</option>
        </select>
      </div>
      <div className="dropdown">
        <label htmlFor="export-target">
          <i className="fas fa-upload"></i> Export To
        </label>
        <select id="export-target">
          <option value="">Select Target</option>
          <option value="Walmart">Walmart</option>
          <option value="Shopify">Shopify</option>
          <option value="AddNew">Add New Target</option>
        </select>
      </div>
    </div>
  );
};

export default MarketplaceDropdowns;