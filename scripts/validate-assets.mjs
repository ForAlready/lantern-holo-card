import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const inventory=JSON.parse(fs.readFileSync('work/source-inventory.json'));
const cards=JSON.parse(fs.readFileSync('dist/catalog.json'));
if(inventory.length!==214||new Set(inventory.map(c=>c.id)).size!==214)throw Error('Source inventory mismatch');
if(cards.filter(c=>c.legacy).length!==6||new Set(cards.map(c=>c.id)).size!==cards.length)throw Error('Catalog mismatch');
const seen=new Set(),pending=[];let assets=0;
for(const c of cards){
 if(!c.name||!c.original||!Number.isFinite(c.ratio)||c.ratio<=0)throw Error(`Invalid metadata ${c.id}`);
 if(!c.legacy&&inventory[c.sourceIndex]?.id!==c.sourceId)throw Error(`Invalid source ${c.id}`);
 for(const relative of [c.thumbnail,c.back,...['character','background','ui','structure'].map(k=>c.assets[k])].filter(Boolean)){
  if(relative.includes('..')||path.isAbsolute(relative))throw Error(`Unsafe asset path ${relative}`);
  if(seen.has(relative))continue;seen.add(relative);
  pending.push(relative);
 }
}
let cursor=0;await Promise.all(Array.from({length:4},async()=>{while(cursor<pending.length){const relative=pending[cursor++];const data=fs.readFileSync(path.join('dist',relative));
  await sharp(data).raw().toBuffer(); // Full decode: metadata alone misses truncated files.
  if(relative.startsWith('assets/layers/')&&path.basename(relative).split('.')[0]!==crypto.createHash('sha256').update(data).digest('hex').slice(0,24))throw Error(`Hash mismatch ${relative}`);
  assets++;
 }}));
console.log(`Validated ${inventory.length} sources, ${cards.length} cards and ${assets} fully decoded assets`);
