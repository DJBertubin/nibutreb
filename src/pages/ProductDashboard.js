import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import MarketplaceDropdowns from '../components/MarketplaceDropdowns';
import ClientProfile from '../components/ClientProfile';
import IntegrationModal from '../components/IntegrationModal';

const Products = () => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [integrationType, setIntegrationType] = useState('');
    const [productData, setProductData] = useState([]);
    const [stores, setStores] = useState(['Walmart', 'Shopify']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShopifyData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token found. Redirecting to login.');
                navigate('/login');
                return;
            }

            try {
                setLoading(true); // Show loading indicator during fetch
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // Default local URL
                const response = await fetch(`${apiUrl}/api/shopify/data`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 403) {
                    setError('Unauthorized access. Please log in again.');
                    console.error('403 Error: Redirecting to login');
                    navigate('/login');
                    return;
                }

                if (response.status === 404) {
                    console.warn('No products found for this client.');
                    setProductData([]); // Set empty data when no products are found
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Failed to fetch Shopify data: ${await response.text()}`);
                }

                const data = await response.json();
                console.log('Fetched Shopify Data:', data);

                const formattedProducts = data.shopifyData.flatMap((entry) =>
                    entry.products.map((product) => ({
                        id: product.id,
                        title: product.title,
                        sku: product.variants?.[0]?.sku || 'N/A',
                        price: product.variants?.[0]?.price || 'N/A',
                        inventory: product.variants?.[0]?.inventory_quantity || 0,
                        created_at: product.created_at || '',
                    }))
                );

                setProductData(formattedProducts);
            } catch (err) {
                console.error('Error fetching Shopify data:', err.message);
                setError(err.message || 'An error occurred while fetching data.');
            } finally {
                setLoading(false); // Hide loading indicator after fetch
            }
        };

        fetchShopifyData();
    }, [navigate]);

    const handleShowModal = (type) => {
        setIntegrationType(type);
        setShowIntegrationModal(true);
    };

    const handleCloseModal = () => {
        setShowIntegrationModal(false);
        setIntegrationType('');
    };

    const handleShopifyConnect = (data) => {
        const formattedProducts = data.map((product) => ({
            id: product.id,
            title: product.title,
            sku: product.variants?.[0]?.sku || '',
            price: product.variants?.[0]?.price || 'N/A',
            inventory: product.variants?.[0]?.inventory_quantity || 0,
            created_at: product.created_at || '',
        }));
        setProductData(formattedProducts);
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
                    marginLeft: '200px',
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

                        {loading ? (
                            <p>Loading Shopify data...</p>
                        ) : error ? (
                            <p style={{ color: 'red' }}>{error}</p>
                        ) : (
                            <div className="products-table">
                                <ProductList products={productData} />
                            </div>
                        )}
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

export default Products;