import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientProfile from '../components/ClientProfile';
import './Channels.css';

const Channels = () => {
    const [sources, setSources] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'addTarget', 'settings'
    const [activeTarget, setActiveTarget] = useState(''); // Walmart, eBay, Amazon
    const [walmartClientId, setWalmartClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Walmart Data
    useEffect(() => {
        const fetchWalmartData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found. Please log in.');

                const response = await fetch('/api/walmart/data', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch Walmart data: ${response.statusText}`);
                }

                const data = await response.json();
                setSources(data.walmartData || []);
                setStatusMessage('');
            } catch (err) {
                console.error('Error fetching Walmart data:', err.message);
                setStatusMessage('Failed to fetch Walmart data. Please try again.');
            }
        };

        fetchWalmartData();
    }, []);

    const handleAddTargetClick = () => {
        setModalType('addTarget');
        setActiveTarget('Walmart');
        setShowModal(true);
    };

    const handleSaveWalmartCredentials = async () => {
        setIsLoading(true);
        setStatusMessage('Connecting to Walmart...');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('User is not authenticated.');

            const response = await fetch('/api/walmart/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    walmartClientId: walmartClientId.trim(),
                    clientSecret: clientSecret.trim(),
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error connecting to Walmart: ${errorText}`);
            }

            const savedData = await response.json();
            setSources((prev) => [...prev, savedData]);
            setStatusMessage('Successfully connected to Walmart!');
            setShowModal(false);
            setWalmartClientId('');
            setClientSecret('');
        } catch (error) {
            console.error('Error connecting to Walmart:', error.message);
            setStatusMessage(`Failed to connect: ${error.message}`);
        } finally {
            setIsLoading(false);
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
                        <button className="add-target-button" onClick={handleAddTargetClick}>
                            Add Target
                        </button>
                        {sources.map((source, index) => (
                            <div key={index} className="source-item">
                                <div className="source-content">
                                    <span className="source-name">Walmart Client ID: {source.walmartClientId}</span>
                                </div>
                                <p className="target-status">User Client ID: {source.clientId}</p>
                            </div>
                        ))}
                    </div>

                    {/* Modal */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Connect to Walmart</h2>
                                {activeTarget === 'Walmart' && (
                                    <>
                                        {statusMessage && <p className="status-message">{statusMessage}</p>}
                                        <label>
                                            Walmart Client ID:
                                            <input
                                                type="text"
                                                value={walmartClientId}
                                                onChange={(e) => setWalmartClientId(e.target.value)}
                                                placeholder="Enter Walmart Client ID"
                                                className="input-field"
                                            />
                                        </label>
                                        <label>
                                            Client Secret:
                                            <input
                                                type="password"
                                                value={clientSecret}
                                                onChange={(e) => setClientSecret(e.target.value)}
                                                placeholder="Enter Walmart Client Secret"
                                                className="input-field"
                                            />
                                        </label>
                                        <button
                                            className="connect-button"
                                            onClick={handleSaveWalmartCredentials}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Connecting...' : 'Connect'}
                                        </button>
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