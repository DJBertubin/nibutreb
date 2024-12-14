

import React from 'react';
import './DashboardHeader.css';

const DashboardHeader = ({ title }) => {
  return (
    <header className="dashboard-header">
      <h1>{title}</h1>
    </header>
  );
};

export default DashboardHeader;