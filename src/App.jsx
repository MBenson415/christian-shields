import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import TheBand from './pages/TheBand';
import Tour from './pages/Tour';
import Store from './pages/Store';
import Cart from './pages/Cart';
import MembersOnly from './pages/MembersOnly';
import Success from './pages/Success';
import Subscribe from './pages/Subscribe';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/the-band" element={<TheBand />} />
                <Route path="/tour" element={<Tour />} />
                <Route path="/store" element={<Store />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/members-only" element={<MembersOnly />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/success" element={<Success />} />
                {/* Add other routes as placeholders */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}



export default App;
