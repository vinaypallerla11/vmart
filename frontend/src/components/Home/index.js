import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar'; // Import NavBar component
import './index.css';
import Footer from '../Footer';

const Home = () => {
  const navigate = useNavigate();
  const jwtToken = Cookies.get('jwt_token');
  const [showNavBar, setShowNavBar] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (!jwtToken) {
      navigate('/login'); // Redirect to login page if user is not authenticated
      setLoading(false); // Stop loading when navigation occurs
      return; // Prevent further execution
    }

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      // Only update the navbar visibility if the scroll distance is significant
      if (Math.abs(currentScroll - lastScrollTop) > 150) {
        setShowNavBar(currentScroll <= lastScrollTop || currentScroll <= 0);
      }
      setLastScrollTop(currentScroll <= 0 ? 0 : currentScroll); // For Mobile or negative scrolling
    };

    window.addEventListener('scroll', handleScroll);
    setLoading(false); // Set loading to false after checking token
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [jwtToken, navigate, lastScrollTop]);

  // Prevent rendering while checking authentication
  if (loading) {
    return <div>Loading...</div>; // Optionally add a loading spinner
  }

  return (
    <>
      {showNavBar && <Navbar />}
      <div className='mobile-icons'>
        <Link to="/"><img src="https://cdn-icons-png.flaticon.com/512/25/25694.png" alt="home" className='home1'/></Link>
        <Link to="/products"><img src="https://img.favpng.com/6/14/1/marketing-amp-growth-icon-product-icon-png-favpng-qvc19bn2QQpkJVRYZ3cB7WaYR.jpg" alt="product" className='product1'/></Link>
        <Link to="/cart"><img src="https://cdn-icons-png.flaticon.com/512/565/565375.png" alt="cart" className='cart1'/></Link>
      </div>
      <main className='homeapp'>
        <div className="home-container">
          <div className="home-content">
            <h1 className="home-heading">Clothes That Get YOU Noticed</h1>
            <p className="home-description">
              Fashion is part of the daily air and it does not quite help that it
              changes all the time. Clothes have always been a marker of the era
              and we are in a revolution. Your fashion makes you be seen and
              heard that way you are. So, celebrate the seasons with new and exciting
              fashion in your own way.
            </p>
            <Link to="/products">
              <button type="button" className="shop-now-button">
                Shop Now
              </button>
            </Link>
          </div>
          <img
            src="https://res.cloudinary.com/ddehbjyiy/image/upload/v1716328885/shopping_img_mtqflw.avif"
            alt="clothes that get you noticed"
            className="home-desktop-img"
          />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;