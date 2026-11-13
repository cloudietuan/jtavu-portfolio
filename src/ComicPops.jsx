import {useEffect,useRef} from 'react';

// Comic sound effects: tapping or clicking a button or link pops a starburst
// with a word (POW!, BAM!...) where you pressed. Works for touch and mouse;
// off under reduced motion.
export const POP_WORDS=['POW!','BAM!','ZAP!','WHAM!','BOOM!','POP!','KAPOW!','ZING!'];
export function pickWord(last,random=Math.random){
 const pool=POP_WORDS.filter(w=>w!==last);
 return pool[Math.floor(random()*pool.length)%pool.length];
}

export function ComicPops(){
 const layer=useRef(null);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let last=null,lastAt=0;
  const down=e=>{
   const hit=e.target.closest?.('a,button,summary,[role="button"]');
   if(!hit||hit.closest('.snoopy-companion,.cmd-menu,.canvas .object'))return;
   const now=performance.now();if(now-lastAt<180)return;lastAt=now;
   const box=layer.current;if(!box)return;
   const word=pickWord(last);last=word;
   const pop=document.createElement('span');pop.className='comic-pop';pop.textContent=word;
   pop.style.left=`${e.clientX}px`;pop.style.top=`${e.clientY}px`;
   const tilt=(Math.random()*24-12).toFixed(1),dx=(Math.random()*30-15).toFixed(1);
   box.appendChild(pop);
   pop.animate([
    {transform:`translate(-50%,-50%) scale(.2) rotate(${tilt}deg)`,opacity:0},
    {transform:`translate(-50%,-90%) scale(1.15) rotate(${tilt}deg)`,opacity:1,offset:.25},
    {transform:`translate(calc(-50% + ${dx}px),-120%) scale(1) rotate(${tilt}deg)`,opacity:1,offset:.7},
    {transform:`translate(calc(-50% + ${dx}px),-140%) scale(.9) rotate(${tilt}deg)`,opacity:0},
   ],{duration:620,easing:'cubic-bezier(.2,.9,.3,1)'}).onfinish=()=>pop.remove();
  };
  window.addEventListener('pointerdown',down,{passive:true});
  return()=>window.removeEventListener('pointerdown',down);
 },[]);
 return <div ref={layer} className="comic-pop-layer" aria-hidden="true"/>;
}
