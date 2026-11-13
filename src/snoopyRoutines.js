// Short authored performances built only from the existing sprite sheets.
// Each routine is a list of timed poses with a little procedural motion
// (lean, lift, squash) layered on top. Holds and pose variants are chosen at
// random when a routine is planned, so the same routine never plays the same
// way twice. Pure: no DOM, no timers.

import {tailWag} from './snoopyArticulation.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Wake-sheet frames that read well while awake. 0-2 are drawn from the sleep
// sheet, so routines never use them.
export const POSES=Object.freeze({
 lieWink:3,lieLook:4,lieAlert:5,playBow:6,crouch:7,sitLow:8,sitUp:9,
 sit:[12,13,14],sitSmile:[11,15],
});

const stand={kind:'stand',frame:2};
const wake=frame=>({kind:'wake',frame});
const act=action=>({kind:'action',action});
const between=(random,a,b)=>a+(b-a)*random();
const pick=(random,list)=>list[Math.min(list.length-1,Math.floor(random()*list.length))];

// Each builder returns steps: {ms, pose, lean?, lift?, squash?, flip?, head?, wag?, emote?}.
// head and wag only show on the standing pose, whose head and tail can move.
const BUILDERS={
 sit(random){
  const steps=[{ms:130,pose:wake(POSES.crouch)},{ms:130,pose:wake(POSES.sitUp)},{ms:between(random,1200,2300),pose:wake(pick(random,POSES.sit))}];
  if(random()<.6)steps.push({ms:between(random,700,1300),pose:wake(pick(random,POSES.sit)),flip:true});
  steps.push({ms:between(random,600,1000),pose:wake(pick(random,POSES.sitSmile))},{ms:130,pose:wake(POSES.sitUp)},{ms:130,pose:wake(POSES.crouch)});
  return steps;
 },
 lieDown(random){
  const steps=[{ms:150,pose:wake(POSES.crouch)},{ms:200,pose:wake(POSES.playBow)},{ms:between(random,1400,2600),pose:wake(POSES.lieAlert)},{ms:between(random,700,1200),pose:wake(POSES.lieLook)}];
  if(random()<.7)steps.push({ms:380,pose:wake(POSES.lieWink),emote:'♥'},{ms:between(random,600,1300),pose:wake(POSES.lieLook)});
  steps.push({ms:200,pose:wake(POSES.playBow)},{ms:150,pose:wake(POSES.crouch)});
  return steps;
 },
 // Lies down, eyes droop, dozes off for a moment, blinks awake and gets up.
 // Uses the wake sheet's own sleeping frames, the same style as standing.
 catNap(random){
  const steps=[{ms:140,pose:wake(POSES.crouch)},{ms:180,pose:wake(POSES.playBow)},{ms:220,pose:wake(POSES.lieAlert)},{ms:between(random,500,800),pose:wake(POSES.lieLook)},
   {ms:260,pose:wake(2)},{ms:260,pose:wake(1)},{ms:between(random,1400,2400),pose:wake(0),emote:'z'},{ms:220,pose:wake(1)},{ms:160,pose:wake(0)},{ms:240,pose:wake(1)},{ms:280,pose:wake(2),emote:'!'},
   {ms:180,pose:wake(POSES.lieAlert)},{ms:160,pose:wake(POSES.playBow)},{ms:130,pose:wake(POSES.crouch)}];
  return steps;
 },
 // Glances away, then snaps back twice: a cartoon double take.
 doubleTake(random){
  return [{ms:between(random,300,500),pose:stand,head:-6},{ms:140,pose:stand,flip:true,head:8,squash:[.94,1.08]},{ms:220,pose:stand,flip:true,head:-10,squash:[1.08,.92],lift:6,emote:'!'},
   {ms:between(random,500,800),pose:stand,head:-4},{ms:between(random,500,900),pose:wake(pick(random,POSES.sitSmile))}];
 },
 lookAround(random){
  const steps=[{ms:between(random,250,450),pose:stand}];
  const turns=1+Math.floor(random()*3);
  for(let i=0;i<turns;i++)steps.push({ms:between(random,500,1000),pose:stand,flip:true,head:pick(random,[-9,-5,6,10])});
  if(random()<.4)steps.push({ms:between(random,700,1100),pose:wake(pick(random,POSES.sit))});
  return steps;
 },
 sniff(random){
  const steps=[];
  const sniffs=2+Math.floor(random()*2);
  for(let i=0;i<sniffs;i++)steps.push({ms:between(random,280,420),pose:stand,lean:6+random()*4,head:11},{ms:between(random,160,260),pose:stand,lean:3,head:6});
  if(random()<.5)steps.push({ms:600,pose:stand,flip:true});
  return steps;
 },
 wave(random){
  const steps=[{ms:120,pose:act('portal'),squash:[1.05,.92],emote:'hi!'}];
  const beats=3+Math.floor(random()*2);
  for(let i=0;i<beats;i++)steps.push({ms:180,pose:act('ladder'),lean:i%2?-6:6,lift:4});
  steps.push({ms:between(random,300,500),pose:wake(pick(random,POSES.sitSmile))});
  return steps;
 },
 cheer(random){
  const hops=2+Math.floor(random()*2),steps=[];
  for(let i=0;i<hops;i++)steps.push({ms:150,pose:act('portal'),squash:[1.08,.9],emote:i?undefined:'♪'},{ms:between(random,260,340),pose:act('swing'),lift:14+random()*10});
  steps.push({ms:160,pose:act('portal'),squash:[1.06,.92]},{ms:200,pose:stand});
  return steps;
 },
 playBow(random){
  return [{ms:between(random,500,900),pose:wake(POSES.playBow),lean:-3,emote:'!'},{ms:140,pose:act('portal'),squash:[1.07,.9]},{ms:300,pose:act('swing'),lift:18},{ms:150,pose:act('portal'),squash:[1.05,.93]},{ms:200,pose:stand}];
 },
 curious(random){
  const first=random()<.5?1:-1;
  return [{ms:200,pose:stand},{ms:between(random,550,900),pose:stand,head:10*first,emote:'?'},{ms:between(random,500,850),pose:stand,head:-9*first},{ms:between(random,300,500),pose:stand,head:5*first},{ms:180,pose:stand}];
 },
 happyWag(random){
  return [{ms:between(random,1200,2000),pose:stand,head:-4,wag:{speed:1.6,amplitude:15},emote:'♪'},{ms:between(random,500,800),pose:stand,wag:{speed:.8,amplitude:8}}];
 },
 // Looking over a ledge before stepping off it.
 peek(random){
  return [{ms:between(random,650,1000),pose:stand,lean:7,head:11,emote:'?'},{ms:350,pose:stand,lean:10,head:12,wag:{speed:1.2,amplitude:6}}];
 },
 // Head-only acting on the standing pose.
 nod(random){
  const steps=[{ms:200,pose:stand}],nods=2+Math.floor(random()*2);
  for(let i=0;i<nods;i++)steps.push({ms:190,pose:stand,head:11,lean:2},{ms:190,pose:stand,head:-5});
  steps.push({ms:between(random,300,500),pose:stand,wag:{speed:1.2,amplitude:10}});
  return steps;
 },
 headShake(random){
  const steps=[{ms:180,pose:stand,emote:'?'}],shakes=3+Math.floor(random()*2);
  for(let i=0;i<shakes;i++)steps.push({ms:120,pose:stand,flip:true,head:i%2?6:-6});
  if(shakes%2)steps.push({ms:120,pose:stand,flip:true});
  steps.push({ms:between(random,300,500),pose:stand,head:-6});
  return steps;
 },
 // A little two-step: lean and hop from side to side.
 dance(random){
  const beats=4+Math.floor(random()*3)*2,steps=[];
  for(let i=0;i<beats;i++)steps.push({ms:230,pose:i%2?act('ladder'):stand,lean:i%2?9:-9,lift:i%2?10:5,head:i%2?0:-8,wag:{speed:2,amplitude:14},emote:i===0?'♪':undefined,flip:i>0&&i%4===0});
  if(steps.filter(s=>s.flip).length%2)steps.push({ms:120,pose:stand,flip:true});
  steps.push({ms:160,pose:act('portal'),squash:[1.07,.9]},{ms:between(random,400,700),pose:wake(pick(random,POSES.sitSmile))});
  return steps;
 },
 // A long stretch after standing still: front down, then up tall.
 stretch(random){
  return [{ms:between(random,700,1100),pose:wake(POSES.playBow),lean:-5,squash:[1.06,.94]},{ms:260,pose:wake(POSES.crouch)},{ms:between(random,500,800),pose:stand,head:-10,squash:[.95,1.08],lift:3},{ms:300,pose:stand,wag:{speed:1.5,amplitude:12}}];
 },
 // A quick spin on the spot.
 spin(random){
  const turns=4+Math.floor(random()*2)*2,steps=[{ms:140,pose:act('portal'),squash:[1.06,.9]}];
  for(let i=0;i<turns;i++)steps.push({ms:95,pose:{kind:'walk',frame:(i*2)%8},flip:true,lift:12});
  steps.push({ms:150,pose:act('portal'),squash:[1.1,.86],emote:'!'},{ms:300,pose:stand});
  return steps;
 },
 chaseTail(random){
  const spins=5+Math.floor(random()*4),steps=[];
  for(let i=0;i<spins;i++)steps.push({ms:110,pose:{kind:'walk',frame:(i*3)%8},flip:true,lift:i%2?6:2});
  steps.push({ms:160,pose:act('portal'),squash:[1.06,.92]},{ms:between(random,500,800),pose:wake(pick(random,POSES.sit))});
  return steps;
 },
};

export const ROUTINE_NAMES=Object.freeze(Object.keys(BUILDERS));

export function planRoutine(name,random=Math.random){
 const build=BUILDERS[name];
 if(!build)return null;
 let at=0;
 const steps=build(random).map(step=>{const out={...step,start:at,ms:Math.max(1,Math.round(step.ms))};at+=out.ms;return out;});
 return {name,steps,duration:at};
}

/**
 * Pose at `elapsed` ms. `flips` counts direction changes so far; `local` is
 * progress through the current step, used for arcs and squash easing.
 */
export function sampleRoutine(plan,elapsed){
 if(!plan||!plan.steps.length)return null;
 const t=clamp(Number.isFinite(elapsed)?elapsed:0,0,plan.duration);
 let index=plan.steps.findIndex(step=>t<step.start+step.ms);
 if(index<0)index=plan.steps.length-1;
 const step=plan.steps[index];
 const flips=plan.steps.slice(0,index+1).filter(s=>s.flip).length;
 const local=clamp((t-step.start)/step.ms,0,1);
 const arc=Math.sin(local*Math.PI);
 // The head eases between tilts instead of snapping.
 const prev=index?plan.steps[index-1].head||0:0,cur=step.head||0;
 const head=prev+(cur-prev)*clamp((t-step.start)/120,0,1);
 return {
  pose:step.pose,flips,index,done:elapsed>=plan.duration,emote:step.emote||null,
  head:step.pose.kind==='stand'?head:0,
  tail:step.pose.kind==='stand'&&step.wag?tailWag(t,step.wag):0,
  lean:step.lean||0,
  lift:(step.lift||0)*arc,
  squash:step.squash?[1+(step.squash[0]-1)*arc,1+(step.squash[1]-1)*arc]:[1,1],
 };
}

/** Jumps get anticipation and a landing crouch around the flight arc. */
export const JUMP_CROUCH=150,JUMP_LAND=150;
export function jumpPhase(elapsed,flight){
 if(elapsed<JUMP_CROUCH)return {phase:'crouch',progress:elapsed/JUMP_CROUCH};
 if(elapsed<JUMP_CROUCH+flight)return {phase:'air',progress:(elapsed-JUMP_CROUCH)/flight};
 return {phase:'land',progress:1};
}
