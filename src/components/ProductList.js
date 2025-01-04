import React, { useState, useEffect } from 'react';
import './ProductList.css';
import MappingModal from './MappingModal'; // Import the MappingModal component

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [mappedStatuses, setMappedStatuses] = useState({});
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    useEffect(() => {
        // Fetch mapped statuses from the backend to show if products are mapped
        const fetchMappings = async () => {
            const clientId = localStorage.getItem('clientId');
            try {
                const response = await fetch(`http://localhost:5001/api/mappings/get/${clientId}`);
                const data = await response.json();
                const mappingStatuses = {};
                data.mappings.forEach((mapping) => {
                    const allRequiredMapped = Object.values(mapping.mappings).every(
                        (attr) => attr && attr !== 'IGNORE'
                    );
                    mappingStatuses[mapping.productId] = allRequiredMapped ? 'Yes' : 'No';
                });
                setMappedStatuses(mappingStatuses);
            } catch (error) {
                console.error('Error fetching mapping statuses:', error.message);
            }
        };

        fetchMappings();
    }, [products]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Open and close the mapping modal
    const handleOpenMappingModal = (productId) => {
        setSelectedProducts([productId]);
        setShowMappingModal(true);
    };
    const handleCloseMappingModal = () => setShowMappingModal(false);

    // Handle save mappings
    const handleSaveMappings = async (mappingData) => {
        const clientId = localStorage.getItem('clientId');
        const productId = selectedProducts[0]; // Single product for simplicity
        try {
            const response = await fetch('http://localhost:5001/api/mappings/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clientId, productId, mappings: mappingData }),
            });

            if (response.ok) {
                console.log('Mappings saved successfully');
                setMappedStatuses((prev) => ({ ...prev, [productId]: 'Yes' }));
            }
        } catch (error) {
            console.error('Error saving mappings:', error.message);
        }

        setShowMappingModal(false);
    };

    const handleExport = (product) => {
        console.log('Exporting product:', product);
        // TODO: Implement export logic
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>

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
                                        <button
                                            className="btn-export"
                                            onClick={() => handleExport(product)}
                                        >
                                            Export
                                        </button>
                                        <button
                                            className="btn-map"
                                            onClick={() => handleOpenMappingModal(product.id)}
                                        >
                                            Map
                                        </button>
                                    </div>
                                </td>
                                <td className="status-column">No status</td>
                                <td className="mapped-column">
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

            {/* Mapping Modal */}
            {showMappingModal && (
                <MappingModal
                    products={products.filter((product) => selectedProducts.includes(product.id))}
                    onClose={handleCloseMappingModal}
                    onSave={handleSaveMappings}
                />
            )}
        </div>
    );
};

export default ProductList;