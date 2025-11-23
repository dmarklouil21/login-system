/**
 * App Component
 *
 * Purpose:
 * - Provides a basic Firebase Authentication system (Login, Signup, Logout).
 * - Allows users to fetch protected and public API data using JWT tokens.
 *
 * Dependencies:
 * - Firebase Authentication (email/password)
 * - Axios for API requests
 * - React Hooks (useState, useEffect)
 *
 * Main Features:
 * - User signup and login using Firebase.
 * - Fetch public API data without authentication.
 * - Fetch protected API data using Bearer token from Firebase.
 * - Automatically listens for authentication state changes using onAuthStateChanged.
 *
 * Inputs:
 * - User enters email and password.
 *
 * Outputs:
 * - Displays login/signup UI when no user is logged in.
 * - Displays dashboard with API access when logged in.
 * - Shows server responses, errors, and authentication status.
 *
 * Edge Cases / Limitations:
 * - Fetching protected data assumes a valid Firebase token.
 * - No input validation besides required fields.
 * - Server endpoints must exist at /api/public and /api/protected.
 */

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [protectedData, setProtectedData] = useState('');
  const [error, setError] = useState('');

  /**
   * Listens for authentication state changes.
   * Purpose: Keep track of logged-in user even after refresh.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Logs in an existing user using Firebase email/password authentication.
   * Inputs: email, password from state
   * Output: Authenticated user session or error message
   */
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

  /**
   * Creates a new Firebase user account.
   * Inputs: email, password
   * Output: New user account or error message
   */
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

  /**
   * Logs out the current user.
   * Clears protected data on logout.
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProtectedData('');
    } catch (error) {
      setError(error.message);
    }
  };

  /**
   * Fetches protected API data.
   * Requires: User must be logged in & Firebase token must be valid.
   * Output: Message returned by backend protected endpoint.
   */
  const fetchProtectedData = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
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

  /**
   * Fetches publicly available API data.
   * No authentication required.
   */
  const fetchPublicData = async () => {
    try {
      const response = await axios.get('/api/public');
      setProtectedData(response.data.message);
    } catch (error) {
      setError('Failed to fetch public data');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Login System</h1>
      
      {error && <div className="error">{error}</div>}
      
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
              <button type="submit" onClick={handleLogin}>
                Login
              </button>
              <button type="button" onClick={handleSignup}>
                Sign Up
              </button>
            </div>
          </form>
        </div>
      ) : (
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
