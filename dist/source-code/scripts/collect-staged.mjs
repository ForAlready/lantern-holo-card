import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const staging=path.resolve('..','asset-staging'),target=path.resolve('work/layers');
if(!fs.existsSync(staging))process.exit(0);
let count=0;
const journalPath='work/collected-staged.json',journal=fs.existsSync(journalPath)?JSON.parse(fs.readFileSync(journalPath)):{};
for(const dir of fs.readdirSync(staging)){const base=path.join(staging,dir);if(!fs.statSync(base).isDirectory())continue;
 for(const name of fs.readdirSync(base)){const from=path.join(base,name);if(!fs.statSync(from).isFile()||name.startsWith('source-'))continue;if(!/\.(png|jpg|webp|json)$/.test(name))continue;
 const key=dir+'/'+name,digest=crypto.createHash('sha256').update(fs.readFileSync(from)).digest('hex');if(journal[key]===digest&&fs.existsSync(path.join(target,name))){if(!name.endsWith('.json'))continue;const previous=JSON.parse(fs.readFileSync(path.join(target,name)));if(['proxyPath','atlasPath','maskPath','backgroundPath'].every(f=>!previous[f]||previous[f].startsWith('work/')))continue;}
 if(name.endsWith('.json')){const record=JSON.parse(fs.readFileSync(from));for(const field of ['proxyPath','atlasPath','maskPath','backgroundPath'])if(record[field]){const candidates=[path.resolve(record[field]),path.resolve('..',record[field]),path.resolve(base,record[field])];const original=candidates.find(p=>fs.existsSync(p)&&(p.startsWith(staging+path.sep)||p.startsWith(process.cwd()+path.sep)))||candidates[0];if(original.startsWith(staging+path.sep)&&fs.existsSync(original)){fs.copyFileSync(original,path.join(target,path.basename(original)));record[field]='work/layers/'+path.basename(original);}else if(original.startsWith(process.cwd()+path.sep))record[field]=path.relative(process.cwd(),original);}
 fs.writeFileSync(path.join(target,name),JSON.stringify(record,null,2));}else fs.copyFileSync(from,path.join(target,name));journal[key]=digest;count++;}
}
fs.writeFileSync(journalPath,JSON.stringify(journal,null,2));
console.log('Collected staged files',count);
