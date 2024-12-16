import React from 'react';

const ProductList = ({ products }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Variants</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {products.length > 0 ? (
          products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.title}</td>
              <td>
                <ul>
                  {product.variants.edges.map((variant) => (
                    <li key={variant.node.id}>
                      {variant.node.title}
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                {product.variants.edges.map((variant) => (
                  <div key={variant.node.id}>
                    {variant.node.price.amount} {variant.node.price.currencyCode}
                  </div>
                ))}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No products available</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ProductList;
