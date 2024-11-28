
import React from 'react';
import { useCart } from '../../context/CartContext';
import './index.css'; // Ensure this path is correct

const CartItem = ({ product }) => {
  const { removeFromCart, increaseQuantity, decreaseQuantity } = useCart();

  return (
    <>
      <div className="cart-item">
        <img 
          src={product.image} 
          alt={product.title} 
          className="cart-item-image" 
          onError={(e) => { e.target.src = 'path/to/default-image.png'; }} // Fallback image
        />
        <div className="cart-item-details">
          <h3>{product.title}</h3>
          <p className='para'>Price: ${product.price.toFixed(2)}</p>
          <p className='para'>Quantity: {product.quantity}</p>
          <div className="quantity-controls">
            <button 
              onClick={() => decreaseQuantity(product.id)} 
              disabled={product.quantity <= 1}
              aria-label={`Decrease quantity of ${product.title}`}
            >
              -
            </button>
            <span>{product.quantity}</span>
            <button 
              onClick={() => increaseQuantity(product.id)} 
              aria-label={`Increase quantity of ${product.title}`}
            >
              +
            </button>
          </div>
          <button 
            onClick={() => removeFromCart(product.id)} 
            className="remove-button"
            aria-label={`Remove ${product.title} from cart`}
          >
            Remove
          </button>
        </div>
      </div>
    </>
  );
};

export default CartItem;
