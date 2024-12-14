import React from 'react';

const ProductList = ({ products }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Price</th>
          <th>Status</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        {products.length > 0 ? (
          products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.status}</td>
              <td>{product.category}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No products available</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ProductList;
