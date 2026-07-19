import {
  json, normalizeCode, findByCode, signCode, codesMatch, certConfigured,
  recordEmailSend
} from './lib/certs.mjs';
import { emailConfigured, sendCertificateEmail } from './lib/netlifyEmail.mjs';
import { pngToPdf } from './lib/pdf.mjs';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,24}$/;
const IMAGE_RE = /^data:image\/png;base64,([a-zA-Z0-9+/]+={0,2})$/;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_EMAIL_SENDS = 5;

/* Emails the certificate as a PDF attachment. The image is rasterised
   client-side (same as the Download button) rather than re-rendered here —
   this is a novelty keepsake, not a legal instrument, so trusting the
   client's snapshot of what it just showed the buyer is an acceptable
   trade for not needing SVG/font rendering in a serverless function.
   What *is* enforced server-side: the request must carry the certificate's
   private verification code, so this endpoint can't be used as an open
   relay to blast arbitrary attachments to arbitrary addresses — only
   someone who actually holds a real, issued certificate can trigger a
   send, and each certificate can only be re-sent a handful of times. */
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!certConfigured() || !emailConfigured()) {
    return json({ error: 'The concierge is unavailable. Email delivery is not configured.' }, 503);
  }

  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 254) : '';
  const code = normalizeCode(body?.code);
  const image = typeof body?.image === 'string' ? body.image : '';

  if (!EMAIL_RE.test(email)) return json({ error: 'Enter a valid email address.' }, 400);
  if (!code) return json({ error: 'Missing verification code.' }, 400);

  const imageMatch = IMAGE_RE.exec(image);
  if (!imageMatch) return json({ error: 'Missing certificate image.' }, 400);
  const pngBase64 = imageMatch[1];
  if (pngBase64.length * 0.75 > MAX_IMAGE_BYTES) {
    return json({ error: 'Certificate image is too large.' }, 400);
  }

  try {
    const record = await findByCode(code);
    if (!record) return json({ error: 'Verification code not recognised.' }, 404);
    // Defence in depth: re-derive the code from the stored fields so a
    // tampered registry entry cannot pass this gate.
    const expected = signCode(record.serial, record.name, record.date, record.orderID);
    if (!codesMatch(expected, code)) return json({ error: 'Verification code not recognised.' }, 404);

    if ((record.emailSends || 0) >= MAX_EMAIL_SENDS) {
      return json({ error: 'This certificate has already been emailed several times. Please use Download instead.' }, 429);
    }

    const pdfBytes = await pngToPdf(Buffer.from(pngBase64, 'base64'));
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    await sendCertificateEmail({
      to: email,
      name: record.name,
      serial: record.serial,
      date: record.date,
      code,
      pdfBase64
    });

    await recordEmailSend(record);
    return json({ ok: true });
  } catch (err) {
    console.error('email-certificate:', err);
    return json({ error: 'Failed to send the certificate' }, 502);
  }
};
