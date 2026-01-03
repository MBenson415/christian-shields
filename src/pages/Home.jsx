import React from 'react';
import TourDates from '../components/TourDates';
import SubscribeForm from '../components/SubscribeForm';
import './Home.css';

function Home() {
  return (
    <div className="home">
      
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
