import assert from 'node:assert/strict';
import {installGalleryPreview} from '../dist/gallery-preview.js';
const handlers={},vars=new Map(),classes=new Set();let captured=false,reduced=false;
const b={closest:()=>b,contains:t=>t===b,getBoundingClientRect:()=>({left:0,top:0,width:200,height:250}),querySelector:()=>({style:{setProperty:(k,v)=>vars.set(k,v),removeProperty:k=>vars.delete(k)}}),classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},setPointerCapture:()=>captured=true,hasPointerCapture:()=>captured,releasePointerCapture:()=>captured=false};
installGalleryPreview({addEventListener:(type,fn)=>handlers[type]=fn},()=>reduced);
function send(type,values={}){const e={target:b,button:0,pointerId:1,pointerType:'touch',clientX:100,clientY:125,cancelable:true,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...values};handlers[type](e);return e;}
send('pointermove',{pointerType:'mouse',clientX:200,clientY:0});assert.equal(vars.get('--ry'),'12deg');assert.equal(vars.get('--rx'),'9deg');assert(classes.has('preview-active'));
send('pointerout',{relatedTarget:null});assert.equal(vars.size,0);
send('pointerdown');send('pointerup');assert(!send('click').stopped,'tap opens details');
send('pointerdown');send('pointermove',{clientX:145});assert(captured);assert(classes.has('preview-active'));send('pointerup',{clientX:145});assert(!captured);assert(send('click').stopped,'horizontal drag cannot open details');assert.equal(vars.size,0);
send('pointerdown');const vertical=send('pointermove',{clientY:170});assert(!vertical.prevented);assert(!captured);assert(!classes.has('preview-active'));send('pointercancel');assert(send('click').stopped,'scroll cannot open details');
send('pointerdown');send('pointermove',{clientX:140});send('pointercancel');assert(!captured);assert.equal(vars.size,0);
reduced=true;send('pointermove',{pointerType:'mouse'});assert(!classes.has('preview-active'));send('pointerdown');send('pointerup');assert(!send('click').stopped);
console.log('Gallery interaction: mouse tilt, touch drag, tap, vertical scroll, cancellation and reduced motion pass.');
