import test from 'node:test';
import assert from 'node:assert/strict';
import {SNOOPY_SKILLS,skillBeat} from '../src/snoopySkills.js';
for(const [kind,spec] of Object.entries(SNOOPY_SKILLS)){
 test(`${kind} holds its route for anticipation and finishes recovery before completion`,()=>{
  assert.equal(skillBeat(kind,0).progress,0);
  assert.equal(skillBeat(kind,spec.prepare-1).phase,'prepare');
  assert.equal(skillBeat(kind,spec.prepare).phase,'act');
  const recovery=spec.prepare+spec.act;
  assert.equal(skillBeat(kind,recovery).phase,'recover');
  assert.equal(skillBeat(kind,recovery).progress,1);
  assert.equal(skillBeat(kind,recovery+spec.recover-1).done,false);
  const done=skillBeat(kind,recovery+spec.recover);
  assert.equal(done.done,true);
  assert.equal(done.opacity,0);
  assert.equal(done.transform,'translateY(0px) rotate(0deg) scale(1,1)');
  let last=-1;
  for(let t=0;t<recovery+spec.recover+100;t+=17){
   const beat=skillBeat(kind,t);
   assert.ok(beat.progress>=last&&beat.progress<=1);last=beat.progress;
   assert.ok(beat.opacity>=0&&beat.opacity<=1);
   assert.doesNotMatch(beat.transform,/NaN|Infinity/);
  }
 });
}
test('skill clock tolerates suspended tabs and invalid time without an invalid pose',()=>{
 assert.equal(skillBeat('swing',100000).done,true);
 assert.equal(skillBeat('swing',NaN).progress,0);
 assert.throws(()=>skillBeat('invented',0),/Unknown Snoopy skill/);
});
