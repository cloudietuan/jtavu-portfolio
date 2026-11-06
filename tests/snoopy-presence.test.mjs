import test from 'node:test';
import assert from 'node:assert/strict';
import {companionDock,resolvePresence,scrollDisposition} from '../src/snoopyPresence.js';
const base={point:{x:180,y:300},width:390,height:844,size:80};
test('a completely crowded page still has a visible companion dock',()=>{
 const p=resolvePresence({...base,obstacles:[{left:0,right:390,top:0,bottom:844}]});
 assert.equal(p.visible,true);assert.equal(p.docked,true);
 assert.deepEqual(p.point,companionDock(390,844,80));
});
test('a cancelled return cannot leave an offscreen companion missing',()=>{
 for(const y of [-200,1200])assert.equal(resolvePresence({...base,point:{x:180,y}}).docked,true);
});
test('the dock stays in one place as page geometry changes',()=>{
 for(let top=-500;top<900;top+=10){const p=resolvePresence({...base,docked:true,obstacles:[{left:0,right:390,top,bottom:top+300}]});assert.deepEqual(p.point,companionDock(390,844,80));assert.equal(p.visible,true);}
});
test('intentional upward passage, dragging and skills retain their movement authority',()=>{
 const point={x:150,y:-80};
 assert.deepEqual(resolvePresence({...base,point,passing:true}).point,point);
 assert.deepEqual(resolvePresence({...base,point,dragging:true}).point,point);
 assert.equal(resolvePresence({...base,performing:true}).docked,false);
 assert.equal(resolvePresence(base).docked,false);
});

test('downward input restores presence even after an upward passage',()=>{
 assert.equal(scrollDisposition(-100),'pass');
 assert.equal(scrollDisposition(50),'dock');
 assert.equal(scrollDisposition(.5),'still');
 const missing=resolvePresence({...base,point:{x:150,y:-80},passing:true});
 const recovered=resolvePresence({...base,point:missing.point,docked:scrollDisposition(50)==='dock'});
 assert.equal(recovered.visible,true);assert.equal(recovered.docked,true);
});
