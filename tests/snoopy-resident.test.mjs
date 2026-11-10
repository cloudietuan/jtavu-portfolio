import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlatforms,choosePerchX,choosePlatform,jumpPoint,jumpDuration,bodyBox} from '../src/snoopyTerrain.js';
import {createAgent,decide,tickDrives,rememberVisit,AGENT_TIMING} from '../src/snoopyAgent.js';

const view={width:1280,height:800,size:96,top:64};
const node=(id,left,top,width,height=60)=>({id,rect:{left,right:left+width,top,bottom:top+height}});

test('only surfaces he can fully stand on become platforms',()=>{
 const platforms=buildPlatforms([
  node('heading',100,300,500),
  node('under-header',100,120,500),   // body would hide beneath the sticky header
  node('below-fold',100,900,500),
  node('too-narrow',100,400,40),
  node('offscreen-left',-600,400,500),
 ],view);
 assert.deepEqual(platforms.map(p=>p.id),['heading']);
 const [p]=platforms;
 assert.equal(p.y,300);
 assert.ok(p.minX>=p.left&&p.maxX<=p.right&&p.minX<=p.maxX);
});

test('phone-width surfaces keep him inside the viewport',()=>{
 const [p]=buildPlatforms([node('image',0,400,390)],{width:390,height:844,size:80,top:100});
 assert.ok(p.minX>=80/2+12&&p.maxX<=390-80/2-12);
});

test('a perch avoids controls first, then covered text, then distance',()=>{
 const [p]=buildPlatforms([node('image',100,400,800)],view);
 const button={left:100,right:420,top:330,bottom:380};
 const text={left:420,right:640,top:330,bottom:380};
 const spot=choosePerchX(p,150,{controls:[button],covers:[button,text],size:96});
 assert.equal(spot.blocked,false);
 assert.equal(spot.cover,0);
 const box=bodyBox({x:spot.x,y:p.y},96);
 assert.ok(box.left>=640);
 // The surface he stands on is never counted as something he covers.
 const own=choosePerchX(p,300,{controls:[p.rect],covers:[p.rect],size:96});
 assert.equal(own.blocked,false);assert.equal(own.x,300);
});

test('platform choice prefers a requested perch, then somewhere new and near',()=>{
 const platforms=buildPlatforms([node('a',100,300,400),node('b',700,320,400),node('c',100,650,400)],view);
 const from={x:300,y:300};
 assert.equal(choosePlatform(platforms,{from,size:96}).platform.id,'a');
 assert.equal(choosePlatform(platforms,{from,size:96,avoid:['a']}).platform.id,'c');
 assert.equal(choosePlatform(platforms,{from,size:96,avoid:['a'],prefer:['b']}).platform.id,'b');
 assert.equal(choosePlatform([],{from,size:96}),null);
 const blocked=choosePlatform(platforms.slice(0,1),{from,size:96,controls:[{left:0,right:1280,top:200,bottom:299}]});
 assert.equal(blocked.blocked,true);
});

test('jumps land exactly and rise above both ends',()=>{
 const start=Object.freeze({x:100,y:500}),end=Object.freeze({x:700,y:300});
 assert.deepEqual(jumpPoint(start,end,0),start);
 assert.deepEqual(jumpPoint(start,end,1),end);
 assert.deepEqual(jumpPoint(start,end,Number.NaN),start);
 assert.ok(jumpPoint(start,end,.5).y<Math.min(start.y,end.y));
 assert.ok(jumpPoint(start,start,.5).y<start.y);
 for(const far of [0,200,5000]){const d=jumpDuration(start,{x:start.x+far,y:start.y});assert.ok(d>=380&&d<=1050);}
});

const senses=(extra={})=>({now:10000,platformId:'a',otherPlatforms:2,snoopy:{x:300,y:300},span:{minX:140,maxX:460},userIdleMs:1000,size:96,...extra});
const rested=agent=>({...agent,until:0});

test('he rests between actions instead of acting every frame',()=>{
 const agent={...createAgent(0),until:20000};
 assert.equal(decide(agent,senses(),()=>0).intent,null);
});

test('a lingering hover invites him over, even mid-rest; a glance does not',()=>{
 const agent={...createAgent(0),until:20000};
 const lingering=decide(agent,senses({hover:{id:'b',ms:AGENT_TIMING.hoverDwell}}),()=>.99);
 assert.deepEqual(lingering.intent,{type:'travel',to:'b',reason:'hover'});
 assert.equal(decide(agent,senses({hover:{id:'b',ms:200}}),()=>.99).intent,null);
 assert.equal(decide(agent,senses({hover:{id:'a',ms:5000}}),()=>.99).intent,null);
});

test('he walks toward a nearby moving cursor and stops short of it',()=>{
 const agent=rested(createAgent(0));
 const {intent}=decide(agent,senses({cursor:{x:440,y:260,ageMs:100}}),()=>.99);
 assert.equal(intent.type,'walk');assert.equal(intent.reason,'cursor');
 assert.ok(intent.x>300&&intent.x<440);
 const close=decide(agent,senses({cursor:{x:330,y:260,ageMs:100}}),()=>.99).intent;
 assert.deepEqual(close,{type:'watch',facing:1});
 // A stale or distant pointer is not followed.
 const stale=decide({...agent,curiosity:0},senses({cursor:{x:440,y:260,ageMs:9000}}),()=>.99).intent;
 assert.equal(stale.type,'hop');
 const far=decide({...agent,curiosity:0},senses({cursor:{x:440,y:790,ageMs:100}}),()=>.7).intent;
 assert.notEqual(far.reason,'cursor');
});

test('curiosity builds while he stands still and sends him exploring',()=>{
 let agent=rested(createAgent(0));
 for(let i=0;i<200;i++)agent=tickDrives(agent,.1);
 assert.equal(agent.curiosity,1);
 assert.equal(decide(agent,senses(),()=>.99).intent.type,'travel');
 assert.notEqual(decide(agent,senses({otherPlatforms:0}),()=>.99).intent.type,'travel');
 const after=rememberVisit(agent,'b');
 assert.equal(after.curiosity,0);assert.deepEqual(after.visited,['b']);
 assert.deepEqual(['a','b','c','b','d'].reduce(rememberVisit,agent).visited,['c','b','d']);
});

test('he naps when the visitor goes idle and wakes when they return',()=>{
 const agent=rested(createAgent(0));
 const asleep=decide(agent,senses({userIdleMs:AGENT_TIMING.napAfterIdle}),()=>.5);
 assert.equal(asleep.intent.type,'nap');assert.equal(asleep.agent.napping,true);
 assert.equal(decide(asleep.agent,senses({userIdleMs:60000}),()=>.5).intent,null);
 const awake=decide(asleep.agent,senses({userIdleMs:50}),()=>.5);
 assert.equal(awake.intent.type,'wake');assert.equal(awake.agent.napping,false);
 const tired=decide({...agent,energy:.1},senses({userIdleMs:AGENT_TIMING.tiredNapAfterIdle}),()=>.5);
 assert.equal(tired.intent.type,'nap');
 let resting={...agent,energy:.1};
 for(let i=0;i<100;i++)resting=tickDrives(resting,.1,{napping:true});
 assert.ok(resting.energy>.9);
});

test('strolls stay on his platform and drives stay bounded',()=>{
 const agent={...rested(createAgent(0)),curiosity:0};
 for(const r of [0,.2,.4,.59]){
  const {intent}=decide(agent,senses(),()=>r);
  if(intent.type==='walk')assert.ok(intent.x>=140&&intent.x<=460);
 }
 let drained=agent;
 for(let i=0;i<5000;i++)drained=tickDrives(drained,.25,{moving:true});
 assert.equal(drained.energy,0);
 assert.equal(tickDrives(agent,Number.NaN).energy,agent.energy);
});
