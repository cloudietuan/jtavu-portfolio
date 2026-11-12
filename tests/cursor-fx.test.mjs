import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/CursorFx.jsx',import.meta.url),'utf8');
const {cursorLabel,CURSOR_LABELS}=await import('data:text/javascript,'+encodeURIComponent(src.slice(src.indexOf('export const CURSOR_LABELS'),src.indexOf('export function CursorFx'))));
const el=matches=>({closest:s=>matches.some(m=>s.includes(m))?{}:null});
test('the cursor names what a click will do, and stays quiet elsewhere',()=>{
 assert.equal(cursorLabel(el(['.canvas .object'])),'Drag');
 assert.equal(cursorLabel(el(['.story-image'])),'Quick take');
 assert.equal(cursorLabel(el(['.snoopy-companion'])),'Toss');
 // Snoopy standing on a draggable card: he wins.
 assert.equal(cursorLabel(el(['.snoopy-companion','.canvas .object'])),'Toss');
 assert.equal(cursorLabel(el([])),'');assert.equal(cursorLabel(null),'');
 assert.ok(CURSOR_LABELS.every(([,l])=>l.length<=10));
});
