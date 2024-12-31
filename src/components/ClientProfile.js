import React, { useEffect, useState } from 'react';
import './ClientProfile.css';

const ClientProfile = ({ clientId }) => {
  const [clientInfo, setClientInfo] = useState({ name: '', clientId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User is not authenticated. Please log in again.');
        }

        const response = await fetch(`/api/client/${clientId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch client information.');
        }

        const data = await response.json();
        setClientInfo({
          name: data.name,
          clientId: data.clientId,
        });
      } catch (err) {
        console.error('Error fetching client info:', err);
        setError(err.message || 'Error fetching client information.');
      }
    };

    fetchClientInfo();
  }, [clientId]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="client-profile">
      <img
        src="https://via.placeholder.com/100"
        alt="Client"
        className="client-image"
      />
      <div className="client-info">
        <h3 className="client-name">{clientInfo.name || 'Loading...'}</h3>
        <p className="client-id">Client ID: {clientInfo.clientId || 'Loading...'}</p>
      </div>
    </div>
  );
};

export default ClientProfile;