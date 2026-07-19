/* Certificate delivery via Netlify's built-in Email Integration extension
   (Postmark / SendGrid / Mailgun, configured in Site configuration → Emails).
   The extension exposes an internal function, /.netlify/functions/emails/<template>,
   that renders the Handlebars template at emails/<template>/index.html and
   sends it through whichever provider is configured — we never talk to the
   provider directly, and never see its API key (that's held by the extension).
   Env: NETLIFY_EMAILS_SECRET (auto-set by the extension), CERT_EMAIL_FROM
   (a sender verified with the configured provider). */

const TEMPLATE = 'certificate';
const MAX_ATTEMPTS = 3;

export function emailConfigured() {
  return !!process.env.NETLIFY_EMAILS_SECRET && !!process.env.CERT_EMAIL_FROM;
}

/* A function calling back into its own site's public URL occasionally hits
   a stale pooled connection from a prior Lambda invocation, surfacing as a
   bare "fetch failed" wrapping a TLS handshake error — nothing to do with
   the request itself. Retry a couple of times before giving up; real HTTP
   error responses (4xx/5xx from the endpoint) are returned as-is, not
   retried, since those are legitimate outcomes. */
async function fetchWithRetry(url, options) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
  throw lastErr;
}

export async function sendCertificateEmail({ to, name, serial, date, code, pdfBase64 }) {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!base) throw new Error('Site URL is not available to reach the email function');

  const res = await fetchWithRetry(`${base}/.netlify/functions/emails/${TEMPLATE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'netlify-emails-secret': process.env.NETLIFY_EMAILS_SECRET
    },
    body: JSON.stringify({
      from: process.env.CERT_EMAIL_FROM,
      to,
      subject: `Your Certificate of Absence — Edition № ${serial}`,
      parameters: { name, serial, date, code },
      attachments: [{
        content: pdfBase64,
        filename: 'certificate-of-absence.pdf',
        type: 'pdf'
      }]
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Netlify email send failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  return res.json().catch(() => ({}));
}
