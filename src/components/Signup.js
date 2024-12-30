import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
    const [name, setName] = useState(''); // Add name state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('client'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async () => {
        setError('');
        setLoading(true);

        // Input validation
        if (!name.trim()) {
            setError('Name is required.');
            setLoading(false);
            return;
        }
        if (!username.trim()) {
            setError('Username is required.');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            setLoading(false);
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long!');
            setLoading(false);
            return;
        }
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            setError('Password must include at least one uppercase letter and one number!');
            setLoading(false);
            return;
        }
        if (!['client', 'admin'].includes(role)) {
            setError('Invalid role selected.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(), // Send name
                    username: username.trim(),
                    password,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Signup failed. Please try again later.');
                setLoading(false);
                return;
            }

            console.log('Generated Client ID:', data.clientId); // Log client ID for debugging
            localStorage.setItem('clientId', data.clientId); // Save clientId locally

            navigate('/login');
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
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
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        className="signup-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        className="signup-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        className="signup-input"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="input-group">
                    <select
                        className="signup-input"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={loading}
                    >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button
                    className="signup-button"
                    onClick={handleSignup}
                    disabled={loading}
                >
                    {loading ? 'Signing Up...' : 'Sign Up'}
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