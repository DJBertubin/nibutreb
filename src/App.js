import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ProductDashboard from './pages/ProductDashboard';
import Login from './components/Login';
import SignupPage from './components/SignupPage'; // Corrected import

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/products" element={<ProductDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignupPage />} /> {/* Updated route */}
                <Route path="*" element={<Login />} /> {/* Default route */}
            </Routes>
        </BrowserRouter>
    );
};

export default App;