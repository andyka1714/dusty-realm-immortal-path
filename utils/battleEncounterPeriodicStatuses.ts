import { CombatLog } from "../types";
import { pushCombatLog } from "./battleLog";
import type { EncounterPlayerCombatStatsLike } from "./battleEncounterTypes";
import type { CombatStatusLike } from "./battleStatusTypes";

export const applyPeriodicPassiveStatuses = ({
  logs,
  turn,
  timeMs,
  player,
  playerHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  hasSwordImmortalPassive,
  nextSwordImmortalGuardAtMs,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  player: Pick<EncounterPlayerCombatStatsLike, "maxHp">;
  playerHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatusLike[];
  hasSwordImmortalPassive: boolean;
  nextSwordImmortalGuardAtMs: number;
}) => {
  let nextGuardAtMs = nextSwordImmortalGuardAtMs;
  if (hasSwordImmortalPassive && timeMs >= nextGuardAtMs) {
    playerStatuses.push({
      id: "immortal_sword_guard",
      name: "仙元護體",
      kind: "shield",
      value: 999999,
      expiresAtMs: timeMs + 1000,
    });
    nextGuardAtMs += 5000;
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【仙元護體】再次凝成，可抵擋一次任意傷害。`,
      damage: 0,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return { playerStatuses, nextSwordImmortalGuardAtMs: nextGuardAtMs };
};
