import test from 'node:test';
import assert from 'node:assert/strict';
import {choosePlaygroundMoment} from '../src/snoopyBrain.js';
test('improvisation yields to pause and reduced motion',()=>{
 assert.equal(choosePlaygroundMoment({canAct:false,hasBall:true}),null);
 assert.equal(choosePlaygroundMoment({reduced:true,hasProject:true}),null);
});
test('only chooses props actually available and varies the last action',()=>{
 assert.equal(choosePlaygroundMoment({hasBall:true}),'ball');
 assert.equal(choosePlaygroundMoment({hasBall:true,lastAction:'ball'}),'dance');
 assert.equal(choosePlaygroundMoment({hasProject:true}),'camera');
 assert.equal(choosePlaygroundMoment({hasProject:true,lastAction:'camera'}),'dance');
 assert.equal(choosePlaygroundMoment({}),'dance');
});
