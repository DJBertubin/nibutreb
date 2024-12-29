import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ProductDashboard from './pages/ProductDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

const App = () => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [role, setRole] = useState(null);

    // Fetch user role and login status from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        if (token && userRole) {
            setLoggedIn(true);
            setRole(userRole);
        } else {
            setLoggedIn(false);
            setRole(null);
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Authenticated Routes */}
                {isLoggedIn && role === 'admin' && (
                    <>
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/products" element={<ProductDashboard />} />
                        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
                    </>
                )}

                {isLoggedIn && role === 'client' && (
                    <>
                        <Route path="/client-dashboard" element={<ClientDashboard />} />
                        <Route path="/products" element={<ProductDashboard />} />
                        <Route path="*" element={<Navigate to="/client-dashboard" replace />} />
                    </>
                )}

                {/* Public Routes */}
                {!isLoggedIn && (
                    <>
                        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                )}
            </Routes>
        </BrowserRouter>
    );
};

export default App;