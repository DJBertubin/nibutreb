import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Added loading state
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError(''); // Clear previous error messages
        setLoading(true); // Set loading state to true while processing

        console.log('Login attempt:', { username, password });

        try {
            // Validate inputs before sending request
            if (!username || !password) {
                throw new Error('Please enter both username and password.');
            }

            console.log('Sending request to /api/auth/login...');

            const apiBaseUrl =
                process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

            // Make the API request to the backend login endpoint
            const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const contentType = response.headers.get('Content-Type');
                let errorMessage = 'An unexpected error occurred. Please try again.';
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || 'Login failed. Please check your credentials.';
                }
                console.error('Error response:', errorMessage);
                throw new Error(errorMessage);
            }

            // Parse the response JSON
            const data = await response.json();
            console.log('Login successful:', data);

            // Save authentication details in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('clientId', data.clientId); // Save the clientId from server response

            // Call the setLoggedIn callback to update the app state
            if (typeof setLoggedIn === 'function') {
                setLoggedIn(true);
            }

            // Navigate based on the user's role
            if (data.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (data.role === 'client') {
                navigate('/client-dashboard');
            }
        } catch (err) {
            console.error('Error during login:', err.message);
            // Set error message to be displayed in the UI
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            // Reset loading state
            setLoading(false);
        }
    };

    const handleSignup = () => {
        navigate('/signup'); // Navigate to the signup page
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Login</h1>
                {/* Display error message if it exists */}
                {error && <p className="error-message">{error}</p>}
                {/* Display loading message while login request is being processed */}
                {loading && <p className="loading-message">Logging in...</p>}
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
                <button className="login-button" onClick={handleLogin} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
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