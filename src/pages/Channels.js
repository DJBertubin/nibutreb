import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]);
    const [activeSourceId, setActiveSourceId] = useState(null);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
    const [selectedMarketplace, setSelectedMarketplace] = useState(null);

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setStatusMessage('User is not authenticated. Please log in again.');
                    return;
                }

                const response = await fetch('/api/shopify/data', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
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
                if (formattedSources.length > 0) setActiveSourceId(formattedSources[0].id);
            } catch (err) {
                console.error('Error fetching sources:', err);
                setStatusMessage('Error fetching connected sources.');
            }
        };

        fetchSources();
    }, []);

    const handleAddSourceClick = () => setShowMarketplaceModal(true);

    const handleMarketplaceSelection = (marketplace) => {
        setSelectedMarketplace(marketplace);
        setShowMarketplaceModal(false);
        setShowAddSourceModal(true);
    };

    const handleAddSource = async () => {
        setStatusMessage('Adding new source...');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setStatusMessage('User is not authenticated. Please log in again.');
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

            setSources((prev) => [...prev, newSource]);
            setActiveSourceId(newSource.id);
            setStoreUrl('');
            setAdminAccessToken('');
            setShowAddSourceModal(false);
            setStatusMessage('Source added successfully.');
        } catch (error) {
            console.error('Error adding source:', error);
            setStatusMessage('Error adding source.');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="Admin" />
            <div style={{ marginLeft: '200px', padding: '20px', flexGrow: 1, overflow: 'auto' }}>
                <div className="main-content">
                    <ClientProfile name="Jane Doe" clientId="98765" imageUrl="https://via.placeholder.com/100" />
                    <h2 className="section-title">Channels</h2>
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '10px',
                            padding: '20px',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {sources.length === 0 ? (
                            <div className="add-source-box" onClick={handleAddSourceClick}>
                                <h4>Add Source</h4>
                            </div>
                        ) : (
                            sources.map((source) => (
                                <div key={source.id} className="source-item">
                                    <span>{source.name}</span>
                                    <div>
                                        <button className="settings-button">Settings</button>
                                        <span className="status-active">Status: Active</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Select Marketplace Modal */}
                    {showMarketplaceModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h4>Select Marketplace</h4>
                                <div className="marketplace-options">
                                    {['Shopify', 'Walmart', 'Amazon'].map((marketplace) => (
                                        <button
                                            key={marketplace}
                                            onClick={() => handleMarketplaceSelection(marketplace)}
                                            className="marketplace-button"
                                        >
                                            {marketplace}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setShowMarketplaceModal(false)} className="cancel-button">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add Source Modal */}
                    {showAddSourceModal && selectedMarketplace === 'Shopify' && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h4>Add Shopify Store</h4>
                                <label>
                                    Store URL:
                                    <input
                                        type="text"
                                        value={storeUrl}
                                        onChange={(e) => setStoreUrl(e.target.value)}
                                        className="input-field"
                                        placeholder="example.myshopify.com"
                                    />
                                </label>
                                <label>
                                    Admin Access Token:
                                    <input
                                        type="password"
                                        value={adminAccessToken}
                                        onChange={(e) => setAdminAccessToken(e.target.value)}
                                        className="input-field"
                                        placeholder="Enter Admin Token"
                                    />
                                </label>
                                <div className="modal-actions">
                                    <button onClick={handleAddSource} className="add-button">
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowAddSourceModal(false)}
                                        className="cancel-button"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <p className="status-message">{statusMessage}</p>
                </div>
            </div>
        </div>
    );
};

export default Channels;