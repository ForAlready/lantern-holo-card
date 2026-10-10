export const SHADER_SCALE=1.6;
export function cardLayout(hostWidth,hostHeight,ratio){
 const safeRatio=Number.isFinite(ratio)&&ratio>0?ratio:1;
 const width=Math.max(0,hostWidth)*.90,height=Math.max(0,hostHeight)*.90;
 const visibleWidth=Math.min(width,height*safeRatio);
 return {visibleWidth,visibleHeight:visibleWidth/safeRatio,canvasWidth:visibleWidth*SHADER_SCALE};
}
