import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>CHRISTIAN SHIELDS</h1>
      </section>
      
      <section className="upcoming-shows">
        <h2>UPCOMING SHOWS</h2>
        <p>There are no upcoming tour dates.</p>
      </section>

      <section className="subscribe">
        <h2>SUBSCRIBE</h2>
        <p>Sign up with your email address to receive news and updates!</p>
        <button className="btn">SIGN UP</button>
      </section>

      <section className="join-nation">
        <h1>JOIN SHIELDS NATION!</h1>
        <p>Sign up with you email address to receive news and updates!</p>
        <button className="btn">Subscribe</button>
      </section>
    </div>
  );
}

export default Home;
