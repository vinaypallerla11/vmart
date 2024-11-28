import React from 'react';
import Home from './components/Home';
import About from './components/About';
import Products from './components/Products';
import NavCart from './components/Navcart';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ForgotUsername from './components/ForgotUsername/ForgotUsername';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';


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
        </Routes>          
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;