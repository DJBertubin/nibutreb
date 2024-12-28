import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import MarketplaceDropdowns from '../components/MarketplaceDropdowns';
import ClientProfile from '../components/ClientProfile';
import IntegrationModal from '../components/IntegrationModal';

const AdminDashboard = ({ setIsLoggedIn }) => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [integrationType, setIntegrationType] = useState('');
    const [productData, setProductData] = useState([]);
    const [stores, setStores] = useState(['Walmart', 'Shopify']); // Initial stores list

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token
        localStorage.removeItem('role');  // Clear role
        setIsLoggedIn(false);            // Reset login state
        navigate('/login');              // Redirect to login page
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
        setProductData(data); // Update product data
    };

    const handleAddStoreName = (storeName) => {
        if (!stores.includes(storeName)) {
            setStores((prevStores) => [...prevStores, storeName]);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar userType="Admin" />
            <div className="main-content">
                <div className="header">
                    <h1>Admin Dashboard</h1>
                    <button onClick={handleLogout} style={{ marginTop: '20px' }}>
                        Logout
                    </button>
                </div>
                <ClientProfile name="Jane Doe" clientId="98765" imageUrl="https://via.placeholder.com/100" />
                <MarketplaceDropdowns onAddNewSource={handleShowModal} storeList={stores} />
                <div className="content">
                    <h2 className="section-title">Products Overview</h2>
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

export default AdminDashboard;