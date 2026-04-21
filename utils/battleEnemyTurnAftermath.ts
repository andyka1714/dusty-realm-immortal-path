import { CombatLog, Enemy } from "../types";
import { getReflectValue } from "./battleCombatMath";
import { pushCombatLog } from "./battleLog";
import type { PlayerCombatStats } from "./battleSystem";
import type { PlayerPassiveFlags } from "./battlePassives";
import type { CombatStatusLike } from "./battleStatusTypes";
import { applyEnemySpecialStatusApplication } from "./battleAftermathEnemySpecial";
import {
  applyEnemyHitAftermath,
  hasEnemyLeechAffix,
  resolveIncomingEnemyDamage,
} from "./battleAftermathIncomingDamage";

const logEnemyAvoidance = ({
  logs,
  turn,
  timeMs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  voidEvasion,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  voidEvasion: boolean;
}) => {
  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: false,
    message: voidEvasion
      ? `【空間法則】扭曲了攻勢，你將這次傷害轉入虛空。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 的攻勢被你避開了！`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

const logReflectRetaliation = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  reflected,
  enemy,
  sourceName,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  reflected: number;
  enemy: Enemy;
  sourceName?: string;
}) => {
  if (reflected <= 0) return;

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: sourceName
      ? `【${sourceName}】於近身交鋒間反震回敬 <enemy rank="${enemy.rank}">${enemy.name}</enemy>，造成 <dmg>${reflected}</dmg> 點傷害！`
      : `你以護體反震回敬 <enemy rank="${enemy.rank}">${enemy.name}</enemy>，造成 <dmg>${reflected}</dmg> 點傷害！`,
    damage: reflected,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

export const resolveEnemyTurnAftermath = ({
  enemyDamage,
  isDodge,
  voidEvasion,
  isBlock,
  enemySpecialReady,
  currentTimeMs,
  turn,
  logs,
  enemy,
  player,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  passiveFlags,
  bodyFoundationStacks,
  swordDeathWardUsed,
  bodyTribulationStacks,
  bodyRebirthTrueUsed,
}: {
  enemyDamage: number;
  isDodge: boolean;
  voidEvasion: boolean;
  isBlock: boolean;
  enemySpecialReady: boolean;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  enemy: Enemy;
  player: PlayerCombatStats;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  passiveFlags: PlayerPassiveFlags;
  bodyFoundationStacks: number;
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
}) => {
  let nextEnemyDamage = enemyDamage;
  let nextPlayerHp = playerHp;
  let nextPlayerMp = playerMp;
  let nextEnemyHp = enemyHp;
  let nextPlayerStatuses = playerStatuses;
  let nextSwordDeathWardUsed = swordDeathWardUsed;
  let nextBodyTribulationStacks = bodyTribulationStacks;
  let nextBodyRebirthTrueUsed = bodyRebirthTrueUsed;

  if (isDodge || voidEvasion) {
    logEnemyAvoidance({
      logs,
      turn,
      timeMs: currentTimeMs,
      enemy,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
      voidEvasion,
    });
  } else {
    if (isBlock) {
      nextEnemyDamage = Math.max(1, Math.floor(nextEnemyDamage * 0.6));
    }
    ({
      enemyDamage: nextEnemyDamage,
      playerStatuses: nextPlayerStatuses,
      playerMp: nextPlayerMp,
      enemyHp: nextEnemyHp,
      swordDeathWardUsed: nextSwordDeathWardUsed,
    } = resolveIncomingEnemyDamage({
      enemyDamage: nextEnemyDamage,
      enemySpecialReady,
      currentTimeMs,
      playerStatuses: nextPlayerStatuses,
      logs,
      turn,
      enemy,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      playerMp: nextPlayerMp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
      bodyFoundationStacks,
      hasBodyQiPassive: passiveFlags.hasBodyQiPassive,
      hasBodyFusionPassive: passiveFlags.hasBodyFusionPassive,
      hasBodySaintPassive: passiveFlags.hasBodySaintPassive,
      hasSwordDeathWardPassive: passiveFlags.hasSwordDeathWardPassive,
      swordDeathWardUsed: nextSwordDeathWardUsed,
    }));

    nextPlayerHp = Math.max(0, nextPlayerHp - nextEnemyDamage);
    ({
      playerHp: nextPlayerHp,
      enemyHp: nextEnemyHp,
      playerStatuses: nextPlayerStatuses,
      bodyTribulationStacks: nextBodyTribulationStacks,
      bodyRebirthTrueUsed: nextBodyRebirthTrueUsed,
    } = applyEnemyHitAftermath({
      enemyDamage: nextEnemyDamage,
      currentTimeMs,
      logs,
      turn,
      enemy,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
      playerStatuses: nextPlayerStatuses,
      hasBodyTribulationPassive: passiveFlags.hasBodyTribulationPassive,
      bodyTribulationStacks: nextBodyTribulationStacks,
      hasMageTribulationPassive: passiveFlags.hasMageTribulationPassive,
      hasEnemyLeech: hasEnemyLeechAffix(enemy),
      hasBodyRebirthTruePassive: passiveFlags.hasBodyRebirthTruePassive,
      bodyRebirthTrueUsed: nextBodyRebirthTrueUsed,
      hasBodyEmperorPassive: passiveFlags.hasBodyEmperorPassive,
    }));

    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: false,
      message: enemySpecialReady && enemy.specialAttack
        ? `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 施展【${enemy.specialAttack.name}】${isBlock ? "，被你格擋後，" : "，"}造成 <dmg>${nextEnemyDamage}</dmg> 點傷害！`
        : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 反擊，${isBlock ? "被你格擋後，" : ""}造成 <dmg>${nextEnemyDamage}</dmg> 點傷害！`,
      damage: nextEnemyDamage,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });

    if (enemySpecialReady && enemy.specialAttack) {
      applyEnemySpecialStatusApplication({
        special: enemy.specialAttack,
        player,
        playerStatuses: nextPlayerStatuses,
        passiveFlags,
        currentTimeMs,
        shortenControlDuration: passiveFlags.hasSwordFusionPassive,
        container: nextPlayerStatuses,
        logs,
        turn,
        enemy,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    }

    const reflectValue = getReflectValue(nextPlayerStatuses, currentTimeMs);
    const isMeleeEnemyHit = (enemy.attackRange ?? 1) <= 1;
    if (
      reflectValue > 0 &&
      nextEnemyDamage > 0 &&
      nextEnemyHp > 0 &&
      isMeleeEnemyHit
    ) {
      const reflected = Math.max(1, Math.floor(nextEnemyDamage * reflectValue));
      nextEnemyHp = Math.max(0, nextEnemyHp - reflected);
      logReflectRetaliation({
        logs,
        turn,
        timeMs: currentTimeMs,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp: enemy.maxHp,
        reflected,
        enemy,
        sourceName: "荊棘皮層",
      });
    }
  }

  return {
    enemyDamage: nextEnemyDamage,
    playerHp: nextPlayerHp,
    playerMp: nextPlayerMp,
    enemyHp: nextEnemyHp,
    playerStatuses: nextPlayerStatuses,
    swordDeathWardUsed: nextSwordDeathWardUsed,
    bodyTribulationStacks: nextBodyTribulationStacks,
    bodyRebirthTrueUsed: nextBodyRebirthTrueUsed,
  };
};
