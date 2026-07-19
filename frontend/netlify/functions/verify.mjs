import {
  json, normalizeCode, findByCode, signCode, codesMatch, certConfigured
} from './lib/certs.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (!certConfigured()) {
    return json({ error: 'The concierge is unavailable. Verification is not configured.' }, 503);
  }

  const code = normalizeCode(new URL(req.url).searchParams.get('code'));
  if (!code) return json({ valid: false });

  try {
    const record = await findByCode(code);
    if (!record) return json({ valid: false });
    // Defence in depth: re-derive the code from the stored fields so a
    // tampered registry entry cannot validate.
    const expected = signCode(record.serial, record.name, record.date, record.orderID);
    if (!codesMatch(expected, code)) return json({ valid: false });
    return json({
      valid: true,
      serial: record.serial,
      name: record.name,
      date: record.date
    });
  } catch (err) {
    console.error('verify:', err);
    return json({ error: 'Verification failed' }, 502);
  }
};
