import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = ({ setLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const role = localStorage.getItem('role');
            navigate(role === 'admin' ? '/admin-dashboard' : '/client-dashboard');
        }
    }, [navigate]);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid username or password');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            if (typeof setLoggedIn === 'function') {
                setLoggedIn(true);
            }

            navigate(data.role === 'admin' ? '/admin-dashboard' : '/client-dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Login</h1>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                />
                <button
                    onClick={handleLogin}
                    className="login-button"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p>
                    Don't have an account? <a href="/signup" className="signup-link">Sign Up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;