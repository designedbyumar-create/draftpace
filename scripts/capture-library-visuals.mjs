import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const info = JSON.parse(await readFile('src/content/revisions/library-info.generated.json','utf8'));
const manifestPath = 'audit-2026-11-16/library-asset-checks.json';
let manifest = {};
try { manifest=JSON.parse(await readFile(manifestPath,'utf8')); } catch {}
await mkdir('public/guides/img/library',{recursive:true});
const styles = await readFile('src/components/public/guides/LibraryArticleExperience.module.css','utf8');
const exists = async path => {try{await access(path);return true;}catch{return false;}};
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1600},deviceScaleFactor:2,colorScheme:'light'});
  for(const [slug,entry] of Object.entries(info)) {
    const hash=createHash('sha256').update(JSON.stringify(entry.diagrams)+styles).digest('hex');
    if(manifest[slug]?.hash===hash && manifest[slug]?.padding===1 && await exists(`public/guides/img/library/${slug}-1.webp`)) continue;
    try {
      await page.goto(`http://localhost:3000/guides/${slug}`,{waitUntil:'networkidle',timeout:120000});
      await page.evaluate(()=>document.fonts.ready);
      for(let i=0;i<entry.diagrams.length;i++) {
        const diagram=entry.diagrams[i];
        const visual=page.locator(`[data-library-visual="${diagram.src}"]`);
        await visual.waitFor();
        await visual.evaluate(el=>el.scrollIntoView({block:'center'}));
        const pixels=await visual.screenshot();
        const render=(width,height)=>{const pad=Math.round(width*.035);return sharp(pixels).resize(width-pad*2,height-pad*2,{fit:'contain',background:'#ffffff'}).extend({top:pad,bottom:pad,left:pad,right:pad,background:'#ffffff'}).webp({quality:90});};
        await render(1200,900).toFile('public'+diagram.src);
      }
      manifest[slug]={hash,images:entry.diagrams.length,padding:1};
      await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
      console.log(`${Object.keys(manifest).length}: ${slug}: two native diagrams captured`);
    } catch(error) { console.error(`${slug}: ${error.message}`); }
  }
} finally {await browser.close();}
console.log(`Asset checks recorded: ${Object.keys(manifest).length}`);
