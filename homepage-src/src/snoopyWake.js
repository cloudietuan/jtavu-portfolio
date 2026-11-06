// Hold, sleepy blink, then a gradual push into the seated pose.
export const wakePoses = [
  [0, 300], [1, 220], [0, 150], [1, 180], [2, 230],
  [5, 160], [3, 150], [4, 150], [6, 180], [7, 180],
  [8, 170], [9, 160], [10, 160], [11, 170],
  [12, 120], [13, 120], [14, 120], [15, 280],
];
export const wakeDuration = wakePoses.reduce((total, [, duration]) => total + duration, 0);
export function wakeFrameAt(elapsed) {
  let end = 0;
  for (const [frame, duration] of wakePoses) {
    end += duration;
    if (elapsed < end) return frame;
  }
  return 15;
}
