import React, { useState } from 'react';
import { Auth } from 'aws-amplify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const user = await Auth.signIn(username, password);
      const role = user.attributes['custom:role'];
      window.location.href = role === 'admin' ? '/admin-dashboard' : '/client-dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
