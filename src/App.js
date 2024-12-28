import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Login from './components/Login';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Manage login state

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/admin-dashboard"
                    element={<AdminDashboard setIsLoggedIn={setIsLoggedIn} />}
                />
                <Route
                    path="/client-dashboard"
                    element={<ClientDashboard setIsLoggedIn={setIsLoggedIn} />}
                />
                <Route
                    path="/login"
                    element={<Login setLoggedIn={setIsLoggedIn} />}
                />
                <Route path="*" element={<Login setLoggedIn={setIsLoggedIn} />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;