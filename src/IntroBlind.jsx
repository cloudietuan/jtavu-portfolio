import {useEffect,useRef,useState} from 'react';

// The doghouse introduction hangs over the site like a roller blind. On
// Explore it gets a short tug down, then snaps up and rolls away, revealing the
// website. The visitor can also grab the pull tab and do it themselves. When
// the intro is replayed from the header, the blind drops back down over the
// site. Reduced motion keeps the original fade.

const TUG=64;          // px pulled down before it lets go
const PULL_TO_RAISE=46;// a manual pull past this raises the blind

export const BLIND_TIMING=Object.freeze({tug:240,hold:70,raise:620,drop:720});

export function IntroBlind({frameRef,leaving,dropIn,onRaiseStart,onRaised}){
 const panel=useRef(null),raising=useRef(false),pull=useRef(null);
 const [reduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [pulled,setPulled]=useState(0);

 // Lowered again from the header: the blind drops down over the site.
 useEffect(()=>{
  if(!dropIn||reduced||!panel.current?.animate)return;
  panel.current.animate([
   {transform:'translateY(-102%)'},
   {transform:'translateY(2.5%)',offset:.72},
   {transform:'translateY(-.8%)',offset:.88},
   {transform:'translateY(0)'},
  ],{duration:BLIND_TIMING.drop,easing:'cubic-bezier(.45,0,.3,1)'});
 },[dropIn,reduced]);

 function raise(from=0){
  if(raising.current)return;
  raising.current=true;onRaiseStart?.();
  const el=panel.current;
  if(reduced||!el?.animate){onRaised?.();return;}
  const tug=Math.max(from,TUG),t=BLIND_TIMING,total=t.tug+t.hold+t.raise;
  // Tug down, a beat of hesitation, then it flies up with a little snap.
  const anim=el.animate([
   {transform:`translateY(${from}px)`,easing:'cubic-bezier(.25,.8,.35,1)'},
   {transform:`translateY(${tug}px)`,offset:t.tug/total},
   {transform:`translateY(${tug-6}px)`,offset:(t.tug+t.hold)/total,easing:'cubic-bezier(.7,0,.84,0)'},
   {transform:'translateY(-104%)'},
  ],{duration:from>0?total-t.tug*.6:total,fill:'forwards'});
  el.classList.add('is-raising');
  anim.onfinish=()=>onRaised?.();
 }

 useEffect(()=>{if(leaving)raise(0);},[leaving]);

 // The pull tab: drag the blind down and let go to send it up.
 function down(e){
  if(raising.current)return;
  e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);
  pull.current={y:e.clientY};
 }
 function move(e){
  if(!pull.current)return;
  const dy=Math.max(0,e.clientY-pull.current.y);
  setPulled(Math.round(140*(1-Math.exp(-dy/140))));// resists the further you pull
 }
 function up(){
  if(!pull.current)return;
  pull.current=null;
  if(pulled>=PULL_TO_RAISE){raise(pulled);setPulled(0);}
  else setPulled(0);
 }

 return <div ref={panel} className={`intro-blind ${reduced&&leaving?'is-fading':''} ${pulled?'is-pulled':''}`} style={pulled?{transform:`translateY(${pulled}px)`}:undefined}>
  <iframe ref={frameRef} className="homepage-intro" src="/homepage/index.html" title="JTAVU doghouse introduction" onLoad={()=>frameRef.current?.focus()}/>
  <div className="intro-blind-hem" aria-hidden="true"/>
  <button className="intro-blind-pull" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={e=>{if(e.detail===0)raise(0);}} aria-label="Raise the intro and show the website">
   <span className="intro-blind-tab"/>
  </button>
 </div>;
}
