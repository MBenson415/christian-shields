import React, { useState } from 'react';
import './SubscribeForm.css';

function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [message, setMessage] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/Subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  if (status === 'success') {
    return (
      <div className="subscribe-success">
        <h2>{message}</h2>
        <button onClick={() => setStatus('idle')} className="reset-btn">Subscribe another email</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="subscribe-form">
      <input
        type="email"
        placeholder="ENTER YOUR EMAIL"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="email-input"
      />
      <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'JOINING...' : 'JOIN'}
      </button>
      {status === 'error' && <p className="error-message">{message}</p>}
    </form>
  );
}

export default SubscribeForm;
