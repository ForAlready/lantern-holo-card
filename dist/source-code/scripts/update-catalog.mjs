import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const inventory=read('work/source-inventory.json');
const approved=read('work/qa/approved.json');
const legacy=read('dist/catalog.json').filter(c=>c.legacy);
if(legacy.length!==6)throw Error('Expected the original six cards');
const added=approved.map(index=>{
 const card=read(`work/qa/result-${index}.json`),source=inventory[index];
 if(!source||source.id!==card.sourceId||card.sourceIndex!==index)throw Error(`Source mismatch ${index}`);
 card.original=source.title;
 fs.writeFileSync(`work/qa/result-${index}.json`,JSON.stringify(card,null,2)+'\n');
 return card;
});
const cards=[...legacy,...added].map(c=>({...c,back:c.back||legacy[0].back}));
if(new Set(cards.map(c=>c.id)).size!==cards.length)throw Error('Duplicate card ID');
fs.writeFileSync('dist/catalog.json',JSON.stringify(cards,null,2)+'\n');
console.log(`Catalog: ${legacy.length} original + ${added.length} reviewed = ${cards.length}`);
