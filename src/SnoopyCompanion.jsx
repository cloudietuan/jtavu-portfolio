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
const chapters={work:'A few things John’s been making.', 'project-sunset':'This one started with the family salon.', 'project-apparel':'These ideas made it onto actual clothes.', making:'There’s always room for another idea.',beyond:'A little time away from the screen.',about:'You’ve met the work. Here’s John.',contact:'Have an idea? Say hello.'};
export function SnoopyCompanion({active,building,navigate,onBuild,paused=false,onPausedChange}){
 const docked=useRef(false),panel=useRef(null),opener=useRef(null),body=useRef(null),pos=useRef({x:130,y:250}),target=useRef({x:130,y:250}),velocity=useRef({x:0,y:0}),distance=useRef(0),drag=useRef(null),tour=useRef(0),greeted=useRef(false),petTimer=useRef(null),obstacleCache=useRef({at:0,rects:[]}),menuOpen=useRef(false),initialized=useRef(false),toolAction=useRef(null),scrollPosition=useRef(0),lastSkill=useRef(null),scrollReturn=useRef(null),speechCheck=useRef(0),worldIntent=useRef(null),lastScrollAt=useRef(0),reactionTimer=useRef(null);
 const [reaction,setReaction]=useState(''),[feedback,setFeedback]=useState('');
 const [dragging,setDragging]=useState(false),[pose,setPose]=useState({walking:false,frame:2,facing:1}),[menu,setMenu]=useState(false),[sleep,setSleep]=useState(false),[speech,setSpeech]=useState(''),[petting,setPetting]=useState(false),[systemReduced,setSystemReduced]=useState(false),[quietMotion,setQuietMotion]=useState(()=>{try{return sessionStorage.getItem('jtavu-snoopy-less-motion')==='true'}catch{return false}}),[size,setSize]=useState(96),[placement,setPlacement]=useState({side:'left',below:true}),[toolView,setToolView]=useState({tool:null,anchor:{x:0,y:0},progress:0});
 const roam=!paused;const reduced=systemReduced||quietMotion;
 useEffect(()=>{try{sessionStorage.setItem('jtavu-snoopy-less-motion',String(quietMotion))}catch{}},[quietMotion]);
 function setRoam(update){const next=typeof update==='function'?update(roam):update;onPausedChange?.(!next);}
 const interactive=active;
 function speak(text){setSpeech(text);}
 function obstacles(force=false){const now=performance.now();if(force||now-obstacleCache.current.at>200){obstacleCache.current={at:now,rects:[...document.querySelectorAll('a,button,input,textarea,select,summary,dialog,h1,h2,h3,p')].filter(e=>!e.closest('.snoopy-companion,.snoopy-control-panel')).map(e=>e.getBoundingClientRect()).filter(b=>b.width&&b.height&&b.top<innerHeight&&b.bottom>0)};}return obstacleCache.current.rects;}
 function safePoint(x,y){return findSafePoint({x,y},innerWidth,innerHeight,innerWidth<700?80:96,obstacles());}
 function cancelTool(reason='interrupted'){if(body.current&&toolAction.current)body.current.dataset.lastInterruption=reason;if(body.current)body.current.style.opacity='1';toolAction.current?.subject?.element?.classList.remove('snoopy-playing-ball');toolAction.current=null;body.current?.style.setProperty('--snoopy-swing-angle','0deg');setToolView(old=>old.tool?{tool:null,anchor:old.anchor,progress:0}:old);}
 function react(kind,duration=900){clearTimeout(reactionTimer.current);setReaction(kind);reactionTimer.current=setTimeout(()=>setReaction(''),duration);}
 function stopAction(preservePosition=true){clearTimeout(reactionTimer.current);clearTimeout(petTimer.current);setPetting(false);setReaction('');worldIntent.current=null;scrollReturn.current=null;cancelTool();setPose(old=>old.walking?{...old,walking:false,frame:2}:old);velocity.current={x:0,y:0};if(!preservePosition)pos.current=safePoint(pos.current.x,pos.current.y);target.current={...pos.current};}
 function park(){stopAction();docked.current=true;pos.current=companionDock(innerWidth,innerHeight,size);target.current={...pos.current};setPose(old=>({...old,walking:false,frame:2}));}
 function move(x,y){stopAction();docked.current=false;target.current=safePoint(x,y);if(reduced)pos.current={...target.current};setSleep(false);}

 function startTool(kind){
  stopAction();setFeedback('');
  if(!active||!roam||sleep||reduced||drag.current)return;
  docked.current=false;setMenu(false);menuOpen.current=false;velocity.current={x:0,y:0};
  const s=innerWidth<700?80:96;
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
 useEffect(()=>{if(!active){stopAction();setMenu(false);setSpeech('');clearTimeout(petTimer.current);setPetting(false);drag.current=null;velocity.current={x:0,y:0};return;}const resize=()=>{stopAction();obstacles(true);setSize(innerWidth<700?80:96);target.current=safePoint(target.current.x,target.current.y);pos.current=safePoint(pos.current.x,pos.current.y)};resize();const hero=document.querySelector('.canvas');if(!initialized.current&&hero?.getBoundingClientRect().bottom>100){const letter=document.querySelector('.canvas h1');const b=letter?.getBoundingClientRect();const p=safePoint(innerWidth*.37,b?b.top+80:innerHeight*.5);pos.current={...p};target.current={...p};}initialized.current=true;if(!greeted.current&&roam&&!reduced){greeted.current=true;speak('Drag me around. I’ve made myself at home.');react('hello',1100);}window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[active]);
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
  if(roam&&!reduced&&!sleep&&!menu&&!drag.current&&!swinging&&!docked.current){
   const result=reduced?{position:{...target.current},velocity:{x:0,y:0},travelled:0,moving:false}:advanceMovement(pos.current,target.current,velocity.current,dt);
   if(result.moving&&!isClear(result.position,obstacles(),size)){
    const horizontal={x:result.position.x,y:pos.current.y},vertical={x:pos.current.x,y:result.position.y};
    const step=[horizontal,vertical].find(p=>isClear(p,obstacles(),size)&&Math.hypot(p.x-pos.current.x,p.y-pos.current.y)>.01);
    if(step)result.position=step;else{const p=safePoint(pos.current.x,pos.current.y);result.position=p;result.velocity={x:0,y:0};result.moving=false;target.current={...p};}
   }
   pos.current=result.position;velocity.current=result.velocity;distance.current+=result.travelled;const facing=Math.abs(result.velocity.x)>5?Math.sign(result.velocity.x):null;const frame=Math.floor(distance.current/14)%8;setPose(old=>{const next={walking:result.moving,frame:result.moving?frame:2,facing:facing||old.facing};return old.walking===next.walking&&old.frame===next.frame&&old.facing===next.facing?old:next});
  }
  const side=pos.current.x>innerWidth-180?'right':pos.current.x<140?'left':'center';const panelHeight=body.current?.querySelector('.companion-menu')?.offsetHeight||300;const aboveRoom=pos.current.y-size-12,belowRoom=innerHeight-pos.current.y-12;const below=aboveRoom<panelHeight&&belowRoom>aboveRoom;if(body.current)body.current.style.setProperty('--snoopy-panel-max-height',`${Math.max(80,below?belowRoom:aboveRoom)}px`);setPlacement(old=>old.side===side&&old.below===below?old:{side,below});const presence=resolvePresence({point:pos.current,width:innerWidth,height:innerHeight,size,obstacles:obstacles(),docked:docked.current,passing:returning?.stage==='passing',dragging:!!drag.current,performing:!!toolAction.current&&toolAction.current.stage!=='approach'||scrollReturn.current?.stage==='pop'});if(presence.docked){pos.current=presence.point;target.current={...pos.current};velocity.current={x:0,y:0};}docked.current=presence.docked;if(body.current){body.current.dataset.docked=String(presence.docked);body.current.style.transform=`translate(${pos.current.x-size/2}px,${pos.current.y-size}px)`;body.current.style.visibility=presence.visible?'visible':'hidden';}
  if(now-speechCheck.current>150){speechCheck.current=now;const bubble=body.current?.querySelector('.companion-speech');if(bubble){const b=bubble.getBoundingClientRect();bubble.style.visibility=obstacles().some(o=>b.left<o.right+4&&b.right>o.left-4&&b.top<o.bottom+4&&b.bottom>o.top-4)?'hidden':'visible';}}
  id=requestAnimationFrame(tick);
 };id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[active,roam,sleep,menu,size,reduced]);
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
 },[active,roam,sleep,menu,building,reduced,size]);
 useEffect(()=>{if(!active)return;const invalidate=()=>{obstacleCache.current.at=0;if(!scrollReturn.current)stopAction();};const root=document.querySelector('.scroll-portfolio');const observer=new MutationObserver(invalidate);if(root)observer.observe(root,{childList:true,subtree:true});const imageLoad=e=>{if(e.target instanceof HTMLImageElement&&e.target.closest('.scroll-portfolio,.canvas'))invalidate();};document.addEventListener('load',imageLoad,true);return()=>{observer.disconnect();document.removeEventListener('load',imageLoad,true)}},[active]);
 useEffect(()=>{if(!active||!building||!roam||sleep||menu||reduced)return;startTool('hammer');},[active,building]);
 // A small command surface lets the authored canvas offer the same actions as
 // Snoopy's own menu. Commands never bypass pause, sleep or reduced motion.
 useEffect(()=>{
  const command=e=>{if(!active)return;const name=e.detail?.command;if(name==='menu'){opener.current=document.activeElement;stopAction();setMenu(true);menuOpen.current=true;return;}if(name==='camera'||name==='ball'||name==='explore')worldAction(name==='explore'?'inspect':name);};
  window.addEventListener('jtavu:snoopy-command',command);
  return()=>window.removeEventListener('jtavu:snoopy-command',command);
 },[active,roam,sleep,reduced,size]);
 function closeMenu(){setFeedback('');setMenu(false);menuOpen.current=false;if(!docked.current&&roam&&!sleep&&!reduced&&(pos.current.y<size+50||pos.current.y>innerHeight||!isClear(pos.current,obstacles(true),size)))scrollReturn.current={stage:'passing',deadline:performance.now()};requestAnimationFrame(()=>{if(opener.current?.isConnected&&opener.current.matches('button,a,[tabindex]'))opener.current.focus();else document.querySelector('[data-snoopy-opener]')?.focus();});}
 function toggleMenu(){opener.current=document.activeElement;stopAction();menuOpen.current=!menu;target.current={...pos.current};velocity.current={x:0,y:0};setMenu(m=>!m)}
 function requestBuild(){stopAction();setMenu(false);menuOpen.current=false;navigate('top');worldIntent.current={verb:'build',started:performance.now()};}
 function startMove(kind,withPets=false){
  if(!active||!roam||sleep||reduced||drag.current)return false;
  const wasDocked=docked.current;stopAction();setFeedback('');setMenu(false);menuOpen.current=false;docked.current=false;
  const plan=planCharacterMove(kind,pos.current,innerWidth,innerHeight,size,obstacles(true));
  toolAction.current={kind,stage:'use',started:performance.now(),start:{...pos.current},base:{...pos.current},end:{...pos.current},movePlan:plan,startedDocked:wasDocked,facing:pose.facing};
  lastSkill.current=kind;
  speak(kind==='hop'?(plan.height?'A little spring in my step.':'Low ceiling. Tiny hop.'):kind==='dash'?(plan.end.x!==plan.start.x?'Back in a flash.':'Tiny track. Big energy.'):'For my next trick… absolutely nothing. Thank you.');
  if(withPets){setPetting(true);petTimer.current=setTimeout(()=>setPetting(false),1500);speak('That’s the spot.');}
  return true;
 }
 function improvise(){const world=landmarks();const choice=choosePlaygroundMoment({canAct:active&&roam&&!sleep,reduced,hasBall:world.some(n=>n.kind==='ball'),hasProject:world.some(n=>n.kind==='project'),lastAction:lastSkill.current});if(choice==='dance')startMove(lastSkill.current==='hop'?'dash':'hop');else if(choice)worldAction(choice);}
 function dance(){stopAction();setMenu(false);menuOpen.current=false;setSleep(false);lastSkill.current='dance';react('dance',2200);speak('A little victory dance.');}
 function pet(){if(roam&&!sleep&&!reduced&&startMove('bow',true))return;stopAction();setMenu(false);setSleep(false);setPetting(true);speak('That’s the spot.');clearTimeout(petTimer.current);petTimer.current=setTimeout(()=>setPetting(false),700)}
 function showProject(){setMenu(false);setSleep(false);const ids=projectList.map(p=>`project-${p.id}`);const id=ids[tour.current++%ids.length];navigate(id);move(innerWidth-65,innerHeight-90);speak(chapters[id]||'Let’s take a look at this one.');}
 if(!active)return null;
 return <><SnoopyTools tool={toolView.tool} anchor={toolView.anchor} progress={toolView.progress} tip={toolView.tip} rotation={toolView.rotation} subjectRect={toolView.subjectRect} subjectLabel={toolView.subjectLabel} rise={toolView.rise} actorSize={size} opacity={toolView.opacity} phase={toolView.phase} reduced={reduced}/><div ref={body} className={`snoopy-companion ${placement.side} ${reduced?'is-reduced':''} ${reaction?'reaction-'+reaction:''} ${!paused&&!sleep&&!menu&&!dragging&&!pose.walking&&!reaction&&!toolView.tool?'is-idle':''} ${dragging?'is-dragging':''} ${petting?'getting-pets':''} ${sleep?'is-sleeping':''} ${building?'is-building':''} ${placement.below?'popup-below':''}`} style={{width:size,height:size}}>
 {petting&&<span className="snoopy-affection" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i></span>}
 <span className="snoopy-dock-label" aria-hidden="true">Snoopy · drag me</span>
 {sleep&&<span className="companion-sleep-mark" aria-hidden="true">Z z</span>}
 {speech&&!menu&&!scrollReturn.current&&toolView.tool!=='swing'&&<p className="companion-speech" aria-live="polite">{speech}</p>}
 <button className="companion-character" aria-label={sleep?'Wake Snoopy companion':'Interact with Snoopy'} aria-expanded={menu} aria-controls="snoopy-menu" title="Drag Snoopy to move him. Click for his controls." onDragStart={e=>e.preventDefault()} onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();stopAction(true);docked.current=false;target.current={...pos.current};velocity.current={x:0,y:0};e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,ox:pos.current.x,oy:pos.current.y,moved:false};}} onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>5)d.moved=true;if(d.moved){body.current?.style.setProperty('--pickup-lean',`${Math.max(-14,Math.min(14,dx*.12))}deg`);setDragging(true);setMenu(false);menuOpen.current=false;setSleep(false);setSpeech('');pos.current=clampPoint({x:d.ox+dx,y:d.oy+dy},innerWidth,innerHeight,size);target.current={...pos.current};velocity.current={x:0,y:0};setPose({walking:false,frame:2,facing:dx<0?-1:1});}}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);const d=drag.current;drag.current=null;setDragging(false);if(d?.moved){react('land',650);pos.current=safePoint(pos.current.x,pos.current.y);target.current={...pos.current};velocity.current={x:0,y:0};}if(d&&!d.moved){if(sleep){setSleep(false);speak('Okay, I’m up.')}else toggleMenu()}}} onPointerCancel={()=>{drag.current=null;setDragging(false);pos.current=safePoint(pos.current.x,pos.current.y);velocity.current={x:0,y:0};target.current={...pos.current}}} onClick={e=>{if(e.detail===0){if(sleep){setSleep(false);speak('Okay, I’m up.')}else toggleMenu()}}} onKeyDown={e=>{const v={ArrowLeft:[-60,0],ArrowRight:[60,0],ArrowUp:[0,-60],ArrowDown:[0,60]}[e.key];if(v){e.preventDefault();setMenu(false);move(target.current.x+v[0],target.current.y+v[1]);}if(e.key==='Escape')setMenu(false)}}><span className="snoopy-performance" data-skill={toolView.tool||undefined} data-phase={toolView.phase||undefined} style={{transform:toolView.performance||undefined}}><SnoopySprite action={toolView.tool==='hop'?toolView.spriteAction:toolView.tool==='dash'?undefined:toolView.tool} standingFrame={toolView.spriteFrame??2} actionProgress={toolView.progress} frame={sleep?0:pose.frame} walking={!sleep&&pose.walking} standing={!sleep&&!pose.walking} facing={pose.facing}/></span></button>
 </div>
 {menu&&createPortal(<section ref={panel} id="snoopy-menu" className="snoopy-control-panel" role="dialog" aria-modal="false" aria-labelledby="snoopy-panel-title" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeMenu();}}}>
 <div className="snoopy-panel-heading"><div><span className="snoopy-panel-eyebrow">YOUR LITTLE COMPANION</span><h2 id="snoopy-panel-title">Snoopy</h2></div><button className="snoopy-panel-close" aria-label="Close Snoopy controls" onClick={closeMenu}>Close</button></div>
 <p className="snoopy-panel-note" role={feedback?'status':undefined}>{feedback|| (sleep?'A little nap. Wake him whenever you’re ready.':paused?'Taking a breather. Resume Snoopy to try a trick.':reduced?'Keeping things still. Snoopy can still show you the work.':'A guide, a little mischief, and room to explore.')}</p>
 {(paused||sleep)&&<button className="snoopy-resume" onClick={()=>{setSleep(false);setRoam(true);}}>{sleep?'Wake Snoopy':'Resume Snoopy'}</button>}
 <div className="snoopy-main-actions">
 <button onClick={()=>{setMenu(false);menuOpen.current=false;park();setSleep(false);speak('Right here.');}}><strong>Bring Snoopy here</strong><span>Back beside you, wherever you are</span></button>
 <button aria-label="Show me a project" onClick={showProject}><strong>Show me a project</strong><span>A little tour of John’s work</span></button>
 <button aria-label="Play ball" disabled={!roam||reduced||sleep} onClick={()=>worldAction('ball')}><strong>Play ball</strong><span>Back to the canvas for a quick rally</span></button>
 <button aria-label="Take a photo" disabled={!roam||reduced||sleep} onClick={()=>worldAction('camera')}><strong>Take a photo</strong><span>A camera moment with what’s nearby</span></button>
 </div>
 <div className="snoopy-quick-tricks" aria-label="Snoopy’s little tricks"><span>TRY A LITTLE MISCHIEF</span><div><button disabled={!roam||reduced||sleep} onClick={()=>startMove('hop')}>Hop</button><button disabled={!roam||reduced||sleep} onClick={()=>startMove('dash')}>Zoomies</button><button disabled={!roam||reduced||sleep} onClick={()=>startMove('bow')}>Take a bow</button></div></div>
 <details className="snoopy-extra-tools"><summary>More things to try<span aria-hidden="true">+</span></summary><div>
 <button disabled={!roam||reduced||sleep} onClick={improvise}>Surprise me</button>
 <button disabled={!roam||reduced||sleep} onClick={dance}>Happy dance</button>
 <button disabled={!roam||reduced||sleep} onClick={()=>startTool('swing')}>Swing down</button>
 <button disabled={!roam||reduced||sleep} onClick={()=>startTool('ladder')}>Use the ladder</button>
 <button disabled={!roam||reduced||sleep} onClick={requestBuild}>Help build</button>
 <button disabled={!roam||reduced||sleep} onClick={()=>worldAction('inspect')}>Explore nearby</button>
 <button onClick={pet}>Pet Snoopy</button>
 <button onClick={()=>{stopAction();closeMenu();setSleep(true);speak('Just a little nap.')}}>Take a nap</button>
 </div></details>
 <button className="snoopy-motion-preference" aria-pressed={reduced} disabled={systemReduced} onClick={()=>{stopAction();setFeedback('');setQuietMotion(v=>!v);}}>{systemReduced?'Reduced motion follows your device':quietMotion?'Restore Snoopy’s animations':'Use less animation'}</button>
 <div className="snoopy-panel-footer">{!paused?<button onClick={()=>{stopAction();setRoam(false);}}>Pause Snoopy</button>:<span>Resting for a moment.</span>}<span>Drag him gently to move him.</span></div>
 </section>,document.body)}
 </>
}
