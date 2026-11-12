import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// IntroBlind.jsx contains JSX, so test its pure choreography by evaluating
// just the exported timing helpers.
const source=fs.readFileSync(new URL('../src/IntroBlind.jsx',import.meta.url),'utf8');
const start=source.indexOf('export const SWING_TIMING'),end=source.indexOf('export function IntroBlind');
const {SWING_TIMING,swingPose}=await import('data:text/javascript,'+encodeURIComponent(source.slice(start,end)));

for(const view of [{width:1280,height:800,size:96},{width:390,height:844,size:80}]){
 test(`the swing keeps Snoopy on screen and ends with the blind pulled part way (${view.width}px)`,()=>{
  const T=SWING_TIMING,total=T.lift+T.leap+T.swing;
  assert.equal(swingPose(0,view).blindY,-0);
  assert.equal(swingPose(10,view).visible,false);
  for(let t=T.lift+T.leap;t<total;t+=20){
   const p=swingPose(t,view);
   assert.equal(p.phase,'swing');
   // Hanging below the hem, his feet stay above the bottom of the screen.
   assert.ok(p.y+view.size*.95<=view.height+2,`feet off screen at ${t}ms`);
   assert.ok(Math.abs(p.rot)<=24.01);
   assert.ok(p.blindY<0,'the blind is still lifted while he hangs');
  }
  const lifted=swingPose(T.lift,view),pulled=swingPose(total-1,view);
  assert.ok(pulled.blindY>lifted.blindY+60,'his weight drags the blind down');
  const leapStart=swingPose(T.lift+1,view),leapEnd=swingPose(T.lift+T.leap-1,view);
  assert.ok(leapStart.y>view.height,'he leaps in from below the screen');
  assert.ok(Math.abs(leapEnd.y-swingPose(T.lift+T.leap,view).y)<12,'he arrives at the tab');
  assert.equal(swingPose(total+5,view).phase,'release');
 });
}
