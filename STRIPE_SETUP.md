# Paysera Payment Integration for Albania 🇦🇱

## 🚀 Quick Start Guide - Paysera Integration

### 1. Create a Paysera Account
1. Go to [paysera.com](https://www.paysera.com) and create a business account
2. Complete the verification process (required for Albania)
3. Navigate to the Merchant Dashboard
4. Apply for payment processing services

### 2. Get Your Paysera Credentials
1. In your Paysera Dashboard, go to **Services** → **Payment Gateway**
2. Create a new project or select existing one
3. Copy your **Project ID** (numeric ID)
4. Copy your **Project Password** (used for signature generation)
5. Set up your callback URLs

### 3. Update Your Code

#### Frontend (public/philosophy-products.html)
Replace these lines around line 381:
```javascript
const PAYSERA_PROJECT_ID = 'YOUR_PAYSERA_PROJECT_ID';
const PAYSERA_PASSWORD = 'YOUR_PAYSERA_PASSWORD';
```
With your actual credentials:
```javascript
const PAYSERA_PROJECT_ID = '12345'; // Your actual project ID
const PAYSERA_PASSWORD = 'your_actual_password'; // Your actual password
```

#### Backend (server.js)
Replace these lines around line 9:
```javascript
const PAYSERA_PROJECT_ID = process.env.PAYSERA_PROJECT_ID || 'YOUR_PAYSERA_PROJECT_ID';
const PAYSERA_PASSWORD = process.env.PAYSERA_PASSWORD || 'YOUR_PAYSERA_PASSWORD';
```
With your actual credentials or set environment variables.

### 4. Install Dependencies
Run in your terminal:
```bash
npm install
```

### 5. Start the Server
```bash
npm start
```

Your site will be available at: http://localhost:3000

## 🔧 Configuration Options

### 🇦🇱 Albania-Specific Configuration

#### Currency
The system is configured for EUR (€1,850) which is commonly used in Albania:
```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 185000, // €1,850 in cents
  currency: 'eur',
  // ...
});
```

#### Payment Methods for Albania
The system supports:
- **Credit/Debit Cards** (Visa, Mastercard)
- **PayPal** (very popular in Albania)
- **SEPA Bank Transfers**
- **European payment methods**

#### PayPal Setup for Albania
1. Create a PayPal Business account
2. Get your Client ID from PayPal Developer Dashboard
3. Replace `YOUR_PAYPAL_CLIENT_ID` in the HTML file
4. PayPal automatically handles EUR currency

### Price
Current price: €1,850 (185000 cents in Stripe)

### Webhooks (Optional)
For production, set up webhooks to handle payment confirmations:
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/webhook`
3. Select events: `payment_intent.succeeded`
4. Copy the webhook secret and add it to your environment variables

## 🛡️ Security Notes

### Environment Variables
For production, use environment variables:
```bash
# Create a .env file
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### HTTPS Required
Stripe requires HTTPS in production. Use services like:
- Heroku
- Vercel
- Netlify
- AWS

## 🧪 Testing

### Test Card Numbers
Use these test cards in development:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

Any future expiry date and any 3-digit CVC will work.

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy your code
4. Update the Stripe publishable key in your frontend

### Domain Setup
1. Point your domain to your server
2. Set up SSL certificate
3. Update Stripe settings with your live domain

## 📞 Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- Test your integration with Stripe's test mode before going live

## ✅ Checklist

- [ ] Created Stripe account
- [ ] Got API keys
- [ ] Updated frontend with publishable key
- [ ] Updated backend with secret key
- [ ] Installed dependencies
- [ ] Tested with test card numbers
- [ ] Set up webhooks (optional)
- [ ] Deployed to production with HTTPS
- [ ] Switched to live keys for production

Your payment system is now ready! 🎉
