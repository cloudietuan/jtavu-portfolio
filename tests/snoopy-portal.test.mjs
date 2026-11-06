import test from 'node:test';
import assert from 'node:assert/strict';
import {portalTransition as transition} from '../src/snoopyPortal.js';
test('portal waits exactly three seconds after upward scrolling',()=>{
 const waiting=transition(null,{type:'scroll',delta:-200},0);
 assert.equal(transition(waiting,{type:'tick'},2999).stage,'passing');
 assert.deepEqual(transition(waiting,{type:'tick'},3000),{stage:'pop',started:3000});
 const returning=transition(waiting,{type:'tick'},3000);
 assert.equal(transition(returning,{type:'tick'},3500),returning);
});
test('either direction resets pending and active returns',()=>{
 const waiting=transition(null,{type:'scroll',delta:-200},0);
 for(const delta of [-50,50]) {
  const reset=transition(waiting,{type:'scroll',delta},2500);
  assert.equal(reset.deadline,5500);
  assert.equal(transition(reset,{type:'tick'},3000).stage,'passing');
 }
 const returning=transition(waiting,{type:'tick'},3000);
 assert.equal(transition(returning,{type:'scroll',delta:20},3400).deadline,6400);
});
test('all user interruptions cancel without resurrection',()=>{
 for(const stage of ['passing','pop']) {
  const cleared=transition({stage,deadline:3000},{type:'cancel'},2000);
  assert.equal(transition(cleared,{type:'tick'},9000),null);
 }
 assert.equal(transition({stage:'pop'},{type:'complete'},4000),null);
 assert.equal(transition(null,{type:'scroll',delta:0},0),null);
 assert.equal(transition(null,{type:'scroll',delta:20},0),null);
});

test('website follow mode gives downward scrolling one settled return',()=>{
 const state=transition(null,{type:'scroll',delta:500,follow:true},100);
 assert.deepEqual(state,{stage:'passing',deadline:3100});
 assert.equal(transition(state,{type:'tick'},3099).stage,'passing');
 assert.equal(transition(state,{type:'tick'},3100).stage,'pop');
 const again=transition(state,{type:'scroll',delta:30,follow:true},2000);
 assert.equal(again.deadline,5000);
});
