// Moving parts cut from the original standing cel (walk frame 2): the head
// tilts at the collar and the tail wags from its root. Only existing pixels are
// moved; nothing is redrawn. Coordinates are in that frame's own pixels.
export const HEAD_BAND=212;
export const NECK=Object.freeze({x:150,y:208});
export const TAIL_ROOT=Object.freeze({x:100,y:318});
export const TAIL_SHAPE=Object.freeze([[44,290],[52,281],[72,281],[84,296],[98,302],[106,316],[103,332],[92,343],[70,344],[52,332],[43,316]]);
export const LIMITS=Object.freeze({head:12,tail:18});

const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:0));
export const clampJoints=({head=0,tail=0}={})=>({head:clamp(head,-LIMITS.head,LIMITS.head),tail:clamp(tail,-LIMITS.tail,LIMITS.tail)});

/** A wag that eases in and out of each swing. */
export function tailWag(ms,{speed=1,amplitude=10}={}){
 return clamp(Math.sin(ms/1000*Math.PI*2*2.2*speed)*amplitude,-LIMITS.tail,LIMITS.tail);
}

function tailPath(ctx){ctx.beginPath();TAIL_SHAPE.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}

export function drawArticulated(ctx,texture,f,joints){
 const {head,tail}=clampJoints(joints),r=Math.PI/180;
 const all=()=>ctx.drawImage(texture,f.x,f.y,f.w,f.h,0,0,f.w,f.h);
 // Body: everything below the head band, minus the tail.
 ctx.save();ctx.beginPath();ctx.rect(0,HEAD_BAND,f.w,f.h-HEAD_BAND);
 TAIL_SHAPE.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
 ctx.clip('evenodd');all();ctx.restore();
 // Tail swings from its root; an unrotated root patch hides the seam.
 ctx.save();ctx.translate(TAIL_ROOT.x,TAIL_ROOT.y);ctx.rotate(tail*r);ctx.translate(-TAIL_ROOT.x,-TAIL_ROOT.y);tailPath(ctx);ctx.clip();all();ctx.restore();
 ctx.save();tailPath(ctx);ctx.clip();ctx.beginPath();ctx.arc(TAIL_ROOT.x,TAIL_ROOT.y,9,0,Math.PI*2);ctx.clip();all();ctx.restore();
 // Head tilts at the collar and overlaps it slightly, so no gap opens.
 ctx.save();ctx.translate(NECK.x,NECK.y);ctx.rotate(head*r);ctx.translate(-NECK.x,-NECK.y);ctx.beginPath();ctx.rect(0,0,f.w,HEAD_BAND+4);ctx.clip();all();ctx.restore();
}
