import React from 'react';
import './Sidebar.css';

const Sidebar = ({ userType, onLogout }) => {
    return (
        <div className="sidebar">
            <h2>{userType} Panel</h2>
            <ul className="menu">
                <li><a href="/"><i className="fas fa-home"></i> Dashboard</a></li>
                <li><a href="#"><i className="fas fa-box"></i> Products</a></li>
                <li><a href="#"><i className="fas fa-shopping-cart"></i> Orders</a></li>
                <li><a href="#"><i className="fas fa-link"></i> Channels</a></li>
                <li><a href="#"><i className="fas fa-cog"></i> Settings</a></li>
            </ul>
            <div className="sidebar-footer">
                <button className="logout-button" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;