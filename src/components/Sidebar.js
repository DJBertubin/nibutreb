import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userType, username }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <h2>{username}'s Panel</h2> {/* Dynamically show the username */}
            <ul>
                <li>
                    <NavLink to={`/${userType.toLowerCase()}-dashboard`} activeClassName="active">
                        <i className="fas fa-home"></i> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/products" activeClassName="active">
                        <i className="fas fa-box"></i> Products
                    </NavLink>
                </li>
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