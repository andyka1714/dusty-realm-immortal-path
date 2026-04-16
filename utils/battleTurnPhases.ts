import {
  CombatLog,
  ElementType,
  Enemy,
  ProfessionType,
  Skill,
} from "../types";
import { pushCombatLog } from "./battleLog";
import { type PlayerPassiveFlags, hasLearnedSkillId } from "./battlePassives";
import {
  applyEnemySpecialTimingDelay,
  applyPeriodicPassiveStatuses,
  resolveEnemyIncapacitatedTurn,
  rollBossBreakOpportunity,
} from "./battleEncounter";
import {
  type EnemySpecialTimelineProfile,
  type SkillTimelineProfile,
  getEnemySpecialTimelineProfile,
  getResolvedEnemySpecialCooldownSeconds,
  resolvePlayerActiveSkillWindow,
} from "./battleProfiles";
import { shouldApplySwordQiArmorBreak } from "./battleStatusEffects";

type CombatStatusLike = {
  id: string;
  name: string;
  kind:
    | "incapacitate"
    | "burn"
    | "poison"
    | "bleed"
    | "armorBreak"
    | "critBoost"
    | "shield"
    | "reflect"
    | "drain";
  value: number;
  expiresAtMs: number;
  nextTickAtMs?: number;
};

type PlayerCombatStatsLike = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  magic: number;
  defense: number;
  res: number;
  speed: number;
  crit: number;
  critDamage: number;
  dodge: number;
  blockRate: number;
  damageReduction: number;
  alchemyBonus: number;
  craftingBonus: number;
  breakthroughBonus: number;
  dropRateBonus: number;
  cultivationSpeedBonus: number;
  name: string;
  element: ElementType;
  regenHp: number;
  profession: ProfessionType;
  learnedSkills: Skill[];
};

type RestrictionLike = {
  isEffective: boolean;
  isResisted: boolean;
};

type ElementalAffinityLike = {
  multiplier: number;
  reason?: "resistance" | "weakness";
};

type ResolveEnemyOffenseRollResult = {
  enemyDamage: number;
  isDodge: boolean;
  voidEvasion: boolean;
  isBlock: boolean;
  bodyFoundationStacks: number;
  eVsP: RestrictionLike;
};

type ResolveEnemyTurnAftermathResult = {
  enemyDamage: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
};

type ResolvePlayerOffenseRollResult = {
  dealsDirectDamage: boolean;
  effectiveDefense: number;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
  manaSpringEmpowered: boolean;
  hasSwordQiChain: boolean;
  activeSwordQiStatuses: CombatStatusLike[];
  isCrit: boolean;
  playerDamage: number;
  pVsE: RestrictionLike;
  enemyElementalAffinity: ElementalAffinityLike;
};

type ResolvePlayerActiveAftermathResult = {
  enemyHp: number;
  playerHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  playerMp: number;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
};

type TurnPhaseDependencies = {
  resolveEnemyOffenseRoll: (args: {
    enemy: Enemy;
    player: PlayerCombatStatsLike;
    enemyStatuses: CombatStatusLike[];
    playerStatuses: CombatStatusLike[];
    currentTimeMs: number;
    enemySpecialReady: boolean;
    enemySpecialTimelineProfile?: EnemySpecialTimelineProfile;
    passiveFlags: PlayerPassiveFlags;
    bodyTribulationStacks: number;
  }) => ResolveEnemyOffenseRollResult;
  resolveEnemyTurnAftermath: (args: {
    enemyDamage: number;
    isDodge: boolean;
    voidEvasion: boolean;
    isBlock: boolean;
    enemySpecialReady: boolean;
    currentTimeMs: number;
    turn: number;
    logs: CombatLog[];
    enemy: Enemy;
    player: PlayerCombatStatsLike;
    playerHp: number;
    playerMp: number;
    enemyHp: number;
    playerStatuses: CombatStatusLike[];
    passiveFlags: PlayerPassiveFlags;
    bodyFoundationStacks: number;
    swordDeathWardUsed: boolean;
    bodyTribulationStacks: number;
    bodyRebirthTrueUsed: boolean;
  }) => ResolveEnemyTurnAftermathResult;
  resolvePlayerOffenseRoll: (args: {
    player: PlayerCombatStatsLike;
    enemy: Enemy;
    activeSkill?: Skill;
    activeSkillCanonicalId?: string;
    activeSkillTimelineProfile?: SkillTimelineProfile;
    skillReady: boolean;
    passiveFlags: PlayerPassiveFlags;
    playerHp: number;
    playerMp: number;
    playerStatuses: CombatStatusLike[];
    enemyStatuses: CombatStatusLike[];
    bossBroken: boolean;
    playerDebuffed: boolean;
    mageFoundationStacks: number;
    swordHeartStacks: number;
    currentTimeMs: number;
  }) => ResolvePlayerOffenseRollResult;
  resolvePlayerActiveAftermath: (args: {
    player: PlayerCombatStatsLike;
    skillReady: boolean;
    activeSkill?: Skill;
    activeSkillCanonicalId?: string;
    currentTimeMs: number;
    turn: number;
    logs: CombatLog[];
    enemy: Enemy;
    playerHp: number;
    playerMaxHp: number;
    enemyHp: number;
    enemyMaxHp: number;
    playerStatuses: CombatStatusLike[];
    enemyStatuses: CombatStatusLike[];
    playerMp: number;
    playerDamage: number;
    effectiveDefense: number;
    pVsE: RestrictionLike;
    enemyElementalAffinity: ElementalAffinityLike;
    activeSkillReadyAtMs: number;
    mageFoundationStacks: number;
    isCrit: boolean;
    dealsDirectDamage: boolean;
    passiveFlags: PlayerPassiveFlags;
  }) => ResolvePlayerActiveAftermathResult;
};

const hasIncapacitatingStatus = (
  statuses: CombatStatusLike[],
  currentTimeMs: number
) =>
  statuses.some(
    (status) =>
      status.kind === "incapacitate" && status.expiresAtMs > currentTimeMs
  );

const createPlayerAttackLogMessage = ({
  player,
  skillReady,
  activeSkill,
  isCrit,
  playerDamage,
}: {
  player: PlayerCombatStatsLike;
  skillReady: boolean;
  activeSkill?: Skill;
  isCrit: boolean;
  playerDamage: number;
}) => {
  if (!skillReady || !activeSkill) {
    return `<player>${player.name}</player> 發動攻擊，${isCrit ? "暴擊！" : ""}造成 <dmg>${playerDamage}</dmg> 點傷害！`;
  }

  if (activeSkill.effectType === "damage" || activeSkill.damageMultiplier !== undefined) {
    return `<player>${player.name}</player> 施展【${activeSkill.name}】${activeSkill.areaShape && activeSkill.areaShape !== "single" && activeSkill.areaShape !== "self" ? "，範圍術式震盪四散，" : "，"}${isCrit ? "暴擊！" : ""}造成 <dmg>${playerDamage}</dmg> 點傷害！`;
  }

  return `<player>${player.name}</player> 施展【${activeSkill.name}】，靈力在戰場上激盪開來！`;
};

const logSwordQiArmorBreak = ({
  shouldTrigger,
  logs,
  turn,
  timeMs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  shouldTrigger: boolean;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (!shouldTrigger) return;

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: `【劍脈初成】劍勢貫通護體，為 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 施加【劍脈破甲】。`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

const getPlayerActivePassiveProcMessages = (options: {
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  currentTimeMs: number;
  playerHp: number;
  enemyHp: number;
  skillReady: boolean;
  activeSkill?: Skill;
  isCrit: boolean;
  manaSpringEmpowered: boolean;
  hasMageMahayanaPassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageQiPassive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
}) => {
  const {
    player,
    currentTimeMs,
    playerHp,
    enemyHp,
    skillReady,
    activeSkill,
    isCrit,
    manaSpringEmpowered,
    hasMageMahayanaPassive,
    hasSwordMahayanaPassive,
    hasMageQiPassive,
    bodyFoundationStacks,
    voidSwordProc,
  } = options;

  const messages: string[] = [];

  if (manaSpringEmpowered) {
    messages.push("【法力源泉】靈海盈滿，你的術式威能暴漲。");
  }

  if (hasMageMahayanaPassive && skillReady && activeSkill?.profession === ProfessionType.Mage) {
    messages.push("【言出法隨】一言牽動萬法，主動術式威能被再度拔升。");
  }

  if (voidSwordProc) {
    messages.push("【法則之劍】劍勢洞穿護體，這一擊額外撕開敵方防禦並抬升暴傷上限。");
  }

  if (hasSwordMahayanaPassive && isCrit) {
    messages.push("【劍道獨尊】單體劍勢攀至極處，暴擊威能再被推上一層。");
  }

  if (hasMageQiPassive && !skillReady && player.profession === ProfessionType.Mage) {
    messages.push("【靈潮循環】法力餘波裹住普攻，讓空窗期不致斷勢。");
  }

  if (bodyFoundationStacks > 0) {
    messages.push(`【蠻荒血脈】氣血越低，凶性越盛，當前 ${bodyFoundationStacks} 層血脈沸騰同步拔高攻勢。`);
  }

  return messages.map((message) => ({
    turn: 0,
    timeMs: currentTimeMs,
    isPlayer: true as const,
    message,
    damage: 0,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: options.enemy.maxHp,
  }));
};

const logPlayerSwordResonance = ({
  skillReady,
  activeSkillCanonicalId,
  activeSwordQiStatuses,
  hasSwordQiChain,
  currentTimeMs,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  skillReady: boolean;
  activeSkillCanonicalId?: string;
  activeSwordQiStatuses: CombatStatusLike[];
  hasSwordQiChain: boolean;
  currentTimeMs: number;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (
    skillReady &&
    activeSkillCanonicalId === "s_tr_active" &&
    activeSwordQiStatuses.length > 0
  ) {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【萬劍歸一】引爆 ${activeSwordQiStatuses.length} 層劍氣共鳴，劍勢瞬間攀升。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
    return true;
  }

  if (skillReady && activeSkillCanonicalId === "s_tr_active" && hasSwordQiChain) {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【萬劍歸一】殘存劍勢與破劫一擊共鳴，爆發再度攀升。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return false;
};

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

const resolvePlayerTurnPrelude = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  pVsE,
  bossBroken,
  playerHp,
  playerStatuses,
  nextSwordImmortalGuardAtMs,
  hasSwordImmortalPassive,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  pVsE: RestrictionLike;
  bossBroken: boolean;
  playerHp: number;
  playerStatuses: CombatStatusLike[];
  nextSwordImmortalGuardAtMs: number;
  hasSwordImmortalPassive: boolean;
}) => {
  ({ playerStatuses, nextSwordImmortalGuardAtMs } = applyPeriodicPassiveStatuses({
    logs,
    turn,
    timeMs: currentTimeMs,
    player,
    playerHp,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.maxHp,
    playerStatuses,
    hasSwordImmortalPassive,
    nextSwordImmortalGuardAtMs,
  }));

  bossBroken = rollBossBreakOpportunity({
    enemy,
    restriction: pVsE,
    bossBroken,
    currentTimeMs,
    turn,
    logs,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.maxHp,
  });

  return {
    playerStatuses,
    nextSwordImmortalGuardAtMs,
    bossBroken,
  };
};

const resolveEnemySwordHeartAftermath = ({
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

const resolveEnemySpecialReadyAfterAction = ({
  enemy,
  currentTimeMs,
  enemySpecialReady,
  enemySpecialReadyAtMs,
  enemySpecialTimelineProfile,
}: {
  enemy: Enemy;
  currentTimeMs: number;
  enemySpecialReady: boolean;
  enemySpecialReadyAtMs: number;
  enemySpecialTimelineProfile?: EnemySpecialTimelineProfile;
}) => {
  if (!enemySpecialReady || !enemy.specialAttack) {
    return enemySpecialReadyAtMs;
  }

  const specialCooldown = getResolvedEnemySpecialCooldownSeconds(enemy);
  return (
    currentTimeMs +
    Math.floor(specialCooldown * 1000) +
    (enemySpecialTimelineProfile?.executionTimeMs ?? 0)
  );
};

const resolveEnemyActionWindow = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerStatuses,
  enemyStatuses,
  playerHp,
  playerMp,
  enemyHp,
  enemyAttackIntervalMs,
  enemySpecialReadyAtMs,
  bodyTribulationStacks,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  dependencies,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  enemyAttackIntervalMs: number;
  enemySpecialReadyAtMs: number;
  bodyTribulationStacks: number;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  dependencies: Pick<TurnPhaseDependencies, "resolveEnemyOffenseRoll">;
}) => {
  if (hasIncapacitatingStatus(enemyStatuses, currentTimeMs)) {
    return {
      skipped: true as const,
      ...resolveEnemyIncapacitatedTurn({
        currentTimeMs,
        enemy,
        enemyAttackIntervalMs,
        hasSwordHeartPassive,
        playerDamagedSinceSwordHeartWindow,
        swordHeartStacks,
        logs,
        turn,
        playerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp: enemy.maxHp,
      }),
    };
  }

  enemySpecialReadyAtMs = applyEnemySpecialTimingDelay({
    logs,
    turn,
    timeMs: currentTimeMs,
    enemy,
    enemyStatuses,
    enemySpecialReadyAtMs,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });
  const enemySpecialReady =
    enemy.specialAttack && currentTimeMs >= enemySpecialReadyAtMs;
  const enemySpecialTimelineProfile = enemySpecialReady
    ? getEnemySpecialTimelineProfile(enemy)
    : undefined;
  const offenseRoll = dependencies.resolveEnemyOffenseRoll({
    enemy,
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    enemyStatuses,
    playerStatuses,
    currentTimeMs,
    enemySpecialReady: Boolean(enemySpecialReady),
    enemySpecialTimelineProfile: enemySpecialTimelineProfile ?? undefined,
    passiveFlags,
    bodyTribulationStacks,
  });

  return {
    skipped: false as const,
    enemySpecialReadyAtMs,
    enemySpecialReady: Boolean(enemySpecialReady),
    enemySpecialTimelineProfile,
    ...offenseRoll,
  };
};

const resolveEnemyActionPhase = ({
  enemyActionWindow,
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  swordDeathWardUsed,
  bodyTribulationStacks,
  bodyRebirthTrueUsed,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  enemyAttackIntervalMs,
  dependencies,
}: {
  enemyActionWindow: Exclude<
    ReturnType<typeof resolveEnemyActionWindow>,
    { skipped: true }
  >;
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  enemyAttackIntervalMs: number;
  dependencies: Pick<
    TurnPhaseDependencies,
    "resolveEnemyTurnAftermath"
  >;
}) => {
  let {
    enemyDamage,
    isDodge,
    voidEvasion,
    isBlock,
    bodyFoundationStacks,
  } = enemyActionWindow;

  ({
    enemyDamage,
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
  } = dependencies.resolveEnemyTurnAftermath({
    enemyDamage,
    isDodge,
    voidEvasion,
    isBlock,
    enemySpecialReady: Boolean(enemyActionWindow.enemySpecialReady),
    currentTimeMs,
    turn,
    logs,
    enemy,
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    passiveFlags,
    bodyFoundationStacks,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
  }));
  ({
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
  } = resolveEnemySwordHeartAftermath({
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
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  }));

  const enemySpecialReadyAtMs = resolveEnemySpecialReadyAfterAction({
    enemy,
    currentTimeMs,
    enemySpecialReady: enemyActionWindow.enemySpecialReady,
    enemySpecialReadyAtMs: enemyActionWindow.enemySpecialReadyAtMs,
    enemySpecialTimelineProfile: enemyActionWindow.enemySpecialTimelineProfile,
  });

  return {
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    enemyStatuses,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
    enemySpecialReadyAtMs,
    enemyNextActionMs: currentTimeMs + enemyAttackIntervalMs,
  };
};

const resolvePlayerTurn = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  pVsE,
  bossBroken,
  playerDebuffed,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  swordHeartStacks,
  playerAttackIntervalMs,
  hasMageFusionPassive,
  dependencies,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  pVsE: RestrictionLike;
  bossBroken: boolean;
  playerDebuffed: boolean;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  activeSkill?: Skill;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  playerAttackIntervalMs: number;
  hasMageFusionPassive: boolean;
  dependencies: Pick<
    TurnPhaseDependencies,
    "resolvePlayerOffenseRoll" | "resolvePlayerActiveAftermath"
  >;
}) => {
  const { skillReady, activeSkillTimelineProfile, activeSkillCanonicalId } =
    resolvePlayerActiveSkillWindow({
      activeSkill,
      currentTimeMs,
      activeSkillReadyAtMs,
      playerMp,
      hasMageFusionPassive,
    });

  const {
    dealsDirectDamage,
    effectiveDefense,
    bodyFoundationStacks,
    voidSwordProc,
    manaSpringEmpowered,
    hasSwordQiChain,
    activeSwordQiStatuses,
    isCrit,
    playerDamage,
    pVsE: playerRestriction,
    enemyElementalAffinity: playerEnemyElementalAffinity,
  } = dependencies.resolvePlayerOffenseRoll({
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    activeSkill: activeSkill ?? undefined,
    activeSkillCanonicalId,
    activeSkillTimelineProfile,
    skillReady,
    passiveFlags,
    playerHp,
    playerMp,
    playerStatuses,
    enemyStatuses,
    bossBroken,
    playerDebuffed,
    mageFoundationStacks,
    swordHeartStacks,
    currentTimeMs,
  });

  enemyHp = Math.max(0, enemyHp - playerDamage);

  getPlayerActivePassiveProcMessages({
    player,
    enemy,
    currentTimeMs,
    playerHp,
    enemyHp,
    skillReady,
    activeSkill: activeSkill ?? undefined,
    isCrit,
    manaSpringEmpowered,
    hasMageMahayanaPassive: passiveFlags.hasMageMahayanaPassive,
    hasSwordMahayanaPassive: passiveFlags.hasSwordMahayanaPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
    bodyFoundationStacks,
    voidSwordProc,
  }).forEach((log) => {
    pushCombatLog(logs, {
      ...log,
      turn,
    });
  });

  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    message: createPlayerAttackLogMessage({
      player,
      skillReady,
      activeSkill: activeSkill ?? undefined,
      isCrit,
      playerDamage,
    }),
    damage: playerDamage,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  logSwordQiArmorBreak({
    shouldTrigger: shouldApplySwordQiArmorBreak({
      passiveFlags,
      skill: skillReady ? activeSkill ?? undefined : undefined,
      isCrit,
      enemyHp,
    }),
    logs,
    turn,
    timeMs: currentTimeMs,
    enemy,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  if (
    logPlayerSwordResonance({
      skillReady,
      activeSkillCanonicalId,
      activeSwordQiStatuses,
      hasSwordQiChain,
      currentTimeMs,
      logs,
      turn,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    })
  ) {
    playerStatuses = playerStatuses.filter(
      (status) =>
        !(
          status.kind === "critBoost" &&
          status.expiresAtMs > currentTimeMs
        )
    );
  }

  ({
    enemyHp,
    playerHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  } = dependencies.resolvePlayerActiveAftermath({
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    skillReady,
    activeSkill: activeSkill ?? undefined,
    activeSkillCanonicalId,
    currentTimeMs,
    turn,
    logs,
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    playerDamage,
    effectiveDefense,
    pVsE: playerRestriction,
    enemyElementalAffinity: playerEnemyElementalAffinity,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    isCrit,
    dealsDirectDamage,
    passiveFlags,
  }));

  const skillExecutionTimeMs = activeSkillTimelineProfile?.executionTimeMs ?? 0;

  return {
    enemyHp,
    playerHp,
    playerMp,
    playerStatuses,
    enemyStatuses,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    playerNextActionMs:
      currentTimeMs + Math.max(playerAttackIntervalMs, skillExecutionTimeMs),
  };
};

const resolvePlayerActionPhase = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  pVsE,
  bossBroken,
  playerDebuffed,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  swordHeartStacks,
  playerAttackIntervalMs,
  nextSwordImmortalGuardAtMs,
  hasMageFusionPassive,
  hasSwordImmortalPassive,
  dependencies,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  pVsE: RestrictionLike;
  bossBroken: boolean;
  playerDebuffed: boolean;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  activeSkill?: Skill;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  playerAttackIntervalMs: number;
  nextSwordImmortalGuardAtMs: number;
  hasMageFusionPassive: boolean;
  hasSwordImmortalPassive: boolean;
  dependencies: Pick<
    TurnPhaseDependencies,
    "resolvePlayerOffenseRoll" | "resolvePlayerActiveAftermath"
  >;
}) => {
  ({
    playerStatuses,
    nextSwordImmortalGuardAtMs,
    bossBroken,
  } = resolvePlayerTurnPrelude({
    currentTimeMs,
    turn,
    player,
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    logs,
    pVsE,
    bossBroken,
    playerHp,
    playerStatuses,
    nextSwordImmortalGuardAtMs,
    hasSwordImmortalPassive,
  }));

  const playerTurnResult = resolvePlayerTurn({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    pVsE,
    bossBroken,
    playerDebuffed,
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    enemyStatuses,
    activeSkill,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    swordHeartStacks,
    playerAttackIntervalMs,
    hasMageFusionPassive,
    dependencies,
  });

  return {
    ...playerTurnResult,
    nextSwordImmortalGuardAtMs,
    bossBroken,
  };
};

export const resolvePlayerTurnPhase = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  pVsE,
  bossBroken,
  playerDebuffed,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  swordHeartStacks,
  playerAttackIntervalMs,
  nextSwordImmortalGuardAtMs,
  hasMageFusionPassive,
  hasSwordImmortalPassive,
  dependencies,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  pVsE: RestrictionLike;
  bossBroken: boolean;
  playerDebuffed: boolean;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  activeSkill?: Skill;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  playerAttackIntervalMs: number;
  nextSwordImmortalGuardAtMs: number;
  hasMageFusionPassive: boolean;
  hasSwordImmortalPassive: boolean;
  dependencies: Pick<
    TurnPhaseDependencies,
    "resolvePlayerOffenseRoll" | "resolvePlayerActiveAftermath"
  >;
}) =>
  resolvePlayerActionPhase({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    pVsE,
    bossBroken,
    playerDebuffed,
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    enemyStatuses,
    activeSkill,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    swordHeartStacks,
    playerAttackIntervalMs,
    nextSwordImmortalGuardAtMs,
    hasMageFusionPassive,
    hasSwordImmortalPassive,
    dependencies,
  });

export const resolveEnemyTurnPhase = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  swordDeathWardUsed,
  bodyTribulationStacks,
  bodyRebirthTrueUsed,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  enemyAttackIntervalMs,
  enemySpecialReadyAtMs,
  dependencies,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  enemyAttackIntervalMs: number;
  enemySpecialReadyAtMs: number;
  dependencies: Pick<
    TurnPhaseDependencies,
    "resolveEnemyOffenseRoll" | "resolveEnemyTurnAftermath"
  >;
}) => {
  const enemyActionWindow = resolveEnemyActionWindow({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    playerStatuses,
    enemyStatuses,
    playerHp,
    playerMp,
    enemyHp,
    enemyAttackIntervalMs,
    enemySpecialReadyAtMs,
    bodyTribulationStacks,
    hasSwordHeartPassive,
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
    dependencies,
  });

  if (enemyActionWindow.skipped) {
    return {
      skipped: true as const,
      enemyNextActionMs: enemyActionWindow.enemyNextActionMs,
      swordHeartStacks: enemyActionWindow.swordHeartStacks,
      playerDamagedSinceSwordHeartWindow:
        enemyActionWindow.playerDamagedSinceSwordHeartWindow,
    };
  }

  const resolvedEnemyActionWindow = enemyActionWindow as Exclude<
    ReturnType<typeof resolveEnemyActionWindow>,
    { skipped: true }
  >;

  return {
    skipped: false as const,
    ...resolveEnemyActionPhase({
      enemyActionWindow: resolvedEnemyActionWindow,
      currentTimeMs,
      turn,
      player: {
        ...player,
        hp: playerHp,
        mp: playerMp,
      },
      enemy,
      logs,
      passiveFlags,
      playerHp,
      playerMp,
      enemyHp,
      playerStatuses,
      enemyStatuses,
      swordDeathWardUsed,
      bodyTribulationStacks,
      bodyRebirthTrueUsed,
      hasSwordHeartPassive,
      playerDamagedSinceSwordHeartWindow,
      swordHeartStacks,
      enemyAttackIntervalMs,
      dependencies,
    }),
  };
};
