import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <h2>PAGE NOT FOUND</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="home-link">RETURN HOME</Link>
    </div>
  );
}

export default NotFound;
