import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineFormatLineSpacing } from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { IoCartOutline } from "react-icons/io5"; 
import './index.css'; 
import Cookies from 'js-cookie';

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeLink, setActiveLink] = useState(window.location.pathname); // Set initial active link based on current path
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0); 

  const onClickLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      Cookies.remove('jwt_token');
      navigate('/', { replace: true });
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  const handleLinkClick = (link) => {
    setActiveLink(link); // Update active link on click
    setDropdownVisible(false); // Close dropdown on link click
  };

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown') && !event.target.closest('.mobile-menu-icon')) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar">
      <div className="content-nav">
        <div>
          <Link to="/">
            <img
              src="https://res.cloudinary.com/ddehbjyiy/image/upload/v1716325832/luxury-letter-v-logo-v-logotype-for-elegant-and-stylish-fashion-symbol-vector_czeu0g.jpg"
              alt="vlogo"
              className="img-content"
            />
          </Link>
          <Link to="/">
            <img
              src="https://res.cloudinary.com/ddehbjyiy/image/upload/v1704763899/VTrendz_gfuzbu.webp"
              className="img-content"
              alt="avatar"
              onClick={() => navigate('/india', { replace: true })}
            />
          </Link>
        </div>
        <div className="nav-container">
          <ul className="desktop-menu">
            <Link to="/" onClick={() => handleLinkClick('/')}>
              <li className={activeLink === '/' ? 'active' : ''}>Home</li>
            </Link>
            <Link to="/about" onClick={() => handleLinkClick('/about')}>
              <li className={activeLink === '/about' ? 'active' : ''}>About</li>
            </Link>
            <Link to="/products" onClick={() => handleLinkClick('/products')}>
              <li className={activeLink === '/products' ? 'active' : ''}>Products</li>
            </Link>
            <Link to="/cart" onClick={() => handleLinkClick('/cart')}>
              <li className={activeLink === '/cart' ? 'active' : ''}>Cart {cartCount > 0 && `(${cartCount})`}</li>
            </Link>
            <button type="button" onClick={onClickLogout} className="button-container2">
              Logout
            </button>
          </ul>
          <MdOutlineFormatLineSpacing className="mobile-menu-icon" onClick={toggleDropdown} />
        </div>
      </div>
      {/* Mobile Cart Icon */}
      <Link to="/cart" className="mobile-cart-icon">
        <IoCartOutline size={25} />
        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </Link>
      {dropdownVisible && (
        <div className="dropdown">
          <ul>
            <li><Link to="/" onClick={() => handleLinkClick('/')}>Home</Link></li>
            <li><Link to="/about" onClick={() => handleLinkClick('/about')}>About</Link></li>
            <li><Link to="/products" onClick={() => handleLinkClick('/products')}>Products</Link></li>
            <li><Link to="/cart" onClick={() => handleLinkClick('/cart')}>Cart {cartCount > 0 && `(${cartCount})`}</Link></li>
            <li>
              <button type="button" onClick={onClickLogout} className="button-container2">
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;