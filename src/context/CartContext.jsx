import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, priceId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.priceId === priceId);
      if (existingItem) {
        return prevCart.map(item =>
          item.priceId === priceId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Find the price object to store details if needed, or just store basic info
      const price = product.prices.find(p => p.id === priceId);
      return [...prevCart, { 
        productName: product.name,
        productImage: product.images && product.images[0],
        priceId, 
        quantity: 1,
        unitAmount: price.unit_amount,
        currency: price.currency,
        priceNickname: price.nickname, // e.g. "Small", "Large"
        priceType: price.type // 'one_time' or 'recurring'
      }];
    });
  };

  const removeFromCart = (priceId) => {
    setCart(prevCart => prevCart.filter(item => item.priceId !== priceId));
  };

  const updateQuantity = (priceId, quantity) => {
    if (quantity < 1) {
      removeFromCart(priceId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.priceId === priceId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.unitAmount * item.quantity), 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
