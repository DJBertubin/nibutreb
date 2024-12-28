import React from 'react';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar userType="Admin" />
            <div
                style={{
                    marginLeft: '200px',
                    padding: '20px',
                    flexGrow: 1,
                }}
            >
                <h1>Welcome, Admin!</h1>
            </div>
        </div>
    );
};

export default AdminDashboard;