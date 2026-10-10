// Offline layer sampling at the UI's depth endpoints. Not a GPU/device test.
import fs from 'node:fs';import{createRequire}from'node:module';
const sharp=createRequire(import.meta.url)(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const cards=JSON.parse(fs.readFileSync('dist/catalog.json')).filter(c=>!c.legacy);
const selected=new Set([53,81,88,123,126,169,171,204,208,209,213]);const cells=[];
for(const c of cards){
 const w=360,h=Math.round(w/c.ratio),layers=[];
 for(const k of['background','character','ui'])layers.push(await sharp('dist/'+c.assets[k]).resize(w,h).ensureAlpha().raw().toBuffer());
 const frames=[];
 for(const depth of[-3,3]){
  const out=Buffer.alloc(w*h*4);const view=.65*Math.sin(25*Math.PI/180);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=[(x/(w-1)-.5)*1.6+.5,(y/(h-1)-.5)*1.6+.5];const inside=p.every(v=>v>=0&&v<=1);let rgba=[39,35,45,255];
   const coords=[p.map(v=>(v-.5)*(c.assets.backgroundScale??1)+.5-view*.25),p.map(v=>v-view*(depth<0?.06:.08)*depth),p.map(v=>v-view*.14*Math.max(depth,0))];
   for(let l=0;l<3;l++){
    const q=coords[l];if(l===0&&!inside||l===1&&depth<0&&!inside||l===2&&!inside||l>0&&q.some(v=>v<0||v>1))continue;
    const ix=Math.round(Math.max(0,Math.min(1,q[0]))*(w-1)),iy=Math.round(Math.max(0,Math.min(1,q[1]))*(h-1)),i=(iy*w+ix)*4,a=layers[l][i+3]/255;
    for(let k=0;k<3;k++)rgba[k]=Math.round(layers[l][i+k]*a+rgba[k]*(1-a));
   }const i=(y*w+x)*4;for(let k=0;k<4;k++)out[i+k]=rgba[k];
  }
  const frame=await sharp(out,{raw:{width:w,height:h,channels:4}}).png().toBuffer();frames.push(frame);
 }
 if(selected.has(c.sourceIndex))for(let i=0;i<2;i++){const img=await sharp(frames[i]).resize({width:300,height:250,fit:'inside'}).toBuffer(),m=await sharp(img).metadata();const row=cells.length;cells.push({img,m,label:`${c.sourceIndex} depth ${i?'+3':'-3'}`});}
}
const cols=4,rows=Math.ceil(cells.length/cols),overlays=[];
for(let i=0;i<cells.length;i++){const {img,m,label}=cells[i],x=(i%cols)*320,y=Math.floor(i/cols)*280;overlays.push({input:img,left:x+Math.round((320-m.width)/2),top:y+25+Math.round((250-m.height)/2)});overlays.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="25"><text x="8" y="18" fill="white" font-size="14">${label}</text></svg>`),left:x,top:y});}
await sharp({create:{width:cols*320,height:rows*280,channels:4,background:'#27232d'}}).composite(overlays).png().toFile('work/qa/depth-endpoints.png');
console.log(`Offline depth endpoint sampling passed for ${cards.length} cards; ${selected.size} representative cards rendered for inspection. GPU and mobile verification remains unavailable.`);
