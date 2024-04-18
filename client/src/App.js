import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './components/CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
const App = () => {

  return (
    <Elements stripe={stripePromise}>
      <div className="App">
        <h1>Stripe Payment Form</h1>
        <CheckoutForm />
      </div>
    </Elements>
  );
};

export default App;
