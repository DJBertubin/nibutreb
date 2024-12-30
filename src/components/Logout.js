import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('clientId'); // Clear clientId

            // Update state if provided
            if (typeof setLoggedIn === 'function') {
                setLoggedIn(false);
            }

            // Navigate to login page
            navigate('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="logout-button"
            aria-label="Logout"
        >
            Logout
        </button>
    );
};

export default Logout;