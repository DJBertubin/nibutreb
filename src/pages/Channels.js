import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'addSource', 'addTarget', 'settings'
    const [selectedSource, setSelectedSource] = useState(null);
    const [activeTarget, setActiveTarget] = useState(null); // eBay, Walmart, Amazon
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('/api/shopify/data', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    setSources([]);
                    return;
                }

                const data = await response.json();
                const formattedSources = data.shopifyData.map((entry) => ({
                    id: entry._id,
                    name: entry.shopifyUrl.split('.myshopify.com')[0],
                    marketplace: 'Shopify',
                    url: entry.shopifyUrl,
                    token: entry.adminAccessToken,
                    targetMarketplaces: [], // Placeholder for targeted marketplaces
                }));

                setSources(formattedSources);
            } catch (err) {
                console.error('Error fetching sources:', err);
            }
        };

        fetchSources();
    }, []);

    const handleAddSourceClick = () => {
        setModalType('addSource');
        setShowModal(true);
    };

    const handleAddTargetClick = (source) => {
        setSelectedSource(source);
        setModalType('addTarget');
        setShowModal(true);
    };

    const handleSettingsClick = (source) => {
        setSelectedSource(source);
        setModalType('settings');
        setShowModal(true);
    };

    const handleMarketplaceSelection = (marketplace) => {
        if (marketplace === 'Walmart') {
            setActiveTarget(marketplace);
        } else {
            if (selectedSource) {
                setSources((prev) =>
                    prev.map((source) =>
                        source.id === selectedSource.id
                            ? { ...source, targetMarketplaces: [...source.targetMarketplaces, marketplace] }
                            : source
                    )
                );
            }
            setShowModal(false);
        }
    };

    const handleSaveWalmartCredentials = async () => {
        setStatusMessage('Saving Walmart credentials...');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('User is not authenticated.');

            const response = await fetch('/api/walmart/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    shopifySourceId: selectedSource.id,
                    clientId: clientId.trim(),
                    clientSecret: clientSecret.trim(),
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error saving Walmart credentials: ${errorText}`);
            }

            setSources((prev) =>
                prev.map((source) =>
                    source.id === selectedSource.id
                        ? { ...source, targetMarketplaces: [...source.targetMarketplaces, 'Walmart'] }
                        : source
                )
            );
            setStatusMessage('Walmart credentials saved successfully!');
            setShowModal(false);
            setClientId('');
            setClientSecret('');
        } catch (error) {
            setStatusMessage(`Failed to save credentials: ${error.message}`);
        }
    };

    const handleDeleteAccount = async (source) => {
        try {
            const response = await fetch(`/api/shopify/delete/${source.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            setSources((prev) => prev.filter((item) => item.id !== source.id));
            setShowModal(false);
        } catch (error) {
            console.error(`Error deleting account: ${error.message}`);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="Admin" />
            <div style={{ marginLeft: '200px', padding: '20px', flexGrow: 1, overflow: 'auto' }}>
                <div className="main-content">
                    <ClientProfile name="Jane Doe" clientId="98765" imageUrl="https://via.placeholder.com/100" />
                    <h2 className="section-title">Channels</h2>
                    <div className="source-grid">
                        <div className="add-source-box" onClick={handleAddSourceClick}>
                            <h4>Add Source</h4>
                        </div>
                        {sources.map((source) => (
                            <div key={source.id} className="source-item">
                                <div className="source-content">
                                    <span className="source-name">{source.name}</span>
                                </div>
                                <p className="target-status">
                                    {source.targetMarketplaces.length === 0
                                        ? 'No Targeted Marketplace'
                                        : `Targeted: ${source.targetMarketplaces.join(', ')}`}
                                </p>
                                <div className="source-buttons-horizontal">
                                    <button className="add-target-button" onClick={() => handleAddTargetClick(source)}>
                                        Add Target
                                    </button>
                                    <button className="settings-button" onClick={() => handleSettingsClick(source)}>
                                        Settings
                                    </button>
                                    <span className="status-text">Status: Active</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Modal */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                {modalType === 'addSource' && (
                                    <>
                                        <h2>Add New Source</h2>
                                        <button className="source-button" onClick={() => setActiveTarget('Shopify')}>
                                            Shopify
                                        </button>
                                    </>
                                )}
                                {modalType === 'addTarget' && (
                                    <>
                                        <h2>Select Target Marketplace</h2>
                                        {activeTarget === 'Walmart' ? (
                                            <>
                                                <label>
                                                    Client ID:
                                                    <input
                                                        type="text"
                                                        value={clientId}
                                                        onChange={(e) => setClientId(e.target.value)}
                                                        placeholder="Enter Walmart Client ID"
                                                        className="input-field"
                                                    />
                                                </label>
                                                <label>
                                                    Client Secret:
                                                    <input
                                                        type="password"
                                                        value={clientSecret}
                                                        onChange={(e) => setClientSecret(e.target.value)}
                                                        placeholder="Enter Walmart Client Secret"
                                                        className="input-field"
                                                    />
                                                </label>
                                                <button
                                                    className="connect-button"
                                                    onClick={handleSaveWalmartCredentials}
                                                >
                                                    Save
                                                </button>
                                            </>
                                        ) : (
                                            <div className="source-buttons-horizontal">
                                                <button onClick={() => handleMarketplaceSelection('eBay')}>eBay</button>
                                                <button onClick={() => handleMarketplaceSelection('Walmart')}>
                                                    Walmart
                                                </button>
                                                <button onClick={() => handleMarketplaceSelection('Amazon')}>Amazon</button>
                                            </div>
                                        )}
                                    </>
                                )}
                                {modalType === 'settings' && selectedSource && (
                                    <>
                                        <h2>Account Settings</h2>
                                        <p>Store URL: {selectedSource.url}</p>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteAccount(selectedSource)}
                                        >
                                            Delete Account
                                        </button>
                                    </>
                                )}
                                <button className="close-modal" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Channels;