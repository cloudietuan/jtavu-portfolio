import test from 'node:test';
import assert from 'node:assert/strict';
import {bowJoints} from '../src/snoopyBow.js';
test('bow presents the paw before dipping, holds the bow, and returns every joint to neutral',()=>{
 const ready=bowJoints(0),present=bowJoints(.16),held=bowJoints(.6),end=bowJoints(1);
 assert.deepEqual(ready,{waist:0,head:0,arm:0,blend:0});
 assert.ok(present.arm>.8);assert.equal(present.waist,0);
 assert.equal(held.waist,28);assert.equal(held.head,12);assert.equal(held.arm,1);
 assert.deepEqual(end,{waist:0,head:0,arm:0,blend:0});
 for(let t=-.2;t<1.3;t+=.01)for(const value of Object.values(bowJoints(t)))assert.ok(Number.isFinite(value)&&value>=0);
});
