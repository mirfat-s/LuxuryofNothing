const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Paysera configuration
const PAYSERA_PROJECT_ID = process.env.PAYSERA_PROJECT_ID || 'YOUR_PAYSERA_PROJECT_ID';
const PAYSERA_PASSWORD = process.env.PAYSERA_PASSWORD || 'YOUR_PAYSERA_PASSWORD';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate Paysera signature endpoint
app.post('/generate-paysera-signature', (req, res) => {
  try {
    const { orderid, amount, currency, email, firstname, lastname } = req.body;

    // Paysera signature generation
    const data = {
      projectid: PAYSERA_PROJECT_ID,
      orderid: orderid,
      amount: '199900', // $1,999 in cents
      currency: 'USD',
      country: 'AL',
      p_email: email,
      p_firstname: firstname,
      p_lastname: lastname,
      test: '1' // Remove for production
    };

    // Create the signature string
    const signatureString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&') + PAYSERA_PASSWORD;

    // Generate MD5 hash
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    res.json({
      signature: signature,
      data: data
    });
  } catch (error) {
    console.error('Error generating Paysera signature:', error);
    res.status(500).send({
      error: error.message
    });
  }
});

// Paysera callback endpoint
app.post('/paysera-callback', (req, res) => {
  try {
    const { orderid, amount, currency, status } = req.body;

    console.log('Paysera callback received:', {
      orderid,
      amount,
      currency,
      status
    });

    // Here you would:
    // 1. Verify the callback signature
    // 2. Update your database
    // 3. Send confirmation emails
    // 4. Handle the order fulfillment

    if (status === '1') {
      console.log(`Payment successful for order ${orderid}`);
      // Handle successful payment
    } else {
      console.log(`Payment failed for order ${orderid}`);
      // Handle failed payment
    }

    res.send('OK');
  } catch (error) {
    console.error('Error handling Paysera callback:', error);
    res.status(500).send('ERROR');
  }
});

// Success page
app.get('/success', (req, res) => {
  res.send(`
    <html>
      <head><title>Payment Successful</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>🎉 Payment Successful!</h1>
        <p>Thank you for your purchase of absolutely nothing.</p>
        <p>You will receive a confirmation email shortly.</p>
        <a href="/" style="color: #B8A67A;">Return to site</a>
      </body>
    </html>
  `);
});

// Cancel page
app.get('/cancel', (req, res) => {
  res.send(`
    <html>
      <head><title>Payment Cancelled</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges were made.</p>
        <a href="/" style="color: #B8A67A;">Return to site</a>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see your site`);
});
