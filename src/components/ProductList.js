import React from 'react';

const ProductList = ({ products }) => {
    return (
        <div>
            <h3>Fetched Products</h3>
            {products.length > 0 ? (
                <ul>
                    {products.map((product) => (
                        <li key={product.id}>
                            <strong>{product.title}</strong> - ${product.variants[0]?.edges[0]?.node?.price?.amount || 'N/A'}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No products fetched yet. Please fetch from Shopify.</p>
            )}
        </div>
    );
};

export default ProductList;
