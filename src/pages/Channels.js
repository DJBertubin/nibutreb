import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]);
    const [activeSourceId, setActiveSourceId] = useState(null);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
    const [selectedMarketplace, setSelectedMarketplace] = useState(null);
    const [showTargetModal, setShowTargetModal] = useState(false);

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
                }));

                setSources(formattedSources);
            } catch (err) {
                console.error('Error fetching sources:', err);
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
            };

            setSources((prev) => [...prev, newSource]);
            setStoreUrl('');
            setAdminAccessToken('');
            setShowAddSourceModal(false);
        } catch (err) {
            console.error('Error adding source:', err);
        }
    };

    const handleSourceClick = (sourceId) => {
        setActiveSourceId(sourceId);
        setShowTargetModal(true);
    };

    return (
        <div className="gradient-background">
            <Sidebar userType="Admin" />
            <div className="channels-container">
                <ClientProfile name="Jane Doe" clientId="98765" imageUrl="https://via.placeholder.com/100" />
                <h2 className="section-title">Channels</h2>
                <div className="source-list">
                    <div className="add-source-box" onClick={handleAddSourceClick}>
                        <h4>Add Source</h4>
                    </div>
                    {sources.map((source) => (
                        <div
                            key={source.id}
                            className="source-item"
                            onClick={() => handleSourceClick(source.id)}
                        >
                            {source.name}
                        </div>
                    ))}
                </div>

                {/* Add Source Modal */}
                {showAddSourceModal && (
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
                                    placeholder="Admin Token"
                                />
                            </label>
                            <button onClick={handleAddSource} className="marketplace-button">
                                Save
                            </button>
                            <button onClick={() => setShowAddSourceModal(false)} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Select Marketplace Modal */}
                {showMarketplaceModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h4>Select Marketplace</h4>
                            {['Shopify', 'Walmart', 'Amazon'].map((marketplace) => (
                                <button
                                    key={marketplace}
                                    onClick={() => handleMarketplaceSelection(marketplace)}
                                    className="marketplace-button"
                                >
                                    {marketplace}
                                </button>
                            ))}
                            <button onClick={() => setShowMarketplaceModal(false)} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Target Marketplace Modal */}
                {showTargetModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h4>Target Marketplaces</h4>
                            {['Walmart', 'Amazon'].map((marketplace) => (
                                <button key={marketplace} className="marketplace-button">
                                    {marketplace}
                                </button>
                            ))}
                            <button onClick={() => setShowTargetModal(false)} className="cancel-button">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Channels;