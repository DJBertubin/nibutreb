import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';

const Channels = () => {
    const [sourcePlatforms, setSourcePlatforms] = useState([
        { id: 1, name: 'Shopify', status: 'Connected' },
        { id: 2, name: 'Walmart', status: 'Pending' },
    ]);
    const [targetPlatforms, setTargetPlatforms] = useState([
        { id: 1, name: 'Amazon', status: 'Connected' },
        { id: 2, name: 'Etsy', status: 'Pending' },
    ]);

    const handleAddSource = () => {
        // Add logic to handle adding a source platform
        alert('Add Source Platform');
    };

    const handleAddTarget = () => {
        // Add logic to handle adding a target marketplace
        alert('Add Target Marketplace');
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
                            <div className="source-platforms">
                                <h3>Source Platforms</h3>
                                <button
                                    className="modern-button add-source-button"
                                    onClick={handleAddSource}
                                >
                                    + Add Source
                                </button>
                                <ul className="platform-list">
                                    {sourcePlatforms.map((platform) => (
                                        <li key={platform.id} className="platform-item">
                                            <span>{platform.name}</span>
                                            <span
                                                className={`status ${
                                                    platform.status === 'Connected'
                                                        ? 'connected'
                                                        : 'pending'
                                                }`}
                                            >
                                                {platform.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="target-platforms">
                                <h3>Target Platforms</h3>
                                <button
                                    className="modern-button add-target-button"
                                    onClick={handleAddTarget}
                                >
                                    + Add Target
                                </button>
                                <ul className="platform-list">
                                    {targetPlatforms.map((platform) => (
                                        <li key={platform.id} className="platform-item">
                                            <span>{platform.name}</span>
                                            <span
                                                className={`status ${
                                                    platform.status === 'Connected'
                                                        ? 'connected'
                                                        : 'pending'
                                                }`}
                                            >
                                                {platform.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Channels;