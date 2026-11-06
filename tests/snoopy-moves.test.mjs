import test from 'node:test';
import assert from 'node:assert/strict';
import {planCharacterMove,sampleCharacterMove} from '../src/snoopyMoves.js';
import {skillBeat,SNOOPY_SKILLS} from '../src/snoopySkills.js';
import {isClear} from '../src/snoopySafety.js';
const point=Object.freeze({x:220,y:500});
test('a hop keeps its feet anchored before takeoff and returns to its starting point',()=>{
 const plan=planCharacterMove('hop',point,890,978,96,[]),s=SNOOPY_SKILLS.hop;
 assert.equal(plan.height,48);
 assert.deepEqual(sampleCharacterMove(plan,skillBeat('hop',0),0).point,point);
 const mid=sampleCharacterMove(plan,skillBeat('hop',s.prepare+s.act/2),s.prepare+s.act/2);
 assert.equal(mid.point.y,point.y-plan.height);
 assert.deepEqual(sampleCharacterMove(plan,skillBeat('hop',10000),10000).point,point);
});
test('dash decelerates, turns at its endpoint, and returns without mutating a caller',()=>{
 const plan=planCharacterMove('dash',point,890,978,96,[]),s=SNOOPY_SKILLS.dash;
 const middle=sampleCharacterMove(plan,skillBeat('dash',s.prepare+s.act/2),s.prepare+s.act/2);
 assert.deepEqual(middle.point,plan.end);
 assert.equal(middle.walking,true);
 assert.equal(middle.facing,-1);
 const finished=sampleCharacterMove(plan,skillBeat('dash',10000),10000);
 assert.deepEqual(finished.point,point);assert.equal(finished.walking,false);
 assert.deepEqual(point,{x:220,y:500});
});
test('dash selects a clear runway and cannot cross protected content',()=>{
 const obstacles=[{left:280,right:880,top:300,bottom:700}];
 const plan=planCharacterMove('dash',point,890,978,80,obstacles);
 assert.ok(plan.end.x<plan.start.x);
 for(let t=0;t<=1;t+=.02){const beat=skillBeat('dash',280+1350*t);assert.equal(isClear(sampleCharacterMove(plan,beat,280+1350*t).point,obstacles,80),true);}
});
test('a crowded phone uses a bounded in-place performance instead of disappearing',()=>{
 const obstacles=[{left:0,right:390,top:0,bottom:844}],start={x:332,y:822};
 const hop=planCharacterMove('hop',start,390,844,80,obstacles);
 const dash=planCharacterMove('dash',start,390,844,80,obstacles);
 assert.equal(hop.height,0);assert.deepEqual(dash.end,start);
 for(let t=0;t<=1;t+=.05){const sample=sampleCharacterMove(dash,skillBeat('dash',280+1350*t),280+1350*t);assert.deepEqual(sample.point,start);assert.ok(sample.frame>=0&&sample.frame<8);}
});
test('bow stays in place through preparation, action and recovery',()=>{
 const plan=planCharacterMove('bow',point,890,978,96,[]);
 for(let elapsed=0;elapsed<1800;elapsed+=17){const sample=sampleCharacterMove(plan,skillBeat('bow',elapsed),elapsed,-1);assert.deepEqual(sample.point,point);assert.doesNotMatch(sample.transform,/NaN|Infinity/);}
});
