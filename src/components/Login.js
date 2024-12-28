import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else if (role === 'client') {
                navigate('/client-dashboard');
            }
        }
    }, [navigate]);

    const handleLogin = async () => {
        setError('');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const { token, role } = await response.json();
            console.log('API Response:', { token, role });

            // Save token and role to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            // Set logged-in state
            if (typeof setLoggedIn === 'function') {
                setLoggedIn(true);
            } else {
                console.error('setLoggedIn is not a function:', setLoggedIn);
            }

            // Navigate based on role
            if (role === 'admin') {
                console.log('Navigating to Admin Dashboard...');
                navigate('/admin-dashboard');
            } else if (role === 'client') {
                console.log('Navigating to Client Dashboard...');
                navigate('/client-dashboard');
            }
        } catch (err) {
            setError(err.message);
            console.error('Login Error:', err.message);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;