import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import MarketplaceDropdowns from '../components/MarketplaceDropdowns';
import ClientProfile from '../components/ClientProfile';
import IntegrationModal from '../components/IntegrationModal';

const AdminDashboard = () => {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [integrationType, setIntegrationType] = useState('');
  const [productData, setProductData] = useState([]);

  const handleShowModal = (type) => {
    setIntegrationType(type);
    setShowIntegrationModal(true);
  };

  const handleCloseModal = () => {
    setShowIntegrationModal(false);
    setIntegrationType('');
  };

  const handleShopifyConnect = ({ data }) => {
    setProductData(data);
  };

  return (
    <div className="dashboard">
      <Sidebar userType="Admin" />
      <div className="main-content">
        <ClientProfile name="Jane Doe" clientId="98765" imageUrl="https://via.placeholder.com/100" />
        <MarketplaceDropdowns onAddNewSource={handleShowModal} />
        <div className="content">
          <h2 className="section-title">Products Overview</h2>
          <div className="products-table">
            <ProductList products={productData} />
          </div>
        </div>
        {showIntegrationModal && (
          <IntegrationModal
            type={integrationType}
            onClose={handleCloseModal}
            onShopifyConnect={handleShopifyConnect}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
