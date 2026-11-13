import {snoopySize} from './snoopySize.js';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import './snoopyControls.css';
import {worldLandmarks,findWorldTarget,clearTravel} from './snoopyWorld';
import {planCharacterMove,sampleCharacterMove} from './snoopyMoves';
import {skillBeat} from './snoopySkills';
import {portalTransition} from './snoopyPortal';
import {projectList} from './projects';
import {SnoopyTools} from './SnoopyTools';
import {SnoopySprite} from './SnoopySprite';
import {choosePlaygroundMoment,swingPoint,swingRotation} from './snoopyBrain';
import {companionDock,resolvePresence,scrollDisposition} from './snoopyPresence';
import {advanceMovement} from './snoopyMovement';
import {safePoint as findSafePoint,clampPoint,isClear,findClimbCorridor,findReturnStation} from './snoopySafety';
import {buildPlatforms,choosePlatform,jumpPoint,jumpDuration,flingStep,findDropTarget} from './snoopyTerrain';
import {tailWag} from './snoopyArticulation';
import {createAgent,decide,tickDrives,settle,rememberVisit} from './snoopyAgent';
import {planRoutine,sampleRoutine,jumpPhase,JUMP_LAND} from './snoopyRoutines';
// Real page surfaces Snoopy may stand on. His feet rest on their top edge.
const TERRAIN='.canvas .object,.scroll-portfolio h2,.story-image,.story-statement,.index-preview,.index-project h3,.index-project>p,.highlight-card,.offer-card,.exp-group>h3,.about-section>p,.contact-section>a:first-of-type,.footer-word';
const DOCK_REST=10000;
const terrainIds=new WeakMap();let terrainCount=0;
const terrainId=element=>{if(!terrainIds.has(element))terrainIds.set(element,`surface-${++terrainCount}`);return terrainIds.get(element);};
const chapters={work:'Things John’s built.', 'project-sunset':'This one started with the family salon.', 'project-apparel':'These ideas made it onto actual clothes.', highlights:'Start here. These are the big ones.',offer:'Need something built? This part’s for you.',experience:'Everything else John’s been up to.',about:'You’ve met the work. Here’s John.',contact:'Have an idea? Say hi.'};
export function SnoopyCompanion({active,building,navigate,onBuild,paused=false,onPausedChange,arrival}){
 const docked=useRef(false),panel=useRef(null),opener=useRef(null),body=useRef(null),pos=useRef({x:130,y:250}),target=useRef({x:130,y:250}),velocity=useRef({x:0,y:0}),distance=useRef(0),drag=useRef(null),tour=useRef(0),greeted=useRef(false),petTimer=useRef(null),obstacleCache=useRef({at:0,rects:[]}),menuOpen=useRef(false),initialized=useRef(false),toolAction=useRef(null),scrollPosition=useRef(0),lastSkill=useRef(null),scrollReturn=useRef(null),speechCheck=useRef(0),worldIntent=useRef(null),lastScrollAt=useRef(0),reactionTimer=useRef(null);
 // Resident mode: his own mind (agent) and where he is standing (resident).
 const agent=useRef(createAgent()),resident=useRef({perch:null,jump:null,walkTo:null,walkSpeed:120,routine:null,fling:null,next:null,emoteIndex:-1,scrollV:0,scrollDir:0,scrollDist:0,scrollHopAt:0,riding:false,offSince:0,dockSince:0,platforms:[],covers:[],controls:[],headerBottom:0,scannedAt:0,prefer:null,lastStartle:0,scrollAt:0}),cursor=useRef({x:0,y:0,at:-1e9}),hover=useRef({host:null,at:0}),userAt=useRef(0),autoNap=useRef(false);
 const facingRef=useRef(1);
 const [emote,setEmote]=useState(null),emoteTimer=useRef(null);
 function showEmote(symbol){if(!symbol)return;if(!playfulRef.current&&!['?','!','hi!','♥','z'].includes(symbol))return;clearTimeout(emoteTimer.current);setEmote({symbol,key:performance.now()});emoteTimer.current=setTimeout(()=>setEmote(null),1500);}
 // Calm host by default; the playful resident is one tap away.
 const [playful,setPlayful]=useState(()=>{try{return sessionStorage.getItem('jtavu-snoopy-playful')!=='false'}catch{return false}});const playfulRef=useRef(playful);playfulRef.current=playful;
 useEffect(()=>{try{sessionStorage.setItem('jtavu-snoopy-playful',String(playful))}catch{}},[playful]);
 const [freeRoam,setFreeRoam]=useState(()=>{try{return sessionStorage.getItem('jtavu-snoopy-free-roam')!=='false'}catch{return true}});
 const [reaction,setReaction]=useState(''),[feedback,setFeedback]=useState('');
 const [dragging,setDragging]=useState(false),[pose,setPose]=useState({walking:false,frame:2,facing:1}),[menu,setMenu]=useState(false),[sleep,setSleep]=useState(false),[speech,setSpeech]=useState(''),[petting,setPetting]=useState(false),[systemReduced,setSystemReduced]=useState(false),[quietMotion,setQuietMotion]=useState(()=>{try{return sessionStorage.getItem('jtavu-snoopy-less-motion')==='true'}catch{return false}}),[size,setSize]=useState(96),[placement,setPlacement]=useState({side:'left',below:true}),[toolView,setToolView]=useState({tool:null,anchor:{x:0,y:0},progress:0});
 const roam=!paused;const reduced=systemReduced||quietMotion;
 // Living on the page is the default. Pause, reduced motion and the roaming
 // preference each return him to the predictable corner dock.
 const living=freeRoam&&roam&&!reduced;const livingRef=useRef(false);livingRef.current=living;
 useEffect(()=>{try{sessionStorage.setItem('jtavu-snoopy-free-roam',String(freeRoam))}catch{}},[freeRoam]);
 useEffect(()=>{try{sessionStorage.setItem('jtavu-snoopy-less-motion',String(quietMotion))}catch{}},[quietMotion]);
 function setRoam(update){const next=typeof update==='function'?update(roam):update;onPausedChange?.(!next);}
 const interactive=active;
 function speak(text){setSpeech(text);}
 function obstacles(force=false){const now=performance.now();if(force||now-obstacleCache.current.at>200){obstacleCache.current={at:now,rects:[...document.querySelectorAll('a,button,input,textarea,select,summary,dialog,h1,h2,h3,p')].filter(e=>!e.closest('.snoopy-companion,.snoopy-control-panel')).map(e=>e.getBoundingClientRect()).filter(b=>b.width&&b.height&&b.top<innerHeight&&b.bottom>0)};}return obstacleCache.current.rects;}
 function safePoint(x,y){return findSafePoint({x,y},innerWidth,innerHeight,snoopySize(innerWidth),obstacles());}
 function cancelTool(reason='interrupted'){if(body.current&&toolAction.current)body.current.dataset.lastInterruption=reason;if(body.current)body.current.style.opacity='1';toolAction.current?.subject?.element?.classList.remove('snoopy-playing-ball');toolAction.current=null;body.current?.style.setProperty('--snoopy-swing-angle','0deg');setToolView(old=>old.tool?{tool:null,anchor:old.anchor,progress:0}:old);}
 function react(kind,duration=900){clearTimeout(reactionTimer.current);setReaction(kind);reactionTimer.current=setTimeout(()=>setReaction(''),duration);}
 function stopAction(preservePosition=true){clearTimeout(reactionTimer.current);clearTimeout(petTimer.current);setPetting(false);setReaction('');worldIntent.current=null;scrollReturn.current=null;cancelTool();setPose(old=>old.walking?{...old,walking:false,frame:2}:old);velocity.current={x:0,y:0};if(!preservePosition)pos.current=safePoint(pos.current.x,pos.current.y);target.current={...pos.current};}
 // Pose objects carry which sheet to draw from plus a small procedural transform.
 const facingNow=()=>facingRef.current||1;
 const poseKey=o=>`${o.walking}|${o.kind}|${o.frame}|${o.action}|${o.facing}|${o.transform}|${o.head||0}|${o.tail||0}`;
 function showPose(next){setPose(old=>poseKey(old)===poseKey(next)?old:next);}
 function plainPose(){setPose(old=>old.walking||old.kind||old.transform||old.head||old.tail?{walking:false,frame:2,facing:old.facing}:old);}
 function motionTransform(lean=0,lift=0,squash=[1,1],facing=1){
  if(!lean&&!lift&&squash[0]===1&&squash[1]===1)return undefined;
  return `translateY(${-lift.toFixed(1)}px) rotate(${(lean*facing).toFixed(1)}deg) scale(${squash[0].toFixed(3)},${squash[1].toFixed(3)})`;
 }
 function startRoutine(name,now,facing){
  const plan=planRoutine(name);
  if(!plan)return;
  resident.current.routine={plan,started:now,facing:facing||facingNow()};
  resident.current.walkTo=null;
 }
 function endRoutine(now){
  const r=resident.current;if(!r.routine)return;
  r.routine=null;agent.current=settle(agent.current,now,700+Math.random()*1500);
  plainPose();
 }
 function leavePerch(){const r=resident.current;r.perch=null;r.jump=null;r.walkTo=null;r.routine=null;r.fling=null;r.next=null;r.offSince=0;plainPose();}
 // Thrown, dropped, or stepping off a ledge: real gravity until something catches him.
 function launch(vx,vy,{slide=false}={}){
  const r=resident.current,now=performance.now(),fromEl=slide?r.perch?.element||null:null;r.perch=null;r.jump=null;r.walkTo=null;r.routine=null;r.next=null;docked.current=false;
  // A slide starts with a quick plop onto his seat before he lets go.
  // Already sliding a moment ago (caught mid-scroll), he keeps his seat and goes on.
  const chained=slide&&now-(r.slideEnded||0)<450;
  r.fling={x:pos.current.x,y:pos.current.y,vx,vy,bounces:0,spin:0,started:now,scrollY:window.scrollY,slide,fromEl,sitUntil:slide&&!chained?now+170:0};
  if(slide&&!chained)showEmote(['whee','wheee!','♪'][Math.floor(Math.random()*3)]);
 }
 function scanTerrain(force=false,light=false){
  const r=resident.current,now=performance.now();
  if(!force&&now-r.scannedAt<250)return r.platforms;
  if(light){
   // In flight only surface positions matter, and they move every frame while scrolling.
   const header=document.querySelector('.site-header')?.getBoundingClientRect();r.headerBottom=header?Math.max(0,header.bottom):0;
   const nodes=[...document.querySelectorAll(TERRAIN)].map(element=>{const b=element.getBoundingClientRect();return {element,id:terrainId(element),rect:{left:b.left,right:b.right,top:b.top,bottom:b.bottom}};});
   return r.platforms=buildPlatforms(nodes,{width:innerWidth,height:innerHeight,size,top:r.headerBottom});
  }
  r.scannedAt=now;
  const header=document.querySelector('.site-header')?.getBoundingClientRect();
  r.headerBottom=header?Math.max(0,header.bottom):0;
  const nodes=[...document.querySelectorAll(TERRAIN)].map(element=>{const b=element.getBoundingClientRect();return {element,id:terrainId(element),rect:{left:b.left,right:b.right,top:b.top,bottom:b.bottom}};});
  r.controls=[...document.querySelectorAll('a,button,summary,input,select,textarea')].filter(e=>!e.closest('.snoopy-companion,.snoopy-control-panel')).map(e=>e.getBoundingClientRect()).filter(b=>b.width&&b.height&&b.bottom>0&&b.top<innerHeight&&b.width*b.height<60000);
  r.covers=obstacles(true).filter(b=>b.width*b.height<60000||b.height<120);
  r.platforms=buildPlatforms(nodes,{width:innerWidth,height:innerHeight,size,top:r.headerBottom});
  return r.platforms;
 }
 function jumpTo(platform,x,now){
  const r=resident.current,startY=Math.max(-size,Math.min(innerHeight+size*2,pos.current.y));
  // The take-off point is stored in page coordinates so a jump survives scrolling.
  const air=['swing','swing','ladder','walk'][Math.floor(Math.random()*4)];
  r.jump={element:platform.element,id:platform.id,fx:x-platform.left,from:{x:pos.current.x,y:startY+window.scrollY},started:now,duration:jumpDuration({x:pos.current.x,y:startY},{x,y:platform.y}),air};
  r.perch=null;r.walkTo=null;r.routine=null;r.next=null;r.fling=null;r.offSince=0;docked.current=false;
 }
 // Find the next surface. With nowhere safe to stand he waits in the visible
 // dock and tries again shortly, so he can never go missing.
 function relocate(now,{to=null,nearby=false,mustLeave=false,where=null}={}){
  const r=resident.current,current=r.perch?.element;
  const options=scanTerrain(true).filter(p=>p.element!==current&&(!to||p.id===to)&&(!where||where(p)));
  const wanted=r.prefer?.isConnected?options.filter(p=>r.prefer.contains(p.element)).map(p=>p.id):[];
  const choice=choosePlatform(options,{from:pos.current,size,covers:r.covers,controls:r.controls,avoid:nearby?[]:agent.current.visited,prefer:wanted,jitter:nearby?()=>0:Math.random});
  if(!choice||choice.blocked){
   if(to||(r.perch&&!mustLeave))return false;
   leavePerch();docked.current=true;r.dockSince=now-DOCK_REST+1500;return false;
  }
  if(wanted.includes(choice.platform.id))r.prefer=null;
  const below=choice.platform.y-pos.current.y,across=choice.x-pos.current.x;
  if(r.perch&&below>90&&Math.abs(across)<320){
   // Going down the page he slides; going up he still jumps.
   launch(across*2.1,80,{slide:true});agent.current=rememberVisit(agent.current,choice.platform.id);return true;
  }
  jumpTo(choice.platform,choice.x,now);agent.current=rememberVisit(agent.current,choice.platform.id);return true;
 }
 function residentStep(now,dt,frozen){
  const r=resident.current,edge=size/2+12;
  scanTerrain();
  if(r.fling?.slide&&now<r.fling.sitUntil){
   // Sitting down at the top of the slide; the page may still carry him.
   const shift=window.scrollY-(r.fling.scrollY??window.scrollY);r.fling.scrollY=window.scrollY;r.fling.y-=shift;
   pos.current={x:r.fling.x,y:r.fling.y};target.current={...pos.current};velocity.current={x:0,y:0};
   const k=1-(r.fling.sitUntil-now)/170,facing=Math.abs(r.fling.vx)>20?Math.sign(r.fling.vx):facingNow();
   showPose({walking:false,kind:'wake',frame:k<.5?9:12,facing,transform:motionTransform(0,0,[1+.06*Math.sin(k*Math.PI),1-.1*Math.sin(k*Math.PI)],facing)});
   return;
  }
  if(r.fling){
   const shift=window.scrollY-(r.fling.scrollY??window.scrollY);r.fling.scrollY=window.scrollY;
   if(shift)scanTerrain(true,true);
   // A slide never lands back on the surface it started from.
   const fromEl=r.fling.fromEl,platforms=fromEl?r.platforms.filter(q=>q.element!==fromEl):r.platforms;
   const f=flingStep(r.fling,dt,{width:innerWidth,height:innerHeight,size,top:r.headerBottom,platforms,shift});
   pos.current={x:f.x,y:f.y};target.current={...pos.current};velocity.current={x:0,y:0};
   const speed=Math.hypot(f.vx,f.vy),facing=Math.abs(f.vx)>30?Math.sign(f.vx):facingNow();
   // Fast throws tumble; slow falls stay upright with arms up.
   if(r.fling.slide){
    // On his seat, leaning back into the slide, with a little rattle at speed.
    const k=Math.min(1,speed/700),rattle=Math.sin(now/38)*1.6*k;
    showPose({walking:false,kind:'wake',frame:12,facing,transform:motionTransform(-(8+10*k)+rattle,0,[1+.03*k,1-.04*k],facing)});
   }else{
    const tumble=speed>900?f.spin:Math.max(-12,Math.min(12,f.vx*.02));
    showPose({walking:false,kind:'action',action:'swing',frame:2,facing,transform:motionTransform(tumble,0,[1-.04*Math.min(1,speed/1500),1+.06*Math.min(1,speed/1500)],1)});
   }
   if(!f.landed&&f.atFloor&&r.fling.slide&&now-lastScrollAt.current>350){
    // The page stopped with him waiting at the bottom: he hops back up onto something.
    r.fling=null;r.slideEnded=now;plainPose();relocate(now,{nearby:true});return;
   }
   if(!f.landed){r.fling={...r.fling,...f};return;}
   const impact=Math.abs(r.fling.vy),slid=r.fling.slide;r.fling=null;if(slid)r.slideEnded=now;
   if(f.landed==='floor'){
    showEmote(impact>900?'oof':'!');plainPose();
    // Still scrolling: rest in the corner and come back once the page is quiet.
    if(now-lastScrollAt.current<300){leavePerch();docked.current=true;r.dockSince=now-DOCK_REST+400;return;}
    relocate(now,{nearby:true});return;
   }
   const pl=f.landed;r.perch={element:pl.element,id:pl.id,fx:f.x-pl.left};
   r.routine=slid
    // A slide ends sitting, with a bump, before he stands back up.
    ?{plan:{name:'land',duration:520,steps:[{start:0,ms:200,pose:{kind:'wake',frame:12},squash:[1.1,.86]},{start:200,ms:200,pose:{kind:'wake',frame:15}},{start:400,ms:120,pose:{kind:'wake',frame:9}}]},started:now,facing}
    :{plan:{name:'land',duration:JUMP_LAND+60,steps:[{start:0,ms:JUMP_LAND+60,pose:{kind:'action',action:'portal'},squash:[1.14,.82]}]},started:now,facing};
   if(impact>1100&&!slid)showEmote('oof');
   agent.current=rememberVisit(agent.current,pl.id);
   return;
  }
  if(r.jump){
   const j=r.jump,b=j.element.isConnected?j.element.getBoundingClientRect():null;
   if(!b||!b.width){r.jump=null;return;}
   const end={x:Math.max(edge,Math.min(innerWidth-edge,b.left+j.fx)),y:b.top},start={x:j.from.x,y:j.from.y-window.scrollY};
   const phase=jumpPhase(now-j.started,j.duration),turn=Math.abs(end.x-start.x)>4?Math.sign(end.x-start.x):0,facing=turn||facingNow();
   if(phase.phase==='crouch'){
    // Anticipation: he gathers himself before leaving the ground.
    pos.current={...start};target.current={...start};velocity.current={x:0,y:0};
    const k=Math.sin(phase.progress*Math.PI/2);
    showPose({walking:false,kind:'action',action:'portal',frame:2,facing,transform:motionTransform(0,0,[1+.08*k,1-.12*k],facing)});
    return;
   }
   if(phase.phase==='air'){
    const t=phase.progress;
    pos.current=jumpPoint(start,end,t);target.current={...pos.current};velocity.current={x:0,y:0};
    const stretch=[1-.05*Math.sin(t*Math.PI),1+.07*Math.sin(t*Math.PI)];
    if(j.air==='walk')showPose({walking:true,kind:'walk',frame:t<.5?3:5,facing,transform:motionTransform(t<.5?-8:6,0,stretch,facing)});
    else showPose({walking:false,kind:'action',action:j.air,frame:2,facing,transform:motionTransform(t<.5?-6:8,0,stretch,facing)});
    return;
   }
   // Landing: he is on the surface now, absorbing the impact in a crouch.
   pos.current={...end};target.current={...end};velocity.current={x:0,y:0};
   r.perch={element:j.element,id:j.id,fx:j.fx};r.jump=null;
   r.routine={plan:{name:'land',duration:JUMP_LAND,steps:[{start:0,ms:JUMP_LAND,pose:{kind:'action',action:'portal'},squash:[1.12,.85]}]},started:now,facing};
   return;
  }
  if(r.perch){
   const p=r.perch,b=p.element.isConnected?p.element.getBoundingClientRect():null;
   if(!b||!b.width)r.perch=null;
   else{
    const minX=Math.max(b.left+size*.3,edge),maxX=Math.min(b.right-size*.3,innerWidth-edge),standable=maxX>=minX;
    const x=standable?Math.max(minX,Math.min(maxX,b.left+p.fx)):b.left+p.fx;
    // He rides his surface, so ordinary scrolling carries him with the page.
    pos.current={x,y:b.top};target.current={...pos.current};velocity.current={x:0,y:0};
    const off=!standable||b.top-size<r.headerBottom||b.top>innerHeight-4;
    if(off){if(!r.offSince)r.offSince=now;}else r.offSince=0;
    if(frozen){
     if(autoNap.current)agent.current=tickDrives(agent.current,dt,{napping:true});
     if(off&&now-r.offSince>400){leavePerch();docked.current=true;r.dockSince=0;}
     return;
    }
    const scrolling=now-lastScrollAt.current<180;
    if(scrolling&&!off){
     const top=r.headerBottom,leavingTop=r.scrollDir>0&&b.top-size<top+size*1.6,leavingBottom=r.scrollDir<0&&b.top>innerHeight-size*.5;
     if(leavingTop&&now-r.scrollHopAt>300){
      // Scrolling down: he steps off as his surface rises and falls down the
      // screen until the page carries the next surface up to catch him.
      r.scrollHopAt=now;
      launch(facingNow()*(40+Math.random()*60),220,{slide:true});return;
     }
     if(leavingBottom&&now-r.scrollHopAt>450){
      // Scrolling up: hop to a surface further up the screen.
      r.scrollHopAt=now;
      if(relocate(now,{mustLeave:true,where:q=>q.y>top+size*.9&&q.y<innerHeight-size*1.2}))return;
     }
     if(!r.routine&&r.walkTo==null){
      // Riding the page: crouch, arms out, leaning into the motion.
      const v=Math.max(-1,Math.min(1,r.scrollV/2.5)),k=Math.min(1,Math.abs(r.scrollV)/1.2);
      r.riding=true;
      if(k>.25)showPose({walking:false,kind:'action',action:'portal',frame:2,facing:facingNow(),transform:motionTransform(-v*10+Math.sin(now/90)*2*k,0,[1+.05*k,1-.08*k],facingNow())});
      else showPose({walking:false,frame:2,facing:facingNow(),head:Math.round(-v*8),tail:Math.round(tailWag(now,{speed:1.2,amplitude:10}))});
      return;
     }
    }
    if(!scrolling&&(r.riding||r.scrollDist)){
     // The page stopped. After a long ride he gets his bearings.
     if(r.riding)plainPose();
     r.riding=false;
     if(r.scrollDist>1100&&!r.routine&&!off){startRoutine(Math.random()<.5?'lookAround':'curious',now);showEmote(r.scrollDist>3000?'whoa':'!');agent.current={...agent.current,until:Infinity};}
     r.scrollDist=0;
    }
    if(off){
     // Once his surface scrolls away he hops to one the visitor can see.
     if(now-lastScrollAt.current>160)relocate(now,{mustLeave:true});
     else if(r.scrollDir>0){
      // A fast wheel can carry his surface past the top in one jump: he is
      // scooped off the top edge and slides down the screen instead.
      r.scrollHopAt=now;pos.current={x,y:Math.max(r.headerBottom+size,Math.min(b.top,innerHeight-size))};
      launch(facingNow()*(40+Math.random()*60),260,{slide:true});
     }
     else if(now-r.offSince>300){leavePerch();docked.current=true;r.dockSince=now-DOCK_REST+300;}
     return;
    }
    if(r.walkTo!=null){
     const goal=Math.max(minX,Math.min(maxX,b.left+r.walkTo)),dx=goal-x,step=Math.sign(dx)*Math.min(Math.abs(dx),r.walkSpeed*dt),arrived=Math.abs(dx)<=Math.abs(step)+.5;
     p.fx=x+step-b.left;pos.current.x=x+step;target.current.x=pos.current.x;distance.current+=Math.abs(step);
     const frame=Math.floor(distance.current/14)%8,facing=Math.sign(dx)||1;
     const bob=r.walkSpeed>150?Math.abs(Math.sin(distance.current/14*Math.PI))*4:0,sniffing=r.walkSpeed<70?7:0;
     if(arrived){
      showPose({walking:false,frame:2,facing});
      if(r.next?.type==='peek'){startRoutine('peek',now,r.next.side);r.next={type:'drop',side:r.next.side};}
     }
     else showPose({walking:true,kind:'walk',frame,facing,transform:motionTransform(sniffing,bob,[1,1],facing)});
     if(arrived)r.walkTo=null;
     agent.current=tickDrives(agent.current,dt,{moving:true});
     return;
    }
    p.fx=x-b.left;
    agent.current=tickDrives(agent.current,dt);
    if(r.routine){
     const R=r.routine,sample=sampleRoutine(R.plan,now-R.started);
     const facing=R.facing*(sample.flips%2?-1:1),pz=sample.pose;
     showPose({walking:pz.kind==='walk',kind:pz.kind,frame:pz.frame??2,action:pz.action,facing,transform:motionTransform(sample.lean,sample.lift,sample.squash,facing),head:Math.round(sample.head),tail:Math.round(sample.tail)});
     if(body.current)body.current.dataset.routine=R.plan.name;
     if(sample.index!==r.emoteIndex){r.emoteIndex=sample.index;if(sample.emote)showEmote(sample.emote);}
     if(sample.done){
      r.emoteIndex=-1;endRoutine(now);if(R.plan.name==='land')react('land',650);
      // After peeking over a ledge he hops off it.
      if(r.next?.type==='drop'){const side=r.next.side;r.next=null;if(Math.random()<.5)launch(side*190,60,{slide:true});else{showEmote('!');launch(side*190,-420);}}
     }
    }else{
     const c=cursor.current,fresh=now-c.at<4000&&Math.abs(c.x-x)<420&&Math.sign(c.x-x||1)===facingNow();
     const look=fresh?Math.max(-10,Math.min(10,(c.y-(b.top-size*.75))/14)):0;
     const wag=agent.current.energy>.55?tailWag(now,{speed:.7,amplitude:6}):0;
     showPose({walking:false,frame:2,facing:facingNow(),head:Math.round(look),tail:Math.round(wag)});
    }
    // Guiding: he stays put beside the project he is explaining.
    if(r.guiding)return;
    const host=hover.current.host,hovered=host?.isConnected?r.platforms.find(q=>host.contains(q.element)):null,c=cursor.current;
    const result=decide(agent.current,{now,platformId:p.id,otherPlatforms:r.platforms.filter(q=>q.element!==p.element).length,cursor:{x:c.x,y:c.y,ageMs:now-c.at},snoopy:pos.current,span:{minX,maxX},userIdleMs:now-userAt.current,hover:hovered?{id:hovered.id,ms:now-hover.current.at}:null,size,calm:!playfulRef.current});
    agent.current=result.agent;const intent=result.intent;
    if(!intent)return;
    if(r.routine){if(intent.type!=='travel')return;r.routine=null;}
    if(body.current)body.current.dataset.mind=intent.reason?`${intent.type}:${intent.reason}`:intent.type;
    if(intent.type==='walk'){
     r.walkTo=intent.x-b.left;r.walkSpeed=intent.speed||110;
     // Sometimes a stroll heads for a ledge with something below it.
     if(playfulRef.current&&Math.random()<.5){
      const here=r.platforms.find(q=>q.element===p.element),drop=findDropTarget(r.platforms,here,{size,width:innerWidth});
      if(drop){r.walkTo=drop.edgeX-b.left;r.next={type:'peek',side:drop.side};}
     }
    }
    else if(intent.type==='routine')startRoutine(intent.name,now,intent.facing);
    else if(intent.type==='watch')setPose(old=>old.facing===intent.facing?old:{...old,facing:intent.facing});
    else if(intent.type==='hop')jumpTo({element:p.element,id:p.id,left:b.left,y:b.top},x,now);
    else if(intent.type==='travel'){if(relocate(now,{to:intent.to})&&intent.reason==='hover')speak(chapters[host?.id]||'Ooh, this one. Good pick.');}
    else if(intent.type==='nap'){autoNap.current=true;setSleep(true);speak('Resting my eyes for a second.');}
    return;
   }
  }
  // In the air with nowhere to stand (page load, after a drag or a trick): land nearby.
  if(!frozen)relocate(now,{nearby:true});
 }
 // Arrow keys steer him the way he actually moves: along a surface, or to another one.
 function steer([dx,dy]){
  const r=resident.current,now=performance.now();userAt.current=now;
  if(r.jump)return;
  if(dx&&r.perch){r.routine=null;r.walkSpeed=150;r.walkTo=pos.current.x+dx-r.perch.element.getBoundingClientRect().left;agent.current=settle(agent.current,now,2500);return;}
  const options=scanTerrain(true).filter(p=>p.element!==r.perch?.element&&(dy<0?p.y<pos.current.y-8:dy>0?p.y>pos.current.y+8:true));
  const choice=choosePlatform(options,{from:pos.current,size,covers:r.covers,controls:r.controls});
  if(choice&&!choice.blocked){jumpTo(choice.platform,choice.x,now);agent.current=settle(rememberVisit(agent.current,choice.platform.id),now,2500);}
 }
 function park(){leavePerch();resident.current.dockSince=performance.now();stopAction();docked.current=true;pos.current=companionDock(innerWidth,innerHeight,size);target.current={...pos.current};setPose(old=>({...old,walking:false,frame:2}));}
 function move(x,y){stopAction();docked.current=false;target.current=safePoint(x,y);if(reduced)pos.current={...target.current};setSleep(false);}

 function startTool(kind){
  stopAction();setFeedback('');
  if(!active||!roam||sleep||reduced||drag.current)return;
  docked.current=false;setMenu(false);menuOpen.current=false;velocity.current={x:0,y:0};
  const s=snoopySize(innerWidth);
  let base=safePoint(pos.current.x,pos.current.y),end={...base},straight=false;
  if(kind==='ladder'||kind==='swing'){
   const project=[...document.querySelectorAll('.story-image,.index-project')].find(el=>{const b=el.getBoundingClientRect();return b.top<innerHeight*.7&&b.bottom>innerHeight*.2;});
   const b=project?.getBoundingClientRect();
   const side=b?(b.left>innerWidth/2?b.left-s/2-12:b.right+s/2+12):base.x;
   const terrain=obstacles(true);const corridor=[120,88,56].map(rise=>findClimbCorridor(base,innerWidth,innerHeight,s,terrain,side,rise)).find(Boolean);
   if(!corridor){setFeedback('A little tight for this trick. Try beside a project, or drag me into some clear space.');setMenu(true);menuOpen.current=true;return false;}
   base=kind==='swing'?corridor.end:corridor.base;end=kind==='swing'?corridor.base:corridor.end;
   if(kind==='swing'){
    const clearArc=Array.from({length:25},(_,i)=>swingPoint({base,end},i/24)).every(point=>point.x>=s/2+12&&point.x<=innerWidth-s/2-12&&isClear(point,obstacles(),s));
    if(!clearArc){
     const candidates=[innerWidth/2,s/2+70,innerWidth-s/2-70].map(x=>findClimbCorridor({x,y:base.y+120},innerWidth,innerHeight,s,obstacles(),x)).filter(Boolean);
     const alternative=candidates.find(c=>Array.from({length:25},(_,i)=>swingPoint({base:c.end,end:c.base},i/24)).every(point=>point.x>=s/2+12&&point.x<=innerWidth-s/2-12&&isClear(point,obstacles(),s)));
     if(alternative){base=alternative.end;end=alternative.base;}else straight=true;
    }
   }
  }
  const start={...pos.current};
  toolAction.current={kind,straight,stage:'approach',start,base,end,started:performance.now()};
  if(!clearTravel(start,base,obstacles(),s)){toolAction.current.stage='arrive';if(body.current)body.current.style.opacity='0';}
  target.current={...base};
  lastSkill.current=kind;speak(kind==='swing'?'Here comes the shortcut.':kind==='ladder'?'Taking the scenic route.':'A little work in progress.');return true;
 }
 function landmarks(){
  const nodes=[...document.querySelectorAll('.story-image,.index-project,.canvas .object')].map((element,index)=>{
   const b=element.getBoundingClientRect();const rect={left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};
   return {id:element.closest('[id]')?.id||`prop-${index}`,kind:element.classList.contains('ball')?'ball':element.classList.contains('object')?'prop':'project',label:element.querySelector('img')?.alt||element.getAttribute('aria-label')||element.querySelector('h3')?.textContent||'This project',rect,element};
  });
  return worldLandmarks(nodes,innerWidth,innerHeight);
 }
 function worldAction(verb='inspect'){
  if(!active||!roam||sleep||reduced||drag.current)return false;
  stopAction();docked.current=false;setMenu(false);menuOpen.current=false;
  const world=landmarks();const photoProjects=world.filter(n=>n.kind==='project');const candidates=verb==='camera'&&photoProjects.length?photoProjects:world;const result=findWorldTarget(candidates,{verb,width:innerWidth,height:innerHeight,size,obstacles:obstacles(true),position:pos.current,index:tour.current++});
  if(!result){speak(verb==='ball'?'My ball is on the opening canvas. Let’s head back.':'No clear perch here. A little more room and I’m in.');if(verb==='ball'&&!world.some(n=>n.kind==='ball')){navigate('top');worldIntent.current={verb,started:performance.now()};}return false;}
  const {point,subject}=result;
  toolAction.current={kind:verb==='inspect'?'camera':verb,stage:'approach',base:point,end:point,start:{...pos.current},subject,started:performance.now()};
  if(!clearTravel(pos.current,point,obstacles(),size)){toolAction.current.stage='arrive';if(body.current)body.current.style.opacity='0';setSpeech('');}
  target.current={...point};velocity.current={x:0,y:0};lastSkill.current=verb==='inspect'?'camera':verb;
  speak(verb==='ball'?'A quick rally.':verb==='camera'?'Finding a good angle.':'Let’s take a closer look.');return true;
 }
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');setSystemReduced(q.matches);const change=()=>setSystemReduced(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change)},[]);
 useEffect(()=>{if(!active||!roam||sleep||menu||reduced){stopAction();}},[active,roam,sleep,menu,reduced]);
 useEffect(()=>{if(active&&(paused||reduced))park();},[active,paused,reduced]);
 useEffect(()=>()=>{clearTimeout(petTimer.current);clearTimeout(reactionTimer.current);},[]);
 useEffect(()=>{if(!speech)return;const timer=setTimeout(()=>setSpeech(''),6500);return()=>clearTimeout(timer)},[speech,active]);
 useEffect(()=>{menuOpen.current=menu;if(menu){target.current={...pos.current};velocity.current={x:0,y:0};setPose(old=>({...old,walking:false,frame:2}));const focusTarget=panel.current?.querySelector('.snoopy-resume')||panel.current?.querySelector('button');focusTarget?.focus();}},[menu,paused,sleep]);
 useEffect(()=>{if(!menu)return;const escape=e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();closeMenu();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[menu,roam,sleep,reduced]);
 useEffect(()=>{if(!active){leavePerch();stopAction();setMenu(false);setSpeech('');clearTimeout(petTimer.current);setPetting(false);drag.current=null;velocity.current={x:0,y:0};return;}const resize=()=>{stopAction();obstacles(true);setSize(snoopySize(innerWidth));target.current=safePoint(target.current.x,target.current.y);pos.current=safePoint(pos.current.x,pos.current.y)};resize();const hero=document.querySelector('.canvas');if(!initialized.current&&hero?.getBoundingClientRect().bottom>100){const letter=document.querySelector('.canvas h1');const b=letter?.getBoundingClientRect();const p=safePoint(innerWidth*.37,b?b.top+80:innerHeight*.5);pos.current={...p};target.current={...p};}initialized.current=true;userAt.current=performance.now();agent.current=createAgent(performance.now());
 // Arriving from the intro mid-air: carry on from exactly where the swing let go.
 const landing=arrival?.current;if(landing){arrival.current=null;if(living){pos.current={x:landing.x,y:landing.y};target.current={...pos.current};docked.current=false;launch(landing.vx,landing.vy);}}if(!greeted.current&&roam&&!reduced){greeted.current=true;if(playfulRef.current){speak('Drag me around. I’ve made myself at home.');react('hello',1100);}}window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[active]);
 // What he can sense: the pointer, a hovered project, and whether anyone is there.
 useEffect(()=>{if(!active)return;
  const touch=()=>{userAt.current=performance.now();if(autoNap.current){autoNap.current=false;agent.current={...agent.current,napping:false,until:performance.now()+900};setSleep(false);speak('Oh, you’re back.');}};
  const moved=e=>{if(e.pointerType==='mouse')cursor.current={x:e.clientX,y:e.clientY,at:performance.now()};touch();};
  const over=e=>{if(e.pointerType&&e.pointerType!=='mouse')return;const host=e.target.closest?.('[data-project-id]')||null;if(host!==hover.current.host)hover.current={host,at:performance.now()};};
  window.addEventListener('pointermove',moved,{passive:true});window.addEventListener('pointerdown',touch,{passive:true});window.addEventListener('keydown',touch);window.addEventListener('scroll',touch,{passive:true});document.addEventListener('pointerover',over,{passive:true});
  return()=>{window.removeEventListener('pointermove',moved);window.removeEventListener('pointerdown',touch);window.removeEventListener('keydown',touch);window.removeEventListener('scroll',touch);document.removeEventListener('pointerover',over);};
 },[active]);
 useEffect(()=>{facingRef.current=pose.facing||1;},[pose.facing]);
 useEffect(()=>{if(!sleep)autoNap.current=false;},[sleep]);
 useEffect(()=>{if(!active)return;let id,last=performance.now();const tick=now=>{
  const dt=Math.min((now-last)/1000,.04);last=now;const action=toolAction.current;if(body.current)body.current.dataset.activity=action?`${action.kind}:${action.stage}`:scrollReturn.current?`portal:${scrollReturn.current.stage}`:'rest';let swinging=false;
  if(worldIntent.current&&!sleep&&!menu&&!drag.current&&!reduced){if(now-worldIntent.current.started>6000)worldIntent.current=null;else if(now-lastScrollAt.current>500){const verb=worldIntent.current.verb;if(verb==='build'&&document.querySelector('.canvas')?.getBoundingClientRect().top>=40){worldIntent.current=null;onBuild?.();}else if(verb==='ball'&&landmarks().some(n=>n.kind==='ball')){worldIntent.current=null;worldAction(verb);}}}
  let returning=scrollReturn.current;
  const nextReturn=portalTransition(returning,{type:'tick'},now);
  if(nextReturn?.stage==='pop'&&returning?.stage!=='pop'){
   obstacles(true);const station=findReturnStation(innerWidth,innerHeight,size,obstacles(),pos.current)||{point:companionDock(innerWidth,innerHeight,size),fromBottom:false,dock:true};
   if(!station){scrollReturn.current={stage:'passing',deadline:now+500};returning=scrollReturn.current;}
   else{scrollReturn.current={...nextReturn,end:station.point,fromBottom:station.fromBottom,dock:!!station.dock};returning=scrollReturn.current;setSpeech('');setPose(old=>({...old,walking:false,frame:2}));}
  }
  if(returning){
   swinging=true;
   if(returning.stage==='pop'){
    if(!returning.dock&&!(returning.fromBottom?Array.from({length:24},(_,i)=>({x:returning.end.x,y:innerHeight+size+(returning.end.y-innerHeight-size)*i/23})).every(point=>isClear(point,obstacles(true),size)):isClear(returning.end,obstacles(true),size))){scrollReturn.current={stage:'passing',deadline:now+500};cancelTool();id=requestAnimationFrame(tick);return;}
    const progress=Math.min(1,(now-returning.started)/1000);
    const eased=1-Math.pow(1-progress,3);
    pos.current={x:returning.end.x,y:returning.fromBottom?innerHeight+size+(returning.end.y-innerHeight-size)*eased:returning.end.y};
    const portalScale=returning.fromBottom?undefined:`scale(${1+.04*Math.sin(progress*Math.PI)},${eased+.08*Math.sin(progress*Math.PI)})`;
    target.current={...pos.current};setToolView({tool:'portal',anchor:returning.end,progress,performance:portalScale});
    if(progress===1){scrollReturn.current=null;docked.current=!!returning.dock;cancelTool();speak('Found a shortcut.');react('land',650);}
   }
  }
  if(action&&!sleep&&!menu&&!drag.current&&!reduced){
   if(action.stage==='arrive'){pos.current={...action.base};target.current={...action.base};const progress=Math.min(1,(now-action.started)/400);swinging=true;setToolView({tool:'portal',anchor:action.base,progress});if(body.current)body.current.style.opacity=String(progress);if(progress===1){action.stage='use';action.started=now;if(body.current)body.current.style.opacity='1';}}
   if(action.stage==='approach'&&now-action.started>8000){cancelTool();target.current={...pos.current};}
   else if(action.stage==='approach'&&Math.hypot(pos.current.x-action.base.x,pos.current.y-action.base.y)<4){action.stage='use';action.started=now;}
   if(toolAction.current&&action.stage==='use'){
    const beat=skillBeat(action.kind,now-action.started);const progress=beat.progress;
    const performanceView={phase:beat.phase,performance:beat.transform,opacity:beat.opacity};
    if(action.movePlan){
     const sample=sampleCharacterMove(action.movePlan,beat,now-action.started,action.facing);
     pos.current=sample.point;target.current={...sample.point};velocity.current={x:0,y:0};swinging=true;
     setPose(old=>old.walking===sample.walking&&old.frame===sample.frame&&old.facing===sample.facing?old:{walking:sample.walking,frame:sample.frame,facing:sample.facing});
     setToolView({...performanceView,tool:action.kind,anchor:action.kind==='dash'?sample.point:action.movePlan.start,progress,performance:sample.transform,spriteAction:sample.spriteAction,spriteFrame:sample.frame,phase:beat.phase});
    }else if(action.kind==='swing'){
     const point=action.straight?{x:action.base.x,y:action.base.y+(action.end.y-action.base.y)*(progress*progress*(3-2*progress))}:swingPoint(action,progress);
     if(!isClear(point,obstacles(),size)){cancelTool();target.current=safePoint(pos.current.x,pos.current.y);}
     else{pos.current=point;target.current={...point};velocity.current={x:0,y:0};swinging=true;setPose(old=>({...old,walking:false,frame:2}));body.current?.style.setProperty('--snoopy-swing-angle',`${swingRotation(progress)}deg`);setToolView({...performanceView,tool:'swing',anchor:{x:action.base.x,y:Math.max(12,action.base.y-size)},tip:{x:point.x+10,y:point.y-size*.55},progress,rotation:swingRotation(progress)});}
    }else if(action.kind==='ladder'){
     const eased=progress*progress*(3-2*progress);const point={x:action.base.x,y:action.base.y+(action.end.y-action.base.y)*eased};
     if(!isClear(point,obstacles(),size)){cancelTool('ladder blocked');target.current={...pos.current};}
     else{pos.current=point;target.current={...point};velocity.current={x:0,y:0};swinging=true;setPose(old=>old.walking||old.facing!==1?{...old,walking:false,frame:2,facing:1}:old);setToolView({...performanceView,tool:'ladder',anchor:action.base,rise:action.base.y-action.end.y,progress});}
    }
    else if(action.kind==='camera'||action.kind==='ball'){
     const subject=action.subject,rect=subject.element.getBoundingClientRect();
     if(!subject.element.isConnected||rect.bottom<0||rect.top>innerHeight||!isClear(pos.current,obstacles(),size)){cancelTool();target.current=safePoint(pos.current.x,pos.current.y);}
     else{velocity.current={x:0,y:0};target.current={...pos.current};swinging=true;setPose(old=>({...old,walking:false,frame:2,facing:rect.left+rect.width/2>pos.current.x?1:-1}));if(action.kind==='ball'&&beat.phase==='act')subject.element.classList.add('snoopy-playing-ball');setToolView({...performanceView,tool:action.kind,anchor:{...pos.current},progress,subjectRect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},subjectLabel:subject.label});}
    }else{swinging=true;setToolView({...performanceView,tool:action.kind,anchor:{...pos.current},progress});}
    if(toolAction.current&&beat.done){if(action.kind==='camera')speak('Good angle. Keeping this one in mind.');if(action.kind==='ball')speak('Your serve.');if(action.movePlan)docked.current=action.startedDocked;cancelTool('completed');setPose(old=>({...old,walking:false,frame:2}));target.current=action.kind==='hammer'?{...pos.current}:{...action.end};velocity.current={x:0,y:0};}
   }
  }
  let residentActive=false;const r=resident.current;
  if(living&&action&&!action.movePlan)leavePerch();
  if(living&&!action&&!returning&&!drag.current){
   // A docked resident is only resting: once the page is quiet he hops back on.
   if(docked.current&&!sleep&&!menu){
    if(!r.dockSince)r.dockSince=now;
    if(now-lastScrollAt.current<220){
     // Scrolling while he rests in the corner: he trots in place, keeping pace with the reader.
     distance.current+=Math.min(30,(Math.abs(r.scrollV)*350+70)*dt);
     const frame=Math.floor(distance.current/14)%8,facing=pos.current.x>innerWidth/2?-1:1;
     showPose({walking:true,kind:'walk',frame,facing,transform:motionTransform(-4,Math.abs(Math.sin(distance.current/14*Math.PI))*3,[1,1],facing)});r.dockTrot=true;
    }else if(r.dockTrot){r.dockTrot=false;plainPose();}
    if(now-r.dockSince>DOCK_REST&&now-lastScrollAt.current>200){r.dockSince=0;r.dockTrot=false;docked.current=false;relocate(now,{nearby:true});}
   }
   if(!docked.current){r.dockSince=0;swinging=true;residentStep(now,dt,sleep||menu);residentActive=!docked.current;}
  }
  if(roam&&!reduced&&!sleep&&!menu&&!drag.current&&!swinging&&!docked.current){
   const result=reduced?{position:{...target.current},velocity:{x:0,y:0},travelled:0,moving:false}:advanceMovement(pos.current,target.current,velocity.current,dt);
   if(result.moving&&!isClear(result.position,obstacles(),size)){
    const horizontal={x:result.position.x,y:pos.current.y},vertical={x:pos.current.x,y:result.position.y};
    const step=[horizontal,vertical].find(p=>isClear(p,obstacles(),size)&&Math.hypot(p.x-pos.current.x,p.y-pos.current.y)>.01);
    if(step)result.position=step;else{const p=safePoint(pos.current.x,pos.current.y);result.position=p;result.velocity={x:0,y:0};result.moving=false;target.current={...p};}
   }
   pos.current=result.position;velocity.current=result.velocity;distance.current+=result.travelled;const facing=Math.abs(result.velocity.x)>5?Math.sign(result.velocity.x):null;const frame=Math.floor(distance.current/14)%8;setPose(old=>{const next={walking:result.moving,frame:result.moving?frame:2,facing:facing||old.facing};return old.walking===next.walking&&old.frame===next.frame&&old.facing===next.facing?old:next});
  }
  const side=pos.current.x>innerWidth-180?'right':pos.current.x<140?'left':'center';const panelHeight=body.current?.querySelector('.companion-menu')?.offsetHeight||300;const aboveRoom=pos.current.y-size-12,belowRoom=innerHeight-pos.current.y-12;const below=aboveRoom<panelHeight&&belowRoom>aboveRoom;if(body.current)body.current.style.setProperty('--snoopy-panel-max-height',`${Math.max(80,below?belowRoom:aboveRoom)}px`);setPlacement(old=>old.side===side&&old.below===below?old:{side,below});const presence=resolvePresence({point:pos.current,width:innerWidth,height:innerHeight,size,obstacles:obstacles(),docked:docked.current,passing:returning?.stage==='passing',dragging:!!drag.current,performing:!!toolAction.current&&toolAction.current.stage!=='approach'||scrollReturn.current?.stage==='pop'||residentActive||living&&!!(action||toolAction.current)});if(presence.docked){pos.current=presence.point;target.current={...pos.current};velocity.current={x:0,y:0};}docked.current=presence.docked;if(body.current){body.current.dataset.surface=r.fling?.slide?'slide':r.fling?'fling':r.jump?'jump':r.perch?'perch':presence.docked?'dock':'air';body.current.dataset.docked=String(presence.docked);body.current.style.transform=`translate(${pos.current.x-size/2}px,${pos.current.y-size}px)`;body.current.style.visibility=presence.visible?'visible':'hidden';}
  if(now-speechCheck.current>150){speechCheck.current=now;const bubble=body.current?.querySelector('.companion-speech');if(bubble){const b=bubble.getBoundingClientRect();bubble.style.visibility=obstacles().some(o=>b.left<o.right+4&&b.right>o.left-4&&b.top<o.bottom+4&&b.bottom>o.top-4)?'hidden':'visible';}}
  id=requestAnimationFrame(tick);
 };id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[active,roam,sleep,menu,size,reduced,living]);
 useEffect(()=>{if(!interactive)return;const pointer=e=>{
  if(e.target.closest('.snoopy-control-panel,.snoopy-companion,[data-snoopy-opener]'))return;
  if(menuOpen.current){setMenu(false);menuOpen.current=false;}
  if(e.target.closest('a,button,input,textarea,select,summary,dialog'))stopAction();
 };document.addEventListener('pointerdown',pointer);return()=>document.removeEventListener('pointerdown',pointer)},[interactive]);
 // During scrolling, keep one document-relative position. Never run avoidance
 // or chase a moving heading; the return is a single deliberate performance.
 useEffect(()=>{
  if(!active||!roam||sleep||menu||building||reduced)return;
  scrollPosition.current=window.scrollY;
  const scroll=()=>{
   const now=performance.now();lastScrollAt.current=now;
   const delta=window.scrollY-scrollPosition.current;scrollPosition.current=window.scrollY;
   if(Math.abs(delta)<=1||drag.current)return;
   if(living){
    const r=resident.current,elapsed=Math.max(8,now-r.scrollAt);r.scrollAt=now;
    r.scrollV=r.scrollV*.6+(delta/Math.min(elapsed,120))*.4;r.scrollDir=Math.sign(delta);r.scrollDist+=Math.abs(delta);
    if(toolAction.current)cancelTool();
    if(playfulRef.current&&!docked.current&&Math.abs(delta)/elapsed>3.2&&now-r.lastStartle>5000){r.lastStartle=now;react('hello',700);speak('Whoa, slow down!');}
    return;
   }
   cancelTool();clearTimeout(reactionTimer.current);clearTimeout(petTimer.current);setPetting(false);setReaction('');setSpeech('');
   if(scrollDisposition(delta)==='dock'){scrollReturn.current=null;
    // Downward reading keeps Snoopy visibly beside the visitor. One fixed dock
    // replaces repeated obstacle avoidance and offscreen catch-up performances.
    docked.current=true;pos.current=companionDock(innerWidth,innerHeight,size);
   }else{
    docked.current=false;scrollReturn.current=portalTransition(scrollReturn.current,{type:'scroll',delta},now);
    pos.current={...pos.current,y:Math.max(-size*2,Math.min(innerHeight+size*2,pos.current.y-delta))};
   }
   target.current={...pos.current};velocity.current={x:0,y:0};
   setPose(old=>old.walking?{...old,walking:false,frame:2}:old);
  };
  window.addEventListener('scroll',scroll,{passive:true});
  return()=>window.removeEventListener('scroll',scroll);
 },[active,roam,sleep,menu,building,reduced,size,living]);
 useEffect(()=>{if(!active)return;const invalidate=()=>{obstacleCache.current.at=0;if(!scrollReturn.current)stopAction();};const root=document.querySelector('.scroll-portfolio');const observer=new MutationObserver(invalidate);if(root)observer.observe(root,{childList:true,subtree:true});const imageLoad=e=>{if(e.target instanceof HTMLImageElement&&e.target.closest('.scroll-portfolio,.canvas'))invalidate();};document.addEventListener('load',imageLoad,true);return()=>{observer.disconnect();document.removeEventListener('load',imageLoad,true)}},[active]);
 useEffect(()=>{if(!active||!building||!roam||sleep||menu||reduced)return;startTool('hammer');},[active,building]);
 // A small command surface lets the authored canvas offer the same actions as
 // Snoopy's own menu. Commands never bypass pause, sleep or reduced motion.
 useEffect(()=>{
  const command=e=>{if(!active)return;const name=e.detail?.command;if(name==='guide'){const r=resident.current,el=document.getElementById(e.detail.target);r.guiding=true;showEmote('!');if(livingRef.current&&el&&!sleep){const here=r.perch?.element;if(!(here&&el.contains(here))){r.prefer=el;r.routine=null;r.walkTo=null;if(docked.current){docked.current=false;}relocate(performance.now(),{nearby:false});}}return;}if(name==='farewell'){const r=resident.current,el=document.getElementById('contact');if(livingRef.current&&el&&!sleep&&!r.guiding){r.prefer=el;r.routine=null;r.walkTo=null;docked.current=false;relocate(performance.now(),{});agent.current=settle(agent.current,performance.now(),6000);setTimeout(()=>{if(!resident.current.guiding&&resident.current.perch){startRoutine('wave',performance.now());speak('That’s the tour. Say hello to John.');}},1300);}return;}if(name==='guide-end'){const r=resident.current;if(r.guiding){r.guiding=false;agent.current=settle(agent.current,performance.now(),1200);}return;}if(name==='menu'){opener.current=document.activeElement;stopAction();setMenu(true);menuOpen.current=true;return;}if(name==='camera'||name==='ball'||name==='explore')worldAction(name==='explore'?'inspect':name);};
  window.addEventListener('jtavu:snoopy-command',command);
  return()=>window.removeEventListener('jtavu:snoopy-command',command);
 },[active,roam,sleep,reduced,size]);
 function closeMenu(){setFeedback('');setMenu(false);menuOpen.current=false;if(!living&&!docked.current&&roam&&!sleep&&!reduced&&(pos.current.y<size+50||pos.current.y>innerHeight||!isClear(pos.current,obstacles(true),size)))scrollReturn.current={stage:'passing',deadline:performance.now()};requestAnimationFrame(()=>{if(opener.current?.isConnected&&opener.current.matches('button,a,[tabindex]'))opener.current.focus();else document.querySelector('[data-snoopy-opener]')?.focus();});}
 function toggleMenu(){opener.current=document.activeElement;stopAction();menuOpen.current=!menu;target.current={...pos.current};velocity.current={x:0,y:0};setMenu(m=>!m)}
 function requestBuild(){stopAction();setMenu(false);menuOpen.current=false;navigate('top');worldIntent.current={verb:'build',started:performance.now()};}
 function startMove(kind,withPets=false){
  if(!active||!roam||sleep||reduced||drag.current)return false;
  const wasDocked=docked.current;stopAction();setFeedback('');setMenu(false);menuOpen.current=false;docked.current=false;
  const plan=planCharacterMove(kind,pos.current,innerWidth,innerHeight,size,living&&kind==='hop'?[]:obstacles(true));
  toolAction.current={kind,stage:'use',started:performance.now(),start:{...pos.current},base:{...pos.current},end:{...pos.current},movePlan:plan,startedDocked:wasDocked,facing:pose.facing};
  lastSkill.current=kind;
  speak(kind==='hop'?(plan.height?'A little spring in my step.':'Low ceiling. Tiny hop.'):kind==='dash'?(plan.end.x!==plan.start.x?'Back in a flash.':'Tiny track. Big energy.'):'For my next trick… absolutely nothing. Thank you.');
  if(withPets){setPetting(true);petTimer.current=setTimeout(()=>setPetting(false),1500);speak('That’s the spot.');}
  return true;
 }
 function improvise(){const world=landmarks();const choice=choosePlaygroundMoment({canAct:active&&roam&&!sleep,reduced,hasBall:world.some(n=>n.kind==='ball'),hasProject:world.some(n=>n.kind==='project'),lastAction:lastSkill.current});if(choice==='dance')startMove(lastSkill.current==='hop'?'dash':'hop');else if(choice)worldAction(choice);}
 function dance(){stopAction();setMenu(false);menuOpen.current=false;setSleep(false);lastSkill.current='dance';react('dance',2200);speak('A little victory dance.');}
 function pet(){if(roam&&!sleep&&!reduced&&startMove('bow',true))return;stopAction();setMenu(false);setSleep(false);setPetting(true);speak('That’s the spot.');clearTimeout(petTimer.current);petTimer.current=setTimeout(()=>setPetting(false),700)}
 function showProject(){setMenu(false);setSleep(false);const ids=projectList.map(p=>`project-${p.id}`);const id=ids[tour.current++%ids.length];navigate(id);if(living){resident.current.prefer=document.getElementById(id);agent.current=settle(agent.current,performance.now(),3000);}else move(innerWidth-65,innerHeight-90);speak(chapters[id]||'Let’s take a look at this one.');}
 if(!active)return null;
 return <><SnoopyTools tool={toolView.tool} anchor={toolView.anchor} progress={toolView.progress} tip={toolView.tip} rotation={toolView.rotation} subjectRect={toolView.subjectRect} subjectLabel={toolView.subjectLabel} rise={toolView.rise} actorSize={size} opacity={toolView.opacity} phase={toolView.phase} reduced={reduced}/><div ref={body} className={`snoopy-companion ${placement.side} ${reduced?'is-reduced':''} ${reaction?'reaction-'+reaction:''} ${!paused&&!sleep&&!menu&&!dragging&&!pose.walking&&!pose.transform&&!pose.kind&&!reaction&&!toolView.tool?'is-idle':''} ${dragging?'is-dragging':''} ${petting?'getting-pets':''} ${sleep?'is-sleeping':''} ${building?'is-building':''} ${placement.below?'popup-below':''}`} style={{width:size,height:size}}>
 {petting&&<span className="snoopy-affection" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i></span>}
 <span className="snoopy-dock-label" aria-hidden="true">Snoopy · drag me</span>
 {sleep&&<span className="companion-sleep-mark" aria-hidden="true">Z z</span>}
 <span className="snoopy-slide-trail" aria-hidden="true"/>{emote&&<span key={emote.key} className="snoopy-emote" aria-hidden="true">{emote.symbol}</span>}{speech&&!menu&&!scrollReturn.current&&toolView.tool!=='swing'&&<p className="companion-speech" aria-live="polite">{speech}</p>}
 <button className="companion-character" aria-label={sleep?'Wake Snoopy companion':'Interact with Snoopy'} aria-expanded={menu} aria-controls="snoopy-menu" title="Drag Snoopy to move him. Click for his controls." onDragStart={e=>e.preventDefault()} onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();leavePerch();stopAction(true);docked.current=false;target.current={...pos.current};velocity.current={x:0,y:0};e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,ox:pos.current.x,oy:pos.current.y,moved:false};}} onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>5)d.moved=true;d.samples=[...(d.samples||[]),{x:e.clientX,y:e.clientY,t:performance.now()}].slice(-6);if(d.moved){body.current?.style.setProperty('--pickup-lean',`${Math.max(-14,Math.min(14,dx*.12))}deg`);setDragging(true);setMenu(false);menuOpen.current=false;setSleep(false);setSpeech('');pos.current=clampPoint({x:d.ox+dx,y:d.oy+dy},innerWidth,innerHeight,size);target.current={...pos.current};velocity.current={x:0,y:0};setPose({walking:false,frame:2,facing:dx<0?-1:1});}}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);const d=drag.current;drag.current=null;setDragging(false);if(d?.moved){if(!living){react('land',650);pos.current=safePoint(pos.current.x,pos.current.y);}target.current={...pos.current};velocity.current={x:0,y:0};
 if(living){
  // Release speed comes from the last ~100 ms of the drag, so a flick throws him.
  const now=performance.now(),recent=(d.samples||[]).filter(q=>now-q.t<110),a=recent[0],z=recent[recent.length-1];
  const span=a&&z&&z.t>a.t?(z.t-a.t)/1000:0,vx=span?(z.x-a.x)/span:0,vy=span?(z.y-a.y)/span:0,cap=2400;
  const fx=Math.max(-cap,Math.min(cap,vx)),fy=Math.max(-cap,Math.min(cap,vy));
  launch(fx,fy);userAt.current=now;
  if(Math.hypot(fx,fy)>900){showEmote('!');speak(['Wheee!','Whoa!','Again!'][Math.floor(Math.random()*3)]);}
 }}if(d&&!d.moved){if(sleep){setSleep(false);speak('Okay, I’m up.')}else toggleMenu()}}} onPointerCancel={()=>{drag.current=null;setDragging(false);pos.current=safePoint(pos.current.x,pos.current.y);velocity.current={x:0,y:0};target.current={...pos.current}}} onClick={e=>{if(e.detail===0){if(sleep){setSleep(false);speak('Okay, I’m up.')}else toggleMenu()}}} onKeyDown={e=>{const v={ArrowLeft:[-60,0],ArrowRight:[60,0],ArrowUp:[0,-60],ArrowDown:[0,60]}[e.key];if(v){e.preventDefault();setMenu(false);if(living)steer(v);else move(target.current.x+v[0],target.current.y+v[1]);}if(e.key==='Escape')setMenu(false)}}><span className="snoopy-performance" data-skill={toolView.tool||undefined} data-phase={toolView.phase||undefined} style={{transform:toolView.performance||(toolView.tool?undefined:pose.transform)||undefined}}><SnoopySprite action={toolView.tool?(toolView.tool==='hop'?toolView.spriteAction:toolView.tool==='dash'?undefined:toolView.tool):pose.kind==='action'?pose.action:undefined} standingFrame={toolView.spriteFrame??2} actionProgress={toolView.progress} frame={sleep?0:pose.frame} walking={!sleep&&pose.walking} standing={!sleep&&!pose.walking&&pose.kind!=='wake'} head={toolView.tool?0:pose.head||0} tail={toolView.tool?0:pose.tail||0} facing={pose.facing}/></span></button>
 </div>
 {menu&&createPortal(<section ref={panel} id="snoopy-menu" className="snoopy-control-panel" role="dialog" aria-modal="false" aria-labelledby="snoopy-panel-title" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeMenu();}}}>
 <div className="snoopy-panel-heading"><div><span className="snoopy-panel-eyebrow">{playful?'YOUR LITTLE COMPANION':'YOUR HOST'}</span><h2 id="snoopy-panel-title">Snoopy</h2></div><button className="snoopy-panel-close" aria-label="Close Snoopy controls" onClick={closeMenu}>Close</button></div>
 <p className="snoopy-panel-note" role={feedback?'status':undefined}>{feedback|| (sleep?'A little nap. Wake him whenever you’re ready.':paused?'Taking a breather. Resume Snoopy to try a trick.':reduced?'Keeping things still. Snoopy can still show you the work.':living?(playful?'He lives on this page. Pick him up and toss him, or give him something to do.':'Tap any project and he’ll tell you about it. He keeps to himself otherwise.'):'A guide, a little mischief, and room to explore.')}</p>
 {(paused||sleep)&&<button className="snoopy-resume" onClick={()=>{setSleep(false);setRoam(true);}}>{sleep?'Wake Snoopy':'Resume Snoopy'}</button>}
 <button className="snoopy-mode" aria-pressed={playful} onClick={()=>{setPlayful(v=>!v);setFeedback(playful?'Back to a quiet host.':'Playful it is. He’ll roam, hop and show off.');}}><strong>{playful?'Playful Snoopy is on':'Let Snoopy play'}</strong><span>{playful?'Tap to make him a quiet host again':'He’ll roam, do tricks and show off'}</span></button>
 <div className={`snoopy-main-actions ${playful?'':'is-calm'}`}>
 <button onClick={()=>{setMenu(false);menuOpen.current=false;park();setSleep(false);speak('Right here.');}}><strong>Bring Snoopy here</strong><span>Back beside you, wherever you are</span></button>
 <button aria-label="Show me a project" onClick={showProject}><strong>Show me a project</strong><span>A little tour of John’s work</span></button>
 <button aria-label="Play ball" disabled={!roam||reduced||sleep} onClick={()=>worldAction('ball')}><strong>Play ball</strong><span>Back to the canvas for a quick rally</span></button>
 <button aria-label="Take a photo" disabled={!roam||reduced||sleep} onClick={()=>worldAction('camera')}><strong>Take a photo</strong><span>A camera moment with what’s nearby</span></button>
 </div>
 <div className="snoopy-quick-tricks" hidden={!playful} aria-label="Snoopy’s little tricks"><span>TRY A LITTLE MISCHIEF</span><div><button disabled={!roam||reduced||sleep} onClick={()=>startMove('hop')}>Hop</button><button disabled={!roam||reduced||sleep} onClick={()=>startMove('dash')}>Zoomies</button><button disabled={!roam||reduced||sleep} onClick={()=>startMove('bow')}>Take a bow</button></div></div>
 <details className="snoopy-extra-tools" hidden={!playful}><summary>More things to try<span aria-hidden="true">+</span></summary><div>
 <button disabled={!roam||reduced||sleep} onClick={improvise}>Surprise me</button>
 <button disabled={!roam||reduced||sleep} onClick={dance}>Happy dance</button>
 <button disabled={!roam||reduced||sleep} onClick={()=>startTool('swing')}>Swing down</button>
 <button disabled={!roam||reduced||sleep} onClick={()=>startTool('ladder')}>Use the ladder</button>
 <button disabled={!roam||reduced||sleep} onClick={requestBuild}>Help build</button>
 <button disabled={!roam||reduced||sleep} onClick={()=>worldAction('inspect')}>Explore nearby</button>
 <button onClick={pet}>Pet Snoopy</button>
 <button onClick={()=>{stopAction();closeMenu();setSleep(true);speak('Just a little nap.')}}>Take a nap</button>
 </div></details>
 <button className="snoopy-motion-preference" aria-pressed={freeRoam} disabled={reduced||paused} onClick={()=>{const next=!freeRoam;stopAction();setFeedback('');if(next){leavePerch();resident.current.dockSince=performance.now()-DOCK_REST+600;}else park();setFreeRoam(next);}}>{reduced||paused?'Roaming resumes when Snoopy is moving again':freeRoam?'Keep Snoopy in his corner':'Let Snoopy roam the page'}</button>
 <button className="snoopy-motion-preference" aria-pressed={reduced} disabled={systemReduced} onClick={()=>{stopAction();setFeedback('');setQuietMotion(v=>!v);}}>{systemReduced?'Reduced motion follows your device':quietMotion?'Restore Snoopy’s animations':'Use less animation'}</button>
 <div className="snoopy-panel-footer">{!paused?<button onClick={()=>{stopAction();setRoam(false);}}>Pause Snoopy</button>:<span>Resting for a moment.</span>}<span>Drag him gently to move him.</span></div>
 </section>,document.body)}
 </>
}
