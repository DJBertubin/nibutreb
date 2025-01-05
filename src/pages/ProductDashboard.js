import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';
import IntegrationModal from '../components/IntegrationModal';

const Products = () => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [integrationType, setIntegrationType] = useState('');
    const [productData, setProductData] = useState([]);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1); // For pagination
    const [hasMore, setHasMore] = useState(true); // Track if more products exist
    const loader = useRef(null);
    const navigate = useNavigate();

    const fetchShopifyData = async (currentPage = 1, limit = 250) => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`/api/shopify/data?page=${currentPage}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch Shopify data.');
            }

            const data = await response.json();
            const newProducts = data.shopifyData.flatMap((entry) =>
                entry.products.map((product) => ({
                    id: product.id,
                    title: product.title,
                    sku: product.variants?.[0]?.sku || '',
                    price: product.variants?.[0]?.price || 'N/A',
                    inventory: product.variants?.[0]?.inventory_quantity || 0,
                    created_at: product.created_at || '',
                    sourceCategory: product.product_type || 'N/A',
                }))
            );

            setProductData((prev) => [...prev, ...newProducts]);
            if (newProducts.length < limit) {
                setHasMore(false); // No more products to load
            }
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchShopifyData(page); // Fetch products for the current page
    }, [page]);

    const handleObserver = (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1); // Load next batch when reaching the bottom
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 1.0 });
        if (loader.current) observer.observe(loader.current);
        return () => observer.disconnect();
    }, [hasMore]);

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
            sourceCategory: product.product_type || 'N/A',
        }));
        setProductData(formattedProducts);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="Admin" />
            <div style={{ marginLeft: '200px', padding: '20px', flexGrow: 1, overflow: 'auto' }}>
                <div className="main-content">
                    <div className="content">
                        <h2 className="section-title">Products Overview</h2>
                        {productData.length === 0 ? (
                            <div>No products available. Connect a store to get started.</div>
                        ) : (
                            <div className="products-table">
                                <ProductList products={productData} />
                                <div ref={loader}>{hasMore && 'Loading more products...'}</div>
                            </div>
                        )}
                    </div>
                    {showIntegrationModal && (
                        <IntegrationModal onClose={handleCloseModal} onFetchSuccess={handleShopifyConnect} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;