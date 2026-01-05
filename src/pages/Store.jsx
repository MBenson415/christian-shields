import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { FaCheck } from 'react-icons/fa';
import './Store.css';

function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  
  // State to track selected price for each product
  const [selectedPrices, setSelectedPrices] = useState({});
  // State to track added status for feedback
  const [addedToCart, setAddedToCart] = useState({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/GetProducts');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        
        // Initialize selected prices
        const initialSelectedPrices = {};
        data.forEach(product => {
          if (product.prices && product.prices.length > 0) {
            // Default to the first price
            initialSelectedPrices[product.id] = product.prices[0].id;
          }
        });
        setSelectedPrices(initialSelectedPrices);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handlePriceChange = (productId, priceId) => {
    setSelectedPrices(prev => ({
      ...prev,
      [productId]: priceId
    }));
  };

  const handleAddToCart = (product) => {
    const priceId = selectedPrices[product.id];
    if (priceId) {
      addToCart(product, priceId);
      
      // Show feedback
      setAddedToCart(prev => ({ ...prev, [product.id]: true }));
      
      // Reset after 3 seconds
      setTimeout(() => {
        setAddedToCart(prev => ({ ...prev, [product.id]: false }));
      }, 3000);
    }
  };

  if (loading) return <div className="store-loading">Loading products...</div>;
  if (error) return <div className="store-error">Error: {error}</div>;

  return (
    <div className="store">
      <h1>STORE</h1>
      <div className="products-grid">
        {products.map((product) => {
            const hasPrices = product.prices && product.prices.length > 0;
            const selectedPriceId = selectedPrices[product.id];
            const selectedPrice = product.prices?.find(p => p.id === selectedPriceId);

            return (
              <div key={product.id} className="product-card">
                {product.images && product.images.length > 0 && (
                  <img src={product.images[0]} alt={product.name} className="product-image" />
                )}
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                {hasPrices ? (
                    <div className="product-pricing">
                        {product.prices.length > 1 ? (
                            <select 
                                value={selectedPriceId} 
                                onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                className="price-select"
                            >
                                {product.prices.map(price => (
                                    <option key={price.id} value={price.id}>
                                        {price.nickname || 'Standard'} - {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: price.currency,
                                        }).format(price.unit_amount / 100)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="product-price">
                                {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: selectedPrice.currency,
                                }).format(selectedPrice.unit_amount / 100)}
                            </div>
                        )}
                        
                        <button 
                        className={`buy-btn ${addedToCart[product.id] ? 'added' : ''}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={!selectedPriceId || addedToCart[product.id]}
                        >
                        {addedToCart[product.id] ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Added to cart! <FaCheck />
                            </span>
                        ) : (
                            "Add to Cart"
                        )}
                        </button>
                    </div>
                ) : (
                    <p className="unavailable">Currently Unavailable</p>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
}

export default Store;
