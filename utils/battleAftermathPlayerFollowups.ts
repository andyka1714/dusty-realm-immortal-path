import {
  CombatLog,
  ElementType,
  Enemy,
  EnemyRank,
} from "../types";
import {
  getArmorBreakMultiplier,
  getEnemyDamageReductionMultiplier,
  getVulnerableMultiplier,
  resolveDamage,
} from "./battleCombatMath";
import { pushCombatLog } from "./battleLog";
import type { PlayerCombatStats } from "./battleSystem";
import type { ElementalAffinityLike, RestrictionLike } from "./battleAftermathTypes";
import type { CombatStatusLike } from "./battleStatusTypes";

export const applyPlayerActiveFollowupEffects = ({
  activeSkillCanonicalId,
  playerDamage,
  currentTimeMs,
  enemy,
  enemyHp,
  playerHp,
  playerMaxHp,
  turn,
  logs,
  hasBodyImmortalPassive,
  enemyStatuses,
  activeSkillReadyAtMs,
}: {
  activeSkillCanonicalId?: string;
  playerDamage: number;
  currentTimeMs: number;
  enemy: Enemy;
  enemyHp: number;
  playerHp: number;
  playerMaxHp: number;
  turn: number;
  logs: CombatLog[];
  hasBodyImmortalPassive: boolean;
  enemyStatuses: CombatStatusLike[];
  activeSkillReadyAtMs: number;
}) => {
  let nextEnemyHp = enemyHp;
  let nextPlayerHp = playerHp;
  let nextActiveSkillReadyAtMs = activeSkillReadyAtMs;

  if (activeSkillCanonicalId === "b_ma_active" && playerDamage > 0) {
    const lifestealAmount = Math.max(
      1,
      Math.floor(playerDamage * 0.5 * (hasBodyImmortalPassive ? 1.5 : 1))
    );
    nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + lifestealAmount);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【祖巫降臨】吞納戰果，你回復了 <heal>${lifestealAmount}</heal> 點氣血。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (activeSkillCanonicalId === "b_ma_active") {
    const giantHeal = Math.max(1, Math.floor(playerMaxHp * 0.35));
    nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + giantHeal);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【法天象地】肉身擴張如山，回復了 <heal>${giantHeal}</heal> 點氣血並撐起巨靈護體。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (activeSkillCanonicalId === "b_ma_active" && nextEnemyHp > 0) {
    const siphonAmount = Math.max(1, Math.floor(enemy.maxHp * 0.1));
    nextEnemyHp = Math.max(0, nextEnemyHp - siphonAmount);
    nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + siphonAmount);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【掌中神國】神國抽離敵方本源，額外造成 <dmg>${siphonAmount}</dmg> 點侵蝕傷害，並回復 <heal>${siphonAmount}</heal> 點氣血。`,
      damage: siphonAmount,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (activeSkillCanonicalId === "m_tr_active" && nextEnemyHp > 0) {
    const invertedStatuses: CombatStatusLike[] = [
      {
        id: "dao_bloom_break",
        name: "萬象反噬",
        kind: "armorBreak",
        value: 0.28,
        expiresAtMs: currentTimeMs + 3000,
      },
      {
        id: "dao_bloom_burn",
        name: "道火反噬",
        kind: "burn",
        value: 0.025,
        expiresAtMs: currentTimeMs + 3000,
        nextTickAtMs: currentTimeMs + 1000,
      },
    ];

    if ((enemy.affixes?.length ?? 0) >= 2 || enemy.rank === EnemyRank.Boss) {
      invertedStatuses.push({
        id: "dao_bloom_banish",
        name: "萬象寂滅",
        kind: "incapacitate",
        value: 0,
        expiresAtMs: currentTimeMs + 1000,
      });
    }

    enemyStatuses.push(...invertedStatuses);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【一念花開】逆轉敵方氣運與護體，將其優勢翻成劫火與枯寂。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (activeSkillCanonicalId === "s_tr_active" && nextEnemyHp <= 0) {
    nextActiveSkillReadyAtMs = currentTimeMs;
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【破劫一擊】一擊斷劫，冷卻即刻重置。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  return {
    enemyHp: nextEnemyHp,
    playerHp: nextPlayerHp,
    activeSkillReadyAtMs: nextActiveSkillReadyAtMs,
  };
};

export const applyPlayerEchoAndSummonFollowupEffects = ({
  skillReady,
  activeSkillCanonicalId,
  hasSwordEchoPassive,
  currentTimeMs,
  turn,
  logs,
  player,
  enemy,
  enemyHp,
  playerHp,
  playerMaxHp,
  playerDamage,
  effectiveDefense,
  enemyStatuses,
  pVsE,
  enemyElementalAffinity,
}: {
  skillReady: boolean;
  activeSkillCanonicalId?: string;
  hasSwordEchoPassive: boolean;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  player: PlayerCombatStats;
  enemy: Enemy;
  enemyHp: number;
  playerHp: number;
  playerMaxHp: number;
  playerDamage: number;
  effectiveDefense: number;
  enemyStatuses: CombatStatusLike[];
  pVsE: RestrictionLike;
  enemyElementalAffinity: ElementalAffinityLike;
}) => {
  let nextEnemyHp = enemyHp;

  if (
    hasSwordEchoPassive &&
    !skillReady &&
    nextEnemyHp > 0 &&
    playerDamage > 0
  ) {
    const echoPower = player.attack * 0.6;
    let echoDamage = resolveDamage(
      echoPower,
      effectiveDefense * getArmorBreakMultiplier(enemyStatuses, currentTimeMs)
    );
    if (pVsE.isEffective) echoDamage = Math.floor(echoDamage * 1.12);
    if (pVsE.isResisted) echoDamage = Math.floor(echoDamage * 0.88);
    echoDamage = Math.floor(echoDamage * enemyElementalAffinity.multiplier);
    echoDamage = Math.floor(
      echoDamage * getEnemyDamageReductionMultiplier(enemy)
    );
    echoDamage = Math.floor(
      echoDamage * getVulnerableMultiplier(enemyStatuses, currentTimeMs)
    );
    nextEnemyHp = Math.max(0, nextEnemyHp - echoDamage);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【劍意化形】追擊斬落，追加造成 <dmg>${echoDamage}</dmg> 點傷害！`,
      damage: echoDamage,
      playerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (skillReady && activeSkillCanonicalId === "s_ma_active" && nextEnemyHp > 0) {
    for (let echoIndex = 0; echoIndex < 2 && nextEnemyHp > 0; echoIndex += 1) {
      let echoDamage = resolveDamage(
        player.attack,
        effectiveDefense * getArmorBreakMultiplier(enemyStatuses, currentTimeMs)
      );
      echoDamage = Math.floor(
        echoDamage * getEnemyDamageReductionMultiplier(enemy)
      );
      echoDamage = Math.floor(
        echoDamage * getVulnerableMultiplier(enemyStatuses, currentTimeMs)
      );
      nextEnemyHp = Math.max(0, nextEnemyHp - echoDamage);
      pushCombatLog(logs, {
        turn,
        timeMs: currentTimeMs + echoIndex + 1,
        isPlayer: true,
        message: `【虛空劍陣】陣眼再斬，追加造成 <dmg>${echoDamage}</dmg> 點傷害！`,
        damage: echoDamage,
        playerHp,
        playerMaxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    }
  }

  if (skillReady && activeSkillCanonicalId === "m_tr_active" && nextEnemyHp > 0) {
    for (let summonIndex = 0; summonIndex < 3 && nextEnemyHp > 0; summonIndex += 1) {
      let summonDamage = resolveDamage(player.magic, effectiveDefense * 0.9);
      summonDamage = Math.floor(
        summonDamage * getEnemyDamageReductionMultiplier(enemy)
      );
      summonDamage = Math.floor(
        summonDamage * getVulnerableMultiplier(enemyStatuses, currentTimeMs)
      );
      nextEnemyHp = Math.max(0, nextEnemyHp - summonDamage);
      pushCombatLog(logs, {
        turn,
        timeMs: currentTimeMs + summonIndex + 1,
        isPlayer: true,
        message: `【撒豆成兵】金甲天兵出擊，造成 <dmg>${summonDamage}</dmg> 點傷害！`,
        damage: summonDamage,
        playerHp,
        playerMaxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    }
  }

  return nextEnemyHp;
};
