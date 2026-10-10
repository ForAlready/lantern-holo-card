import assert from 'node:assert/strict';import fs from 'node:fs';
import {cardLayout} from '../dist/presentation.js';
const cards=JSON.parse(fs.readFileSync('dist/catalog.json'));
assert.equal(cards.length,140);
for(const c of cards){assert(c.back,'Every card must have the original illustrated back');assert(fs.existsSync('dist/'+c.back));
 for(const[w,h]of[[320,430],[740,670],[1160,820],[1400,520]]){
  const l=cardLayout(w,h,c.ratio);assert(l.visibleWidth<=w*.90001&&l.visibleHeight<=h*.90001);assert(Math.abs(l.visibleWidth/l.visibleHeight-c.ratio)<1e-8);assert(Math.max(l.visibleWidth/w,l.visibleHeight/h)>.8999);
 }
}
assert(fs.existsSync('dist/assets/favicon.svg'));assert(fs.existsSync('dist/assets/apple-touch-icon.png'));
console.log('PASS: all 140 illustrated backs, preserved aspect ratios and visible card size at phone/tablet/desktop dimensions; icon files present.');
