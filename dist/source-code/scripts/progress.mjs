import fs from 'node:fs';
const sources=JSON.parse(fs.readFileSync('work/source-inventory.json'));
const approved=new Set(JSON.parse(fs.readFileSync('work/qa/approved.json')));
const blocked=new Set();
for(const name of fs.readdirSync('work/layers').filter(n=>/^review.*\.json$/.test(n))){const value=JSON.parse(fs.readFileSync('work/layers/'+name));for(const r of Array.isArray(value)?value:[]){if(Number.isInteger(r.index)&&sources[r.index]?.id===r.id&&/excluded|blocked/.test(r.status||''))blocked.add(r.index);}}
const groups={approved:[],excluded:[],awaitingReview:[],needsAssets:[]};
for(let i=0;i<sources.length;i++){
 const p=`work/layers/record-${i}.json`,r=fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):null;
 if(approved.has(i))groups.approved.push(i);
 else if(blocked.has(i)||r&&/excluded|blocked/.test(r.status||''))groups.excluded.push(i);
 else if(r&&(r.maskPath||r.atlasPath)&&(r.backgroundPath||r.atlasPath)&&[r.proxyPath,r.maskPath||r.atlasPath,r.backgroundPath||r.atlasPath].every(p=>p&&fs.existsSync(p)))groups.awaitingReview.push(i);
 else groups.needsAssets.push(i);
}
console.log(JSON.stringify({sourceCount:sources.length,catalogCount:approved.size+6,counts:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,v.length])),...groups},null,2));
