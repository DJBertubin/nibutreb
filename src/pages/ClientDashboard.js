import React from 'react';
import Sidebar from '../components/Sidebar';

const ClientDashboard = () => {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar */}
            <Sidebar userType="Client" />
            
            {/* Main Content */}
            <div
                style={{
                    marginLeft: '300px', // Ensure enough space for the sidebar
                    padding: '20px',
                    flexGrow: 1,
                    backgroundColor: '#f9f9f9', // Optional: Add background for content area
                }}
            >
                <h1>Welcome, Client!</h1>
            </div>
        </div>
    );
};

export default ClientDashboard;