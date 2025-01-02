import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [selectedMarketplace, setSelectedMarketplace] = useState(null);
    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [activeSource, setActiveSource] = useState(null);
    const targetMarketplaces = [
        { id: 'amazon', name: 'Amazon' },
        { id: 'walmart', name: 'Walmart' },
    ];

    useEffect(() => {
        const fetchSources = async () => {
            // Fetch connected sources
            const response = await fetch('/api/shopify/data');
            if (response.ok) {
                const data = await response.json();
                const formattedSources = data.shopifyData.map((entry) => ({
                    id: entry._id,
                    name: entry.shopifyUrl.split('.myshopify.com')[0],
                    url: entry.shopifyUrl,
                }));
                setSources(formattedSources);
            } else {
                setSources([]);
            }
        };
        fetchSources();
    }, []);

    const handleAddSourceClick = () => setShowAddSourceModal(true);

    const handleSaveSource = () => {
        if (selectedMarketplace === 'Shopify') {
            const newSource = {
                id: Date.now().toString(),
                name: storeUrl.split('.myshopify.com')[0],
                url: storeUrl,
            };
            setSources((prev) => [...prev, newSource]);
        }
        setShowAddSourceModal(false);
        setStoreUrl('');
        setAdminAccessToken('');
    };

    const handleSourceClick = (source) => setActiveSource(source);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="Admin" />
            <div style={{ marginLeft: '200px', padding: '20px', flexGrow: 1, overflow: 'auto' }}>
                <div className="main-content">
                    <ClientProfile name="Jane Doe" clientId="98765" imageUrl="https://via.placeholder.com/100" />
                    <div className="content">
                        <h2 className="section-title">Channels</h2>
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '10px',
                                padding: '20px',
                                textAlign: 'center',
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                minHeight: '200px',
                            }}
                        >
                            {sources.length === 0 ? (
                                <div
                                    style={{
                                        border: '2px dashed gray',
                                        borderRadius: '10px',
                                        padding: '50px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={handleAddSourceClick}
                                >
                                    <h4>Add Source</h4>
                                </div>
                            ) : (
                                <div>
                                    {sources.map((source) => (
                                        <div
                                            key={source.id}
                                            style={{
                                                border: '1px solid #ccc',
                                                margin: '10px',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                            onClick={() => handleSourceClick(source)}
                                        >
                                            <span>{source.name}</span>
                                            <div>
                                                <button>Settings</button>
                                                <span>Status: Active</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {showAddSourceModal && (
                            <div className="modal">
                                <h4>Select Marketplace</h4>
                                <div>
                                    {['Shopify', 'Walmart', 'Amazon'].map((marketplace) => (
                                        <button
                                            key={marketplace}
                                            onClick={() => setSelectedMarketplace(marketplace)}
                                            style={{
                                                margin: '5px',
                                                padding: '10px',
                                                backgroundColor:
                                                    selectedMarketplace === marketplace ? '#007bff' : '#ccc',
                                                color: 'white',
                                            }}
                                        >
                                            {marketplace}
                                        </button>
                                    ))}
                                </div>
                                {selectedMarketplace === 'Shopify' && (
                                    <div style={{ marginTop: '20px' }}>
                                        <label>
                                            Store URL:
                                            <input
                                                type="text"
                                                value={storeUrl}
                                                onChange={(e) => setStoreUrl(e.target.value)}
                                                placeholder="example.myshopify.com"
                                                style={{ marginLeft: '10px' }}
                                            />
                                        </label>
                                        <label>
                                            Admin Access Token:
                                            <input
                                                type="password"
                                                value={adminAccessToken}
                                                onChange={(e) => setAdminAccessToken(e.target.value)}
                                                placeholder="Enter Admin Token"
                                                style={{ marginLeft: '10px' }}
                                            />
                                        </label>
                                        <button onClick={handleSaveSource}>Save</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSource && (
                            <div style={{ marginTop: '20px' }}>
                                <h4>Target Marketplaces</h4>
                                {targetMarketplaces.map((marketplace) => (
                                    <div
                                        key={marketplace.id}
                                        style={{
                                            border: '1px solid #ccc',
                                            margin: '10px',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span>{marketplace.name}</span>
                                        <button>Add as Target</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Channels;