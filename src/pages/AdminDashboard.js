import React from 'react';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar */}
            <Sidebar userType="Admin" />
            
            {/* Main Content */}
            <div
                style={{
                    marginLeft: '300px', // Ensure enough space for the sidebar
                    padding: '20px',
                    flexGrow: 1,
                    backgroundColor: '#f9f9f9', // Optional: Add background for content area
                }}
            >
                <h1>Welcome, Admin!</h1>
            </div>
        </div>
    );
};

export default AdminDashboard;