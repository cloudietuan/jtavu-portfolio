import { useEffect, useRef } from 'react';
import frames from './snoopyFrames.json';
import actionFrames from './snoopyActionFrames.json';
import {drawBow} from './snoopyBow.js';
import {drawArticulated} from './snoopyArticulation.js';

const textures = {};
// A shared coarse sprite grid keeps sleeping and moving poses equally crisp.
const DEFAULT_GRID = 384;
// Every pose, whichever sheet it comes from, is redrawn on one shared pixel
// grid with one palette, so walking, sitting and action poses match exactly.
// This only re-samples the existing artwork; nothing is redrawn.
export const PIXEL_GRID = 192;
// Sleeping and waking use the wake sheet's own frames (the same style as
// standing), scaled so his head matches the walk sheet, with feet planted.
export const WAKE_SCALE = 1.1;
const WAKE_GROUND = [16.3, 16.6, 18, 2.9, -1.6, -2.7, -8.7, -20.4, -18, -19.8, -27.2, -20.6, -13.2, -13.1, -14.7, -14.5];
const WAKE_ORDER = [0, 1, 2, 5, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
// Paws centred, but never pushed past the canvas edge (the lying frames fill it).
export function wakeShift(frame, width = 0) {
  const room = Math.max(0, (384 - width) / 2);
  return Math.max(-room, Math.min(room, -WAKE_GROUND[frame] * WAKE_SCALE));
}
export const PALETTE = [[20, 20, 20], [255, 252, 244], [215, 48, 31]];
export function snapPixel(r, g, b, a) {
  if (a < 112) return [0, 0, 0, 0];
  // Only a clearly red pixel is the collar; soft brownish edge pixels are ink or paper.
  const best = r > 150 && g < 110 && b < 110 && r - Math.max(g, b) > 70 ? PALETTE[2] : (r * .299 + g * .587 + b * .114) < 140 ? PALETTE[0] : PALETTE[1];
  return [best[0], best[1], best[2], 255];
}
let scratch;
// Re-samples a drawn pose onto the shared pixel grid and returns a small canvas
// holding the result. Reading pixels back is the costly part, so results are cached.
function unifyPixels(ctx, size, snapColors) {
  if (typeof document === 'undefined') return null;
  scratch ||= document.createElement('canvas');
  scratch.width = scratch.height = PIXEL_GRID;
  const small = scratch.getContext('2d', { willReadFrequently: true });
  small.clearRect(0, 0, PIXEL_GRID, PIXEL_GRID);
  small.imageSmoothingEnabled = true; small.imageSmoothingQuality = 'high';
  small.drawImage(ctx.canvas, 0, 0, size, size, 0, 0, PIXEL_GRID, PIXEL_GRID);
  let image;
  try { image = small.getImageData(0, 0, PIXEL_GRID, PIXEL_GRID); } catch { return null; }
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const [r, g, b, a] = snapColors ? snapPixel(d[i], d[i + 1], d[i + 2], d[i + 3]) : [d[i], d[i + 1], d[i + 2], d[i + 3] < 112 ? 0 : 255];
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
  }
  const out = document.createElement('canvas');
  out.width = out.height = PIXEL_GRID;
  out.getContext('2d').putImageData(image, 0, 0);
  return out;
}
// Finished poses, keyed by everything that changes the picture. Walking,
// routines and wagging reuse a small set of poses, so after the first pass
// every frame is a single cheap drawImage instead of a pixel read-back.
const poseCache = new Map();
const POSE_CACHE_LIMIT = 90;
let work;
function rememberPose(key, value) {
  poseCache.set(key, value);
  if (poseCache.size > POSE_CACHE_LIMIT) poseCache.delete(poseCache.keys().next().value);
}
function loadTexture(name) {
  if (!textures[name]) {
    textures[name] = new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = name === 'actions' ? '/assets/snoopy-actions.webp' : `/assets/snoopy-${name === 'wake' ? 'wake-source' : 'walk'}.webp`;
    });
  }
  return textures[name];
}

export function SnoopySprite({ frame, walking, standing, facing = 1, grid = DEFAULT_GRID, action, actionProgress = 0, standingFrame = 2, head = 0, tail = 0 }) {
  const GRID = grid;
  const UNIT = GRID / 384;
  const canvas = useRef(null);
  useEffect(() => {
    let cancelled = false;
    const actionFrame = actionFrames[action];
    const name = action === 'bow' ? 'walk' : actionFrame ? 'actions' : walking || standing ? 'walk' : 'wake';
    // Progress only changes the picture for the ladder bob and the bow; step it so poses repeat.
    const progress = action === 'bow' || action === 'ladder' ? Math.round(Math.min(1, Math.max(0, actionProgress)) * 48) / 48 : 0;
    const key = `${name}|${action || ''}|${walking ? 1 : 0}|${standing ? 1 : 0}|${frame}|${standingFrame}|${facing < 0 ? -1 : 1}|${GRID}|${progress}|${head}|${tail}`;
    const paint = pixels => {
      if (cancelled || !canvas.current || !pixels) return;
      const ctx = canvas.current.getContext('2d');
      ctx.clearRect(0, 0, GRID, GRID);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(pixels, 0, 0, PIXEL_GRID, PIXEL_GRID, 0, 0, GRID, GRID);
    };
    const cached = poseCache.get(key);
    if (cached) { poseCache.delete(key); poseCache.set(key, cached); paint(cached); return () => { cancelled = true; }; }
    loadTexture('walk');
    loadTexture(name).then(texture => {
      if (cancelled || !canvas.current) return;
      if (poseCache.has(key)) { paint(poseCache.get(key)); return; }
      work ||= document.createElement('canvas');
      if (work.width !== GRID) { work.width = GRID; work.height = GRID; }
      const ctx = work.getContext('2d');
      const f = actionFrame || frames[name][walking ? frame : standing ? standingFrame : frame];
      const scale = actionFrame ? actionFrame.displayHeight / f.h : name === 'walk' ? 384 / f.sourceCell * .96 : WAKE_SCALE;
      const width = f.w * scale, height = f.h * scale;
      ctx.clearRect(0, 0, GRID, GRID);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (facing < 0) { ctx.translate(GRID, 0); ctx.scale(-1, 1); }
      // A bounded source rectangle prevents neighboring frames from appearing.
      // Every pose shares the same bottom-center foot anchor.
      const climbLift = action === 'ladder' ? Math.sin(progress * Math.PI * 8) * 3 : 0;
      const articulated = !actionFrame && action !== 'bow' && standing && !walking && standingFrame === 2 && (head || tail);
      if (articulated) {
        ctx.translate((384 - width) / 2 * UNIT, (383 - height) * UNIT);
        ctx.scale(scale * UNIT, scale * UNIT);
        drawArticulated(ctx, texture, f, { head, tail });
      } else if (action === 'bow') {
        ctx.translate((384 - width) / 2 * UNIT, (383 - height) * UNIT);
        ctx.scale(scale * UNIT, scale * UNIT);
        drawBow(ctx, texture, f, progress);
      } else ctx.drawImage(texture, f.x, f.y, f.w, f.h,
        ((384 - width) / 2 + (name === 'wake' ? wakeShift(frame, width) : 0)) * UNIT, (383 - height - climbLift) * UNIT, width * UNIT, height * UNIT);
      ctx.restore();
      const pixels = unifyPixels(ctx, GRID, true);
      if (pixels) rememberPose(key, pixels);
      paint(pixels);
    });
    return () => { cancelled = true; };
  }, [frame, walking, standing, facing, grid, action, actionProgress, standingFrame, head, tail]);
  return <canvas ref={canvas} className="wake-sprite" width={GRID} height={GRID} aria-hidden="true" />;
}
