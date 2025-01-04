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
                    throw new Error('User not authenticated. Please log in.');
                }

                const response = await fetch('/api/user/data', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch Shopify data: ${errorText}`);
                }

                const data = await response.json();
                setShopifyData(data.shopifyData.products || []);
            } catch (err) {
                setError(err.message || 'Failed to load data.');
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