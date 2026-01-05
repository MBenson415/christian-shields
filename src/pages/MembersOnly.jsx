import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './MembersOnly.css';

function MembersOnly() {
  const { user, login, register, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For registration
  const [isEmailSubscribed, setIsEmailSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInfo('');

    if (isLogin) {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message);
      }
    } else {
      // Form Validation
      if (username.length > 50) {
        setError("Username must be 50 characters or less.");
        return;
      }
      if (username.length < 6) {
        setError("Username must be at least 6 characters long.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      setInfo('Checking for active Stripe subscription...');
      const result = await register(email, password, username, isEmailSubscribed);
      setInfo('');
      if (result.success) {
        setIsLogin(true);
        setSuccess('Registration successful! Please log in.');
        setPassword('');
      } else {
        setError(result.message);
      }
    }
  };

  if (user) {
    return (
      <div className="members-only">
        <div className="members-header">
            <h1>Welcome, {user.name || user.email}!</h1>
            {user.subscription_image && (
                <img src={user.subscription_image} alt="Subscription Tier" className="subscription-badge" />
            )}
        </div>
        <p>You have access to exclusive members-only content.</p>
        {/* Add exclusive content here */}
        <div className="exclusive-content">
            <p>Here is your exclusive content...</p>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    );
  }

  return (
    <div className="members-only">
      <h1>Members Only</h1>
      <div className="auth-container">
        <div className="auth-tabs">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); setInfo(''); }}
          >
            Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); setInfo(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Your Username"
                required
                maxLength={50}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="email@example.com"
            />
            { <small className="form-tip">Use the same email used for your subscription purchase.</small>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="********"
            />
          </div>

          {!isLogin && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={isEmailSubscribed} 
                  onChange={(e) => setIsEmailSubscribed(e.target.checked)} 
                />
                Sign up for news and updates
              </label>
            </div>
          )}
          
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          {info && <div className="auth-info">{info}</div>}
          
          <button type="submit" className="auth-submit">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MembersOnly;
