import React, { useState } from 'react';

const Login = ({ setLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const rawBody = await response.text(); // Read raw response
            let data;

            try {
                data = JSON.parse(rawBody); // Parse JSON
            } catch (err) {
                throw new Error('Unexpected response from server: ' + rawBody);
            }

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            console.log('Logged in as:', data.role);
            setLoggedIn(true);
        } catch (err) {
            console.error('Login Error:', err.message);
            setError(err.message);
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