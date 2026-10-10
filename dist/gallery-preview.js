// One delegated interaction controller for the virtual gallery; no render loop.
export function installGalleryPreview(gallery,isReduced){
 let gesture=null;const blocked=new WeakSet();
 const buttonOf=e=>e.target.closest('.entry-button');
 function clear(b){if(!b)return;b.classList.remove('preview-active');for(const key of ['--mx','--my','--rx','--ry'])b.querySelector('.thumbnail').style.removeProperty(key);}
 function pose(b,e){if(isReduced())return;const r=b.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)),t=b.querySelector('.thumbnail');t.style.setProperty('--mx',x*100+'%');t.style.setProperty('--my',y*100+'%');t.style.setProperty('--rx',(0.5-y)*18+'deg');t.style.setProperty('--ry',(x-.5)*24+'deg');b.classList.add('preview-active');}
 gallery.addEventListener('pointerdown',e=>{const b=buttonOf(e);if(!b||e.button!==0)return;blocked.delete(b);if(e.pointerType==='touch'){gesture={b,id:e.pointerId,x:e.clientX,y:e.clientY,mode:'pending'};}else pose(b,e);},{passive:true});
 gallery.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){const b=buttonOf(e);if(b)pose(b,e);return;}if(gesture?.id!==e.pointerId)return;const g=gesture,dx=Math.abs(e.clientX-g.x),dy=Math.abs(e.clientY-g.y);if(g.mode==='pending'&&Math.max(dx,dy)>8){g.mode=dx>dy*1.2?'preview':'scroll';blocked.add(g.b);if(g.mode==='preview'&&!isReduced())g.b.setPointerCapture(e.pointerId);}if(g.mode==='preview'){if(e.cancelable)e.preventDefault();pose(g.b,e);}},{passive:false});
 function finish(e){if(gesture?.id!==e.pointerId)return;const g=gesture;gesture=null;clear(g.b);if(g.b.hasPointerCapture(e.pointerId))g.b.releasePointerCapture(e.pointerId);}
 gallery.addEventListener('pointerup',finish);gallery.addEventListener('pointercancel',finish);
 gallery.addEventListener('pointerout',e=>{const b=buttonOf(e);if(b&&!b.contains(e.relatedTarget)&&gesture?.b!==b)clear(b);});
 gallery.addEventListener('click',e=>{const b=buttonOf(e);if(b&&blocked.has(b)){blocked.delete(b);e.preventDefault();e.stopImmediatePropagation();}},true);
 return {clear};
}
