require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const axios = require('axios');


app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
    });

    console.log("PaymentIntent:", paymentIntent);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/get-oauth-token', async (req, res) => {
  try {
    const clientId = process.env.OMNO_CLIENT_ID;
    const clientSecret = process.env.OMNO_CLIENT_SECRET;
    const tokenEndpoint = 'https://sso.omno.com/realms/omno/protocol/openid-connect/token';

    const response = await axios.post(tokenEndpoint, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching access token:', error.message);
    res.status(500).json({ error: 'Failed to fetch access token' });
  }
});

app.post('/transaction/create', async (req, res) => {
  const paymentDetails = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; 

  

  try {
  
    const response = await axios.post('https://api.omno.com/transaction/create', paymentDetails, {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*",
        'Authorization': `Bearer ${token}`
      },
    });

    console.log('OMNO API Response:', response.data);
  } catch (error) {
    console.error('Error creating payment transaction:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (error.response) {
      console.error('OMNO API Error Response Data:', error.response.data);
      console.error('OMNO API Error Response Status:', error.response.status);
      console.error('OMNO API Error Response Headers:', error.response.headers);
    }

    res.status(500).json({ error: 'Failed to create payment transaction' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
