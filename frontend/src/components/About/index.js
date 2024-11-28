
import React from 'react';
import Navbar from '../Navbar'
import Footer from '../Footer'
import { Link } from 'react-router-dom';
import './index.css'

const teamMembers = [
  { name: 'Sundar Pichai', role: 'CEO', imageUrl: 'https://t1.gstatic.com/licensed-image?q=tbn:ANd9GcRTqPXvprIS8lGKWX8aZ7KRVR8eqTcSyFPMYMHnSIDo77mBsREj8sAaQpeoWONi4_w0vT5BxB41Znc2ftDw' },
  { name: 'Srini Pallia', role: 'CTO', imageUrl: 'https://t3.gstatic.com/licensed-image?q=tbn:ANd9GcQaexRyLc37tnatMUnAE5yW3Qrym5h3McDFLJt9ghHTbVz2u2jLVW14mu6me5YsF-Rj' },
  { name: 'Ravi Kumar S', role: 'CMO', imageUrl: 'https://t3.gstatic.com/licensed-image?q=tbn:ANd9GcSfOVReH5dSO_cP4VdxMPiV3GduP3OxkAOG8jE0bpfOkB32NWknKQbc9TIqMHlxOBquKm_-joBHRWI6fcvq' },
  { name: 'vinay', role: 'COO', imageUrl: 'https://res.cloudinary.com/ddehbjyiy/image/upload/v1717571510/vinay_pic_xm9tv1.jpg' },
  // Add more team members as needed
];

const index = () => {
  return (
    <div>
      <Navbar/>
      <div className='mobile-icons'>
      <Link to="/"><img src="https://cdn-icons-png.flaticon.com/512/25/25694.png" alt="home" className='home1'/></Link>
        <Link to="/products"><img src="https://img.favpng.com/6/14/1/marketing-amp-growth-icon-product-icon-png-favpng-qvc19bn2QQpkJVRYZ3cB7WaYR.jpg" alt="product" className='product1'/></Link>
        <Link to="/cart"><img src="https://cdn-icons-png.flaticon.com/512/565/565375.png" alt="cart" className='cart1'/></Link>
      </div>
      <div className="about-container" id="about">
        <div className="about-header">
          <h1>About Us</h1>
          <p>Your one-stop shop for all your needs</p>
        </div>
        <div className="about-content">
          <p>Welcome to VTrendz E-Commerce We are passionate about providing you with the best products and services. Our mission is to deliver quality and value to our customers.</p>
          <p>Founded in 2022, our company has grown from a small startup to a leading player in the e-commerce industry. We offer a wide range of products to cater to all your needs and desires.</p>
          <p>Our team is dedicated to ensuring a seamless shopping experience for you. We continuously strive to improve our platform and services based on your feedback.</p>
          <p>Thank you for choosing VTrendz E-Commerce. We look forward to serving you and making your shopping experience enjoyable and memorable.</p>
        </div>
        <div className="team-section">
          <h2>Meet Our Team</h2>
          <div className="team-members">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <img src={member.imageUrl} alt={member.name} className="team-member-image" />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default index;
