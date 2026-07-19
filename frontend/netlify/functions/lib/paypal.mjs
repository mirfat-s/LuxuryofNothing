/* PayPal REST helpers (ported from backend/server.js, SDK-free).
   Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE (live|sandbox).
   MOCK_PAYMENTS=true short-circuits PayPal for local dev only — it is
   ignored on production deploys. */

export const PRICE = '1999.00';
export const CURRENCY = 'USD';

function apiBase() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

export function mockMode() {
  return process.env.MOCK_PAYMENTS === 'true' && process.env.CONTEXT !== 'production';
}

export function isConfigured() {
  return mockMode() || (!!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET);
}

async function accessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const data = await res.json();
  return data.access_token;
}

/* Create an order for exactly one unit of Nothing. Price is fixed here,
   server-side — the client cannot alter it. */
export async function createOrder() {
  if (mockMode()) {
    return { id: 'MOCK-' + Math.random().toString(36).slice(2, 12).toUpperCase() };
  }
  const token = await accessToken();
  const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: CURRENCY, value: PRICE },
        description: 'Absolutely Nothing — Luxury of Nothing'
      }]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal create order failed: ${JSON.stringify(data)}`);
  return { id: data.id };
}

/* Capture a previously approved order. Returns { completed, txnID }.
   Treats ORDER_ALREADY_CAPTURED as success (retry after a partial failure). */
export async function captureOrder(orderID) {
  if (mockMode()) {
    return { completed: true, txnID: 'MOCK-TXN-' + orderID.slice(-6) };
  }
  const token = await accessToken();
  const res = await fetch(`${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  const data = await res.json();

  if (res.status === 422 && JSON.stringify(data).includes('ORDER_ALREADY_CAPTURED')) {
    const check = await fetch(`${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderID)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const order = await check.json();
    const cap = order?.purchase_units?.[0]?.payments?.captures?.[0];
    return {
      completed: order.status === 'COMPLETED' && cap?.amount?.value === PRICE,
      txnID: cap?.id || null
    };
  }
  if (!res.ok) throw new Error(`PayPal capture failed: ${JSON.stringify(data)}`);

  const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
  const completed =
    data.status === 'COMPLETED' &&
    cap?.status === 'COMPLETED' &&
    cap?.amount?.value === PRICE &&
    cap?.amount?.currency_code === CURRENCY;
  return { completed, txnID: cap?.id || null };
}
