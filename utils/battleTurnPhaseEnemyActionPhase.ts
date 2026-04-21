import { resolveEnemyActionAftermath } from "./battleTurnPhaseEnemyAftermath";
import type { EnemyActionPhaseArgs } from "./battleTurnPhaseEnemyArgTypes";
import { finalizeEnemyActionPhase } from "./battleTurnPhaseEnemyFinalization";
import type {
  ResolveEnemyActionPhaseResult,
} from "./battleTurnPhaseEnemyTypes";

export const resolveEnemyActionPhase = ({
  enemyActionWindow,
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  swordDeathWardUsed,
  bodyTribulationStacks,
  bodyRebirthTrueUsed,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  enemyAttackIntervalMs,
  dependencies,
}: EnemyActionPhaseArgs): ResolveEnemyActionPhaseResult => {
  let { enemyDamage } = enemyActionWindow;

  ({
    enemyDamage,
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
  } = resolveEnemyActionAftermath({
    enemyActionWindow,
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
    dependencies,
  }));

  return finalizeEnemyActionPhase({
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
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
    enemyAttackIntervalMs,
    hasSwordHeartPassive,
    enemyDamage,
  });
};
