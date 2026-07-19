/* Certificate issuance, signing, and storage.
   The verification code is an HMAC over the certificate's fields, keyed by
   CERT_SECRET — nobody without the secret can mint a code that verifies,
   and altering any field invalidates the code. */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';

const RECENT_LIMIT = 12;

export function store() {
  const dir = process.env.LOCAL_BLOBS_DIR;
  if (dir && process.env.CONTEXT !== 'production') return localStore(dir);
  return getStore('registry');
}

/* Dev-only stand-in for Netlify Blobs: one JSON file per key.
   Active only when LOCAL_BLOBS_DIR is set outside production. */
function localStore(dir) {
  return {
    async get(key, _opts) {
      const { readFile } = await import('node:fs/promises');
      try {
        return JSON.parse(await readFile(`${dir}/${encodeURIComponent(key)}.json`, 'utf8'));
      } catch { return null; }
    },
    async setJSON(key, value) {
      const { writeFile, mkdir } = await import('node:fs/promises');
      await mkdir(dir, { recursive: true });
      await writeFile(`${dir}/${encodeURIComponent(key)}.json`, JSON.stringify(value));
    }
  };
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

/* Keep letters (any script), marks, apostrophes, dots, hyphens, spaces. */
export function sanitizeName(raw) {
  if (typeof raw !== 'string') return null;
  const name = raw
    .replace(/[^\p{L}\p{M}'. -]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
  return name.length >= 2 ? name : null;
}

export function publicName(name) {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function signCode(serial, name, date, orderID) {
  const digest = createHmac('sha256', requireSecret())
    .update(`${serial}|${name}|${date}|${orderID}`)
    .digest('hex')
    .toUpperCase()
    .slice(0, 12);
  return `${digest.slice(0, 4)}-${digest.slice(4, 8)}-${digest.slice(8, 12)}`;
}

export function codesMatch(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function normalizeCode(raw) {
  const hex = String(raw || '').toUpperCase().replace(/[^0-9A-F]/g, '');
  if (hex.length !== 12) return null;
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

function requireSecret() {
  const s = process.env.CERT_SECRET;
  if (!s || s.length < 16) throw new Error('CERT_SECRET is not configured');
  return s;
}

export function certConfigured() {
  return !!process.env.CERT_SECRET && process.env.CERT_SECRET.length >= 16;
}

/* Opt-in escape hatch for testing the full purchase → certificate → registry
   → verify flow with no real payment. Off unless explicitly enabled — never
   leave this set to 'true' on a site taking real orders. */
export function testPurchaseAllowed() {
  return process.env.ALLOW_TEST_PURCHASE === 'true';
}

export async function findByOrder(orderID) {
  return await store().get(`order:${orderID}`, { type: 'json' });
}

export async function findByCode(code) {
  return await store().get(`cert:${code}`, { type: 'json' });
}

export async function issueCertificate(name, orderID, txnID) {
  const s = store();
  const counter = (await s.get('counter', { type: 'json' })) || { next: 1 };
  const serial = String(counter.next).padStart(3, '0');
  await s.setJSON('counter', { next: counter.next + 1 });

  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const code = signCode(serial, name, date, orderID);
  const record = {
    serial, name, publicName: publicName(name), date, code, orderID,
    txnID, issuedAt: new Date().toISOString()
  };

  await s.setJSON(`cert:${code}`, record);
  await s.setJSON(`order:${orderID}`, record);

  const recent = (await s.get('recent', { type: 'json' })) || [];
  recent.unshift({ serial, name: record.publicName, date });
  await s.setJSON('recent', recent.slice(0, RECENT_LIMIT));

  return record;
}

export async function recentCertificates() {
  return (await store().get('recent', { type: 'json' })) || [];
}
