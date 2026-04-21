import { hasIncapacitatingStatus } from "./battleTurnPhaseEnemyIncapacitation";
import type { EnemyActionWindowArgs } from "./battleTurnPhaseEnemyArgTypes";
import type {
  EnemyActionWindowResult,
} from "./battleTurnPhaseEnemyTypes";
import { resolveReadyEnemyActionWindow } from "./battleTurnPhaseEnemyReadyWindow";
import { resolveSkippedEnemyActionWindow } from "./battleTurnPhaseEnemySkippedWindow";

export const resolveEnemyActionWindow = ({
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
  enemyAttackIntervalMs,
  enemySpecialReadyAtMs,
  bodyTribulationStacks,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  dependencies,
}: EnemyActionWindowArgs): EnemyActionWindowResult => {
  if (hasIncapacitatingStatus(enemyStatuses, currentTimeMs)) {
    return resolveSkippedEnemyActionWindow({
      currentTimeMs,
      enemy,
      enemyAttackIntervalMs,
      hasSwordHeartPassive,
      playerDamagedSinceSwordHeartWindow,
      swordHeartStacks,
      logs,
      turn,
      player,
      playerHp,
      enemyHp,
    });
  }

  return resolveReadyEnemyActionWindow({
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
  });
};
