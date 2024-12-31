import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [connectedSources, setConnectedSources] = useState([]);
    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Reuse the fetch logic from the Products Page
        const fetchConnectedSources = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User is not authenticated. Please log in again.');
                    return;
                }

                const response = await fetch('/api/shopify/data', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 404) {
                        // No connected sources
                        setConnectedSources([]);
                        return;
                    }
                    throw new Error(errorData.error || 'Failed to fetch connected sources.');
                }

                const data = await response.json();

                // Map fetched data to display connected sources (e.g., Shopify store names)
                const sources = data.shopifyData.map((entry) => ({
                    id: entry._id, // MongoDB document ID
                    name: entry.shopifyUrl.split('.myshopify.com')[0], // Extract Shopify store name
                    url: entry.shopifyUrl,
                }));

                setConnectedSources(sources);
            } catch (err) {
                console.error('Error fetching sources:', err);
                setError(err.message || 'Error fetching connected sources.');
            }
        };

        fetchConnectedSources();
    }, []);

    const handleAddSource = async () => {
        try {
            setStatusMessage('Adding new source...');

            const token = localStorage.getItem('token');
            if (!token) {
                setError('User is not authenticated. Please log in again.');
                return;
            }

            const response = await fetch('/api/shopify/fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    storeUrl,
                    adminAccessToken,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add source.');
            }

            const data = await response.json();

            // Update connected sources with the newly added source
            setConnectedSources((prev) => [
                ...prev,
                {
                    id: data.source._id,
                    name: data.source.shopifyUrl.split('.myshopify.com')[0],
                    url: data.source.shopifyUrl,
                },
            ]);

            setStatusMessage('Source added successfully.');
            setShowAddSourceModal(false);
        } catch (error) {
            console.error('Error adding source:', error);
            setStatusMessage(error.message || 'Error adding source.');
        }
    };

    const renderConnectedSources = () => (
        <div className="connected-sources">
            {connectedSources.length > 0 ? (
                connectedSources.map((source) => (
                    <div key={source.id} className="source-card">
                        <h3>{source.name}</h3>
                        <p>{source.url}</p>
                        <button
                            className="add-target-button"
                            onClick={() => console.log(`Add target for ${source.id}`)}
                        >
                            + Add Target Marketplace
                        </button>
                    </div>
                ))
            ) : (
                <p>No connected sources found. Please add a source.</p>
            )}
        </div>
    );

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
                    <div className="content">
                        <h2 className="section-title">Channels</h2>
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '10px',
                                padding: '20px',
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {renderConnectedSources()}

                            <div className="add-source-section">
                                {showAddSourceModal ? (
                                    <div className="add-source-form">
                                        <h3>Add New Source</h3>
                                        <label>
                                            Store URL:
                                            <input
                                                type="text"
                                                placeholder="example.myshopify.com"
                                                value={storeUrl}
                                                onChange={(e) => setStoreUrl(e.target.value)}
                                                className="input-field"
                                            />
                                        </label>
                                        <label>
                                            Admin Access Token:
                                            <input
                                                type="password"
                                                placeholder="Your Admin Access Token"
                                                value={adminAccessToken}
                                                onChange={(e) => setAdminAccessToken(e.target.value)}
                                                className="input-field"
                                            />
                                        </label>
                                        <button className="add-button" onClick={handleAddSource}>
                                            Add Source
                                        </button>
                                        <button
                                            className="cancel-button"
                                            onClick={() => setShowAddSourceModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="add-source-button"
                                        onClick={() => setShowAddSourceModal(true)}
                                    >
                                        + Add Source
                                    </button>
                                )}
                            </div>

                            <p className="status-message">{statusMessage}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Channels;