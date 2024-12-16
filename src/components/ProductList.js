import React from 'react';
import './ProductList.css'; // Add new styles for the table

const ProductList = ({ products }) => {
    const handleExport = (product) => {
        // Logic to export a product
        console.log('Exporting product:', product);
        alert(`Exported: ${product.title}`);
    };

    const handleEdit = (product) => {
        // Logic to edit a product
        console.log('Editing product:', product);
        alert(`Editing: ${product.title}`);
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            {products.length > 0 ? (
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Total Inventory</th>
                            <th>Variant Title</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            product.variants.edges.map((variant) => (
                                <tr key={variant.node.id}>
                                    <td>{product.title}</td>
                                    <td>{product.totalInventory}</td>
                                    <td>{variant.node.title}</td>
                                    <td>{variant.node.price.amount} {variant.node.price.currencyCode}</td>
                                    <td>{variant.node.inventoryQuantity}</td>
                                    <td>
                                        <button
                                            className="action-button export-button"
                                            onClick={() => handleExport(product)}
                                        >
                                            Export
                                        </button>
                                        <button
                                            className="action-button edit-button"
                                            onClick={() => handleEdit(product)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
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
