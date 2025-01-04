import React, { useState, useEffect } from 'react';
import './ProductList.css';
import MappingModal from './MappingModal'; // Import the MappingModal component

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showBulkMappingModal, setShowBulkMappingModal] = useState(false);
    const [mappedStatuses, setMappedStatuses] = useState({});
    const [bulkSelectedProducts, setBulkSelectedProducts] = useState([]);
    const [productMapping, setProductMapping] = useState(null); // Store current product mapping for individual mapping
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Open individual mapping modal
    const handleOpenMappingModal = async (product) => {
        try {
            const clientId = localStorage.getItem('clientId');
            const response = await fetch(`/api/mappings/get/${clientId}`);
            const data = await response.json();

            if (response.ok) {
                const existingMapping = data.mappings.find((map) => map.productId === product.id);
                setProductMapping(existingMapping?.mappings || {}); // Pre-fill the mapping data if available
            } else {
                console.error('Error fetching existing mapping:', data.error);
                setProductMapping({});
            }

            setSelectedProduct(product);
            setShowMappingModal(true);
        } catch (error) {
            console.error('Error fetching product mapping:', error);
        }
    };

    const handleCloseMappingModal = () => {
        setSelectedProduct(null);
        setShowMappingModal(false);
    };

    // Open bulk mapping modal
    const handleOpenBulkMappingModal = () => {
        setBulkSelectedProducts(products.map((p) => p.id)); // Select all products for bulk update
        setShowBulkMappingModal(true);
    };

    const handleCloseBulkMappingModal = () => {
        setBulkSelectedProducts([]);
        setShowBulkMappingModal(false);
    };

    // Fetch mapping statuses
    const fetchMappingStatuses = async () => {
        try {
            const clientId = localStorage.getItem('clientId');
            if (!clientId) {
                console.error('Client ID is missing. Please log in again.');
                return;
            }

            const response = await fetch(`/api/mappings/get/${clientId}`);
            const data = await response.json();
            if (response.ok) {
                const statuses = {};
                data.mappings.forEach((map) => {
                    statuses[map.productId] = Object.values(map.mappings).every(
                        (value) => value && value !== ''
                    )
                        ? 'Yes'
                        : 'No';
                });
                setMappedStatuses(statuses);
            } else {
                console.error('Error fetching mapping statuses:', data.error);
            }
        } catch (error) {
            console.error('Error fetching mapping statuses:', error);
        }
    };

    useEffect(() => {
        fetchMappingStatuses(); // Fetch mapping statuses when the component loads
    }, []);

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            <div className="button-group-top">
                <button className="btn-bulk-map" onClick={handleOpenBulkMappingModal}>
                    Bulk Map
                </button>
            </div>

            {/* Bulk Mapping Modal */}
            {showBulkMappingModal && (
                <MappingModal
                    products={products} // Pass the full product list for bulk selection
                    onClose={handleCloseBulkMappingModal}
                    onSave={async (mappingData) => {
                        try {
                            const clientId = localStorage.getItem('clientId');
                            const selectedProductIds = mappingData.selectedProducts;

                            const bulkPayload = selectedProductIds.map((productId) => ({
                                clientId,
                                productId,
                                mappings: mappingData.mappings,
                            }));

                            const response = await fetch('/api/mappings/save-bulk', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(bulkPayload),
                            });

                            const result = await response.json();
                            if (response.ok) {
                                console.log('Bulk Mapping Saved:', result.message);
                                fetchMappingStatuses(); // Refresh mapped statuses
                            } else {
                                console.error('Error saving bulk mapping:', result.error);
                            }
                        } catch (error) {
                            console.error('Error saving bulk mapping:', error);
                        }
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
                                        <button className="btn-export">Export</button>
                                        <button
                                            className="btn-map"
                                            onClick={() => handleOpenMappingModal(product)}
                                        >
                                            Map
                                        </button>
                                    </div>
                                </td>
                                <td className="status-column">
                                    {mappedStatuses[product.id] ? 'Synced' : 'No Status'}
                                </td>
                                <td className={`mapped-column ${mappedStatuses[product.id] === 'Yes' ? 'yes' : 'no'}`}>
                                    {mappedStatuses[product.id] || 'No'}
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
            {showMappingModal && selectedProduct && (
                <MappingModal
                    products={[selectedProduct]} // Pass the selected product only
                    onClose={handleCloseMappingModal}
                    onSave={async (mappingData) => {
                        try {
                            const clientId = localStorage.getItem('clientId');
                            const response = await fetch('/api/mappings/save', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    clientId,
                                    productId: selectedProduct.id,
                                    mappings: mappingData.mappings,
                                }),
                            });

                            const result = await response.json();
                            if (response.ok) {
                                console.log('Individual Mapping Saved:', result.message);
                                fetchMappingStatuses(); // Refresh mapped statuses
                            } else {
                                console.error('Error saving mapping:', result.error);
                            }
                        } catch (error) {
                            console.error('Error saving mapping:', error);
                        }
                        setShowMappingModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProductList;