import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // Track the active sidebar tab

  // Handle Logout
  const handleLogout = () => {
    Cookies.remove('jwt_token'); // Remove the token from cookies
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <img
          src="https://res.cloudinary.com/ddehbjyiy/image/upload/v1704763899/VTrendz_gfuzbu.webp"
          alt="Vmart Logo"
        />
        <div
          className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </div>
        <div
          className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </div>
        <div
          className={`menu-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </div>
        <div
          className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </div>
        <div
          className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <input
            type="text"
            className="search-bar"
            placeholder="Search..."
          />
          <div className="user-info">
            <span>Welcome, Admin</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="dashboard-widgets">
          <div className="widget">
            <h2>Total Orders</h2>
            <p>150</p>
          </div>
          <div className="widget">
            <h2>Total Products</h2>
            <p>450</p>
          </div>
          <div className="widget">
            <h2>Total Users</h2>
            <p>1200</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
