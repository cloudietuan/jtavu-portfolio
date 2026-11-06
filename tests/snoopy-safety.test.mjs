import test from 'node:test';
import assert from 'node:assert/strict';
import {findReturnStation,clampPoint,isClear,safePoint,findClimbCorridor} from '../src/snoopySafety.js';
test('off-screen pointer destinations stay inside a phone viewport',()=>{const p=clampPoint({x:-200,y:2000},390,844,80);assert.ok(p.x>=52&&p.x<=338);assert.ok(p.y>=130&&p.y<=824)});
test('heading overlap moves to nearby clear space on mobile',()=>{const headings=[{left:24,right:367,top:150,bottom:275},{left:24,right:367,top:315,bottom:365}];const p=safePoint({x:195,y:250},390,844,80,headings);assert.ok(isClear(p,headings,80));assert.ok(p.x>=52&&p.x<=338);assert.ok(p.y<=824)});
test('a clear destination is preserved rather than unnecessarily relocated',()=>{const p={x:250,y:350};assert.deepEqual(safePoint(p,1200,900,96,[{left:500,right:800,top:300,bottom:600}]),p)});
test('ladder finds an alternative when the preferred corridor is blocked',()=>{
 const obstacles=[{left:450,right:650,top:100,bottom:700}];
 const path=findClimbCorridor({x:550,y:500},1135,978,96,obstacles,550);
 assert.ok(path);
 assert.equal(path.base.y-path.end.y,120);
 for(let y=path.end.y;y<=path.base.y;y+=5)assert.ok(isClear({x:path.base.x,y},obstacles,96));
});
test('ladder declines when no safe corridor exists',()=>{
 assert.equal(findClimbCorridor({x:195,y:500},390,844,80,[{left:0,right:390,top:0,bottom:844}]),null);
});

test('portal searches a clear bottom gutter instead of crossing content', async()=>{
 const {findPortalLanding}=await import('../src/snoopySafety.js');
 const obstacle={left:200,right:390,top:690,bottom:844};
 const point=findPortalLanding(390,844,80,[obstacle]);
 assert.ok(point);
 assert.ok(point.x+40<=obstacle.left-8);
 assert.equal(point.y,824);
 assert.equal(findPortalLanding(390,844,80,[{left:0,right:390,top:600,bottom:844}]),null);
});

test('a crowded footer uses a clear local portal instead of waiting forever',()=>{
 const obstacles=[{left:0,right:390,top:720,bottom:844}];
 const station=findReturnStation(390,844,80,obstacles);
 assert.ok(station);
 assert.equal(station.fromBottom,false);
 assert.ok(station.point.y<=712);
 assert.equal(isClear(station.point,obstacles,80),true);
});
test('a fully covered page declines the portal and a clear page uses its bottom',()=>{
 assert.equal(findReturnStation(390,844,80,[{left:0,right:390,top:0,bottom:844}]),null);
 assert.equal(findReturnStation(390,844,80,[]).fromBottom,true);
});

test('portal can resolve a narrow phone pocket between rectangle boundaries',()=>{
 const obstacles=[{left:0,right:390,top:0,bottom:610},{left:0,right:130,top:610,bottom:720},{left:230,right:390,top:610,bottom:720},{left:0,right:390,top:720,bottom:844}];
 const station=findReturnStation(390,844,80,obstacles,{x:304,y:658});
 assert.ok(station);
 assert.equal(station.fromBottom,false);
 assert.equal(isClear(station.point,obstacles,80),true);
 assert.ok(station.point.x>=178&&station.point.x<=182);
 assert.ok(station.point.y>=698&&station.point.y<=712);
});
