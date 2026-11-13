import { useEffect, useRef } from 'react';
import frames from './snoopyFrames.json';

// One renderer for every state on the landing page: asleep, waking and
// standing. Sleeping uses the wake sheet's own eyes-closed frames, so the
// sleeping Snoopy is drawn in exactly the same style as the standing one.
// Every pose is redrawn on one shared pixel grid with one palette.
// This only re-samples existing artwork; nothing is redrawn by hand.
const DEFAULT_GRID = 384;
export const PIXEL_GRID = 192;
export const PALETTE = [[20, 20, 20], [255, 252, 244], [215, 48, 31]];
// The wake sheet is drawn about 10% smaller than the walk sheet. Scaling it
// up keeps his head the same size when he stands, so he does not grow.
export const WAKE_SCALE = 1.1;
// Where each wake frame's paws sit relative to its own box centre (measured
// from the sheet). Feet are planted on a smooth path instead, so he does not
// jitter sideways between frames.
export const WAKE_GROUND = [16.3, 16.6, 18, 2.9, -1.6, -2.7, -8.7, -20.4, -18, -19.8, -27.2, -20.6, -13.2, -13.1, -14.7, -14.5];
// The order the frames play in while he wakes, used for that smooth path.
export const WAKE_ORDER = [0, 1, 2, 5, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
// Paws centred, but never pushed past the canvas edge (the lying frames fill it).
export function wakeShift(frame, width = 0) {
  const room = Math.max(0, (384 - width) / 2);
  return Math.max(-room, Math.min(room, -WAKE_GROUND[frame] * WAKE_SCALE));
}
export function snapPixel(r, g, b, a) {
  if (a < 112) return [0, 0, 0, 0];
  const best = r > 150 && g < 110 && b < 110 && r - Math.max(g, b) > 70 ? PALETTE[2] : (r * .299 + g * .587 + b * .114) < 140 ? PALETTE[0] : PALETTE[1];
  return [best[0], best[1], best[2], 255];
}
let scratch;
function unifyPixels(ctx, size) {
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
    const [r, g, b, a] = snapPixel(d[i], d[i + 1], d[i + 2], d[i + 3]);
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
  }
  small.putImageData(image, 0, 0);
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scratch, 0, 0, PIXEL_GRID, PIXEL_GRID, 0, 0, size, size);
}

const textures = {};
function loadTexture(name) {
  if (!textures[name]) {
    textures[name] = new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = `/assets/snoopy-${name === 'wake' ? 'wake-source' : 'walk'}.png`;
    });
  }
  return textures[name];
}
// Load both sheets up front so the first wake frame never waits on a download.
if (typeof window !== 'undefined') { loadTexture('wake'); loadTexture('walk'); }

export function SnoopySprite({ frame, walking, standing, facing = 1, grid = DEFAULT_GRID, settle = false }) {
  const GRID = grid;
  const UNIT = GRID / 384;
  const canvas = useRef(null);
  const last = useRef(null);
  useEffect(() => {
    let cancelled = false;
    const name = walking || standing ? 'walk' : 'wake';
    loadTexture(name).then(texture => {
      if (cancelled || !canvas.current) return;
      const ctx = canvas.current.getContext('2d');
      const f = frames[name][walking ? frame : standing ? 2 : frame];
      const scale = name === 'walk' ? 384 / f.sourceCell * .96 : WAKE_SCALE;
      const width = f.w * scale, height = f.h * scale;
      const shift = name === 'wake' ? wakeShift(frame, width) : 0;
      ctx.clearRect(0, 0, GRID, GRID);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (facing < 0) { ctx.translate(GRID, 0); ctx.scale(-1, 1); }
      // A bounded source rectangle prevents neighbouring frames from appearing.
      // Every pose shares the same bottom-centre foot anchor, flush with the bottom
      // of his box so his feet (or body, lying down) touch the surface.
      ctx.drawImage(texture, f.x, f.y, f.w, f.h,
        ((384 - width) / 2 + shift) * UNIT, (383 - height) * UNIT, width * UNIT, height * UNIT);
      ctx.restore();
      unifyPixels(ctx, GRID);
      // A tiny squash-and-settle on each new pose joins the frames into one motion.
      const key = `${name}${frame}`;
      if (settle && last.current !== null && last.current !== key && canvas.current.animate) {
        canvas.current.animate([{ transform: 'scale(1.035,.955)' }, { transform: 'scale(.99,1.012)' }, { transform: 'none' }], { duration: 170, easing: 'ease-out' });
      }
      last.current = key;
    });
    return () => { cancelled = true; };
  }, [frame, walking, standing, facing, grid, settle]);
  return <canvas ref={canvas} className="wake-sprite" width={GRID} height={GRID} aria-hidden="true" style={{ transformOrigin: '50% 98%' }} />;
}
