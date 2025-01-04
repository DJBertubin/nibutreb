import React, { useState } from 'react';
import './ProductList.css';

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [exportStatus, setExportStatus] = useState(''); // To display the export status
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSelectProduct = (productId) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.includes(productId)
                ? prevSelected.filter((id) => id !== productId)
                : [...prevSelected, productId]
        );
    };

    // Handle export to Walmart
    const handleExport = async () => {
        if (selectedProducts.length === 0) {
            setExportStatus('Please select at least one product to export.');
            return;
        }

        try {
            setExportStatus('Exporting selected products...');

            // Prepare the selected products' data
            const itemData = products.filter((product) => selectedProducts.includes(product.id));

            const response = await fetch('/api/walmart/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemData }),
            });

            const result = await response.json();

            if (response.ok) {
                setExportStatus(`Success: ${result.message}. Feed ID: ${result.feedId}`);
            } else {
                setExportStatus(`Failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Error sending to Walmart:', error);
            setExportStatus('An error occurred while exporting. Please try again.');
        }
    };

    // Helper function to get the correct image URL
    const getImageUrl = (product) => {
        return product.image || 'https://via.placeholder.com/50'; // Default image if none provided
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            <table className="modern-table">
                <thead>
                    <tr>
                        <th>Select</th>
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
                        currentProducts.map((product) => {
                            const imageUrl = getImageUrl(product);

                            return (
                                <tr key={product.id} className="product-row">
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                        />
                                    </td>
                                    <td className="actions-column">
                                        <div className="button-group">
                                            <button className="btn-export" onClick={handleExport}>
                                                Export
                                            </button>
                                            <button className="btn-edit">Edit</button>
                                        </div>
                                    </td>
                                    <td className="status-column">
                                        {product.syncStatus?.toLowerCase() === 'synced' ? (
                                            <span className="status-synced">&#x2714; Synced</span>
                                        ) : (
                                            <span className="status-not-synced">&#x2716; Not Synced</span>
                                        )}
                                    </td>
                                    <td className="product-details">
                                        <img
                                            src={imageUrl}
                                            alt={product.title || 'Product'}
                                            className="product-image"
                                            onError={(e) => (e.target.src = 'https://via.placeholder.com/50')}
                                        />
                                        <div className="product-info">
                                            <strong className="product-title" title={product.title || 'N/A'}>
                                                {product.title?.length > 80
                                                    ? `${product.title.substring(0, 77)}...`
                                                    : product.title || 'N/A'}
                                            </strong>
                                            <div className="sku">SKU: {product.sku || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="category-column">
                                        <div className="source-category">
                                            <strong>Source:</strong> {product.sourceCategory || 'N/A'}
                                        </div>
                                        <div className="target-category">
                                            <strong>Target:</strong> {product.targetCategory || 'N/A'}
                                        </div>
                                    </td>
                                    <td>${product.price || 'N/A'}</td>
                                    <td>{product.inventory || 'N/A'}</td>
                                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center' }}>
                                No products fetched yet. Please fetch from Shopify.
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

            {/* Status section for displaying export feedback */}
            <div className="export-status">
                <strong>Status:</strong> {exportStatus || 'No actions performed yet.'}
            </div>
        </div>
    );
};

export default ProductList;