import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ProductDashboard from './pages/ProductDashboard';
import Login from './components/Login';
import SignupPage from './components/SignupPage';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/products" element={<ProductDashboard />} />
                <Route path="*" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;