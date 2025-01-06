import React, { useState, useEffect } from 'react';
import './ProductList.css';
import MappingModal from './MappingModal'; // Import the MappingModal component

const ProductList = ({ products = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showBulkMappingModal, setShowBulkMappingModal] = useState(false);
    const [mappedStatuses, setMappedStatuses] = useState({}); // Track mapped status for each product
    const [existingMappings, setExistingMappings] = useState({}); // Store mappings fetched from MongoDB
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Fetch all existing mappings from MongoDB
    const fetchMappingsFromMongoDB = async () => {
        const clientId = localStorage.getItem('clientId');
        if (!clientId) {
            console.error('Client ID is missing. Cannot fetch mappings.');
            return;
        }
        try {
            console.log(`Fetching mappings for clientId: ${clientId}`);
            const response = await fetch(`/api/mappings/get/${clientId}`);
            if (!response.ok) {
                throw new Error(`Error fetching mappings: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Fetched mappings:', data);

            const mappingsObj = {};
            data.mappings?.forEach((mapping) => {
                mappingsObj[mapping.productId] = mapping.mappings; // Store mapping by product ID
            });
            setExistingMappings(mappingsObj);
        } catch (error) {
            console.error('Error fetching mappings from MongoDB:', error);
        }
    };

    useEffect(() => {
        fetchMappingsFromMongoDB(); // Fetch all mappings when the component loads
    }, []);

    // Open individual mapping modal
    const handleOpenMappingModal = (product) => {
        setSelectedProduct(product);
        setShowMappingModal(true);
    };

    const handleCloseMappingModal = () => {
        setSelectedProduct(null);
        setShowMappingModal(false);
    };

    // Check if the product has a synced status
    const getMappedStatus = (productId) => {
        const mapping = existingMappings[productId] || {};
        return Object.values(mapping).some((value) => value !== '') ? 'Yes' : 'No';
    };

    // Fetch mapping statuses to update display
    const updateMappedStatuses = () => {
        const statuses = {};
        products.forEach((product) => {
            statuses[product.id] = getMappedStatus(product.id);
        });
        setMappedStatuses(statuses);
    };

    useEffect(() => {
        updateMappedStatuses(); // Update mapped statuses whenever mappings are fetched
    }, [existingMappings, products]);

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            <div className="button-group-top">
                <button className="btn-bulk-map" onClick={() => setShowBulkMappingModal(true)}>
                    Bulk Map
                </button>
            </div>

            {/* Bulk Mapping Modal */}
            {showBulkMappingModal && (
                <MappingModal
                    products={products}
                    onClose={() => setShowBulkMappingModal(false)}
                    onSave={async (mappingData) => {
                        try {
                            const clientId = localStorage.getItem('clientId');
                            if (!clientId) {
                                console.error('Client ID is missing. Cannot save bulk mappings.');
                                return;
                            }
                            const response = await fetch('/api/mappings/save', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    clientId,
                                    productId: 'bulk',
                                    mappings: mappingData.mappings,
                                    selectedProducts: mappingData.selectedProducts,
                                }),
                            });

                            const result = await response.json();
                            if (!response.ok) {
                                throw new Error(result.error || 'Failed to save bulk mappings.');
                            }
                            console.log('Bulk Mapping Saved:', result.message);
                            fetchMappingsFromMongoDB(); // Refresh mapped statuses
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
                                    {mappedStatuses[product.id] === 'Yes' ? 'Synced' : 'No Status'}
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
                                <td>{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</td>
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
                    products={[{ ...selectedProduct, mapping: existingMappings[selectedProduct.id] || {} }]} // Pass existing mapping data
                    onClose={handleCloseMappingModal}
                    onSave={async (mappingData) => {
                        try {
                            const clientId = localStorage.getItem('clientId');
                            if (!clientId) {
                                console.error('Client ID is missing. Cannot save individual mapping.');
                                return;
                            }
                            const response = await fetch('/api/mappings/save', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    clientId,
                                    productId: selectedProduct.id,
                                    mappings: mappingData.mappings,
                                    selectedProducts: [selectedProduct.id],
                                }),
                            });

                            const result = await response.json();
                            if (!response.ok) {
                                throw new Error(result.error || 'Failed to save individual mapping.');
                            }
                            console.log('Individual Mapping Saved:', result.message);
                            fetchMappingsFromMongoDB(); // Refresh mapped statuses
                        } catch (error) {
                            console.error('Error saving individual mapping:', error);
                        }
                        setShowMappingModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProductList;