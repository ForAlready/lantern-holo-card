export function selectCards(cards,{query='',orientation='all',sort='default',favoriteOnly=false,favorites=new Set()}={}){
 const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const selected=cards.filter(c=>terms.every(t=>(c.name+' '+c.original).toLocaleLowerCase().includes(t))&&(!favoriteOnly||favorites.has(c.id))&&(orientation==='all'||orientation==='portrait'&&c.ratio<.95||orientation==='landscape'&&c.ratio>1.05||orientation==='square'&&c.ratio>=.95&&c.ratio<=1.05));
 if(sort==='name')selected.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
 if(sort==='new')selected.sort((a,b)=>Number(!!a.legacy)-Number(!!b.legacy));return selected;
}
export function gridWindow(count,width,offset,scroll,viewport){
 const gap=width<560?14:24,cols=Math.max(2,Math.floor((width+gap)/(width<560?145:235))),itemWidth=(width-gap*(cols-1))/cols,rowHeight=Math.ceil(itemWidth*1.25)+(width<560?88:110),rows=Math.ceil(count/cols),startRow=Math.max(0,Math.floor((scroll-offset)/rowHeight)-2),endRow=Math.min(rows,Math.ceil((scroll+viewport-offset)/rowHeight)+2);
 return {gap,cols,itemWidth,rowHeight,height:rows*rowHeight,start:Math.min(count,startRow*cols),end:Math.max(0,Math.min(count,endRow*cols))};
}
