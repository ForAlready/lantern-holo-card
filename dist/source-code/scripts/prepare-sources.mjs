import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const inventory=JSON.parse(fs.readFileSync('work/source-inventory.json'));
const ns=process.argv.slice(2).map(Number),dir=path.resolve('../asset-staging/remaining-sources');
fs.mkdirSync(dir,{recursive:true});const cells=[];
for(let i=0;i<ns.length;i++){
 const n=ns[i],s=inventory[n],source=path.resolve('../originals/source-'+n);
 try{
  const size=fs.statSync(source).size;if(size!==Number(s.size))throw Error('Size mismatch: '+size+' / '+s.size);
  const m=await sharp(source,{limitInputPixels:false}).metadata();await sharp(source,{limitInputPixels:false}).raw().toBuffer();
  const proxy=dir+'/proxy-'+n+'.jpg';await sharp(source,{limitInputPixels:false}).resize({width:1600,height:1600,fit:'inside'}).jpeg({quality:92}).toFile(proxy);
  fs.writeFileSync(dir+'/source-meta-'+n+'.json',JSON.stringify({index:n,id:s.id,width:m.width,height:m.height,size,format:m.format}));
  const b=await sharp(proxy).resize({width:350,height:480,fit:'inside'}).toBuffer(),bm=await sharp(b).metadata();
  cells.push({input:b,left:(i%4)*380+15+Math.round((350-bm.width)/2),top:Math.floor(i/4)*530+30});
  cells.push({input:Buffer.from(`<svg width="350" height="25"><text x="4" y="18" fill="white" font-size="18">SOURCE ${n}</text></svg>`),left:(i%4)*380+15,top:Math.floor(i/4)*530+3});console.log('Decoded',n,m.width,m.height);
 }catch(e){console.log('FAILED',n,e.message);process.exitCode=1;}
}
await sharp({create:{width:1520,height:Math.ceil(ns.length/4)*530,channels:4,background:'#28232c'}}).composite(cells).png().toFile(dir+'/source-contact-'+ns.join('-')+'.png');
