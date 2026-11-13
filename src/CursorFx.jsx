import {useEffect,useRef,useState} from 'react';

// Pointer polish for mouse users only: a soft ring that trails the cursor and
// names what a click will do, a preview image for directory entries, and
// buttons that lean toward the pointer. The real cursor is never hidden.
// Touch screens and reduced motion get none of this.

export const CURSOR_LABELS=[
 ['.snoopy-companion','Toss'],
 ['.canvas .object','Drag'],
 ['.story-image,.index-preview,.project-title-button','Quick take'],
 ['.project-directory button','Quick take'],
 ['.intro-blind-pull','Pull'],
];
const MAGNETIC='.hero-cta a,.contact-section .text-action,.guide-primary';

export function cursorLabel(target){
 for(const [selector,label] of CURSOR_LABELS)if(target?.closest?.(selector))return label;
 return '';
}

export function CursorFx(){
 const ring=useRef(null),preview=useRef(null);
 const [enabled]=useState(()=>matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{
  if(!enabled)return;
  let x=-100,y=-100,rx=-100,ry=-100,px=-100,py=-100,id,label='',magnet=null,shown='';
  const move=e=>{
   if(e.pointerType&&e.pointerType!=='mouse')return;
   x=e.clientX;y=e.clientY;
   const next=e.buttons?'':cursorLabel(e.target);
   if(next!==label){label=next;const r=ring.current;if(r)r.classList.toggle('is-active',!!label);}
   const src=e.target.closest?.('[data-preview]')?.dataset.preview||'';
   if(src!==shown){shown=src;const p=preview.current;if(p){if(src)p.querySelector('img').src=src;p.classList.toggle('is-on',!!src);}}
   const m=e.target.closest?.(MAGNETIC)||null;
   if(m!==magnet){if(magnet)magnet.style.translate='';magnet=m;}
   if(magnet){const b=magnet.getBoundingClientRect();magnet.style.translate=`${((x-(b.left+b.width/2))*.22).toFixed(1)}px ${((y-(b.top+b.height/2))*.3).toFixed(1)}px`;}
  };
  const leave=()=>{x=y=-100;if(magnet){magnet.style.translate='';magnet=null;}preview.current?.classList.remove('is-on');shown='';};
  const tick=()=>{
   rx+=(x-rx)*.2;ry+=(y-ry)*.2;px+=(x-px)*.12;py+=(y-py)*.12;
   if(ring.current)ring.current.style.transform=`translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;
   if(preview.current)preview.current.style.transform=`translate(${(px+26).toFixed(1)}px,${(py+22).toFixed(1)}px)`;
   id=requestAnimationFrame(tick);
  };
  window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);
  id=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(id);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);if(magnet)magnet.style.translate='';};
 },[enabled]);
 if(!enabled)return null;
 return <><div ref={ring} className="cursor-ring" aria-hidden="true"/><div ref={preview} className="cursor-preview" aria-hidden="true"><img alt=""/></div></>;
}
