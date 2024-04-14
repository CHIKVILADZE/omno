import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error('Error:', error.message);
      setError(error.message);
    } else {
      console.log('PaymentMethod:', paymentMethod);

      // Send payment information to server
      try {
        const response = await axios.post('http://localhost:5000/createTransaction', {
          amount: 1000, // Example: Payment amount in cents
          currency: 'usd', // Example: Payment currency
          cardToken: paymentMethod.id, // Send the payment method ID to the server
          orderId: '123456', // Example: Order ID
        });
        console.log('Server Response:', response.data);
        alert('Payment successful!');
      } catch (error) {
        console.error('Error sending payment:', error);
        setError('Failed to process payment. Please try again.');
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h2 className="mb-4">Payment Form</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Card Details</label>
                <CardElement className="form-control" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!stripe}>
                Pay
              </button>
              {error && <div className="text-danger mt-2">{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
