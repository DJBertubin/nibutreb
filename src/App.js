import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/ProductDashboard';
import Login from './components/Login';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Login />} /> {/* Default route */}
            </Routes>
        </BrowserRouter>
    );
};

export default App;