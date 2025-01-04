import React, { useState, useEffect } from 'react';
import './ProductList.css';
import MappingModal from './MappingModal';
import QuickEditModal from './QuickEditModal'; // New component for quick edits
import ImportModal from './ImportModal'; // New component for CSV import

const ProductList = ({ products, onAddNewProduct }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [showQuickEditModal, setShowQuickEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const filtered = products.filter((product) =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter((id) => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const handleBulkExport = () => {
        const selected = products.filter((product) => selectedProducts.includes(product.id));
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            ['Title,SKU,Price,Category,Inventory'].join(',') +
            '\n' +
            selected
                .map((product) =>
                    [product.title, product.sku, product.price, product.category, product.inventory].join(',')
                )
                .join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'product_data.csv');
        document.body.appendChild(link);
        link.click();
    };

    const handleOpenQuickEdit = (product) => {
        setSelectedProduct(product);
        setShowQuickEditModal(true);
    };

    const handleSaveQuickEdit = (updatedProduct) => {
        console.log('Updated product', updatedProduct);
        setShowQuickEditModal(false);
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>

            <div className="actions-bar">
                <button className="btn-green" onClick={onAddNewProduct}>
                    Add New Product
                </button>
                <input
                    type="text"
                    placeholder="Search Products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
                />
                <button
                    className="btn-blue"
                    onClick={handleBulkExport}
                    disabled={!selectedProducts.length}
                >
                    Export Selected
                </button>
                <button
                    className="btn-orange"
                    onClick={() => setShowImportModal(true)}
                >
                    Import CSV
                </button>
                <button
                    className="btn-gray"
                    onClick={() => alert('Advanced Mapping Rule Placeholder')}
                >
                    Advanced Rule
                </button>
            </div>

            <table className="modern-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                onChange={(e) =>
                                    setSelectedProducts(e.target.checked ? products.map((p) => p.id) : [])
                                }
                                checked={selectedProducts.length === products.length}
                            />
                        </th>
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
                    {filteredProducts.length > 0 ? (
                        filteredProducts
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="btn-orange"
                                            onClick={() => handleOpenQuickEdit(product)}
                                        >
                                            Quick Edit
                                        </button>
                                        <button
                                            className="btn-map"
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setShowMappingModal(true);
                                            }}
                                        >
                                            Map
                                        </button>
                                    </td>
                                    <td>{product.synced ? 'Synced' : 'Pending'}</td>
                                    <td className={`mapped ${product.mapped ? 'yes' : 'no'}`}>
                                        {product.mapped ? 'Yes' : 'No'}
                                    </td>
                                    <td>
                                        <strong>{product.title}</strong>
                                    </td>
                                    <td>{product.category || 'N/A'}</td>
                                    <td>${product.price || 'N/A'}</td>
                                    <td>{product.inventory || 'N/A'}</td>
                                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                    ) : (
                        <tr>
                            <td colSpan="9" style={{ textAlign: 'center' }}>
                                No products found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <span>Items per page: </span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * itemsPerPage >= filteredProducts.length}
                >
                    Next
                </button>
            </div>

            {/* Quick Edit Modal */}
            {showQuickEditModal && (
                <QuickEditModal
                    product={selectedProduct}
                    onClose={() => setShowQuickEditModal(false)}
                    onSave={handleSaveQuickEdit}
                />
            )}

            {/* CSV Import Modal */}
            {showImportModal && (
                <ImportModal onClose={() => setShowImportModal(false)} />
            )}

            {/* Individual Mapping Modal */}
            {showMappingModal && selectedProduct && (
                <MappingModal
                    products={[selectedProduct]}
                    onClose={() => setShowMappingModal(false)}
                    onSave={(mappingData) => {
                        console.log('Mapping saved:', mappingData);
                    }}
                />
            )}
        </div>
    );
};

export default ProductList;