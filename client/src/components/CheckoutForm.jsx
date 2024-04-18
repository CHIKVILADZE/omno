import React, { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('http://localhost:5000/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, 
          currency: 'usd',
        }),
      });

      const data = await response.json();
      const { clientSecret } = data;

  

     

      return clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error.message);
      throw new Error('Failed to create payment intent.');
    }
  };

  const getToken = async () => {
    const clientId = 'dd541f32-39d1-4389-8ec8-b91dcf81782f';
    const clientSecret = 'fcfba06a-75b4-481b-a792-350e234b9e5d';
    const tokenEndpoint = 'http://localhost:5000/get-oauth-token';
  
 try {
  const response = await axios.post(tokenEndpoint, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const { access_token } = response.data;


  return access_token;
 } catch (error) {
  console.error('Error fetching access token:', error.message);
  throw new Error('Failed to obtain access token.');
 }
};


  const initiatePayment = async (paymentDetails) => {

    try {
        const token = await getToken();
        
      const response = await axios.post(
        'http://localhost:5000/transaction/create',
        paymentDetails,
        {
          headers: {
            'Content-Type': 'application/json',
            "Accept": "*/*",
            'Authorization': `Bearer ${token}`,           },
        }
      );
  
      console.log('OMNO API Response:', response.data);
      alert('Payment initiated successfully!');
    } catch (error) {
      console.error('Error initiating payment:', error.message);
      setError('Failed to initiate payment. Please try again.');
    }
  };
  
  

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!stripe || !elements) {
      return;
    }
  
    try {
      setProcessing(true);
  
      const clientSecret = await createPaymentIntent();
  
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'John Doe',
          },
        },
      });
  
      if (stripeError) {
        throw new Error(stripeError.message);
      }
  
      console.log('PaymentIntent:', paymentIntent);
      alert('Payment successful!');
  
      const paymentDetails = {
        amount: 1000,
        currency: 'USD',
        callback: 'https://localhost:3000',
        callbackFail: 'https://localhost:3000',
      };
  
      await initiatePayment(paymentDetails);
    } catch (error) {
      console.error('Error processing payment:', error.message);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h2 className="mb-4 text-center">Payment Form</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="cardElement" className="mb-2">Card Details</label>
                <CardElement id="cardElement" className="form-control" />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block mt-4"
                disabled={!stripe || processing}
              >
                {processing ? 'Processing...' : 'Pay'}
              </button>
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
