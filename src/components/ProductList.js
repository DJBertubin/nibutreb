import React, { useState } from 'react';
import './ProductList.css';

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [statuses, setStatuses] = useState({});
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState('');
    const [mappingFields, setMappingFields] = useState({});

    const requiredAttributes = [
        { name: "SKU", required: true },
        { name: "Product ID Type", required: true },
        { name: "Product ID (GTIN/UPC)", required: true },
        { name: "Product Name", required: true },
        { name: "Brand", required: true },
        { name: "Short Description", required: false },
        { name: "Main Image URL", required: true },
    ];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    // Pagination change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Export function for sending data to Walmart
    const handleExport = async (productId, product) => {
        const itemData = {
            sku: product.sku,
            title: product.title,
            productId: mappingFields.productId || "123456789012",
            productIdType: mappingFields.productIdType || "GTIN",
            shortDescription: mappingFields.shortDescription || "Default description",
            brand: mappingFields.brand || "Default Brand",
            mainImageUrl: product.image || 'https://via.placeholder.com/150',
            price: {
                currency: "USD",
                amount: parseFloat(product.price) || 0.0,
            },
            condition: "New",
            shippingWeight: {
                value: 1.0,
                unit: "LB",
            },
            inventory: {
                quantity: product.inventory || 0,
                fulfillmentLagTime: 2,
            },
        };

        try {
            setStatuses((prev) => ({ ...prev, [productId]: 'Exporting...' }));

            const response = await fetch('/api/walmart/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: [itemData] }),
            });

            const result = await response.json();

            if (result.success) {
                setStatuses((prev) => ({
                    ...prev,
                    [productId]: 'Success: Items successfully sent to Walmart',
                }));
            } else {
                setStatuses((prev) => ({
                    ...prev,
                    [productId]: `Failed: ${result.message}`,
                }));
            }
        } catch (error) {
            setStatuses((prev) => ({
                ...prev,
                [productId]: `Error: ${error.message}`,
            }));
        }
    };

    // Handle mapping selection in modal
    const handleMappingSelection = (e, attributeName) => {
        setSelectedAttribute(attributeName);
        setMappingFields((prev) => ({
            ...prev,
            [attributeName]: e.target.value,
        }));
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            <button
                className="btn-map-values"
                onClick={() => setShowMappingModal(true)}
            >
                Map Values
            </button>

            {/* Mapping Modal */}
            {showMappingModal && (
                <div className="mapping-popup">
                    <div className="popup-content">
                        <h4>Map Fields to Walmart Attributes</h4>
                        {requiredAttributes.map((attr) => (
                            <div className="attribute-item" key={attr.name}>
                                <label>
                                    {attr.name} {attr.required && <span className="required-badge">*</span>}
                                </label>
                                <select
                                    className="mapping-select"
                                    value={mappingFields[attr.name] || ""}
                                    onChange={(e) => handleMappingSelection(e, attr.name)}
                                >
                                    <option value="">-- Select Option --</option>
                                    <option value="IGNORE">Ignore</option>
                                    <option value="FIELD">Map to Field</option>
                                    <option value="TEXT">Set Free Text</option>
                                    <option value="ADVANCED">Advanced Rule</option>
                                </select>
                                {selectedAttribute === attr.name && mappingFields[attr.name] === "TEXT" && (
                                    <input
                                        type="text"
                                        placeholder={`Enter static value for ${attr.name}`}
                                        onChange={(e) => handleMappingSelection(e, attr.name)}
                                    />
                                )}
                            </div>
                        ))}
                        <div className="button-group">
                            <button
                                className="btn-save-mapping"
                                onClick={() => setShowMappingModal(false)}
                            >
                                Save & Close
                            </button>
                            <button
                                className="btn-close-mapping"
                                onClick={() => setShowMappingModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <table className="modern-table">
                <thead>
                    <tr>
                        <th>Actions</th>
                        <th>Status</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Inventory</th>
                        <th>Created Date</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        currentProducts.map((product) => (
                            <tr key={product.id} className="product-row">
                                <td className="actions-column">
                                    <div className="button-group">
                                        <button
                                            className="btn-export"
                                            onClick={() => handleExport(product.id, product)}
                                        >
                                            Export
                                        </button>
                                        <button className="btn-edit">Edit</button>
                                    </div>
                                </td>
                                <td className="status-column">
                                    <div
                                        className="full-status-tooltip"
                                        data-status={statuses[product.id] || 'No status'}
                                    >
                                        {statuses[product.id]?.length > 50
                                            ? `${statuses[product.id].substring(0, 50)}...`
                                            : statuses[product.id] || 'No status'}
                                    </div>
                                </td>
                                <td className="product-details">
                                    <img
                                        src={product.image || 'https://via.placeholder.com/50'}
                                        alt={product.title || 'Product'}
                                        className="product-image"
                                    />
                                    <div className="product-info">
                                        <strong className="product-title">
                                            {product.title || 'N/A'}
                                        </strong>
                                        <div className="sku">SKU: {product.sku || 'N/A'}</div>
                                    </div>
                                </td>
                                <td className="category-column">
                                    <strong>{product.sourceCategory || 'N/A'}</strong>
                                </td>
                                <td>${product.price || 'N/A'}</td>
                                <td>{product.inventory || 'N/A'}</td>
                                <td>{new Date(product.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>
                                No products fetched yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {products.length > 0 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;