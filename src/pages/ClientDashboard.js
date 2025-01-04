import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

const ClientDashboard = ({ username }) => {
    const [shopifyData, setShopifyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchShopifyData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User is not authenticated. Please log in.');
                    return;
                }

                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/shopify/data`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    setError(`Failed to fetch Shopify data: ${errorText}`);
                    return;
                }

                const data = await response.json();
                setShopifyData(data.shopifyData?.[0]?.shopifyData?.products || []);
            } catch (err) {
                setError('An unexpected error occurred while loading Shopify data.');
                console.error('Error fetching Shopify data:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShopifyData();
    }, []);

    const renderProducts = () => {
        if (shopifyData.length === 0) {
            return <p>No Shopify products found. Please connect your Shopify store.</p>;
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {shopifyData.map((product, index) => (
                    <div
                        key={index}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '16px',
                            textAlign: 'center',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <h3>{product.title}</h3>
                        <p>Price: {product.variants?.[0]?.price || 'N/A'}</p>
                        <p>Inventory: {product.variants?.[0]?.inventory_quantity || 'N/A'}</p>
                        <img
                            src={product.image?.src || 'https://via.placeholder.com/150'}
                            alt={product.title}
                            style={{ width: '100%', height: '150px', objectFit: 'contain' }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="client" username={username} />
            <div
                style={{
                    marginLeft: '300px',
                    padding: '20px',
                    flexGrow: 1,
                    backgroundColor: '#f9f9f9',
                }}
            >
                <h1>Welcome, {username || 'Client'}!</h1>
                {loading ? (
                    <p>Loading Shopify data...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    renderProducts()
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;