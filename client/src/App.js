import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './components/CheckoutForm';

const stripePromise = loadStripe('pk_test_51Ore9KFnY7fu60VTniR3zMESq9lvcEyAv88ooAVmJmHxGjUblgVL9U6MzH6tnpcpJOtpu6a0cLJilcmiwwCb7v11007DXru6HJ');

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
