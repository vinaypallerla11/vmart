
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from cookies when the app initializes
  useEffect(() => {
    const savedCart = Cookies.get('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      const existingProduct = updatedCart.find((item) => item.id === product.id);
      
      if (existingProduct) {
        existingProduct.quantity += 1; // Increment quantity if already in cart
      } else {
        updatedCart.push({ ...product, quantity: 1 }); // Add new product
      }
      
      Cookies.set('cart', JSON.stringify(updatedCart)); // Save updated cart to cookies
      return updatedCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== id);
      Cookies.set('cart', JSON.stringify(updatedCart)); // Update cookies
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    Cookies.remove('cart'); // Clear cookies
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      Cookies.set('cart', JSON.stringify(updatedCart)); // Update cookies
      return updatedCart;
    });
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      Cookies.set('cart', JSON.stringify(updatedCart)); // Update cookies
      return updatedCart;
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
