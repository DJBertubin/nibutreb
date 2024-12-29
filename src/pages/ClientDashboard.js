import React from 'react';
import Sidebar from '../components/Sidebar';

const ClientDashboard = ({ username }) => {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="client" username={username} />
            <div
                style={{
                    marginLeft: '300px',
                    padding: '20px',
                    flexGrow: 1,
                    backgroundColor: '#f9f9f9',
                }}
            >
                <h1>Welcome, {username || 'Client'}!</h1>
            </div>
        </div>
    );
};

export default ClientDashboard;