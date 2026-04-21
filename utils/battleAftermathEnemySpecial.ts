import { CombatLog, Enemy } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import { pushCombatLog } from "./battleLog";
import { appendAndLogCombatStatuses } from "./battleStatuses";
import type { PlayerPassiveFlags } from "./battlePassives";
import { resolveIncomingEnemySpecialStatuses } from "./battleWorldStrikeIncomingStatuses";
import type { CombatStatusLike } from "./battleStatusTypes";

const logEnemySpecialResistanceTriggers = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  bodyImmortalTriggered,
  swordEmperorTriggered,
  mageTribulationControlTriggered,
  swordFusionControlTriggered,
  controlImmuneTriggered,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  bodyImmortalTriggered: boolean;
  swordEmperorTriggered: boolean;
  mageTribulationControlTriggered: boolean;
  swordFusionControlTriggered: boolean;
  controlImmuneTriggered: boolean;
}) => {
  if (bodyImmortalTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【仙體無垢】你直接免疫了持續傷害侵蝕。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (swordEmperorTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【萬法皆空】你不受任何負面狀態束縛。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (mageTribulationControlTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【雷劫煉心】雷痕護住識海，你直接掙脫了控制侵蝕。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (swordFusionControlTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【人劍合神】強行縮短了控制侵蝕的持續時間。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (controlImmuneTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【獸神附體】獸魂狂潮撕碎了控制侵蝕。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }
};

export const applyEnemySpecialStatusApplication = ({
  special,
  player,
  playerStatuses,
  passiveFlags,
  currentTimeMs,
  shortenControlDuration,
  container,
  logs,
  turn,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  special?: Enemy["specialAttack"];
  player: PlayerCombatStats;
  playerStatuses: CombatStatusLike[];
  passiveFlags: PlayerPassiveFlags;
  currentTimeMs: number;
  shortenControlDuration: boolean;
  container: CombatStatusLike[];
  logs: CombatLog[];
  turn: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  const enemyIncomingStatusResult = resolveIncomingEnemySpecialStatuses({
    special,
    player,
    currentStatuses: playerStatuses,
    passiveFlags,
    currentTimeMs,
    shortenControlDuration,
  });

  if (enemyIncomingStatusResult.filteredStatuses.length > 0) {
    appendAndLogCombatStatuses({
      container,
      statuses: enemyIncomingStatusResult.normalizedIncomingStatuses,
      logs,
      turn,
      timeMs: currentTimeMs,
      isPlayer: false,
      targetIsPlayer: true,
      enemy,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  logEnemySpecialResistanceTriggers({
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    bodyImmortalTriggered: enemyIncomingStatusResult.bodyImmortalTriggered,
    swordEmperorTriggered: enemyIncomingStatusResult.swordEmperorTriggered,
    mageTribulationControlTriggered:
      enemyIncomingStatusResult.mageTribulationControlTriggered,
    swordFusionControlTriggered:
      enemyIncomingStatusResult.swordFusionControlTriggered,
    controlImmuneTriggered: enemyIncomingStatusResult.controlImmuneTriggered,
  });

  return enemyIncomingStatusResult;
};
