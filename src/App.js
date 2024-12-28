import React, { useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null); // Tracks the role (admin/client)

    return (
        <div>
            {!isLoggedIn ? (
                <Login setLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
            ) : userRole === 'admin' ? (
                <AdminDashboard />
            ) : (
                <ClientDashboard />
            )}
        </div>
    );
}

export default App;