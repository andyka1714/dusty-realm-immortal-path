import { CombatLog, Enemy } from "../types";
import { applyPassiveRegenAndCleanse } from "./battleEncounterRecovery";
import type { EncounterPlayerCombatStatsLike } from "./battleEncounterTypes";
import type { CombatStatusLike } from "./battleStatusTypes";

export const resolveTurnStartMaintenance = ({
  currentTimeMs,
  turn,
  processStatusTicks,
  player,
  enemy,
  logs,
  getPlayerHp,
  getPlayerMp,
  setPlayerHp,
  setPlayerMp,
  getEnemyHp,
  getPlayerStatuses,
  setPlayerStatuses,
  getLastRegenTimeMs,
  setLastRegenTimeMs,
  hasBodyRebirthPassive,
  hasManaSpringPassive,
  hasMageFusionPassive,
  hasBodyImmortalPassive,
  hasBodyAncientPassive,
}: {
  currentTimeMs: number;
  turn: number;
  processStatusTicks: (currentMs: number) => void;
  player: EncounterPlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  getPlayerHp: () => number;
  getPlayerMp: () => number;
  setPlayerHp: (value: number) => void;
  setPlayerMp: (value: number) => void;
  getEnemyHp: () => number;
  getPlayerStatuses: () => CombatStatusLike[];
  setPlayerStatuses: (value: CombatStatusLike[]) => void;
  getLastRegenTimeMs: () => number;
  setLastRegenTimeMs: (value: number) => void;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasBodyAncientPassive: boolean;
}) => {
  processStatusTicks(currentTimeMs);
  if (getPlayerHp() <= 0 || getEnemyHp() <= 0) {
    return { combatEnded: true };
  }

  const upkeepResult = applyPassiveRegenAndCleanse({
    player,
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp: getPlayerHp(),
    playerMp: getPlayerMp(),
    enemyHp: getEnemyHp(),
    enemyMaxHp: enemy.maxHp,
    playerStatuses: getPlayerStatuses(),
    lastRegenTimeMs: getLastRegenTimeMs(),
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
    hasBodyImmortalPassive,
    hasBodyAncientPassive,
  });

  setPlayerHp(upkeepResult.playerHp);
  setPlayerMp(upkeepResult.playerMp);
  setPlayerStatuses(upkeepResult.playerStatuses);
  setLastRegenTimeMs(upkeepResult.lastRegenTimeMs);

  return { combatEnded: false };
};
