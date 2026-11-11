// The page as terrain. Snoopy stands on the top edge of real page elements
// instead of searching for empty space around them. Everything here is pure:
// callers pass rectangle snapshots and get plain numbers back.

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

/** Feet rest on `y`; the body occupies the square above it. */
export function bodyBox(point,size){
 return {left:point.x-size/2,right:point.x+size/2,top:point.y-size,bottom:point.y};
}

function overlapArea(box,rect){
 // A small inset keeps the surface he stands on from counting as covered.
 const w=Math.min(box.right,rect.right)-Math.max(box.left,rect.left);
 const h=Math.min(box.bottom-2,rect.bottom)-Math.max(box.top,rect.top);
 return w>0&&h>0?w*h:0;
}

/**
 * Turn element rectangles into platforms he can fully stand on right now.
 * `top` is the bottom edge of the sticky header, so he never hides beneath it.
 */
export function buildPlatforms(nodes,{width,height,size,top=0}){
 const edge=size/2+12;
 return nodes.flatMap(node=>{
  const b=node.rect;
  if(!(b.right-b.left>=size*.7))return [];
  if(b.top-size<top+4||b.top>height-6)return [];
  const minX=Math.max(b.left+size*.3,edge),maxX=Math.min(b.right-size*.3,width-edge);
  if(maxX<minX)return [];
  return [{...node,left:b.left,right:b.right,y:b.top,minX,maxX}];
 });
}

/** The spot on a platform that hides the least, closest to where he wants to be. */
export function choosePerchX(platform,preferredX,{covers=[],controls=[],size}){
 const xs=[clamp(preferredX,platform.minX,platform.maxX)];
 for(let x=platform.minX;x<=platform.maxX;x+=size/3)xs.push(x);
 xs.push(platform.maxX);
 let best=null;
 for(const x of xs){
  const box=bodyBox({x,y:platform.y},size);
  const blocked=controls.some(rect=>overlapArea(box,rect)>0);
  const cover=covers.reduce((sum,rect)=>sum+overlapArea(box,rect),0);
  const cost=(blocked?1e9:0)+cover+Math.abs(x-preferredX)*.01;
  if(!best||cost<best.cost)best={x,cover,blocked,cost};
 }
 return best;
}

/**
 * Pick the next perch. Lower score wins: stay off controls, hide little text,
 * prefer somewhere new, and do not cross the whole screen without a reason.
 */
export function choosePlatform(platforms,{from,size,covers=[],controls=[],avoid=[],prefer=[],jitter=()=>0}){
 let best=null;
 for(const platform of platforms){
  const spot=choosePerchX(platform,from.x,{covers,controls,size});
  const distance=Math.hypot(spot.x-from.x,platform.y-from.y);
  const score=(spot.blocked?50:0)+spot.cover/(size*size)*6+distance/600
   +(avoid.includes(platform.id)?1.5:0)-(prefer.includes(platform.id)?5:0)+jitter()*.5;
  if(!best||score<best.score)best={platform,x:spot.x,score,blocked:spot.blocked};
 }
 return best;
}

/** A jump always starts and lands exactly; the arc rises above both ends. */
export function jumpPoint(start,end,progress){
 const t=clamp(Number.isFinite(progress)?progress:0,0,1);
 if(t===0)return {...start};
 if(t===1)return {...end};
 const lift=clamp(40+Math.hypot(end.x-start.x,end.y-start.y)*.22,40,170);
 return {x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t-lift*4*t*(1-t)};
}

export function jumpDuration(start,end){
 return clamp(380+Math.hypot(end.x-start.x,end.y-start.y)*.85,380,1050);
}

// Ballistic flight after a throw, a drop, or stepping off an edge. He lands on
// the first surface he falls through, bounces off the screen sides, bonks the
// header, and settles on the bottom of the viewport if nothing catches him.
export const GRAVITY=2200;
// `shift` is how far the page scrolled this frame: surfaces moved up by that
// much, so his previous height is compared in the page's own frame.
export function flingStep(state,dt,{width,height,size,top=0,platforms=[],shift=0}){
 const step=clamp(Number.isFinite(dt)?dt:0,0,.05),edge=size/2+4;
 let {x,y,vx,vy,bounces=0,spin=0}=state;const prevY=y-(Number.isFinite(shift)?shift:0);
 vy+=GRAVITY*step;x+=vx*step;y+=vy*step;
 spin+=vx*step*.9;
 if(x<edge){x=edge;vx=Math.abs(vx)*.55;}
 if(x>width-edge){x=width-edge;vx=-Math.abs(vx)*.55;}
 if(y-size<top){y=top+size;vy=Math.abs(vy)*.25;}
 if(vy>0){
  const hit=platforms
   .filter(p=>prevY<=p.y+1&&y>=p.y&&x>=p.minX-size*.25&&x<=p.maxX+size*.25)
   .sort((a,b)=>a.y-b.y)[0];
  if(hit)return {x:clamp(x,hit.minX,hit.maxX),y:hit.y,vx,vy,bounces,spin,landed:hit};
 }
 const floor=height-6;
 if(y>floor){
  y=floor;
  if(vy>320&&bounces<2){vy=-vy*.42;vx*=.7;bounces++;}
  else return {x,y,vx:0,vy:0,bounces,spin,landed:'floor'};
 }
 return {x,y,vx,vy,bounces,spin,landed:null};
}

/** A lower surface he could reach by stepping off one end of his current one. */
export function findDropTarget(platforms,current,{size,width}){
 if(!current)return null;
 const options=[];
 for(const side of [-1,1]){
  const edgeX=side<0?current.minX:current.maxX;
  // An end held in place by the screen edge is not a real ledge.
  if(side<0?edgeX<size:edgeX>width-size)continue;
  if(side<0?current.left<edgeX-size*.5:current.right>edgeX+size*.5)continue;
  for(const p of platforms){
   if(p.id===current.id||p.y<current.y+size*.4||p.y>current.y+420)continue;
   const reach=side>0?p.maxX>edgeX+size*.3&&p.minX<edgeX+260:p.minX<edgeX-size*.3&&p.maxX>edgeX-260;
   if(reach)options.push({platform:p,side,edgeX,drop:p.y-current.y});
  }
 }
 return options.sort((a,b)=>a.drop-b.drop)[0]||null;
}
