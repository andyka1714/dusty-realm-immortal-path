import { resolveEnemyIncapacitatedTurn } from "./battleEncounter";
import type { EnemySkippedActionWindowArgs } from "./battleTurnPhaseEnemyArgTypes";
import type { SkippedEnemyActionWindow } from "./battleTurnPhaseEnemyTypes";

export const resolveSkippedEnemyActionWindow = ({
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
}: EnemySkippedActionWindowArgs): SkippedEnemyActionWindow => ({
  skipped: true,
  ...resolveEnemyIncapacitatedTurn({
    currentTimeMs,
    enemy,
    enemyAttackIntervalMs,
    hasSwordHeartPassive,
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
    logs,
    turn,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  }),
});
