import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import './App.css';

function App() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Logged-in user
  const [user, setUser] = useState(null);

  // Loading + error handling
  const [loading, setLoading] = useState(false);
  const [protectedData, setProtectedData] = useState('');
  const [error, setError] = useState('');

  // Listen for authentication state changes (auto-login/out)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe(); // Clean up listener
  }, []);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProtectedData('');
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch API route that requires authentication
  const fetchProtectedData = async () => {
    try {
      // Get Firebase JWT token
      const token = await auth.currentUser.getIdToken();

      const response = await axios.get('/api/protected', {
        headers: {
          Authorization: `Bearer ${token}` // Send token to server
        }
      });

      setProtectedData(response.data.message);
    } catch (error) {
      setError('Failed to fetch protected data');
    }
  };

  // Fetch non-protected API route
  const fetchPublicData = async () => {
    try {
      const response = await axios.get('/api/public');
      setProtectedData(response.data.message);
    } catch (error) {
      setError('Failed to fetch public data');
    }
  };

  // Loading indicator
  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Login System</h1>
      
      {/* Error message */}
      {error && <div className="error">{error}</div>}
      
      {/* If no user, show login/signup form */}
      {!user ? (
        <div className="auth-form">
          <h2>Login / Signup</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="button-group">
              {/* Login button */}
              <button type="submit" onClick={handleLogin}>
                Login
              </button>

              {/* Signup button */}
              <button type="button" onClick={handleSignup}>
                Sign Up
              </button>
            </div>
          </form>
        </div>
      ) : (
        // If user is logged in, show dashboard
        <div className="dashboard">
          <h2>Welcome, {user.email}!</h2>

          <div className="button-group">
            <button onClick={fetchProtectedData}>
              Get Protected Data
            </button>

            <button onClick={fetchPublicData}>
              Get Public Data
            </button>

            <button onClick={handleLogout} className="logout">
              Logout
            </button>
          </div>

          {/* Display response from backend */}
          {protectedData && (
            <div className="data-display">
              <h3>Server Response:</h3>
              <p>{protectedData}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
