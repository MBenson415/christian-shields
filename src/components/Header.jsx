import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

function Header() {
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="https://squarespacemusic.blob.core.windows.net/$web/christianshields.png" alt="Christian Shields" className="logo-image" />
        </Link>
      </div>
      
      <div className="hamburger" onClick={toggleMenu}>
        <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
      </div>

      <nav className={isMenuOpen ? 'nav-open' : ''}>
        <ul>
          <li className="dropdown">
            <span className="dropdown-trigger">MUSIC</span>
            <div className="dropdown-content">
              <a href="https://open.spotify.com/artist/6qQ5vFpVQMLMiBWUlszpOU?si=8tW3-gcgQRyZZdur5Eigkw&nd=1&dlsi=77016cc1471f4f70" target="_blank" rel="noopener noreferrer">Spotify</a>
              <a href="https://music.apple.com/us/artist/christian-shields/1477876294" target="_blank" rel="noopener noreferrer">Apple Music</a>
              <a href="https://geo.music.apple.com/us/artist/christian-shields/1477876294?app=itunes&ls=1" target="_blank" rel="noopener noreferrer">iTunes</a>
              <a href="https://music.youtube.com/channel/UC9lcOS0XI6sBQAIfARIMC6g" target="_blank" rel="noopener noreferrer">YouTube Music</a>
              <a href="https://music.amazon.com/artists/B0026DTN98/christian-shields?ref=dm_ff_featurefm&tag=featurefm-20" target="_blank" rel="noopener noreferrer">Amazon Music</a>
              <a href="https://www.pandora.com/artist/christian-shields/AR3Prg6ptZ79w5Z" target="_blank" rel="noopener noreferrer">Pandora</a>
              <a href="https://tidal.com/browse/artist/16875885" target="_blank" rel="noopener noreferrer">Tidal</a>
              <a href="https://www.deezer.com/us/artist/74423922" target="_blank" rel="noopener noreferrer">Deezer</a>
              <a href="https://www.iheart.com/artist/74423922" target="_blank" rel="noopener noreferrer">IHeart Radio</a>
            </div>
          </li>
          <li><a href="https://youtube.com/christianshields" target="_blank" rel="noopener noreferrer">VIDEO</a></li>
          <li><Link to="/the-band">THE BAND</Link></li>
          <li><Link to="/tour">TOUR</Link></li>
          <li><Link to="/subscribe">SUBSCRIBE</Link></li>
          <li><Link to="/contact">CONTACT</Link></li>
          <li><Link to="/store">STORE</Link></li>
          <li><Link to="/cart">CART ({cartCount})</Link></li>
          <li><Link to="/members-only">MEMBERS</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
