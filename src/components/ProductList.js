import React, { useState } from 'react';
import './ProductList.css';

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [exportStatusMap, setExportStatusMap] = useState({}); // Status for each product row

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Helper function to get the correct image URL
    const getImageUrl = (product) => {
        return product.image || 'https://via.placeholder.com/50';
    };

    // **Handle Export for a single product**
    const handleExport = async (product) => {
        setExportStatusMap((prev) => ({ ...prev, [product.id]: 'Exporting...' }));

        try {
            const response = await fetch('/api/walmart/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemData: [product] }), // Sending a single product
            });

            let result;
            try {
                result = await response.json();
            } catch (error) {
                console.error('Non-JSON response:', error);
                setExportStatusMap((prev) => ({
                    ...prev,
                    [product.id]: 'Failed: Received invalid response from Walmart API.',
                }));
                return;
            }

            if (response.ok) {
                setExportStatusMap((prev) => ({
                    ...prev,
                    [product.id]: `Success: ${result.message}. Feed ID: ${result.feedId}`,
                }));
            } else {
                setExportStatusMap((prev) => ({
                    ...prev,
                    [product.id]: `Failed: ${result.error}`,
                }));
            }
        } catch (error) {
            console.error('Error sending to Walmart:', error);
            setExportStatusMap((prev) => ({
                ...prev,
                [product.id]: 'An error occurred during export. Please try again.',
            }));
        }
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
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
                        currentProducts.map((product) => {
                            const imageUrl = getImageUrl(product);

                            return (
                                <tr key={product.id} className="product-row">
                                    <td className="actions-column">
                                        <div className="button-group">
                                            <button
                                                className="btn-export"
                                                onClick={() => handleExport(product)}
                                            >
                                                Export
                                            </button>
                                            <button className="btn-edit">Edit</button>
                                        </div>
                                    </td>
                                    <td className="status-column">
                                        {exportStatusMap[product.id] || 'Not Exported'}
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
                            <td colSpan="7" style={{ textAlign: 'center' }}>
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
        </div>
    );
};

export default ProductList;