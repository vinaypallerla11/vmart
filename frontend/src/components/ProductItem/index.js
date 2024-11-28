import React from 'react';
import { useCart } from '../../context/CartContext'; // Make sure this path is correct
import { FaRegStar } from 'react-icons/fa';
import './index.css'; // Ensure this path is correct

const ProductItem = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="product-item">
      <img src={product.image} alt={product.title} className="product-image" />
      <h2 className="product-title">{product.title}</h2>
      <p className="product-rating">
        <FaRegStar /> {product.rating.rate}
      </p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <button onClick={handleAddToCart} className="add-to-cart-button">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductItem;