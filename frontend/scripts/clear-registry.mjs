/* One-off cleanup: wipes every key in the 'registry' Netlify Blobs store
   (all issued test certificates, the recent-list, and the serial counter).

   Usage (from frontend/):
     NETLIFY_SITE_ID=<site-id> NETLIFY_AUTH_TOKEN=<token> node scripts/clear-registry.mjs

   Add --dry-run to only list what would be deleted, without deleting it. */

import { getStore } from '@netlify/blobs';

const siteID = process.env.NETLIFY_SITE_ID;
const token = process.env.NETLIFY_AUTH_TOKEN;
const dryRun = process.argv.includes('--dry-run');

if (!siteID || !token) {
  console.error('Set NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN environment variables first.');
  process.exit(1);
}

const store = getStore({ name: 'registry', siteID, token });

const { blobs } = await store.list();

if (blobs.length === 0) {
  console.log('registry store is already empty.');
  process.exit(0);
}

console.log(`Found ${blobs.length} key(s) in 'registry':`);
for (const { key } of blobs) console.log(`  ${key}`);

if (dryRun) {
  console.log('\nDry run — nothing deleted.');
  process.exit(0);
}

for (const { key } of blobs) {
  await store.delete(key);
  console.log(`Deleted ${key}`);
}

console.log(`\nDone — removed ${blobs.length} key(s).`);
