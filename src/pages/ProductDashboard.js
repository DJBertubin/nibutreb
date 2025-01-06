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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShopifyData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
    
            try {
                const response = await fetch('/api/shopify/data', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch Shopify data.');
                }
    
                const { shopifyData } = await response.json(); // Ensure this matches the backend structure
                setProductData(shopifyData); // Directly use the array
            } catch (err) {
                console.error('Error fetching Shopify data:', err);
                setError(err.message);
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
        const formattedProducts = (data || []).map((product) => ({
            id: product.id,
            title: product.title,
            sku: product.variants?.[0]?.sku || '',
            price: product.variants?.[0]?.price || 'N/A',
            inventory: product.variants?.[0]?.inventory_quantity || 0,
            created_at: product.created_at || '',
            sourceCategory: product.product_type || 'N/A',
        }));
        setProductData(formattedProducts);
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
                    <ClientProfile
                        name="Jane Doe" // Placeholder; replace with dynamic user name
                        clientId="98765" // Placeholder; replace with dynamic client ID
                        imageUrl="https://via.placeholder.com/100"
                    />
                    <MarketplaceDropdowns onAddNewSource={handleShowModal} storeList={stores} />
                    <div className="content">
                        <h2 className="section-title">Products Overview</h2>
                        {productData.length === 0 ? (
                            <div>No products available. Connect a store to get started.</div>
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