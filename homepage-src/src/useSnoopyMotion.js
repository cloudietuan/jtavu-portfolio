import { useEffect, useRef, useState } from 'react';
import { advanceMovement } from './snoopyMovement';

// Position and velocity live outside React so speed is independent of frame rate.
export function useSnoopyMotion(phase, reduced) {
  const character = useRef(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const moveTo = useRef(() => {});
  const homeDestination = useRef(false);
  const velocityRef = useRef({ x: 0, y: 0 });
  const [atHome, setAtHome] = useState(false);
  const gait = useRef({ distance: 0, facing: 1, hasMoved: false });
  const [motion, setMotion] = useState({ walking: false, standing: false, frame: 0, facing: 1 });

  useEffect(() => {
    if (phase === 'sleep' || phase === 'open') {
      position.current = target.current = { x: 0, y: 0 };
      gait.current = { distance: 0, facing: 1, hasMoved: false };
      homeDestination.current = false; velocityRef.current = { x: 0, y: 0 }; setAtHome(false);
      character.current?.style.setProperty('--snoopy-x', '0px');
      character.current?.style.setProperty('--snoopy-y', '0px');
      setMotion({ walking: false, standing: false, frame: 0, facing: 1 });
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'open') return;
    const place = () => {
      const house = document.querySelector('.doghouse-letter');
      const sprite = character.current;
      if (!house || !sprite) return;
      const h = house.getBoundingClientRect(), scene = sprite.parentElement.getBoundingClientRect();
      sprite.style.left = `${h.left + h.width / 2 - scene.left}px`;
      sprite.style.width = `${h.width * .56}px`;
      sprite.style.bottom = `${scene.bottom - h.bottom + h.height * .008}px`;
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [phase]);

  useEffect(() => {
    if (!['emerging', 'dialogue', 'ready', 'open'].includes(phase)) return;
    const move = (x, y) => {
      setAtHome(false); homeDestination.current = false;
      const box = character.current.getBoundingClientRect();
      const anchorX = box.left + box.width / 2 - position.current.x;
      const anchorY = box.bottom - position.current.y;
      target.current = {
        x: Math.max(box.width / 2 + 12, Math.min(innerWidth - box.width / 2 - 12, x)) - anchorX,
        y: Math.max(box.height + 24, Math.min(innerHeight - 55, y)) - anchorY,
      };
    };
    moveTo.current = move;
    if (phase === 'emerging') {
      const house = document.querySelector('.doghouse-letter').getBoundingClientRect();
      target.current = { x: 0, y: house.height * .075 };
    }
    const pointer = e => {
      if (e.target.closest('button, a, summary, input, select, textarea, .speech, .intro-controls, .design-editor')) return;
      move(e.clientX, e.clientY);
    };
    const keyboard = e => {
      if (e.target.closest('button, a, summary, input, select, textarea, .design-editor')) return;
      const directions = { ArrowLeft: [-90, 0], ArrowRight: [90, 0], ArrowUp: [0, -90], ArrowDown: [0, 90] };
      if (!directions[e.key]) return;
      e.preventDefault();
      const box = character.current.getBoundingClientRect();
      move(box.left + box.width / 2 + directions[e.key][0], box.bottom + directions[e.key][1]);
    };
    let id, last = performance.now(), velocity = velocityRef.current;
    const tick = now => {
      const dt = Math.min((now - last) / 1000, .04);
      last = now;
      const p = position.current, t = target.current;
      const dx = t.x - p.x, dy = t.y - p.y, distance = Math.hypot(dx, dy);
      if (distance > .5) {
        const update = reduced
          ? { position: { ...t }, velocity: { x: 0, y: 0 }, travelled: distance }
          : advanceMovement(p, t, velocity, dt);
        p.x = update.position.x;
        p.y = update.position.y;
        velocity = update.velocity;
        const step = update.travelled;
        const g = gait.current;
        if (Math.abs(velocity.x) > 5) g.facing = velocity.x > 0 ? 1 : -1;
        g.hasMoved = true;
        g.distance += step;
        // Advance feet by distance travelled: slow movement means slower steps.
        const frame = Math.floor(g.distance / 14) % 8;
        character.current.style.setProperty('--snoopy-x', `${p.x}px`);
        character.current.style.setProperty('--snoopy-y', `${p.y}px`);
        setMotion(old => old.walking === !reduced && old.frame === frame && old.facing === g.facing
          ? old : { walking: !reduced, standing: reduced, frame, facing: g.facing });
      } else {
        velocity = { x: 0, y: 0 };
        p.x = t.x; p.y = t.y;
        character.current.style.setProperty('--snoopy-x', `${p.x}px`);
        character.current.style.setProperty('--snoopy-y', `${p.y}px`);
        setMotion(old => old.walking ? { walking: false, standing: true, frame: 2, facing: gait.current.facing } : old);
        if (homeDestination.current) { homeDestination.current = false; setAtHome(true); }
      }
      velocityRef.current = velocity;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    window.addEventListener('pointerdown', pointer);
    window.addEventListener('keydown', keyboard);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('pointerdown', pointer);
      window.removeEventListener('keydown', keyboard);
      moveTo.current = () => {};
    };
  }, [phase, reduced]);
  function goHome() {
    if (atHome) {
      setAtHome(false); homeDestination.current = false; target.current = { x: 0, y: 0 }; return;
    }
    const door = document.querySelector('.doghouse-letter');
    if (!door) return;
    const box = door.getBoundingClientRect();
    moveTo.current(box.left + box.width / 2, box.bottom);
    homeDestination.current = true;
  }
  function visitProject(element) {
    if (phase !== 'open' || !element) return;
    const box = element.getBoundingClientRect();
    // Settle at the project edge, leaving its title and link clear.
    moveTo.current(box.right - 36, Math.min(box.top + 200, box.bottom - 36));
  }
  return { character, motion, atHome, goHome, visitProject };
}
