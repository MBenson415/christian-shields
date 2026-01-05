import React from 'react';
import TourDates from '../components/TourDates';
import SubscribeForm from '../components/SubscribeForm';
import './Home.css';

function Home() {
  return (
    <div className="home">
      
      <div className="hero-image-container">
        <img src="https://squarespacemusic.blob.core.windows.net/$web/full%20band.png" alt="Christian Shields Full Band" className="hero-img" />
      </div>

      <section className="upcoming-shows">
        <h1>UPCOMING SHOWS</h1>
        <TourDates />
      </section>

      <section className="join-nation">
        <h1>JOIN SHIELDS NATION!</h1>
        <p>Sign up with you email address to receive news and updates!</p>
        <SubscribeForm />
      </section>
    </div>
  );
}

export default Home;
