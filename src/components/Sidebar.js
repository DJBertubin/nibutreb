import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('User');
    const [clientId, setClientId] = useState('');
    const [role, setRole] = useState('client');

    useEffect(() => {
        const fetchClientInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Unauthorized');
                }

                const response = await fetch('http://localhost:5001/api/client/info', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch client info: ${errorText}`);
                }

                const data = await response.json();
                setUsername(data.name || 'User');
                setClientId(data.clientId || '');
                setRole(data.role || 'client');
            } catch (err) {
                console.error('Error fetching client info:', err);
                navigate('/login');
            }
        };

        fetchClientInfo();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
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
            <div className="client-profile">
                <img
                    src="https://via.placeholder.com/50"
                    alt="Client"
                    className="client-image"
                />
                <div className="client-info">
                    <h4 className="client-name">{username}</h4>
                    <p className="client-id">ID: {clientId}</p>
                </div>
            </div>
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