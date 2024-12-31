import React, { useState } from 'react';
import './channels.css';

const Channels = () => {
    const [activeTab, setActiveTab] = useState('addSource'); // Default to add source tab
    const [sources, setSources] = useState([
        {
            name: 'Shopify',
            targets: ['Amazon', 'Etsy'],
        },
        {
            name: 'Walmart',
            targets: ['eBay'],
        },
    ]);
    const [newSource, setNewSource] = useState({ url: '', token: '' });

    const handleTabChange = (source) => {
        setActiveTab(source);
    };

    const handleAddSource = () => {
        if (!newSource.url || !newSource.token) {
            alert('Please fill in both fields');
            return;
        }
        const sourceName = newSource.url.split('.')[0]; // Example: extract "example" from "example.myshopify.com"
        setSources((prevSources) => [
            ...prevSources,
            { name: sourceName, targets: [] },
        ]);
        setNewSource({ url: '', token: '' });
        setActiveTab(sourceName); // Set the newly added source as active tab
    };

    const handleAddTarget = (sourceName, newTarget) => {
        setSources((prevSources) =>
            prevSources.map((source) =>
                source.name === sourceName
                    ? { ...source, targets: [...source.targets, newTarget] }
                    : source
            )
        );
    };

    return (
        <div className="gradient-background">
            <div className="channels-container">
                <h3>Channels</h3>
                <div className="tabs">
                    {sources.map((source) => (
                        <button
                            key={source.name}
                            className={`tab-button ${
                                activeTab === source.name ? 'active' : ''
                            }`}
                            onClick={() => handleTabChange(source.name)}
                        >
                            {source.name}
                        </button>
                    ))}
                    <button
                        className={`tab-button ${
                            activeTab === 'addSource' ? 'active' : ''
                        }`}
                        onClick={() => handleTabChange('addSource')}
                    >
                        Add Source
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'addSource' && (
                        <>
                            <h4>Add New Source</h4>
                            <label>
                                Store URL:
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="example.myshopify.com"
                                    value={newSource.url}
                                    onChange={(e) =>
                                        setNewSource({
                                            ...newSource,
                                            url: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <label>
                                Admin Access Token:
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Your Admin Access Token"
                                    value={newSource.token}
                                    onChange={(e) =>
                                        setNewSource({
                                            ...newSource,
                                            token: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <button className="add-button" onClick={handleAddSource}>
                                Add Source
                            </button>
                        </>
                    )}

                    {sources
                        .filter((source) => source.name === activeTab)
                        .map((source) => (
                            <div key={source.name}>
                                <h4>Target Marketplaces for {source.name}</h4>
                                <ul className="target-list">
                                    {source.targets.length > 0 ? (
                                        source.targets.map((target, index) => (
                                            <li key={index}>{target}</li>
                                        ))
                                    ) : (
                                        <li>No target marketplaces connected yet for this source.</li>
                                    )}
                                </ul>
                                <button
                                    className="add-button"
                                    onClick={() =>
                                        handleAddTarget(source.name, 'New Target Marketplace')
                                    }
                                >
                                    Add Target Marketplace
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Channels;