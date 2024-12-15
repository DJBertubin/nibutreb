import React from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import ProductList from '../components/ProductList';

const ClientDashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar userType="Client" />
      <div className="main-content">
        <DashboardHeader title="Welcome, Client" />
        <div className="content">
          <h2>Your Products</h2>
          <ProductList />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
