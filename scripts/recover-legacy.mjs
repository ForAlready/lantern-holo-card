import fs from 'node:fs';
import crypto from 'node:crypto';
const ids=['lantern','dragon','neon','witch','moonfox','pool'];
const names=['灯下之约','青龙吟月','霓虹幻色','星帷魔法','朝月清辉','夏日水光'];
fs.mkdirSync('dist/assets/layers',{recursive:true});
const catalog=[];
for(const [i,id] of ids.entries()){
 const html=fs.readFileSync(`dist/cards/${id}.html`,'utf8');
 const start=html.indexOf('globalThis.HOLO_MANIFEST=')+'globalThis.HOLO_MANIFEST='.length;
 let end=start,depth=0,inString=false,escape=false;
 for(;end<html.length;end++){const c=html[end];if(inString){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')inString=false;}else{if(c==='"')inString=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end++;break;}}}
 const manifest=JSON.parse(html.slice(start,end));
 function external(uri){if(!uri?.startsWith('data:'))return uri;const match=uri.match(/^data:([^;]+);base64,([\s\S]+)$/);if(!match)throw Error('Unexpected embedded asset');const bytes=Buffer.from(match[2],'base64');const ext=match[1].split('/')[1].replace('jpeg','jpg');const name=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,24)+'.'+ext;fs.writeFileSync('dist/assets/layers/'+name,bytes);return 'assets/layers/'+name;}
 catalog.push({id,name:names[i],original:id+'.jpg',width:manifest.width,height:manifest.height,ratio:manifest.width/manifest.height,legacy:true,thumbnail:`assets/${id}.jpg`,assets:Object.fromEntries(Object.entries(manifest.assets).map(([k,v])=>[k,external(v)])),back:external(manifest.back)});
 if(i===0){let engine=html.slice(html.indexOf('const vertex ='),html.indexOf('globalThis.HOLO_CREATE_RENDERER='));engine=engine.replace('async function createCardRenderer(canvas, assets)', 'export async function createCardRenderer(canvas, assets, signal)');engine=engine.replace('preserveDrawingBuffer: true','preserveDrawingBuffer: false');
 const imageStart=engine.indexOf('  const images = await Promise.all('),imageEnd=engine.indexOf('  const artTextures =',imageStart);
 const oldImages=engine.slice(imageStart,imageEnd);
 const load=`  const images = await Promise.all(['character','background','ui','structure'].map(async name=>{\n    const response=await fetch(assets[name],{signal});if(!response.ok)throw Error('素材加载失败');\n    const blob=await response.blob();if(signal?.aborted)throw new DOMException('Aborted','AbortError');\n    return await new Promise((resolve,reject)=>{const image=new Image(),url=URL.createObjectURL(blob);let timer;const cleanup=()=>{clearTimeout(timer);URL.revokeObjectURL(url);signal?.removeEventListener('abort',abort);};const abort=()=>{image.src='';cleanup();reject(new DOMException('Aborted','AbortError'));};image.onload=()=>{cleanup();resolve(image);};image.onerror=()=>{cleanup();reject(Error('素材无法解码'));};timer=setTimeout(()=>{image.src='';cleanup();reject(Error('素材解码超时'));},30000);signal?.addEventListener('abort',abort,{once:true});image.src=url;});\n  }));\n  if(signal?.aborted)throw new DOMException('Aborted','AbortError');\n`;
 engine=engine.replace(oldImages,'');engine=engine.replace('  const gl = canvas.getContext',load+'  const gl = canvas.getContext');
 engine=engine.replace('  canvas.width = window.innerWidth < 640 ? 1036 : 1408;', '  canvas.width = Math.min(window.innerWidth < 640 ? 900 : 1408, Math.floor(1600 / Math.max(1, images[0].height/images[0].width)), gl.getParameter(gl.MAX_TEXTURE_SIZE));');
 engine=engine.replace('  return {\n    draw(', '  let disposed=false;\n  return {\n    draw(').replace('    dispose() {','    dispose() {\n      if(disposed)return;disposed=true;').replace('      gl.deleteBuffer(buffer);','      gl.deleteBuffer(buffer);\n      gl.getExtension("WEBGL_lose_context")?.loseContext();');
 fs.writeFileSync('dist/renderer.js',engine);
 }
}
fs.writeFileSync('dist/catalog.json',JSON.stringify(catalog,null,2));
console.log(`Recovered ${catalog.length} legacy records and shared engine`);
