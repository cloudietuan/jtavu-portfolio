import {clampPoint,isClear} from './snoopySafety.js';
import {clearTravel} from './snoopyWorld.js';

const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const ease=t=>t*t*(3-2*t);
export function planCharacterMove(kind,start,width,height,size,obstacles){
 const plan={kind,start:{...start},end:{...start},height:0};
 if(kind==='hop'){
  plan.height=[48,32,18,8].find(h=>Array.from({length:17},(_,i)=>({x:start.x,y:start.y-h*i/16})).every(p=>p.y>=size+50&&isClear(p,obstacles,size)))||0;
 }
 if(kind==='dash'){
  for(const d of [128,-128,80,-80,40,-40]){
   const end={x:start.x+d,y:start.y},bounds=clampPoint(end,width,height,size);
   if(bounds.x===end.x&&bounds.y===end.y&&clearTravel(start,end,obstacles,size)){plan.end=end;break;}
  }
 }
 return plan;
}
export function sampleCharacterMove(plan,beat,elapsed,facing=1){
 const {kind,start,end}=plan,t=beat.progress;
 let point={...start},transform=beat.transform,spriteAction,frame=2,walking=false,direction=facing;
 if(kind==='hop'){
  point.y-=Math.sin(t*Math.PI)*plan.height;
  if(beat.phase==='prepare'||beat.phase==='recover')spriteAction='portal';
  else{frame=t<.5?3:5;transform=`rotate(${Math.sin(t*Math.PI*2)*5}deg) scale(.96,1.04)`;}
 }
 if(kind==='dash'&&beat.phase==='act'){
  const outbound=t<.5,lap=outbound?t*2:(1-t)*2;
  point=mix(start,end,ease(lap));walking=true;frame=Math.floor(elapsed/68)%8;
  direction=(end.x>=start.x?1:-1)*(outbound?1:-1);
  const lean=Math.sin(t*Math.PI)*9*direction;
  transform=`rotate(${lean}deg) scale(1.02,.98)`;
 }
 if(kind==='bow')transform='none';

 return {point,transform,spriteAction,frame,walking,facing:direction};
}
