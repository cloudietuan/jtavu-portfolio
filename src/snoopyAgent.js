// Snoopy's own mind: two slow drives and a small priority list. It only reads
// what the page tells it (cursor, hover, idle time, where he stands) and
// returns one intent at a time. This is authored local behavior, not an LLM.

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Which routines suit his mood. Tired he settles down; rested he plays.
export const MOODS=Object.freeze({
 tired:{lieDown:4,sit:3,lookAround:2,sniff:1,stretch:3,catNap:4},
 calm:{sit:3,lookAround:2,sniff:2,curious:3,happyWag:2,lieDown:1,playBow:1,nod:2,stretch:2,headShake:1,catNap:1,doubleTake:1},
 // The default: a well-mannered host. He settles, watches and looks around.
 host:{sit:4,lieDown:3,lookAround:3,curious:3,happyWag:1,sniff:1,nod:2,stretch:2,catNap:2},
 playful:{cheer:3,playBow:3,chaseTail:2,happyWag:3,curious:2,sniff:1,lookAround:1,sit:1,dance:4,spin:3,nod:1,headShake:1,stretch:1,doubleTake:3},
});
export const moodFor=energy=>energy<.35?'tired':energy<.7?'calm':'playful';

/** Weighted choice that skips the last two routines, so he rarely repeats himself. */
export function pickRoutine(energy,recent=[],random=Math.random,calm=false){
 const table=calm?MOODS.host:MOODS[moodFor(energy)];
 let entries=Object.entries(table).filter(([name])=>!recent.slice(-2).includes(name));
 if(!entries.length)entries=Object.entries(table);
 const total=entries.reduce((sum,[,w])=>sum+w,0);
 let roll=random()*total;
 for(const [name,w] of entries){roll-=w;if(roll<0)return name;}
 return entries[entries.length-1][0];
}
const remember=(agent,name)=>({...agent,recent:[...(agent.recent||[]),name].slice(-4)});

export const AGENT_TIMING=Object.freeze({
 hoverDwell:900,     // how long a project is hovered before he walks over
 cursorFresh:4000,   // a pointer that has not moved for this long is ignored
 napAfterIdle:45000, // nobody has touched the page
 tiredNapAfterIdle:20000,
 waveEvery:25000,    // he greets a newly arrived cursor, but not constantly
 wakeWithin:400,
});

export function createAgent(now=0){
 return {energy:1,curiosity:.3,napping:false,until:now+1400,visited:[],recent:[],wavedAt:-Infinity};
}

/** Drives drift with time: moving tires him, standing still makes him curious. */
export function tickDrives(agent,dt,{moving=false,napping=false}={}){
 const seconds=clamp(Number.isFinite(dt)?dt:0,0,.25);
 return {...agent,
  energy:clamp(agent.energy+seconds*(napping?.1:moving?-.02:-.004),0,1),
  curiosity:clamp(agent.curiosity+seconds*(napping?0:.06),0,1)};
}

/** After acting he pauses, so he reads as deliberate rather than twitchy. */
export function settle(agent,now,restMs){return {...agent,until:now+restMs};}

export function rememberVisit(agent,id){
 return {...agent,curiosity:0,visited:[...agent.visited.filter(v=>v!==id),id].slice(-3)};
}

/**
 * Decide what to do next. Returns {agent, intent}; intent is null while he is
 * busy or resting. `random` is injected so the choice is testable.
 */
export function decide(agent,senses,random=Math.random){
 const {now,platformId,otherPlatforms=0,cursor=null,snoopy,span,userIdleMs=0,hover=null,size=96,calm=false}=senses;
 // Calm, he rests three times as long between actions.
 const pace=calm?3:1;
 if(agent.napping){
  if(userIdleMs<AGENT_TIMING.wakeWithin)return {agent:{...agent,napping:false,until:now+900},intent:{type:'wake'}};
  return {agent,intent:null};
 }
 // A visitor lingering on a project is the clearest invitation he gets.
 if(hover&&hover.id!==platformId&&hover.ms>=AGENT_TIMING.hoverDwell)
  return {agent:settle(agent,now,2600),intent:{type:'travel',to:hover.id,reason:'hover'}};
 if(now<agent.until)return {agent,intent:null};
 if(userIdleMs>=AGENT_TIMING.napAfterIdle||(agent.energy<.25&&userIdleMs>=AGENT_TIMING.tiredNapAfterIdle))
  return {agent:{...agent,napping:true},intent:{type:'nap'}};
 const cursorNear=cursor&&cursor.ageMs<AGENT_TIMING.cursorFresh&&Math.abs(cursor.y-(snoopy.y-size/2))<220;
 if(cursorNear){
  const dx=cursor.x-snoopy.x,facing=dx<0?-1:1;
  if(now-(agent.wavedAt??-Infinity)>=AGENT_TIMING.waveEvery)
   return {agent:{...remember(agent,'wave'),wavedAt:now,until:Infinity},intent:{type:'routine',name:'wave',facing}};
  if(Math.abs(dx)>size*.95){
   const x=clamp(cursor.x-Math.sign(dx)*size*.75,span.minX,span.maxX);
   if(!calm&&Math.abs(x-snoopy.x)>6)return {agent:settle(agent,now,700),intent:{type:'walk',x,reason:'cursor'}};
  }
  if(!calm&&random()<.2&&agent.energy>.5)return {agent:{...remember(agent,'playBow'),until:Infinity},intent:{type:'routine',name:'playBow',facing}};
  return {agent:settle(agent,now,1200*pace),intent:{type:'watch',facing}};
 }
 const roll=random();
 if(otherPlatforms>0&&(calm?agent.curiosity>=1&&roll<.25:agent.curiosity>=1||roll<agent.curiosity*.45))
  return {agent:settle(agent,now,2200*pace),intent:{type:'travel',reason:'curious'}};
 if(roll<(calm?.18:.4)&&span.maxX-span.minX>size*.5){
  const x=span.minX+(span.maxX-span.minX)*random();
  // Walking pace varies with mood: a sniffing amble, a walk, or a trot.
  const trot=!calm&&agent.energy>.6&&random()<.35,speed=trot?175:moodFor(agent.energy)==='tired'?65:85+random()*35;
  if(Math.abs(x-snoopy.x)>size*.3)return {agent:settle(agent,now,1200+random()*1600),intent:{type:'walk',x,speed:calm?Math.min(speed,80):speed,reason:trot?'trot':'stroll'}};
 }
 // Between quiet routines the host simply stands and watches for a while.
 if(calm&&roll>.55)return {agent:settle(agent,now,3500+random()*4000),intent:{type:'watch',facing:random()<.5?-1:1}};
 if(!calm&&roll>.92&&agent.energy>.4)return {agent:settle(agent,now,1800),intent:{type:'hop'}};
 const name=pickRoutine(agent.energy,agent.recent,random,calm);
 // `until` stays open while the routine plays; the page settles him afterwards.
 return {agent:{...remember(agent,name),until:Infinity},intent:{type:'routine',name}};
}
