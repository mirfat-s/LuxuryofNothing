import { captureOrder, isConfigured } from './lib/paypal.mjs';
import {
  json, sanitizeName, certConfigured, findByOrder, issueCertificate
} from './lib/certs.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!isConfigured() || !certConfigured()) {
    return json({ error: 'The concierge is unavailable. Certificates are not configured.' }, 503);
  }

  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const orderID = typeof body?.orderID === 'string' ? body.orderID.slice(0, 64) : null;
  const name = sanitizeName(body?.name);
  if (!orderID) return json({ error: 'Missing order ID' }, 400);
  if (!name) return json({ error: 'A name must be inscribed (2–40 letters).' }, 400);

  try {
    // Idempotent: a re-request for an already-certified order returns the
    // original certificate rather than minting a second one.
    const existing = await findByOrder(orderID);
    if (existing) {
      const { serial, date, code } = existing;
      return json({ certificate: { serial, name: existing.name, date, code } });
    }

    const capture = await captureOrder(orderID);
    if (!capture.completed) {
      return json({ error: 'Payment was not completed. No absence has been transferred.' }, 402);
    }

    const record = await issueCertificate(name, orderID, capture.txnID);
    const { serial, date, code } = record;
    return json({ certificate: { serial, name: record.name, date, code } });
  } catch (err) {
    console.error('capture-order:', err);
    return json({ error: 'Failed to complete the acquisition' }, 502);
  }
};
