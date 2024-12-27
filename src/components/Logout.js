import React from 'react';

const Logout = () => {
    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear JWT token
        window.location.href = '/login';
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;