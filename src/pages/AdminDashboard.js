import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import MarketplaceDropdowns from '../components/MarketplaceDropdowns';
import ClientProfile from '../components/ClientProfile';
import IntegrationModal from '../components/IntegrationModal';

const AdminDashboard = () => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [integrationType, setIntegrationType] = useState('');
    const [productData, setProductData] = useState([]);
    const [stores, setStores] = useState(['Walmart', 'Shopify']);
    const [clients, setClients] = useState([]); // List of clients
    const [selectedClient, setSelectedClient] = useState(null); // Selected client
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

    const fetchClients = async () => {
        // Simulated API call to fetch clients
        const clientList = [
            { id: '123', name: 'Client A' },
            { id: '456', name: 'Client B' },
            { id: '789', name: 'Client C' },
        ];
        setClients(clientList);
    };

    const handleClientChange = (event) => {
        const clientId = event.target.value;
        const client = clients.find((c) => c.id === clientId);
        setSelectedClient(client);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div className="dashboard">
            <Sidebar userType="Admin" onLogout={handleLogout} />
            <div className="main-content">
                <div className="header">
                    <h1>Admin Dashboard</h1>
                    <select onChange={handleClientChange} value={selectedClient?.id || ''}>
                        <option value="" disabled>
                            Select a Client
                        </option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedClient && (
                    <>
                        <ClientProfile
                            name={selectedClient.name}
                            clientId={selectedClient.id}
                            imageUrl="https://via.placeholder.com/100"
                        />
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
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;