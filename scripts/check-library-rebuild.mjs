import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const revisions=JSON.parse(await readFile('src/content/revisions/library.generated.json','utf8'));
const info=JSON.parse(await readFile('src/content/revisions/library-info.generated.json','utf8'));
const output='audit-2026-11-16/library-preview-checks.json';
let results={};try{results=JSON.parse(await readFile(output,'utf8'));}catch{}
await mkdir('audit-2026-11-16/library-previews',{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light'});
  let pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  for(const [slug,revision] of Object.entries(revisions)) {
    const hash=createHash('sha256').update(JSON.stringify(revision)+JSON.stringify(info[slug])).digest('hex');
    if(results[slug]?.hash===hash && results[slug]?.passed) continue;
    try {
      pageErrors=[];
      await page.setViewportSize({width:1440,height:1000});
      const response=await page.goto(`http://localhost:3000/guides/${slug}`,{waitUntil:'networkidle',timeout:120000});
      if(response.status()!==200)throw new Error(`Article returned ${response.status()}`);
      await page.getByRole('heading',{name:revision.title,exact:true,level:1}).waitFor();
      await page.waitForFunction(()=>document.querySelectorAll('[data-library-visual]').length===2);
      const actualTitle=await page.locator('title').textContent();
      if(!actualTitle?.includes((revision.seoTitle??revision.title).slice(0,24)))throw new Error('Search title mismatch');
      if(await page.locator('meta[name="robots"][content*="noindex"]').count())throw new Error('Article is noindex');
      const ids=await page.locator('article [id]').evaluateAll(elements=>elements.map(el=>el.id));
      if(new Set(ids).size!==ids.length)throw new Error('Duplicate article anchor IDs');
      const missing=await page.locator('nav[aria-label="Contents"] a').evaluateAll(links=>links.map(link=>link.hash.slice(1)).filter(id=>!document.getElementById(id)));
      if(missing.length)throw new Error(`Broken contents targets: ${missing.join(',')}`);
      const checkbox=page.locator('article input[type="checkbox"]').first();
      if(await checkbox.count()) {await checkbox.focus();await page.keyboard.press('Space');if(!await checkbox.isChecked())throw new Error('Keyboard checklist failed');}
      const radio=page.locator('article input[type="radio"]').nth(1);
      if(await radio.count()) {await radio.check();if(!await radio.isChecked())throw new Error('Script selector failed');}
      const worksheet=await page.request.get('http://localhost:3000'+info[slug].printHref,{maxRetries:2});
      const worksheetTitle=await page.evaluate(html=>new DOMParser().parseFromString(html,'text/html').querySelector('h1')?.textContent,await worksheet.text());
      if(worksheet.status()!==200 || worksheetTitle!==info[slug].worksheetTitle)throw new Error('Worksheet missing or title mismatch');
      for(const [name,width,height] of [['desktop',1440,1000],['mobile',320,900]]) {
        await page.setViewportSize({width,height});
        await page.evaluate(()=>window.scrollTo(0,0));
        if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`${name}: horizontal overflow`);
        await page.screenshot({path:`audit-2026-11-16/library-previews/${slug}-${name}.png`});
      }
      if(pageErrors.length)throw new Error(pageErrors.join('; '));
      results[slug]={hash,passed:true,desktop:true,mobile:true,visuals:2,worksheet:true,anchors:true,keyboardChecklist:true};
      console.log(`${Object.values(results).filter(r=>r.passed).length}: ${slug}: preview checks passed`);
    }catch(error){results[slug]={hash,passed:false,error:error.message};console.error(`${slug}: ${error.message}`);}
    await writeFile(output,JSON.stringify(results,null,2)+'\n');
  }
}finally{await browser.close();}
console.log(`Preview checks: ${Object.values(results).filter(r=>r.passed).length} passed; ${Object.values(results).filter(r=>!r.passed).length} failed.`);
