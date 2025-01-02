import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [showMarketplaceSelection, setShowMarketplaceSelection] = useState(true);
    const [selectedMarketplace, setSelectedMarketplace] = useState('');
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);

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
                    marketplace: 'Shopify', // Assign marketplace dynamically if needed
                }));

                setSources(formattedSources);
            } catch (err) {
                console.error('Error fetching sources:', err);
            }
        };

        fetchSources();
    }, []);

    const handleAddSourceClick = () => {
        setShowAddSourceModal(true);
        setShowMarketplaceSelection(true);
    };

    const handleMarketplaceSelection = (marketplace) => {
        setSelectedMarketplace(marketplace);
        setShowMarketplaceSelection(false);
    };

    const handleAddSource = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

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

            if (!response.ok) throw new Error('Failed to add source.');

            const data = await response.json();
            const newSource = {
                id: data.shopifyData._id,
                name: storeUrl.split('.myshopify.com')[0],
                marketplace: 'Shopify', // Default to Shopify for this example
            };

            setSources((prev) => [...prev, newSource]);
            setStoreUrl('');
            setAdminAccessToken('');
            setShowAddSourceModal(false);
        } catch (err) {
            console.error('Error adding source:', err);
        }
    };

    const handleSourceClick = (source) => {
        setSelectedSource(source);
        setShowTargetModal(true);
    };

    const getMarketplaceLogo = (marketplace) => {
        const logos = {
            Shopify: 'https://cdn.shopify.com/shopify-logo.png',
            Walmart: 'https://cdn.walmart.com/walmart-logo.png',
            Amazon: 'https://cdn.amazon.com/amazon-logo.png',
        };
        return logos[marketplace] || '';
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
                            <div
                                key={source.id}
                                className="source-item"
                                onClick={() => handleSourceClick(source)}
                            >
                                <div className="source-content">
                                    <img
                                        src={getMarketplaceLogo(source.marketplace)}
                                        alt={source.marketplace}
                                        className="marketplace-logo"
                                    />
                                    <span className="source-name">{source.name}</span>
                                </div>
                                <div className="source-buttons">
                                    <button className="settings-button">Settings</button>
                                    <button className="status-button">Status</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Source Modal */}
                    {showAddSourceModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                {showMarketplaceSelection ? (
                                    <>
                                        <h4>Select Marketplace</h4>
                                        <button
                                            className="marketplace-button"
                                            onClick={() => handleMarketplaceSelection('Shopify')}
                                        >
                                            Shopify
                                        </button>
                                        <button
                                            className="marketplace-button"
                                            onClick={() => handleMarketplaceSelection('Walmart')}
                                        >
                                            Walmart
                                        </button>
                                        <button
                                            className="marketplace-button"
                                            onClick={() => handleMarketplaceSelection('Amazon')}
                                        >
                                            Amazon
                                        </button>
                                        <button
                                            onClick={() => setShowAddSourceModal(false)}
                                            className="cancel-button"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : selectedMarketplace === 'Shopify' ? (
                                    <>
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
                                    </>
                                ) : (
                                    <p>Additional setup for {selectedMarketplace} will be added here.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Target Marketplace Modal */}
                    {showTargetModal && selectedSource && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h4>Target Marketplaces for {selectedSource.name}</h4>
                                {['Walmart', 'Amazon'].map((marketplace) => (
                                    <button key={marketplace} className="marketplace-button">
                                        {marketplace}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowTargetModal(false)}
                                    className="cancel-button"
                                >
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