// Canvas includes transparent overscan: its CSS size, not the viewport or
// artwork texture size, determines the number of display pixels to render.
export function renderResolution(cssWidth,cssHeight,dpr=1,limits={}){
 const w=Number.isFinite(cssWidth)&&cssWidth>0?cssWidth:1;
 const h=Number.isFinite(cssHeight)&&cssHeight>0?cssHeight:1;
 const density=Number.isFinite(dpr)&&dpr>0?Math.min(dpr,3):1;
 const maxWidth=Math.max(1,Math.min(4096,limits.maxWidth||4096));
 const maxHeight=Math.max(1,Math.min(4096,limits.maxHeight||4096));
 const budget=limits.maxPixels||8*1024*1024;
 const scale=Math.min(density,maxWidth/w,maxHeight/h,Math.sqrt(budget/(w*h)));
 return {width:Math.max(1,Math.floor(w*scale)),height:Math.max(1,Math.floor(h*scale))};
}
