import React, { useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './LoginForm.css';

const LoginForm = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role set to user
  const [showPassword, setShowPassword] = useState(false);
  const [showSubmitError, setShowSubmitError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prevState) => !prevState);
  }, []);

  const RegisterForm = () => navigate('/register');
  const ForgotUsername = () => navigate('/forgot-username');
  const ForgotPassword = () => navigate('/forgot-password');

  const handleErrorResponse = (errorData) => {
    setShowSubmitError(true);
    if (errorData.error_type === 'username_error') {
      setUsernameError(true);
      setPasswordError(false);
    } else if (errorData.error_type === 'password_error') {
      setUsernameError(false);
      setPasswordError(true);
    }
  };

  // Handle form submission
  const formSubmit = async (e) => {
    e.preventDefault();
    setShowSubmitError(false);
    setUsernameError(false);
    setPasswordError(false);

    // Basic validation
    if (!username || !password) {
      setShowSubmitError(true);
      return;
    }

    // Include role in request body
    const userDetails = { username, password, role };
    const url = 'https://vinaymart.vercel.app/login/';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    };

    try {
      setLoading(true);

      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();

        // Save token and role to cookies
        Cookies.set('jwt_token', data.token, { expires: 30 });

        // Redirect based on role
        console.log('API Response:', data); // Debugging: Ensure correct response
        if (data.role === 'admin') {
          navigate('/admin-dashboard'); // Admin dashboard route
        } else {
          navigate('/'); // Home or user dashboard
        }
      } else {
        const errorData = await response.json();
        handleErrorResponse(errorData);
      }
    } catch (error) {
      console.error('Network or Server Error:', error);
      handleErrorResponse({ error_msg: 'Network error, please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const token = Cookies.get('jwt_token');
  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="empForm">
      <div className="section">
        <form onSubmit={formSubmit} className="form-container">
          <img
            src="https://res.cloudinary.com/ddehbjyiy/image/upload/v1704763899/VTrendz_gfuzbu.webp"
            alt="Vmart"
            className="vtrendz"
          />
          <label htmlFor="username" className={`input-label ${usernameError ? 'error' : ''}`}>
            User Name:
          </label>
          <input
            type="text"
            className={`input-field ${usernameError ? 'error' : ''}`}
            id="username"
            name="username"
            placeholder="Username"
            onChange={(e) => setUserName(e.target.value)}
          />

          <label htmlFor="password" className={`input-label ${passwordError ? 'error' : ''}`}>
            Password:
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`input-field ${passwordError ? 'error' : ''}`}
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>

          <div className="role-selection">
            <label className="input-label">Login As:</label>
            <div className="radio-buttons">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                />
                User
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                />
                Admin
              </label>
            </div>
          </div>

          <div className="button-container">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </div>

          {showSubmitError && (
            <p className="error-msg">Invalid username or password</p>
          )}

          <div className="forgot-links">
            <button type="button" onClick={ForgotUsername} className="forgot-button">
              Forgot Username?
            </button>
            <button type="button" onClick={ForgotPassword} className="forgot-button">
              Forgot Password?
            </button>
          </div>
        </form>
        <button type="button" onClick={RegisterForm} className="create-button">
          Create New Account
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
