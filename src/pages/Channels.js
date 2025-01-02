import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'addSource', 'linkedAccount', or 'settings'
    const [selectedSource, setSelectedSource] = useState(null);
    const [activeSource, setActiveSource] = useState(null);

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
                    status: 'active', // Assuming status is active by default
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

    const handleSettingsClick = (source) => {
        setSelectedSource(source);
        setModalType('settings');
        setShowModal(true);
    };

    const handleDeleteAccount = () => {
        setSources((prev) => prev.filter((source) => source.id !== selectedSource.id));
        setShowModal(false);
    };

    const handleMarketplaceSelection = (marketplace) => {
        setActiveSource(marketplace);
    };

    const handleShopifyConnect = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User is not authenticated. Please log in again.');
            }

            const response = await fetch('/api/shopify/fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    storeUrl: storeUrl.trim(),
                    adminAccessToken: adminAccessToken,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Shopify API Error: ${errorText}`);
            }

            const data = await response.json();
            setSources((prev) => [
                ...prev,
                {
                    id: data.shopifyData._id,
                    name: storeUrl.split('.myshopify.com')[0],
                    marketplace: 'Shopify',
                    url: storeUrl,
                    token: adminAccessToken,
                    status: 'active',
                },
            ]);

            setShowModal(false);
            setStoreUrl('');
            setAdminAccessToken('');
        } catch (error) {
            console.error(`Failed to connect: ${error.message}`);
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
                                    <span className="source-status">
                                        Status: {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
                                    </span>
                                </div>
                                <button
                                    className="settings-button"
                                    onClick={() => handleSettingsClick(source)}
                                >
                                    Settings
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Modal */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                {modalType === 'addSource' ? (
                                    <>
                                        <h2>Add New Source</h2>
                                        <div className="source-buttons">
                                            <button
                                                className={`source-button ${
                                                    activeSource === 'Shopify' ? 'active' : ''
                                                }`}
                                                onClick={() => handleMarketplaceSelection('Shopify')}
                                            >
                                                Shopify
                                            </button>
                                        </div>
                                        {activeSource === 'Shopify' && (
                                            <div className="shopify-integration">
                                                <label>
                                                    Store URL:
                                                    <input
                                                        type="text"
                                                        placeholder="example.myshopify.com"
                                                        value={storeUrl}
                                                        onChange={(e) => setStoreUrl(e.target.value)}
                                                    />
                                                </label>
                                                <label>
                                                    Admin Access Token:
                                                    <input
                                                        type="password"
                                                        placeholder="Your Admin Access Token"
                                                        value={adminAccessToken}
                                                        onChange={(e) => setAdminAccessToken(e.target.value)}
                                                    />
                                                </label>
                                                <button className="connect-button" onClick={handleShopifyConnect}>
                                                    Connect
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : modalType === 'settings' ? (
                                    <>
                                        <h2>Account Settings</h2>
                                        <p><strong>Store URL:</strong> {selectedSource.url}</p>
                                        <p><strong>Admin Token:</strong> {selectedSource.token}</p>
                                        <button className="delete-button" onClick={handleDeleteAccount}>
                                            Delete Account
                                        </button>
                                    </>
                                ) : null}
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