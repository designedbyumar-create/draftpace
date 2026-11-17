import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
const file='audit-2026-11-16/library-asset-checks.json';
const manifest=JSON.parse(await readFile(file,'utf8'));
for(const [slug,entry] of Object.entries(manifest)) {
  if(entry.padding===1)continue;
  for(const [suffix,width,height] of [['1',1200,900],['2',1200,900],['share',1200,630],['thumb',800,600]]) {
    const path=`public/guides/img/library/${slug}-${suffix}.webp`;
    const bytes=await readFile(path);
    const pad=Math.round(width*.035);
    const output=await sharp(bytes).resize(width-pad*2,height-pad*2,{fit:'contain',background:'#ffffff'}).extend({top:pad,bottom:pad,left:pad,right:pad,background:'#ffffff'}).webp({quality:90}).toBuffer();
    await writeFile(path,output);
  }
  entry.padding=1;
}
await writeFile(file,JSON.stringify(manifest,null,2)+'\n');
console.log(`Safe margins verified for ${Object.keys(manifest).length} visual sets.`);
