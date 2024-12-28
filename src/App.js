import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ProductDashboard from './pages/ProductDashboard'; // Correct Import
import Login from './components/Login';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/products" element={<ProductDashboard />} /> {/* Correct Route */}
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Login />} /> {/* Default route */}
            </Routes>
        </BrowserRouter>
    );
};

export default App;