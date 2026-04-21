import {
  type BuildEnemyWorldStrikeResultOptions,
} from "./battleWorldStrikeEnemyTypes";
import {
  type EnemySpecialTimelineProfile,
  getEnemyAttackIntervalMs,
  getResolvedEnemySpecialCooldownSeconds,
} from "./battleProfiles";
import type { EnemyWorldStrikeResolved } from "./battleWorldStrike";
import { buildEnemyWorldStrikeStatusNames } from "./battleWorldStrikeEnemyStatuses";

const buildEnemyWorldStrikeTiming = ({
  enemy,
  special,
  timelineProfile,
}: {
  enemy: BuildEnemyWorldStrikeResultOptions["enemy"];
  special?: BuildEnemyWorldStrikeResultOptions["special"];
  timelineProfile: EnemySpecialTimelineProfile;
}) => ({
  nextActionDelayMs: getEnemyAttackIntervalMs(enemy),
  specialCooldownMs: special
    ? Math.floor(getResolvedEnemySpecialCooldownSeconds(enemy) * 1000)
    : 0,
  executionTimeMs: timelineProfile.executionTimeMs,
  areaShape: timelineProfile.areaShape,
  areaRadius: timelineProfile.areaRadius,
  isProjectile: timelineProfile.isProjectile,
});

export const buildEnemyWorldStrikeResult = ({
  damage,
  special,
  timelineProfile,
  incomingStatuses,
  passiveFlags,
  preBodySaintDamage,
  player,
  enemy,
  voidEvasion,
  bodyFoundationStacks,
  copperSkinTriggered,
  bodyFusionTriggered,
  elementalBarrierTriggered,
  reflectTriggered,
  bodyTribulationTriggered,
  mageTribulationTriggered,
  bodyRebirthTrueTriggered,
  bodyEmperorTriggered,
  swordDeathWardTriggered,
}: BuildEnemyWorldStrikeResultOptions): EnemyWorldStrikeResolved => ({
  damage,
  skillName: special?.name,
  statusNames: buildEnemyWorldStrikeStatusNames({
    incomingStatuses,
    passiveFlags,
    preBodySaintDamage,
    playerMaxHp: player.maxHp,
    enemyElement: enemy.element,
    voidEvasion,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    bodyRebirthTrueTriggered,
    swordDeathWardTriggered,
    bodyEmperorTriggered,
  }),
  ...buildEnemyWorldStrikeTiming({
    enemy,
    special,
    timelineProfile,
  }),
});
