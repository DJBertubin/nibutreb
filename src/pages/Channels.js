import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [selectedTab, setSelectedTab] = useState('Shopify'); // Default selected tab
    const [shopifyStores, setShopifyStores] = useState([
        { id: 1, name: 'myshopify1.com' },
    ]);
    const [walmartStores, setWalmartStores] = useState([]);
    const [amazonStores, setAmazonStores] = useState([]);
    const [storeUrl, setStoreUrl] = useState('');
    const [storeToken, setStoreToken] = useState('');

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
    };

    const handleAddStore = () => {
        if (selectedTab === 'Shopify') {
            setShopifyStores((prev) => [...prev, { id: shopifyStores.length + 1, name: storeUrl }]);
        } else if (selectedTab === 'Walmart') {
            setWalmartStores((prev) => [...prev, { id: walmartStores.length + 1, name: storeUrl }]);
        } else if (selectedTab === 'Amazon') {
            setAmazonStores((prev) => [...prev, { id: amazonStores.length + 1, name: storeUrl }]);
        }
        setStoreUrl('');
        setStoreToken('');
        alert(`${selectedTab} store ${storeUrl} connected successfully!`);
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
                        <div className="channels-container">
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
                            <div className="tab-content">
                                {selectedTab === 'Shopify' && (
                                    <>
                                        <h3>Connected Shopify Stores</h3>
                                        <ul className="store-list">
                                            {shopifyStores.map((store) => (
                                                <li key={store.id}>{store.name}</li>
                                            ))}
                                        </ul>
                                        <h4>Add a New Shopify Store</h4>
                                        <input
                                            type="text"
                                            placeholder="Store URL (e.g., myshopify.com)"
                                            value={storeUrl}
                                            onChange={(e) => setStoreUrl(e.target.value)}
                                            className="input-field"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Access Token"
                                            value={storeToken}
                                            onChange={(e) => setStoreToken(e.target.value)}
                                            className="input-field"
                                        />
                                        <button className="add-button" onClick={handleAddStore}>
                                            Add Shopify Store
                                        </button>
                                    </>
                                )}
                                {selectedTab === 'Walmart' && (
                                    <>
                                        <h3>Connected Walmart Stores</h3>
                                        <ul className="store-list">
                                            {walmartStores.map((store) => (
                                                <li key={store.id}>{store.name}</li>
                                            ))}
                                        </ul>
                                        <h4>Add a New Walmart Store</h4>
                                        <input
                                            type="text"
                                            placeholder="Store URL"
                                            value={storeUrl}
                                            onChange={(e) => setStoreUrl(e.target.value)}
                                            className="input-field"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Access Token"
                                            value={storeToken}
                                            onChange={(e) => setStoreToken(e.target.value)}
                                            className="input-field"
                                        />
                                        <button className="add-button" onClick={handleAddStore}>
                                            Add Walmart Store
                                        </button>
                                    </>
                                )}
                                {selectedTab === 'Amazon' && (
                                    <>
                                        <h3>Connected Amazon Stores</h3>
                                        <ul className="store-list">
                                            {amazonStores.map((store) => (
                                                <li key={store.id}>{store.name}</li>
                                            ))}
                                        </ul>
                                        <h4>Add a New Amazon Store</h4>
                                        <input
                                            type="text"
                                            placeholder="Store URL"
                                            value={storeUrl}
                                            onChange={(e) => setStoreUrl(e.target.value)}
                                            className="input-field"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Access Token"
                                            value={storeToken}
                                            onChange={(e) => setStoreToken(e.target.value)}
                                            className="input-field"
                                        />
                                        <button className="add-button" onClick={handleAddStore}>
                                            Add Amazon Store
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Channels;