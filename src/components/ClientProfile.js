import React, { useEffect, useState } from 'react';

const ClientProfile = () => {
    const [clientInfo, setClientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClientInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('User is not authenticated. Please log in.');
                }

                const response = await fetch('http://localhost:5001/api/client/info', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch client information: ${errorText}`);
                }

                const data = await response.json();
                setClientInfo(data);
            } catch (err) {
                console.error('Error fetching client information:', err.message);
                setError(err.message || 'Failed to load client information.');
            } finally {
                setLoading(false);
            }
        };

        fetchClientInfo();
    }, []);

    if (loading) {
        return <p>Loading client information...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h2>Client Profile</h2>
            <p>Name: {clientInfo?.name || 'N/A'}</p>
            <p>Username: {clientInfo?.username || 'N/A'}</p>
            <p>Client ID: {clientInfo?.clientId || 'N/A'}</p>
            <p>Role: {clientInfo?.role || 'N/A'}</p>
        </div>
    );
};

export default ClientProfile;