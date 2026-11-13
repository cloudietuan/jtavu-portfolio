import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/SnoopySprite.jsx',import.meta.url),'utf8');
const {snapPixel,PALETTE,PIXEL_GRID}=await import('data:text/javascript,'+encodeURIComponent(src.slice(src.indexOf('export const PIXEL_GRID'),src.indexOf('let scratch;'))));
test('every sprite pixel snaps to the one shared palette',()=>{
 assert.deepEqual(snapPixel(8,8,8,255),[...PALETTE[0],255]);
 assert.deepEqual(snapPixel(250,246,238,255),[...PALETTE[1],255]);
 assert.deepEqual(snapPixel(200,30,20,255),[...PALETTE[2],255]);
 assert.deepEqual(snapPixel(120,60,50,255),[...PALETTE[0],255],'brownish edge pixels are ink, not collar red');
 // Soft, anti-aliased edge pixels become either solid or empty, never a blur.
 assert.deepEqual(snapPixel(120,120,120,60),[0,0,0,0]);
 assert.equal(snapPixel(150,150,150,200)[3],255);
 for(let v=0;v<=255;v+=15){const p=snapPixel(v,v,v,255);assert.ok(PALETTE.some(c=>c[0]===p[0]&&c[1]===p[1]&&c[2]===p[2]));}
 assert.equal(384%PIXEL_GRID,0,'the pixel grid divides the canvas evenly');
});
