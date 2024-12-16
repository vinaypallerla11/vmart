import React, { useEffect, useState } from "react";
import './UserDetails.css';
import Cookies from 'js-cookie';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';


const UserDetails = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const handleLogout = () => {
      Cookies.remove('jwt_token');
      navigate('/login');
    };
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const jwtToken = Cookies.get('jwt_token');
        if (!jwtToken) {
          throw new Error("JWT Token not found");
        }

        const response = await fetch("https://vmart-yxk6.onrender.com/admin/users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to handle user deletion
  const deleteUser = async (userId) => {
    const jwtToken = Cookies.get('jwt_token'); // Get the token from cookies
    if (!jwtToken) {
      alert("JWT Token not found");
      return;
    }
  
    try {
      const response = await fetch(`https://vmart-yxk6.onrender.com/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${jwtToken}`, // Ensure the token is passed correctly
        },
        credentials: "include",
      });
  
      console.log("Response Status:", response.status); // Check the response status
      const data = await response.json(); // Get the response data
  
      if (!response.ok) {
        // Log the error response for debugging
        console.error("Error Response Data:", data);
        throw new Error(data.message || "Failed to delete user");
      }
  
      // Update state to remove the deleted user from the UI
      setUsers(users.filter(user => user._id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Delete Error:", error); // Log the error message
      alert("Error: " + error.message);
    }
  };
  
  
  if (loading) {
    return (
      <div className="loading-spinner">
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div>
      <Header onLogout={handleLogout}/>
      <h2 className="user-registered">Registered Users</h2>
      <div className="dashboard-widgets">
        <div className="widget">
          <h2>Total Users</h2>
          <p>{users.length}</p>
        </div>
      </div>

      <div className="table-container">
        <table aria-label="List of registered users">
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Registration Time</th>
              <th>Last Login Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.password}</td>
                  <td>{user.email}</td>
                  <td>{user.mobile}</td>
                  <td>{user.role}</td>
                  <td>{user.registrationDate}</td>
                  <td>{user.lastLoginTime}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDetails;
