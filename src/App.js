import React, { useState } from 'react';
import Login from './components/Login';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div>
            {!isLoggedIn ? (
                <Login setLoggedIn={setIsLoggedIn} />
            ) : (
                <div>Welcome to the Dashboard</div>
            )}
        </div>
    );
}

export default App;