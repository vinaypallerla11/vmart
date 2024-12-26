import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { useCart } from '../../context/CartContext';
import './index.css';

const CartItem = ({ product }) => {
  const { removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const navigate = useNavigate();

  // Navigate to Add Address page with product details
  const handleBuyNow = () => {
    navigate('/add-address', { state: { product } }); 
  };

  if (!product) {
    return <p>Product data is not available.</p>;
  }

  return (
    <div className="cart-item">
      <img 
        src={product.image} 
        alt={product.title} 
        className="cart-item-image" 
        onError={(e) => { e.target.src = '/images/default-image.png'; }} // Fallback image
      />
      <div className="cart-item-details">
        <h3>{product.title}</h3>
        <p className="para">Price: ${product.price.toFixed(2)}</p>
        <p className="para">Quantity: {product.quantity}</p>
        <div className="quantity-controls">
          <button 
            onClick={() => decreaseQuantity(product.id)} 
            disabled={product.quantity <= 1} 
            className={`quantity-button ${product.quantity <= 1 ? 'disabled' : ''}`}
          >
            -
          </button>
          <span>{product.quantity}</span>
          <button 
            onClick={() => increaseQuantity(product.id)} 
            className="quantity-button"
          >
            +
          </button>
        </div>
        <button 
          onClick={() => removeFromCart(product.id)} 
          className="remove-button"
        >
          Remove
        </button>
        <button 
          onClick={handleBuyNow} 
          className="buynow-button"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default CartItem;
