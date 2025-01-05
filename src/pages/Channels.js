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
    const [modalType, setModalType] = useState('');
    const [selectedSource, setSelectedSource] = useState(null);
    const [activeSource, setActiveSource] = useState('');
    const [targetMarketplace, setTargetMarketplace] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false); // For loading state
    const [progressMessage, setProgressMessage] = useState('');

    // **Fetch sources and Walmart data**
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const shopifyResponse = await fetch('/api/shopify/data', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!shopifyResponse.ok) {
                    setSources([]);
                    return;
                }

                const shopifyData = await shopifyResponse.json();
                const formattedSources = shopifyData.shopifyData.map((entry) => ({
                    id: entry._id,
                    clientId: entry.clientId,
                    name: entry.shopifyUrl.split('.myshopify.com')[0],
                    marketplace: 'Shopify',
                    url: entry.shopifyUrl,
                    targetMarketplaces: entry.targetMarketplaces || [],
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
        setActiveSource('');
        setShowModal(true);
    };

    const handleShopifyConnect = async () => {
        setStatusMessage('Connecting to Shopify Admin API...');
        setLoading(true);
        setProgressMessage('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User is not authenticated. Please log in again.');
            }

            let allProducts = [];
            let nextPageUrl = null;
            let totalFetched = 0;

            do {
                const apiUrl = nextPageUrl || '/api/shopify/fetch';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        storeUrl: storeUrl.trim(),
                        adminAccessToken: adminAccessToken,
                        nextPageUrl,
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Shopify API Error: ${errorText}`);
                }

                const data = await response.json();
                const fetchedProducts = data.shopifyData.products || [];
                allProducts = [...allProducts, ...fetchedProducts];
                totalFetched += fetchedProducts.length;

                setProgressMessage(`Fetched ${totalFetched} products...`);
                nextPageUrl = data.nextPageUrl; // Get next page URL if it exists

                if (!nextPageUrl) {
                    setProgressMessage('All products have been fetched!');
                }
            } while (nextPageUrl);

            setSources((prev) => [
                ...prev,
                {
                    id: allProducts.length > 0 ? allProducts[0].product_id : 'new-source',
                    name: storeUrl.split('.myshopify.com')[0],
                    marketplace: 'Shopify',
                    url: storeUrl,
                    targetMarketplaces: [],
                },
            ]);

            setStatusMessage('Successfully connected to Shopify and fetched products!');
            setTimeout(() => setShowModal(false), 2000);
        } catch (error) {
            setStatusMessage(`Failed to connect: ${error.message}`);
        } finally {
            setLoading(false);
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
                                    <button
                                        className="settings-button"
                                        onClick={() => handleDeleteAccount(source)}
                                    >
                                        Delete
                                    </button>
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
                                        <div className="source-buttons-horizontal">
                                            <button
                                                className={`source-button ${
                                                    activeSource === 'Shopify' ? 'active' : ''
                                                }`}
                                                onClick={() => setActiveSource('Shopify')}
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
                                                <button
                                                    className="connect-button"
                                                    onClick={handleShopifyConnect}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Fetching...' : 'Connect'}
                                                </button>
                                                {loading && <p>{progressMessage}</p>}
                                                <p>{statusMessage}</p>
                                            </div>
                                        )}
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