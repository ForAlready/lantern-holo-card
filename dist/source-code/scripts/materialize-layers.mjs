import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').slice(0,24);
fs.mkdirSync('dist/assets/layers',{recursive:true});fs.mkdirSync('work/qa',{recursive:true});
async function save(buffer,ext){const file='assets/layers/'+sha(buffer)+'.'+ext;fs.writeFileSync('dist/'+file,buffer);return file;}
async function materialize(r){
 if(/excluded|blocked/.test(r.status||'')){console.log('Excluded',r.index);return;}
 const inventory=JSON.parse(fs.readFileSync('work/source-inventory.json')),origin=inventory[r.index];
 if(!origin||origin.id!==r.id)throw Error('Source ID mismatch');
 const source=r.sourcePath&&fs.existsSync(r.sourcePath)?r.sourcePath:r.proxyPath;
 const sm=await sharp(source,{limitInputPixels:false}).metadata(),scale=Math.min(1,1600/Math.max(sm.width,sm.height)),width=Math.round(sm.width*scale),height=Math.round(sm.height*scale);
 const rgb=await sharp(source,{limitInputPixels:false}).resize(width,height,{fit:'fill'}).removeAlpha().toColourspace('srgb').raw().toBuffer();
 const am=r.atlasPath?await sharp(r.atlasPath).metadata():null,side=['side-by-side','horizontal','left-right'].includes(r.layout),split=r.panelSplit??.5;
 const first=am?(side?{left:0,top:0,width:Math.round(am.width*split),height:am.height}:{left:0,top:0,width:am.width,height:Math.round(am.height*split)}):null;
 const second=am?(side?{left:first.width,top:0,width:am.width-first.width,height:am.height}:{left:0,top:first.height,width:am.width,height:am.height-first.height}):null;
 let mask=await sharp(r.maskPath??r.atlasPath).extract(r.maskPath?{left:0,top:0,width:(await sharp(r.maskPath).metadata()).width,height:(await sharp(r.maskPath).metadata()).height}:second).removeAlpha().greyscale().extractChannel(0).raw().toBuffer();
 let mw=r.maskPath?(await sharp(r.maskPath).metadata()).width:second.width,mh=r.maskPath?(await sharp(r.maskPath).metadata()).height:second.height;
 // Atlas divider lines must not enlarge the segmentation bounding box.
 for(const x of [0,1,mw-2,mw-1]){let white=0;for(let y=0;y<mh;y++)if(mask[y*mw+x]>128)white++;if(white>mh*.9)for(let y=0;y<mh;y++)mask[y*mw+x]=0;}
 if(r.subjectRect){let xmin=mw,ymin=mh,xmax=-1,ymax=-1;for(let y=0;y<mh;y++)for(let x=0;x<mw;x++)if(mask[y*mw+x]>128){xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}if(xmax<0)throw Error('Empty subject mask');
 const rect=r.subjectRect.map((v,i)=>Math.round(v*(i%2?height:width)));rect[2]=Math.min(rect[2],width-rect[0]);rect[3]=Math.min(rect[3],height-rect[1]);const bounded=await sharp(mask,{raw:{width:mw,height:mh,channels:1}}).extract({left:xmin,top:ymin,width:xmax-xmin+1,height:ymax-ymin+1}).resize(rect[2],rect[3],{fit:'fill'}).greyscale().extractChannel(0).raw().toBuffer();mask=Buffer.alloc(width*height);for(let y=0;y<rect[3];y++)bounded.copy(mask,(y+rect[1])*width+rect[0],y*rect[2],(y+1)*rect[2]);
 }else mask=await sharp(mask,{raw:{width:mw,height:mh,channels:1}}).resize(width,height,{fit:'fill'}).greyscale().extractChannel(0).raw().toBuffer();
 const rgba=Buffer.alloc(width*height*4),structure=Buffer.alloc(width*height*4);
 const black=r.maskBlackThreshold??12;
 const originalUiMask=r.originalUiMaskPath?await sharp(r.originalUiMaskPath).removeAlpha().greyscale().extractChannel(0).resize(width,height,{fit:'fill'}).greyscale().extractChannel(0).raw().toBuffer():null;
 for(let p=0;p<width*height;p++){const alpha=Math.round(Math.max(0,Math.min(255,(mask[p]-black)*255/(243-black)))*(originalUiMask?(255-originalUiMask[p])/255:1));mask[p]=alpha;rgba[p*4]=rgb[p*3];rgba[p*4+1]=rgb[p*3+1];rgba[p*4+2]=rgb[p*3+2];rgba[p*4+3]=alpha;}
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const p=y*width+x;let gradient=0;for(const delta of [-1,1,-width,width]){let d=0;for(let k=0;k<3;k++)d+=Math.abs(rgb[p*3+k]-rgb[(p+delta)*3+k])/3;gradient=Math.max(gradient,d);}const edge=Math.max(...[-1,1,-width,width].map(d=>Math.abs(mask[p]-mask[p+d]))),alpha=Math.round(Math.min(255,Math.max(edge,Math.max(0,gradient-20)*2.5))*mask[p]/255);structure[p*4]=structure[p*4+1]=structure[p*4+2]=255;structure[p*4+3]=alpha;}
 const character=await sharp(rgba,{raw:{width,height,channels:4}}).webp({lossless:true}).toBuffer();
 let background=await (r.backgroundPath?sharp(r.backgroundPath):sharp(r.atlasPath).extract(first)).resize(width,height,{fit:'fill'}).webp({quality:90}).toBuffer();
 // Preserve original credits on the scene plane, excluding subject pixels.
 // Feather the integration boundary instead of moving an opaque rectangle.
 for(const region of [...(r.backgroundOriginalRects||[]),...(r.signatureRect?[r.signatureRect]:[])]){const sr=region.map((v,i)=>Math.round(v*(i%2?height:width))),sw=Math.min(sr[2],width-sr[0]),sh=Math.min(sr[3],height-sr[1]),patch=Buffer.alloc(sw*sh*4),feather=Math.max(2,Math.min(sw,sh)*.12);for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const p=(y+sr[1])*width+x+sr[0],q=(y*sw+x)*4,f=Math.min(1,Math.min(x,y,sw-1-x,sh-1-y)/feather);patch[q]=rgb[p*3];patch[q+1]=rgb[p*3+1];patch[q+2]=rgb[p*3+2];patch[q+3]=Math.round((255-mask[p])*f);}background=await sharp(background).composite([{input:patch,raw:{width:sw,height:sh,channels:4},left:sr[0],top:sr[1]}]).webp({quality:90}).toBuffer();}
 const line=await sharp(structure,{raw:{width,height,channels:4}}).webp({lossless:true}).toBuffer();
 const frame=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g fill="none" stroke="#e6d3ff" stroke-opacity=".28" stroke-width="${Math.max(1,width*.0015)}"><rect x="${width*.025}" y="${height*.025}" width="${width*.95}" height="${height*.95}" rx="${width*.025}"/><path d="M${width*.07} ${height*.07}h${width*.055}m-${width*.055} 0v${height*.04}M${width*.93} ${height*.93}h-${width*.055}m${width*.055} 0v-${height*.04}"/></g></svg>`);
 const overlays=[{input:frame}];
 if(originalUiMask){const plate=Buffer.alloc(width*height*4);for(let p=0;p<width*height;p++){plate[p*4]=rgb[p*3];plate[p*4+1]=rgb[p*3+1];plate[p*4+2]=rgb[p*3+2];plate[p*4+3]=originalUiMask[p];}overlays.push({input:plate,raw:{width,height,channels:4}});}
 const ui=await sharp({create:{width,height,channels:4,background:'#00000000'}}).composite(overlays).webp({lossless:true}).toBuffer();
 const composite=await sharp(background).composite([{input:character},{input:ui}]).png().toBuffer();
 const thumbnail=await sharp(composite).resize({width:540,height:675,fit:'inside'}).webp({quality:84}).toBuffer();
 const result={id:'art-'+crypto.createHash('sha256').update(r.id).digest('hex').slice(0,16),sourceId:r.id,sourceIndex:r.index,name:r.name,original:origin.title,width,height,ratio:width/height,legacy:false,thumbnail:await save(thumbnail,'webp'),assets:{character:await save(character,'webp'),background:await save(background,'webp'),ui:await save(ui,'webp'),structure:await save(line,'webp'),backgroundScale:1}};
 const previews=[await sharp(rgb,{raw:{width,height,channels:3}}).png().toBuffer(),composite,character,background,line];const labels=['ORIGINAL','COMPOSITE','SUBJECT','BACKGROUND','CONTOUR'];const cells=[];for(let i=0;i<previews.length;i++){const b=await sharp(previews[i]).resize({width:260,height:380,fit:'inside'}).toBuffer(),meta=await sharp(b).metadata();cells.push({input:b,left:i*280+10+Math.round((260-meta.width)/2),top:30+Math.round((380-meta.height)/2)});cells.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="25"><text x="4" y="18" fill="white" font-size="13">${labels[i]}</text></svg>`),left:i*280+10,top:3});}
 await sharp({create:{width:1400,height:420,channels:4,background:'#27232d'}}).composite(cells).png().toFile(`work/qa/contact-${r.index}.png`);
 fs.writeFileSync(`work/qa/result-${r.index}.json`,JSON.stringify(result,null,2));console.log('Materialized',r.index,r.name,width,height);
}
const indices=process.argv.slice(2).map(Number);for(const n of indices){try{const r=JSON.parse(fs.readFileSync(`work/layers/record-${n}.json`));await materialize(r);}catch(e){console.error('FAILED',n,e.message);process.exitCode=1;}}
