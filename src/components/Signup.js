import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Import the CSS file for Signup styling

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Signup failed');
            }

            // Redirect to login page on successful signup
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h1 className="signup-title">Sign Up</h1>
                {error && <p className="error-message">{error}</p>}
                <div className="input-group">
                    <input
                        type="text"
                        className="signup-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        className="signup-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        className="signup-input"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button className="signup-button" onClick={handleSignup}>
                    Sign Up
                </button>
                <p className="login-link">
                    Already have an account?{' '}
                    <span
                        className="login-link-action"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Signup;