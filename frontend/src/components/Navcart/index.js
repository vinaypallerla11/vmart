import React from 'react';
import Navbar from '../Navbar'
import Cart from '../Cart'
import './index.css'
import Footer from '../Footer'
import { Link } from 'react-router-dom';



const index = () => {
  return (
    <div>
      <Navbar/>
      <div className='mobile-icons'>
      <Link to="/"><img src="https://cdn-icons-png.flaticon.com/512/25/25694.png" alt="home" className='home1'/></Link>
        <Link to="/products"><img src="https://img.favpng.com/6/14/1/marketing-amp-growth-icon-product-icon-png-favpng-qvc19bn2QQpkJVRYZ3cB7WaYR.jpg" alt="product" className='product1'/></Link>
        <Link to="/cart"><img src="https://cdn-icons-png.flaticon.com/512/565/565375.png" alt="cart" className='cart1'/></Link>
      </div>
      <Cart />
      <Footer/>
    </div>
  );
}

export default index;