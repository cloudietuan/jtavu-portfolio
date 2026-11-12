import {useEffect,useRef,useState} from 'react';
import {SnoopySprite} from './SnoopySprite';

// The doghouse introduction hangs over the site like a roller blind. On
// Explore it gets a short tug down, then snaps up and rolls away, revealing the
// website. The visitor can also grab the pull tab and do it themselves. When
// the intro is replayed from the header, the blind drops back down over the
// site. Reduced motion keeps the original fade.

const TUG=64;          // px pulled down before it lets go
const PULL_TO_RAISE=46;// a manual pull past this raises the blind

export const BLIND_TIMING=Object.freeze({tug:240,hold:70,raise:620,drop:720});
// Snoopy's swing on the pull tab: the blind lifts a little, he leaps up and
// grabs the tab, swings on it while his weight drags the blind down, then
// lets go as it snaps up, and drops onto the website.
export const SWING_TIMING=Object.freeze({lift:420,leap:360,swing:1050,fly:560});
const easeOut=k=>1-Math.pow(1-k,3),easeInOut=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;

/** Pure choreography: blind offset, hand position and rotation at time t (ms). */
export function swingPose(t,{width,height,size}){
 const T=SWING_TIMING,lift=Math.min(300,height*.4),floor=Math.min(150,lift*.5),cx=width/2;
 const handsAt=blindY=>height+blindY-4;
 if(t<T.lift)return {phase:'lift',blindY:-lift*easeOut(t/T.lift),visible:false};
 if(t<T.lift+T.leap){
  const k=(t-T.lift)/T.leap,startX=cx+Math.min(220,width*.2),startY=height+size*1.1,endY=handsAt(-lift);
  return {phase:'leap',blindY:-lift,visible:true,x:startX+(cx-startX)*easeOut(k),y:startY+(endY-startY)*easeOut(k)-90*4*k*(1-k),rot:-28*(1-k)};
 }
 if(t<T.lift+T.leap+T.swing){
  const k=(t-T.lift-T.leap)/T.swing;
  // His weight drags the blind down in bobs that follow each swing.
  const blindY=-lift+(lift-floor)*easeInOut(k)+9*Math.sin(k*Math.PI*6)*(1-k);
  return {phase:'swing',blindY,visible:true,x:cx,y:handsAt(blindY),rot:24*Math.sin(k*Math.PI*2*1.6)*(1-.55*k)};
 }
 return {phase:'release',blindY:-floor,visible:true,x:cx,y:handsAt(-floor),rot:0};
}

export function IntroBlind({frameRef,leaving,dropIn,onRaiseStart,onRaised,onHandoff}){
 const panel=useRef(null),raising=useRef(false),pull=useRef(null),kid=useRef(null),bubble=useRef(null);
 const [swinging,setSwinging]=useState(false);
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

 function say(text){const b=bubble.current;if(!b)return;b.textContent=text;b.classList.remove('is-on');void b.offsetWidth;b.classList.add('is-on');}

 function swingAway(){
  if(raising.current)return;
  const el=panel.current;
  if(reduced||!el?.animate){raise(0);return;}
  raising.current=true;onRaiseStart?.();setSwinging(true);el.classList.add('is-raising');
  const view={width:innerWidth,height:innerHeight,size:innerWidth<700?80:96},T=SWING_TIMING;
  const t0=performance.now(),releaseAt=T.lift+T.leap+T.swing;
  let last=t0,fall=null,flyEnd=0,grabbed=false;
  const place=(x,y,rot)=>{const k=kid.current;if(k)k.style.transform=`translate(${(x-view.size/2).toFixed(1)}px,${(y-view.size*.05).toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;};
  const frame=now=>{
   const t=now-t0,dt=Math.min(.05,(now-last)/1000);last=now;
   if(!fall){
    const p=swingPose(t,view);
    el.style.transform=`translateY(${p.blindY.toFixed(1)}px)`;
    if(kid.current)kid.current.style.opacity=p.visible?'1':'0';
    if(p.visible)place(p.x,p.y,p.rot);
    if(p.phase==='swing'&&!grabbed){grabbed=true;say('hup!');}
    if(t>=releaseAt){
     // Let go: the blind snaps up and he is tossed into the air above the site.
     const prev=swingPose(releaseAt-16,view),spin=prev.rot>0?-1:1;
     fall={x:p.x,y:p.y,vx:spin*150,vy:-820,rot:prev.rot};
     el.style.transform='';
     el.animate([{transform:`translateY(${p.blindY}px)`},{transform:`translateY(${p.blindY+18}px)`,offset:.12},{transform:'translateY(-104%)'}],{duration:T.fly,easing:'cubic-bezier(.6,0,.85,.35)',fill:'forwards'});
     flyEnd=now+T.fly;say('wheee!');
    }
   }else{
    fall.vy+=2200*dt;fall.x+=fall.vx*dt;fall.y+=fall.vy*dt;fall.rot+=(fall.vx>0?1:-1)*120*dt;
    place(fall.x,fall.y,fall.rot);
    if(now>=flyEnd){
     // Hand the same Snoopy, mid-air, to the live companion on the website.
     onHandoff?.({x:fall.x,y:fall.y+view.size*.93,vx:fall.vx,vy:fall.vy});
     onRaised?.();return;
    }
   }
   requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
 }

 useEffect(()=>{if(leaving)swingAway();},[leaving]);

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

 return <><div ref={panel} className={`intro-blind ${reduced&&leaving?'is-fading':''} ${pulled?'is-pulled':''}`} style={pulled?{transform:`translateY(${pulled}px)`}:undefined}>
  <iframe ref={frameRef} className="homepage-intro" src="/homepage/index.html" title="JTAVU doghouse introduction" onLoad={()=>frameRef.current?.focus()}/>
  <div className="intro-blind-hem" aria-hidden="true"/>
  <button className="intro-blind-pull" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={e=>{if(e.detail===0)raise(0);}} aria-label="Raise the intro and show the website">
   <span className="intro-blind-tab"/>
  </button>
 </div>
 {swinging&&<div ref={kid} className="blind-snoopy" aria-hidden="true" style={{opacity:0}}><SnoopySprite frame={2} standing action="swing"/><span ref={bubble} className="blind-snoopy-bubble"/></div>}
 </>;
}
