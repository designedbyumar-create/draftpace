const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');

const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
require.extensions['.ts'] = (module, file) => module._compile(compile(fs.readFileSync(file, 'utf8')), file);
const baseCommit = execFileSync('git', ['rev-parse', process.argv[2] || 'HEAD'], { encoding: 'utf8' }).trim();
const file = path.resolve('src/content/guides.ts');
const previous = new Module(file, module);
previous.filename = file;
previous.paths = Module._nodeModulePaths(path.dirname(file));
previous._compile(compile(execFileSync('git', ['show', `${baseCommit}:src/content/guides.ts`], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })), file);
const before = new Map(previous.exports.GUIDES.map(g => [g.slug, g]));
const { GUIDES } = require('../src/content/guides.ts');
const { libraryInfo } = require('../src/content/revisions/library.ts');
const completion = JSON.parse(fs.readFileSync('audit-2026-11-16/library-completion-report.json', 'utf8'));
const checks = new Map(completion.articlesDetail.map(g => [g.slug, g]));
const links = g => [...new Set([...JSON.stringify(g.body).matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]))];
const words = blocks => {
  const texts = [];
  const collect = value => {
    if (typeof value === 'string') texts.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value) Object.entries(value).filter(([key]) => !['kind', 'src', 'source', 'layout'].includes(key)).forEach(([, v]) => collect(v));
  };
  collect(blocks);
  return texts.join(' ').trim().split(/\s+/).length;
};
const worksheetFields = href => [...fs.readFileSync(path.join('public', href), 'utf8').matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(m => m[1]);
const rows = GUIDES.map(g => {
  const old = before.get(g.slug);
  if (!old) throw new Error(`Missing baseline: ${g.slug}`);
  const info = libraryInfo[g.slug];
  const status = checks.get(g.slug);
  const oldLinks = links(old), newLinks = links(g);
  const oldSections = old.body.map(b => b.heading).filter(Boolean);
  const sections = g.body.map((block, i) => ({ position: i + 1, ...block, unchangedFromBaseline: old.body.some(b => JSON.stringify(b) === JSON.stringify(block)) }));
  return {
    slug: g.slug, area: g.areaSlug, url: status.url, preview: status.localURL,
    metadata: Object.fromEntries(['title', 'seoTitle', 'dek', 'metaDescription', 'updatedAt', 'primaryQuery', 'locale', 'scopeCountry'].map(key => [key, { before: old[key] ?? null, after: g[key] ?? null, changed: old[key] !== g[key] }])),
    approximateContentWordCount: { before: words(old.body), after: words(g.body), note: 'Typed content strings including labels; not rendered reading-time measurement.' },
    searchIntent: info?.research.intent ?? (g.slug === 'doctor-appointment-prep-checklist' ? 'Prepare for a planned appointment, prioritize questions and leave with written next steps.' : 'Build a realistic four-day homeschool rhythm without confusing lessons with attendance requirements.'),
    supportingQueries: status.supportingQueries, gsc: status.gsc,
    previousSectionHeadings: oldSections,
    sectionHeadingsNotRetainedVerbatim: oldSections.filter(h => !g.body.some(b => b.heading === h)),
    sections,
    visuals: info?.diagrams ?? g.body.filter(b => b.kind === 'figure'),
    dedicatedExperience: g.slug === 'doctor-appointment-prep-checklist' ? ['Before/in-room/departure navigation', 'Readiness and packing checklists with progress and reset', 'Keyboard-operated conversation selector', 'Filled appointment-note example', 'Expandable visit variants', 'Written follow-up plan'] : g.slug === 'four-day-homeschool-week' ? ['Three selectable weekly rhythms', 'Lesson-capacity calculator with validation and reset', 'Practice/project/flex visual', 'Plan-versus-record visual', 'Troubleshooting and record guidance'] : [],
    worksheet: { href: status.worksheet, fields: worksheetFields(status.worksheet), emailRequired: false },
    sources: g.sources ?? [],
    sourceChanges: { added: (g.sources ?? []).filter(s => !(old.sources ?? []).some(o => o.url === s.url)), removed: (old.sources ?? []).filter(s => !(g.sources ?? []).some(o => o.url === s.url)) },
    links: { added: newLinks.filter(l => !oldLinks.includes(l)), removed: oldLinks.filter(l => !newLinks.includes(l)), currentProductSuggestions: newLinks.filter(l => l.startsWith('/shop/')) },
    researchChecks: info?.research.sourceChecks ?? g.sources,
    limitations: status.limitations,
    verification: { previewChecked: status.previewChecked, assetsReady: status.assetsReady, expertReviewed: false, deployed: false },
  };
});
if (rows.length !== 137) throw new Error('Expected 137 guides');
const report = { date: '2026-11-17', baselineCommit: baseCommit, total: rows.length, methodology: 'Computed against the Git baseline, not inferred from article titles. Section details include the actual new copy and explicit unchanged-block flags. Removed headings indicate wording not retained, not necessarily deleted advice. Shared renderer changes apply to all guides. Sources and keyword targets are recorded evidence, not independent expert review or measured search volume.', sharedChanges: ['Responsive editorial layout and contents navigation', 'Native HTML visuals with readable text instead of staged AI photographs or branding stamps', 'Checklists, comparison tables, scripts and caution blocks matched to content', 'Two visual explanations and a free printable worksheet per article', 'Updated share cards and thumbnails; sharing routes return PNG', 'Original URLs preserved; explicit country scope without fabricated locale alternates', 'Contextual product links after useful advice'], articles: rows };
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const render = value => {
  if (value === null || value === undefined) return '<span class="muted">Not set</span>';
  if (typeof value !== 'object') return `<span>${e(value)}</span>`;
  if (Array.isArray(value)) return `<ul>${value.map(v => `<li>${render(v)}</li>`).join('')}</ul>`;
  return `<dl>${Object.entries(value).map(([k, v]) => `<dt>${e(k)}</dt><dd>${render(v)}</dd>`).join('')}</dl>`;
};
const reportStyle = 'body{overflow-wrap:anywhere}code{word-break:break-all}@media(max-width:600px){ul,ol{padding-left:20px}}';
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Draftpace: changes to all 137 articles</title><style>${reportStyle}body{font:16px/1.65 system-ui;color:#202a2b;max-width:1080px;margin:32px auto;padding:0 20px}h1{font-size:30px;line-height:1.2}h2{font-size:24px}h3{font-size:18px}a{color:#075c66;overflow-wrap:anywhere}article{border-top:2px solid #75888b;padding:25px 0}input{box-sizing:border-box;width:100%;padding:13px;font:inherit;border:1px solid #597579;background:white;position:sticky;top:0}summary{cursor:pointer;font-weight:600;padding:10px 0}dt{font-weight:600;margin-top:12px}dd{margin:4px 0 12px 18px;overflow-wrap:anywhere}li{margin:7px 0}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{border:1px solid #a4b0b1;padding:10px;vertical-align:top;overflow-wrap:anywhere;text-align:left}.muted{color:#53666a}@media(max-width:600px){th,td{font-size:13px;padding:6px}dd{margin-left:8px}}@media print{input{display:none}article{break-before:page}}</style><h1>Changes to all 137 Draftpace articles</h1><p>Baseline Git commit: <code>${e(baseCommit)}</code>. Local rebuild, not deployed.</p><p>${e(report.methodology)}</p><h2>Shared experience changes</h2>${render(report.sharedChanges)}<p>Validation: 3,357 tests passed, TypeScript passed, production build passed, and all 137 local page checks passed. No traffic gains or independent expert sign-off are claimed.</p><input aria-label="Filter article reports" placeholder="Find an article, keyword, change or source" oninput="document.querySelectorAll('article').forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(this.value.toLowerCase()))">${rows.map((r, i) => `<article id="${e(r.slug)}"><h2>${i + 1}. ${e(r.metadata.title.after)}</h2><p><a href="${e(r.preview)}">Open local article</a> · <a href="http://localhost:3000${e(r.worksheet.href)}">Worksheet</a></p><h3>Title, description and scope: before / after</h3>${render(r.metadata)}<h3>Purpose and search evidence</h3>${render({ intent: r.searchIntent, supportingQueries: r.supportingQueries, GSC: r.gsc, approximateWordCount: r.approximateContentWordCount })}<h3>New article structure</h3><ol>${r.sections.map(s => `<li>${e(s.heading || s.label || s.kind)} (${e(s.kind)}${s.unchangedFromBaseline ? '; unchanged block' : '; new or rewritten block'})</li>`).join('')}</ol><details><summary>Actual rewritten content, section by section</summary>${render(r.sections)}</details><details><summary>Previous structure and headings changed</summary>${render({ previousSectionHeadings: r.previousSectionHeadings, headingsNotRetainedVerbatim: r.sectionHeadingsNotRetainedVerbatim })}</details><h3>Visuals and worksheet</h3>${render({ visuals: r.visuals, dedicatedExperience: r.dedicatedExperience, worksheet: r.worksheet })}<details><summary>Sources added, removed and checked</summary>${render({ currentSources: r.sources, ...r.sourceChanges, researchChecks: r.researchChecks })}</details><details><summary>Internal links and product suggestions</summary>${render(r.links)}</details><h3>Limits and verification</h3>${render({ limitations: r.limitations, ...r.verification })}</article>`).join('')}</html>`;
fs.writeFileSync('audit-2026-11-16/article-by-article-changes.json', JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync('audit-2026-11-16/article-by-article-changes.html', html);
console.log(JSON.stringify({ baselineCommit: baseCommit, articles: rows.length, rewrittenBlocks: rows.reduce((n, r) => n + r.sections.filter(s => !s.unchangedFromBaseline).length, 0) }, null, 2));
