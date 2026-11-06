import {clampPoint,isClear} from './snoopySafety.js';

export function clearTravel(from,to,obstacles,size){
 const steps=Math.max(2,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/8));
 return Array.from({length:steps+1},(_,i)=>({x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps})).every(p=>isClear(p,obstacles,size));
}

// Authored verbs keep the portfolio's content intact: inspect a project or play
// with an existing prop. Rectangles are snapshots; callers refresh before use.
export function worldLandmarks(nodes,width,height){
 return nodes.filter(n=>n.rect.width>0&&n.rect.height>0&&n.rect.bottom>height*.15&&n.rect.top<height-32&&n.rect.right>0&&n.rect.left<width)
  .map(n=>({...n,verbs:n.kind==='ball'?['inspect','ball']:['inspect','camera']}));
}
export function findWorldTarget(landmarks,{verb='inspect',width,height,size,obstacles,position,index=0}){
 const available=landmarks.filter(n=>n.verbs.includes(verb));
 for(let i=0;i<available.length;i++){
  const subject=available[(index+i)%available.length],b=subject.rect;
  if(verb==='camera'&&isClear(position,obstacles,size))return {subject,point:{...position}};
  const ys=[Math.max(size+50,Math.min(height-20,b.top+size)),Math.max(size+50,b.top+size-14),Math.min(height-20,b.bottom),Math.min(height-20,(b.top+b.bottom+size)/2)];
  const xs=[b.left-size/2-20,b.right+size/2+20];
  const edgeCandidates=xs.flatMap(x=>ys.map(y=>({x,y})));
  const centers=[(b.left+b.right)/2,position.x,width*.75];
  const candidates=[...edgeCandidates,...centers.flatMap(x=>[{x,y:b.top-18},{x,y:b.bottom+size+18}])].filter(p=>{
   const clamped=clampPoint(p,width,height,size);
   // Don't silently relocate a perch into the target when a margin is narrow.
   return Math.abs(clamped.x-p.x)<1&&Math.abs(clamped.y-p.y)<1&&isClear(p,obstacles,size);
  }).sort((a,c)=>Math.hypot(a.x-position.x,a.y-position.y)-Math.hypot(c.x-position.x,c.y-position.y));
  if(candidates.length)return {subject,point:candidates[0]};
  // A camera can observe from an existing clear spot when a wide story has no
  // adjacent margin. Contact actions such as the ball still need a real perch.
  if(verb!=='ball'&&isClear(position,obstacles,size))return {subject,point:{...position}};
 }
 return null;
}
