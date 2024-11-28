import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import "./ForgatUsername.css"

const ForgotUsername = () => {
  const [email, setEmail] = useState(''); // Input for email
  const [message, setMessage] = useState('');
  const [verificationStep, setVerificationStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP and new username
  const [otp, setOtp] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const navigate = useNavigate(); // Initialize navigate function

  // Handle Step 1: Submit email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    try {
      const response = await fetch('https://vmart-yxk6.onrender.com/forgot-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // Send email as key
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('OTP sent to your email. Please check your inbox.');
        setVerificationStep(2); // Move to Step 2
      } else {
        setMessage(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  // Handle Step 2: Submit OTP and new username
  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp || !newUsername) {
      setMessage('Please enter both OTP and new username.');
      return;
    }

    try {
      const response = await fetch('https://vmart-yxk6.onrender.com/verify-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Username reset successfully. You can now log in with your new username.');
        // Redirect to login page
        navigate('/login'); // Assuming '/login' is the route for the login page
      } else {
        setMessage(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="forgot-username-container">
      {verificationStep === 1 ? (
        <form onSubmit={handleEmailSubmit}>
          <h2>Forgot Username</h2>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
          <button type="submit">Submit</button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <h2>Enter OTP to Reset Username</h2>
          <label>OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="Enter OTP"
          />
          <label>New Username:</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
            placeholder="Enter new username"
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};


export default ForgotUsername;
