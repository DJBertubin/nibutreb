// File: src/components/ProductList.js

import React from 'react';

const ProductList = ({ products }) => {
    return (
        <div>
            <h3>Fetched Products</h3>
            {products.length > 0 ? (
                <ul>
                    {products.map((product) => (
                        <li key={product.id}>
                            <strong>{product.title}</strong> - $
                            {product.variants && product.variants.length > 0
                                ? product.variants[0].price
                                : 'N/A'}
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
