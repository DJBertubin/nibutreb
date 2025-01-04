import React, { useState, useEffect } from 'react';
import './ProductList.css';
import MappingModal from './MappingModal';
import QuickEditModal from './QuickEditModal'; // Import Quick Edit Modal

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showQuickEditModal, setShowQuickEditModal] = useState(false);
    const [showBulkMappingModal, setShowBulkMappingModal] = useState(false);
    const [mappedStatuses, setMappedStatuses] = useState({});
    const [existingMappings, setExistingMappings] = useState({});
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchMappingsFromMongoDB = async () => {
        const clientId = localStorage.getItem('clientId');
        try {
            const response = await fetch(`/api/mappings/get/${clientId}`);
            const data = await response.json();
            if (response.ok) {
                const mappingsObj = {};
                data.mappings.forEach((mapping) => {
                    mappingsObj[mapping.productId] = mapping.mappings;
                });
                setExistingMappings(mappingsObj);
            } else {
                console.error('Error fetching mappings:', data.error);
            }
        } catch (error) {
            console.error('Error fetching mappings from MongoDB:', error);
        }
    };

    useEffect(() => {
        fetchMappingsFromMongoDB(); // Fetch all mappings when the component loads
    }, []);

    const handleOpenMappingModal = (product) => {
        setSelectedProduct(product);
        setShowMappingModal(true);
    };

    const handleCloseMappingModal = () => {
        setSelectedProduct(null);
        setShowMappingModal(false);
    };

    const getMappedStatus = (productId) => {
        const mapping = existingMappings[productId] || {};
        return Object.values(mapping).some((value) => value !== '') ? 'Yes' : 'No';
    };

    const updateMappedStatuses = () => {
        const statuses = {};
        products.forEach((product) => {
            statuses[product.id] = getMappedStatus(product.id);
        });
        setMappedStatuses(statuses);
    };

    useEffect(() => {
        updateMappedStatuses();
    }, [existingMappings]);

    const handleQuickEdit = (product) => {
        setSelectedProduct(product);
        setShowQuickEditModal(true);
    };

    const handleExport = (product) => {
        const csvData = [
            ['Product ID', 'Title', 'SKU', 'Price', 'Inventory'],
            [product.id, product.title, product.sku, product.price, product.inventory],
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${product.title}_Export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            <div className="button-group-top">
                <button className="btn-bulk-map" onClick={() => setShowBulkMappingModal(true)}>
                    Bulk Map
                </button>
            </div>

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
                                    <div className="button-group-horizontal">
                                        <button className="btn-export" onClick={() => handleExport(product)}>
                                            Export
                                        </button>
                                        <button className="btn-map" onClick={() => handleOpenMappingModal(product)}>
                                            Map
                                        </button>
                                        <button className="btn-quick-edit" onClick={() => handleQuickEdit(product)}>
                                            Quick Edit
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

            {showMappingModal && selectedProduct && (
                <MappingModal
                    products={[{ ...selectedProduct, mapping: existingMappings[selectedProduct.id] || {} }]}
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
                                    selectedProducts: [selectedProduct.id],
                                }),
                            });

                            const result = await response.json();
                            if (response.ok) {
                                fetchMappingsFromMongoDB();
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

            {showQuickEditModal && selectedProduct && (
                <QuickEditModal
                    product={selectedProduct}
                    onClose={() => setShowQuickEditModal(false)}
                    onSave={(updatedProduct) => {
                        console.log('Quick Edit Saved:', updatedProduct);
                        setShowQuickEditModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProductList;