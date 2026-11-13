import {useEffect,useRef,useState} from 'react';

// Pointer polish for mouse users only: an animated pixel-art arrow that
// replaces the system cursor, a short pixel trail when moving fast, a spark
// burst on click, a preview image for directory entries, and buttons that
// lean toward the pointer. Touch screens and reduced motion get none of this
// and keep the normal system cursor.

export const CURSOR_MODES=[
 ['.snoopy-companion','grab'],
 ['.canvas .object','grab'],
 ['.intro-blind-pull','grab'],
 ['input,textarea,[contenteditable="true"]','text'],
 ['a,button,summary,label,select,[role="button"],[data-preview]','point'],
];
const MAGNETIC='.hero-cta a,.contact-section .text-action,.guide-primary';

export function cursorMode(target){
 for(const [selector,mode] of CURSOR_MODES)if(target?.closest?.(selector))return mode;
 return '';
}

// 12 x 17 pixel arrow. o = ink outline, x = fill (state colour), w = paper shine.
export const ARROW=[
 'o',
 'oo',
 'oxo',
 'owxo',
 'owxxo',
 'owxxxo',
 'owxxxxo',
 'oxxxxxxo',
 'oxxxxxxxo',
 'oxxxxxxxxo',
 'oxxxxxxxxxo',
 'oxxxxxoooooo',
 'oxxoxxo',
 'oxo oxxo',
 'oo  oxxo',
 'o    oxxo',
 '     ooo',
];

function Arrow(){
 const cells=[];
 ARROW.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" className={`px-${c}`}/>);}));
 return <svg className="cursor-arrow" viewBox="0 0 12 17" width="24" height="34" shapeRendering="crispEdges" aria-hidden="true">{cells}</svg>;
}

const SPARK_COLORS=['var(--ink,#141414)','var(--accent,#d7301f)','var(--sun,#ffd23f)'];

export function CursorFx(){
 const layer=useRef(null),pointer=useRef(null),preview=useRef(null),trail=useRef([]),sparks=useRef(null);
 const [enabled]=useState(()=>matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{
  if(!enabled)return;
  const root=document.documentElement;
  // Modal dialogs live in the browser's top layer, above every z-index. The
  // cursor joins the top layer too (popover) and re-raises itself whenever a
  // dialog opens, so it is never buried. Without popover support the system
  // cursor comes back while a dialog is open.
  const top=layer.current,canPop=!!top?.showPopover;
  const raise=()=>{if(!canPop)return false;try{if(top.matches(':popover-open'))top.hidePopover();top.showPopover();return true;}catch{return false}};
  const dialogs=()=>{const open=!!document.querySelector('dialog[open]');root.classList.toggle('fx-cursor-off',open&&!raise());};
  raise();
  const watch=new MutationObserver(dialogs);watch.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  let x=-100,y=-100,px=-100,py=-100,id,mode='',magnet=null,shown='',still,last=performance.now();
  const dots=trail.current.map(()=>({x:-100,y:-100}));
  const setMode=next=>{if(next===mode)return;mode=next;const p=pointer.current;if(p)p.dataset.mode=mode||'arrow';root.classList.toggle('fx-cursor-text',mode==='text');};
  const wake=()=>{pointer.current?.classList.remove('is-idle');clearTimeout(still);still=setTimeout(()=>pointer.current?.classList.add('is-idle'),2200);};
  const move=e=>{
   if(e.pointerType&&e.pointerType!=='mouse')return;
   if(!root.classList.contains('fx-cursor'))root.classList.add('fx-cursor');
   x=e.clientX;y=e.clientY;pointer.current?.classList.add('is-on');wake();
   setMode(cursorMode(e.target));
   const src=e.target.closest?.('[data-preview]')?.dataset.preview||'';
   if(src!==shown){shown=src;const p=preview.current;if(p){if(src)p.querySelector('img').src=src;p.classList.toggle('is-on',!!src);}}
   const m=e.target.closest?.(MAGNETIC)||null;
   if(m!==magnet){if(magnet)magnet.style.translate='';magnet=m;}
   if(magnet){const b=magnet.getBoundingClientRect();magnet.style.translate=`${((x-(b.left+b.width/2))*.22).toFixed(1)}px ${((y-(b.top+b.height/2))*.3).toFixed(1)}px`;}
  };
  const down=e=>{
   if(e.pointerType&&e.pointerType!=='mouse')return;
   pointer.current?.classList.add('is-down');burst(e.clientX,e.clientY);
  };
  const up=()=>pointer.current?.classList.remove('is-down');
  const burst=(bx,by)=>{
   const box=sparks.current;if(!box)return;
   for(let i=0;i<7;i++){
    const s=document.createElement('i');s.className='cursor-spark';
    const a=(i/7)*Math.PI*2+Math.random()*.5,d=18+Math.random()*16,size=3+Math.round(Math.random()*2);
    s.style.cssText=`left:${bx}px;top:${by}px;width:${size}px;height:${size}px;background:${SPARK_COLORS[i%3]}`;
    box.appendChild(s);
    s.animate([{transform:'translate(-50%,-50%)',opacity:1},{transform:`translate(calc(-50% + ${(Math.cos(a)*d).toFixed(1)}px),calc(-50% + ${(Math.sin(a)*d).toFixed(1)}px))`,opacity:0}],{duration:420+Math.random()*160,easing:'steps(6,end)'}).onfinish=()=>s.remove();
   }
  };
  const leave=()=>{x=y=-100;pointer.current?.classList.remove('is-on');if(magnet){magnet.style.translate='';magnet=null;}preview.current?.classList.remove('is-on');shown='';};
  const tick=now=>{
   const dt=Math.min(.05,(now-last)/1000);last=now;
   const p=pointer.current;
   if(p)p.style.transform=`translate(${x}px,${y}px)`;
   // Trail: each dot chases the one ahead; shown only while moving quickly.
   let lx=x,ly=y,speed=0;
   dots.forEach((d,i)=>{const k=1-Math.pow(.0005,dt*(1.6-i*.2));const nx=d.x+(lx-d.x)*k,ny=d.y+(ly-d.y)*k;if(i===0)speed=Math.hypot(nx-d.x,ny-d.y)/Math.max(dt,.001);d.x=nx;d.y=ny;lx=d.x;ly=d.y;});
   const show=Math.min(1,Math.max(0,(speed-500)/900));
   trail.current.forEach((el,i)=>{if(!el)return;el.style.transform=`translate(${Math.round(dots[i].x)}px,${Math.round(dots[i].y)}px)`;el.style.opacity=(show*(1-i/trail.current.length)*.8).toFixed(2);});
   px+=(x-px)*.12;py+=(y-py)*.12;
   if(preview.current)preview.current.style.transform=`translate(${(px+26).toFixed(1)}px,${(py+22).toFixed(1)}px)`;
   id=requestAnimationFrame(tick);
  };
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('pointerdown',down,{passive:true});
  window.addEventListener('pointerup',up,{passive:true});
  window.addEventListener('blur',leave);
  root.addEventListener('pointerleave',leave);
  id=requestAnimationFrame(tick);
  return()=>{watch.disconnect();if(canPop&&top.matches(':popover-open'))try{top.hidePopover()}catch{};root.classList.remove('fx-cursor-off');cancelAnimationFrame(id);clearTimeout(still);root.classList.remove('fx-cursor','fx-cursor-text');window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);window.removeEventListener('blur',leave);root.removeEventListener('pointerleave',leave);if(magnet)magnet.style.translate='';};
 },[enabled]);
 if(!enabled)return null;
 return <div ref={layer} className="cursor-layer" popover="manual" aria-hidden="true">
  {[0,1,2,3].map(i=><i key={i} ref={el=>{trail.current[i]=el;}} className="cursor-trail" style={{'--n':i}} aria-hidden="true"/>)}
  <div ref={pointer} className="cursor-pixel" data-mode="arrow" aria-hidden="true"><span className="cursor-body"><Arrow/></span></div>
  <div ref={sparks} className="cursor-sparks" aria-hidden="true"/>
  <div ref={preview} className="cursor-preview" aria-hidden="true"><img alt=""/></div>
 </div>;
}
