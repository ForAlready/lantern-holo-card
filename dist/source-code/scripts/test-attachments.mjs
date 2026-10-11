import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {selectCards} from '../dist/collection.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const cards=read('dist/catalog.json'),inventory=read('work/attachment-inventory.json');
const approved=read('work/qa/attachment-approved.json');
assert.equal(cards.length,140+approved.length);
assert.equal(cards.filter(c=>c.sourceKind!=='attachment').length,140);
assert.equal(cards.filter(c=>c.legacy).length,6);
for(const source of inventory){
 const card=cards.find(c=>c.sourceKind==='attachment'&&c.sourceIndex===source.index);
 if(source.status==='excluded'){assert(!card);continue;}
 assert(card);assert.equal(card.original,source.title);
 assert.equal(card.width,source.width);assert.equal(card.height,source.height);
 assert.equal(card.id,'art-'+crypto.createHash('sha256').update(source.id).digest('hex').slice(0,16));
 assert(selectCards(cards,{query:source.title}).some(c=>c.id===card.id));
 assert(selectCards(cards,{query:card.name}).some(c=>c.id===card.id));
 assert.equal(card.back,cards[0].back);
}
console.log(`PASS: ${approved.length} attachments reconciled, excluded sources absent, native dimensions and searchable names preserved.`);
