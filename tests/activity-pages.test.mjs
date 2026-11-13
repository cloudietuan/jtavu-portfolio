import test from 'node:test';
import assert from 'node:assert/strict';
import {activityList,routeOf,panelsOf,neighbours,slugOf} from '../src/activities.js';
import {experience} from '../src/experience.js';
import {readFileSync,readdirSync} from 'node:fs';

test('every activity has its own unique page',()=>{
 const total=experience.reduce((n,g)=>n+g.items.length,0);
 assert.equal(activityList.length,total);
 assert.equal(new Set(activityList.map(a=>a.slug)).size,total);
 for(const a of activityList)assert.deepEqual(routeOf(`#/a/${a.slug}`),{page:'activity',slug:a.slug});
});

test('routes',()=>{
 assert.equal(routeOf('#work'),null);assert.equal(routeOf(''),null);
 assert.deepEqual(routeOf('#/resume'),{page:'resume'});
 assert.deepEqual(routeOf('#/a/nope'),{page:'missing'});
 assert.equal(slugOf('Paletté'),'palette');
});

test('panels keep every sentence',()=>{
 for(const a of activityList){const p=panelsOf(a);assert.equal(p[0].caption,'What I did');assert.equal(p.map(x=>x.text).join(' '),a.line.trim());}
});

test('pager wraps around',()=>{
 const first=activityList[0],last=activityList.at(-1);
 assert.equal(neighbours(first.slug).prev.slug,last.slug);assert.equal(neighbours(last.slug).next.slug,first.slug);
});

test('nothing links back to jtavu.com',()=>{
 for(const f of readdirSync('src').filter(f=>/\.(jsx?|css)$/.test(f))){
  const code=readFileSync(`src/${f}`,'utf8').replace(/\/\/.*$/gm,'');
  assert.ok(!/https?:\/\/(www\.)?jtavu\.com/.test(code),f);
 }
});
