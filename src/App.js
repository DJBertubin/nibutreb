import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        console.log('Token:', token); // Debug log
        console.log('Role:', savedRole); // Debug log
        if (token && savedRole) {
            setIsLoggedIn(true);
            setRole(savedRole);
        }
    }, []);

    return (
        <Router>
            <Routes>
                {/* Login Page */}
                <Route
                    path="/login"
                    element={
                        isLoggedIn ? (
                            role === 'admin' ? (
                                <Navigate to="/admin-dashboard" />
                            ) : (
                                <Navigate to="/client-dashboard" />
                            )
                        ) : (
                            <Login setLoggedIn={setIsLoggedIn} setRole={setRole} />
                        )
                    }
                />
                {/* Admin Dashboard */}
                <Route
                    path="/admin-dashboard"
                    element={
                        isLoggedIn && role === 'admin' ? (
                            <AdminDashboard setIsLoggedIn={setIsLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Client Dashboard */}
                <Route
                    path="/client-dashboard"
                    element={
                        isLoggedIn && role === 'client' ? (
                            <ClientDashboard setIsLoggedIn={setIsLoggedIn} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Catch-All Redirect */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;