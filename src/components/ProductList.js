import React from 'react';

const ProductList = ({ products }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Variants</th>
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
                  {product.variants.map((variant) => (
                    <li key={variant.id}>
                      {variant.title} - {variant.price}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">No products available</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ProductList;
