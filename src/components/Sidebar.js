import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    // Fetch username and role from localStorage
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        setUsername(storedUsername || 'User'); // Default to "User" if not set
        setRole(storedRole || ''); // Default to empty if not set
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const adminLinks = (
        <ul>
            <li>
                <NavLink to="/admin-dashboard" activeClassName="active">
                    <i className="fas fa-home"></i> Dashboard
                </NavLink>
            </li>
            <li>
                <NavLink to="/products" activeClassName="active">
                    <i className="fas fa-box"></i> Products
                </NavLink>
            </li>
            <li>
                <NavLink to="/admin-reports" activeClassName="active">
                    <i className="fas fa-chart-bar"></i> Reports
                </NavLink>
            </li>
        </ul>
    );

    const clientLinks = (
        <ul>
            <li>
                <NavLink to="/client-dashboard" activeClassName="active">
                    <i className="fas fa-home"></i> Dashboard
                </NavLink>
            </li>
            <li>
                <NavLink to="/products" activeClassName="active">
                    <i className="fas fa-box"></i> Products
                </NavLink>
            </li>
        </ul>
    );

    return (
        <div className="sidebar">
            {/* Dynamically Display Username */}
            <h2>{username ? `${username}'s Panel` : 'User Panel'}</h2>
            
            {/* Display Role-Specific Links */}
            {role === 'admin' ? adminLinks : clientLinks}
            
            <div className="sidebar-footer">
                <button className="logout-button" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;