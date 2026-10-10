import assert from 'node:assert/strict';
import {createCardRenderer} from '../dist/renderer.js';
globalThis.window={innerWidth:390};
globalThis.fetch=async(_url,{signal}={})=>{if(signal?.aborted)throw new DOMException('Aborted','AbortError');return {ok:true,blob:async()=>new Blob(['image'])};};
globalThis.Image=class {width=100;height=160;set src(value){if(value)queueMicrotask(()=>this.onload?.());}};
let contexts=0,draws=0,disposed=0,compileOK=true;
function makeGL(){const live={textures:new Set(),frames:new Set(),programs:new Set(),shaders:new Set(),buffers:new Set()};const names={Texture:'textures',Framebuffer:'frames',Program:'programs',Shader:'shaders',Buffer:'buffers'},gl={getShaderParameter:()=>compileOK,getProgramParameter:()=>true,checkFramebufferStatus:()=> 'FRAMEBUFFER_COMPLETE',getParameter:()=>4096,getAttribLocation:()=>0,getUniformLocation:(_p,n)=>n,getShaderInfoLog:()=> 'compile test failure',drawArrays:()=>draws++,getExtension:()=>({loseContext(){for(const set of Object.values(live))assert.equal(set.size,0);disposed++;}})};for(const [kind,key] of Object.entries(names)){gl['create'+kind]=()=>{const id={};live[key].add(id);return id;};gl['delete'+kind]=id=>{assert(live[key].delete(id),'resource deleted once');};}return new Proxy(gl,{get(target,key){return key in target?target[key]:/^[A-Z_]+$/.test(String(key))?String(key):()=>{};}});}
const assets={character:'char',background:'bg',ui:'ui',structure:'structure'};
for(let i=0;i<20;i++){const gl=makeGL(),canvas={getContext(){contexts++;return gl;}};const renderer=await createCardRenderer(canvas,assets);const before=draws;renderer.draw(4,12,1,-3,.15);assert.equal(draws-before,6);renderer.dispose();renderer.dispose();renderer.draw(0,0,1);assert.equal(draws-before,6);}
assert.equal(disposed,20);assert.equal(contexts,20);
const aborter=new AbortController();aborter.abort();await assert.rejects(createCardRenderer({getContext(){contexts++;return makeGL();}},assets,aborter.signal),{name:'AbortError'});assert.equal(contexts,20,'aborted loading allocates no context');
compileOK=false;await assert.rejects(createCardRenderer({getContext(){return makeGL();}},assets),/compile test failure/);assert.equal(disposed,21,'failed shader cleans partial initialization');
console.log('PASS: six draw passes, 20 resource lifecycles, abort before allocation, shader failure cleanup');
