import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">CHRISTIAN SHIELDS</Link>
      </div>
      <nav>
        <ul>
          <li><Link to="/">HOME</Link></li>
          <li><a href="https://youtube.com/christianshields" target="_blank" rel="noopener noreferrer">VIDEO</a></li>
          <li><Link to="/tour">TOUR</Link></li>
          <li><Link to="/store">STORE</Link></li>
          <li><Link to="/contact">CONTACT</Link></li>
          <li><Link to="/subscribe">SUBSCRIBE</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
