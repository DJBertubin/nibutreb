import React, { useEffect, useState } from 'react';
import './ClientProfile.css';

const ClientProfile = () => {
    const [clientInfo, setClientInfo] = useState({ name: '', clientId: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClientInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('User is not authenticated. Please log in again.');
                }

                // Fetch client information
                const response = await fetch('/api/client/info', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch client information.');
                }

                const data = await response.json();
                setClientInfo({
                    name: data.name,
                    clientId: data.clientId,
                });
            } catch (err) {
                console.error('Error fetching client information:', err.message);
                setError(err.message || 'Error fetching client information.');
            }
        };

        fetchClientInfo();
    }, []);

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="client-profile">
            <img
                src="https://via.placeholder.com/50"
                alt="Client"
                className="client-image"
            />
            <div className="client-info">
                <h4 className="client-name">
                    {clientInfo.name || 'N/A'} <span className="client-id">({clientInfo.clientId || 'N/A'})</span>
                </h4>
            </div>
        </div>
    );
};

export default ClientProfile;