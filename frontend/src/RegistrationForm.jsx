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
  const [role, setRole] = useState("user"); // Default role is user
  const [secretKey, setSecretKey] = useState(""); // Secret key for admin
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Password validation
  const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const showAlert = () => {
    alert('User created successfully');
  };

  const LoginForm = () => {
    navigate('/', { replace: true });
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Basic validation
    if (!username || !password || !email || !mobile) {
      alert("Please fill all the fields");
      return;
    }

    // Password validation
    if (!isPasswordValid(password)) {
      alert("Password should be at least 8 characters long and contain at least one letter, one number, and one special character");
      return;
    }

    // Mobile validation (Example: US 10 digits)
    const mobileRegex = /^[0-9]{10}$/; // Adjust for the desired format
    if (!mobileRegex.test(mobile)) {
      alert("Please enter a valid mobile number");
      return;
    }

    const userDetails = { username, password, email, mobile, role, secretKey };
    console.log(userDetails);  // Check if 'role' is in the userDetails object

    // Check for valid secret key if admin
    if (role === "admin" && secretKey !== "admin_vinay") {
      alert("Invalid secret key for admin");
      return;
    }

    const url = 'http://localhost:8000/registers/';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Registration failed. Please try again.");
        return;
      }

      showAlert();
      setUserName("");
      setPassword("");
      setEmail("");
      setMobile("");
      setRole("user");
      setSecretKey("");
      setFormSubmitted(false);
    } catch (error) {
      console.error('API Error:', error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="registration-form-container">
      <div className="section">
        <h1 className='heading'>Create a new account</h1>
        <p className='easy-register'>It's quick and easy.</p>

        <form onSubmit={formSubmit} className='form-container'>
          <div className="role-selection">
            <label className="role-label">Select Role:</label>
            <div>
              <input 
                type="radio" 
                id="userRole" 
                name="role" 
                value="user" 
                checked={role === "user"} 
                onChange={(e) => setRole(e.target.value)} 
              />
              <label htmlFor="userRole">User</label>
            </div>
            <div>
              <input 
                type="radio" 
                id="adminRole" 
                name="role" 
                value="admin" 
                checked={role === "admin"} 
                onChange={(e) => setRole(e.target.value)} 
              />
              <label htmlFor="adminRole">Admin</label>
            </div>
          </div>

          <label htmlFor="username" className="input-label">Username:</label>
          <input 
            type="text" 
            className={`input-field ${formSubmitted && !username && 'highlight'}`} 
            id="username" 
            name='username' 
            placeholder='Username' 
            value={username} 
            onChange={(e) => setUserName(e.target.value)} 
          />

          <label htmlFor="password" className="input-label">Password:</label>
          <div className="password-input-container">
            <input 
              type={showPassword ? 'text' : 'password'} 
              className={`input-field ${formSubmitted && (!password || !isPasswordValid(password)) && 'highlight'}`} 
              id="password" 
              name='password' 
              placeholder='Password' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
            </span>
          </div>

          <label htmlFor="email" className="input-label">Email:</label>
          <input 
            type="email" 
            className={`input-field ${formSubmitted && !email && 'highlight'}`} 
            id="email" 
            name='email' 
            placeholder='Email' 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />

          <label htmlFor="mobile" className="input-label">Mobile:</label>
          <input 
            type="text" 
            className={`input-field ${formSubmitted && !mobile && 'highlight'}`} 
            id="mobile" 
            name='mobile' 
            placeholder='Mobile' 
            value={mobile} 
            onChange={(e) => setMobile(e.target.value)} 
          />

          {role === "admin" && (
            <>
              <label htmlFor="secretKey" className="input-label">Admin Secret Key:</label>
              <input 
                type="text" 
                className={`input-field ${formSubmitted && !secretKey && 'highlight'}`} 
                id="secretKey" 
                name='secretKey' 
                placeholder='Enter Admin Secret Key' 
                value={secretKey} 
                onChange={(e) => setSecretKey(e.target.value)} 
              />
            </>
          )}

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
