const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { z } = require('zod');

require.extensions['.ts'] = function(module, file) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  module._compile(code, file);
};
const { GUIDES } = require('../src/content/guides.ts');
const base = new Map(GUIDES.map((g) => [g.slug, g]));
const root = process.cwd();
const dir = path.join(root, 'src/content/revisions');
const str = z.string().min(1);
const block = z.discriminatedUnion('kind', [
  z.object({kind:z.literal('paragraphs'),heading:str.optional(),paragraphs:z.array(str).min(1)}),
  z.object({kind:z.literal('list'),heading:str.optional(),intro:str.optional(),ordered:z.boolean().optional(),checkable:z.boolean().optional(),items:z.array(str).min(1)}),
  z.object({kind:z.literal('table'),heading:str.optional(),intro:str.optional(),columns:z.array(str).min(2),rows:z.array(z.array(str)).min(1)}),
  z.object({kind:z.literal('timeline'),heading:str.optional(),intro:str.optional(),steps:z.array(z.object({when:str,what:str})).min(1)}),
  z.object({kind:z.literal('compare'),heading:str.optional(),intro:str.optional(),left:z.object({label:str,items:z.array(str)}),right:z.object({label:str,items:z.array(str)})}),
  z.object({kind:z.literal('scripts'),heading:str.optional(),intro:str.optional(),items:z.array(z.object({situation:str,line:str})).min(1)}),
  z.object({kind:z.literal('callout'),label:str,body:str}),
  z.object({kind:z.literal('faq'),heading:str.optional(),items:z.array(z.object({q:str,a:str})).min(3).max(6)}),
]);
const schema = z.object({slug:str,title:str.min(30).max(60),dek:str.min(110).max(155),metaDescription:str.min(110).max(155),updatedAt:str,body:z.array(block).min(5),sources:z.array(z.object({name:str,url:z.url(),retrieved:str,note:str.optional()})).max(8),visuals:z.array(z.object({title:str,kicker:str,steps:z.array(z.object({label:str,detail:str})).min(3).max(4),caption:z.string(),alt:str.min(40).max(160),kind:z.enum(['sequence','compare','timeline','record'])})).length(2),worksheet:z.object({title:str,prompt:str,fields:z.array(str).min(5).max(8)}),research:z.object({primaryQuery:str,supportingQueries:z.array(str),intent:str,sourceChecks:z.array(z.union([str,z.record(z.string(),str)])),limitations:z.array(str)})});
const escape = (s) => String(s).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function walk(folder) { return fs.existsSync(folder) ? fs.readdirSync(folder,{withFileTypes:true}).flatMap((e)=>e.isDirectory()?walk(path.join(folder,e.name)):e.name.endsWith('.json')?[path.join(folder,e.name)]:[]) : []; }
const revisions={}, info={}, issues=[];
fs.mkdirSync('public/guides/print/library',{recursive:true});
for (const file of walk(path.join(dir,'library')).sort()) {
  let raw;
  try { raw=schema.parse(JSON.parse(fs.readFileSync(file,'utf8'))); } catch(e) { issues.push({file,error:e.message}); continue; }
  const guide=base.get(raw.slug);
  if(!guide || revisions[raw.slug]) { issues.push({file,error:'Unknown or duplicate slug'}); continue; }
  const sourceUrls=new Set(raw.sources.map((s)=>s.url));
  const bodyText=JSON.stringify(raw.body);
  const external=[...bodyText.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m=>m[1]);
  const badSource=external.find(u=>!sourceUrls.has(u));
  if(badSource){issues.push({file,error:'Unlisted external source: '+badSource});continue;}
  const badFAQ=raw.body.flatMap(b=>b.kind==='faq'?b.items:[]).find(q=>q.a.trim().split(/\s+/).length<25 || q.a.trim().split(/\s+/).length>110 || !q.q.endsWith('?'));
  if(badFAQ){issues.push({file,error:'FAQ outside 25-110 words or missing question mark: '+badFAQ.q});continue;}
  const printHref=`/guides/print/library/${raw.slug}.html`;
  const diagrams=raw.visuals.map((v,i)=>({...v,src:`/guides/img/library/${raw.slug}-${i+1}.webp`}));
  const figure=(v)=>({kind:'figure',src:v.src,alt:v.alt,caption:v.caption || undefined,width:1200,height:900,source:'diagram'});
  const body=raw.body.map((block) => {
    if(block.kind==='list' && block.checkable) return {...block,ordered:false};
    if(block.kind==='scripts' && block.items.length===1) return {kind:'paragraphs',heading:block.heading,paragraphs:[`For ${block.items[0].situation.toLowerCase()}, you could say: "${block.items[0].line}"`]};
    return block;
  });
  const firstAction=body.findIndex(b=>b.kind==='list'&&b.checkable);
  const at=firstAction<0?1:firstAction+1;
  body.splice(at,0,{kind:'paragraphs',paragraphs:[`[Open the free ${raw.worksheet.title.toLowerCase()}](${printHref}). Use the worksheet without an account or purchase.`]},figure(diagrams[0]));
  body.splice(Math.max(at+3,Math.floor(body.length*.65)),0,figure(diagrams[1]));
  const revision={title:raw.title,dek:raw.dek,metaDescription:raw.metaDescription,updatedAt:raw.updatedAt,body,sources:raw.sources};
  const intro=raw.body.find(b=>b.kind==='paragraphs')?.paragraphs.join(' ')??'';
  const ukTerms=/\b(register office|registering the death|grant of probate|section 27)\b/i.test(bodyText);
  const usTerms=/\b(letters testamentary|probate court|Social Security Administration|credit bureaus)\b/i.test(bodyText);
  if(!guide.locale && usTerms && !ukTerms && /\b(US|United States)\b/.test(intro))revision.scopeCountry='us';
  if(!guide.locale && ukTerms && !usTerms && /\b(UK|United Kingdom|England|Wales)\b/.test(intro))revision.scopeCountry='uk';
  const country=guide.locale??revision.scopeCountry;
  if(country) {
    const suffix=` (${country.toUpperCase()})`;
    const title=raw.title.replace(/\s*\((US|UK)\)$/,'').replace(/\s+in the (US|UK)$/,'');
    revision.seoTitle=(title.length+suffix.length<=60?title:title.slice(0,60-suffix.length).replace(/\s+\S*$/,''))+suffix;
  }
  revisions[raw.slug]=revision;
  info[raw.slug]={printHref,worksheetTitle:raw.worksheet.title,worksheetPrompt:raw.worksheet.prompt,diagrams,research:raw.research,areaSlug:guide.areaSlug};
  const print=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(raw.worksheet.title)} | Draftpace</title><style>body{font:16px/1.6 Arial,sans-serif;max-width:760px;margin:30px auto;padding:0 24px;color:#202526}h1{font-size:28px;line-height:1.2}h2{font-size:15px;margin:22px 0 5px}.lines{height:55px;border-bottom:1px solid #778585}a{color:#0a565c}footer{font-size:12px;margin-top:25px}@media print{.screen{display:none}body{margin:0;font-size:11pt}h2{break-after:avoid}.lines{height:42px}section{break-inside:avoid}@page{size:A4;margin:14mm}}</style><body><nav class="screen"><a href="/guides/${escape(raw.slug)}">Back to the guide</a><p>Print or save as PDF using your browser. Nothing you write on this sheet is sent to Draftpace.</p></nav><h1>${escape(raw.worksheet.title)}</h1><p>${escape(raw.worksheet.prompt)}</p>${raw.worksheet.fields.map(f=>`<section><h2>${escape(f)}</h2><div class="lines"></div></section>`).join('')}<footer>Keep this with the relevant records. Use the source guidance and exceptions in the article; a completed worksheet is not a professional assessment or official certification.</footer></body></html>`;
  fs.writeFileSync(path.join(root,'public',printHref),print);
}
for(const [file,value] of [['library.generated.json',revisions],['library-info.generated.json',info]]) fs.writeFileSync(path.join(dir,file),JSON.stringify(value,null,2)+'\n');
fs.writeFileSync('audit-2026-11-16/library-validation-issues.json',JSON.stringify(issues,null,2)+'\n');
console.log(JSON.stringify({assembled:Object.keys(revisions).length,rejected:issues.length,issues},null,2));
