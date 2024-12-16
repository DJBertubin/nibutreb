import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import MarketplaceDropdowns from '../components/MarketplaceDropdowns';
import ClientProfile from '../components/ClientProfile';
import IntegrationModal from '../components/IntegrationModal';

const AdminDashboard = () => {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [integrationType, setIntegrationType] = useState('');
  const [productData, setProductData] = useState([]); // Holds fetched product data

  const handleShowModal = (type) => {
    setIntegrationType(type);
    setShowIntegrationModal(true);
  };

  const handleCloseModal = () => {
    setShowIntegrationModal(false);
    setIntegrationType('');
  };

  const handleShopifyConnect = ({ data }) => {
    setProductData(data); // Update state with fetched product data
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar userType="Admin" />

      <div className="main-content">
        {/* Client Profile Section */}
        <ClientProfile
          name="Jane Doe"
          clientId="98765"
          imageUrl="https://via.placeholder.com/100"
        />

        {/* Marketplace Dropdowns */}
        <MarketplaceDropdowns onAddNewSource={handleShowModal} />

        {/* Products Overview */}
        <div className="content">
          <h2 className="section-title">Products Overview</h2>
          <div className="products-table">
            {/* Render fetched product data */}
            <ProductList products={productData} />
          </div>
        </div>

        {/* Integration Modal */}
        {showIntegrationModal && (
          <IntegrationModal
            type={integrationType}
            onClose={handleCloseModal}
            onShopifyConnect={handleShopifyConnect} // Handle data fetch
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
