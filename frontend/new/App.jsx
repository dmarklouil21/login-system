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

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProtectedData(''); 
    } catch (error) {
      setError(error.message);
    }
  };

  
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
