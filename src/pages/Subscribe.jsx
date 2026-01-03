import React from 'react';
import SubscribeForm from '../components/SubscribeForm';
import './Subscribe.css';

function Subscribe() {
  return (
    <div className="subscribe-page">
      <h1>SUBSCRIBE</h1>
      <p className="subscribe-text">Join the mailing list for updates, new music, and exclusive content.</p>
      <SubscribeForm />
    </div>
  );
}

export default Subscribe;
