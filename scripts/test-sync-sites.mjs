import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'album-sync-test-'));
const script=path.resolve('scripts/sync-sites.mjs'),fixture=path.join(root,'responses.json'),patch=path.join(root,'fetch.mjs');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync(patch,`import fs from 'node:fs';const data=JSON.parse(fs.readFileSync(process.env.SYNC_FIXTURE));globalThis.fetch=async url=>{const body=data[new URL(url).pathname];if(body===undefined)throw Error('Unexpected download: '+url);return new Response(body);};`);
const files=[{path:'README.md',url:'source-code/README.md',body:'latest instructions'},{path:'dist/renderer.js',url:'renderer.js',body:'latest renderer'},{path:'dist/source-code/README.md',url:'source-code/README.md',body:'latest instructions'}];
const manifest={projectId:'appgprj_6ac3bbf6f7bc81919585f6ddcb4f99b3',cardCount:140,files:files.map(({path,url,body})=>({path,url,sha256:sha(body),size:body.length}))};
const responses={'/github-sync-manifest.json':JSON.stringify(manifest),...Object.fromEntries(files.map(f=>['/'+f.url,f.body]))};
function run(){return execFileSync(process.execPath,['--import',pathToFileURL(patch).href,script],{cwd:root,env:{...process.env,SYNC_FIXTURE:fixture},encoding:'utf8',stdio:['ignore','pipe','pipe']});}
try{
 fs.writeFileSync(fixture,JSON.stringify(responses));run();
 for(const f of files)assert.equal(fs.readFileSync(path.join(root,f.path),'utf8'),f.body);
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'dist/github-sync-manifest.json'))),manifest);
 // Already-verified files need no download, even with no asset response available.
 fs.writeFileSync(fixture,JSON.stringify({'/github-sync-manifest.json':JSON.stringify(manifest)}));assert.match(run(),/downloaded 0/);
 const bad={...manifest,files:[{...manifest.files[0],sha256:sha('unavailable new revision')}]};
 fs.writeFileSync(fixture,JSON.stringify({...responses,'/github-sync-manifest.json':JSON.stringify(bad)}));assert.throws(run);
 assert.equal(fs.readFileSync(path.join(root,'README.md'),'utf8'),'latest instructions','invalid download cannot replace a verified file');
 console.log('PASS: complete mirrored paths, README + manifest refresh, incremental skips and hash failure protection');
}finally{fs.rmSync(root,{recursive:true,force:true});}
