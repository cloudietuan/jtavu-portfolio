// Monotonic timestamps keep the three-second contract independent of frame rate.
export const PORTAL_WAIT_MS = 3000;
export function portalTransition(state, event, now) {
  if (event.type === 'cancel' || event.type === 'complete') return null;
  if (event.type === 'scroll') {
    if (Math.abs(event.delta) <= 1) return state;
    if (event.delta < -1 || state || event.follow) return {stage:'passing', deadline:now + PORTAL_WAIT_MS};
    return null;
  }
  if (event.type === 'tick' && state?.stage === 'passing' && now >= state.deadline) return {stage:'pop', started:now};
  return state;
}
