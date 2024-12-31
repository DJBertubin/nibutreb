import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [connectedSources, setConnectedSources] = useState([]);
    const [activeTab, setActiveTab] = useState('sources');
    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        // Fetch connected sources from the backend
        const fetchConnectedSources = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('/api/connected-sources', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch connected sources.');
                }

                const data = await response.json();
                setConnectedSources(data.sources || []);
            } catch (error) {
                console.error('Error fetching sources:', error);
                setStatusMessage('Error fetching connected sources.');
            }
        };

        fetchConnectedSources();
    }, []);

    const handleAddSource = async () => {
        try {
            setStatusMessage('Adding new source...');

            const token = localStorage.getItem('token');
            if (!token) return;

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
                throw new Error('Failed to add source.');
            }

            const data = await response.json();
            setConnectedSources((prev) => [...prev, data.source]);
            setStatusMessage('Source added successfully.');
            setShowAddSourceModal(false);
        } catch (error) {
            console.error('Error adding source:', error);
            setStatusMessage('Error adding source.');
        }
    };

    const renderConnectedSources = () => (
        <div className="connected-sources">
            {connectedSources.map((source) => (
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
            ))}
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
                className="gradient-background"
            >
                <div className="main-content">
                    <ClientProfile
                        name="Jane Doe"
                        clientId="98765"
                        imageUrl="https://via.placeholder.com/100"
                    />
                    <div className="content">
                        <h2 className="section-title">Channels</h2>
                        <div className="tabs">
                            <button
                                className={`tab-button ${activeTab === 'sources' ? 'active' : ''}`}
                                onClick={() => setActiveTab('sources')}
                            >
                                Sources
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'targets' ? 'active' : ''}`}
                                onClick={() => setActiveTab('targets')}
                            >
                                Targets
                            </button>
                        </div>
                        <div className="tab-content">
                            {activeTab === 'sources' && renderConnectedSources()}
                            {activeTab === 'targets' && (
                                <div>
                                    <p>No target marketplaces yet. Add one from a source!</p>
                                </div>
                            )}
                        </div>

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
    );
};

export default Channels;