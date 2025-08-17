// API Configuration
const API_CONFIG = {
  // Development
  development: {
    baseURL: 'http://localhost:3000',
    apiVersion: 'v1'
  },
  // Production
  production: {
    baseURL: process.env.API_BASE_URL || 'https://your-api-domain.com',
    apiVersion: 'v1'
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  return window.location.hostname === 'localhost' ? 'development' : 'production';
};

// Get API base URL
export const getApiBaseUrl = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env].baseURL;
};

// API Endpoints
export const API_ENDPOINTS = {
  PAYPAL: {
    CREATE_ORDER: '/api/payments/paypal/create-order',
    CAPTURE_PAYMENT: '/api/payments/paypal/capture-payment'
  },
  HEALTH: '/health'
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  CURRENCY: 'USD',
  AMOUNT: 1999.00, // $1,999.00
  COUNTRY: 'US'
};

// Environment variables
export const ENV = {
  NODE_ENV: getCurrentEnvironment(),
  IS_DEVELOPMENT: getCurrentEnvironment() === 'development',
  IS_PRODUCTION: getCurrentEnvironment() === 'production'
}; 