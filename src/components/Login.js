import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Function to handle login
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(''); // Clear previous error messages
        setLoading(true); // Set loading state to true while processing

        try {
            // Validate inputs before sending request
            if (!username || !password) {
                throw new Error('Please enter both username and password.');
            }

            console.log('Sending login request...');

            // Make the API request to the backend login endpoint
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include', // Ensure credentials like cookies are included
            });

            // Handle non-200 responses
            if (!response.ok) {
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    console.error('Login Error:', errorData);
                    throw new Error(errorData.error || 'Login failed');
                } else {
                    throw new Error('An unexpected error occurred. Please try again.');
                }
            }

            // Parse the response JSON
            const data = await response.json();
            console.log('Login Successful:', data);

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
            console.error('Error during login:', err);
            // Set error message to be displayed in the UI
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            // Reset loading state
            setLoading(false);
        }
    };

    // Function to navigate to the signup page
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

                {/* Form to handle input and submit */}
                <form onSubmit={handleLogin}>
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
                    <button className="login-button" type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

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