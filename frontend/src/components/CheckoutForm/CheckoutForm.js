import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ product, address }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    // Call backend to create payment intent
    const { error, paymentIntent } = await stripe.confirmCardPayment('client-secret-from-backend', {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: address.name,
          address: {
            line1: address.addressLine,
            city: address.city,
            state: address.state,
            postal_code: address.postalCode,
          },
        },
      },
    });

    if (error) {
      console.error(error.message);
    } else {
      console.log('Payment successful:', paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay ${product.price.toFixed(2)}</button>
    </form>
  );
};

export default CheckoutForm;
