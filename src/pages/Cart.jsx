import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Determine mode: if any item is recurring, use 'subscription', otherwise 'payment'
      const hasRecurring = cart.some(item => item.priceType === 'recurring');
      const mode = hasRecurring ? 'subscription' : 'payment';

      const response = await fetch('/api/CreateCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: cart.map(item => ({
            priceId: item.priceId,
            quantity: item.quantity
          })),
          mode
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      alert('Error initiating checkout: ' + err.message);
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <Link to="/store" className="continue-shopping">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.priceId} className="cart-item">
            {item.productImage && (
              <img src={item.productImage} alt={item.productName} className="cart-item-image" />
            )}
            <div className="cart-item-details">
              <h3>{item.productName}</h3>
              {item.priceNickname && <p className="variant-name">{item.priceNickname}</p>}
              <p className="item-price">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: item.currency,
                }).format(item.unitAmount / 100)}
              </p>
            </div>
            <div className="cart-item-actions">
              <div className="quantity-controls">
                {item.priceType !== 'recurring' && (
                  <button onClick={() => updateQuantity(item.priceId, item.quantity - 1)}>-</button>
                )}
                <span>{item.quantity}</span>
                {item.priceType !== 'recurring' && (
                  <button onClick={() => updateQuantity(item.priceId, item.quantity + 1)}>+</button>
                )}
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.priceId)}>Remove</button>
            </div>
            <div className="item-total">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: item.currency,
              }).format((item.unitAmount * item.quantity) / 100)}
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-total">
          <span>Total:</span>
          <span>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD', // Assuming USD for total, or derive from items
            }).format(cartTotal / 100)}
          </span>
        </div>
        <button 
          className="checkout-btn" 
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}

export default Cart;
