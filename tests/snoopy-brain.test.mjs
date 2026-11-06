import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseSnoopySkill,swingPoint,swingRotation} from '../src/snoopyBrain.js';

test('User control and reduced motion suppress every autonomous skill',()=>{
  const context={scrollDelta:1400,idleMs:24000,visibleProjects:[{id:'work'}]};
  assert.equal(chooseSnoopySkill({...context,canAct:false}),null);
  assert.equal(chooseSnoopySkill({...context,reduced:true}),null);
});

test('Scroll catch-up uses viewport-relative thresholds without reacting to upward travel',()=>{
  assert.equal(chooseSnoopySkill({scrollDelta:910,viewportHeight:1000}),'swing');
  assert.equal(chooseSnoopySkill({scrollDelta:700,viewportHeight:1000}),'ladder');
  assert.equal(chooseSnoopySkill({scrollDelta:400,viewportHeight:1000}),null);
  assert.equal(chooseSnoopySkill({scrollDelta:-1400,viewportHeight:1000}),null);
  assert.equal(chooseSnoopySkill({scrollDelta:380,viewportHeight:400}),'swing');
});

test('Idle inspection needs a visible project and alternates with wandering',()=>{
  assert.equal(chooseSnoopySkill({idleMs:17999,visibleProjects:['project']}),null);
  assert.equal(chooseSnoopySkill({idleMs:18000,visibleProjects:['project']}),'inspect');
  assert.equal(chooseSnoopySkill({idleMs:18000,visibleProjects:['project'],lastSkill:'inspect'}),'wander');
  assert.equal(chooseSnoopySkill({idleMs:18000}),'wander');
  assert.equal(chooseSnoopySkill({idleMs:18000,lastSkill:'wander'}),null);
  assert.equal(chooseSnoopySkill({scrollDelta:1000,lastSkill:'swing'}),'ladder');
  assert.equal(chooseSnoopySkill({scrollDelta:700,lastSkill:'ladder'}),'swing');
});

test('Swing lands exactly, stays within its corridor, and does not mutate destinations',()=>{
  for(const end of [{x:300,y:500},{x:100,y:100}]) {
    const path={base:Object.freeze({x:200,y:200}),end:Object.freeze(end)};
    assert.deepEqual(swingPoint(path,0),path.base);
    assert.deepEqual(swingPoint(path,1),path.end);
    assert.deepEqual(swingPoint(path,-2),path.base);
    assert.deepEqual(swingPoint(path,3),path.end);
    for(let i=0;i<=100;i++) {
      const point=swingPoint(path,i/100);
      assert.ok(point.x>=Math.min(path.base.x,end.x)-50 && point.x<=Math.max(path.base.x,end.x)+50);
      assert.ok(point.y>=Math.min(path.base.y,end.y) && point.y<=Math.max(path.base.y,end.y));
    }
  }
});

test('Swing rotation changes lean and returns upright at either end',()=>{
  assert.equal(swingRotation(0),0);
  assert.equal(swingRotation(1),0);
  assert.equal(swingRotation(.25),18);
  assert.equal(swingRotation(.75),-18);
  assert.equal(swingRotation(Number.NaN),0);
});
