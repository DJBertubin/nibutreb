import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';

const ClientDashboard = () => {
    const [clientData, setClientData] = useState([]);
    const [clientDetails, setClientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch client-specific details and data
        const fetchClientData = async () => {
            setLoading(true);
            setError(null); // Reset any previous errors

            try {
                // Fetch client-specific data
                const response = await fetch('/api/client-dashboard', {
                    credentials: 'include', // Include cookies for authentication
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch client data');
                }
                const data = await response.json();
                setClientData(data.products || []);
                setClientDetails(data.clientDetails || {});
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, []);

    if (loading) return <p>Loading your dashboard...</p>;
    if (error) return <p className="error">Error: {error}</p>;

    return (
        <div className="dashboard">
            <Sidebar userType="Client" />
            <div className="main-content">
                <h2>Welcome to Your Dashboard</h2>

                {clientDetails && (
                    <div className="client-details">
                        <h3>Your Information</h3>
                        <ul>
                            <li><strong>Name:</strong> {clientDetails.name}</li>
                            <li><strong>Email:</strong> {clientDetails.email}</li>
                            <li><strong>Status:</strong> {clientDetails.status}</li>
                        </ul>
                    </div>
                )}

                <div className="content">
                    <h2 className="section-title">Your Products</h2>
                    {clientData.length > 0 ? (
                        <div className="products-table">
                            <ProductList products={clientData} />
                        </div>
                    ) : (
                        <p>No products available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
