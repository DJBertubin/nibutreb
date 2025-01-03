import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [walmartClientID, setWalmartClientID] = useState('');
    const [walmartClientSecret, setWalmartClientSecret] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'addSource' or 'addTarget'
    const [selectedSource, setSelectedSource] = useState(null);
    const [activeSource, setActiveSource] = useState(''); // For "Add Source" modal
    const [targetMarketplace, setTargetMarketplace] = useState(''); // For "Add Target" modal
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch Shopify sources
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
                    clientId: entry.clientId,
                    name: entry.shopifyUrl.split('.myshopify.com')[0],
                    marketplace: 'Shopify',
                    url: entry.shopifyUrl,
                    token: entry.adminAccessToken,
                    targetMarketplaces: entry.targetMarketplaces || [],
                }));

                setSources(formattedSources);
            } catch (err) {
                console.error('Error fetching Shopify sources:', err);
            }
        };

        fetchSources();
    }, []);

    const handleAddSourceClick = () => {
        setModalType('addSource');
        setActiveSource(''); // Reset source selection for add source
        setShowModal(true);
    };

    const handleAddTargetClick = (source) => {
        setSelectedSource(source);
        setModalType('addTarget'); // Open "Add Target" modal
        setTargetMarketplace(''); // Reset target marketplace selection
        setShowModal(true);
    };

    const handleSettingsClick = (source) => {
        setSelectedSource(source);
        setModalType('settings');
        setShowModal(true);
    };

    const handleSourceSelection = (source) => {
        setActiveSource(source); // Track which source is selected (Shopify, Walmart, Amazon)
    };

    const handleTargetSelection = (marketplace) => {
        setTargetMarketplace(marketplace); // Track the target marketplace selected (Walmart, eBay, Amazon)
    };

    const handleShopifyConnect = async () => {
        setStatusMessage('Connecting to Shopify Admin API...');

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
                    targetMarketplaces: [],
                },
            ]);

            setShowModal(false);
            setStoreUrl('');
            setAdminAccessToken('');
            setStatusMessage('Successfully connected to Shopify!');
        } catch (error) {
            setStatusMessage(`Failed to connect: ${error.message}`);
        }
    };

    const handleWalmartTargetConnect = async () => {
        setStatusMessage('Connecting to Walmart API...');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User is not authenticated. Please log in again.');
            }

            const response = await fetch('/api/walmart/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    walmartClientID: walmartClientID.trim(),
                    walmartClientSecret: walmartClientSecret.trim(),
                    clientId: selectedSource?.clientId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Walmart API Error: ${errorText}`);
            }

            setSources((prev) =>
                prev.map((source) =>
                    source.id === selectedSource.id
                        ? { ...source, targetMarketplaces: [...source.targetMarketplaces, 'Walmart'] }
                        : source
                )
            );

            setShowModal(false);
            setWalmartClientID('');
            setWalmartClientSecret('');
            setStatusMessage('Successfully added Walmart as a target marketplace!');
        } catch (error) {
            setStatusMessage(`Failed to connect: ${error.message}`);
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
                                    <img
                                        className="marketplace-logo"
                                        src={`/${source.marketplace.toLowerCase()}-logo.png`}
                                        alt={`${source.marketplace} logo`}
                                    />
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
                                {modalType === 'addSource' ? (
                                    <>
                                        <h2>Add New Source</h2>
                                        <div className="source-buttons-horizontal">
                                            <button
                                                className={`source-button ${
                                                    activeSource === 'Shopify' ? 'active' : ''
                                                }`}
                                                onClick={() => handleSourceSelection('Shopify')}
                                            >
                                                Shopify
                                            </button>
                                            <button
                                                className={`source-button ${
                                                    activeSource === 'Walmart' ? 'active' : ''
                                                }`}
                                                onClick={() => handleSourceSelection('Walmart')}
                                            >
                                                Walmart
                                            </button>
                                            <button
                                                className={`source-button ${
                                                    activeSource === 'Amazon' ? 'active' : ''
                                                }`}
                                                onClick={() => handleSourceSelection('Amazon')}
                                            >
                                                Amazon
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
                                                <p>{statusMessage}</p>
                                            </div>
                                        )}
                                        {activeSource === 'Walmart' && (
                                            <div className="walmart-integration">
                                                <p>Walmart source integration coming soon!</p>
                                            </div>
                                        )}
                                        {activeSource === 'Amazon' && (
                                            <div className="amazon-integration">
                                                <p>Amazon integration coming soon!</p>
                                            </div>
                                        )}
                                    </>
                                ) : modalType === 'addTarget' ? (
                                    <>
                                        <h2>Select Target Marketplace</h2>
                                        <div className="source-buttons-horizontal">
                                            <button onClick={() => handleTargetSelection('eBay')}>eBay</button>
                                            <button onClick={() => handleTargetSelection('Walmart')}>
                                                Walmart
                                            </button>
                                            <button onClick={() => handleTargetSelection('Amazon')}>Amazon</button>
                                        </div>

                                        {targetMarketplace === 'Walmart' && (
                                            <div className="walmart-integration">
                                                <h3>Add Walmart Credentials</h3>
                                                <label>
                                                    Walmart Client ID:
                                                    <input
                                                        type="text"
                                                        placeholder="Your Walmart Client ID"
                                                        value={walmartClientID}
                                                        onChange={(e) => setWalmartClientID(e.target.value)}
                                                    />
                                                </label>
                                                <label>
                                                    Walmart Client Secret:
                                                    <input
                                                        type="password"
                                                        placeholder="Your Walmart Client Secret"
                                                        value={walmartClientSecret}
                                                        onChange={(e) => setWalmartClientSecret(e.target.value)}
                                                    />
                                                </label>
                                                <button className="connect-button" onClick={handleWalmartTargetConnect}>
                                                    Connect
                                                </button>
                                                <p>{statusMessage}</p>
                                            </div>
                                        )}
                                        {targetMarketplace !== 'Walmart' && targetMarketplace && (
                                            <>
                                                <p>Target marketplace "{targetMarketplace}" added successfully!</p>
                                                <button onClick={() => setShowModal(false)}>Close</button>
                                            </>
                                        )}
                                    </>
                                ) : modalType ===