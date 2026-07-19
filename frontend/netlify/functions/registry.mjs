import { json, recentCertificates, certConfigured } from './lib/certs.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (!certConfigured()) {
    return json({ error: 'The registry is unavailable.' }, 503);
  }
  try {
    return json({ certificates: await recentCertificates() });
  } catch (err) {
    console.error('registry:', err);
    return json({ error: 'The registry is unavailable.' }, 502);
  }
};
