import { CombatLog } from "../types";
import { pushCombatLog } from "./battleLog";

const applySwordHeartUpkeep = ({
  swordHeartStacks,
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  blockedMessage,
  stackingMessage,
}: {
  swordHeartStacks: number;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  blockedMessage: string;
  stackingMessage: (nextStacks: number) => string;
}) => {
  if (swordHeartStacks >= 5) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: blockedMessage,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
    return swordHeartStacks;
  }

  const nextStacks = swordHeartStacks + 1;
  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: stackingMessage(nextStacks),
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
  return nextStacks;
};

export const resolveEnemySwordHeartAftermath = ({
  enemyDamage,
  isDodge,
  voidEvasion,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  logs,
  turn,
  currentTimeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  enemyDamage: number;
  isDodge: boolean;
  voidEvasion: boolean;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  logs: CombatLog[];
  turn: number;
  currentTimeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (enemyDamage > 0 && !isDodge && !voidEvasion) {
    playerDamagedSinceSwordHeartWindow = true;
  }

  if (hasSwordHeartPassive && !playerDamagedSinceSwordHeartWindow) {
    swordHeartStacks = applySwordHeartUpkeep({
      swordHeartStacks,
      logs,
      turn,
      timeMs: currentTimeMs,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
      blockedMessage:
        "【養劍術】劍勢已滿，敵招雖過，劍意已抵當前可凝的極限。",
      stackingMessage: (nextStacks) =>
        `【養劍術】劍勢沉澱更深，攻勢提升至第 ${nextStacks} 層。`,
    });
  }

  return {
    playerDamagedSinceSwordHeartWindow: false,
    swordHeartStacks,
  };
};
