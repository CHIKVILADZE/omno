// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Stripe API setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(bodyParser.json());

// Mock function to create Omno transaction
const createOmnoTransaction = async (paymentIntent) => {
  // Implement logic to create Omno transaction here
  return { id: 'mocked-transaction-id', status: 'success' };
};

// Endpoint to create a transaction
app.post('/createTransaction', async (req, res) => {
  try {
    const { amount, currency, cardToken, orderId } = req.body;

    // Create a Payment Intent with the provided card token
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method: cardToken,
      confirm: true,
      description: `Payment for order ${orderId}`,
      return_url: 'http://localhost:3000/payment/success', // Specify your return URL here
    });

    console.log('Payment Intent created:', paymentIntent);

    // Call function to create Omno transaction with payment intent details
    const transactionResponse = await createOmnoTransaction(paymentIntent);

    // Return transaction details in the response
    res.status(200).json({ transaction: transactionResponse });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Error creating transaction' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
