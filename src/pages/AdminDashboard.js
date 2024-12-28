const handleLogin = async () => {
    setError('');
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const { token, role } = await response.json();

        // Save token and role to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);

        // Call the prop passed to Login component
        if (setLoggedIn) {
            setLoggedIn(true); // Ensure setLoggedIn is a function
        }

        // Navigate to the appropriate dashboard
        if (role === 'admin') {
            navigate('/admin-dashboard');
        } else if (role === 'client') {
            navigate('/client-dashboard');
        }
    } catch (err) {
        setError(err.message);
    }
};