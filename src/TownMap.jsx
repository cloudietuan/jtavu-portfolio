import {useEffect,useRef,useState} from 'react';
import {whenScrollSettles} from './CommandMenu.jsx';

// "Pick a building": a little comic town where every building is a section of
// the site. Tap one (or use the arrow keys) and the red car drives there, the
// door pops, and the page takes you inside. The drive-around-to-explore idea
// comes from Bruno Simon's portfolio; the art here is original and simple.

export const STOPS=[
 {id:'work',sign:'Work',target:'work',art:'workshop'},
 {id:'hall',sign:'Hall of Fame',target:'hall',art:'museum'},
 {id:'on',sign:'On the clock',target:'experience',door:'on',art:'tower'},
 {id:'off',sign:'Off the clock',target:'experience',door:'off',art:'gym'},
 {id:'contact',sign:'Say hi',target:'contact',art:'post'},
];

const INK='#141414';
export const DRIVE_MS=900; // matches .town-driver's left transition in comic.css
const ART={
 workshop:<svg viewBox="0 0 200 210" aria-hidden="true"><path d="M8 210V70l46-36v36l46-36v36l46-36v36l46-36v176Z" fill="#FFD43B" stroke={INK} strokeWidth="6" strokeLinejoin="round"/><rect x="70" y="140" width="60" height="70" fill="#fff" stroke={INK} strokeWidth="6"/><path d="M100 140v70" stroke={INK} strokeWidth="4"/><g fill="#A7D8FF" stroke={INK} strokeWidth="5"><rect x="24" y="100" width="34" height="30"/><rect x="142" y="100" width="34" height="30"/></g><circle cx="100" cy="102" r="17" fill="#fff" stroke={INK} strokeWidth="5"/><circle cx="100" cy="102" r="6" fill={INK}/></svg>,
 museum:<svg viewBox="0 0 200 200" aria-hidden="true"><path d="M10 64 100 14l90 50Z" fill="#E03A2E" stroke={INK} strokeWidth="6" strokeLinejoin="round"/><rect x="14" y="64" width="172" height="16" fill="#FFF9EC" stroke={INK} strokeWidth="6"/><g fill="#FFF9EC" stroke={INK} strokeWidth="5"><rect x="26" y="80" width="20" height="104"/><rect x="66" y="80" width="20" height="104"/><rect x="114" y="80" width="20" height="104"/><rect x="154" y="80" width="20" height="104"/></g><rect x="6" y="184" width="188" height="16" fill="#FFF9EC" stroke={INK} strokeWidth="6"/><path d="M100 30l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2Z" fill="#FFD43B" stroke={INK} strokeWidth="3"/></svg>,
 tower:<svg viewBox="0 0 200 300" aria-hidden="true"><rect x="30" y="20" width="140" height="280" fill="#A7D8FF" stroke={INK} strokeWidth="6"/><rect x="80" y="4" width="40" height="16" fill={INK}/><g fill="#FFF9EC" stroke={INK} strokeWidth="4">{[0,1,2,3,4,5].flatMap(r=>[0,1,2].map(c=><rect key={r+'-'+c} className={(r*3+c)%4===1?'lit':''} x={46+c*40} y={70+r*32} width="28" height="20"/>))}</g><rect x="80" y="262" width="40" height="38" fill="#fff" stroke={INK} strokeWidth="6"/></svg>,
 gym:<svg viewBox="0 0 200 220" aria-hidden="true"><path d="M8 220V80q92-60 184 0v140Z" fill="#E03A2E" stroke={INK} strokeWidth="6" strokeLinejoin="round"/><rect x="24" y="96" width="152" height="34" rx="4" fill={INK}/><g fill="#FFD43B">{[0,1,2,3,4,5,6,7].map(i=><circle key={i} className="bulb" style={{'--b':i}} cx={36+i*18.5} cy="113" r="5"/>)}</g><circle cx="100" cy="168" r="30" fill="#fff" stroke={INK} strokeWidth="5"/><path d="M72 160q28 10 56 0M100 138q-12 30 0 60M76 182q24-14 48 0" fill="none" stroke="#A7D8FF" strokeWidth="5"/></svg>,
 post:<svg viewBox="0 0 200 190" aria-hidden="true"><path d="M12 190V70h176v120Z" fill="#FFF9EC" stroke={INK} strokeWidth="6"/><path d="M4 74 100 22l96 52Z" fill="#A7D8FF" stroke={INK} strokeWidth="6" strokeLinejoin="round"/><rect x="40" y="96" width="70" height="48" fill="#fff" stroke={INK} strokeWidth="5"/><path d="M40 96l35 28 35-28" fill="none" stroke={INK} strokeWidth="5"/><rect x="128" y="120" width="40" height="70" fill="#E03A2E" stroke={INK} strokeWidth="5"/><rect x="134" y="132" width="28" height="8" fill={INK}/></svg>,
};

function Car({flip}){
 return <svg className={`town-car ${flip?'flip':''}`} viewBox="0 0 120 64" aria-hidden="true"><path d="M8 44V30q2-6 10-7l18-2 14-13h34l16 14h8q8 1 9 9v13Z" fill="#E03A2E" stroke={INK} strokeWidth="5" strokeLinejoin="round"/><path d="M54 14h26l11 10H44Z" fill="#A7D8FF" stroke={INK} strokeWidth="4" strokeLinejoin="round"/><rect x="100" y="28" width="9" height="6" fill="#FFD43B" stroke={INK} strokeWidth="3"/><g className="wheels"><circle cx="32" cy="48" r="11" fill={INK}/><circle cx="32" cy="48" r="4" fill="#fff"/><circle cx="92" cy="48" r="11" fill={INK}/><circle cx="92" cy="48" r="4" fill="#fff"/></g></svg>;
}

export function TownMap(){
 const [at,setAt]=useState(0),[flip,setFlip]=useState(false),[driving,setDriving]=useState(false),[opened,setOpened]=useState(null);
 const timers=useRef([]);
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 const calm=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function enter(stop){
  if(stop.door)window.dispatchEvent(new CustomEvent('jtavu:experience-door',{detail:{door:stop.door}}));
  // Lazy images above can shift the layout mid-scroll, so re-aim once it settles.
  const aim=n=>{const el=document.getElementById(stop.target);if(!el)return;el.scrollIntoView({behavior:calm()||n>0?'auto':'smooth',block:'start'});whenScrollSettles(()=>{const top=el.getBoundingClientRect().top;if(n<2&&Math.abs(top-90)>60)aim(n+1);else if(top<84)window.scrollBy({top:top-90,behavior:'auto'});});};
  requestAnimationFrame(()=>aim(0));
 }
 function go(i){
  const stop=STOPS[i];timers.current.forEach(clearTimeout);timers.current=[];
  if(calm()||i===at){setAt(i);setOpened(stop.id);timers.current.push(setTimeout(()=>{setOpened(null);enter(stop);},calm()?0:260));return;}
  setFlip(i<at);setAt(i);setDriving(true);setOpened(null);
  const trip=DRIVE_MS;
  timers.current.push(setTimeout(()=>{setDriving(false);setOpened(stop.id);},trip));
  timers.current.push(setTimeout(()=>{setOpened(null);enter(stop);},trip+420));
 }
 function keys(e,i){
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();
  const j=Math.max(0,Math.min(STOPS.length-1,i+(e.key==='ArrowRight'?1:-1)));if(j===i)return;
  setFlip(j<i);setAt(j);document.getElementById(`town-${STOPS[j].id}`)?.focus();
 }
 return <section id="town" className="town-section" aria-labelledby="town-title">
  <p className="section-kicker">PICK A BUILDING</p>
  <h2 id="town-title">Welcome to town.<span className="pow pow-head" aria-hidden="true">VROOM!</span></h2>
  <p className="town-lede">Every building is a part of the site. Tap one and I’ll drive you there. Arrow keys work too.</p>
  <div className="town" style={{'--at':at,'--stops':STOPS.length}}>
   <div className="town-sky" aria-hidden="true"><span className="town-sun"/></div>
   <ul className="town-row">{STOPS.map((s,i)=><li key={s.id} className={`town-stop art-${s.art} ${opened===s.id?'is-open':''} ${at===i?'is-here':''}`}>
    <button id={`town-${s.id}`} type="button" className="town-building" onClick={()=>go(i)} onKeyDown={e=>keys(e,i)} onFocus={e=>{if(e.target.matches(':focus-visible')&&!driving&&at!==i){setFlip(i<at);setAt(i);}}} aria-label={`Go to ${s.sign}`}>
     <span className="town-sign">{s.sign}</span>{ART[s.art]}
    </button>
   </li>)}</ul>
   <div className="town-road" aria-hidden="true"><div className="town-lane"><div className={`town-driver ${driving?'is-driving':''}`}><Car flip={flip}/>{driving&&<span className="town-vroom">VROOM!</span>}</div></div></div>
  </div>
 </section>;
}
