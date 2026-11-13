import {snoopySize} from './snoopySize.js';
import {useEffect,useRef,useState} from 'react';
import {SnoopySprite} from './SnoopySprite';
import {chooseVariant,planSwing} from './introSwing';

// The doghouse introduction hangs over the site like a roller blind. On
// Explore it gets a short tug down, then snaps up and rolls away, revealing the
// website. The visitor can also grab the pull tab and do it themselves. When
// the intro is replayed from the header, the blind drops back down over the
// site. Reduced motion keeps the original fade.

const TUG=64;          // px pulled down before it lets go
const PULL_TO_RAISE=46;// a manual pull past this raises the blind

export const BLIND_TIMING=Object.freeze({tug:240,hold:70,raise:620,drop:720});
// Snoopy brings the blind down with one of several stunts (introSwing.js),
// never the same one twice in a row, then lets go and lands on the website.
export function IntroBlind({frameRef,leaving,dropIn,onRaiseStart,onRaised,onHandoff}){
 const panel=useRef(null),raising=useRef(false),pull=useRef(null),kid=useRef(null),bubble=useRef(null);
 const [swinging,setSwinging]=useState(false),[stunt,setStunt]=useState(''),[kidPose,setKidPose]=useState({kind:'action',action:'swing',facing:1}),tab=useRef(null);
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
  let last;try{last=sessionStorage.getItem('jtavu-blind-stunt')}catch{}
  const name=chooseVariant(last);try{sessionStorage.setItem('jtavu-blind-stunt',name)}catch{}
  // He starts from exactly where he stands on the landing screen.
  let start=null;try{const f=frameRef?.current,d=f?.contentDocument,r=d?.querySelector('.snoopy')?.getBoundingClientRect(),o=f.getBoundingClientRect();if(r?.width)start={x:o.left+r.left+r.width/2,y:o.top+r.bottom};}catch{}
  const view={width:innerWidth,height:innerHeight,size:snoopySize(innerWidth),start},plan=planSwing(name,view),fly=620;
  const t0=performance.now();
  let prevT=t0,fall=null,flyEnd=0,said=null,poseKey='';
  const show=(pose,facing)=>{const key=`${pose.kind}|${pose.frame}|${pose.action}|${facing}`;if(key!==poseKey){poseKey=key;setKidPose({...pose,facing});}};
  const place=(anchor,x,y,rot,[sx,sy]=[1,1])=>{
   const k=kid.current;if(!k)return;
   const hands=anchor==='hands',top=hands?y-view.size*.05:y-view.size*.98;
   k.style.transformOrigin=hands?'50% 5%':'50% 96%';
   k.style.transform=`translate(${(x-view.size/2).toFixed(1)}px,${top.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
  };
  setStunt(name);
  const frame=now=>{
   const t=now-t0,dt=Math.min(.05,(now-prevT)/1000);prevT=now;
   if(!fall){
    const p=plan.sample(Math.min(t,plan.releaseAt-1));
    el.style.transform=`translateY(${p.blindY.toFixed(1)}px)`;
    if(kid.current)kid.current.style.opacity=p.visible?'1':'0';
    if(p.visible){show(p.pose,p.facing||1);place(p.anchor,p.x,p.y,p.rot,p.squash);}
    if(kid.current)kid.current.dataset.zoom=p.zoom>0?'right':p.zoom<0?'left':'';
    if(tab.current)tab.current.style.transform=p.tabRot?`rotate(${p.tabRot.toFixed(1)}deg)`:'';
    if(p.say&&p.say!==said){said=p.say;say(p.say);}
    if(t>=plan.releaseAt){
     // Let go: the blind snaps up and away and he is thrown clear of it.
     const r=plan.release;
     fall={x:p.x,y:p.y,vx:r.vx,vy:r.vy,rot:p.rot,spin:r.spin};
     el.style.transform='';if(tab.current)tab.current.style.transform='';
     el.animate([{transform:`translateY(${p.blindY}px)`},{transform:`translateY(${p.blindY+16}px)`,offset:.1},{transform:'translateY(-104%)'}],{duration:fly,easing:'cubic-bezier(.6,0,.85,.35)',fill:'forwards'});
     flyEnd=now+fly;say(r.say);if(kid.current)kid.current.dataset.zoom='';show({kind:'action',action:'swing'},Math.sign(r.vx)||1);
    }
   }else{
    fall.vy+=2200*dt;fall.x+=fall.vx*dt;fall.y+=fall.vy*dt;fall.rot+=fall.spin*dt;
    place('hands',fall.x,fall.y,fall.rot);
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
   <span ref={tab} className="intro-blind-tab"/>
  </button>
 </div>
 {swinging&&<div ref={kid}  className="blind-snoopy" data-stunt={stunt} aria-hidden="true" style={{opacity:0,width:snoopySize(innerWidth),height:snoopySize(innerWidth)}}><SnoopySprite frame={kidPose.frame??2} walking={kidPose.kind==='walk'} standing={kidPose.kind!=='walk'} action={kidPose.kind==='action'?kidPose.action:undefined} facing={kidPose.facing||1}/><span ref={bubble} className="blind-snoopy-bubble"/></div>}
 </>;
}
