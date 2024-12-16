import React from 'react';

const ProductList = ({ products }) => {
    return (
        <div>
            <h3>Fetched Products</h3>
            {products.length > 0 ? (
                <ul>
                    {products.map((product) => (
                        <li key={product.id}>
                            <strong>Title:</strong> {product.title} <br />
                            <strong>Total Inventory:</strong> {product.totalInventory} <br />
                            <strong>Variants:</strong>
                            <ul>
                                {product.variants.edges.map((variant) => (
                                    <li key={variant.node.id}>
                                        <strong>Variant Title:</strong> {variant.node.title} <br />
                                        <strong>Price:</strong> {variant.node.price.amount} {variant.node.price.currencyCode} <br />
                                        <strong>Quantity:</strong> {variant.node.inventoryQuantity}
                                    </li>
                                ))}
                            </ul>
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
