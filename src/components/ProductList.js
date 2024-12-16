import React from 'react';

const ProductList = ({ products }) => {
  return (
    <div>
      <h3>Fetched Products</h3>
      {products.length > 0 ? (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Product Title</th>
              <th>Variant SKU</th>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) =>
              product.variants.map((variant) => (
                <tr key={variant.id}>
                  <td>{product.title}</td>
                  <td>{variant.sku}</td>
                  <td>{`${variant.price.amount} ${variant.price.currencyCode}`}</td>
                  <td>{variant.inventoryQuantity || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <p>No products to display. Fetch data to see results.</p>
      )}
    </div>
  );
};

export default ProductList;
