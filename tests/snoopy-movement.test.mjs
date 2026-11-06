import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceMovement} from '../src/snoopyMovement.js';

function simulate(target, hz, seconds, initial={x:0,y:0}, initialVelocity={x:0,y:0}) {
  let state={position:initial,velocity:initialVelocity};
  for(let frame=0;frame<hz*seconds;frame++) state=advanceMovement(state.position,target,state.velocity,1/hz);
  return state;
}

test('Snoopy reaches distant diagonal destinations at common display frame rates',()=>{
  const target={x:540,y:220};
  for(const hz of [30,60,120]) {
    const result=simulate(target,hz,8);
    assert.deepEqual(result.position,target,`${hz} Hz destination`);
    assert.deepEqual(result.velocity,{x:0,y:0});
    assert.equal(result.moving,false);
  }
});

test('Changing destination while walking settles at the new point',()=>{
  const outbound=simulate({x:700,y:0},60,1);
  const target={x:40,y:180};
  const result=simulate(target,60,8,outbound.position,outbound.velocity);
  assert.deepEqual(result.position,target);
  assert.equal(result.moving,false);
});

test('Returning after a long inactive tab cannot jump across the page',()=>{
  const position={x:150,y:180},target={x:950,y:180},velocity={x:180,y:0};
  const result=advanceMovement(position,target,velocity,20);
  assert.ok(result.position.x-position.x<=8,'resume moves less than one sprite width');
  assert.equal(result.position.y,position.y);
});

test('A stopped animation clock does not move or mutate callers',()=>{
  const position=Object.freeze({x:120,y:140}),target=Object.freeze({x:600,y:250}),velocity=Object.freeze({x:100,y:20});
  const result=advanceMovement(position,target,velocity,0);
  assert.deepEqual(result.position,position);
  assert.deepEqual(result.velocity,velocity);
});

test('Already arrived companions remain still without a residual gait',()=>{
  const point={x:500,y:300};
  const result=advanceMovement(point,point,{x:90,y:-25},1/60);
  assert.deepEqual(result.position,point);
  assert.deepEqual(result.velocity,{x:0,y:0});
  assert.equal(result.travelled,0);
  assert.equal(result.moving,false);
});
