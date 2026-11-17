import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../audit-2026-11-16/', import.meta.url);
const inventory = JSON.parse(await readFile(new URL('inventory.json', root), 'utf8'));
const ready = new Set(['doctor-appointment-prep-checklist', 'four-day-homeschool-week']);
let revisions={},assets={},previews={};
try{revisions=JSON.parse(await readFile(new URL('../src/content/revisions/library.generated.json',import.meta.url),'utf8'));}catch{}
try{assets=JSON.parse(await readFile(new URL('library-asset-checks.json',root),'utf8'));}catch{}
try{previews=JSON.parse(await readFile(new URL('library-preview-checks.json',root),'utf8'));}catch{}
for(const slug of Object.keys(revisions))if(assets[slug]?.images===2&&previews[slug]?.passed)ready.add(slug);
const entries = inventory.map(({ url }) => {
  const slug = url.split('/').pop();
  return { slug, url, status: ready.has(slug) ? 'local-preview-complete' : revisions[slug] ? 'rewritten-pending-preview-checks' : 'not-rewritten', deployed: false };
});
await writeFile(new URL('rebuild-status.json', root), JSON.stringify({ scope: entries.length, localPreviews: ready.size, publishedRewrites: 0, entries }, null, 2) + '\n');
console.log(`${ready.size}/${entries.length} local previews; no production rewrites deployed.`);
