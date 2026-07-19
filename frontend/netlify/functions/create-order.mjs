import { createOrder, isConfigured } from './lib/paypal.mjs';
import { json } from './lib/certs.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!isConfigured()) {
    return json({ error: 'The concierge is unavailable. Payments are not configured.' }, 503);
  }
  try {
    const order = await createOrder();
    return json({ orderID: order.id });
  } catch (err) {
    console.error('create-order:', err);
    return json({ error: 'Failed to create order' }, 502);
  }
};
