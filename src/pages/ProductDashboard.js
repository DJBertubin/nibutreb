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
    const [productData, setProductData] = useState(() => {
        // Load cached data from sessionStorage
        const cachedData = sessionStorage.getItem('productData');
        return cachedData ? JSON.parse(cachedData) : [];
    });
    const [stores, setStores] = useState(['Walmart', 'Shopify']); // Initial stores list
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Initialize to false
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data only if not already cached
        if (productData.length === 0) {
            const fetchShopifyData = async () => {
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/login'); // Redirect to login if not authenticated
                    return;
                }

                try {
                    setLoading(true); // Start loading
                    const response = await fetch('/api/shopify/data', {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        if (response.status === 404) {
                            // No data found for user
                            setProductData([]); // Explicitly set empty product data
                            sessionStorage.setItem('productData', JSON.stringify([])); // Cache the empty data
                            return;
                        }
                        throw new Error(errorData.error || 'Failed to fetch Shopify data.');
                    }

                    const data = await response.json();
                    setProductData(data.shopifyData); // Update product data with fetched Shopify data
                    sessionStorage.setItem('productData', JSON.stringify(data.shopifyData)); // Cache the data
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false); // Stop loading
                }
            };

            fetchShopifyData();
        }
    }, [navigate, productData.length]);

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
        sessionStorage.setItem('productData', JSON.stringify(data)); // Cache updated data
    };

    const handleAddStoreName = (storeName) => {
        if (!stores.includes(storeName)) {
            setStores((prevStores) => [...prevStores, storeName]);
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

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
                        <div className="products-table">
                            {productData.length > 0 ? (
                                <ProductList products={productData} />
                            ) : (
                                <div>No products fetched yet. Please fetch from Shopify.</div>
                            )}
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

export default Products;