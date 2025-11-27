// Import required libraries and Firebase authentication methods
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
  // State variables for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Stores the currently logged-in user
  const [user, setUser] = useState(null);

  // Loading state for async operations
  const [loading, setLoading] = useState(false);

  // Stores data returned from backend endpoints
  const [protectedData, setProtectedData] = useState('');

  // Stores any errors to display to the user
  const [error, setError] = useState('');

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
   
      setUser(user);
    });

   
    return () => unsubscribe();
  }, []);

  
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProtectedData(''); 
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch API route that requires Firebase authentication (protected)
  const fetchProtectedData = async () => {
    try {
      // Get Firebase ID token of logged-in user
      const token = await auth.currentUser.getIdToken();

      // Send token to backend for verification
      const response = await axios.get('/api/protected', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      
      setProtectedData(response.data.message);
    } catch (error) {
      setError('Failed to fetch protected data');
    }
  };

  // Fetch public API route (no authentication required)
  const fetchPublicData = async () => {
    try {
      const response = await axios.get('/api/public');
      setProtectedData(response.data.message);
    } catch (error) {
      setError('Failed to fetch public data');
    }
  };

  // Display loading screen while processing authentication
  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Login System</h1>
      
      {/* Display error messages */}
      {error && <div className="error">{error}</div>}
      
      {/* If no user is logged in, show login/signup form */}
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
              {/* Button triggers login */}
              <button type="submit" onClick={handleLogin}>
                Login
              </button>

              {/* Button triggers signup */}
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
            {/* Fetch data requiring authentication */}
            <button onClick={fetchProtectedData}>
              Get Protected Data
            </button>

            {/* Fetch public data */}
            <button onClick={fetchPublicData}>
              Get Public Data
            </button>

            {/* Logout button */}
            <button onClick={handleLogout} className="logout">
              Logout
            </button>
          </div>

          {/* Display response from server */}
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
