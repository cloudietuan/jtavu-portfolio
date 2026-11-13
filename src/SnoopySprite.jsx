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
export const PIXEL_GRID = 96;
// Sleeping and waking use the wake sheet's own frames (the same style as
// standing), scaled so his head matches the walk sheet, with feet planted.
export const WAKE_SCALE = 1.1;
const WAKE_GROUND = [16.3, 16.6, 18, 2.9, -1.6, -2.7, -8.7, -20.4, -18, -19.8, -27.2, -20.6, -13.2, -13.1, -14.7, -14.5];
const WAKE_ORDER = [0, 1, 2, 5, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
export function wakeShift(frame) {
  const i = Math.max(0, WAKE_ORDER.indexOf(frame));
  return (17 - 31 * (i / (WAKE_ORDER.length - 1)) - WAKE_GROUND[frame]) * WAKE_SCALE;
}
export const PALETTE = [[20, 20, 20], [255, 252, 244], [215, 48, 31]];
export function snapPixel(r, g, b, a) {
  if (a < 112) return [0, 0, 0, 0];
  // Only a clearly red pixel is the collar; soft brownish edge pixels are ink or paper.
  const best = r > 150 && g < 110 && b < 110 && r - Math.max(g, b) > 70 ? PALETTE[2] : (r * .299 + g * .587 + b * .114) < 140 ? PALETTE[0] : PALETTE[1];
  return [best[0], best[1], best[2], 255];
}
let scratch;
function unifyPixels(ctx, size, snapColors) {
  if (typeof document === 'undefined') return;
  scratch ||= document.createElement('canvas');
  scratch.width = scratch.height = PIXEL_GRID;
  const small = scratch.getContext('2d', { willReadFrequently: true });
  small.clearRect(0, 0, PIXEL_GRID, PIXEL_GRID);
  small.imageSmoothingEnabled = true; small.imageSmoothingQuality = 'high';
  small.drawImage(ctx.canvas, 0, 0, size, size, 0, 0, PIXEL_GRID, PIXEL_GRID);
  let image;
  try { image = small.getImageData(0, 0, PIXEL_GRID, PIXEL_GRID); } catch { return; }
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const [r, g, b, a] = snapColors ? snapPixel(d[i], d[i + 1], d[i + 2], d[i + 3]) : [d[i], d[i + 1], d[i + 2], d[i + 3] < 112 ? 0 : 255];
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
  }
  small.putImageData(image, 0, 0);
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scratch, 0, 0, PIXEL_GRID, PIXEL_GRID, 0, 0, size, size);
}
function loadTexture(name) {
  if (!textures[name]) {
    textures[name] = new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = name === 'actions' ? '/assets/snoopy-actions.png' : `/assets/snoopy-${name === 'wake' ? 'wake-source' : 'walk'}.png`;
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
    loadTexture('walk');
    loadTexture(name).then(texture => {
      if (cancelled || !canvas.current) return;
      const ctx = canvas.current.getContext('2d');
      const f = actionFrame || frames[name][walking ? frame : standing ? standingFrame : frame];
      const scale = actionFrame ? actionFrame.displayHeight / f.h : name === 'walk' ? 384 / f.sourceCell * .96 : WAKE_SCALE;
      const width = f.w * scale, height = f.h * scale;
      ctx.clearRect(0, 0, GRID, GRID);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (facing < 0) { ctx.translate(GRID, 0); ctx.scale(-1, 1); }
      // A bounded source rectangle prevents neighboring frames from appearing.
      // Every pose shares the same bottom-center foot anchor.
      const climbLift = action === 'ladder' ? Math.sin(Math.min(1, Math.max(0, actionProgress)) * Math.PI * 8) * 3 : 0;
      const articulated = !actionFrame && action !== 'bow' && standing && !walking && standingFrame === 2 && (head || tail);
      if (articulated) {
        ctx.translate((384 - width) / 2 * UNIT, (376 - height) * UNIT);
        ctx.scale(scale * UNIT, scale * UNIT);
        drawArticulated(ctx, texture, f, { head, tail });
      } else if (action === 'bow') {
        ctx.translate((384 - width) / 2 * UNIT, (376 - height) * UNIT);
        ctx.scale(scale * UNIT, scale * UNIT);
        drawBow(ctx, texture, f, actionProgress);
      } else ctx.drawImage(texture, f.x, f.y, f.w, f.h,
        ((384 - width) / 2 + (name === 'wake' ? wakeShift(frame) : 0)) * UNIT, (376 - height - climbLift) * UNIT, width * UNIT, height * UNIT);
      ctx.restore();
      unifyPixels(ctx, GRID, true);
    });
    return () => { cancelled = true; };
  }, [frame, walking, standing, facing, grid, action, actionProgress, standingFrame, head, tail]);
  return <canvas ref={canvas} className="wake-sprite" width={GRID} height={GRID} aria-hidden="true" />;
}
