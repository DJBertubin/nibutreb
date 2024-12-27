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

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Login failed');
            }

            const { token } = await response.json();
            localStorage.setItem('token', token);
            setLoggedIn(true);
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
            />
            <input
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;