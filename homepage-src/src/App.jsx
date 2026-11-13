import { useEffect, useRef, useState } from 'react';
import { useSnoopyMotion } from './useSnoopyMotion';
import { SnoopySprite } from './SnoopySprite';
import { DoghouseLetter } from './DoghouseLetter';
import { wakeDuration, wakeFrameAt, STAND } from './snoopyWake';
import design from './designSettings.json';

const A='/assets/';
export function App(){
 const [phase,setPhase]=useState('sleep'); const [wakeFrame,setWakeFrame]=useState(0);const [sound,setSound]=useState(false);const [reduced,setReduced]=useState(false); const audio=useRef(null);const startTouch=useRef(0);
 useEffect(()=>{if(phase==='reveal'){window.parent.postMessage({type:'jtavu-reveal'},location.origin);const t=setTimeout(()=>window.parent.postMessage({type:'jtavu-enter'},location.origin),1200);return()=>clearTimeout(t)}},[phase]);
 const isOpen=phase==='open'; const awake=!['sleep','hint'].includes(phase);
 const {character,motion,atHome,goHome,visitProject}=useSnoopyMotion(phase,reduced);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');setReduced(q.matches);const change=()=>setReduced(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change)},[]);
 useEffect(()=>{document.body.style.overflow=isOpen?'':'hidden';return()=>{document.body.style.overflow=''}},[isOpen]);
 useEffect(()=>{const delay={waking:wakeDuration+150,emerging:1000,reveal:1200}[phase];const next={waking:'emerging',emerging:'ready',reveal:undefined}[phase];if(!next)return;const t=setTimeout(()=>setPhase(next),reduced?200:delay);return()=>clearTimeout(t)},[phase,reduced]);
 useEffect(()=>{if(phase!=='waking')return;setWakeFrame(reduced?STAND:0);if(reduced)return;let id;const start=performance.now();const tick=now=>{const elapsed=now-start;setWakeFrame(wakeFrameAt(elapsed));if(elapsed<wakeDuration)id=requestAnimationFrame(tick)};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[phase,reduced]);
 function chirp(){if(!sound)return;try{audio.current ||=new (window.AudioContext||window.webkitAudioContext)();audio.current.resume();const o=audio.current.createOscillator(),g=audio.current.createGain();o.type='sine';o.frequency.setValueAtTime(640,audio.current.currentTime);o.frequency.exponentialRampToValueAtTime(420,audio.current.currentTime+.12);g.gain.setValueAtTime(.035,audio.current.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.current.currentTime+.15);o.connect(g);g.connect(audio.current.destination);o.start();o.stop(audio.current.currentTime+.16)}catch{}}
 function nudge(){if(phase==='sleep')setPhase('hint');if(phase==='ready'){chirp();setPhase('reveal')}}
 function wake(){if(phase==='sleep'||phase==='hint'){chirp();setPhase('waking')}}
 useEffect(()=>{function wheel(e){if(isOpen||e.target.closest?.('.design-editor'))return;e.preventDefault();if(e.deltaY>5)nudge()};function key(e){if(e.key==='ArrowDown'&&phase==='ready')return;if(e.target instanceof HTMLElement && ['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(['ArrowDown','PageDown',' '].includes(e.key)&&!isOpen){e.preventDefault();nudge()}};function touch(e){if(e.target.closest?.('.design-editor'))return;if(!isOpen&&startTouch.current-e.touches[0].clientY>25){e.preventDefault();nudge()}};window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);window.addEventListener('touchmove',touch,{passive:false});return()=>{window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('touchmove',touch)}},[phase,isOpen]);
 function reset(){window.scrollTo(0,0);setPhase('sleep')}
 return <div className="site-shell" style={{'--ink':design.ink,'--paper':design.paper,'--house':design.house,'--word-font':design.font,'--house-width':`${design.houseWidth}em`,'--house-height':`${design.houseHeight}em`,'--house-gap':`${design.houseGap}em`,'--snoopy-start':`${design.snoopyX}%`,'--word-size':`${design.size}vw`}}>
 {!isOpen&&<section className={`intro ${phase} ${reduced?'reduced':''}`} aria-label="JTAVU introduction" onTouchStart={e=>startTouch.current=e.touches[0].clientY}>
  <div className="word-scene">
   <div className="wordmark" aria-label="JTAVU"><button className="wordmark-copy" aria-label="Explore JTAVU" onClick={nudge}>{design.left}</button><button className="house-button" aria-label={!awake?"Wake Snoopy":atHome?"Bring Snoopy out of his doghouse":"Snoopy’s doghouse"} onClick={()=>awake?goHome():wake()} disabled={phase==='waking'||phase==='emerging'}><DoghouseLetter/></button><button className="wordmark-copy" aria-label="Explore John’s world" onClick={nudge}>{design.right}</button></div>
   <button ref={character} className={`snoopy ${awake&&!atHome?'awake':'sleeping'} ${phase==='waking'?'is-waking':''} ${phase==='waking'&&wakeFrame===6?'is-stretching':''} ${phase==='waking'&&wakeFrame===STAND?'is-shaking':''}`} aria-label={awake?'Snoopy is awake':'Wake Snoopy'} onClick={wake} disabled={awake}>
    <SnoopySprite frame={motion.walking?motion.frame:!awake||atHome||wakeFrame===STAND?0:wakeFrame} walking={motion.walking} standing={!motion.walking&&awake&&!atHome&&(wakeFrame===STAND||(motion.standing&&phase!=='waking'))} facing={motion.facing}/><span className="sleep-z" aria-hidden="true"><span>Z</span><span>Z</span><span>Z</span></span>
   </button>
  </div>
  <div className="dialogue-space" aria-live="polite" aria-atomic="true">
   {!awake&&<button className="hint doorway-hint" onClick={wake}>Psst… wake Snoopy.</button>}
   {phase==='ready'&&<div className="speech"><p>Take a look around.<br/><small>Click a blank spot. I’ll follow.</small></p><button onClick={()=>setPhase('reveal')}>Explore the page <span aria-hidden="true">↓</span></button></div>}
  </div>
  <div className="intro-controls"><button onClick={()=>setSound(!sound)} aria-pressed={sound}>Sound {sound?'on':'off'}</button>{awake&&phase!=='waking'&&<span className="movement-hint">Click a blank spot to let Snoopy wander.</span>}</div>
 </section>}
 </div>
}
