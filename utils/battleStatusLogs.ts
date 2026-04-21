import { CombatLog, Enemy } from "../types";
import { pushCombatLog } from "./battleLog";
import type { CombatStatusLike } from "./battleStatusTypes";

const kindToStatusMessage = (
  status: CombatStatusLike,
  targetIsPlayer: boolean,
  enemy: Enemy
) => {
  if (status.kind === "incapacitate") {
    return targetIsPlayer
      ? `你陷入【${status.name}】，行動受制。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 陷入【${status.name}】！`;
  }

  if (status.kind === "armorBreak") {
    return targetIsPlayer
      ? `你被施加【${status.name}】，護體被削弱！`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】，護體被削弱！`;
  }

  if (status.kind === "vulnerable") {
    return targetIsPlayer
      ? `你被施加【${status.name}】，破綻盡露，所受傷害提高！`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】，破綻盡露！`;
  }

  if (status.kind === "damageAmp") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，氣血與殺意一同沸騰。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 獲得了【${status.name}】。`;
  }

  if (status.kind === "lifesteal") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，將以敵血滋養自身。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 獲得了【${status.name}】。`;
  }

  if (status.kind === "controlImmune") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，控制侵蝕將被直接撕裂。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 獲得了【${status.name}】。`;
  }

  if (status.kind === "taunt") {
    return targetIsPlayer
      ? `你釋放了【${status.name}】，將敵勢強行引向自己。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被【${status.name}】牽動。`;
  }

  if (status.kind === "critBoost") {
    return targetIsPlayer
      ? `你凝聚了【${status.name}】，下一輪劍勢更加凌厲。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 凝聚了【${status.name}】。`;
  }

  if (status.kind === "reflect") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，近身來敵將被反噬。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 佈下【${status.name}】。`;
  }

  if (
    status.kind === "burn" ||
    status.kind === "poison" ||
    status.kind === "bleed" ||
    status.kind === "drain"
  ) {
    return targetIsPlayer
      ? `你被施加【${status.name}】！`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】！`;
  }

  if (status.kind === "shield") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，可抵擋 ${Math.floor(status.value)} 點傷害。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 獲得了【${status.name}】。`;
  }

  return targetIsPlayer
    ? `你受到【${status.name}】影響。`
    : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 受到【${status.name}】影響。`;
};

const logAppliedCombatStatuses = ({
  logs,
  turn,
  timeMs,
  isPlayer,
  statuses,
  targetIsPlayer,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  isPlayer: boolean;
  statuses: CombatStatusLike[];
  targetIsPlayer: boolean;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  statuses.forEach((status) => {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer,
      message: kindToStatusMessage(status, targetIsPlayer, enemy),
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  });
};

export const appendAndLogCombatStatuses = ({
  container,
  statuses,
  logs,
  turn,
  timeMs,
  isPlayer,
  targetIsPlayer,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  container: CombatStatusLike[];
  statuses: CombatStatusLike[];
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  isPlayer: boolean;
  targetIsPlayer: boolean;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (statuses.length === 0) {
    return;
  }

  container.push(...statuses);
  logAppliedCombatStatuses({
    logs,
    turn,
    timeMs,
    isPlayer,
    statuses,
    targetIsPlayer,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};
