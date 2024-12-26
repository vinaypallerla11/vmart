// import React, { useState } from 'react';

// const PaymentPage = () => {
//   const [paymentData, setPaymentData] = useState({
//     paymentMethod: '',
//     cardNumber: '',
//     cardName: '',
//     expiryDate: '',
//     cvv: '',
//     upiId: '',
//     bankName: '',
//     accountNumber: '',
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setPaymentData({
//       ...paymentData,
//       [name]: type === 'checkbox' ? checked : value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle payment data submission
//     console.log('Payment Data:', paymentData);
//   };

//   return (
//     <div className="payment-page">
//       <h2>Payment Information</h2>
//       <form onSubmit={handleSubmit}>
//         <label>Payment Method:</label>
//         <select name="paymentMethod" value={paymentData.paymentMethod} onChange={handleChange}>
//           <option value="Card">Card</option>
//           <option value="UPI">UPI</option>
//           <option value="Bank">Bank Transfer</option>
//         </select>

//         {paymentData.paymentMethod === 'Card' && (
//           <>
//             <label>Card Number:</label>
//             <input
//               type="text"
//               name="cardNumber"
//               value={paymentData.cardNumber}
//               onChange={handleChange}
//               required
//             />
//             <label>Cardholder Name:</label>
//             <input
//               type="text"
//               name="cardName"
//               value={paymentData.cardName}
//               onChange={handleChange}
//               required
//             />
//             <label>Expiry Date:</label>
//             <input
//               type="text"
//               name="expiryDate"
//               value={paymentData.expiryDate}
//               onChange={handleChange}
//               required
//             />
//             <label>CVV:</label>
//             <input
//               type="text"
//               name="cvv"
//               value={paymentData.cvv}
//               onChange={handleChange}
//               required
//             />
//           </>
//         )}

//         {paymentData.paymentMethod === 'UPI' && (
//           <>
//             <label>UPI ID:</label>
//             <input
//               type="text"
//               name="upiId"
//               value={paymentData.upiId}
//               onChange={handleChange}
//               required
//             />
//           </>
//         )}

//         {paymentData.paymentMethod === 'Bank' && (
//           <>
//             <label>Bank Name:</label>
//             <input
//               type="text"
//               name="bankName"
//               value={paymentData.bankName}
//               onChange={handleChange}
//               required
//             />
//             <label>Account Number:</label>
//             <input
//               type="text"
//               name="accountNumber"
//               value={paymentData.accountNumber}
//               onChange={handleChange}
//               required
//             />
//           </>
//         )}

//         <button type="submit">Submit Payment</button>
//       </form>
//     </div>
//   );
// };

// export default PaymentPage;
