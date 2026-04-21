import { CombatLog, ElementType, Enemy } from "../types";
import { absorbDamageWithShield, hasEnemyAffix } from "./battleCombatMath";
import { pushCombatLog } from "./battleLog";
import { getCopperSkinReductionMultiplier } from "./battlePassives";
import type { CombatStatusLike } from "./battleStatusTypes";

const applySwordDeathWardTrigger = ({
  shouldTrigger,
  logs,
  turn,
  timeMs,
  preventedDamage,
  playerHp,
  playerMaxHp,
  playerMp,
  enemyHp,
  enemyMaxHp,
  enemy,
}: {
  shouldTrigger: boolean;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  preventedDamage: number;
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemy: Enemy;
}) => {
  if (!shouldTrigger) {
    return {
      playerMp,
      enemyHp,
      enemyDamage: undefined as number | undefined,
      triggered: false,
    };
  }

  const reflected = Math.max(1, preventedDamage);
  const nextEnemyHp = Math.max(0, enemyHp - reflected);

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: `【護體劍罡】於生死一線間展開，你耗盡靈力擋下致命一擊，並反震 <enemy rank="${enemy.rank}">${enemy.name}</enemy> <dmg>${reflected}</dmg> 點傷害！`,
    damage: reflected,
    playerHp,
    playerMaxHp,
    enemyHp: nextEnemyHp,
    enemyMaxHp,
  });

  return {
    playerMp: 0,
    enemyHp: nextEnemyHp,
    enemyDamage: 0,
    triggered: true,
  };
};

const applyFatalSurvivalPassives = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  bodyRebirthTrueAvailable,
  bodyEmperorAvailable,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatusLike[];
  bodyRebirthTrueAvailable: boolean;
  bodyEmperorAvailable: boolean;
}) => {
  let nextPlayerHp = playerHp;
  let nextPlayerStatuses = playerStatuses;
  let bodyRebirthTrueTriggered = false;
  let bodyEmperorTriggered = false;

  if (bodyRebirthTrueAvailable && nextPlayerHp <= 0) {
    bodyRebirthTrueTriggered = true;
    nextPlayerHp = Math.floor(playerMaxHp * 0.5);
    nextPlayerStatuses = [
      ...nextPlayerStatuses,
      {
        id: "true_rebirth_guard",
        name: "滴血重生",
        kind: "shield",
        value: 999999,
        expiresAtMs: timeMs + 3000,
      },
    ];
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【滴血重生（真）】逆轉死劫，你恢復了大量氣血並短暫無敵。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (bodyEmperorAvailable && nextPlayerHp <= 0) {
    bodyEmperorTriggered = true;
    nextPlayerHp = 1;
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【不死不滅】強行續住最後一線生機。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return {
    playerHp: nextPlayerHp,
    playerStatuses: nextPlayerStatuses,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
  };
};

const getIncomingDefensivePassiveMessages = (options: {
  bodyFoundationStacks: number;
  copperSkinReduced: number;
  bodyFusionReduced: number;
  bodySaintReduced: number;
  elementalBarrierBlocked: boolean;
}) => {
  const messages: string[] = [];
  const {
    bodyFoundationStacks,
    copperSkinReduced,
    bodyFusionReduced,
    bodySaintReduced,
    elementalBarrierBlocked,
  } = options;

  if (bodyFoundationStacks > 0) {
    messages.push(
      `【蠻荒血脈】傷勢越深，肉身越堅，當前 ${bodyFoundationStacks} 層血脈沸騰抬升了護體。`
    );
  }
  if (copperSkinReduced > 0) {
    messages.push(`【銅皮鐵骨】硬生生化去 <dmg>${copperSkinReduced}</dmg> 點傷害。`);
  }
  if (bodyFusionReduced > 0) {
    messages.push(`【金剛法相】卸去 <dmg>${bodyFusionReduced}</dmg> 點最終傷害。`);
  }
  if (bodySaintReduced > 0) {
    messages.push(`【肉身成聖】化去重擊，減少了 <dmg>${bodySaintReduced}</dmg> 點傷害。`);
  }
  if (elementalBarrierBlocked) {
    messages.push("【元素護盾】完整化去了一次術式傷害。");
  }

  return messages;
};

export const resolveIncomingEnemyDamage = ({
  enemyDamage,
  enemySpecialReady,
  currentTimeMs,
  playerStatuses,
  logs,
  turn,
  enemy,
  playerHp,
  playerMaxHp,
  playerMp,
  enemyHp,
  enemyMaxHp,
  bodyFoundationStacks,
  hasBodyQiPassive,
  hasBodyFusionPassive,
  hasBodySaintPassive,
  hasSwordDeathWardPassive,
  swordDeathWardUsed,
}: {
  enemyDamage: number;
  enemySpecialReady: boolean;
  currentTimeMs: number;
  playerStatuses: CombatStatusLike[];
  logs: CombatLog[];
  turn: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMaxHp: number;
  bodyFoundationStacks: number;
  hasBodyQiPassive: boolean;
  hasBodyFusionPassive: boolean;
  hasBodySaintPassive: boolean;
  hasSwordDeathWardPassive: boolean;
  swordDeathWardUsed: boolean;
}) => {
  let nextEnemyDamage = enemyDamage;
  let nextPlayerStatuses = playerStatuses;
  let nextPlayerMp = playerMp;
  let nextEnemyHp = enemyHp;
  let nextSwordDeathWardUsed = swordDeathWardUsed;

  let copperSkinReduced = 0;
  if (hasBodyQiPassive && nextEnemyDamage > 0 && !enemySpecialReady) {
    copperSkinReduced = nextEnemyDamage - Math.max(
      1,
      Math.floor(nextEnemyDamage * getCopperSkinReductionMultiplier())
    );
    nextEnemyDamage = Math.max(
      1,
      Math.floor(nextEnemyDamage * getCopperSkinReductionMultiplier())
    );
  }

  let bodyFusionReduced = 0;
  if (hasBodyFusionPassive && nextEnemyDamage > 0) {
    bodyFusionReduced =
      nextEnemyDamage - Math.max(1, Math.floor(nextEnemyDamage * 0.7));
    nextEnemyDamage = Math.max(1, Math.floor(nextEnemyDamage * 0.7));
  }

  let bodySaintReduced = 0;
  if (hasBodySaintPassive && nextEnemyDamage > playerMaxHp * 0.2) {
    bodySaintReduced =
      nextEnemyDamage - Math.max(1, Math.floor(nextEnemyDamage * 0.5));
    nextEnemyDamage = Math.max(1, Math.floor(nextEnemyDamage * 0.5));
  }

  let elementalBarrierBlocked = false;
  if (enemySpecialReady && nextEnemyDamage > 0) {
    const elementalBarrier = nextPlayerStatuses.find(
      (status) =>
        status.id === "elemental_barrier" &&
        status.kind === "shield" &&
        status.expiresAtMs > currentTimeMs &&
        status.value > 0
    );
    if (elementalBarrier) {
      elementalBarrier.value = 0;
      elementalBarrier.expiresAtMs = currentTimeMs;
      elementalBarrierBlocked = true;
      nextEnemyDamage = 0;
    }
  }

  getIncomingDefensivePassiveMessages({
    bodyFoundationStacks,
    copperSkinReduced,
    bodyFusionReduced,
    bodySaintReduced,
    elementalBarrierBlocked,
  }).forEach((message) => {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  });

  const shieldResult = absorbDamageWithShield(
    nextPlayerStatuses,
    nextEnemyDamage,
    currentTimeMs
  );
  nextEnemyDamage = shieldResult.remainingDamage;

  if (shieldResult.absorbed > 0) {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `護盾替你抵擋了 <dmg>${shieldResult.absorbed}</dmg> 點傷害。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  }

  if (elementalBarrierBlocked) {
    nextPlayerStatuses = nextPlayerStatuses.filter(
      (status) =>
        !(
          status.id === "elemental_barrier" && status.expiresAtMs <= currentTimeMs
        )
    );
  }

  if (
    hasSwordDeathWardPassive &&
    !nextSwordDeathWardUsed &&
    nextEnemyDamage >= playerHp &&
    nextPlayerMp > 0
  ) {
    const swordDeathWardResult = applySwordDeathWardTrigger({
      shouldTrigger: true,
      logs,
      turn,
      timeMs: currentTimeMs,
      preventedDamage: nextEnemyDamage,
      playerHp,
      playerMaxHp,
      playerMp: nextPlayerMp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
      enemy,
    });
    nextSwordDeathWardUsed = swordDeathWardResult.triggered;
    nextPlayerMp = swordDeathWardResult.playerMp;
    nextEnemyDamage = swordDeathWardResult.enemyDamage ?? nextEnemyDamage;
    nextEnemyHp = swordDeathWardResult.enemyHp;
  }

  return {
    enemyDamage: nextEnemyDamage,
    playerStatuses: nextPlayerStatuses,
    playerMp: nextPlayerMp,
    enemyHp: nextEnemyHp,
    swordDeathWardUsed: nextSwordDeathWardUsed,
  };
};

export const applyEnemyHitAftermath = ({
  enemyDamage,
  currentTimeMs,
  logs,
  turn,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  hasBodyTribulationPassive,
  bodyTribulationStacks,
  hasMageTribulationPassive,
  hasEnemyLeech,
  hasBodyRebirthTruePassive,
  bodyRebirthTrueUsed,
  hasBodyEmperorPassive,
}: {
  enemyDamage: number;
  currentTimeMs: number;
  logs: CombatLog[];
  turn: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatusLike[];
  hasBodyTribulationPassive: boolean;
  bodyTribulationStacks: number;
  hasMageTribulationPassive: boolean;
  hasEnemyLeech: boolean;
  hasBodyRebirthTruePassive: boolean;
  bodyRebirthTrueUsed: boolean;
  hasBodyEmperorPassive: boolean;
}) => {
  let nextPlayerHp = playerHp;
  let nextEnemyHp = enemyHp;
  let nextPlayerStatuses = playerStatuses;
  let nextBodyTribulationStacks = bodyTribulationStacks;
  let nextBodyRebirthTrueUsed = bodyRebirthTrueUsed;

  if (
    hasBodyTribulationPassive &&
    enemyDamage > 0 &&
    nextBodyTribulationStacks < 50
  ) {
    nextBodyTribulationStacks += 1;
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【萬劫不滅】借劫煉體，防禦再疊 1 層，當前 ${nextBodyTribulationStacks} 層。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  }

  if (
    hasMageTribulationPassive &&
    enemyDamage > 0 &&
    enemy.element === ElementType.Metal
  ) {
    const thunderHeal = Math.max(1, Math.floor(enemyDamage * 0.35));
    nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + thunderHeal);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【雷劫煉心】借天雷反煉自身，回復了 <heal>${thunderHeal}</heal> 點氣血。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  }

  if (hasEnemyLeech && enemyDamage > 0) {
    const leechAmount = Math.max(1, Math.floor(enemyDamage * 0.06));
    nextEnemyHp = Math.min(enemyMaxHp, nextEnemyHp + leechAmount);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: false,
      message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 的【噬生】發作，回復了 <heal>${leechAmount}</heal> 點氣血。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  }

  const fatalSurvivalResult = applyFatalSurvivalPassives({
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp: nextPlayerHp,
    playerMaxHp,
    enemyHp: nextEnemyHp,
    enemyMaxHp,
    playerStatuses: nextPlayerStatuses,
    bodyRebirthTrueAvailable:
      hasBodyRebirthTruePassive && !nextBodyRebirthTrueUsed,
    bodyEmperorAvailable: hasBodyEmperorPassive,
  });
  nextPlayerHp = fatalSurvivalResult.playerHp;
  nextPlayerStatuses = fatalSurvivalResult.playerStatuses;
  if (fatalSurvivalResult.bodyRebirthTrueTriggered) {
    nextBodyRebirthTrueUsed = true;
  }

  return {
    playerHp: nextPlayerHp,
    enemyHp: nextEnemyHp,
    playerStatuses: nextPlayerStatuses,
    bodyTribulationStacks: nextBodyTribulationStacks,
    bodyRebirthTrueUsed: nextBodyRebirthTrueUsed,
  };
};

export const hasEnemyLeechAffix = (enemy: Enemy) => hasEnemyAffix(enemy, "噬生");
