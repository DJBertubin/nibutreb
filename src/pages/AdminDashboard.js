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
    const [stores, setStores] = useState(['Walmart', 'Shopify']); // Initial stores list

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
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="Admin" />
            <div
                style={{
                    marginLeft: '300px', // Updated margin
                    padding: '20px',
                    flexGrow: 1,
                    overflow: 'auto',
                }}
            >
                <div className="main-content">
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
        </div>
    );
};

export default AdminDashboard;