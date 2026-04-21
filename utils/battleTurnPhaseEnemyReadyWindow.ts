import { applyEnemySpecialTimingDelay } from "./battleEncounter";
import { getEnemySpecialTimelineProfile } from "./battleProfiles";
import type { EnemyReadyActionWindowArgs } from "./battleTurnPhaseEnemyArgTypes";
import type { ResolvedEnemyActionWindow } from "./battleTurnPhaseEnemyTypes";

export const resolveReadyEnemyActionWindow = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerStatuses,
  enemyStatuses,
  playerHp,
  playerMp,
  enemyHp,
  enemySpecialReadyAtMs,
  bodyTribulationStacks,
  dependencies,
}: EnemyReadyActionWindowArgs): ResolvedEnemyActionWindow => {
  enemySpecialReadyAtMs = applyEnemySpecialTimingDelay({
    logs,
    turn,
    timeMs: currentTimeMs,
    enemy,
    enemyStatuses,
    enemySpecialReadyAtMs,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  const enemySpecialReady =
    Boolean(enemy.specialAttack) && currentTimeMs >= enemySpecialReadyAtMs;
  const enemySpecialTimelineProfile = enemySpecialReady
    ? getEnemySpecialTimelineProfile(enemy)
    : undefined;
  const offenseRoll = dependencies.resolveEnemyOffenseRoll({
    enemy,
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    enemyStatuses,
    playerStatuses,
    currentTimeMs,
    enemySpecialReady,
    enemySpecialTimelineProfile,
    passiveFlags,
    bodyTribulationStacks,
  });

  return {
    skipped: false,
    enemySpecialReadyAtMs,
    enemySpecialReady,
    enemySpecialTimelineProfile,
    ...offenseRoll,
  };
};
