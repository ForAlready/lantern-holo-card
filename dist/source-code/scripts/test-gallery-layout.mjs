import assert from 'node:assert/strict';
import {layoutGallery,galleryWindow,galleryNeighbor} from '../dist/gallery-layout.js';
const cards=Array.from({length:1000},(_,i)=>({ratio:[.46,.67,.75,1,1.33,1.78,2.4][i%7]}));let mounted=0;
for(const width of [280,320,390,560,768,1440]){
 const l=layoutGallery(cards,width);assert.equal(l.items.length,1000);
 for(const item of l.items){assert(Math.abs(item.width/item.height-cards[item.index].ratio)<1e-9);assert(item.left>=-1e-8);assert(item.left+item.width<=width+1e-8);assert(item.height>0);}
 for(const row of l.rows){const items=l.items.slice(row.start,row.end);for(let i=1;i<items.length;i++)assert(items[i].left>=items[i-1].left+items[i-1].width+l.gap-1e-8);if(row.index<l.rows.length-1)assert(l.rows[row.index+1].top>=row.bottom+l.gap);}
 for(let scroll=-800;scroll<l.height+1500;scroll+=617){const w=galleryWindow(l,scroll,900);assert(w.start>=0&&w.end<=1000&&w.end>=w.start);mounted=Math.max(mounted,w.end-w.start);}
 const next=galleryNeighbor(l,0,'ArrowDown');assert.equal(l.items[next].row,1);assert.equal(l.items[galleryNeighbor(l,next,'ArrowUp')].row,0);assert.equal(galleryNeighbor(l,0,'ArrowLeft'),0);assert.equal(galleryNeighbor(l,500,'End'),999);
}
assert(mounted<=70);assert.deepEqual(galleryWindow(layoutGallery([],390),0,900),{start:0,end:0});console.log('PASS: native aspect, non-overlap, responsive geometry, keyboard adjacency and 1,000-card windows; peak mounted:',mounted);
