import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import MarketplaceDropdowns from '../components/MarketplaceDropdowns';
import IntegrationModal from '../components/IntegrationModal';

const ClientDashboard = () => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [integrationType, setIntegrationType] = useState('');
    const [productData, setProductData] = useState([]);
    const [stores, setStores] = useState(['Shopify']);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleShowModal = (type) => {
        setIntegrationType(type);
        setShowIntegrationModal(true);
    };

    const handleCloseModal = () => {
        setShowIntegrationModal(false);
        setIntegrationType('');
    };

    const handleShopifyConnect = (data) => {
        setProductData(data);
    };

    const handleAddStoreName = (storeName) => {
        if (!stores.includes(storeName)) {
            setStores((prevStores) => [...prevStores, storeName]);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar userType="Client" onLogout={handleLogout} />
            <div className="main-content">
                <div className="header">
                    <h1>Client Dashboard</h1>
                </div>
                <MarketplaceDropdowns onAddNewSource={handleShowModal} storeList={stores} />
                <div className="content">
                    <h2 className="section-title">Your Products</h2>
                    <div className="products-table">
                        <ProductList products={productData} />
                    </div>
                </div>
                {showIntegrationModal && (
                    <IntegrationModal
                        onClose={handleCloseModal}
                        onFetchSuccess={handleShopifyConnect}
                        onAddStoreName={handleAddStoreName}
                    />
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;