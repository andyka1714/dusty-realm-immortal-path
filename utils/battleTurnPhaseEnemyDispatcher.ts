import { resolveEnemyActionPhase } from "./battleTurnPhaseEnemyActionPhase";
import type { EnemyTurnPhaseDispatcherArgs } from "./battleTurnPhaseEnemyArgTypes";
import { isResolvedEnemyActionWindow } from "./battleTurnPhaseEnemyGuards";
import type {
  EnemyTurnPhaseResult,
} from "./battleTurnPhaseEnemyTypes";

export const resolveEnemyTurnPhaseResult = ({
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
}: EnemyTurnPhaseDispatcherArgs): EnemyTurnPhaseResult => {
  if (!isResolvedEnemyActionWindow(enemyActionWindow)) {
    return {
      skipped: true,
      enemyNextActionMs: enemyActionWindow.enemyNextActionMs,
      swordHeartStacks: enemyActionWindow.swordHeartStacks,
      playerDamagedSinceSwordHeartWindow:
        enemyActionWindow.playerDamagedSinceSwordHeartWindow,
    };
  }

  return {
    skipped: false,
    ...resolveEnemyActionPhase({
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
    }),
  };
};
