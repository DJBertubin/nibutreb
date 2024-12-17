// File: src/components/ProductList.js

import React, { useState } from 'react';
import './ProductList.css'; // Import a CSS file for modern table styles

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handleExport = (product) => {
        console.log('Exporting Product:', product);
        // Logic to export the product data (e.g., CSV, JSON, etc.)
    };

    const handleEdit = (product) => {
        console.log('Editing Product:', product);
        // Logic to edit the product (open a form or modal)
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
                                <th>ID</th>
                                <th>Title</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <button className="edit-button" onClick={() => handleEdit(product)}>
                                            Edit
                                        </button>
                                        <button className="export-button" onClick={() => handleExport(product)}>
                                            Export
                                        </button>
                                    </td>
                                    <td>{product.id}</td>
                                    <td>{product.title}</td>
                                    <td>
                                        {product.variants && product.variants.length > 0
                                            ? `$${product.variants[0].price}`
                                            : 'N/A'}
                                    </td>
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
