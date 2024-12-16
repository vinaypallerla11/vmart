import React, { useEffect, useState } from 'react';
import ProductItem from '../ProductItem';
import Navbar from '../Navbar';
import './index.css';
import Footer from '../Footer';
import { Link } from 'react-router-dom';
import { FaTimes, FaMicrophone } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const [category, setCategory] = useState(''); // New state to handle category

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://vmart-yxk6.onrender.com/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearchQuery = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category ? product.category.toLowerCase() === category.toLowerCase() : true;
    return matchesSearchQuery && matchesCategory;
  });

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const startVoiceRecognition = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support voice recognition. Please try Google Chrome.');
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setRecognizing(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setRecognizing(false);
    };

    recognition.start();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className='mobile-icons'>
        <Link to="/"><img src="https://cdn-icons-png.flaticon.com/512/25/25694.png" alt="home" className='home1'/></Link>
        <Link to="/products"><img src="https://img.favpng.com/6/14/1/marketing-amp-growth-icon-product-icon-png-favpng-qvc19bn2QQpkJVRYZ3cB7WaYR.jpg" alt="product" className='product1'/></Link>
        <Link to="/cart"><img src="https://cdn-icons-png.flaticon.com/512/565/565375.png" alt="cart" className='cart1'/></Link>
      </div>

      <div className="marquee-container">
        <div className="marquee-text">
          Welcome to Vinay Trendz store! Check out our latest products and deals!
        </div>
      </div>

      <div className="search-container">
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="search-input"
              aria-label="Search for products"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-button"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <FaTimes aria-hidden="true" />
              </button>
            )}
            <div className="voice-recognization">
              <button
                type="button"
                className="voice-search-button"
                onClick={startVoiceRecognition}
                disabled={recognizing}
                aria-label="Start voice recognition"
              >
                <FaMicrophone aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Category Buttons */}
      <div className="categories-container">
        <button onClick={() => setCategory('')} className="category-button">All</button>
        <button onClick={() => setCategory('men\'s clothing')} className="category-button">Men's Clothing</button>
        <button onClick={() => setCategory('women\'s clothing')} className="category-button">Women's Clothing</button>
        <button onClick={() => setCategory('jewelery')} className="category-button">Jewelry</button>
        <button onClick={() => setCategory('electronics')} className="category-button">Electronics</button>
      </div>

      <div className="products-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductItem key={product.id} product={product} />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
