import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const mirror='dist/source-code';fs.rmSync(mirror,{recursive:true,force:true});fs.mkdirSync(mirror,{recursive:true});
const files=[];function entry(from,target,url){const b=fs.readFileSync(from);files.push({path:target,url,sha256:crypto.createHash('sha256').update(b).digest('hex'),size:b.length});}
function copy(from,target){const url='source-code/'+target,dest='dist/'+url;fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(from,dest);entry(dest,target,url);}
for(const name of fs.readdirSync('scripts').filter(n=>n.endsWith('.mjs')))copy('scripts/'+name,'scripts/'+name);
copy('.openai/hosting.json','.openai/hosting.json');copy('RELEASE-QA.md','RELEASE-QA.md');
const inventory=JSON.parse(fs.readFileSync('work/source-inventory.json')).map(({id,title,mime_type,size})=>({id,title,mime_type,size}));fs.mkdirSync(mirror+'/work',{recursive:true});fs.writeFileSync(mirror+'/work/source-inventory.json',JSON.stringify(inventory,null,2)+'\n');entry(mirror+'/work/source-inventory.json','work/source-inventory.json','source-code/work/source-inventory.json');copy('work/qa/approved.json','work/qa/approved.json');
for(const name of fs.readdirSync('work/qa').filter(n=>/^result-\d+\.json$/.test(n)))copy('work/qa/'+name,'work/qa/'+name);
for(const name of fs.readdirSync('work/layers').filter(n=>/^(record-\d+|review.*)\.json$/.test(n)))copy('work/layers/'+name,'work/layers/'+name);
function walk(dir){for(const n of fs.readdirSync(dir)){const p=dir+'/'+n;if(p===mirror||p==='dist/github-sync-manifest.json')continue;if(fs.statSync(p).isDirectory())walk(p);else entry(p,p,p.slice(5));}}
walk('dist');files.sort((a,b)=>a.path.localeCompare(b.path));
const manifest={projectId:JSON.parse(fs.readFileSync('.openai/hosting.json')).project_id,cardCount:JSON.parse(fs.readFileSync('dist/catalog.json')).length,files};
fs.writeFileSync('dist/github-sync-manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(`Prepared ${files.length} verified GitHub mirror entries.`);
