import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]); // Connected source marketplaces
    const [activeSourceId, setActiveSourceId] = useState(null); // Currently selected source
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState('');
    const [targetMarketplaces, setTargetMarketplaces] = useState([
        { id: 'amazon', name: 'Amazon', connected: false },
        { id: 'walmart', name: 'Walmart', connected: false },
        { id: 'ebay', name: 'eBay', connected: false },
    ]);

    useEffect(() => {
        const fetchSources = async () => {
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
                        setSources([]); // No sources connected yet
                        return;
                    }
                    throw new Error(errorData.error || 'Failed to fetch connected sources.');
                }

                const data = await response.json();

                const formattedSources = data.shopifyData.map((entry) => ({
                    id: entry._id,
                    name: entry.shopifyUrl.split('.myshopify.com')[0],
                    url: entry.shopifyUrl,
                }));

                setSources(formattedSources);
                if (formattedSources.length > 0) {
                    setActiveSourceId(formattedSources[0].id); // Default to the first source
                }
            } catch (err) {
                console.error('Error fetching sources:', err);
                setError(err.message || 'Error fetching connected sources.');
            }
        };

        fetchSources();
    }, []);

    const handleAddSource = async () => {
        setStatusMessage('Adding new source...');

        try {
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
                    storeUrl: storeUrl.trim(),
                    adminAccessToken,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add source.');
            }

            const data = await response.json();

            const newSource = {
                id: data.shopifyData._id,
                name: storeUrl.split('.myshopify.com')[0],
                url: storeUrl,
            };

            setSources((prev) => [...prev, newSource]); // Add the new source
            setActiveSourceId(newSource.id); // Set the new source as active
            setStoreUrl('');
            setAdminAccessToken('');
            setStatusMessage('Source added successfully.');
        } catch (error) {
            console.error('Error adding source:', error);
            setStatusMessage(error.message || 'Error adding source.');
        }
    };

    const handleToggleMarketplace = (marketplaceId) => {
        setTargetMarketplaces((prev) =>
            prev.map((marketplace) =>
                marketplace.id === marketplaceId
                    ? { ...marketplace, connected: !marketplace.connected }
                    : marketplace
            )
        );
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
                            <div className="tabs">
                                {sources.map((source) => (
                                    <button
                                        key={source.id}
                                        className={`tab-button ${activeSourceId === source.id ? 'active' : ''}`}
                                        onClick={() => setActiveSourceId(source.id)}
                                    >
                                        {source.name}
                                    </button>
                                ))}
                                <button
                                    className={`tab-button ${activeSourceId === 'addSource' ? 'active' : ''}`}
                                    onClick={() => setActiveSourceId('addSource')}
                                >
                                    Add Source
                                </button>
                            </div>

                            {activeSourceId === 'addSource' && (
                                <div className="add-source-section">
                                    <h4>Add New Source</h4>
                                    <label>
                                        Store URL:
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="example.myshopify.com"
                                            value={storeUrl}
                                            onChange={(e) => setStoreUrl(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Admin Access Token:
                                        <input
                                            type="password"
                                            className="input-field"
                                            placeholder="Your Admin Access Token"
                                            value={adminAccessToken}
                                            onChange={(e) => setAdminAccessToken(e.target.value)}
                                        />
                                    </label>
                                    <button className="add-button" onClick={handleAddSource}>
                                        Add Source
                                    </button>
                                </div>
                            )}

                            {activeSourceId !== 'addSource' && (
                                <div className="targets-section">
                                    <h4>Target Marketplaces for {sources.find((s) => s.id === activeSourceId)?.name}</h4>
                                    <div className="marketplaces-container">
                                        {targetMarketplaces.map((marketplace) => (
                                            <div
                                                key={marketplace.id}
                                                className="marketplace-box"
                                                style={{
                                                    borderColor: marketplace.connected ? 'green' : 'red',
                                                }}
                                            >
                                                <div className="marketplace-header">
                                                    <span className={`status-dot ${marketplace.connected ? 'green' : 'red'}`}></span>
                                                    <h5>{marketplace.name}</h5>
                                                </div>
                                                {marketplace.connected ? (
                                                    <div className="marketplace-actions">
                                                        <button
                                                            className="settings-button"
                                                            onClick={() =>
                                                                alert(`${marketplace.name} Settings Clicked!`)
                                                            }
                                                        >
                                                            Settings
                                                        </button>
                                                        <button
                                                            className="delete-button"
                                                            onClick={() => handleToggleMarketplace(marketplace.id)}
                                                        >
                                                            Disconnect
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p
                                                        className="add-target"
                                                        onClick={() => handleToggleMarketplace(marketplace.id)}
                                                    >
                                                        Add as Target Marketplace
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <p className="status-message">{statusMessage}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Channels;