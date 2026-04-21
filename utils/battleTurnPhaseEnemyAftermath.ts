import type { EnemyActionAftermathArgs } from "./battleTurnPhaseEnemyArgTypes";
import type {
  ResolveEnemyTurnAftermathResult,
} from "./battleTurnPhaseEnemyTypes";

export const resolveEnemyActionAftermath = ({
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
}: EnemyActionAftermathArgs): ResolveEnemyTurnAftermathResult =>
  dependencies.resolveEnemyTurnAftermath({
    enemyDamage: enemyActionWindow.enemyDamage,
    isDodge: enemyActionWindow.isDodge,
    voidEvasion: enemyActionWindow.voidEvasion,
    isBlock: enemyActionWindow.isBlock,
    enemySpecialReady: enemyActionWindow.enemySpecialReady,
    currentTimeMs,
    turn,
    logs,
    enemy,
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    passiveFlags,
    bodyFoundationStacks: enemyActionWindow.bodyFoundationStacks,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
  });
