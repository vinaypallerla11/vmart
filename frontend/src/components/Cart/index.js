import React from 'react';
import { useCart } from '../../context/CartContext';
import CartItem from '../Cartitem/CartItem';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const Cart = () => {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Handle checkout
  const handleCheckout = () => {
    navigate('/checkout'); // Redirect to checkout page
  };

  // Handle clearing the cart
  const clearCart = () => {
    cart.forEach(item => removeFromCart(item.id)); // Remove each item
  };


  return (
    <>
      {/* <NavBar /> */}
      <div className="cart-container">
        <h1>My Cart</h1>
        {cart.length > 0 ? (
          <>
            {cart.map(item => <CartItem key={item.id} product={item} />)}
            <div className="cart-summary">
              <h2>Total Price: ${totalPrice.toFixed(2)}</h2>
              <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
              <button className="clear-cart-button" onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <p>No items in the cart.</p>
            <img 
              src="https://cdn.iconscout.com/icon/free/png-256/free-shopping-cart-icon-download-in-svg-png-gif-file-formats--online-bag-wayfinding-pack-miscellaneous-icons-1211836.png?f=webp&w=256" 
              alt="Empty cart" 
              className="empty-cart-image"
            />
            <Link to="/products">
              <button type="button" className="shop-now-button">
                Shop Now
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;