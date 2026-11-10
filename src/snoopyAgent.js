// Snoopy's own mind: two slow drives and a small priority list. It only reads
// what the page tells it (cursor, hover, idle time, where he stands) and
// returns one intent at a time. This is authored local behavior, not an LLM.

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

export const AGENT_TIMING=Object.freeze({
 hoverDwell:900,     // how long a project is hovered before he walks over
 cursorFresh:4000,   // a pointer that has not moved for this long is ignored
 napAfterIdle:45000, // nobody has touched the page
 tiredNapAfterIdle:20000,
 wakeWithin:400,
});

export function createAgent(now=0){
 return {energy:1,curiosity:.3,napping:false,until:now+1400,visited:[]};
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
 const {now,platformId,otherPlatforms=0,cursor=null,snoopy,span,userIdleMs=0,hover=null,size=96}=senses;
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
  const dx=cursor.x-snoopy.x;
  if(Math.abs(dx)>size*.95){
   const x=clamp(cursor.x-Math.sign(dx)*size*.75,span.minX,span.maxX);
   if(Math.abs(x-snoopy.x)>6)return {agent:settle(agent,now,700),intent:{type:'walk',x,reason:'cursor'}};
  }
  return {agent:settle(agent,now,1200),intent:{type:'watch',facing:dx<0?-1:1}};
 }
 const roll=random();
 if(otherPlatforms>0&&(agent.curiosity>=1||roll<agent.curiosity*.45))
  return {agent:settle(agent,now,2200),intent:{type:'travel',reason:'curious'}};
 if(roll<.6&&span.maxX-span.minX>size*.5){
  const x=span.minX+(span.maxX-span.minX)*random();
  if(Math.abs(x-snoopy.x)>size*.3)return {agent:settle(agent,now,1600+random()*2200),intent:{type:'walk',x,reason:'stroll'}};
 }
 if(roll>.86&&agent.energy>.4)return {agent:settle(agent,now,1800),intent:{type:'hop'}};
 return {agent:settle(agent,now,1400+random()*1800),intent:{type:'watch',facing:random()<.5?-1:1}};
}
