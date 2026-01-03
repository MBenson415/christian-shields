import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tour from './pages/Tour';
import Store from './pages/Store';
import Success from './pages/Success';
import Subscribe from './pages/Subscribe';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tour" element={<Tour />} />
            <Route path="/store" element={<Store />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/success" element={<Success />} />
            {/* Add other routes as placeholders */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
