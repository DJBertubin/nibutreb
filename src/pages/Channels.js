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
                    url: entry.shopifyUrl,
                }));
                setSources(formattedSources);
                if (formattedSources.length > 0) setActiveSourceId(formattedSources[0].id);
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
                url: storeUrl,
            };

            setSources((prev) => [...prev, newSource]);
            setActiveSourceId(newSource.id);
            setShowAddSourceModal(false);
            setStoreUrl('');
            setAdminAccessToken('');
        } catch (error) {
            console.error('Error adding source:', error);
        }
    };

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
                                sources.map((source) => (
                                    <div
                                        key={source.id}
                                        style={{
                                            border: '1px solid #ccc',
                                            margin: '10px',
                                            padding: '10px',
                                            borderRadius: '5px',


```javascript
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span>{source.name}</span>
                                        <div>
                                            <button>Settings</button>
                                            <span>Status: Active</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Select Marketplace Modal */}
                        {showMarketplaceModal && (
                            <div className="modal">
                                <div className="modal-content">
                                    <h4>Select Marketplace</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {['Shopify', 'Walmart', 'Amazon'].map((marketplace) => (
                                            <button
                                                key={marketplace}
                                                onClick={() => handleMarketplaceSelection(marketplace)}
                                                style={{
                                                    margin: '10px 0',
                                                    padding: '10px',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {marketplace}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        style={{
                                            marginTop: '20px',
                                            padding: '10px',
                                            backgroundColor: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setShowMarketplaceModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add Source Modal */}
                        {showAddSourceModal && selectedMarketplace === 'Shopify' && (
                            <div className="modal">
                                <div className="modal-content">
                                    <h4>Add Shopify Store</h4>
                                    <label>
                                        Store URL:
                                        <input
                                            type="text"
                                            value={storeUrl}
                                            onChange={(e) => setStoreUrl(e.target.value)}
                                            placeholder="example.myshopify.com"
                                            style={{ marginLeft: '10px', padding: '5px' }}
                                        />
                                    </label>
                                    <br />
                                    <label>
                                        Admin Access Token:
                                        <input
                                            type="password"
                                            value={adminAccessToken}
                                            onChange={(e) => setAdminAccessToken(e.target.value)}
                                            placeholder="Enter Admin Token"
                                            style={{ marginLeft: '10px', padding: '5px' }}
                                        />
                                    </label>
                                    <br />
                                    <button
                                        onClick={handleAddSource}
                                        style={{
                                            marginTop: '20px',
                                            padding: '10px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowAddSourceModal(false)}
                                        style={{
                                            marginLeft: '10px',
                                            padding: '10px',
                                            backgroundColor: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Channels;