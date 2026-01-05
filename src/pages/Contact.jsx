import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    newsletterSignup: false
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [responseMsg, setResponseMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setResponseMsg('');

    try {
      const res = await fetch('/api/Contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setResponseMsg('Message sent successfully!');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          newsletterSignup: false
        });
      } else {
        setStatus('error');
        setResponseMsg(data.error || 'Failed to send message.');
      }
    } catch (err) {
      setStatus('error');
      setResponseMsg('Network error. Please try again later.');
    }
  };

  return (
    <div className="contact-page">
      <h1>CONTACT</h1>
      <p className="contact-intro">For booking inquiries, press, or just to say hello.</p>

      {status === 'success' ? (
        <div className="contact-success">
          <h2>{responseMsg}</h2>
          <button onClick={() => setStatus('idle')} className="reset-btn">Send another message</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="NAME"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="EMAIL"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="subject"
              placeholder="SUBJECT"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="message"
              placeholder="MESSAGE"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              required
            ></textarea>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="newsletterSignup"
                checked={formData.newsletterSignup}
                onChange={handleChange}
              />
              <span className="checkbox-label">Sign up for news and updates</span>
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'SENDING...' : 'SEND MESSAGE'}
          </button>
          
          {status === 'error' && <p className="error-message">{responseMsg}</p>}
        </form>
      )}
    </div>
  );
}

export default Contact;
