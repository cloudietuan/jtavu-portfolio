import test from 'node:test';
import assert from 'node:assert/strict';
import {worldLandmarks,findWorldTarget,clearTravel} from '../src/snoopyWorld.js';
const project={id:'sunset',kind:'project',rect:{left:300,right:700,top:200,bottom:500,width:400,height:300}};
const settings={width:1000,height:800,size:96,obstacles:[project.rect],position:{x:130,y:400}};
test('travel checks the full route instead of only a clear landing',()=>{
 assert.equal(clearTravel({x:200,y:700},{x:200,y:200},[{left:0,right:390,top:400,bottom:500}],80),false);
 assert.equal(clearTravel({x:200,y:300},{x:250,y:300},[{left:0,right:390,top:400,bottom:500}],80),true);
});
test('world only offers real visible landmarks and permitted verbs',()=>{
 const list=worldLandmarks([project,{...project,id:'offscreen',rect:{...project.rect,top:1000,bottom:1300}},{...project,id:'ball',kind:'ball'}],1000,800);
 assert.deepEqual(list.map(n=>n.id),['sunset','ball']);
 assert.deepEqual(list[0].verbs,['inspect','camera']);
 assert.deepEqual(list[1].verbs,['inspect','ball']);
});
test('project interactions choose a safe margin rather than covering the subject',()=>{
 const target=findWorldTarget(worldLandmarks([project],1000,800),{...settings,verb:'camera'});
 assert.ok(target);assert.ok(target.point.x+48<project.rect.left);assert.equal(target.subject.id,'sunset');
});
test('blocked perches decline the action without moving content',()=>{
 assert.equal(findWorldTarget(worldLandmarks([project],1000,800),{...settings,verb:'camera',obstacles:[{left:0,right:1000,top:0,bottom:800}]}),null);
});
test('ball tool cannot use an arbitrary project as a ball',()=>{
 assert.equal(findWorldTarget(worldLandmarks([project],1000,800),{...settings,verb:'ball'}),null);
});
test('a full-width phone project can be inspected from clear space above',()=>{
 const phone={...project,rect:{left:24,right:366,top:300,bottom:500,width:342,height:200}};
 const target=findWorldTarget(worldLandmarks([phone],390,844),{width:390,height:844,size:80,obstacles:[phone.rect],position:{x:195,y:190},verb:'camera'});
 assert.ok(target);assert.ok(target.point.y<phone.rect.top);assert.ok(target.point.x>=52&&target.point.x<=338);
});
test('phone ball station uses the narrow clear side gap',()=>{
 const ball={id:'ball',kind:'ball',rect:{left:148,right:242,top:180,bottom:274,width:94,height:94}};
 const obstacles=[ball.rect,{left:58,right:320,top:102,bottom:154},{left:32,right:214,top:263,bottom:402},{left:240,right:377,top:195,bottom:380}];
 const target=findWorldTarget(worldLandmarks([ball],390,844),{verb:'ball',width:390,height:844,size:80,obstacles,position:{x:195,y:740}});
 assert.ok(target);assert.ok(target.point.x<ball.rect.left);assert.ok(target.point.y<255);
});
