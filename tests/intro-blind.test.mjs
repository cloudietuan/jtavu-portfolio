import test from 'node:test';
import assert from 'node:assert/strict';
import {SWING_VARIANTS,chooseVariant,planSwing,APPROACH_MS} from '../src/introSwing.js';

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
  assert.ok(plan.releaseAt>2800&&plan.releaseAt<4400,`length ${plan.releaseAt}`);
  const first=plan.sample(0);
  assert.ok(first.visible&&first.blindY===0&&first.anchor==='feet','he starts on the landing screen before the blind moves');
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
   if(p.anchor==='hands'&&t>=APPROACH_MS){
    hung++;
    assert.ok(p.y+view.size*.95<=view.height+2,`feet off screen at ${t}ms`);
    assert.ok(Math.abs(p.y-(view.height+p.blindY-4))<1,'hands on the tab');
    assert.ok(Math.abs(p.rot)<=32);
   }
   if(p.anchor==='feet')assert.ok(p.y<=view.height+view.size*1.2&&p.x>-view.size&&p.x<=view.width+view.size,`feet at ${p.x},${p.y}`);
  }
  assert.ok(hung>10,'he spends real time hanging');
  assert.ok(said.size>=1,'he says something');
  assert.ok(plan.release.vy<-500&&plan.release.say,'he is thrown clear when the blind snaps up');
  // His weight has pulled the blind down from the lifted position by the release.
  const lifted=Math.min(...Array.from({length:Math.ceil(APPROACH_MS/20)},(_,i)=>plan.sample(i*20).blindY));
  assert.ok(plan.sample(plan.releaseAt-1).blindY>lifted+50);
 });
}

test('the stunts really differ',()=>{
 const view=views[0],shapes=SWING_VARIANTS.map(n=>{const p=planSwing(n,view,()=>.3);return [p.releaseAt,p.release.vy,p.release.say].join();});
 assert.equal(new Set(shapes).size,SWING_VARIANTS.length);
 const run=planSwing('runningLeap',view,()=>.3);
 assert.ok(Array.from({length:100},(_,i)=>run.sample(i*20)).some(p=>p.visible&&p.anchor==='feet'&&p.pose.kind==='walk'),'he runs');
 const bungee=planSwing('bungee',view,()=>.3),words=new Set();
 for(let t=0;t<bungee.releaseAt;t+=10){const p=bungee.sample(t);if(p.say)words.add(p.say);}
 assert.ok(words.has('BOING!'));
 const tugs=planSwing('twoTugs',view,()=>.3),ys=[];
 for(let t=0;t<tugs.releaseAt;t+=10)ys.push(tugs.sample(t).blindY);
 const lowest=Math.max(...ys.slice(0,ys.length/2)),after=Math.min(...ys.slice(ys.indexOf(lowest)));
 assert.ok(after<lowest-80,'the blind springs back up after the first tug');
});

test('every pull opens with the zoom: off the right side, up from the bottom, over to the tab',()=>{
 for(const view of views){
  const start={x:view.width*.35,y:view.height*.42};
  const plan=planSwing('bungee',{...view,start},()=>.5),pts=[];
  for(let t=0;t<APPROACH_MS;t+=10)pts.push(plan.sample(t));
  assert.ok(Math.abs(pts[0].x-start.x)<1&&Math.abs(pts[0].y-start.y)<1,'starts where he stood on the landing screen');
  const offRight=pts.findIndex(p=>p.visible&&p.x>view.width);
  assert.ok(offRight>0,'zooms off the right side');
  assert.ok(pts.slice(0,offRight).every(p=>p.blindY===0&&p.facing===1),'runs right while the landing screen is still down');
  const gone=pts.findIndex((p,i)=>i>offRight&&!p.visible),back=pts.findIndex((p,i)=>i>gone&&p.visible);
  assert.ok(gone>offRight&&back>gone,'leaves, then comes back');
  assert.ok(pts[back].y>view.height,'comes back up from below the bottom of the screen');
  assert.ok(pts[back].x>view.width*.6,'on the right side');
  assert.ok(pts.some((p,i)=>i>back&&p.anchor==='feet'&&p.zoom===-1&&p.y===view.height-6),'zooms along the bottom toward the tab');
  const end=plan.sample(APPROACH_MS);
  assert.equal(end.anchor,'hands');assert.ok(Math.abs(end.x-view.width/2)<1,'hands on the centre tab');
  assert.ok(pts.some(p=>p.say==='zoom!'));
 }
});

test('the run is believable: a ready crouch first, feet keep pace with the ground, a bob and dust',()=>{
 const view={width:1280,height:800,size:132,start:{x:500,y:360}},plan=planSwing('bungee',view,()=>.5);
 const first=plan.sample(10);assert.equal(first.say,'!');assert.ok(first.squash[1]<1.001);
 // Through the dash, each frame change matches about 1/8 of a 1.4-body stride.
 let lastFrame=null,lastX=null,steps=[],bobs=new Set(),dust=0;
 for(let t=320;t<820;t+=4){const p=plan.sample(t);if(p.anchor!=='feet'||p.pose.kind!=='walk')continue;
  if(p.dust)dust++;bobs.add(Math.round(p.y));
  if(lastFrame!==null&&p.pose.frame!==lastFrame)steps.push(p.x-lastX);
  if(lastFrame===null||p.pose.frame!==lastFrame){lastFrame=p.pose.frame;lastX=p.x;}}
 const stride=view.size*1.4/8;
 assert.ok(steps.length>=4,'several footfalls');
 assert.ok(steps.slice(1,-1).every(d=>d>stride*.5&&d<stride*2.2),`steps ${steps.map(Math.round)} vs ${Math.round(stride)}`);
 assert.ok(bobs.size>3,'his body rises and falls as he runs');
 assert.ok(dust>5,'he kicks up dust');
});
