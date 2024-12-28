import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProductList from '../components/ProductList';

const ClientDashboard = ({ setIsLoggedIn }) => {
    const [productData, setProductData] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <Sidebar userType="Client" onLogout={handleLogout} />
            <div className="main-content">
                <div className="header">
                    <h1>Client Dashboard</h1>
                </div>
                <div className="content">
                    <h2 className="section-title">Your Products</h2>
                    <div className="products-table">
                        <ProductList products={productData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;