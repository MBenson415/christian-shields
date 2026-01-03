import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="social-links">
        <a href="https://www.facebook.com/ChristianShieldslive/" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="http://www.x.com/cshieldslive" target="_blank" rel="noopener noreferrer">X</a>
        <a href="http://www.tiktok.com/@christianshieldslive" target="_blank" rel="noopener noreferrer">TikTok</a>
        <a href="http://www.instagram.com/christianshieldslive/" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://www.youtube.com/christianshields" target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href="https://open.spotify.com/artist/6qQ5vFpVQMLMiBWUlszpOU?si=mZVKwm7iRoK6TI5QCSpqFA" target="_blank" rel="noopener noreferrer">Spotify</a>
        <a href="https://music.apple.com/us/artist/christian-shields/1477876294" target="_blank" rel="noopener noreferrer">iTunes</a>
      </div>
      <div className="copyright">
        &copy; {new Date().getFullYear()} Christian Shields
      </div>
    </footer>
  );
}

export default Footer;
