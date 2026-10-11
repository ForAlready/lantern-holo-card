// Natural-aspect justified rows. Layout is cached by the controller, never per frame.
export function layoutGallery(cards,width){
 width=Math.max(1,width);const gap=width<560?12:22,target=width<560?180:width<900?230:280,maxItems=width<560?3:6,meta=width<560?44:50;
 const rows=[],items=[];let index=0,top=0;
 while(index<cards.length){const start=index;let sum=0;
  while(index<cards.length){const ratio=cards[index].ratio||1,proposed=sum+ratio,count=index-start+1,h=(width-gap*(count-1))/proposed;
   if(count>1&&h<target*.68)break;
   sum=proposed;index++;if(h<=target||count>=maxItems)break;
  }
  const count=index-start,fit=(width-gap*(count-1))/sum,last=index===cards.length,height=last?Math.min(target,fit):fit;
  const rowWidth=height*sum+gap*(count-1);let left=last?(width-rowWidth)/2:0;
  const row={index:rows.length,start,end:index,top,height,bottom:top+height+meta};
  for(let i=start;i<index;i++){const itemWidth=height*(cards[i].ratio||1);items.push({index:i,row:row.index,left,top,width:itemWidth,height});left+=itemWidth+gap;}
  rows.push(row);top=row.bottom+gap;
 }
 return {width,gap,meta,rows,items,height:Math.max(0,top-gap)};
}
function firstRow(rows,y){let lo=0,hi=rows.length;while(lo<hi){const m=(lo+hi)>>1;if(rows[m].bottom<y)lo=m+1;else hi=m;}return lo;}
export function galleryWindow(layout,scroll,viewport){
 const overscan=Math.max(240,viewport*.45),first=firstRow(layout.rows,scroll-overscan),last=firstRow(layout.rows,scroll+viewport+overscan);
 const a=layout.rows[first],b=layout.rows[Math.min(last,layout.rows.length-1)];return {start:a?.start??layout.items.length,end:b?.end??0};
}
export function galleryNeighbor(layout,index,key){
 if(key==='Home')return 0;if(key==='End')return layout.items.length-1;
 if(key==='ArrowLeft'||key==='ArrowRight')return Math.max(0,Math.min(layout.items.length-1,index+(key==='ArrowLeft'?-1:1)));
 const item=layout.items[index],row=layout.rows[item.row+(key==='ArrowUp'?-1:1)];if(!row)return index;
 const x=item.left+item.width/2;let next=row.start,distance=Infinity;for(let i=row.start;i<row.end;i++){const c=layout.items[i],d=Math.abs(c.left+c.width/2-x);if(d<distance){distance=d;next=i;}}return next;
}
