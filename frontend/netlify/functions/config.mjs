import { json, testPurchaseAllowed } from './lib/certs.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  return json({ testPurchase: testPurchaseAllowed() });
};
