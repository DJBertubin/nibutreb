import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div>
            <h1>Client Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default ClientDashboard;