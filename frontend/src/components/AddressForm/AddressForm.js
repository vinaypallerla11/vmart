import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Import js-cookie library
import Navbar from '../Navbar'
import './AddressForm.css';

const AddAddressForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isPrimary: false,
  });

  const [paymentData, setPaymentData] = useState({
    paymentMethod: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    bankName: '',
    accountNumber: '',
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Handle input field changes for address and payment
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('payment')) {
      setPaymentData({
        ...paymentData,
        [name]: type === 'checkbox' ? checked : value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // Fetch user addresses when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      const token = Cookies.get('jwt_token');
      if (token) {
        const response = await fetch('https://vmart-yxk6.onrender.com/user/addresses', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data && data.addresses) {
          setAddresses(data.addresses);
        }
      }
    };
    fetchAddresses();
  }, []);

 
  // Handle address form submission
const handleAddressSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = Cookies.get('jwt_token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    const response = await fetch('https://vmart-yxk6.onrender.com/add-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const getdata = await response.json();
    if (response.ok) {
      setSuccessMessage(getdata.message);
      setError(null);

      // Update the addresses array and set the new address as selected
      const newAddress = getdata.newAddress;
      setAddresses((prevAddresses) => {
        return [newAddress, ...prevAddresses]; // Prepend new address to the list
      });
      setSelectedAddress(newAddress);

      // Reset form fields
      setFormData({
        name: '',
        mobile: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isPrimary: false,
      });
    } else {
      setError(getdata.error || 'Failed to add address. Please try again.');
      setSuccessMessage(null);
    }
  } catch (err) {
    setError('Error occurred. Please try again.');
    setSuccessMessage(null);
  }
};



  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch('https://vmart-yxk6.onrender.com/add-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      const getdata = await response.json();
      if (response.ok) {
        setSuccessMessage(getdata.message);
        setError(null);
        setPaymentData({
          paymentMethod: '',
          cardNumber: '',
          cardName: '',
          expiryDate: '',
          cvv: '',
          upiId: '',
          bankName: '',
          accountNumber: '',
        });
      } else {
        setError(getdata.error || 'Failed to add payment. Please try again.');
        setSuccessMessage(null);
      }
    } catch (err) {
      setError('Error occurred while processing payment. Please try again.');
      setSuccessMessage(null);
    }
  };

  // Handle address selection from existing addresses
 
  // Handle address selection from existing addresses
  const handleAddressSelect = (e) => {
    const selectedAddressId = e.target.value;
    const address = addresses.find((addr) => addr._id === selectedAddressId); // Use _id for matching
    if (address) {
      setSelectedAddress(address);
    } else {
      console.error("Selected address not found.");
      setSelectedAddress(null);
    }
  };
  

  return (
    <div>
      <Navbar />
    <div className="add-address-form">
      <h2>Add New Address</h2>

      {/* Error and Success messages */}
      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}

      <form onSubmit={handleAddressSubmit}>
        {/* Address Section */}
        <h3>Address Details</h3>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <label>Mobile:</label>
        <input
          type="text"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          required
        />
        <label>Address Line 1:</label>
        <input
          type="text"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          required
        />
        <label>Address Line 2:</label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
        />
        <label>City:</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <label>State:</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
        <label>Postal Code:</label>
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          required
        />
        <label>Country:</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        />
        <label>
          <input
            type="checkbox"
            name="isPrimary"
            checked={formData.isPrimary}
            onChange={handleChange}
          />
          Set as Primary Address
        </label>

        {/* Address Submit Button */}
        <button type="submit">Add Address</button>
      </form>

      <hr />

      <h3>Existing Addresses</h3>
      <label>
        Select Address:
        <select onChange={handleAddressSelect}>
          <option value="">--Select Address--</option>
          {addresses?.filter(Boolean).map((address) => (
            <option key={address._id} value={address._id}>
              {address.name}, {address.addressLine1}, {address.city}, {address.state}
            </option>
          ))}
        </select>
      </label>

      <div>
        {selectedAddress && (
          <div>
            <h4>Selected Address</h4>
            <p>{selectedAddress.name}</p>
            <p>{selectedAddress.mobile}</p>
            <p>{selectedAddress.addressLine1}</p>
            <p>{selectedAddress.city}, {selectedAddress.state}</p>
            <p>{selectedAddress.postalCode}</p>
          </div>
        )}
      </div>

      <hr />

      <h2>Add Payment Method</h2>

      <form onSubmit={handlePaymentSubmit}>
        {/* Payment Section */}
        <h3>Select Payment Method</h3>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="Card"
            checked={paymentData.paymentMethod === 'Card'}
            onChange={handleChange}
            required
          />
          Credit/Debit Card
        </label>
        {paymentData.paymentMethod === 'Card' && (
          <div className="card-details">
            <label>Card Number:</label>
            <input
              type="text"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleChange}
              required
            />
            <label>Name on Card:</label>
            <input
              type="text"
              name="cardName"
              value={paymentData.cardName}
              onChange={handleChange}
              required
            />
            <label>Expiry Date:</label>
            <input
              type="text"
              name="expiryDate"
              value={paymentData.expiryDate}
              onChange={handleChange}
              required
            />
            <label>CVV:</label>
            <input
              type="password"
              name="cvv"
              value={paymentData.cvv}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="UPI"
            checked={paymentData.paymentMethod === 'UPI'}
            onChange={handleChange}
          />
          UPI
        </label>
        {paymentData.paymentMethod === 'UPI' && (
          <div className="upi-details">
            <label>UPI ID:</label>
            <input
              type="text"
              name="upiId"
              value={paymentData.upiId}
              onChange={handleChange}
            />
          </div>
        )}
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="Cash on Delivery"
            checked={paymentData.paymentMethod === 'Cash on Delivery'}
            onChange={handleChange}
          />
          Cash on Delivery
        </label>

        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="Net Banking"
            checked={paymentData.paymentMethod === 'Net Banking'}
            onChange={handleChange}
          />
          Net Banking
        </label>
        {paymentData.paymentMethod === 'Net Banking' && (
          <div className="net-banking-details">
            <label>Bank Name:</label>
            <input
              type="text"
              name="bankName"
              value={paymentData.bankName}
              onChange={handleChange}
              required
            />
            <label>Account Number:</label>
            <input
              type="text"
              name="accountNumber"
              value={paymentData.accountNumber}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Payment Submit Button */}
        <button type="submit">Add Payment</button>
      </form>
    </div>
    </div>
  );
};

export default AddAddressForm;
