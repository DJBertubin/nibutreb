import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Login from './components/Login';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/admin-dashboard"
                    element={isLoggedIn ? <AdminDashboard setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/client-dashboard"
                    element={isLoggedIn ? <ClientDashboard setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/login"
                    element={<Login setLoggedIn={setIsLoggedIn} />}
                />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;