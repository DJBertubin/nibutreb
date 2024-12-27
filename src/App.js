import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import Login from './components/Login';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={loggedIn ? <Navigate to="/admin-dashboard" /> : <Login setLoggedIn={setLoggedIn} />} />
                <Route path="/admin-dashboard" element={loggedIn ? <AdminDashboard /> : <Navigate to="/login" />} />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
