import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Logout.css'; // Optional: Separate CSS for styling

const Logout = ({ setLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        // Update state if provided
        if (typeof setLoggedIn === 'function') {
            setLoggedIn(false);
        }

        // Navigate to login page
        navigate('/login');
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
};

export default Logout;