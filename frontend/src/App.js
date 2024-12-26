import React from 'react';
import Home from './components/Home';
import About from './components/About';
import Products from './components/Products';
import NavCart from './components/Navcart';
import LoginForm from './components/LoginForm/LoginForm';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ForgotUsername from './components/ForgotUsername/ForgotUsername';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UserDetails from './components/UserDetails/UserDetails';
import AdminProducts from './components/AdminProducts/AdminProducts';
import AddressForm from './components/AddressForm/AddressForm';
import PaymentPage from './components/PaymentPage/PaymentPage';


const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/products' element={<Products />} />
          <Route path='/cart' element={<NavCart />} />
          <Route path='/login' element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/forgot-username" element={<ForgotUsername />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/dashboard" element={<AdminDashboard/>} />
          <Route path="/admin/users" element={<UserDetails />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/add-address" element={<AddressForm />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>          
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;