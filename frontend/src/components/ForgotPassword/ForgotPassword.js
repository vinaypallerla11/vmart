import React, { useState } from 'react';
import './ForgatPassword.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [verificationStep, setVerificationStep] = useState(1); // Step 1: Enter email, Step 2: Enter code and new password
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setVerificationStep(2); // Proceed to Step 2
      } else {
        setMessage(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Error during email submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
  
    console.log('Sending data:', { email, code, newPassword }); // Log the data being sent
  
    // Validate code and new password
    if (!code) {
      setMessage('Please enter the verification code.');
      setLoading(false);
      return;
    }
  
    if (!newPassword || newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8000/verify-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }), // Ensure this includes email, code, and newPassword
      });
  
      const data = await response.json();
      setMessage(data.message);
  
      if (response.ok) {
        window.location.href = '/login'; // Or use react-router for redirection
      } else {
        setMessage(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Error during code submission:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="forgot-password-container">
      {verificationStep === 1 ? (
        <form onSubmit={handleEmailSubmit}>
          <h2>Forgot Password</h2>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>Submit</button>
        </form>
      ) : (
        <form onSubmit={handleCodeSubmit}>
          <h2>Enter Verification Code</h2>
          <label>Verification Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>Submit</button>
        </form>
      )}
      {message && <p>{message}</p>}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default ForgotPassword;
