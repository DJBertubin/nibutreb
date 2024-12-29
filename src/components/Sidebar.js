import React from 'react';
import { NavLink } from 'react-router-dom';
import Logout from './Logout'; // Import the Logout component
import './Sidebar.css';

const Sidebar = ({ userType, setLoggedIn }) => {
    return (
        <div className="sidebar">
            <h2>{userType} Panel</h2>
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
            </ul>
            <div className="sidebar-footer">
                {/* Use the Logout component */}
                <Logout setLoggedIn={setLoggedIn} />
            </div>
        </div>
    );
};

export default Sidebar;