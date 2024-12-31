import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState('');
    const [shopifyStores, setShopifyStores] = useState([
        { id: 1, name: 'myshopify1.com' },
    ]);

    const handleAddSource = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSource('');
    };

    const handleSelectSource = (source) => {
        setSelectedSource(source);
    };

    const handleShopifyAdd = (storeUrl, token) => {
        setShopifyStores((prevStores) => [
            ...prevStores,
            { id: shopifyStores.length + 1, name: storeUrl },
        ]);
        handleCloseModal();
        alert(`Shopify store ${storeUrl} connected successfully!`);
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
                            <div className="source-platforms modern-box">
                                <h3>Source Platforms</h3>
                                <ul className="platform-list">
                                    {shopifyStores.map((store) => (
                                        <li key={store.id} className="platform-item">
                                            <span>Shopify: {store.name}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className="modern-button add-source-button"
                                    onClick={handleAddSource}
                                >
                                    + Add Source
                                </button>
                            </div>
                            <div className="target-platforms modern-box">
                                <h3>Target Platforms</h3>
                                <p>Coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Select a Source Platform</h3>
                        <div className="marketplace-options">
                            <div
                                className="marketplace-option"
                                onClick={() => handleSelectSource('Shopify')}
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/1/15/Shopify_logo_2018.svg"
                                    alt="Shopify"
                                />
                                <span>Shopify</span>
                            </div>
                            <div
                                className="marketplace-option"
                                onClick={() => handleSelectSource('Walmart')}
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Walmart_logo.svg"
                                    alt="Walmart"
                                />
                                <span>Walmart</span>
                            </div>
                            <div
                                className="marketplace-option"
                                onClick={() => handleSelectSource('Amazon')}
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                                    alt="Amazon"
                                />
                                <span>Amazon</span>
                            </div>
                        </div>
                        {selectedSource === 'Shopify' && (
                            <div className="shopify-form">
                                <h4>Connect Shopify Store</h4>
                                <input
                                    type="text"
                                    placeholder="Store URL (e.g., myshop.myshopify.com)"
                                    id="shopify-url"
                                    className="login-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Admin Access Token"
                                    id="shopify-token"
                                    className="login-input"
                                />
                                <button
                                    className="login-button"
                                    onClick={() =>
                                        handleShopifyAdd(
                                            document.getElementById('shopify-url').value,
                                            document.getElementById('shopify-token').value
                                        )
                                    }
                                >
                                    Add Shopify Store
                                </button>
                            </div>
                        )}
                        <button
                            className="login-button close-button"
                            onClick={handleCloseModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Channels;