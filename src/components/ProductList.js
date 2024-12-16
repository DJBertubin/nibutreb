import React from 'react';

const ProductList = ({ products }) => {
    return (
        <div>
            <h3>Fetched Products</h3>
            {products.length > 0 ? (
                <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Variant Title</th>
                            <th>Price</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            product.variants.edges.map((variant) => (
                                <tr key={`${product.id}-${variant.node.title}`}>
                                    <td>{product.title}</td>
                                    <td>{product.description || 'N/A'}</td>
                                    <td>{variant.node.title}</td>
                                    <td>{`${variant.node.price.amount} ${variant.node.price.currencyCode}`}</td>
                                    <td>{variant.node.inventoryQuantity || 'N/A'}</td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No products to display. Fetch data to see results.</p>
            )}
        </div>
    );
};

export default ProductList;
