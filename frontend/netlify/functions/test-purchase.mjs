import {
  json, sanitizeName, certConfigured, testPurchaseAllowed, issueCertificate
} from './lib/certs.mjs';
import { randomUUID } from 'node:crypto';

/* Mints a real certificate with no PayPal order behind it at all. Gated
   entirely on ALLOW_TEST_PURCHASE — see lib/certs.mjs. */
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!testPurchaseAllowed() || !certConfigured()) {
    return json({ error: 'Test purchases are not enabled on this site.' }, 503);
  }

  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const name = sanitizeName(body?.name);
  if (!name) return json({ error: 'A name must be inscribed (2–40 letters).' }, 400);

  try {
    const orderID = `TEST-${randomUUID()}`;
    const record = await issueCertificate(name, orderID, `TEST-TXN-${orderID.slice(5, 13)}`);
    const { serial, date, code } = record;
    return json({ certificate: { serial, name: record.name, date, code } });
  } catch (err) {
    console.error('test-purchase:', err);
    return json({ error: 'Failed to mint test certificate' }, 502);
  }
};
