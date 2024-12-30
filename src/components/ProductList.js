import React, { useState } from 'react';
import './ProductList.css';

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Calculate pagination
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

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            <table className="modern-table">
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>SKU</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Inventory</th>
                        <th>Created Date</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        currentProducts.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => handleSelectProduct(product.id)}
                                    />
                                </td>
                                <td>{product.sku || 'N/A'}</td>
                                <td>{product.title || 'N/A'}</td>
                                <td>${product.price || 'N/A'}</td>
                                <td>{product.inventory || 'N/A'}</td>
                                <td>{new Date(product.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>
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