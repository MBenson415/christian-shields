import React from 'react';
import { Link } from 'react-router-dom';

function Success() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', color: '#fff' }}>
      <h1>Thank You for Your Purchase!</h1>
      <p>Your order has been received.</p>
      <Link to="/store" style={{ color: '#fff', textDecoration: 'underline', marginTop: '20px', display: 'inline-block' }}>
        Back to Store
      </Link>
    </div>
  );
}

export default Success;
