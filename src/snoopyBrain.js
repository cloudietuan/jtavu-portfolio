/** Choose one local skill from the page context. User control always wins. */
export function chooseSnoopySkill({scrollDelta=0,viewportHeight=900,idleMs=0,canAct=true,reduced=false,lastSkill='',visibleProjects=[]}={}) {
  if(!canAct || reduced) return null;
  const height=Math.max(1,viewportHeight);
  if(scrollDelta>height*.9) return lastSkill==='swing' ? 'ladder' : 'swing';
  if(scrollDelta>height*.6) return lastSkill==='ladder' ? 'swing' : 'ladder';
  if(idleMs<18000) return null;
  if(visibleProjects.length && lastSkill!=='inspect') return 'inspect';
  return lastSkill==='wander' ? null : 'wander';
}

const clampProgress=progress=>Math.min(1,Math.max(0,Number.isFinite(progress)?progress:0));

/** A gentle pendulum detour, with exact landings and no extra vertical lift. */
export function swingPoint({base,end},progress) {
  const t=clampProgress(progress);
  if(t===0) return {...base};
  if(t===1) return {...end};
  const eased=t*t*(3-2*t);
  const side=end.x<base.x ? -1 : 1;
  return {
    x:base.x+(end.x-base.x)*eased+side*50*Math.sin(Math.PI*t),
    y:base.y+(end.y-base.y)*eased,
  };
}

/** Degrees: lean into the swing, then settle upright at the landing. */
export function swingRotation(progress) {
  const t=clampProgress(progress);
  if(t===0 || t===1) return 0;
  return Math.sin(t*Math.PI*2)*18;
}

/** Deliberate improvisation uses only authored, visible things he can act on. */
export function choosePlaygroundMoment({canAct=true,reduced=false,hasBall=false,hasProject=false,lastAction=''}={}) {
  if(!canAct||reduced)return null;
  if(hasBall&&lastAction!=='ball')return 'ball';
  if(hasProject&&lastAction!=='camera')return 'camera';
  return 'dance';
}
