import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import ProductDashboard from './pages/ProductDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

const App = () => {
    const [isLoggedIn, setLoggedIn] = useState(false); // Tracks login status

    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Pages */}
                <Route
                    path="/login"
                    element={
                        isLoggedIn ? (
                            <Navigate to="/admin-dashboard" replace />
                        ) : (
                            <Login setLoggedIn={setLoggedIn} />
                        )
                    }
                />
                <Route
                    path="/signup"
                    element={
                        isLoggedIn ? (
                            <Navigate to="/admin-dashboard" replace />
                        ) : (
                            <Signup />
                        )
                    }
                />

                {/* Dashboard Pages */}
                <Route
                    path="/admin-dashboard"
                    element={
                        isLoggedIn ? (
                            <>
                                <Sidebar />
                                <div className="dashboard-container">
                                    <AdminDashboard />
                                </div>
                            </>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="/products"
                    element={
                        isLoggedIn ? (
                            <>
                                <Sidebar />
                                <div className="dashboard-container">
                                    <ProductDashboard />
                                </div>
                            </>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Catch-All Redirect */}
                <Route
                    path="*"
                    element={
                        isLoggedIn ? (
                            <Navigate to="/admin-dashboard" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;