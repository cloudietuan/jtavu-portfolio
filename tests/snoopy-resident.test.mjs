import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlatforms,choosePerchX,choosePlatform,jumpPoint,jumpDuration,bodyBox} from '../src/snoopyTerrain.js';
import {createAgent,decide,tickDrives,rememberVisit,pickRoutine,moodFor,MOODS,AGENT_TIMING} from '../src/snoopyAgent.js';
import {planRoutine,sampleRoutine,jumpPhase,ROUTINE_NAMES,POSES,JUMP_CROUCH} from '../src/snoopyRoutines.js';

const view={width:1280,height:800,size:96,top:64};
const node=(id,left,top,width,height=60)=>({id,rect:{left,right:left+width,top,bottom:top+height}});

test('only surfaces he can fully stand on become platforms',()=>{
 const platforms=buildPlatforms([
  node('heading',100,300,500),
  node('under-header',100,120,500),   // body would hide beneath the sticky header
  node('below-fold',100,900,500),
  node('too-narrow',100,400,40),
  node('offscreen-left',-600,400,500),
 ],view);
 assert.deepEqual(platforms.map(p=>p.id),['heading']);
 const [p]=platforms;
 assert.equal(p.y,300);
 assert.ok(p.minX>=p.left&&p.maxX<=p.right&&p.minX<=p.maxX);
});

test('phone-width surfaces keep him inside the viewport',()=>{
 const [p]=buildPlatforms([node('image',0,400,390)],{width:390,height:844,size:80,top:100});
 assert.ok(p.minX>=80/2+12&&p.maxX<=390-80/2-12);
});

test('a perch avoids controls first, then covered text, then distance',()=>{
 const [p]=buildPlatforms([node('image',100,400,800)],view);
 const button={left:100,right:420,top:330,bottom:380};
 const text={left:420,right:640,top:330,bottom:380};
 const spot=choosePerchX(p,150,{controls:[button],covers:[button,text],size:96});
 assert.equal(spot.blocked,false);
 assert.equal(spot.cover,0);
 const box=bodyBox({x:spot.x,y:p.y},96);
 assert.ok(box.left>=640);
 // The surface he stands on is never counted as something he covers.
 const own=choosePerchX(p,300,{controls:[p.rect],covers:[p.rect],size:96});
 assert.equal(own.blocked,false);assert.equal(own.x,300);
});

test('platform choice prefers a requested perch, then somewhere new and near',()=>{
 const platforms=buildPlatforms([node('a',100,300,400),node('b',700,320,400),node('c',100,650,400)],view);
 const from={x:300,y:300};
 assert.equal(choosePlatform(platforms,{from,size:96}).platform.id,'a');
 assert.equal(choosePlatform(platforms,{from,size:96,avoid:['a']}).platform.id,'c');
 assert.equal(choosePlatform(platforms,{from,size:96,avoid:['a'],prefer:['b']}).platform.id,'b');
 assert.equal(choosePlatform([],{from,size:96}),null);
 const blocked=choosePlatform(platforms.slice(0,1),{from,size:96,controls:[{left:0,right:1280,top:200,bottom:299}]});
 assert.equal(blocked.blocked,true);
});

test('jumps land exactly and rise above both ends',()=>{
 const start=Object.freeze({x:100,y:500}),end=Object.freeze({x:700,y:300});
 assert.deepEqual(jumpPoint(start,end,0),start);
 assert.deepEqual(jumpPoint(start,end,1),end);
 assert.deepEqual(jumpPoint(start,end,Number.NaN),start);
 assert.ok(jumpPoint(start,end,.5).y<Math.min(start.y,end.y));
 assert.ok(jumpPoint(start,start,.5).y<start.y);
 for(const far of [0,200,5000]){const d=jumpDuration(start,{x:start.x+far,y:start.y});assert.ok(d>=380&&d<=1050);}
});

const senses=(extra={})=>({now:10000,platformId:'a',otherPlatforms:2,snoopy:{x:300,y:300},span:{minX:140,maxX:460},userIdleMs:1000,size:96,...extra});
const rested=agent=>({...agent,until:0});

test('he rests between actions instead of acting every frame',()=>{
 const agent={...createAgent(0),until:20000};
 assert.equal(decide(agent,senses(),()=>0).intent,null);
});

test('a lingering hover invites him over, even mid-rest; a glance does not',()=>{
 const agent={...createAgent(0),until:20000};
 const lingering=decide(agent,senses({hover:{id:'b',ms:AGENT_TIMING.hoverDwell}}),()=>.99);
 assert.deepEqual(lingering.intent,{type:'travel',to:'b',reason:'hover'});
 assert.equal(decide(agent,senses({hover:{id:'b',ms:200}}),()=>.99).intent,null);
 assert.equal(decide(agent,senses({hover:{id:'a',ms:5000}}),()=>.99).intent,null);
});

test('he greets a newly arrived cursor with a wave, then not again for a while',()=>{
 const agent=rested(createAgent(0));
 const first=decide(agent,senses({cursor:{x:200,y:260,ageMs:100}}),()=>.99);
 assert.deepEqual(first.intent,{type:'routine',name:'wave',facing:-1});
 assert.equal(first.agent.wavedAt,10000);
 const soon=decide(rested(first.agent),senses({now:20000,cursor:{x:200,y:260,ageMs:100}}),()=>.99);
 assert.notEqual(soon.intent.name,'wave');
 const later=decide(rested(first.agent),senses({now:10000+AGENT_TIMING.waveEvery,cursor:{x:200,y:260,ageMs:100}}),()=>.99);
 assert.equal(later.intent.name,'wave');
});

test('he walks toward a nearby moving cursor and stops short of it',()=>{
 const agent={...rested(createAgent(0)),wavedAt:10000};
 const {intent}=decide(agent,senses({cursor:{x:440,y:260,ageMs:100}}),()=>.99);
 assert.equal(intent.type,'walk');assert.equal(intent.reason,'cursor');
 assert.ok(intent.x>300&&intent.x<440);
 const close=decide(agent,senses({cursor:{x:330,y:260,ageMs:100}}),()=>.99).intent;
 assert.deepEqual(close,{type:'watch',facing:1});
 // A stale or distant pointer is not followed.
 const stale=decide({...agent,curiosity:0},senses({cursor:{x:440,y:260,ageMs:9000}}),()=>.99).intent;
 assert.notEqual(stale.reason,'cursor');assert.notEqual(stale.name,'wave');
 const far=decide({...agent,curiosity:0},senses({cursor:{x:440,y:790,ageMs:100}}),()=>.7).intent;
 assert.notEqual(far.reason,'cursor');
});

test('curiosity builds while he stands still and sends him exploring',()=>{
 let agent=rested(createAgent(0));
 for(let i=0;i<200;i++)agent=tickDrives(agent,.1);
 assert.equal(agent.curiosity,1);
 assert.equal(decide(agent,senses(),()=>.99).intent.type,'travel');
 assert.notEqual(decide(agent,senses({otherPlatforms:0}),()=>.99).intent.type,'travel');
 const after=rememberVisit(agent,'b');
 assert.equal(after.curiosity,0);assert.deepEqual(after.visited,['b']);
 assert.deepEqual(['a','b','c','b','d'].reduce(rememberVisit,agent).visited,['c','b','d']);
});

test('he naps when the visitor goes idle and wakes when they return',()=>{
 const agent=rested(createAgent(0));
 const asleep=decide(agent,senses({userIdleMs:AGENT_TIMING.napAfterIdle}),()=>.5);
 assert.equal(asleep.intent.type,'nap');assert.equal(asleep.agent.napping,true);
 assert.equal(decide(asleep.agent,senses({userIdleMs:60000}),()=>.5).intent,null);
 const awake=decide(asleep.agent,senses({userIdleMs:50}),()=>.5);
 assert.equal(awake.intent.type,'wake');assert.equal(awake.agent.napping,false);
 const tired=decide({...agent,energy:.1},senses({userIdleMs:AGENT_TIMING.tiredNapAfterIdle}),()=>.5);
 assert.equal(tired.intent.type,'nap');
 let resting={...agent,energy:.1};
 for(let i=0;i<100;i++)resting=tickDrives(resting,.1,{napping:true});
 assert.ok(resting.energy>.9);
});

test('strolls stay on his platform and drives stay bounded',()=>{
 const agent={...rested(createAgent(0)),curiosity:0};
 for(const r of [0,.2,.4,.59]){
  const {intent}=decide(agent,senses(),()=>r);
  if(intent.type==='walk'){assert.ok(intent.x>=140&&intent.x<=460);assert.ok(intent.speed>=60&&intent.speed<=180);}
 }
 let drained=agent;
 for(let i=0;i<5000;i++)drained=tickDrives(drained,.25,{moving:true});
 assert.equal(drained.energy,0);
 assert.equal(tickDrives(agent,Number.NaN).energy,agent.energy);
});

test('idle choices draw on several routines and match his mood',()=>{
 assert.equal(moodFor(.1),'tired');assert.equal(moodFor(.5),'calm');assert.equal(moodFor(.9),'playful');
 for(const table of Object.values(MOODS))for(const name of Object.keys(table))assert.ok(ROUTINE_NAMES.includes(name),name);
 const seen=new Set();
 for(let i=0;i<40;i++)seen.add(pickRoutine(.9,[],()=>i/40));
 assert.ok(seen.size>=5,[...seen].join());
 // Tired, he settles down rather than cheering.
 for(let i=0;i<40;i++)assert.ok(!['cheer','chaseTail','playBow'].includes(pickRoutine(.1,[],()=>i/40)));
});

test('he does not repeat either of his last two routines',()=>{
 for(let i=0;i<50;i++){
  const name=pickRoutine(.9,['cheer','playBow'],()=>i/50);
  assert.ok(!['cheer','playBow'].includes(name),name);
 }
 // Even with every option recently used, he still picks something.
 assert.ok(pickRoutine(.1,['lieDown','sit','lookAround','sniff']));
 const agent={...rested(createAgent(0)),curiosity:0};
 const {agent:next,intent}=decide(agent,senses(),()=>.75);
 assert.equal(intent.type,'routine');
 assert.equal(next.recent.at(-1),intent.name);
 assert.equal(next.until,Infinity);
});

test('every routine uses real awake poses and ends where it began',()=>{
 const steps=[0,.25,.5,.75,.99];
 for(const name of ROUTINE_NAMES)for(const r of steps){
  const plan=planRoutine(name,()=>r);
  assert.ok(plan.duration>=300&&plan.duration<=9000,`${name} ${plan.duration}`);
  for(const step of plan.steps){
   if(step.pose.kind==='wake')assert.ok(step.pose.frame>=3&&step.pose.frame<=15,`${name} frame ${step.pose.frame}`);
   if(step.pose.kind==='action')assert.ok(['swing','ladder','camera','portal'].includes(step.pose.action));
   if(step.pose.kind==='walk')assert.ok(step.pose.frame>=0&&step.pose.frame<8);
  }
  const end=sampleRoutine(plan,plan.duration);
  assert.equal(end.done,true);
  // Lift and squash return to rest, so he never stops mid-air or squashed.
  assert.ok(Math.abs(end.lift)<.01);assert.ok(Math.abs(end.squash[0]-1)<.01&&Math.abs(end.squash[1]-1)<.01);
 }
 assert.equal(planRoutine('nope'),null);
 assert.equal(sampleRoutine(null,0),null);
});

test('the same routine plays differently each time',()=>{
 let seed=1;const random=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(const name of ['sit','lieDown','lookAround','cheer','chaseTail']){
  const shapes=new Set();
  for(let i=0;i<8;i++){const plan=planRoutine(name,random);shapes.add(plan.steps.map(s=>`${s.pose.frame??s.pose.action}:${s.ms}`).join(','));}
  assert.ok(shapes.size>=3,`${name} only had ${shapes.size} variants`);
 }
});

test('sampling follows steps, flips and arcs',()=>{
 const plan=planRoutine('lookAround',()=>.99);
 const first=sampleRoutine(plan,0);
 assert.equal(first.index,0);assert.equal(first.flips,0);
 const last=sampleRoutine(plan,plan.duration-1);
 assert.equal(last.flips,plan.steps.filter(s=>s.flip).length);
 const cheer=planRoutine('cheer',()=>.5),leap=cheer.steps.find(s=>s.lift);
 assert.ok(sampleRoutine(cheer,leap.start+leap.ms/2).lift>10);
 assert.equal(sampleRoutine(cheer,Number.NaN).index,0);
});

test('jumps crouch first, fly, then land',()=>{
 assert.equal(jumpPhase(0,500).phase,'crouch');
 assert.equal(jumpPhase(JUMP_CROUCH+250,500).phase,'air');
 assert.ok(Math.abs(jumpPhase(JUMP_CROUCH+250,500).progress-.5)<1e-9);
 assert.equal(jumpPhase(JUMP_CROUCH+500,500).phase,'land');
 assert.ok(POSES.sit.every(f=>f>=3));
});

import {flingStep,findDropTarget,GRAVITY} from '../src/snoopyTerrain.js';
import {tailWag,clampJoints,LIMITS,TAIL_SHAPE,TAIL_ROOT,NECK,HEAD_BAND} from '../src/snoopyArticulation.js';

const fly=(state,opts,steps=400)=>{let s=state;for(let i=0;i<steps&&!s.landed;i++)s=flingStep(s,1/60,opts);return s;};
const world={width:1280,height:800,size:96,top:64};

test('a thrown Snoopy lands on the first surface he falls through',()=>{
 const platforms=buildPlatforms([node('high',100,300,500),node('low',100,600,500)],world);
 const landed=fly({x:300,y:150,vx:0,vy:0},{...world,platforms});
 assert.equal(landed.landed.id,'high');assert.equal(landed.y,300);
 // Thrown upward, he still comes down onto the same surface.
 const tossed=fly({x:300,y:250,vx:0,vy:-900},{...world,platforms});
 assert.equal(tossed.landed.id,'high');
 // Starting below a surface, he passes it and lands on the next one down.
 assert.equal(fly({x:300,y:400,vx:0,vy:0},{...world,platforms}).landed.id,'low');
});

test('he bounces off walls and the floor, then settles',()=>{
 const s=fly({x:1100,y:300,vx:2400,vy:0},{...world,platforms:[]},2000);
 assert.equal(s.landed,'floor');
 assert.ok(s.y<=world.height&&s.x>=world.size/2&&s.x<=world.width-world.size/2);
 const first=flingStep({x:1240,y:300,vx:2400,vy:0},1/60,{...world,platforms:[]});
 assert.ok(first.vx<0,'bounced off the right wall');
 const bonk=flingStep({x:400,y:170,vx:0,vy:-2000},1/60,{...world,platforms:[]});
 assert.ok(bonk.vy>0&&bonk.y>=world.top+world.size,'bonked the header');
 assert.ok(GRAVITY>1000);
 const still=flingStep({x:400,y:300,vx:0,vy:0},Number.NaN,{...world,platforms:[]});
 assert.equal(still.x,400);assert.equal(still.y,300);
});

test('he finds a lower ledge to drop onto, but not past the screen edge',()=>{
 const [top,below,far]=buildPlatforms([node('top',300,300,300),node('below',550,520,400),node('far',300,780,10)],world);
 const drop=findDropTarget([top,below],top,{size:96,width:1280});
 assert.equal(drop.platform.id,'below');assert.equal(drop.side,1);assert.equal(drop.edgeX,top.maxX);
 assert.equal(findDropTarget([top],top,{size:96,width:1280}),null);
 assert.equal(findDropTarget([top,below],null,{size:96,width:1280}),null);
 // A surface running off the screen has no real ledge on that side.
 const [wide]=buildPlatforms([node('wide',0,300,1280)],world);
 const [under]=buildPlatforms([node('under',900,520,300)],world);
 assert.equal(findDropTarget([wide,under],wide,{size:96,width:1280}),null);
});

test('head and tail move only within believable limits',()=>{
 for(let ms=0;ms<3000;ms+=37){const w=tailWag(ms,{speed:1.6,amplitude:30});assert.ok(Math.abs(w)<=LIMITS.tail);}
 assert.deepEqual(clampJoints({head:50,tail:-50}),{head:LIMITS.head,tail:-LIMITS.tail});
 assert.deepEqual(clampJoints({head:Number.NaN}),{head:0,tail:0});
 assert.ok(TAIL_SHAPE.every(([x,y])=>y>HEAD_BAND&&x<NECK.x));
 assert.ok(TAIL_ROOT.y>HEAD_BAND);
});

test('new routines tilt the head, wag the tail and show emotes',()=>{
 const curious=planRoutine('curious',()=>.2);
 const tilted=curious.steps.find(s=>s.head);
 assert.ok(Math.abs(sampleRoutine(curious,tilted.start+300).head)>5);
 assert.equal(sampleRoutine(curious,tilted.start+1).emote,'?');
 const wag=planRoutine('happyWag',()=>.5),tails=new Set();
 for(let t=0;t<wag.duration;t+=40)tails.add(Math.round(sampleRoutine(wag,t).tail));
 assert.ok(tails.size>5);
 // Moving parts only apply to the standing pose they were cut from.
 for(const name of ROUTINE_NAMES){const plan=planRoutine(name,()=>.5);for(let t=0;t<plan.duration;t+=50){const s=sampleRoutine(plan,t);if(s.pose.kind!=='stand'){assert.equal(s.head,0);assert.equal(s.tail,0);}}}
 assert.ok(ROUTINE_NAMES.includes('peek'));
});

test('a falling Snoopy is caught by a surface the page scrolls up into him',()=>{
 // The surface starts below him and rises 30px a frame, faster than he falls.
 let s={x:300,y:300,vx:0,vy:0},surfaceY=420,landed=null;
 for(let i=0;i<40&&!landed;i++){
  surfaceY-=30;
  const [pl]=buildPlatforms([node('rising',100,surfaceY,500)],world);
  s=flingStep(s,1/60,{...world,platforms:pl?[pl]:[],shift:30});
  landed=s.landed;
 }
 assert.equal(landed?.id,'rising');
 // Without accounting for the scroll, the same surface slips past him.
 s={x:300,y:300,vx:0,vy:0};surfaceY=420;landed=null;
 for(let i=0;i<40&&!landed;i++){surfaceY-=30;const [pl]=buildPlatforms([node('rising',100,surfaceY,500)],world);s=flingStep(s,1/60,{...world,platforms:pl?[pl]:[]});landed=s.landed;}
 assert.notEqual(landed?.id,'rising');
});
