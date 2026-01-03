import React, { useEffect, useState } from 'react';
import './Store.css';

function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/GetProducts');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleBuy = async (priceId) => {
    try {
      const response = await fetch('/api/CreateCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      alert('Error initiating checkout: ' + err.message);
    }
  };

  if (loading) return <div className="store-loading">Loading products...</div>;
  if (error) return <div className="store-error">Error: {error}</div>;

  return (
    <div className="store">
      <h1>STORE</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {product.images && product.images.length > 0 && (
              <img src={product.images[0]} alt={product.name} className="product-image" />
            )}
            <h3>{product.name}</h3>
            <p className="product-description">{product.description}</p>
            {product.default_price && (
              <div className="product-price">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: product.default_price.currency,
                }).format(product.default_price.unit_amount / 100)}
              </div>
            )}
            <button 
              className="buy-btn" 
              onClick={() => handleBuy(product.default_price.id)}
              disabled={!product.default_price}
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Store;
