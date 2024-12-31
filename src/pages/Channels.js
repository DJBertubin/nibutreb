import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const Channels = () => {
    const [sources, setSources] = useState([
        {
            name: 'gemshow7',
            icon: 'https://via.placeholder.com/50', // Replace with actual icon URL
            marketplaces: [
                {
                    name: 'Amazon US',
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', // Replace with actual icon URL
                    status: 'active',
                },
                {
                    name: 'Etsy',
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Etsy_logo.svg', // Replace with actual icon URL
                    status: 'active',
                },
                {
                    name: 'Walmart',
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Walmart_logo.svg', // Replace with actual icon URL
                    status: 'beta',
                },
            ],
        },
    ]);

    const handleAddSource = () => {
        // Logic for adding a new source (e.g., modal for user input)
        console.log('Add Source');
    };

    const handleAddTarget = () => {
        // Logic for adding a new target marketplace
        console.log('Add Target Marketplace');
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="Admin" />
            <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
                <h1 style={{ marginBottom: '20px' }}>Channels</h1>
                <div className="channels-container" style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                    <h2 style={{ marginBottom: '10px' }}>Source Platforms</h2>
                    {sources.map((source, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <img src={source.icon} alt={source.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                                <h3 style={{ margin: 0 }}>{source.name}</h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {source.marketplaces.map((marketplace, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            minWidth: '120px',
                                            backgroundColor: '#fff',
                                        }}
                                    >
                                        <img
                                            src={marketplace.icon}
                                            alt={marketplace.name}
                                            style={{ width: '40px', height: '40px', marginBottom: '10px' }}
                                        />
                                        <span>{marketplace.name}</span>
                                        <button
                                            style={{
                                                marginTop: '10px',
                                                padding: '5px 10px',
                                                fontSize: '14px',
                                                borderRadius: '4px',
                                                backgroundColor: '#007bff',
                                                color: '#fff',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {marketplace.status === 'active' ? 'Status: Active' : 'Status: Beta'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={handleAddSource}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        + Add Source
                    </button>
                    <button
                        onClick={handleAddTarget}
                        style={{
                            marginTop: '20px',
                            marginLeft: '20px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        + Add Target Marketplace
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Channels;