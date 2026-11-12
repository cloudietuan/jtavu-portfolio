import test from 'node:test';
import assert from 'node:assert/strict';
import {SWING_VARIANTS,chooseVariant,planSwing} from '../src/introSwing.js';

const views=[{width:1280,height:800,size:96},{width:390,height:844,size:80},{width:1920,height:1080,size:96}];
const seq=(...v)=>{let i=0;return()=>v[i++%v.length];};

test('a stunt is never repeated twice in a row, and all of them come up',()=>{
 for(const last of SWING_VARIANTS)for(const r of [0,.4,.99])assert.notEqual(chooseVariant(last,()=>r),last);
 const seen=new Set();for(const r of [0,.3,.6,.99])seen.add(chooseVariant(null,()=>r));
 assert.equal(seen.size,SWING_VARIANTS.length);
});

for(const name of SWING_VARIANTS)for(const view of views)for(const r of [.1,.9]){
 test(`${name} at ${view.width}px (random ${r}) keeps Snoopy on screen and lets go cleanly`,()=>{
  const plan=planSwing(name,view,seq(r,1-r,r));
  assert.ok(plan.releaseAt>1800&&plan.releaseAt<4200,`length ${plan.releaseAt}`);
  assert.equal(plan.sample(0).visible,false,'the blind lifts before he appears');
  let hung=0,grabbed=false,said=new Set();
  for(let t=0;t<plan.releaseAt;t+=15){
   const p=plan.sample(t);
   assert.ok(Number.isFinite(p.blindY));
   assert.ok(p.blindY<=1,'the blind never drops below its resting place');
   if(p.say)said.add(p.say);
   if(!p.visible)continue;
   assert.ok(['hands','feet'].includes(p.anchor));
   if(p.pose.kind==='action')assert.ok(['swing','ladder','portal'].includes(p.pose.action));
   if(p.pose.kind==='walk')assert.ok(p.pose.frame>=0&&p.pose.frame<8);
   // While he hangs his feet stay on screen and his hands are on the tab.
   if(p.anchor==='hands'&&t>plan.releaseAt*.55){
    hung++;
    assert.ok(p.y+view.size*.95<=view.height+2,`feet off screen at ${t}ms`);
    assert.ok(Math.abs(p.y-(view.height+p.blindY-4))<1,'hands on the tab');
    assert.ok(Math.abs(p.rot)<=32);
   }
   if(p.anchor==='feet')assert.ok(p.y<=view.height&&p.x>-view.size&&p.x<view.width+view.size);
  }
  assert.ok(hung>10,'he spends real time hanging');
  assert.ok(said.size>=1,'he says something');
  assert.ok(plan.release.vy<-500&&plan.release.say,'he is thrown clear when the blind snaps up');
  // His weight has pulled the blind down from the lifted position by the release.
  const lifted=Math.min(...Array.from({length:40},(_,i)=>plan.sample(i*20).blindY));
  assert.ok(plan.sample(plan.releaseAt-1).blindY>lifted+50);
 });
}

test('the stunts really differ',()=>{
 const view=views[0],shapes=SWING_VARIANTS.map(n=>{const p=planSwing(n,view,()=>.3);return [p.releaseAt,p.release.vy,p.release.say].join();});
 assert.equal(new Set(shapes).size,SWING_VARIANTS.length);
 const run=planSwing('runningLeap',view,()=>.3);
 assert.ok(Array.from({length:100},(_,i)=>run.sample(i*20)).some(p=>p.visible&&p.anchor==='feet'&&p.pose.kind==='walk'),'running leap runs in');
 const bungee=planSwing('bungee',view,()=>.3),words=new Set();
 for(let t=0;t<bungee.releaseAt;t+=10){const p=bungee.sample(t);if(p.say)words.add(p.say);}
 assert.ok(words.has('BOING!'));
 const tugs=planSwing('twoTugs',view,()=>.3),ys=[];
 for(let t=0;t<tugs.releaseAt;t+=10)ys.push(tugs.sample(t).blindY);
 const lowest=Math.max(...ys.slice(0,ys.length/2)),after=Math.min(...ys.slice(ys.indexOf(lowest)));
 assert.ok(after<lowest-80,'the blind springs back up after the first tug');
});
