import type {
  CombatTimerBucket,
  CombatTimerBuckets,
} from "./battleLifecycleTypes";

export const createCombatTimerBuckets = (): CombatTimerBuckets => ({
  world: new Set(),
  replay: new Set(),
});

export const clearCombatTimerBucket = (
  timerBuckets: CombatTimerBuckets,
  bucket: CombatTimerBucket
) => {
  timerBuckets[bucket].forEach((timer) => clearTimeout(timer));
  timerBuckets[bucket].clear();
};

export const clearAllCombatTimers = (timerBuckets: CombatTimerBuckets) => {
  clearCombatTimerBucket(timerBuckets, "world");
  clearCombatTimerBucket(timerBuckets, "replay");
};
