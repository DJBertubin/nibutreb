import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        setUsername(storedUsername || 'User'); // Fallback to "User"
        setRole(storedRole || ''); // Fallback to empty
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const commonLinks = (
        <>
            <li>
                <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <i className="fas fa-box"></i> Products
                </NavLink>
            </li>
            <li>
                <NavLink to="/channels" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <i className="fas fa-network-wired"></i> Channels
                </NavLink>
            </li>
        </>
    );

    const adminLinks = (
        <>
            <li>
                <NavLink to="/admin-dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <i className="fas fa-home"></i> Dashboard
                </NavLink>
            </li>
            <li>
                <NavLink to="/admin-reports" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <i className="fas fa-chart-bar"></i> Reports
                </NavLink>
            </li>
            {commonLinks}
        </>
    );

    const clientLinks = (
        <>
            <li>
                <NavLink to="/client-dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <i className="fas fa-home"></i> Dashboard
                </NavLink>
            </li>
            {commonLinks}
        </>
    );

    return (
        <div className="sidebar">
            <h2>{username ? `${username}'s Panel` : 'User Panel'}</h2>
            <ul>
                {role === 'admin' ? adminLinks : clientLinks}
            </ul>
            <div className="sidebar-footer">
                <button className="logout-button" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;