import test from 'node:test';
import assert from 'node:assert/strict';
import {imageSurface,textSurfaceTop,tiltedSurface} from '../src/snoopyTerrain.js';
import {decide,pickRoutine,LYING,createAgent} from '../src/snoopyAgent.js';

test('he stands on the visible part of an image, not its transparent padding',()=>{
 const s=imageSurface({left:0,right:200,top:100,bottom:300},{top:.25,left:.1,right:.05,bottom:.1});
 assert.equal(s.top,150);assert.equal(s.left,20);assert.equal(s.right,190);
});
test('on text he stands on the tops of the capital letters',()=>{
 // 80px line box, font ascent 70, descent 20, capitals 56 tall.
 const y=textSurfaceTop({top:100,lineHeight:80,fontAscent:70,fontDescent:20,capAscent:56});
 assert.equal(y,100+(80-90)/2+(70-56));
 assert.equal(textSurfaceTop({top:5,lineHeight:NaN,fontAscent:1,fontDescent:1,capAscent:1}),5,'falls back to the box');
});
test('a tilted card gives a slanted edge he can follow',()=>{
 const flat=tiltedSurface({cx:100,cy:100,width:200,height:100,angle:0});
 assert.equal(flat.top,50);assert.equal(flat.slope,0);
 const t=tiltedSurface({cx:100,cy:100,width:200,height:100,angle:Math.PI/90});// 2 degrees clockwise
 assert.ok(t.slope>0,'right side lower when turned clockwise');
 assert.ok(Math.abs(t.top-(100-50*Math.cos(Math.PI/90)))<0.01,'edge height at the middle');
});
test('he never lies down on a narrow surface',()=>{
 for(let i=0;i<200;i++){const r=pickRoutine(.1,[],Math.random,false,LYING);assert.ok(!LYING.includes(r),r);}
});
test('sleepy on a narrow ledge, he goes somewhere roomy before napping',()=>{
 const agent={...createAgent(0),until:0};
 const base={now:100000,platformId:'a',otherPlatforms:3,snoopy:{x:100,y:100},span:{minX:80,maxX:120},userIdleMs:60000,size:100};
 const narrow=decide(agent,{...base,roomy:false},()=>.5);
 assert.equal(narrow.intent.type,'travel');assert.ok(narrow.intent.roomy);assert.ok(!narrow.agent.napping);
 const roomy=decide(agent,{...base,roomy:true},()=>.5);
 assert.equal(roomy.intent.type,'nap');
});
