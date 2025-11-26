/**
 * App Component
 * Strict Mode: Dashboard is inaccessible until email is verified.
 */
import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import './App.css';

function App() {
  // UI State
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Data State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState(null);
  const [protectedData, setProtectedData] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return; // Stop the function here
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      const msg = error.message.replace('Firebase: ', '').replace('auth/', '');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // FIX: Use auth.currentUser here too
      await sendEmailVerification(auth.currentUser);
      setMessage('New verification email sent.');
    } catch (error) {
      setError('Please wait a few minutes before trying again.');
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    setLoading(true);
    setError('');
    try {
        // FIX: Always call reload on the official auth instance, 
        // not the 'user' state variable which might be a copy.
        await auth.currentUser.reload(); 
        
        // We still need to update state to trigger the UI refresh
        setUser({ ...auth.currentUser }); 
        
        // Check the official auth instance for the new status
        if (auth.currentUser.emailVerified) {
            setMessage('Email verified! Unlocking dashboard...');
        } else {
            setError('Email is not verified yet. Please check your inbox.');
        }
    } catch (err) {
        console.error("Verification check failed:", err);
        setError('Error checking status. Try refreshing the page.');
    } finally {
        setLoading(false);
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setMessage('');
    setConfirmPassword(''); // This clears the new field when switching
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProtectedData('');
      setEmail('');
      setPassword('');
      setMessage('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchProtectedData = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get('/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProtectedData(response.data.message);
    } catch (error) {
      setError('Failed to fetch protected data');
    } finally {
        setLoading(false);
    }
  };

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/public');
      setProtectedData(response.data.message);
    } catch (error) {
      setError('Failed to fetch public data');
    } finally {
        setLoading(false);
    }
  };

  // --- RENDER LOGIC ---

  // 1. Loading State
  // (Optional: You can add a full screen loader here if you want)

  // 2. Not Logged In -> Show Login/Signup
  if (!user) {
    return (
      <div className="app-container">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        
        <div className="auth-card fade-in">
          <div className="auth-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Enter your details to sign in' : 'Start your journey with us'}</p>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {message && <div className="success-banner">{message}</div>}
          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="input-group">
              <label>Email Address</label> 
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            {!isLogin && (
              <div className="input-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={toggleAuthMode} className="link-text">
                {isLogin ? 'Sign up' : 'Log in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Logged In BUT Not Verified -> Show Verification Lock Screen
  if (!user.emailVerified) {
    return (
      <div className="app-container">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>

        <div className="auth-card fade-in" style={{textAlign: 'center'}}>
          <div className="auth-header">
            <div className="icon-lock">🔒</div>
            <h1>Verify Your Email</h1>
            <p>We've sent a verification link to:</p>
            <p><strong>{user.email}</strong></p>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {message && <div className="success-banner">{message}</div>}

          <div className="verification-actions">
            <button onClick={checkVerificationStatus} className="btn-primary" disabled={loading}>
                {loading ? 'Checking...' : 'I Have Verified It'}
            </button>
            
            <button onClick={handleResendVerification} className="btn-secondary" disabled={loading}>
                Resend Email
            </button>
          </div>

          <div className="auth-footer">
             <button onClick={handleLogout} className="btn-link">Wrong email? Log Out</button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Logged In AND Verified -> Show Dashboard
  return (
    <div className="app-container">
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>

      <div className="dashboard-card fade-in">
        <div className="dashboard-header">
          <div className="user-avatar">{user.email[0].toUpperCase()}</div>
          <div>
              <h2>Dashboard</h2>
              <p className="user-email">{user.email}</p>
              <span className="badge-verified">Verified ✓</span>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="action-grid">
              <div className="card-action">
                  <h3>Public API</h3>
                  <button onClick={fetchPublicData} className="btn-secondary">Fetch Public</button>
              </div>
              <div className="card-action">
                  <h3>Private API</h3>
                  <button onClick={fetchProtectedData} className="btn-primary">Fetch Protected</button>
              </div>
          </div>
          
          {loading && <div className="loader">Loading...</div>}
          {protectedData && (
            <div className="response-box">
              <h4>Server Response:</h4>
              <pre>{protectedData}</pre>
            </div>
          )}
        </div>
        
        <button onClick={handleLogout} className="btn-logout">Log Out</button>
      </div>
    </div>
  );
}

export default App;