import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false); // Track form submission
  const [showPassword, setShowPassword] = useState(false); // Track password visibility
  const navigate = useNavigate();

  const isPasswordValid = (password) => {
    // Password should be at least 8 characters long and contain at least one letter, one number, and one special character
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const userDetails = { username, password, email, mobile };

  const showAlert = () => {
    alert('User created successfully');
  };

  const LoginForm = () => {
    navigate('/', { replace: true });
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true); // Set formSubmitted to true when form is submitted
    if (!username || !password || !email || !mobile) {
      alert("Please fill all the fields");
      return; // Do nothing if any field is empty
    }
    if (!isPasswordValid(password)) {
      alert("Password should be at least 8 characters long and contain at least one letter, one number, and one special character");
      return; // Do nothing if password is not valid
    }
    
    console.log(userDetails);
    const url = 'https://vmart-yxk6.onrender.com/registers/';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log(response);
    console.log(data);
    showAlert();
    // Reset input fields after successful registration
    setUserName("");
    setPassword("");
    setEmail("");
    setMobile("");
    setFormSubmitted(false); // Reset formSubmitted state
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  return (
    <div className="registration-form-container">
      <div className="section">
        <h1 className='heading'>Create a new account</h1>
        <p className='easy-register'>It's quick and easy.</p>
        <form onSubmit={formSubmit} className='form-container'>
          <label htmlFor="username" className="input-label">Username:</label>
          <input type="text" className={`input-field ${formSubmitted && !username && 'highlight'}`} id="username" name='username' placeholder='Username' value={username} onChange={(e) => setUserName(e.target.value)} />

          <label htmlFor="password" className="input-label">Password:</label>
          <div className="password-input-container">
            <input type={showPassword ? 'text' : 'password'} className={`input-field ${formSubmitted && (!password || !isPasswordValid(password)) && 'highlight'}`} id="password" name='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
            </span>
          </div>

          <label htmlFor="email" className="input-label">Email:</label>
          <input type="email" className={`input-field ${formSubmitted && !email && 'highlight'}`} id="email" name='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />

          <label htmlFor="mobile" className="input-label">Mobile:</label>
          <input type="text" className={`input-field ${formSubmitted && !mobile && 'highlight'}`} id="mobile" name='mobile' placeholder='Mobile' value={mobile} onChange={(e) => setMobile(e.target.value)} />

          <div className='button-container'>
            <button type="submit" className="submit-button">Sign Up</button>
            <button className="submit-button-login" onClick={LoginForm}>Already have an account?</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;