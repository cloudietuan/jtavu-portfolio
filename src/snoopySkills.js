// Each skill has one clock: anticipation, contact/action, then recovery.
// The companion owns interruption; a cancelled clock can never resume itself.
export const SNOOPY_SKILLS=Object.freeze({
 hop:Object.freeze({prepare:300,act:700,recover:420}),
 dash:Object.freeze({prepare:280,act:1350,recover:400}),
 bow:Object.freeze({prepare:250,act:1900,recover:350}),
 swing:Object.freeze({prepare:360,act:1800,recover:420}),
 ladder:Object.freeze({prepare:420,act:2300,recover:380}),
 camera:Object.freeze({prepare:400,act:1700,recover:400}),
 ball:Object.freeze({prepare:360,act:1800,recover:420}),
 hammer:Object.freeze({prepare:320,act:1500,recover:360}),
});
const clamp=n=>Math.max(0,Math.min(1,n));
export function skillBeat(kind,elapsed){
 const spec=SNOOPY_SKILLS[kind];
 if(!spec)throw new Error(`Unknown Snoopy skill: ${kind}`);
 const time=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 const finish=spec.prepare+spec.act+spec.recover;
 const phase=time<spec.prepare?'prepare':time<spec.prepare+spec.act?'act':'recover';
 const progress=clamp((time-spec.prepare)/spec.act);
 const phaseProgress=phase==='prepare'?clamp(time/spec.prepare):phase==='act'?progress:clamp((time-spec.prepare-spec.act)/spec.recover);
 // At every boundary the performance returns to neutral. A small held breath
 // precedes the trick; a damped squash and hop gives the landing its weight.
 let x=1,y=1,lift=0,rotation=0;
 if(phase==='prepare'){
  const breath=Math.sin(phaseProgress*Math.PI);
  x=1+breath*.045;y=1-breath*.07;
  rotation=(kind==='swing'?-5:kind==='ball'?-4:2)*breath;
 }else if(phase==='act'&&kind==='ball'){
  const kick=Math.max(0,1-Math.abs(progress-.18)/.15);
  lift=-kick*5;rotation=-kick*12;x=1+kick*.025;y=1-kick*.025;
 }else if(phase==='recover'){
  const bounce=Math.sin(phaseProgress*Math.PI*2)*(1-phaseProgress);
  x=1+bounce*.09;y=1-bounce*.12;lift=-Math.max(0,-bounce)*8;
 }
 return {phase,phaseProgress,progress,done:time>=finish,
  opacity:phase==='prepare'?clamp(phaseProgress*3):phase==='recover'?1-phaseProgress:1,
  transform:`translateY(${lift}px) rotate(${rotation}deg) scale(${x},${y})`};
}
