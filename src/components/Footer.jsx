import React from 'react';
import { FaFacebookF, FaTiktok, FaInstagram, FaYoutube, FaSpotify, FaApple } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="social-links">
        <a href="https://www.facebook.com/ChristianShieldslive/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
        <a href="http://www.x.com/cshieldslive" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><FaXTwitter /></a>
        <a href="http://www.tiktok.com/@christianshieldslive" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><FaTiktok /></a>
        <a href="http://www.instagram.com/christianshieldslive/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
        <a href="https://www.youtube.com/christianshields" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
        <a href="https://open.spotify.com/artist/6qQ5vFpVQMLMiBWUlszpOU?si=mZVKwm7iRoK6TI5QCSpqFA" target="_blank" rel="noopener noreferrer" aria-label="Spotify"><FaSpotify /></a>
        <a href="https://music.apple.com/us/artist/christian-shields/1477876294" target="_blank" rel="noopener noreferrer" aria-label="iTunes"><FaApple /></a>
      </div>
      <div className="copyright">
        &copy; {new Date().getFullYear()} Christian Shields
      </div>
    </footer>
  );
}

export default Footer;
