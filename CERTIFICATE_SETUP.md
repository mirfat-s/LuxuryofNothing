# Certificate of Absence — Setup Guide

Every real purchase now mints a **personalized, cryptographically signed
certificate** and records it in the public Registry of Absence. Issuance is
payment-verified: the serverless function confirms with PayPal's API that the
order was actually captured before signing anything.

For this to work in production you must set **four environment variables in
Netlify**. Until they are set, checkout and the registry show a graceful
"concierge unavailable" state.

## 1. Get PayPal REST API credentials

1. Go to https://developer.paypal.com/dashboard/applications/live
   (log in with the PayPal business account that owns the current buttons).
2. Open (or create) a **REST API app**.
3. Copy the **Client ID** and **Secret**.

> The Client ID must be the same one used in the PayPal SDK `<script>` tag in
> `frontend/src/checkout.html`. If your REST app has a different Client ID,
> update the `client-id=` parameter in that script tag to match.

## 2. Generate a certificate signing secret

Any long random string works. For example, in a terminal:

```bash
openssl rand -hex 32
```

This is the key that makes certificates unforgeable — anyone who has it could
mint valid certificates, so treat it like a password. Never commit it.

## 3. Set the environment variables in Netlify

Netlify dashboard → your site → **Site configuration → Environment variables**
→ Add:

| Variable | Value |
|---|---|
| `PAYPAL_CLIENT_ID` | from step 1 |
| `PAYPAL_CLIENT_SECRET` | from step 1 |
| `PAYPAL_MODE` | `sandbox` to test first, then `live` |
| `CERT_SECRET` | from step 2 |

Then trigger a redeploy (Deploys → Trigger deploy).

## 4. Test before going live

1. Set `PAYPAL_MODE=sandbox` and use sandbox buyer credentials from
   https://developer.paypal.com/dashboard/accounts to complete a test purchase.
2. Confirm: the personalized certificate appears after payment, the name shows
   in the Registry of Absence on the homepage, and entering the verification
   code in "Authenticate a certificate" reports **Authentic** (and a modified
   code reports a forgery).
3. Switch `PAYPAL_MODE` to `live` and redeploy.

## How the anti-forgery works

- Each certificate's verification code is
  `HMAC-SHA256(CERT_SECRET, serial|name|date|orderID)`, truncated to a
  `XXXX-XXXX-XXXX` code. Without `CERT_SECRET`, no one can compute a code the
  verifier accepts; changing any detail (name, serial, date) invalidates it.
- Issued certificates are stored in Netlify Blobs (store name `registry`).
  The `/api/verify` endpoint checks both the stored record and the recomputed
  signature.
- Issuance is idempotent per PayPal order: retrying a paid order returns the
  original certificate instead of minting a new serial.

## 5. (Optional) Let buyers email themselves the PDF

On the certificate page, buyers can enter an email address and have the
certificate delivered as a PDF attachment instead of (or in addition to)
downloading it. This uses Netlify's built-in **Email Integration** extension
(backed by Postmark, SendGrid, or Mailgun — whichever you already have an
account with), not a separate email API of its own.

### 5a. Turn on the extension

1. In the Netlify dashboard: **Project configuration → Emails → Configuration**.
2. Select **Enable email extension**.
3. Pick a provider (**Postmark**, **SendGrid**, or **Mailgun**) and paste its
   API key. (Get the key from that provider's own dashboard — you need an
   account with one of them; the extension just relays through it.)
4. If you chose Mailgun, also fill in your Mailgun domain and host region.
5. Leave **Emails directory** as `./emails` (that's where the template lives:
   `frontend/emails/certificate/index.html`).
6. Make sure the scopes for this include **Builds** and **Functions**.
7. Save, then trigger a redeploy.

Netlify sets `NETLIFY_EMAILS_PROVIDER`, `NETLIFY_EMAILS_PROVIDER_API_KEY`, and
`NETLIFY_EMAILS_SECRET` for you automatically once this is configured — you
don't add those yourself.

### 5b. Set the sender

Add one more Netlify environment variable by hand:

| Variable | Value |
|---|---|
| `CERT_EMAIL_FROM` | A sender address verified with your chosen provider, e.g. `Luxury of Nothing <concierge@yourdomain.com>` |

(Postmark/SendGrid/Mailgun all require you to verify the sending domain or
address with them directly before they'll deliver — check that provider's own
dashboard if sends fail.)

Until the extension is enabled *and* `CERT_EMAIL_FROM` is set, the "Send PDF"
button on the certificate page shows a graceful "concierge unavailable" error
instead of failing silently.

### How it works

`frontend/netlify/functions/email-certificate.mjs` renders the certificate
PNG (the same rasterisation the Download button produces) into a one-page PDF
with `pdf-lib`, then POSTs it to Netlify's internal
`/.netlify/functions/emails/certificate` endpoint, which fills in
`frontend/emails/certificate/index.html` and sends it through whichever
provider you configured.

The endpoint (`/api/email-certificate`) is gated on the certificate's private
verification code, so it can only send a certificate that was actually
issued — it can't be used as an open relay to email arbitrary attachments to
arbitrary addresses. Each certificate can be re-sent up to 5 times.

## Testing a purchase on the live site without paying

Set `ALLOW_TEST_PURCHASE=true` as a fifth Netlify environment variable and
redeploy. This reveals a **"Test Purchase — No Payment (Dev Mode)"** button
on the checkout page (below the PayPal buttons) that mints a real,
verifiable certificate — inscribed with the name you enter, appearing in the
public Registry of Absence, checkable at "Authenticate a certificate" —
without going through PayPal at all.

**This is a genuine bypass of payment on your live site.** Anyone who finds
the button can mint certificates for free. Remove the `ALLOW_TEST_PURCHASE`
variable (or set it to anything other than `true`) and redeploy as soon as
you're done testing, before real customers arrive.

## Local development

Run from the repo root:

```bash
cd frontend
MOCK_PAYMENTS=true CERT_SECRET=dev-secret-not-for-production npx netlify dev
```

`MOCK_PAYMENTS=true` skips the PayPal API (orders/captures are simulated) so
the whole flow — checkout → certificate → registry → verify — works without
credentials. The flag is ignored on production deploys.
