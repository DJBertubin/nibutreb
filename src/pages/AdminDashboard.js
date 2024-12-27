import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import MarketplaceDropdowns from '../components/MarketplaceDropdowns';
import IntegrationModal from '../components/IntegrationModal';

const AdminDashboard = () => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [productData, setProductData] = useState([]);
    const [stores, setStores] = useState(['Walmart', 'Shopify']);
    const [selectedStore, setSelectedStore] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [clientDetails, setClientDetails] = useState(null); // Stores details of the selected client
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Error handling for better user feedback

    // Fetch clients list on component mount
    useEffect(() => {
        async function fetchClients() {
            try {
                const response = await fetch('/api/clients', { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch clients');
                const data = await response.json();
                setClients(data.clients);
            } catch (error) {
                setError(error.message);
            }
        }
        fetchClients();
    }, []);

    // Fetch products for the selected client
    useEffect(() => {
        if (selectedClient) {
            async function fetchProducts() {
                setLoading(true);
                setError(null); // Reset error state
                try {
                    const response = await fetch(`/api/clients/${selectedClient}/products`, { credentials: 'include' });
                    if (!response.ok) throw new Error('Failed to fetch products for selected client');
                    const data = await response.json();
                    setProductData(data.products);
                    setClientDetails(data.clientDetails); // Assuming backend returns client details
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            }
            fetchProducts();
        }
    }, [selectedClient]);

    const handleShowModal = () => setShowIntegrationModal(true);
    const handleCloseModal = () => setShowIntegrationModal(false);

    const handleShopifyConnect = (data) => setProductData(data);

    const handleAddStoreName = (storeName) => {
        if (!stores.includes(storeName)) {
            setStores((prevStores) => [...prevStores, storeName]);
        }
        setSelectedStore(storeName);
    };

    const handleClientChange = (e) => {
        setSelectedClient(e.target.value);
    };

    return (
        <div className="dashboard">
            <Sidebar userType="Admin" />
            <div className="main-content">
                <h2>Admin Dashboard</h2>
                <select value={selectedClient} onChange={handleClientChange}>
                    <option value="">Select a Client</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>

                {error && <p className="error">{error}</p>}

                {selectedClient && (
                    <>
                        <div className="client-details">
                            <h3>Client Information</h3>
                            {clientDetails ? (
                                <ul>
                                    <li><strong>Name:</strong> {clientDetails.name}</li>
                                    <li><strong>Email:</strong> {clientDetails.email}</li>
                                    <li><strong>Status:</strong> {clientDetails.status}</li>
                                </ul>
                            ) : (
                                <p>Loading client details...</p>
                            )}
                        </div>

                        <MarketplaceDropdowns
                            onAddNewSource={handleShowModal}
                            storeList={stores}
                            defaultSelectedStore={selectedStore}
                        />
                        <div className="content">
                            <h2 className="section-title">Products Overview</h2>
                            {loading ? (
                                <p>Loading products...</p>
                            ) : (
                                <div className="products-table">
                                    <ProductList products={productData} />
                                </div>
                            )}
                        </div>
                    </>
                )}

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
