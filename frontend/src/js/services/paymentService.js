import { getApiBaseUrl, API_ENDPOINTS, PAYMENT_CONFIG } from '../config/api.js';

class PaymentService {
  constructor() {
    this.baseURL = getApiBaseUrl();
  }

  // Create PayPal order
  async createPayPalOrder(amount = PAYMENT_CONFIG.AMOUNT, currency = PAYMENT_CONFIG.CURRENCY) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.PAYPAL.CREATE_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  // Capture PayPal payment
  async capturePayPalPayment(orderID) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.PAYPAL.CAPTURE_PAYMENT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: orderID
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to capture payment');
      }

      return data;
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw error;
    }
  }

  // Process PayPal payment with frontend integration
  async processPayPalPayment(amount = PAYMENT_CONFIG.AMOUNT, currency = PAYMENT_CONFIG.CURRENCY) {
    try {
      // Create order first
      const orderData = await this.createPayPalOrder(amount, currency);
      
      // Return order data for frontend PayPal button
      return {
        success: true,
        orderID: orderData.orderID,
        status: orderData.status,
        amount: amount,
        currency: currency
      };
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      throw error;
    }
  }

  // Validate payment data
  validatePaymentData(amount, currency) {
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!currency || typeof currency !== 'string') {
      throw new Error('Currency must be a valid string');
    }

    return true;
  }

  // Generate order ID for tracking
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `LON-${timestamp}-${random}`.toUpperCase();
  }

  // Get PayPal button configuration
  getPayPalButtonConfig(amount = PAYMENT_CONFIG.AMOUNT, currency = PAYMENT_CONFIG.CURRENCY) {
    return {
      createOrder: async () => {
        const order = await this.createPayPalOrder(amount, currency);
        return order.orderID;
      },
      onApprove: async (data) => {
        try {
          const capture = await this.capturePayPalPayment(data.orderID);
          return capture;
        } catch (error) {
          console.error('Payment capture failed:', error);
          throw error;
        }
      },
      onError: (err) => {
        console.error('PayPal error:', err);
      }
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default PaymentService; 