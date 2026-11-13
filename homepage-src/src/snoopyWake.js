// Sleeping, a groggy blink or two, eyes open, then one continuous push up into
// a sit. Holds ease out as he rises so the frames read as a single motion.
export const wakePoses = [
  [0, 340], [1, 240], [0, 170], [1, 200], [2, 300],
  [5, 170], [3, 150], [4, 160], [6, 140], [7, 130],
  [8, 120], [9, 120], [10, 120], [11, 140],
  [12, 120], [13, 120], [14, 150], [15, 320],
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
