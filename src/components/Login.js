import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

            // Save authentication details in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', username); // Save the entered username

            if (typeof setLoggedIn === 'function') {
                setLoggedIn(true);
            }

            // Navigate based on role
            if (data.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (data.role === 'client') {
                navigate('/client-dashboard');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSignup = () => {
        navigate('/signup'); // Navigate to the signup page
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Login</h1>
                {error && <p className="error-message">{error}</p>}
                <div className="input-group">
                    <input
                        type="text"
                        className="login-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        className="login-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="login-button" onClick={handleLogin}>
                    Login
                </button>
                <p className="signup-link">
                    Don't have an account?{' '}
                    <span className="signup-link-action" onClick={handleSignup}>
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;