import { CombatLog, ProfessionType, Skill } from "../types";
import { pushCombatLog } from "./battleLog";
import type { PlayerCombatStats } from "./battleSystem";
import { getMageQiCycleRecovery } from "./battlePassives";
import { getResolvedSkillCooldownSeconds } from "./battleProfiles";

const logResolvedActivePassiveEffects = (options: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  noManaCostTriggered: boolean;
  cooldownReductionMessage?: string;
  manaCycleRecovery?: number;
  swordGoldenResetTriggered: boolean;
  mageFoundationStacksGained?: number;
}) => {
  const {
    logs,
    turn,
    timeMs,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    noManaCostTriggered,
    cooldownReductionMessage,
    manaCycleRecovery,
    swordGoldenResetTriggered,
    mageFoundationStacksGained,
  } = options;

  if (noManaCostTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【五氣朝元】術式運轉不再消耗靈力。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (cooldownReductionMessage) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: cooldownReductionMessage,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (manaCycleRecovery && manaCycleRecovery > 0) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【靈潮循環】術式回潮歸海，你回復了 ${manaCycleRecovery} 點靈力。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (swordGoldenResetTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【劍心通明】你在暴擊中瞬息回氣，流光劍影冷卻即刻重置。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (mageFoundationStacksGained && mageFoundationStacksGained > 0) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【靈力湧動】術式餘波回流，下一輪法術威能提升，當前 ${mageFoundationStacksGained} 層。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }
};

export const resolvePlayerActiveResourceFlow = ({
  activeSkill,
  activeSkillCanonicalId,
  player,
  playerMp,
  currentTimeMs,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  isCrit,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  hasMageFusionPassive,
  hasMageQiPassive,
  hasSwordGoldenPassive,
  hasMageFoundationPassive,
}: {
  activeSkill: Skill;
  activeSkillCanonicalId?: string;
  player: PlayerCombatStats;
  playerMp: number;
  currentTimeMs: number;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  isCrit: boolean;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  hasMageFusionPassive: boolean;
  hasMageQiPassive: boolean;
  hasSwordGoldenPassive: boolean;
  hasMageFoundationPassive: boolean;
}) => {
  const baseCooldownSeconds =
    activeSkill.cooldownSeconds ?? activeSkill.cooldown;
  const noManaCostTriggered =
    hasMageFusionPassive && activeSkill.profession === ProfessionType.Mage;
  let nextPlayerMp = noManaCostTriggered
    ? playerMp
    : Math.max(0, playerMp - (activeSkill.cost || 0));
  const effectiveCooldownSeconds = getResolvedSkillCooldownSeconds(
    activeSkill,
    player.learnedSkills
  );
  let nextActiveSkillReadyAtMs =
    currentTimeMs + Math.floor(effectiveCooldownSeconds * 1000);
  const cooldownReductionMessage =
    effectiveCooldownSeconds < baseCooldownSeconds &&
    activeSkill.profession === ProfessionType.Mage
      ? `【道法自然】術式流轉提前歸位，冷卻縮短至 ${effectiveCooldownSeconds.toFixed(1)} 秒。`
      : undefined;

  let recoveredMana = 0;
  if (hasMageQiPassive && activeSkill.profession === ProfessionType.Mage) {
    recoveredMana = getMageQiCycleRecovery(player.maxMp);
    nextPlayerMp = Math.min(player.maxMp, nextPlayerMp + recoveredMana);
  }

  let swordGoldenResetTriggered = false;
  if (
    hasSwordGoldenPassive &&
    activeSkillCanonicalId === "s_f_active" &&
    isCrit &&
    Math.random() < 0.3
  ) {
    nextActiveSkillReadyAtMs = currentTimeMs;
    swordGoldenResetTriggered = true;
  }

  let nextMageFoundationStacks = mageFoundationStacks;
  let mageFoundationStacksGained: number | undefined;
  if (hasMageFoundationPassive && activeSkill.profession === ProfessionType.Mage) {
    nextMageFoundationStacks = Math.min(3, nextMageFoundationStacks + 1);
    mageFoundationStacksGained = nextMageFoundationStacks;
  }

  logResolvedActivePassiveEffects({
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    noManaCostTriggered,
    cooldownReductionMessage,
    manaCycleRecovery: recoveredMana,
    swordGoldenResetTriggered,
    mageFoundationStacksGained,
  });

  return {
    playerMp: nextPlayerMp,
    activeSkillReadyAtMs: nextActiveSkillReadyAtMs,
    mageFoundationStacks: nextMageFoundationStacks,
  };
};
