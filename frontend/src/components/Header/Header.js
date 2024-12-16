import React from 'react';
import './Header.css';  // Assuming you have your styles here

const Header = ({ onLogout }) => {
  return (
    <div className="header">
      <input type="text" className="search-bar" placeholder="Search..." />
      <div className="user-info">
        <span>Welcome, User</span>  {/* Or dynamically display the username */}
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
