import {
  applyPeriodicPassiveStatuses,
  rollBossBreakOpportunity,
} from "./battleEncounter";
import type { PlayerPreludeArgs } from "./battleTurnPhasePlayerArgTypes";
import type { ResolvePlayerPreludeResult } from "./battleTurnPhasePlayerTypes";

export const resolvePlayerPrelude = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  pVsE,
  bossBroken,
  playerHp,
  enemyHp,
  playerStatuses,
  nextSwordImmortalGuardAtMs,
  hasSwordImmortalPassive,
}: PlayerPreludeArgs): ResolvePlayerPreludeResult => {
  ({ playerStatuses, nextSwordImmortalGuardAtMs } = applyPeriodicPassiveStatuses({
    logs,
    turn,
    timeMs: currentTimeMs,
    player,
    playerHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
    playerStatuses,
    hasSwordImmortalPassive,
    nextSwordImmortalGuardAtMs,
  }));

  bossBroken = rollBossBreakOpportunity({
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    restriction: pVsE,
    bossBroken,
    currentTimeMs,
    turn,
    logs,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  return {
    playerStatuses,
    nextSwordImmortalGuardAtMs,
    bossBroken,
  };
};
