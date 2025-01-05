import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import IntegrationModal from '../components/IntegrationModal';

const Products = () => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [integrationType, setIntegrationType] = useState('');
    const [productData, setProductData] = useState([]);
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
                    const errorData = await response.json();
                    if (response.status === 404) {
                        // No Shopify data found for this user
                        setProductData([]);
                        return;
                    }
                    throw new Error(errorData.error || 'Failed to fetch Shopify data.');
                }

                const data = await response.json();

                // Ensure data.shopifyData is an array
                const formattedProducts = (data.shopifyData || []).flatMap((entry) =>
                    (entry.products || []).map((product) => ({
                        id: product.id || '',
                        title: product.title || 'Untitled Product',
                        sku: product.variants?.[0]?.sku || 'N/A',
                        price: product.variants?.[0]?.price || 'N/A',
                        inventory: product.variants?.[0]?.inventory_quantity || 0,
                        created_at: product.created_at || '',
                        sourceCategory: product.product_type || 'N/A', // Added category display
                        image: product.images?.[0]?.src || 'https://via.placeholder.com/50',
                    }))
                );

                setProductData(formattedProducts);
            } catch (err) {
                console.error('Error fetching Shopify data:', err.message);
                setError('Failed to fetch products. Please try again.');
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
            id: product.id || '',
            title: product.title || 'Untitled Product',
            sku: product.variants?.[0]?.sku || 'N/A',
            price: product.variants?.[0]?.price || 'N/A',
            inventory: product.variants?.[0]?.inventory_quantity || 0,
            created_at: product.created_at || '',
            sourceCategory: product.product_type || 'N/A',
            image: product.images?.[0]?.src || 'https://via.placeholder.com/50',
        }));
        setProductData(formattedProducts);
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
                    <div className="content">
                        <h2 className="section-title">Products Overview</h2>
                        {productData.length === 0 && !error ? (
                            <div>No products available. Connect a store to get started.</div>
                        ) : error ? (
                            <div>Error: {error}</div>
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
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;