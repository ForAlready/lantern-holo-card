import assert from 'node:assert/strict';
import {renderResolution} from '../dist/render-resolution.js';
// Overscan is 1.6×: a 350×560 visible phone card uses a 560×896 CSS canvas.
const phone=renderResolution(560,896,3);assert.deepEqual(phone,{width:1680,height:2688});
assert.equal(phone.width/1.6,350*3,'visible card gets three physical pixels per CSS pixel');
const tablet=renderResolution(1024,1440,2);assert.deepEqual(tablet,{width:2048,height:2880});
assert(tablet.height>1600,'tablet is no longer held to the former 1600px canvas cap');
for(const ratio of [.25,.5625,.7,1,1.93,3.5])for(const density of [1,2,3,4]){
 const s=renderResolution(1600,1600/ratio,density,{maxWidth:4096,maxHeight:4096});
 assert(s.width<=4096&&s.height<=4096);assert(s.width*s.height<=8*1024*1024);
 assert(Math.abs(s.width/s.height-ratio)<.004,'aspect preserved within pixel rounding');
}
assert.deepEqual(renderResolution(560,896,3,{maxWidth:1024,maxHeight:1024}),{width:640,height:1024});
assert.deepEqual(renderResolution(0,0,NaN),{width:1,height:1});
console.log('PASS: phone/tablet physical-pixel resolution, overscan, aspect and GPU/pixel-budget limits');
