// File: src/components/ProductList.js

import React from 'react';

const ProductList = ({ products }) => {
    const handleExport = (product) => {
        console.log('Exporting Product:', product);
        // Logic to export the product data (e.g., CSV, JSON, etc.)
    };

    const handleEdit = (product) => {
        console.log('Editing Product:', product);
        // Logic to edit the product (open a form or modal)
    };

    return (
        <div>
            <h3>Fetched Products</h3>
            {products.length > 0 ? (
                <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Actions</th>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <button onClick={() => handleEdit(product)}>Edit</button>
                                    <button onClick={() => handleExport(product)} style={{ marginLeft: '8px' }}>
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
            ) : (
                <p>No products fetched yet. Please fetch from Shopify.</p>
            )}
        </div>
    );
};

export default ProductList;
