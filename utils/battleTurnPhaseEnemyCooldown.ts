import { Enemy } from "../types";
import {
  type EnemySpecialTimelineProfile,
  getResolvedEnemySpecialCooldownSeconds,
} from "./battleProfiles";

export const resolveEnemySpecialReadyAfterAction = ({
  enemy,
  currentTimeMs,
  enemySpecialReady,
  enemySpecialReadyAtMs,
  enemySpecialTimelineProfile,
}: {
  enemy: Enemy;
  currentTimeMs: number;
  enemySpecialReady: boolean;
  enemySpecialReadyAtMs: number;
  enemySpecialTimelineProfile?: EnemySpecialTimelineProfile;
}) => {
  if (!enemySpecialReady || !enemy.specialAttack) {
    return enemySpecialReadyAtMs;
  }

  const specialCooldown = getResolvedEnemySpecialCooldownSeconds(enemy);
  return (
    currentTimeMs +
    Math.floor(specialCooldown * 1000) +
    (enemySpecialTimelineProfile?.executionTimeMs ?? 0)
  );
};
