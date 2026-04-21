import type { EnemyActionFinalizationArgs } from "./battleTurnPhaseEnemyArgTypes";
import { resolveEnemySpecialReadyAfterAction } from "./battleTurnPhaseEnemyCooldown";
import { resolveEnemySwordHeartAftermath } from "./battleTurnPhaseEnemySwordHeart";
import type {
  ResolveEnemyActionPhaseResult,
} from "./battleTurnPhaseEnemyTypes";

export const finalizeEnemyActionPhase = ({
  enemyActionWindow,
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  playerHp,
  playerMp,
  enemyHp,
  enemyStatuses,
  playerStatuses,
  swordDeathWardUsed,
  bodyTribulationStacks,
  bodyRebirthTrueUsed,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  enemyAttackIntervalMs,
  enemyDamage,
}: EnemyActionFinalizationArgs): ResolveEnemyActionPhaseResult => {
  ({
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
  } = resolveEnemySwordHeartAftermath({
    enemyDamage,
    isDodge: enemyActionWindow.isDodge,
    voidEvasion: enemyActionWindow.voidEvasion,
    hasSwordHeartPassive,
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
    logs,
    turn,
    currentTimeMs,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  }));

  const enemySpecialReadyAtMs = resolveEnemySpecialReadyAfterAction({
    enemy,
    currentTimeMs,
    enemySpecialReady: enemyActionWindow.enemySpecialReady,
    enemySpecialReadyAtMs: enemyActionWindow.enemySpecialReadyAtMs,
    enemySpecialTimelineProfile: enemyActionWindow.enemySpecialTimelineProfile,
  });

  return {
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    enemyStatuses,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
    enemySpecialReadyAtMs,
    enemyNextActionMs: currentTimeMs + enemyAttackIntervalMs,
  };
};
