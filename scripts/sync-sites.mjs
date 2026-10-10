// GitHub-side mirror of the public Site. No Drive credentials are used.
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';
const origin='https://lantern-holo-card.xiaokl413.chatgpt.site';
const base=process.cwd();
const allowed=p=>!p.includes('..')&&!p.includes('\\')&&(/^(dist|scripts|work)\//.test(p)||['.openai/hosting.json','RELEASE-QA.md'].includes(p));
async function get(url){for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`HTTP ${r.status}`);return Buffer.from(await r.arrayBuffer());}catch(e){if(attempt===2)throw e;}}}
const manifest=JSON.parse(await get(origin+'/github-sync-manifest.json'));
if(manifest.projectId!=='appgprj_6ac3bbf6f7bc81919585f6ddcb4f99b3'||!Array.isArray(manifest.files))throw Error('Wrong Site manifest');
const previous=await fs.readFile('.sites-sync-state.json','utf8').then(JSON.parse).catch(()=>({files:[]}));
let cursor=0,downloaded=0;const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
await Promise.all(Array.from({length:12},async()=>{while(cursor<manifest.files.length){const f=manifest.files[cursor++];
 if(!allowed(f.path)||!/^([a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/.test(f.url)||!/^[a-f0-9]{64}$/.test(f.sha256))throw Error('Unsafe mirror entry');
 const target=path.join(base,f.path);if(await fs.readFile(target).then(b=>digest(b)===f.sha256).catch(()=>false))continue;
 const bytes=await get(origin+'/'+f.url);if(digest(bytes)!==f.sha256)throw Error('Site changed during sync or invalid asset: '+f.path);
 await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);downloaded++;
}}));
const wanted=new Set(manifest.files.map(f=>f.path));
for(const f of previous.files||[])if(allowed(f.path)&&!wanted.has(f.path))await fs.rm(f.path,{force:true});
await fs.writeFile('.sites-sync-state.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Verified ${manifest.files.length} mirrored files; downloaded ${downloaded}; ${manifest.cardCount} cards.`);
