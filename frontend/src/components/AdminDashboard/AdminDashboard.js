import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from '../Header/Header'; // Import the Header component
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('jwt_token');
        if (!token) {
          alert('You need to login first');
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const getData = await response.json();
        setTotalUsers(getData.data.length);
        setError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users, please check your login session or backend configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  return (
    <div className="admin-container">
      <div className="sidebar">
        <img
          src="https://res.cloudinary.com/ddehbjyiy/image/upload/v1704763899/VTrendz_gfuzbu.webp"
          alt="Vmart Logo"
          className="sidebar-logo"
        />
        {['dashboard', 'orders', 'products', 'users', 'settings'].map(tab => (
          <div
            key={tab}
            className={`menu-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      <div className="main-content">
        {/* Use the Header component */}
        <Header onLogout={handleLogout} className="headerspace"/>

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
            {loading ? <p>Loading...</p> : <p>{totalUsers}</p>}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;
