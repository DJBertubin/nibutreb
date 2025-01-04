import React, { useState } from 'react';
import './ProductList.css';
import MappingModal from './MappingModal'; // Import the MappingModal component

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showBulkMappingModal, setShowBulkMappingModal] = useState(false);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Open individual mapping modal
    const handleOpenMappingModal = (product) => {
        setSelectedProduct(product);
        setShowMappingModal(true);
    };

    const handleCloseMappingModal = () => {
        setSelectedProduct(null);
        setShowMappingModal(false);
    };

    // Open bulk mapping modal
    const handleOpenBulkMappingModal = () => {
        setShowBulkMappingModal(true);
    };

    const handleCloseBulkMappingModal = () => {
        setShowBulkMappingModal(false);
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            <div className="button-group-top">
                <button
                    className="btn-bulk-map"
                    onClick={handleOpenBulkMappingModal}
                >
                    Bulk Map
                </button>
            </div>

            {/* Bulk Mapping Modal */}
            {showBulkMappingModal && (
                <MappingModal
                    products={products}
                    onClose={handleCloseBulkMappingModal}
                    onSave={(mappingData) => {
                        console.log('Bulk Mapping Saved:', mappingData);
                        setShowBulkMappingModal(false);
                    }}
                />
            )}

            <table className="modern-table">
                <thead>
                    <tr>
                        <th>Actions</th>
                        <th>Status</th>
                        <th>Mapped</th>
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
                                        <button className="btn-export">
                                            Export
                                        </button>
                                        <button
                                            className="btn-map"
                                            onClick={() => handleOpenMappingModal(product)}
                                        >
                                            Map
                                        </button>
                                    </div>
                                </td>
                                <td className="status-column">No Status</td>
                                <td className="mapped-column">
                                    No {/* Will dynamically change when saved */}
                                </td>
                                <td className="product-details">
                                    <img
                                        src={product.image || 'https://via.placeholder.com/50'}
                                        alt={product.title || 'Product'}
                                        className="product-image"
                                    />
                                    <div className="product-info">
                                        <strong className="product-title">{product.title || 'N/A'}</strong>
                                        <div className="sku">SKU: {product.sku || 'N/A'}</div>
                                    </div>
                                </td>
                                <td className="category-column">{product.sourceCategory || 'N/A'}</td>
                                <td>${product.price || 'N/A'}</td>
                                <td>{product.inventory || 'N/A'}</td>
                                <td>{new Date(product.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center' }}>
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

            {/* Individual Mapping Modal */}
            {showMappingModal && (
                <MappingModal
                    products={[selectedProduct]}
                    onClose={handleCloseMappingModal}
                    onSave={(mappingData) => {
                        console.log('Individual Mapping Saved:', mappingData);
                        setShowMappingModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProductList;