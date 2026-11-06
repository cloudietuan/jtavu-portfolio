export function clampPoint(point, width, height, size) {
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  return {
    x: clamp(point.x, size / 2 + 12, Math.max(size / 2 + 12, width - size / 2 - 12)),
    y: clamp(point.y, Math.min(size + 50, height - 20), height - 20),
  };
}
export function isClear(point, obstacles, size) {
  return !obstacles.some(b => point.x + size / 2 > b.left - 8 && point.x - size / 2 < b.right + 8 && point.y > b.top - 8 && point.y - size < b.bottom + 8);
}
export function safePoint(point, width, height, size, obstacles) {
  const p = clampPoint(point, width, height, size);
  if (isClear(p, obstacles, size)) return p;
  // Search the closest usable margin first, rather than jumping across the page.
  const candidates = [];
  for (let radius = 40; radius <= Math.max(width, height); radius += 40) {
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6;
      const q = clampPoint({x:p.x + Math.cos(angle) * radius, y:p.y + Math.sin(angle) * radius}, width, height, size);
      if (isClear(q, obstacles, size)) candidates.push(q);
    }
    if (candidates.length) return candidates.sort((a,b) => Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  }
  return p;
}

// A ladder needs a whole clear vertical strip, not merely two clear endpoints.
export function findClimbCorridor(point, width, height, size, obstacles, preferredX=point.x, rise=120) {
  const minX=size/2+12,maxX=width-size/2-12;
  const minY=size+50+rise,maxY=height-20;
  if(maxX<minX||maxY<minY)return null;
  const xs=[preferredX,point.x,minX,maxX,width/2];
  const ys=[point.y,minY,maxY];
  for(let x=minX;x<=maxX;x+=32)xs.push(x);
  for(let y=minY;y<=maxY;y+=24)ys.push(y);
  let best=null,bestScore=Infinity;
  for(const rawX of xs)for(const rawY of ys){
    const x=Math.max(minX,Math.min(maxX,rawX)),y=Math.max(minY,Math.min(maxY,rawY));
    const base={x,y},end={x,y:y-rise};
    // The swept sprite rectangle covers every point of the climb exactly.
    const blocked=obstacles.some(b=>x+size/2>b.left-8&&x-size/2<b.right+8&&y>b.top-8&&y-rise-size<b.bottom+8);
    if(blocked)continue;
    const score=Math.hypot(x-point.x,y-point.y)+Math.abs(x-preferredX)*.15;
    if(score<bestScore){bestScore=score;best={base,end};}
  }
  return best;
}

// A return rises from below the viewport, so the complete entry strip must be clear.
export function findPortalLanding(width,height,size,obstacles,preferredX=width*.78){
  const minX=size/2+12,maxX=width-size/2-12;
  const candidates=[preferredX,minX,maxX,width/2];
  for(let x=minX;x<=maxX;x+=24)candidates.push(x);
  return candidates.map(x=>({x:Math.max(minX,Math.min(maxX,x)),y:height-20}))
    .filter(p=>!obstacles.some(b=>p.x+size/2>b.left-8&&p.x-size/2<b.right+8&&height+size>b.top-8&&p.y-size<b.bottom+8))
    .sort((a,b)=>Math.abs(a.x-preferredX)-Math.abs(b.x-preferredX))[0]||null;
}

// Prefer a real entrance from below the viewport. A crowded footer can still
// host a portal in a clear pocket: Snoopy unfolds from its floor in place.
export function findReturnStation(width,height,size,obstacles,preferred={x:width*.78,y:height*.78}){
 const bottom=findPortalLanding(width,height,size,obstacles,preferred.x);
 if(bottom)return {point:bottom,fromBottom:true};
 const local=safePoint(preferred,width,height,size,obstacles);
 if(isClear(local,obstacles,size))return {point:local,fromBottom:false};
 // Narrow phone pockets can fall between the radial search samples. Rectangle
 // boundaries describe all possible clear cells without guessing another offset.
 const xs=[size/2+12,width-size/2-12,preferred.x,...obstacles.flatMap(b=>[b.left-size/2-9,b.right+size/2+9])];
 const ys=[size+50,height-20,preferred.y,...obstacles.flatMap(b=>[b.top-9,b.bottom+size+9])];
 const candidates=xs.flatMap(x=>ys.map(y=>({x,y}))).filter(p=>{const c=clampPoint(p,width,height,size);return c.x===p.x&&c.y===p.y&&isClear(p,obstacles,size);});
 candidates.sort((a,b)=>Math.hypot(a.x-local.x,a.y-local.y)-Math.hypot(b.x-local.x,b.y-local.y));
 return candidates.length?{point:candidates[0],fromBottom:false}:null;
}
