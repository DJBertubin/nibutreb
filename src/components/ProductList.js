// File: src/components/ProductList.js

import React, { useState } from 'react';
import './ProductList.css'; // Import a CSS file for modern table styles

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [editedProducts, setEditedProducts] = useState([]);

    // Sort products by created date (newest first)
    const sortedProducts = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handleEdit = (productId, field, value) => {
        setEditedProducts((prev) => {
            const updated = prev.find((item) => item.id === productId)
                ? prev.map((item) => (item.id === productId ? { ...item, [field]: value } : item))
                : [...prev, { id: productId, [field]: value }];
            return updated;
        });
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            {products.length > 0 ? (
                <>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>SKU</th>
                                <th className="product-name-column">Product Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Created Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <button className="edit-button">
                                            Save
                                        </button>
                                    </td>
                                    <td>{product.variants && product.variants.length > 0 ? product.variants[0].sku : 'N/A'}</td>
                                    <td className="product-name-column">{product.title}</td>
                                    <td>
                                        <input
                                            type="text"
                                            defaultValue={product.variants && product.variants.length > 0 ? product.variants[0].price : 'N/A'}
                                            onChange={(e) => handleEdit(product.id, 'price', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            defaultValue={product.variants && product.variants.length > 0 ? product.variants[0].inventory_quantity : 'N/A'}
                                            onChange={(e) => handleEdit(product.id, 'quantity', e.target.value)}
                                        />
                                    </td>
                                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>No products fetched yet. Please fetch from Shopify.</p>
            )}
        </div>
    );
};

export default ProductList;
