import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    console.log('setLoggedIn:', typeof setLoggedIn === 'function' ? 'Valid function' : setLoggedIn);

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

            const data = await response.json();
            console.log('API Response:', data);

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            if (typeof setLoggedIn === 'function') {
                setLoggedIn(true);
            } else {
                console.error('setLoggedIn is not a function:', setLoggedIn);
            }

            if (data.role === 'admin') {
                console.log('Navigating to Admin Dashboard...');
                navigate('/admin-dashboard');
            } else if (data.role === 'client') {
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