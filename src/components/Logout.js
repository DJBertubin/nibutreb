import React from 'react';
import { Auth } from 'aws-amplify';

const Logout = () => {
  const handleLogout = async () => {
    await Auth.signOut();
    window.location.href = '/login';
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
