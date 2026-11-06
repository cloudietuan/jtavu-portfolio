import { useEffect, useRef } from 'react';
import frames from './snoopyFrames.json';

const textures = {};
// A shared coarse sprite grid keeps sleeping and moving poses equally crisp.
const DEFAULT_GRID = 384;
function loadTexture(name) {
  if (!textures[name]) {
    textures[name] = new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = name === 'sleep' ? '/assets/snoopy-sleep-door.png' : `/assets/snoopy-${name === 'wake' ? 'wake-source' : 'walk'}.png`;
    });
  }
  return textures[name];
}

export function SnoopySprite({ frame, walking, standing, facing = 1, grid = DEFAULT_GRID }) {
  const GRID = grid;
  const UNIT = GRID / 384;
  const canvas = useRef(null);
  useEffect(() => {
    let cancelled = false;
    const name = walking || standing ? 'walk' : frame < 3 ? 'sleep' : 'wake';
    loadTexture('walk');
    loadTexture(name).then(texture => {
      if (cancelled || !canvas.current) return;
      const ctx = canvas.current.getContext('2d');
      const f = name === 'sleep' ? { x:0, y:0, w:texture.width, h:texture.height } : frames[name][walking ? frame : standing ? 2 : frame];
      const scale = name === 'sleep' ? 230 / f.w : name === 'walk' ? 384 / f.sourceCell * .96 : 1;
      const width = f.w * scale, height = f.h * scale;
      ctx.clearRect(0, 0, GRID, GRID);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (facing < 0) { ctx.translate(GRID, 0); ctx.scale(-1, 1); }
      // A bounded source rectangle prevents neighboring frames from appearing.
      // Every pose shares the same bottom-center foot anchor.
      ctx.drawImage(texture, f.x, f.y, f.w, f.h,
        (384 - width) / 2 * UNIT, (376 - height) * UNIT, width * UNIT, height * UNIT);
      ctx.restore();

    });
    return () => { cancelled = true; };
  }, [frame, walking, standing, facing, grid]);
  return <canvas ref={canvas} className="wake-sprite" width={GRID} height={GRID} aria-hidden="true" />;
}
