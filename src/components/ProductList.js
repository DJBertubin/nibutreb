import React, { useState, useEffect } from 'react';
import './ProductList.css';
import MappingModal from './MappingModal';

const ProductList = () => {
    const [products, setProducts] = useState([]); // Initialize products state to store MongoDB data
    const [currentPage, setCurrentPage] = useState(1);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showBulkMappingModal, setShowBulkMappingModal] = useState(false);
    const [mappedStatuses, setMappedStatuses] = useState({});
    const [existingMappings, setExistingMappings] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]); // Track selected products for bulk export
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredProducts = products.filter((product) =>
        (product.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchProductsFromMongoDB = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/shopify/data', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Error fetching products:', response.statusText);
                return;
            }

            const data = await response.json();
            const fetchedProducts = data.shopifyData.flatMap((entry) =>
                entry.products.map((product) => ({
                    id: product.id,
                    title: product.title,
                    sku: product.variants?.[0]?.sku || '',
                    price: product.variants?.[0]?.price || 'N/A',
                    inventory: product.variants?.[0]?.inventory_quantity || 0,
                    created_at: product.created_at || '',
                    sourceCategory: product.product_type || 'N/A',
                    image: product.image || 'https://via.placeholder.com/50',
                    description: product.body_html || '',
                }))
            );
            setProducts(fetchedProducts);
        } catch (error) {
            console.error('Error fetching products from MongoDB:', error);
        }
    };

    useEffect(() => {
        fetchProductsFromMongoDB(); // Fetch products from MongoDB when the component mounts
    }, []);

    const fetchMappingsFromMongoDB = async () => {
        const clientId = localStorage.getItem('clientId');
        if (!clientId) {
            console.error('Client ID missing in localStorage.');
            return;
        }
        try {
            const response = await fetch(`/api/mappings/get/${clientId}`);
            const data = await response.json();
            if (response.ok) {
                const mappingsObj = {};
                data.mappings?.forEach((mapping) => {
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
        fetchMappingsFromMongoDB();
    }, []);

    const handleOpenMappingModal = (product) => {
        setSelectedProduct(product);
        setShowMappingModal(true);
    };

    const handleCloseMappingModal = () => {
        setSelectedProduct(null);
        setShowMappingModal(false);
    };

    const handleOpenBulkMappingModal = () => {
        if (selectedProducts.length === 0) {
            alert('Please select products for bulk mapping.');
            return;
        }
        setShowBulkMappingModal(true);
    };

    const handleCloseBulkMappingModal = () => {
        setShowBulkMappingModal(false);
    };

    const getMappedStatus = (productId) => {
        const mapping = existingMappings[productId] || {};
        return Object.values(mapping).some((value) => value) ? 'Yes' : 'No';
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
    }, [existingMappings, products]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleSelectProduct = (productId) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.includes(productId)
                ? prevSelected.filter((id) => id !== productId)
                : [...prevSelected, productId]
        );
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            const allProductIds = currentProducts.map((product) => product.id);
            setSelectedProducts(allProductIds);
        } else {
            setSelectedProducts([]);
        }
    };

    const handleExportSelected = () => {
        if (selectedProducts.length === 0) {
            alert('No products selected for export!');
            return;
        }
        console.log('Exporting Products:', selectedProducts);
        // Implement the export functionality here
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>

            <div className="filter-controls">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="search-input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <div className="button-group-top">
                    <button className="btn-bulk-action" onClick={handleExportSelected}>
                        Export Selected
                    </button>
                    <button className="btn-bulk-action" onClick={handleOpenBulkMappingModal}>
                        Bulk Map
                    </button>
                </div>
            </div>

            <table className="modern-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                        </th>
                        <th>Actions</th>
                        <th>Status</th>
                        <th>Mapped</th>
                        <th className="product-name-column">Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Inventory</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.length > 0 ? (
                        currentProducts.map((product, index) => (
                            <tr key={product.id || `product-${index}`} className="product-row">
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => handleSelectProduct(product.id)}
                                    />
                                </td>
                                <td className="actions-column">
                                    <div className="button-group-horizontal">
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
                                        <div className="sku">
                                            SKU: {product.sku || 'N/A'} | Product ID: {product.id || 'N/A'}
                                        </div>
                                    </div>
                                </td>
                                <td className="category-column">{product.sourceCategory || 'N/A'}</td>
                                <td>${product.price || 'N/A'}</td>
                                <td>{product.inventory || 'N/A'}</td>
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

            {filteredProducts.length > 0 && (
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
                                console.log('Mapping saved successfully.');
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

            {showBulkMappingModal && (
                <MappingModal
                    products={products.filter((product) => selectedProducts.includes(product.id))}
                    onClose={handleCloseBulkMappingModal}
                    onSave={async (mappingData) => {
                        try {
                            const clientId = localStorage.getItem('clientId');
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
                            if (response.ok) {
                                console.log('Bulk Mapping Saved:', result.message);
                                fetchMappingsFromMongoDB();
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
        </div>
    );
};

export default ProductList;
