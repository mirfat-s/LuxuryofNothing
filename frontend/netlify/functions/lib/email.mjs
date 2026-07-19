/* Certificate delivery by email, via Resend's HTTP API (no SDK — a plain
   fetch keeps the function bundle small and avoids native deps).
   Env: RESEND_API_KEY, CERT_EMAIL_FROM (a verified Resend sender, e.g.
   "Luxury of Nothing <concierge@luxuryofnothing.life>"). */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function emailConfigured() {
  return !!process.env.RESEND_API_KEY && !!process.env.CERT_EMAIL_FROM;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderHtml({ name, serial, date, code }) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; color: #131210;">
    <p style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #9A8B6A;">
      Luxury of Nothing
    </p>
    <h1 style="font-size: 22px; font-weight: 500; margin: 0.4em 0;">Nothing Is Now Yours</h1>
    <p style="font-size: 15px; line-height: 1.6;">
      Dear ${escapeHtml(name)},
    </p>
    <p style="font-size: 15px; line-height: 1.6;">
      Your Certificate of Absence &mdash; Edition &#8470; ${escapeHtml(serial)}, issued
      ${escapeHtml(date)} &mdash; is attached to this message as a PDF, inscribed
      in your name and entered into the public Registry of Absence.
    </p>
    <p style="font-size: 15px; line-height: 1.6;">
      Your verification code is <strong>${escapeHtml(code)}</strong>. Keep it
      private &mdash; it is the sole proof that your nothing is real, and can
      be authenticated any time at luxuryofnothing.life.
    </p>
    <p style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 0.1em; color: #9A8B6A; margin-top: 2em;">
      No rights necessary.
    </p>
  </div>`;
}

export async function sendCertificateEmail({ to, name, serial, date, code, pdfBase64 }) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.CERT_EMAIL_FROM,
      to: [to],
      subject: `Your Certificate of Absence — Edition № ${serial}`,
      html: renderHtml({ name, serial, date, code }),
      attachments: [{
        filename: 'certificate-of-absence.pdf',
        content: pdfBase64
      }]
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend send failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  return res.json();
}
