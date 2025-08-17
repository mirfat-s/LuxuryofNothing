import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import paypal from '@paypal/checkout-server-sdk';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

// PayPal client configuration
let paypalClient;
if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
  const environment = PAYPAL_MODE === 'live' 
    ? new paypal.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
  
  paypalClient = new paypal.core.PayPalHttpClient(environment);
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    paypalMode: PAYPAL_MODE
  });
});

// PayPal create order endpoint
app.post('/api/payments/paypal/create-order', async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(500).json({
        error: 'PayPal not configured',
        message: 'Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET'
      });
    }

    const { amount, currency = 'USD' } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        },
        description: 'Luxury of Nothing - Premium Nothing Experience'
      }],
      application_context: {
        return_url: `${process.env.CORS_ORIGIN || 'http://localhost:5000'}/payment-success`,
        cancel_url: `${process.env.CORS_ORIGIN || 'http://localhost:5000'}/payment-cancelled`
      }
    });

    const order = await paypalClient.execute(request);
    
    res.json({
      success: true,
      orderID: order.result.id,
      status: order.result.status
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
});

// PayPal capture payment endpoint
app.post('/api/payments/paypal/capture-payment', async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(500).json({
        error: 'PayPal not configured',
        message: 'Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET'
      });
    }

    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({
        error: 'Missing order ID',
        message: 'Order ID is required'
      });
    }

    // Capture the payment
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    
    // Check if payment was successful
    if (capture.result.status === 'COMPLETED') {
      console.log(`Payment completed for order ${orderID}`);
      
      res.json({
        success: true,
        orderID: capture.result.id,
        status: capture.result.status,
        transactionID: capture.result.purchase_units[0].payments.captures[0].id,
        amount: capture.result.purchase_units[0].payments.captures[0].amount.value,
        currency: capture.result.purchase_units[0].payments.captures[0].amount.currency_code
      });
    } else {
      res.status(400).json({
        error: 'Payment not completed',
        message: `Payment status: ${capture.result.status}`
      });
    }

  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({
      error: 'Failed to capture payment',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 PayPal Mode: ${PAYPAL_MODE}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 