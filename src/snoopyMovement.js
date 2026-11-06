export function advanceMovement(position, target, velocity, delta) {
  const dt = Math.max(0, Math.min(delta, .04));
  const dx = target.x - position.x, dy = target.y - position.y;
  const distance = Math.hypot(dx, dy);
  if (distance < .5) return { position: { ...target }, velocity: { x: 0, y: 0 }, travelled: 0, moving: false };
  const speed = Math.min(180, distance * 5);
  const blend = 1 - Math.exp(-dt * 10);
  const v = {
    x: velocity.x + (dx / distance * speed - velocity.x) * blend,
    y: velocity.y + (dy / distance * speed - velocity.y) * blend,
  };
  const sx = v.x * dt, sy = v.y * dt;
  const travelled = Math.hypot(sx, sy);
  if (travelled >= distance && sx * dx + sy * dy > 0) {
    return { position: { ...target }, velocity: { x: 0, y: 0 }, travelled: distance, moving: false };
  }
  return { position: { x: position.x + sx, y: position.y + sy }, velocity: v, travelled, moving: true };
}
