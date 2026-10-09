'use strict';
const cards = [
{id:'lantern',name:'灯下之约',en:'LANTERN RENDEZVOUS',tag:'LAYERED HOLO',ratio:720/1280,layered:true},
{id:'dragon',name:'青龙吟月',en:'DRAGON AND MOON',tag:'LAYERED HOLO',ratio:2,layered:true},
{id:'neon',name:'霓虹幻色',en:'NEON REVERIE',tag:'LAYERED HOLO',ratio:719/1280,layered:true},
{id:'witch',name:'星帷魔法',en:'STARRY SPELL',tag:'LAYERED HOLO',ratio:915/1280,layered:true},
{id:'moonfox',name:'朝月清辉',en:'MOONLIT RADIANCE',tag:'LAYERED HOLO',ratio:720/1280,layered:true},
{id:'pool',name:'夏日水光',en:'SUMMER SPLASH',tag:'LAYERED HOLO',ratio:693/1280,layered:true}
];
const $=s=>document.querySelector(s),gallery=$('#gallery'),viewer=$('#viewer'),host=$('#card-host');
let index=0,faceBack=false,active=null,motion=false,origin=null,sensorTimer=null,orientationSeen=false,drag=null,motionTicket=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pose(el,x,y){if(!el)return;el.style.setProperty('--rx',`${-y*14}deg`);el.style.setProperty('--ry',`${x*18}deg`);el.style.setProperty('--mx',`${50+x*40}%`);el.style.setProperty('--my',`${50+y*40}%`);}
for(const [i,c] of cards.entries()){
 const entry=document.createElement('article');entry.className='entry';
 entry.innerHTML=`<button class="entry-button" aria-label="打开闪卡：${c.name}"><div class="thumbnail"><img src="assets/${c.id}.jpg" alt="${c.name}" loading="${i<3?'eager':'lazy'}" decoding="async"><span class="foil"></span><span class="glare"></span></div><span class="card-tag">${c.tag}</span><span class="open-mark" aria-hidden="true">⤢</span></button><div class="entry-meta"><div><h3>${c.name}</h3><p>${c.en}</p></div><span class="entry-no">/ ${String(i+1).padStart(2,'0')}</span></div>`;
 const b=entry.querySelector('button'),thumb=entry.querySelector('.thumbnail');
 b.addEventListener('click',()=>open(i));b.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;const r=b.getBoundingClientRect();pose(thumb,(e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1);});b.addEventListener('pointerleave',()=>pose(thumb,0,0));gallery.append(entry);
}
function stopMotion(message){motionTicket++;motion=false;origin=null;orientationSeen=false;clearTimeout(sensorTimer);window.removeEventListener('deviceorientation',orientation);window.removeEventListener('devicemotion',gravity);$('#motion').setAttribute('aria-pressed','false');$('#motion').textContent='开启手机感应';if(message)$('#hint').textContent=message;}
function show(){
 stopMotion();faceBack=false;drag=null;active=null;
 const c=cards[index];$('#viewer-title').textContent=c.name;$('#viewer-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')} · ${c.en}`;
 $('#controls').hidden=!!c.layered;$('#layered-note').hidden=!c.layered;
 if(c.layered){host.innerHTML=`<iframe class="layered-frame ${c.id==='dragon'?'wide-frame':''}" title="${c.name}分层闪卡" src="cards/${c.id}.html" allow="accelerometer; gyroscope"></iframe>`;return;}
 host.innerHTML=`<div class="holo-card" role="button" tabindex="0" aria-label="${c.name}，轻点翻面，拖动旋转" aria-pressed="false" style="--ratio:${c.ratio}"><div class="card-face card-front"><img src="assets/${c.id}.jpg" alt="${c.name}" draggable="false"><span class="foil"></span><span class="glare"></span></div><div class="card-face card-back"><small>HOLO ARCHIVE / ${String(index+1).padStart(2,'0')}</small><span class="back-star" aria-hidden="true">✦</span><strong>${c.name}</strong><small>${c.en}</small><p>光影藏册<br>轻点卡片，返回画面</p></div></div>`;
 active=host.querySelector('.holo-card');const image=active.querySelector('img');image.onload=()=>{if(active&&image.isConnected)active.style.setProperty('--ratio',image.naturalWidth/image.naturalHeight);};image.onerror=()=>{$('#hint').textContent='图片加载失败，请关闭后重新打开。';};
 active.style.setProperty('--foil',$('#shine').value);$('#flip').textContent='翻面';$('#hint').textContent='拖动旋转 · 轻点翻面 · ← → 切换 · Esc 关闭';
 active.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};active.setPointerCapture(e.pointerId);});
 active.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved ||= Math.hypot(dx,dy)>6;if(!reduced)pose(active,clamp(dx/130,-1,1),clamp(dy/130,-1,1));});
 active.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved;drag=null;if(!moved)flip();else pose(active,0,0);});
 active.addEventListener('pointercancel',()=>{drag=null;pose(active,0,0);});active.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();flip();}});
}
function open(i){index=i;show();viewer.showModal();document.body.classList.add('modal-open');history.replaceState(null,'',`#${cards[index].id}`);$('#close').focus();}
function step(n){index=(index+n+cards.length)%cards.length;show();history.replaceState(null,'',`#${cards[index].id}`);}
function flip(){if(!active)return;faceBack=!faceBack;active.style.setProperty('--flip',faceBack?'180deg':'0deg');active.setAttribute('aria-pressed',String(faceBack));$('#flip').textContent=faceBack?'返回正面':'翻面';}
function recenter(){origin=null;pose(active,0,0);}
function orientValues(beta,gamma){if(!motion||!active||document.hidden||drag)return;if(!origin)origin={beta,gamma};const wrap=v=>((v+180)%360+360)%360-180;const b=wrap(beta-origin.beta),g=wrap(gamma-origin.gamma),a=(screen.orientation?.angle??window.orientation??0)*Math.PI/180;pose(active,clamp((g*Math.cos(a)-b*Math.sin(a))/25,-1,1),clamp((b*Math.cos(a)+g*Math.sin(a))/25,-1,1));$('#hint').textContent='感应已开启 · 缓慢倾斜手机 · 点击“回正”重新校准';}
function orientation(e){if(!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;orientationSeen=true;clearTimeout(sensorTimer);orientValues(e.beta,e.gamma);}
function gravity(e){if(orientationSeen)return;const a=e.accelerationIncludingGravity;if(!a||![a.x,a.y,a.z].every(Number.isFinite))return;clearTimeout(sensorTimer);orientValues(Math.atan2(a.y,a.z)*180/Math.PI,Math.atan2(-a.x,Math.hypot(a.y,a.z))*180/Math.PI);}
$('#motion').onclick=async()=>{
 if(motion){stopMotion('感应已关闭 · 可拖动旋转');recenter();return;}
 if(!window.isSecureContext){$('#hint').textContent='手机感应需要 HTTPS，请从站点链接打开。';return;}
 if(!('DeviceOrientationEvent'in window)&&!('DeviceMotionEvent'in window)){$('#hint').textContent='此设备不支持感应，仍可拖动欣赏。';return;}
 const ticket=++motionTicket;
 try{
  let granted=true;
  if(typeof window.DeviceOrientationEvent?.requestPermission==='function')granted=await DeviceOrientationEvent.requestPermission()==='granted';
  else if(typeof window.DeviceMotionEvent?.requestPermission==='function')granted=await DeviceMotionEvent.requestPermission()==='granted';
  if(ticket!==motionTicket||!viewer.open)return;
  if(!granted){$('#hint').textContent='未获得感应权限，仍可拖动旋转。';return;}
  motion=true;origin=null;orientationSeen=false;window.addEventListener('deviceorientation',orientation);window.addEventListener('devicemotion',gravity);$('#motion').textContent='关闭手机感应';$('#motion').setAttribute('aria-pressed','true');$('#hint').textContent='请缓慢倾斜手机，正在等待传感器…';sensorTimer=setTimeout(()=>stopMotion('未收到感应数据，请使用拖动旋转。'),5000);
 }catch{stopMotion('感应无法开启，请在手机浏览器中重试或使用拖动。');}
};
$('#shine').oninput=e=>{$('#shine-value').value=`${Math.round(e.target.value*100)}%`;active?.style.setProperty('--foil',e.target.value);};$('#flip').onclick=flip;$('#recenter').onclick=recenter;$('#previous').onclick=()=>step(-1);$('#next').onclick=()=>step(1);$('#close').onclick=()=>viewer.close();
viewer.addEventListener('close',()=>{stopMotion();host.replaceChildren();active=null;document.body.classList.remove('modal-open');history.replaceState(null,'',location.pathname+location.search);gallery.querySelectorAll('button')[index]?.focus();});
document.addEventListener('keydown',e=>{if(!viewer.open||e.target instanceof HTMLInputElement)return;if(e.key==='ArrowRight'){e.preventDefault();step(1);}if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}});screen.orientation?.addEventListener('change',recenter);document.addEventListener('visibilitychange',()=>{if(document.hidden&&motion){stopMotion('感应已暂停，点击按钮重新开启。');recenter();}});
const initial=cards.findIndex(c=>`#${c.id}`===location.hash);if(initial>=0)open(initial);
