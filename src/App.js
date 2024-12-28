import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Login from './components/Login';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/client-dashboard" element={<ClientDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Login />} /> {/* Default route */}
            </Routes>
        </BrowserRouter>
    );
};

export default App;