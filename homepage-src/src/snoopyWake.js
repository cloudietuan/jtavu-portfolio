// Stretch then stand: asleep, a couple of sleepy blinks, eyes open, a big
// play-bow stretch, then he stands up and shakes it off. 'stand' means the
// standing pose from the walk sheet.
export const STAND = 'stand';
export const wakePoses = [
  [0, 360], [1, 240], [0, 180], [1, 220], [2, 380],
  [5, 200], [6, 820], [7, 170], [STAND, 620],
];
export const wakeDuration = wakePoses.reduce((total, [, duration]) => total + duration, 0);
export function wakeFrameAt(elapsed) {
  let end = 0;
  for (const [frame, duration] of wakePoses) {
    end += duration;
    if (elapsed < end) return frame;
  }
  return STAND;
}
