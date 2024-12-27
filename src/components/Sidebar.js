

import React from 'react';
import './Sidebar.css';

const Sidebar = ({ userType }) => {
  return (
    <div className="sidebar">
      <h2>{userType} Panel</h2>
      <ul>
        <li><a href="/"><i className="fas fa-home"></i>Dashboard</a></li>
        <li><a href="#"><i className="fas fa-box"></i>Products</a></li>
        <li><a href="#"><i className="fas fa-shopping-cart"></i>Orders</a></li>
        <li><a href="#"><i className="fas fa-link"></i>Channels</a></li>
        <li><a href="#"><i className="fas fa-cog"></i>Settings</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;