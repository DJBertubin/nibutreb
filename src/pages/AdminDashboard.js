import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default AdminDashboard;