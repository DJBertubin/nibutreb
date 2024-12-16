import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import IntegrationModal from '../components/IntegrationModal';

const AdminDashboard = () => {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [productData, setProductData] = useState([]);

  const handleShowModal = () => {
    setShowIntegrationModal(true);
  };

  const handleCloseModal = () => {
    setShowIntegrationModal(false);
  };

  const handleShopifyConnect = ({ data }) => {
    setProductData(data); // Update state with fetched product data
  };

  return (
    <div className="dashboard">
      <Sidebar userType="Admin" />
      <div className="main-content">
        <h2>Admin Dashboard</h2>
        <button className="connect-source-button" onClick={handleShowModal}>
          Add New Source
        </button>
        <ProductList products={productData} />
        {showIntegrationModal && (
          <IntegrationModal onClose={handleCloseModal} onShopifyConnect={handleShopifyConnect} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
