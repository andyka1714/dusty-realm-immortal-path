import { CombatLog, Enemy, EnemyRank } from "../types";
import { pushCombatLog } from "./battleLog";
import type { EncounterRestriction } from "./battleEncounterTypes";
import type { CombatStatusLike } from "./battleStatusTypes";

export const rollBossBreakOpportunity = ({
  enemy,
  restriction,
  bossBroken,
  currentTimeMs,
  turn,
  logs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  enemy: Enemy;
  restriction: EncounterRestriction;
  bossBroken: boolean;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (
    enemy.rank !== EnemyRank.Boss ||
    !restriction.isEffective ||
    bossBroken ||
    Math.random() >= 0.12
  ) {
    return bossBroken;
  }

  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    message: `【破綻】你抓住了 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 的氣機破綻，下一擊傷害大幅提升！`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  return true;
};

export const resolveEnemyIncapacitatedTurn = ({
  currentTimeMs,
  enemy,
  enemyAttackIntervalMs,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  currentTimeMs: number;
  enemy: Enemy;
  enemyAttackIntervalMs: number;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: false,
    message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被控制中，無法出手！`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  if (hasSwordHeartPassive && !playerDamagedSinceSwordHeartWindow) {
    swordHeartStacks = Math.min(8, swordHeartStacks + 1);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message:
        swordHeartStacks >= 8
          ? "【養劍術】劍勢已滿，當前回合的停滯不再繼續積蓄殺機。"
          : `【養劍術】敵勢受阻，劍勢提升至第 ${swordHeartStacks} 層。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return {
    enemyNextActionMs: currentTimeMs + enemyAttackIntervalMs,
    swordHeartStacks,
    playerDamagedSinceSwordHeartWindow: false,
  };
};

const getEnemySpecialDelayFromStatuses = (
  statuses: CombatStatusLike[],
  currentTimeMs: number
) =>
  statuses.some(
    (status) => status.id === "spirit_sever" && status.expiresAtMs > currentTimeMs
  )
    ? 1000
    : 0;

export const applyEnemySpecialTimingDelay = ({
  logs,
  turn,
  timeMs,
  enemy,
  enemyStatuses,
  enemySpecialReadyAtMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  enemyStatuses: CombatStatusLike[];
  enemySpecialReadyAtMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  const enemySpecialDelayMs = getEnemySpecialDelayFromStatuses(
    enemyStatuses,
    timeMs
  );
  if (
    !enemy.specialAttack ||
    timeMs < enemySpecialReadyAtMs ||
    enemySpecialDelayMs <= 0
  ) {
    return enemySpecialReadyAtMs;
  }

  const delayedReadyAtMs = timeMs + enemySpecialDelayMs;
  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: `【絕仙劍】斬斷敵方靈機流轉，將其術式節奏再壓後 ${(enemySpecialDelayMs / 1000).toFixed(0)} 秒。`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  return delayedReadyAtMs;
};
