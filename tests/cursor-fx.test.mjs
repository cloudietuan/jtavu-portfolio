import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/CursorFx.jsx',import.meta.url),'utf8');
const mod=await import('data:text/javascript,'+encodeURIComponent(src.slice(src.indexOf('export const CURSOR_MODES'),src.indexOf('function Arrow'))));
const {cursorMode,ARROW}=mod;
const el=matches=>({closest:s=>matches.some(m=>s.includes(m))?{}:null});
test('the pixel cursor changes state for what a click will do',()=>{
 assert.equal(cursorMode(el(['.canvas .object'])),'grab');
 assert.equal(cursorMode(el(['.snoopy-companion'])),'grab');
 assert.equal(cursorMode(el(['.intro-blind-pull'])),'grab');
 assert.equal(cursorMode(el(['button'])),'point');
 assert.equal(cursorMode(el(['[data-preview]'])),'point');
 assert.equal(cursorMode(el(['textarea'])),'text');
 // Snoopy standing on a link: grabbing him wins.
 assert.equal(cursorMode(el(['.snoopy-companion','button'])),'grab');
 assert.equal(cursorMode(el([])),'');assert.equal(cursorMode(null),'');
});
test('the arrow sprite fits its 12 x 17 grid and only uses its three pixel kinds',()=>{
 assert.equal(ARROW.length,17);
 assert.ok(ARROW.every(r=>r.length<=12&&/^[oxw ]*$/.test(r)));
 assert.equal(ARROW[0],'o');
});
test('no cursor ring is left behind',()=>{
 assert.ok(!src.includes('cursor-ring'));
 const css=fs.readFileSync(new URL('../src/comic.css',import.meta.url),'utf8');
 assert.ok(!css.includes('.cursor-ring'));
});
