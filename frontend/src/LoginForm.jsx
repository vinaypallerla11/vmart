import React, { useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './LoginForm.css';

const LoginForm = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);  // Track password visibility
  const [showSubmitError, setShowSubmitError] = useState(false);  // Track submit error
  const [usernameError, setUsernameError] = useState(false);  // Track username error
  const [passwordError, setPasswordError] = useState(false);  // Track password error
  const [loading, setLoading] = useState(false);  // Track loading state
  const navigate = useNavigate();

  // Define togglePasswordVisibility with useCallback at the top level
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prevState) => !prevState);
  }, []); // useCallback should be called without conditions

  const RegisterForm = () => {
    navigate('/register');
  };

  const ForgotUsername = () => {
    navigate('/forgot-username');
  };

  const ForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Handle error responses from the server
  const handleErrorResponse = (errorData) => {
    setUsernameError(true);
    setPasswordError(true);
    setShowSubmitError(true);

    if (errorData.error_type === 'username_error') {
      setUsernameError(true);
      setPasswordError(false);
    } else if (errorData.error_type === 'password_error') {
      setUsernameError(false);
      setPasswordError(true);
    }
  };

  // Submit form and handle login logic
  const formSubmit = async (e) => {
    e.preventDefault();
    setShowSubmitError(false);  // Reset error message before submitting
    setUsernameError(false);    // Reset username error before submitting
    setPasswordError(false);    // Reset password error before submitting

    const userDetails = { username, password };
    const url = 'https://vmart-yxk6.onrender.com/login';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    };

    try {
      setLoading(true);  // Set loading to true before starting the request

      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        Cookies.set('jwt_token', data.token, { expires: 30 });
        navigate('/', { replace: true });
      } else {
        const errorData = await response.json();
        handleErrorResponse(errorData);  // Handle server-side errors
      }
    } catch (error) {
      handleErrorResponse({ error_msg: 'Network error, please try again.' });  // Handle network error
    } finally {
      setLoading(false);  // Set loading to false once the request is complete
    }
  };

  // Redirect to home page if token exists
  const token = Cookies.get('jwt_token');
  if (token !== undefined) {
    return <Navigate to="/" />;
  }

  return (
    <div className="empForm">
      <div className="section">
        <form onSubmit={formSubmit} className='form-container'>
          <img
            src="https://res.cloudinary.com/ddehbjyiy/image/upload/v1704763899/VTrendz_gfuzbu.webp"
            alt="pic"
            className='vtrendz'
          />
          <label
            htmlFor="username"
            className={`input-label ${usernameError ? 'error' : ''}`}
          >
            User Name:
          </label>
          <input
            type="text"
            className={`input-field ${usernameError ? 'error' : ''}`}
            id="username"
            name='username'
            placeholder='Username'
            onChange={(e) => setUserName(e.target.value)}
          />

          <label
            htmlFor="password"
            className={`input-label ${passwordError ? 'error' : ''}`}
          >
            Password:
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`input-field ${passwordError ? 'error' : ''}`}
              id="password"
              name='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>

          <div className='button-container'>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </div>

          {showSubmitError && (
            <p className='error-msg'>
              Invalid username or password
            </p>
          )}

          <div className="forgot-links">
            <button
              type="button"
              onClick={ForgotUsername}
              className="forgot-button"
            >
              Forgot Username?
            </button>
            <button
              type="button"
              onClick={ForgotPassword}
              className="forgot-button"
            >
              Forgot Password?
            </button>
          </div>
        </form>
        <button
          type="button"
          onClick={RegisterForm}
          className='create-button'
        >
          Create New Account
        </button>
      </div>
    </div>
  );
};


export default LoginForm;
