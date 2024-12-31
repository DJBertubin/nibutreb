import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [selectedTab, setSelectedTab] = useState('Shopify'); // Default selected tab
    const [shopifyStores, setShopifyStores] = useState([]);
    const [storeUrl, setStoreUrl] = useState('');
    const [adminAccessToken, setAdminAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [activeSource, setActiveSource] = useState(null);

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        setActiveSource(null); // Reset the active source selection when switching tabs
    };

    const validateShopifyUrl = (url) => {
        const regex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*\.myshopify\.com$/;
        return regex.test(url.trim().toLowerCase());
    };

    const extractStoreName = (url) => {
        return url.split('.myshopify.com')[0];
    };

    const handleShopifyConnect = async () => {
        setStatusMessage('Connecting to Shopify Admin API...');

        if (!validateShopifyUrl(storeUrl)) {
            setStatusMessage('Invalid Shopify store URL format. Use example.myshopify.com');
            return;
        }

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
            const storeName = extractStoreName(storeUrl);

            setShopifyStores((prev) => [
                ...prev,
                { id: prev.length + 1, name: storeName, url: storeUrl },
            ]);
            setStatusMessage(`Successfully connected to ${storeName}`);
        } catch (error) {
            setStatusMessage(`Failed to connect: ${error.message}`);
        }
    };

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
                        <h2 className="section-title">Channels Overview</h2>
                        <div className="tabs">
                            <button
                                className={`tab-button ${selectedTab === 'Shopify' ? 'active' : ''}`}
                                onClick={() => handleTabChange('Shopify')}
                            >
                                Shopify
                            </button>
                            <button
                                className={`tab-button ${selectedTab === 'Walmart' ? 'active' : ''}`}
                                onClick={() => handleTabChange('Walmart')}
                            >
                                Walmart
                            </button>
                            <button
                                className={`tab-button ${selectedTab === 'Amazon' ? 'active' : ''}`}
                                onClick={() => handleTabChange('Amazon')}
                            >
                                Amazon
                            </button>
                        </div>

                        {selectedTab === 'Shopify' && (
                            <div className="tab-content">
                                <h3>Connected Shopify Stores</h3>
                                <ul className="store-list">
                                    {shopifyStores.length > 0 ? (
                                        shopifyStores.map((store) => (
                                            <li key={store.id}>{store.name} ({store.url})</li>
                                        ))
                                    ) : (
                                        <p>No connected stores. Add a new one below.</p>
                                    )}
                                </ul>
                                <h4>Add a New Shopify Store</h4>
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
                                <button className="add-button" onClick={handleShopifyConnect}>
                                    Connect
                                </button>
                                <p className="status-message">{statusMessage}</p>
                            </div>
                        )}

                        {selectedTab !== 'Shopify' && (
                            <div className="tab-content">
                                <h3>{selectedTab} Integration Coming Soon!</h3>
                                <p>Please check back later for {selectedTab} integration.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Channels;