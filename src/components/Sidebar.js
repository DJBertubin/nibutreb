import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import ClientProfile from './ClientProfile'; // Import ClientProfile

const Sidebar = () => {
    const navigate = useNavigate();
    const [clientInfo, setClientInfo] = useState({ name: '', clientId: '' });
    const [role, setRole] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClientInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('User is not authenticated. Please log in again.');
                }

                const response = await fetch('/api/client/info', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch client information.');
                }

                const data = await response.json();
                setClientInfo({ name: data.name, clientId: data.clientId });
                setRole(data.role || ''); // Set role from API response
            } catch (err) {
                console.error('Error fetching client information:', err.message);
                setError(err.message || 'Error fetching client information.');
            }
        };

        fetchClientInfo();
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
            {error ? (
                <p>{error}</p>
            ) : (
                <ClientProfile
                    name={clientInfo.name || 'Loading...'}
                    clientId={clientInfo.clientId || 'Loading...'}
                    imageUrl="https://via.placeholder.com/100"
                />
            )}
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