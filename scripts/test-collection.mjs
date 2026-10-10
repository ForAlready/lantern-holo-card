import assert from 'node:assert/strict';
import {gridWindow,selectCards} from '../dist/collection.js';
const records=Array.from({length:1000},(_,i)=>({id:String(i),name:'藏品'+i,original:'Cache_'+i+'.png',ratio:i%3===0?.6:i%3===1?1:1.8,legacy:i<6}));
assert.equal(selectCards(records,{query:'Cache_17.png'}).length,1);
assert.equal(selectCards(records,{favoriteOnly:true,favorites:new Set(['1','7'])}).length,2);
assert.equal(selectCards(records,{orientation:'landscape'}).length,333);
assert.equal(selectCards(records,{query:'不存在'}).length,0);
assert.equal(selectCards(records,{sort:'new'})[0].id,'6');
let maxMounted=0;
for(const width of [280,320,390,768,1440])for(let scroll=0;scroll<100000;scroll+=617){const w=gridWindow(1000,width,400,scroll,900);assert(w.start>=0&&w.end<=1000&&w.end>=w.start);maxMounted=Math.max(maxMounted,w.end-w.start);}
assert(maxMounted<=60);console.log('PASS: search/filter/favorites/order and 1000-record virtualization; maximum mounted',maxMounted);
