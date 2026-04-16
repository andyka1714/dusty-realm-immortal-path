import {
  ActiveMonster,
  BaseAttributes,
  Enemy,
  CombatLog,
  MajorRealm,
  SpiritRootId,
  ElementType,
  EnemyRank,
  ProfessionType,
  Skill,
} from "../types";
import {
  REALM_BASE_STATS,
  SPIRIT_ROOT_DETAILS,
  SPIRIT_ROOT_TO_ELEMENT,
  ELEMENT_NAMES,
} from "../constants";
import { getFormalSkillId } from "../data/skills";
import { getWorldSkillAreaTargets } from "./worldCombat";
import {
  clearCombatLogSnapshotProvider,
  pushCombatLog,
} from "./battleLog";
import {
  type PlayerPassiveFlags,
  getBodyFoundationBloodlineStacks,
  getCanonicalSkillId,
  getCopperSkinReductionMultiplier,
  getMageQiCycleRecovery,
  getPlayerPassiveFlags,
  getSwordQiPassiveCritBonus,
  hasLearnedSkillId,
  hasSwordTribulationWindow,
  isManaSpringEmpowered,
} from "./battlePassives";
import {
  appendAndLogCombatStatuses,
  isNegativeStatusKind,
  getStatusLabel,
  isDotStatusKind,
} from "./battleStatuses";
import {
  resolveNormalizedEnemySpecialStatuses,
  resolvePlayerSkillStatusApplication,
  shouldApplySwordQiArmorBreak,
} from "./battleStatusEffects";
import {
  AutoBattleReplayTransitionStatePlan,
  CombatTimerBucket,
  CombatTimerBuckets,
  WorldBattleResultCleanup,
  WorldBattleResultLifecyclePlan,
  WorldCombatEncounterState,
  WorldPlayerDefeatPlan,
  WorldPlayerDefeatStatePlan,
  clearAllCombatTimers,
  clearCombatTimerBucket,
  createClearWorldCombatEncounterState,
  createCombatTimerBuckets,
  createResetWorldCombatEncounterState,
  createWorldPlayerDefeatStatePlan,
  getBattleReportAutoCloseDelayMs,
  getBattleRespawnMapId,
  resolveAutoBattleReplayLifecycle,
  resolveAutoBattleReplayTransition,
  resolveWorldBattleResultCleanup,
  resolveWorldBattleResultLifecyclePlan,
  resolveWorldPlayerDefeatOutcome,
  resolveWorldPlayerDefeatPlan,
} from "./battleLifecycle";
import {
  AutoBattleReplaySession,
} from "./battleReplay";
import {
  BattleLogEntryPlan,
  BattleRewardApplicationPlan,
  BattleRewardManifest,
  createBattleRewardApplicationPlan,
  createBattleRewardManifest,
} from "./battleRewards";
import {
  AutoBattleTimelineResult,
  createCombatDefeatLog,
  finalizeCombatResult,
  resolveVictoryRewards,
} from "./battleTimelineResults";
import {
  CombatLoopState,
  applyPreparedCombatLoopState,
  buildCombatLoopState,
  buildCombatLoopStepResult,
  createInitialCombatLoopState,
  runCombatTimelineLoop,
} from "./battleTimeline";
import {
  EnemyWorldStrikeOutcomeStatePlan,
  EnemyWorldStrikePreviewPlan,
  EnemyWorldStrikeResolved,
  PlayerWorldStrikeOutcomeStatePlan,
  PlayerWorldStrikePreviewPlan,
  WorldShieldedDamageResolution,
  WorldStrikeImpactPlan,
  WorldStrikeResult,
  WorldStrikeVisualPlan,
  createEnemyWorldStrikeExecutionPlan,
  createEnemyWorldStrikeOutcomeStatePlan,
  createEnemyWorldStrikePreviewPlan,
  createPlayerWorldStrikeExecutionPlan,
  createPlayerWorldStrikeOutcomeStatePlan,
  createPlayerWorldStrikePreviewPlan,
  getEnemyWorldStrikePreviewMessage,
  getEnemyWorldStrikeResolutionMessage,
  getPlayerWorldStrikePreviewMessage,
  getPlayerWorldStrikeResolutionMessage,
  resolveEnemyWorldStrikeOutcomePlan,
  resolveEnemyWorldStrikeOutcomeStatePlan,
  resolvePlayerWorldStrikeOutcomePlan,
  resolvePlayerWorldStrikeOutcomeStatePlan,
  resolveWorldShieldedDamage,
  runEnemyWorldStrikeOutcomePipeline,
  runPlayerWorldStrikeOutcomePipeline,
} from "./battleWorldStrike";
import {
  WorldCombatActionWindow,
  WorldCombatAutoTargetContext,
  WorldCombatControllerFrameResult,
  resolveWorldCombatActionWindow,
  resolveWorldCombatAutoTarget,
  runEnemyWorldStrikeAction,
  runEnemyWorldStrikePipeline,
  runPlayerWorldStrikeAction,
  runPlayerWorldStrikePipeline,
  runWorldCombatActionWindowStep,
  runWorldCombatControllerFrame,
  runWorldCombatControllerStep,
  runWorldCombatStep,
  runWorldEnemyCombatAction,
  runWorldPlayerCombatAction,
  selectNearestWorldCombatTarget,
} from "./battleWorldController";
import {
  TimedCombatQueuePlan,
  createResolvedTimedCombatPlan,
  createResolvedWorldStrikeActionPlan,
  createTimedCombatPlan,
  createWorldStrikeQueuePlan,
  getBattleReplayStepDelayMs,
  queueResolvedTimedCombatPlan,
  queueTimedCombatPlan,
  runResolvedWorldStrikeAction,
  scheduleTimedCombatAction,
} from "./battleTiming";
import {
  type CombatLoopFeatureFlags,
  type CombatRuntimeContext,
  createCombatLoopFeatureFlags,
  createCombatRuntimeContext,
  getEnemyElementalModifier,
  getRestriction,
  prepareCombatLoopEnvironment,
  resolveTurnStartMaintenance,
} from "./battleEncounter";
import {
  getEnemyAttackIntervalMs,
  EnemySpecialTimelineProfile,
  SkillTimelineProfile,
  getEnemySpecialTimelineProfile,
  getLearnedSkills,
  getPlayerAttackIntervalMs,
  getResolvedEnemySpecialCooldownSeconds,
  getResolvedSkillCooldownSeconds,
  getSkillTimelineProfile,
  resolvePlayerActiveSkillWindow,
} from "./battleProfiles";
import {
  resolveEnemyTurnPhase,
  resolvePlayerTurnPhase,
} from "./battleTurnPhases";

export type {
  AutoBattleReplayControllerResult,
  AdvancedAutoBattleReplaySession,
  AutoBattleReplayFinishPlan,
} from "./battleReplay";
export {
  appendAndLogCombatStatuses,
  createCombatSnapshotProvider,
  createStatusTickProcessor,
  getStatusLabel,
  isDotStatusKind,
  isNegativeStatusKind,
} from "./battleStatuses";
export {
  resolveNormalizedEnemySpecialStatuses,
  resolvePlayerSkillStatusApplication,
  shouldApplySwordQiArmorBreak,
} from "./battleStatusEffects";
export {
  advanceAutoBattleReplaySession,
  createAutoBattleReplayFinishEffects,
  createAutoBattleReplayFinishPlan,
  createAutoBattleReplayState,
  createAutoBattleReplayStepStatePlan,
  createBattleReplayVisualPlan,
  createIdleAutoBattleReplayState,
  runAutoBattleReplayController,
  runAutoBattleReplayFrame,
  runAutoBattleReplayStateFrame,
  runAutoBattleReplayStep,
  runResolvedBattleReplayStep,
  resolveAutoBattleReplayFinishResultPlan,
  resolveAutoBattleReplayOutcome,
} from "./battleReplay";
export type {
  AutoBattleReplayLifecycle,
  AutoBattleReplayTransition,
  CombatTimerBucket,
  CombatTimerBuckets,
  WorldBattleResultCleanup,
  WorldBattleResultLifecyclePlan,
  WorldCombatEncounterState,
  WorldPlayerDefeatOutcome,
  WorldPlayerDefeatPlan,
  WorldPlayerDefeatStatePlan,
} from "./battleLifecycle";
export {
  clearAllCombatTimers,
  clearCombatTimerBucket,
  createClearWorldCombatEncounterState,
  createCombatTimerBuckets,
  createResetWorldCombatEncounterState,
  createWorldPlayerDefeatStatePlan,
  getBattleReportAutoCloseDelayMs,
  getBattleRespawnMapId,
  resolveAutoBattleReplayLifecycle,
  resolveAutoBattleReplayTransition,
  resolveAutoBattleReplayTransitionStatePlan,
  resolveWorldBattleResultCleanup,
  resolveWorldBattleResultLifecyclePlan,
  resolveWorldPlayerDefeatOutcome,
  resolveWorldPlayerDefeatPlan,
} from "./battleLifecycle";
export type {
  BattleLogEntryPlan,
  BattleRewardApplicationPlan,
  BattleRewardManifest,
} from "./battleRewards";
export {
  createBattleRewardApplicationPlan,
  createBattleRewardManifest,
} from "./battleRewards";
export type { AutoBattleRewards, AutoBattleTimelineResult } from "./battleTimelineResults";
export {
  createCombatDefeatLog,
  finalizeCombatResult,
  resolveVictoryRewards,
} from "./battleTimelineResults";
export type { TimedCombatQueuePlan } from "./battleTiming";
export {
  createBattleReplayStepPlan,
  createResolvedTimedCombatPlan,
  createResolvedWorldStrikeActionPlan,
  createTimedCombatPlan,
  createWorldStrikeQueuePlan,
  getBattleReplayStepDelayMs,
  queueResolvedTimedCombatPlan,
  queueTimedCombatPlan,
  runResolvedTimedCombatPlan,
  runResolvedWorldStrikeAction,
  scheduleTimedCombatAction,
} from "./battleTiming";
export type {
  EnemySpecialTimelineProfile,
  SkillTimelineProfile,
} from "./battleProfiles";
export {
  getEnemySpecialTimelineProfile,
  getLearnedSkills,
  getResolvedEnemySpecialCooldownSeconds,
  getResolvedSkillCooldownSeconds,
  getSkillTimelineProfile,
  resolvePlayerActiveSkillWindow,
} from "./battleProfiles";
export type {
  CombatLoopFeatureFlags,
  CombatRuntimeContext,
} from "./battleEncounter";
export {
  applyEnemySpecialTimingDelay,
  applyPeriodicPassiveStatuses,
  createCombatLoopFeatureFlags,
  createCombatRuntimeContext,
  getEnemyElementalModifier,
  getRestriction,
  prepareCombatLoopEnvironment,
  resolveEnemyIncapacitatedTurn,
  resolveTurnStartMaintenance,
  rollBossBreakOpportunity,
} from "./battleEncounter";
export type {
  EnemyWorldStrikeExecutionPlan,
  EnemyWorldStrikeOutcomePlan,
  EnemyWorldStrikeOutcomeStatePlan,
  EnemyWorldStrikePreviewPlan,
  EnemyWorldStrikeResolved,
  PlayerWorldStrikeDefeatResult,
  PlayerWorldStrikeExecutionPlan,
  PlayerWorldStrikeImpactTarget,
  PlayerWorldStrikeOutcomePlan,
  PlayerWorldStrikeOutcomeStatePlan,
  PlayerWorldStrikePreviewPlan,
  WorldShieldedDamageResolution,
  WorldStrikeImpactPlan,
  WorldStrikeResult,
  WorldStrikeVisualPlan,
} from "./battleWorldStrike";
export {
  createEnemyWorldStrikeExecutionPlan,
  createEnemyWorldStrikeOutcomeStatePlan,
  createEnemyWorldStrikePreviewPlan,
  createPlayerWorldStrikeExecutionPlan,
  createPlayerWorldStrikeOutcomeStatePlan,
  createPlayerWorldStrikePreviewPlan,
  getEnemyWorldStrikePreviewMessage,
  getEnemyWorldStrikeResolutionMessage,
  getPlayerWorldStrikePreviewMessage,
  getPlayerWorldStrikeResolutionMessage,
  resolveEnemyWorldStrikeOutcomePlan,
  resolveEnemyWorldStrikeOutcomeStatePlan,
  resolvePlayerWorldStrikeOutcomePlan,
  resolvePlayerWorldStrikeOutcomeStatePlan,
  resolveWorldShieldedDamage,
  runEnemyWorldStrikeOutcomePipeline,
  runPlayerWorldStrikeOutcomePipeline,
} from "./battleWorldStrike";
export type {
  WorldCombatActionWindow,
  WorldCombatAutoTargetContext,
  WorldCombatControllerFrameResult,
} from "./battleWorldController";
export {
  resolveWorldCombatActionWindow,
  resolveWorldCombatAutoTarget,
  runEnemyWorldStrikeAction,
  runEnemyWorldStrikePipeline,
  runPlayerWorldStrikeAction,
  runPlayerWorldStrikePipeline,
  runWorldCombatActionWindowStep,
  runWorldCombatControllerFrame,
  runWorldCombatControllerStep,
  runWorldCombatStep,
  runWorldEnemyCombatAction,
  runWorldPlayerCombatAction,
  selectNearestWorldCombatTarget,
} from "./battleWorldController";
export type { CombatLogSnapshotProvider } from "./battleLog";
export {
  clearCombatLogSnapshotProvider,
  formatSpiritStones,
  pushCombatLog,
  setCombatLogSnapshotProvider,
} from "./battleLog";
export type { PlayerPassiveFlags } from "./battlePassives";
export {
  getBodyFoundationBloodlineStacks,
  getCanonicalSkillId,
  getCopperSkinReductionMultiplier,
  getMageQiCycleRecovery,
  getPlayerPassiveFlags,
  getSwordQiPassiveCritBonus,
  hasExactPassiveSkillId,
  hasLearnedSkillId,
  hasPassiveSkillId,
  hasSwordTribulationWindow,
  isManaSpringEmpowered,
} from "./battlePassives";

export interface PlayerCombatStats {
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
}

type AttackMode = "physical" | "magical" | "hybrid";

interface AttackContext {
  power: number;
  defense: number;
  critBonus: number;
  critDamageBonus: number;
  damageBonus: number;
  canCrit: boolean;
}

interface PassiveSkillBonuses {
  hpPercent: number;
  mpPercent: number;
  attackPercent: number;
  magicPercent: number;
  defensePercent: number;
  resPercent: number;
  critBonus: number;
  critDamageBonus: number;
  dodgeBonus: number;
  damageReductionBonus: number;
  regenHpBonus: number;
}

const createEmptyPassiveSkillBonuses = (): PassiveSkillBonuses => ({
  hpPercent: 0,
  mpPercent: 0,
  attackPercent: 0,
  magicPercent: 0,
  defensePercent: 0,
  resPercent: 0,
  critBonus: 0,
  critDamageBonus: 0,
  dodgeBonus: 0,
  damageReductionBonus: 0,
  regenHpBonus: 0,
});

const addPassiveSkillBonuses = (
  target: PassiveSkillBonuses,
  source: Partial<PassiveSkillBonuses>
) => {
  target.hpPercent += source.hpPercent ?? 0;
  target.mpPercent += source.mpPercent ?? 0;
  target.attackPercent += source.attackPercent ?? 0;
  target.magicPercent += source.magicPercent ?? 0;
  target.defensePercent += source.defensePercent ?? 0;
  target.resPercent += source.resPercent ?? 0;
  target.critBonus += source.critBonus ?? 0;
  target.critDamageBonus += source.critDamageBonus ?? 0;
  target.dodgeBonus += source.dodgeBonus ?? 0;
  target.damageReductionBonus += source.damageReductionBonus ?? 0;
  target.regenHpBonus += source.regenHpBonus ?? 0;
};

const FORMAL_PASSIVE_SKILL_BONUS_MAP: Record<string, Partial<PassiveSkillBonuses>> = {
  s_q_passive: {
    attackPercent: 6,
    critBonus: 2,
    critDamageBonus: 11,
  },
  s_g_passive: {
    attackPercent: 10,
    critBonus: 3,
    critDamageBonus: 17,
  },
  s_n_passive: {
    attackPercent: 12,
    critBonus: 3.4,
    critDamageBonus: 20,
  },
  s_sf_passive: {
    attackPercent: 14,
    critBonus: 4,
    critDamageBonus: 23,
  },
  s_tr_passive: {
    attackPercent: 20,
    critBonus: 5.8,
    critDamageBonus: 32,
  },
  s_bi_passive: {
    attackPercent: 22,
    critBonus: 6.2,
    critDamageBonus: 35,
  },
  s_vr_passive: {
    attackPercent: 24,
    critBonus: 6.8,
    critDamageBonus: 38,
  },
  s_ma_passive: {
    attackPercent: 26,
    critBonus: 7.4,
    critDamageBonus: 42,
  },
  s_im_passive: {
    attackPercent: 29,
    critBonus: 8.2,
    critDamageBonus: 46,
  },
  s_ie_passive: {
    attackPercent: 32,
    critBonus: 9,
    critDamageBonus: 50,
  },
  b_q_passive: {
    damageReductionBonus: 1,
  },
  b_f_passive: {
    hpPercent: 11,
    defensePercent: 8,
    damageReductionBonus: 1,
  },
  b_g_passive: {
    hpPercent: 14,
    defensePercent: 10,
    damageReductionBonus: 1,
  },
  b_n_passive: {
    hpPercent: 17,
    defensePercent: 12,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_sf_passive: {
    hpPercent: 20,
    defensePercent: 14,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_tr_passive: {
    hpPercent: 23,
    defensePercent: 16,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_bi_passive: {
    hpPercent: 26,
    defensePercent: 18,
    damageReductionBonus: 2,
    regenHpBonus: 1,
  },
  b_vr_passive: {
    hpPercent: 30,
    defensePercent: 20,
    damageReductionBonus: 2,
    regenHpBonus: 2,
  },
  b_ma_passive: {
    hpPercent: 34,
    defensePercent: 22,
    damageReductionBonus: 2,
    regenHpBonus: 2,
  },
  b_im_passive: {
    hpPercent: 38,
    defensePercent: 24,
    damageReductionBonus: 3,
    regenHpBonus: 2,
  },
  b_ie_passive: {
    hpPercent: 42,
    defensePercent: 26,
    damageReductionBonus: 3,
    regenHpBonus: 3,
  },
  m_q_passive: {
    magicPercent: 9,
    mpPercent: 10,
    resPercent: 6,
    critDamageBonus: 6,
  },
  m_f_passive: {
    magicPercent: 16,
    mpPercent: 18,
    resPercent: 10,
    critDamageBonus: 12,
  },
  m_g_passive: {
    magicPercent: 15,
    mpPercent: 18,
    resPercent: 10,
    critDamageBonus: 10,
  },
  m_n_passive: {
    magicPercent: 18,
    mpPercent: 22,
    resPercent: 12,
    critDamageBonus: 12,
  },
  m_sf_passive: {
    magicPercent: 21,
    mpPercent: 26,
    resPercent: 14,
    critDamageBonus: 14,
    dodgeBonus: 1,
  },
  m_tr_passive: {
    magicPercent: 24,
    mpPercent: 30,
    resPercent: 16,
    critDamageBonus: 16,
    dodgeBonus: 1,
  },
  m_bi_passive: {
    magicPercent: 27,
    mpPercent: 34,
    resPercent: 18,
    critDamageBonus: 18,
    dodgeBonus: 2,
  },
  m_vr_passive: {
    magicPercent: 30,
    mpPercent: 38,
    resPercent: 20,
    critDamageBonus: 20,
    dodgeBonus: 2,
  },
  m_ma_passive: {
    magicPercent: 33,
    mpPercent: 42,
    resPercent: 22,
    critDamageBonus: 22,
    dodgeBonus: 2,
  },
  m_im_passive: {
    magicPercent: 36,
    mpPercent: 46,
    resPercent: 24,
    critDamageBonus: 24,
    dodgeBonus: 3,
  },
  m_ie_passive: {
    magicPercent: 40,
    mpPercent: 50,
    resPercent: 26,
    critDamageBonus: 26,
    dodgeBonus: 3,
  },
};

type CombatStatusKind =
  | "incapacitate"
  | "burn"
  | "poison"
  | "bleed"
  | "armorBreak"
  | "critBoost"
  | "shield"
  | "reflect"
  | "drain";

interface CombatStatus {
  id: string;
  name: string;
  kind: CombatStatusKind;
  value: number;
  expiresAtMs: number;
  nextTickAtMs?: number;
}

const hasEnemyAffix = (enemy: Enemy, affix: string) =>
  enemy.affixes?.includes(affix) ?? false;

const getEnemyDefenseMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "堅甲")) multiplier *= 1.1;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 1.05;
  return multiplier;
};

const getEnemyDamageReductionMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "霸體")) multiplier *= 0.97;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 0.98;
  return multiplier;
};

const getEnemyAttackPowerMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "強襲")) multiplier *= 1.08;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 1.05;
  return multiplier;
};

const getAttackMode = (profession: ProfessionType): AttackMode => {
  switch (profession) {
    case ProfessionType.Mage:
      return "magical";
    case ProfessionType.Body:
      return "hybrid";
    default:
      return "physical";
  }
};

const getProfessionPassives = (profession: ProfessionType) => {
  switch (profession) {
    case ProfessionType.Sword:
      return {
        critBonus: 8,
        critDamageBonus: 45,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
    case ProfessionType.Body:
      return {
        critBonus: 0,
        critDamageBonus: 0,
        damageReductionBonus: 3,
        regenHpBonus: 0,
      };
    case ProfessionType.Mage:
      return {
        critBonus: 4,
        critDamageBonus: 20,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
    default:
      return {
        critBonus: 0,
        critDamageBonus: 0,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
  }
};

const getPassiveSkillBonuses = (
  learnedSkills: Skill[]
): PassiveSkillBonuses => {
  const bonuses = createEmptyPassiveSkillBonuses();

  learnedSkills
    .filter((skill) => skill.type === "Passive" && skill.profession)
    .forEach((skill) => {
      addPassiveSkillBonuses(
        bonuses,
        FORMAL_PASSIVE_SKILL_BONUS_MAP[getFormalSkillId(skill.id)] ?? {}
      );
    });

  return bonuses;
};

type EnemyWorldPassiveStatusOptions = {
  passiveFlags: PlayerPassiveFlags;
  prePassiveDamage: number;
  playerMaxHp: number;
  voidEvasion: boolean;
  bodyFoundationStacks: number;
  copperSkinTriggered: boolean;
  bodyFusionTriggered: boolean;
  elementalBarrierTriggered: boolean;
  reflectTriggered: boolean;
  enemyElement: ElementType;
  bodyTribulationTriggered: boolean;
  mageTribulationTriggered: boolean;
  mageTribulationControlTriggered: boolean;
  swordFusionControlTriggered: boolean;
  bodyRebirthTrueTriggered: boolean;
  swordDeathWardTriggered: boolean;
  bodyEmperorTriggered: boolean;
};

const getEnemyWorldDefensivePassiveStatusNames = (
  options: EnemyWorldPassiveStatusOptions
) => {
  const statusNames: string[] = [];
  const {
    prePassiveDamage,
    playerMaxHp,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
  } = options;

  if (reflectTriggered) {
    statusNames.push("反震");
  }

  if (bodyFoundationStacks > 0) {
    statusNames.push("蠻荒血脈");
  }

  if (copperSkinTriggered) {
    statusNames.push("銅皮鐵骨");
  }

  if (bodyFusionTriggered) {
    statusNames.push("金剛法相");
  }

  if (options.passiveFlags.hasBodySaintPassive && prePassiveDamage > 0) {
    statusNames.push("肉身成聖");
  }

  if (elementalBarrierTriggered) {
    statusNames.push("元素護盾");
  }

  return statusNames;
};

const getEnemyWorldSurvivalPassiveStatusNames = (
  options: EnemyWorldPassiveStatusOptions
) => {
  const statusNames: string[] = [];
  const {
    voidEvasion,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    mageTribulationControlTriggered,
    swordFusionControlTriggered,
    bodyRebirthTrueTriggered,
    swordDeathWardTriggered,
    bodyEmperorTriggered,
    enemyElement,
  } = options;

  if (swordDeathWardTriggered) {
    statusNames.push("護體劍罡");
  }

  if (bodyTribulationTriggered) {
    statusNames.push("萬劫不滅");
  }

  if (mageTribulationTriggered && enemyElement === ElementType.Metal) {
    statusNames.push("雷劫煉心");
  }

  if (mageTribulationControlTriggered) {
    statusNames.push("雷劫煉心");
  }

  if (swordFusionControlTriggered) {
    statusNames.push("人劍合神");
  }

  if (bodyRebirthTrueTriggered) {
    statusNames.push("滴血重生");
  }

  if (bodyEmperorTriggered) {
    statusNames.push("不死不滅");
  }

  if (voidEvasion) {
    statusNames.push("空間法則");
  }

  return statusNames;
};

const getEnemyWorldPassiveStatusNames = (options: EnemyWorldPassiveStatusOptions) => [
  ...getEnemyWorldDefensivePassiveStatusNames(options),
  ...getEnemyWorldSurvivalPassiveStatusNames(options),
];

const getEnemyWorldIncomingStatusNames = ({
  bodyImmortalTriggered,
  swordEmperorTriggered,
}: {
  bodyImmortalTriggered: boolean;
  swordEmperorTriggered: boolean;
}) => {
  const statusNames: string[] = [];

  if (bodyImmortalTriggered) {
    statusNames.push("仙體無垢");
  }

  if (swordEmperorTriggered) {
    statusNames.push("萬法皆空");
  }

  return statusNames;
};

type PlayerWorldPassiveStatusOptions = {
  passiveFlags: PlayerPassiveFlags;
  player: PlayerCombatStats;
  skill?: Skill;
  isCrit: boolean;
  dealsDirectDamage: boolean;
  canonicalSkillId?: string;
  hasSwordQiChain: boolean;
  swordTribulationActive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
};

const getPlayerWorldSwordPassiveStatusNames = (options: PlayerWorldPassiveStatusOptions) => {
  const statusNames: string[] = [];
  const {
    passiveFlags,
    skill,
    isCrit,
    dealsDirectDamage,
    canonicalSkillId,
    hasSwordQiChain,
    swordTribulationActive,
    voidSwordProc,
  } = options;

  if (passiveFlags.hasSwordMahayanaPassive && isCrit) {
    statusNames.push("劍道獨尊");
  }

  if (!skill && passiveFlags.hasSwordImmortalPassive) {
    statusNames.push("仙元護體");
  }

  if (!skill && passiveFlags.hasSwordHeartPassive) {
    statusNames.push("養劍術");
  }

  if (!skill && passiveFlags.hasSwordDeathWardPassive) {
    statusNames.push("護體劍罡");
  }

  if (!skill && passiveFlags.hasSwordFusionPassive) {
    statusNames.push("人劍合神");
  }

  if (
    passiveFlags.hasSwordGoldenPassive &&
    isCrit &&
    dealsDirectDamage &&
    skill?.profession === ProfessionType.Sword
  ) {
    statusNames.push("劍心通明");
  }

  if (swordTribulationActive) {
    statusNames.push("向死而生");
  }

  if (canonicalSkillId === "s_tr_active" && hasSwordQiChain) {
    statusNames.push("萬劍歸一");
  }

  if (!skill && passiveFlags.hasSwordEmperorPassive && dealsDirectDamage) {
    statusNames.push("萬法皆空");
  }

  if (!skill && passiveFlags.hasSwordEchoPassive && dealsDirectDamage) {
    statusNames.push("劍意化形");
  }

  if (
    passiveFlags.hasSwordQiPassive &&
    isCrit &&
    dealsDirectDamage &&
    skill?.profession === ProfessionType.Sword
  ) {
    statusNames.push("劍脈初成");
  }

  if (voidSwordProc) {
    statusNames.push("法則之劍");
  }

  return statusNames;
};

const getPlayerWorldBodyPassiveStatusNames = (options: PlayerWorldPassiveStatusOptions) => {
  const statusNames: string[] = [];
  const { passiveFlags, skill, bodyFoundationStacks } = options;

  if (bodyFoundationStacks > 0) {
    statusNames.push("蠻荒血脈");
  }

  if (!skill && passiveFlags.hasBodyAncientPassive) {
    statusNames.push("荒古戰體");
  }

  if (!skill && passiveFlags.hasBodyQiPassive) {
    statusNames.push("銅皮鐵骨");
  }

  if (!skill && passiveFlags.hasBodyFusionPassive) {
    statusNames.push("金剛法相");
  }

  if (!skill && passiveFlags.hasReflectPassive) {
    statusNames.push("荊棘皮層");
  }

  if (!skill && passiveFlags.hasBodySaintPassive) {
    statusNames.push("肉身成聖");
  }

  if (!skill && passiveFlags.hasBodyRebirthPassive) {
    statusNames.push("滴血重生");
  }

  if (!skill && passiveFlags.hasBodyRebirthTruePassive) {
    statusNames.push("滴血重生（真）");
  }

  if (!skill && passiveFlags.hasBodyTribulationPassive) {
    statusNames.push("萬劫不滅");
  }

  if (!skill && passiveFlags.hasBodyImmortalPassive) {
    statusNames.push("仙體無垢");
  }

  if (!skill && passiveFlags.hasBodyEmperorPassive) {
    statusNames.push("不死不滅");
  }

  return statusNames;
};

const getPlayerWorldMagePassiveStatusNames = (options: PlayerWorldPassiveStatusOptions) => {
  const statusNames: string[] = [];
  const { passiveFlags, player, skill } = options;
  const isMageActionContext = !skill || skill.profession === ProfessionType.Mage;

  if (!skill && passiveFlags.hasMageQiPassive && player.profession === ProfessionType.Mage) {
    statusNames.push("靈潮循環");
  }

  if (!skill && passiveFlags.hasInitialShieldPassive) {
    statusNames.push("元素護盾");
  }

  if (!skill && passiveFlags.hasMageVoidPassive) {
    statusNames.push("空間法則");
  }

  if (isManaSpringEmpowered(player.mp, player.maxMp, passiveFlags)) {
    statusNames.push("法力源泉");
  }

  if (isMageActionContext && passiveFlags.hasMageFoundationPassive) {
    statusNames.push("靈力湧動");
  }

  if (isMageActionContext && passiveFlags.hasMageSpiritSeveringPassive) {
    statusNames.push("道法自然");
  }

  if (isMageActionContext && passiveFlags.hasMageFusionPassive) {
    statusNames.push("五氣朝元");
  }

  if (isMageActionContext && passiveFlags.hasMageMahayanaPassive) {
    statusNames.push("言出法隨");
  }

  if (isMageActionContext && passiveFlags.hasMageTribulationPassive) {
    statusNames.push("雷劫煉心");
  }

  if (isMageActionContext && passiveFlags.hasMageImmortalPassive) {
    statusNames.push("仙法通神");
  }

  if (isMageActionContext && passiveFlags.hasMageEmperorPassive) {
    statusNames.push("萬法歸宗");
  }

  return statusNames;
};

const getPlayerWorldProfessionPassiveStatusNames = (
  options: PlayerWorldPassiveStatusOptions
) => [
  ...getPlayerWorldSwordPassiveStatusNames(options),
  ...getPlayerWorldBodyPassiveStatusNames(options),
  ...getPlayerWorldMagePassiveStatusNames(options),
];

const getResolvedEnemyWorldIncomingStatuses = ({
  special,
  player,
  passiveFlags,
}: {
  special?: Enemy["specialAttack"];
  player: PlayerCombatStats;
  passiveFlags: PlayerPassiveFlags;
}) => {
  const createdStatuses = resolveNormalizedEnemySpecialStatuses(
    special,
    player.maxHp,
    0
  );

  const filteredStatuses = createdStatuses.filter((status) => {
    if (passiveFlags.hasMageTribulationPassive && status.kind === "incapacitate") {
      return false;
    }
    if (passiveFlags.hasSwordEmperorPassive && isNegativeStatusKind(status.kind)) {
      return false;
    }
    if (passiveFlags.hasBodyImmortalPassive && isDotStatusKind(status.kind)) {
      return false;
    }
    return true;
  });

  const bodyImmortalTriggered =
    passiveFlags.hasBodyImmortalPassive &&
    createdStatuses.some((status) => isDotStatusKind(status.kind)) &&
    filteredStatuses.every((status) => !isDotStatusKind(status.kind));

  const swordEmperorTriggered =
    passiveFlags.hasSwordEmperorPassive &&
    createdStatuses.some((status) => isNegativeStatusKind(status.kind)) &&
    filteredStatuses.every((status) => !isNegativeStatusKind(status.kind));

  const mageTribulationControlTriggered =
    passiveFlags.hasMageTribulationPassive &&
    createdStatuses.some((status) => status.kind === "incapacitate") &&
    filteredStatuses.every((status) => status.kind !== "incapacitate");

  return {
    filteredStatuses,
    bodyImmortalTriggered,
    swordEmperorTriggered,
    mageTribulationControlTriggered,
  };
};

const resolveIncomingEnemySpecialStatuses = ({
  special,
  player,
  passiveFlags,
  currentTimeMs,
  shortenControlDuration,
}: {
  special?: Enemy["specialAttack"];
  player: PlayerCombatStats;
  passiveFlags: PlayerPassiveFlags;
  currentTimeMs: number;
  shortenControlDuration: boolean;
}) => {
  const incomingStatuses = getResolvedEnemyWorldIncomingStatuses({
    special,
    player,
    passiveFlags,
  });

  let swordFusionControlTriggered = false;

  const normalizedIncomingStatuses = incomingStatuses.filteredStatuses
    .map((status) => {
      if (shortenControlDuration && status.kind === "incapacitate") {
        swordFusionControlTriggered = true;
        return {
          ...status,
          expiresAtMs: Math.max(currentTimeMs, status.expiresAtMs - 1000),
        };
      }
      return status;
    })
    .filter(
      (status) =>
        status.kind !== "incapacitate" || status.expiresAtMs > currentTimeMs
    );

  return {
    ...incomingStatuses,
    normalizedIncomingStatuses,
    swordFusionControlTriggered,
  };
};

const buildPlayerWorldStrikeResult = ({
  damage,
  isCrit,
  skill,
  player,
  playerSideStatuses,
  filteredEnemyStatuses,
  passiveFlags,
  canonicalSkillId,
  hasSwordQiChain,
  swordTribulationActive,
  bodyFoundationStacks,
  voidSwordProc,
  dealsDirectDamage,
  timelineProfile,
}: {
  damage: number;
  isCrit: boolean;
  skill?: Skill;
  player: PlayerCombatStats;
  playerSideStatuses: CombatStatus[];
  filteredEnemyStatuses: CombatStatus[];
  passiveFlags: PlayerPassiveFlags;
  canonicalSkillId?: string;
  hasSwordQiChain: boolean;
  swordTribulationActive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
  dealsDirectDamage: boolean;
  timelineProfile: ReturnType<typeof getSkillTimelineProfile>;
}): WorldStrikeResult => {
  const playerStatusNames = buildPlayerWorldStrikeStatusNames({
    playerSideStatuses,
    passiveFlags,
    player,
    skill,
    isCrit,
    dealsDirectDamage,
    canonicalSkillId,
    hasSwordQiChain,
    swordTribulationActive,
    bodyFoundationStacks,
    voidSwordProc,
  });

  return {
    damage,
    isCrit,
    skillName: skill?.name,
    ...buildPlayerWorldStrikeTiming({
      player,
      skill,
      timelineProfile,
    }),
    playerStatusNames,
    enemyStatusNames: filteredEnemyStatuses.map((status) => status.name),
    playerShieldGain: playerSideStatuses
      .filter((status) => status.kind === "shield")
      .reduce((sum, status) => sum + Math.floor(status.value), 0),
    areaShape: timelineProfile.areaShape,
    areaRadius: timelineProfile.areaRadius,
    maxTargets: timelineProfile.maxTargets,
    isProjectile: timelineProfile.isProjectile,
  };
};

const buildPlayerWorldStrikeStatusNames = ({
  playerSideStatuses,
  passiveFlags,
  player,
  skill,
  isCrit,
  dealsDirectDamage,
  canonicalSkillId,
  hasSwordQiChain,
  swordTribulationActive,
  bodyFoundationStacks,
  voidSwordProc,
}: {
  playerSideStatuses: CombatStatus[];
  passiveFlags: PlayerPassiveFlags;
  player: PlayerCombatStats;
  skill?: Skill;
  isCrit: boolean;
  dealsDirectDamage: boolean;
  canonicalSkillId?: string;
  hasSwordQiChain: boolean;
  swordTribulationActive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
}) => [
  ...playerSideStatuses.map((status) => status.name),
  ...getPlayerWorldPassiveStatusNames({
    passiveFlags,
    player,
    skill,
    isCrit,
    dealsDirectDamage,
    canonicalSkillId,
    hasSwordQiChain,
    swordTribulationActive,
    bodyFoundationStacks,
    voidSwordProc,
  }),
];

const buildPlayerWorldStrikeTiming = ({
  player,
  skill,
  timelineProfile,
}: {
  player: PlayerCombatStats;
  skill?: Skill;
  timelineProfile: ReturnType<typeof getSkillTimelineProfile>;
}) => ({
  nextActionDelayMs: Math.max(
    getPlayerAttackIntervalMs(player),
    timelineProfile.executionTimeMs
  ),
  skillCooldownMs: skill
    ? Math.floor(
        getResolvedSkillCooldownSeconds(skill, player.learnedSkills) * 1000
      )
    : 0,
  executionTimeMs: timelineProfile.executionTimeMs,
});

const buildEnemyWorldStrikeTiming = ({
  enemy,
  special,
  timelineProfile,
}: {
  enemy: Enemy;
  special?: Enemy["specialAttack"];
  timelineProfile: ReturnType<typeof getEnemySpecialTimelineProfile>;
}) => ({
  nextActionDelayMs: getEnemyAttackIntervalMs(enemy),
  specialCooldownMs: special
    ? Math.floor(getResolvedEnemySpecialCooldownSeconds(enemy) * 1000)
    : 0,
  executionTimeMs: timelineProfile.executionTimeMs,
  areaShape: timelineProfile.areaShape,
  areaRadius: timelineProfile.areaRadius,
  isProjectile: timelineProfile.isProjectile,
});

const buildEnemyWorldStrikeResult = ({
  damage,
  special,
  timelineProfile,
  incomingStatuses,
  passiveFlags,
  preBodySaintDamage,
  player,
  enemy,
  voidEvasion,
  bodyFoundationStacks,
  copperSkinTriggered,
  bodyFusionTriggered,
  elementalBarrierTriggered,
  reflectTriggered,
  bodyTribulationTriggered,
  mageTribulationTriggered,
  bodyRebirthTrueTriggered,
  bodyEmperorTriggered,
  swordDeathWardTriggered,
}: {
  damage: number;
  special?: Enemy["specialAttack"];
  timelineProfile: ReturnType<typeof getEnemySpecialTimelineProfile>;
  incomingStatuses: ReturnType<typeof resolveIncomingEnemySpecialStatuses>;
  passiveFlags: PlayerPassiveFlags;
  preBodySaintDamage: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  voidEvasion: boolean;
  bodyFoundationStacks: number;
  copperSkinTriggered: boolean;
  bodyFusionTriggered: boolean;
  elementalBarrierTriggered: boolean;
  reflectTriggered: boolean;
  bodyTribulationTriggered: boolean;
  mageTribulationTriggered: boolean;
  bodyRebirthTrueTriggered: boolean;
  bodyEmperorTriggered: boolean;
  swordDeathWardTriggered: boolean;
}) => {
  const statusNames = buildEnemyWorldStrikeStatusNames({
    incomingStatuses,
    passiveFlags,
    preBodySaintDamage,
    playerMaxHp: player.maxHp,
    enemyElement: enemy.element,
    voidEvasion,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
    swordDeathWardTriggered,
  });

  return {
    damage,
    skillName: special?.name,
    statusNames,
    ...buildEnemyWorldStrikeTiming({
      enemy,
      special,
      timelineProfile,
    }),
  };
};

const buildEnemyWorldStrikeStatusNames = ({
  incomingStatuses,
  passiveFlags,
  preBodySaintDamage,
  playerMaxHp,
  enemyElement,
  voidEvasion,
  bodyFoundationStacks,
  copperSkinTriggered,
  bodyFusionTriggered,
  elementalBarrierTriggered,
  reflectTriggered,
  bodyTribulationTriggered,
  mageTribulationTriggered,
  bodyRebirthTrueTriggered,
  bodyEmperorTriggered,
  swordDeathWardTriggered,
}: {
  incomingStatuses: ReturnType<typeof resolveIncomingEnemySpecialStatuses>;
  passiveFlags: PlayerPassiveFlags;
  preBodySaintDamage: number;
  playerMaxHp: number;
  enemyElement: ElementType;
  voidEvasion: boolean;
  bodyFoundationStacks: number;
  copperSkinTriggered: boolean;
  bodyFusionTriggered: boolean;
  elementalBarrierTriggered: boolean;
  reflectTriggered: boolean;
  bodyTribulationTriggered: boolean;
  mageTribulationTriggered: boolean;
  bodyRebirthTrueTriggered: boolean;
  bodyEmperorTriggered: boolean;
  swordDeathWardTriggered: boolean;
}) => [
  ...incomingStatuses.normalizedIncomingStatuses.map((status) => status.name),
  ...getEnemyWorldPassiveStatusNames({
    passiveFlags,
    prePassiveDamage: preBodySaintDamage,
    playerMaxHp,
    voidEvasion,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
    enemyElement,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    mageTribulationControlTriggered:
      incomingStatuses.mageTribulationControlTriggered,
    swordFusionControlTriggered:
      incomingStatuses.swordFusionControlTriggered,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
    swordDeathWardTriggered,
  }),
  ...getEnemyWorldIncomingStatusNames({
    bodyImmortalTriggered: incomingStatuses.bodyImmortalTriggered,
    swordEmperorTriggered: incomingStatuses.swordEmperorTriggered,
  }),
];

const applyEnemySpecialStatusApplication = ({
  special,
  player,
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
  passiveFlags: PlayerPassiveFlags;
  currentTimeMs: number;
  shortenControlDuration: boolean;
  container: CombatStatus[];
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
  });

  return enemyIncomingStatusResult;
};

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
};

const getEnemyWorldPassiveTriggerState = (options: {
  enemy: Enemy;
  player: PlayerCombatStats;
  passiveFlags: PlayerPassiveFlags;
  damage: number;
  useSpecial: boolean;
  special?: Enemy["specialAttack"];
}) => {
  const { enemy, player, passiveFlags, useSpecial, special } = options;
  let damage = options.damage;
  const reflectTriggered =
    passiveFlags.hasReflectPassive &&
    damage > 0 &&
    (enemy.attackRange ?? 1) <= 1;
  const bodyFoundationStacks = getBodyFoundationBloodlineStacks(player.hp, player.maxHp);

  if (options.special?.damageMultiplier) {
    // damage bonus has already been folded into the incoming value before this helper runs.
  }

  const copperSkinTriggered =
    passiveFlags.hasBodyQiPassive && !useSpecial && damage > 0;
  if (passiveFlags.hasBodyQiPassive && !useSpecial) {
    damage = Math.max(0, Math.floor(damage * getCopperSkinReductionMultiplier()));
  }

  const preBodyFusionDamage = damage;
  const bodyFusionTriggered =
    passiveFlags.hasBodyFusionPassive && preBodyFusionDamage > 0;
  if (passiveFlags.hasBodyFusionPassive && preBodyFusionDamage > 0) {
    damage = Math.max(1, Math.floor(damage * 0.7));
  }

  const preBodySaintDamage = damage;
  if (passiveFlags.hasBodySaintPassive && preBodySaintDamage > player.maxHp * 0.2) {
    damage = Math.max(1, Math.floor(damage * 0.5));
  }

  const elementalBarrierTriggered =
    Boolean(special) &&
    passiveFlags.hasInitialShieldPassive &&
    damage > 0;
  if (elementalBarrierTriggered) {
    damage = 0;
  }

  const bodyTribulationTriggered =
    passiveFlags.hasBodyTribulationPassive && damage > 0;
  const mageTribulationTriggered =
    passiveFlags.hasMageTribulationPassive &&
    damage > 0 &&
    enemy.element === ElementType.Metal;
  const postTribulationDamage = damage;
  const bodyRebirthTrueTriggered =
    passiveFlags.hasBodyRebirthTruePassive &&
    postTribulationDamage >= player.hp;
  const bodyEmperorTriggered =
    passiveFlags.hasBodyEmperorPassive &&
    postTribulationDamage >= player.hp;
  const swordDeathWardTriggered =
    passiveFlags.hasSwordDeathWardPassive &&
    postTribulationDamage >= player.hp &&
    player.mp > 0;
  const voidEvasion =
    passiveFlags.hasMageVoidPassive && Math.random() < 0.3;
  if (voidEvasion) {
    damage = 0;
  }

  return {
    damage,
    reflectTriggered,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    preBodySaintDamage,
    elementalBarrierTriggered,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
    swordDeathWardTriggered,
    voidEvasion,
  };
};

const getPlayerWorldPassiveStatusNames = (options: {
  passiveFlags: PlayerPassiveFlags;
  player: PlayerCombatStats;
  skill?: Skill;
  isCrit: boolean;
  dealsDirectDamage: boolean;
  canonicalSkillId?: string;
  hasSwordQiChain: boolean;
  swordTribulationActive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
}) => {
  const { passiveFlags, skill } = options;
  const statusNames = getPlayerWorldProfessionPassiveStatusNames(options);

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageMahayanaPassive) {
    statusNames.unshift("言出法隨");
  }

  return statusNames;
};

const getPlayerAttackContext = (
  player: PlayerCombatStats,
  enemy: Enemy,
  skill?: Skill
): AttackContext => {
  const mode = getAttackMode(player.profession);
  const multiplier = skill?.damageMultiplier ?? 1;
  const canonicalSkillId = getCanonicalSkillId(skill);
  let power = 0;
  let defense = enemy.defense * getEnemyDefenseMultiplier(enemy);
  let critBonus = 0;
  let critDamageBonus = 0;
  let damageBonus = 0;

  if (mode === "magical") {
    power = player.magic * multiplier;
    defense = Math.max(1, enemy.defense * 0.72);
    damageBonus += 18;
  } else if (mode === "hybrid") {
    power = (player.attack * 0.78 + player.defense * 0.42) * multiplier;
    defense = enemy.defense * 0.82;
    damageBonus += 10;
  } else {
    power = player.attack * multiplier;
    defense = enemy.defense * 0.78;
    damageBonus += 8;
    critBonus += 5;
    critDamageBonus += 25;
  }

  if (skill?.profession === ProfessionType.Mage) {
    damageBonus += 12;
  }
  if (skill?.profession === ProfessionType.Body) {
    damageBonus += 4;
  }

  if (skill?.id === "b_f_active") {
    power = player.attack * 1.5 + player.defense * 0.3;
    defense = enemy.defense * 0.8;
    damageBonus += 12;
  }

  if (skill?.id === "s_vr_active" || canonicalSkillId === "s_ma_active") {
    power = player.attack * 3.1;
    defense = enemy.defense * 0.72;
    damageBonus += 14;
  }

  if (skill?.id === "m_bi_active" || canonicalSkillId === "m_tr_active") {
    defense = Math.max(1, defense * 0.5);
    damageBonus += 10;
  }

  if (skill?.id === "m_ie_active" || canonicalSkillId === "m_tr_active") {
    defense = Math.max(1, defense * 0.42);
    damageBonus += 24;
  }

  if (skill?.id === "s_ie_active" || canonicalSkillId === "s_tr_active") {
    defense = 0;
    damageBonus += 28;
    critBonus += 10;
  }

  return {
    power,
    defense,
    critBonus,
    critDamageBonus,
    damageBonus,
    canCrit: mode !== "hybrid" || !skill,
  };
};

const resolvePlayerOffenseRoll = ({
  player,
  enemy,
  activeSkill,
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
}: {
  player: PlayerCombatStats;
  enemy: Enemy;
  activeSkill?: Skill;
  activeSkillCanonicalId?: string;
  activeSkillTimelineProfile?: SkillTimelineProfile;
  skillReady: boolean;
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerMp: number;
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  bossBroken: boolean;
  playerDebuffed: boolean;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  currentTimeMs: number;
}) => {
  const attackContext = getPlayerAttackContext(
    player,
    enemy,
    skillReady ? activeSkill : undefined
  );
  const pVsE = getRestriction(player.element, enemy.element);
  const enemyElementalAffinity = getEnemyElementalModifier(player.element, enemy);
  const dealsDirectDamage =
    !skillReady ||
    activeSkill!.effectType === "damage" ||
    activeSkill!.damageMultiplier !== undefined;

  let effectivePower = attackContext.power;
  let effectiveDefense =
    attackContext.defense * getArmorBreakMultiplier(enemyStatuses, currentTimeMs);
  const bodyFoundationStacks = passiveFlags.hasBodyFoundationPassive
    ? getBodyFoundationBloodlineStacks(playerHp, player.maxHp)
    : 0;
  const voidSwordProc = passiveFlags.hasSwordVoidPassive && Math.random() < 0.1;
  if (voidSwordProc) {
    effectiveDefense = Math.max(1, effectiveDefense * 0.5);
  }

  if (pVsE.isEffective) effectivePower *= 1.12;
  if (pVsE.isResisted) effectivePower *= 0.88;
  effectivePower *= enemyElementalAffinity.multiplier;
  if (bossBroken) effectivePower *= 1.25;
  if (playerDebuffed) effectivePower *= 0.9;
  if (
    passiveFlags.hasMageQiPassive &&
    !skillReady &&
    player.profession === ProfessionType.Mage
  ) {
    effectivePower += player.magic * 0.28;
  }
  const swordTribulationActive = hasSwordTribulationWindow(
    playerHp,
    player.maxHp,
    passiveFlags
  );
  if (swordTribulationActive) {
    effectivePower *= 1.5;
  }
  if (
    passiveFlags.hasMageMahayanaPassive &&
    skillReady &&
    activeSkill!.profession === ProfessionType.Mage
  ) {
    effectivePower *= 1.4;
  }
  if (
    passiveFlags.hasMageFoundationPassive &&
    skillReady &&
    activeSkill!.profession === ProfessionType.Mage &&
    mageFoundationStacks > 0
  ) {
    effectivePower *= 1 + mageFoundationStacks * 0.1;
  }
  if (
    skillReady &&
    activeSkillCanonicalId === "m_tr_active" &&
    enemyStatuses.some(
      (status) =>
        status.id === "paralyze" && status.expiresAtMs > currentTimeMs
    )
  ) {
    effectivePower *= 1.5;
  }
  const manaSpringEmpowered = isManaSpringEmpowered(
    playerMp,
    player.maxMp,
    passiveFlags
  );
  if (manaSpringEmpowered) {
    effectivePower *= 1.2;
  }
  if (passiveFlags.hasSwordHeartPassive && swordHeartStacks > 0) {
    effectivePower *= 1 + swordHeartStacks * 0.03;
  }
  if (bodyFoundationStacks > 0) {
    effectivePower *= 1 + bodyFoundationStacks * 0.02;
  }
  const hasSwordQiChain = hasLearnedSkillId(player.learnedSkills, "s_f_active");
  const activeSwordQiStatuses =
    skillReady && activeSkillCanonicalId === "s_tr_active"
      ? playerStatuses.filter(
          (status) =>
            status.kind === "critBoost" && status.expiresAtMs > currentTimeMs
        )
      : [];
  if (activeSwordQiStatuses.length > 0) {
    effectivePower *= 1 + activeSwordQiStatuses.length * 0.35;
  } else if (skillReady && activeSkillCanonicalId === "s_tr_active" && hasSwordQiChain) {
    effectivePower *= 1.18;
  }

  const critRate = Math.min(
    95,
    player.crit +
      (passiveFlags.hasSwordMahayanaPassive ? 5 : 0) +
      (passiveFlags.hasSwordQiPassive ? getSwordQiPassiveCritBonus() : 0) +
      attackContext.critBonus +
      getCritBoostValue(playerStatuses, currentTimeMs)
  );
  const isCrit =
    swordTribulationActive ||
    (attackContext.canCrit && Math.random() * 100 < Math.max(0, critRate));

  let playerDamage = 0;
  const ignoreEnemyReduction =
    (skillReady && activeSkillCanonicalId === "s_tr_active") ||
    (!skillReady && passiveFlags.hasSwordEmperorPassive);
  if (dealsDirectDamage) {
    playerDamage = resolveDamage(
      effectivePower,
      ignoreEnemyReduction ? 0 : effectiveDefense
    );
    if (attackContext.damageBonus) {
      playerDamage = Math.floor(
        playerDamage * (1 + attackContext.damageBonus / 100)
      );
    }
    if (!ignoreEnemyReduction) {
      playerDamage = Math.floor(
        playerDamage * getEnemyDamageReductionMultiplier(enemy)
      );
    }
    if (skillReady) {
      playerDamage = Math.floor(
        playerDamage * (activeSkillTimelineProfile?.areaDamageModifier ?? 1)
      );
    }
    if (isCrit) {
      playerDamage = Math.floor(
        playerDamage *
          ((player.critDamage +
            attackContext.critDamageBonus +
            (voidSwordProc ? 50 : 0) +
            (passiveFlags.hasSwordMahayanaPassive ? 10 : 0)) /
            100)
      );
    }
    if (
      skillReady &&
      activeSkillCanonicalId === "b_vr_active" &&
      enemy.rank !== EnemyRank.Boss
    ) {
      playerDamage = Math.max(playerDamage, enemy.hp);
    }
  }

  return {
    attackContext,
    pVsE,
    enemyElementalAffinity,
    dealsDirectDamage,
    effectiveDefense,
    bodyFoundationStacks,
    voidSwordProc,
    swordTribulationActive,
    manaSpringEmpowered,
    hasSwordQiChain,
    activeSwordQiStatuses,
    isCrit,
    playerDamage,
  };
};

const getEnemyAttackContext = (
  enemy: Enemy,
  player: PlayerCombatStats
): AttackContext => {
  const magicalEnemy =
    enemy.element !== ElementType.None &&
    (enemy.element === ElementType.Fire ||
      enemy.element === ElementType.Water ||
      enemy.element === ElementType.Wood);

  return {
    power: enemy.attack * getEnemyAttackPowerMultiplier(enemy),
    defense: magicalEnemy ? player.res : player.defense,
    critBonus: enemy.rank === EnemyRank.Boss ? 5 : 0,
    critDamageBonus: enemy.rank === EnemyRank.Boss ? 15 : 0,
    damageBonus: enemy.rank === EnemyRank.Boss ? 8 : 0,
    canCrit: true,
  };
};

const resolveEnemyOffenseRoll = ({
  enemy,
  player,
  enemyStatuses,
  playerStatuses,
  currentTimeMs,
  enemySpecialReady,
  enemySpecialTimelineProfile,
  passiveFlags,
  bodyTribulationStacks,
}: {
  enemy: Enemy;
  player: PlayerCombatStats;
  enemyStatuses: CombatStatus[];
  playerStatuses: CombatStatus[];
  currentTimeMs: number;
  enemySpecialReady: boolean;
  enemySpecialTimelineProfile?: EnemySpecialTimelineProfile;
  passiveFlags: PlayerPassiveFlags;
  bodyTribulationStacks: number;
}) => {
  const enemyContext = getEnemyAttackContext(enemy, player);
  const eVsP = getRestriction(enemy.element, player.element);
  const bodyFoundationStacks = passiveFlags.hasBodyFoundationPassive
    ? getBodyFoundationBloodlineStacks(player.hp, player.maxHp)
    : 0;

  let enemyPower = enemyContext.power;
  let playerDefense =
    enemyContext.defense * getArmorBreakMultiplier(playerStatuses, currentTimeMs);

  if (passiveFlags.hasBodyTribulationPassive && bodyTribulationStacks > 0) {
    playerDefense *= 1 + Math.min(0.02 * bodyTribulationStacks, 1);
  }
  if (bodyFoundationStacks > 0) {
    playerDefense *= 1 + bodyFoundationStacks * 0.05;
  }
  if (eVsP.isEffective) enemyPower *= 1.12;
  if (eVsP.isResisted) enemyPower *= 0.88;
  if (passiveFlags.hasMageEmperorPassive && enemy.element !== ElementType.None) {
    enemyPower *= 0.8;
  }
  if (enemySpecialReady && enemy.specialAttack?.damageMultiplier) {
    enemyPower *= enemy.specialAttack.damageMultiplier;
    enemyPower *= enemySpecialTimelineProfile?.areaDamageModifier ?? 1;
  }

  const enemyCrit =
    enemyContext.canCrit &&
    Math.random() * 100 < Math.max(0, enemyContext.critBonus);
  let enemyDamage = resolveDamage(enemyPower, playerDefense);
  if (enemyContext.damageBonus) {
    enemyDamage = Math.floor(
      enemyDamage * (1 + enemyContext.damageBonus / 100)
    );
  }
  if (enemyCrit) {
    enemyDamage = Math.floor(
      enemyDamage * ((150 + enemyContext.critDamageBonus) / 100)
    );
  }
  if (player.damageReduction > 0) {
    enemyDamage = Math.floor(
      enemyDamage * (1 - player.damageReduction / 100)
    );
  }

  const isDodge = Math.random() * 100 < player.dodge;
  const voidEvasion =
    passiveFlags.hasMageVoidPassive && !isDodge && Math.random() < 0.3;
  const isBlock = Math.random() * 100 < player.blockRate;

  return {
    enemyDamage,
    isDodge,
    voidEvasion,
    isBlock,
    bodyFoundationStacks,
    eVsP,
  };
};

const resolvePlayerActiveAftermath = ({
  player,
  skillReady,
  activeSkill,
  activeSkillCanonicalId,
  currentTimeMs,
  turn,
  logs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  enemyStatuses,
  playerMp,
  playerDamage,
  effectiveDefense,
  pVsE,
  enemyElementalAffinity,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  isCrit,
  dealsDirectDamage,
  passiveFlags,
}: {
  player: PlayerCombatStats;
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
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  playerMp: number;
  playerDamage: number;
  effectiveDefense: number;
  pVsE: ReturnType<typeof getRestriction>;
  enemyElementalAffinity: ReturnType<typeof getEnemyElementalModifier>;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  isCrit: boolean;
  dealsDirectDamage: boolean;
  passiveFlags: PlayerPassiveFlags;
}) => {
  if (!skillReady || !activeSkill) {
    return {
      enemyHp,
      playerHp,
      playerStatuses,
      enemyStatuses,
      playerMp,
      activeSkillReadyAtMs,
      mageFoundationStacks,
    };
  }

  ({
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  } = resolvePlayerActiveResourceFlow({
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
    hasMageFusionPassive: passiveFlags.hasMageFusionPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
    hasSwordGoldenPassive: passiveFlags.hasSwordGoldenPassive,
    hasMageFoundationPassive: passiveFlags.hasMageFoundationPassive,
  }));

  const { playerSideStatuses, filteredEnemyStatuses } =
    resolvePlayerSkillStatusApplication({
      skill: activeSkill,
      targetMaxHp:
        activeSkill.targetType === "self" ? playerMaxHp : enemyMaxHp,
      enemy,
      passiveFlags,
      dealsDirectDamage,
      isCrit,
      currentTimeMs,
      enemyHp,
    });

  appendAndLogCombatStatuses({
    container: playerStatuses,
    statuses: playerSideStatuses,
    logs,
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    targetIsPlayer: true,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  appendAndLogCombatStatuses({
    container: enemyStatuses,
    statuses: filteredEnemyStatuses,
    logs,
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    targetIsPlayer: false,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  if (
    passiveFlags.hasMageImmortalPassive &&
    activeSkill.profession === ProfessionType.Mage &&
    playerDamage > 0 &&
    Math.random() < 0.3
  ) {
    const repeatedDamage = Math.max(1, Math.floor(playerDamage));
    enemyHp = Math.max(0, enemyHp - repeatedDamage);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs + 1,
      isPlayer: true,
      message: `【仙法通神】術式回響，再度造成 <dmg>${repeatedDamage}</dmg> 點傷害！`,
      damage: repeatedDamage,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  ({
    enemyHp,
    playerHp,
    activeSkillReadyAtMs,
  } = applyPlayerActiveFollowupEffects({
    activeSkillCanonicalId,
    playerDamage,
    currentTimeMs,
    enemy,
    enemyHp,
    playerHp,
    playerMaxHp,
    turn,
    logs,
    hasBodyImmortalPassive: passiveFlags.hasBodyImmortalPassive,
    enemyStatuses,
    activeSkillReadyAtMs,
  }));

  enemyHp = applyPlayerEchoAndSummonFollowupEffects({
    skillReady,
    activeSkillCanonicalId,
    hasSwordEchoPassive: passiveFlags.hasSwordEchoPassive,
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
  });

  return {
    enemyHp,
    playerHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  };
};

const advanceCombatLoop = ({
  bossBroken,
  playerDebuffed,
  turn,
}: {
  bossBroken: boolean;
  playerDebuffed: boolean;
  turn: number;
}) => ({
  bossBroken: false,
  playerDebuffed: false,
  turn: turn + 1,
  exceededTurnLimit: turn + 1 > 500,
});

const resolveCombatLoopStep = ({
  state,
  processStatusTicks,
  player,
  enemy,
  logs,
  runtimeContext,
  featureFlags,
}: {
  state: CombatLoopState<CombatStatus>;
  processStatusTicks: (currentMs: number) => void;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  runtimeContext: CombatRuntimeContext;
  featureFlags: CombatLoopFeatureFlags;
}) => {
  const { passiveFlags, pVsE, activeSkill, playerAttackIntervalMs, enemyAttackIntervalMs } =
    runtimeContext;
  const {
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
    hasBodyImmortalPassive,
    hasBodyAncientPassive,
    hasSwordImmortalPassive,
    hasSwordHeartPassive,
  } = featureFlags;
  const nextState = buildCombatLoopState(state);
  let {
    turn,
    currentTimeMs,
    playerNextActionMs,
    enemyNextActionMs,
    activeSkillReadyAtMs,
    enemySpecialReadyAtMs,
    bossBroken,
    playerDebuffed,
    lastRegenTimeMs,
    playerHp,
    enemyHp,
    playerMp,
    playerStatuses,
    enemyStatuses,
    swordDeathWardUsed,
    bodyRebirthTrueUsed,
    bodyTribulationStacks,
    mageFoundationStacks,
    swordHeartStacks,
    playerDamagedSinceSwordHeartWindow,
    nextSwordImmortalGuardAtMs,
  } = nextState;
  const finalizeLoopStep = (combatEnded: boolean) => {
    Object.assign(nextState, {
      turn,
      currentTimeMs,
      playerNextActionMs,
      enemyNextActionMs,
      activeSkillReadyAtMs,
      enemySpecialReadyAtMs,
      bossBroken,
      playerDebuffed,
      lastRegenTimeMs,
      playerHp,
      enemyHp,
      playerMp,
      playerStatuses,
      enemyStatuses,
      swordDeathWardUsed,
      bodyRebirthTrueUsed,
      bodyTribulationStacks,
      mageFoundationStacks,
      swordHeartStacks,
      playerDamagedSinceSwordHeartWindow,
      nextSwordImmortalGuardAtMs,
    });

    return buildCombatLoopStepResult({
      combatEnded,
      state: nextState,
    });
  };

  const playerActsFirst = playerNextActionMs <= enemyNextActionMs;
  currentTimeMs = playerActsFirst ? playerNextActionMs : enemyNextActionMs;

  const { combatEnded } = resolveTurnStartMaintenance({
    currentTimeMs,
    turn,
    processStatusTicks,
    player,
    enemy,
    logs,
    getPlayerHp: () => playerHp,
    getPlayerMp: () => playerMp,
    setPlayerHp: (value) => {
      playerHp = value;
    },
    setPlayerMp: (value) => {
      playerMp = value;
    },
    getEnemyHp: () => enemyHp,
    getPlayerStatuses: () => playerStatuses,
    setPlayerStatuses: (value) => {
      playerStatuses = value;
    },
    getLastRegenTimeMs: () => lastRegenTimeMs,
    setLastRegenTimeMs: (value) => {
      lastRegenTimeMs = value;
    },
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
    hasBodyImmortalPassive,
    hasBodyAncientPassive,
  });

  if (combatEnded) {
    return finalizeLoopStep(true);
  }

  if (playerActsFirst) {
    ({
      enemyHp,
      playerHp,
      playerMp,
      playerStatuses,
      enemyStatuses,
      activeSkillReadyAtMs,
      mageFoundationStacks,
      playerNextActionMs,
      nextSwordImmortalGuardAtMs,
      bossBroken,
    } = resolvePlayerTurnPhase({
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
      dependencies: {
        resolvePlayerOffenseRoll,
        resolvePlayerActiveAftermath,
      },
    }));

    if (enemyHp <= 0) {
      return finalizeLoopStep(true);
    }
  } else {
    const enemyTurnResult = resolveEnemyTurnPhase({
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
      swordDeathWardUsed,
      bodyTribulationStacks,
      bodyRebirthTrueUsed,
      hasSwordHeartPassive,
      playerDamagedSinceSwordHeartWindow,
      swordHeartStacks,
      dependencies: {
        resolveEnemyOffenseRoll,
        resolveEnemyTurnAftermath,
      },
    });

    if (enemyTurnResult.skipped) {
      turn += 1;
      enemyNextActionMs = enemyTurnResult.enemyNextActionMs;
      swordHeartStacks = enemyTurnResult.swordHeartStacks;
      playerDamagedSinceSwordHeartWindow =
        enemyTurnResult.playerDamagedSinceSwordHeartWindow;
      return finalizeLoopStep(false);
    }

    const resolvedEnemyTurnResult = enemyTurnResult as Exclude<
      ReturnType<typeof resolveEnemyTurnPhase>,
      { skipped: true }
    >;

    ({
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
      enemyNextActionMs,
    } = resolvedEnemyTurnResult);
  }

  const turnAdvance = advanceCombatLoop({
    bossBroken,
    playerDebuffed,
    turn,
  });
  ({ bossBroken, playerDebuffed, turn } = turnAdvance);

  return finalizeLoopStep(turnAdvance.exceededTurnLimit);
};

const prepareAutoBattleExecution = (
  player: PlayerCombatStats,
  enemy: Enemy,
  logs: CombatLog[]
) => {
  let state = createInitialCombatLoopState<CombatStatus>(player, enemy);
  let lastStatusTickMs = 0;

  const {
    activeSkill,
    playerAttackIntervalMs,
    enemyAttackIntervalMs,
    pVsE,
    enemyElementalAffinity,
    passiveFlags,
  } = createCombatRuntimeContext(player, enemy);
  const featureFlags = createCombatLoopFeatureFlags(passiveFlags);

  const runtimeContext = {
    activeSkill: activeSkill ?? undefined,
    playerAttackIntervalMs,
    enemyAttackIntervalMs,
    pVsE,
    enemyElementalAffinity,
    passiveFlags,
  } satisfies CombatRuntimeContext;

  const {
    processStatusTicks,
    playerStatuses: seededPlayerStatuses,
    enemySpecialReadyAtMs: seededEnemySpecialReadyAtMs,
  } = prepareCombatLoopEnvironment({
    player,
    enemy,
    logs,
    runtimeContext,
    getTurn: () => state.turn,
    playerStatusesRef: () => state.playerStatuses,
    enemyStatusesRef: () => state.enemyStatuses,
    activeSkillReadyAtMsRef: () => state.activeSkillReadyAtMs,
    getPlayerHp: () => state.playerHp,
    getEnemyHp: () => state.enemyHp,
    setPlayerHp: (value) => {
      state.playerHp = value;
    },
    setEnemyHp: (value) => {
      state.enemyHp = value;
    },
    setPlayerStatuses: (value) => {
      state.playerStatuses = value;
    },
    setEnemyStatuses: (value) => {
      state.enemyStatuses = value;
    },
    getLastStatusTickMs: () => lastStatusTickMs,
    setLastStatusTickMs: (value) => {
      lastStatusTickMs = value;
    },
    getPlayerDamagedSinceSwordHeartWindow: () => state.playerDamagedSinceSwordHeartWindow,
    setPlayerDamagedSinceSwordHeartWindow: (value) => {
      state.playerDamagedSinceSwordHeartWindow = value;
    },
    playerHp: state.playerHp,
    enemyHp: state.enemyHp,
    playerStatuses: state.playerStatuses,
  });

  state = applyPreparedCombatLoopState(state, {
    playerStatuses: seededPlayerStatuses,
    enemySpecialReadyAtMs: seededEnemySpecialReadyAtMs,
  });

  return {
    state,
    runtimeContext,
    featureFlags,
    processStatusTicks,
  };
};

const executeAutoBattleTimeline = ({
  player,
  enemy,
  logs,
  prepared,
}: {
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  prepared: ReturnType<typeof prepareAutoBattleExecution>;
}) => {
  const finalState = runCombatTimelineLoop({
    initialState: prepared.state,
    processStatusTicks: prepared.processStatusTicks,
    player,
    enemy,
    logs,
    runtimeContext: prepared.runtimeContext,
    featureFlags: prepared.featureFlags,
    resolveCombatLoopStep,
  });

  return finalizeCombatResult({
    won: finalState.playerHp > 0 && finalState.enemyHp <= 0,
    logs,
    turn: finalState.turn,
    currentTimeMs: finalState.currentTimeMs,
    playerMaxHp: player.maxHp,
    enemy,
    playerHp: finalState.playerHp,
    enemyHp: finalState.enemyHp,
  });
};

const resolveDamage = (
  power: number,
  defense: number,
  varianceMin = 0.92,
  varianceMax = 1.08
): number => {
  const mitigation = 100 / (100 + Math.max(0, defense));
  const variance = varianceMin + Math.random() * (varianceMax - varianceMin);
  return Math.max(1, Math.floor(power * mitigation * variance));
};

const getArmorBreakMultiplier = (statuses: CombatStatus[], currentTimeMs: number) => {
  const totalBreak = statuses
    .filter(
      (status) =>
        status.kind === "armorBreak" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);

  return Math.max(0.2, 1 - totalBreak);
};

const absorbDamageWithShield = (
  statuses: CombatStatus[],
  incomingDamage: number,
  currentTimeMs: number
) => {
  let remainingDamage = incomingDamage;
  let absorbed = 0;

  statuses.forEach((status) => {
    if (
      remainingDamage <= 0 ||
      status.kind !== "shield" ||
      status.expiresAtMs <= currentTimeMs ||
      status.value <= 0
    ) {
      return;
    }

    const block = Math.min(status.value, remainingDamage);
    status.value -= block;
    remainingDamage -= block;
    absorbed += block;
  });

  return { remainingDamage, absorbed };
};

const getReflectValue = (statuses: CombatStatus[], currentTimeMs: number) =>
  statuses
    .filter(
      (status) => status.kind === "reflect" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);

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

const logShieldAbsorption = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  absorbed,
  sourceName,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  absorbed: number;
  sourceName?: string;
}) => {
  if (absorbed <= 0) return;

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: sourceName
      ? `【${sourceName}】替你抵擋了 <dmg>${absorbed}</dmg> 點傷害。`
      : `護盾替你抵擋了 <dmg>${absorbed}</dmg> 點傷害。`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

const resolvePlayerActiveResourceFlow = ({
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

  const prevented = preventedDamage;
  const reflected = Math.max(1, prevented);
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
  playerStatuses: CombatStatus[];
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

const resolveIncomingEnemyDamage = ({
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
  playerStatuses: CombatStatus[];
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

  logShieldAbsorption({
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp,
    playerMaxHp,
    enemyHp: nextEnemyHp,
    enemyMaxHp,
    absorbed: shieldResult.absorbed,
  });

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

const applyEnemyHitAftermath = ({
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
  playerStatuses: CombatStatus[];
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

const resolveEnemyTurnAftermath = ({
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
  playerStatuses: CombatStatus[];
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
      hasEnemyLeech: hasEnemyAffix(enemy, "噬生"),
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

const getCritBoostValue = (statuses: CombatStatus[], currentTimeMs: number) =>
  statuses
    .filter(
      (status) => status.kind === "critBoost" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);

const applyPlayerActiveFollowupEffects = ({
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
  enemyStatuses: CombatStatus[];
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
    const invertedStatuses: CombatStatus[] = [
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

const applyPlayerEchoAndSummonFollowupEffects = ({
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
  enemyStatuses: CombatStatus[];
  pVsE: ReturnType<typeof getRestriction>;
  enemyElementalAffinity: ReturnType<typeof getEnemyElementalModifier>;
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

type PlayerWorldStrikeRuntime = {
  attackContext: ReturnType<typeof getPlayerAttackContext>;
  canonicalSkillId?: string;
  passiveFlags: PlayerPassiveFlags;
  restriction: ReturnType<typeof getRestriction>;
  elementalAffinity: ReturnType<typeof getEnemyElementalModifier>;
  dealsDirectDamage: boolean;
  hasSwordQiChain: boolean;
  swordTribulationActive: boolean;
  bodyFoundationStacks: number;
  timelineProfile: SkillTimelineProfile;
};

const createPlayerWorldStrikeRuntime = (
  player: PlayerCombatStats,
  enemy: Enemy,
  skill?: Skill
): PlayerWorldStrikeRuntime => {
  const passiveFlags = getPlayerPassiveFlags(player.learnedSkills);
  const canonicalSkillId = getCanonicalSkillId(skill);

  return {
    attackContext: getPlayerAttackContext(player, enemy, skill),
    canonicalSkillId,
    passiveFlags,
    restriction: getRestriction(player.element, enemy.element),
    elementalAffinity: getEnemyElementalModifier(player.element, enemy),
    dealsDirectDamage:
      !skill || skill.effectType === "damage" || skill.damageMultiplier !== undefined,
    hasSwordQiChain: hasLearnedSkillId(player.learnedSkills, "s_f_active"),
    swordTribulationActive: hasSwordTribulationWindow(
      player.hp,
      player.maxHp,
      passiveFlags
    ),
    bodyFoundationStacks: passiveFlags.hasBodyFoundationPassive
      ? getBodyFoundationBloodlineStacks(player.hp, player.maxHp)
      : 0,
    timelineProfile: getSkillTimelineProfile(skill),
  };
};

type EnemyWorldStrikeRuntime = {
  attackContext: ReturnType<typeof getEnemyAttackContext>;
  passiveFlags: PlayerPassiveFlags;
  restriction: ReturnType<typeof getRestriction>;
  effectiveDefense: number;
  timelineProfile: EnemySpecialTimelineProfile;
  incomingStatuses: ReturnType<typeof resolveIncomingEnemySpecialStatuses>;
};

const createEnemyWorldStrikeRuntime = (
  enemy: Enemy,
  player: PlayerCombatStats,
  useSpecial = false
): EnemyWorldStrikeRuntime => {
  const passiveFlags = getPlayerPassiveFlags(player.learnedSkills);
  const special = useSpecial ? enemy.specialAttack : undefined;
  const timelineProfile = getEnemySpecialTimelineProfile(enemy);
  const attackContext = getEnemyAttackContext(enemy, player);

  return {
    attackContext,
    passiveFlags,
    restriction: getRestriction(enemy.element, player.element),
    effectiveDefense:
      attackContext.defense * (special ? timelineProfile.areaDamageModifier : 1),
    timelineProfile,
    incomingStatuses: resolveIncomingEnemySpecialStatuses({
      special,
      player,
      passiveFlags,
      currentTimeMs: 0,
      shortenControlDuration: passiveFlags.hasSwordFusionPassive,
    }),
  };
};

export const resolvePlayerWorldStrike = (
  player: PlayerCombatStats,
  enemy: Enemy,
  skill?: Skill
): WorldStrikeResult => {
  return resolvePlayerWorldStrikeOutcome({
    player,
    enemy,
    skill,
    runtime: createPlayerWorldStrikeRuntime(player, enemy, skill),
  });
};

const resolvePlayerWorldStrikeOutcome = ({
  player,
  enemy,
  skill,
  runtime,
}: {
  player: PlayerCombatStats;
  enemy: Enemy;
  skill?: Skill;
  runtime: ReturnType<typeof createPlayerWorldStrikeRuntime>;
}): WorldStrikeResult => {
  const {
    attackContext,
    canonicalSkillId,
    passiveFlags,
    restriction,
    elementalAffinity,
    dealsDirectDamage,
    hasSwordQiChain,
    swordTribulationActive,
    bodyFoundationStacks,
    timelineProfile,
  } = runtime;
  const { hasSwordVoidPassive, hasSwordQiPassive, hasMageQiPassive, hasBodyFoundationPassive, hasSwordEmperorPassive, hasSwordMahayanaPassive, hasMageMahayanaPassive } =
    passiveFlags;
  let effectivePower = attackContext.power;
  if (restriction.isEffective) effectivePower *= 1.12;
  if (restriction.isResisted) effectivePower *= 0.88;
  effectivePower *= elementalAffinity.multiplier;
  if (bodyFoundationStacks > 0) {
    effectivePower *= 1 + bodyFoundationStacks * 0.02;
  }
  const manaSpringEmpowered = isManaSpringEmpowered(
    player.mp,
    player.maxMp,
    passiveFlags
  );
  if (manaSpringEmpowered) {
    effectivePower *= 1.2;
  }
  if (!skill && hasMageQiPassive && player.profession === ProfessionType.Mage) {
    effectivePower += player.magic * 0.18;
  }
  if (hasMageMahayanaPassive && skill?.profession === ProfessionType.Mage) {
    effectivePower *= 1.4;
  }
  if (swordTribulationActive) {
    effectivePower *= 1.5;
  }
  if (canonicalSkillId === "s_tr_active" && hasSwordQiChain) {
    effectivePower *= 1.18;
  }
  const voidSwordProc = hasSwordVoidPassive && Math.random() < 0.1;
  const resolvedDefense =
    voidSwordProc && attackContext.defense > 0
      ? Math.max(1, attackContext.defense * 0.5)
      : attackContext.defense;

  const critRate = Math.min(
    95,
    player.crit +
      attackContext.critBonus +
      (hasSwordMahayanaPassive ? 5 : 0) +
      (hasSwordQiPassive ? getSwordQiPassiveCritBonus() : 0)
  );
  const isCrit =
    swordTribulationActive ||
    (attackContext.canCrit && Math.random() * 100 < Math.max(0, critRate));

  let damage = 0;
  const ignoreEnemyReduction =
    canonicalSkillId === "s_tr_active" || (!skill && hasSwordEmperorPassive);
  if (dealsDirectDamage) {
    damage = resolveDamage(
      effectivePower,
      ignoreEnemyReduction ? 0 : resolvedDefense
    );
    if (attackContext.damageBonus) {
      damage = Math.floor(damage * (1 + attackContext.damageBonus / 100));
    }
    if (!ignoreEnemyReduction) {
      damage = Math.floor(damage * getEnemyDamageReductionMultiplier(enemy));
    }
    if (skill) {
      damage = Math.floor(damage * timelineProfile.areaDamageModifier);
    }
    if (isCrit) {
      damage = Math.floor(
        damage *
          ((player.critDamage +
            attackContext.critDamageBonus +
            (hasSwordMahayanaPassive ? 10 : 0) +
            (voidSwordProc ? 50 : 0)) /
            100)
      );
    }
  }

  const { playerSideStatuses, filteredEnemyStatuses } =
    resolvePlayerSkillStatusApplication({
      skill,
      targetMaxHp: skill?.targetType === "self" ? player.maxHp : enemy.maxHp,
      enemy,
      passiveFlags,
      dealsDirectDamage,
      isCrit,
      currentTimeMs: 0,
      enemyHp: enemy.hp,
    });

  return buildPlayerWorldStrikeResult({
    damage,
    isCrit,
    skill,
    player,
    playerSideStatuses,
    filteredEnemyStatuses,
    passiveFlags,
    canonicalSkillId,
    hasSwordQiChain,
    swordTribulationActive,
    bodyFoundationStacks,
    voidSwordProc,
    dealsDirectDamage,
    timelineProfile,
  });
};

export const resolveEnemyWorldStrike = (
  enemy: Enemy,
  player: PlayerCombatStats,
  useSpecial = false
) => {
  return resolveEnemyWorldStrikeOutcome({
    enemy,
    player,
    useSpecial,
    runtime: createEnemyWorldStrikeRuntime(enemy, player, useSpecial),
  });
};

const resolveEnemyWorldStrikeOutcome = ({
  enemy,
  player,
  useSpecial,
  runtime,
}: {
  enemy: Enemy;
  player: PlayerCombatStats;
  useSpecial: boolean;
  runtime: ReturnType<typeof createEnemyWorldStrikeRuntime>;
}) => {
  const special = useSpecial ? enemy.specialAttack : undefined;
  const {
    attackContext,
    passiveFlags,
    restriction,
    effectiveDefense,
    timelineProfile,
    incomingStatuses,
  } = runtime;
  let effectivePower =
    attackContext.power * (special?.damageMultiplier ?? 1);

  if (restriction.isEffective) effectivePower *= 1.1;
  if (restriction.isResisted) effectivePower *= 0.9;

  let damage = resolveDamage(effectivePower, effectiveDefense);
  if (attackContext.damageBonus) {
    damage = Math.floor(damage * (1 + attackContext.damageBonus / 100));
  }
  const {
    damage: resolvedDamage,
    reflectTriggered,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    preBodySaintDamage,
    elementalBarrierTriggered,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
    swordDeathWardTriggered,
    voidEvasion,
    } = getEnemyWorldPassiveTriggerState({
    enemy,
    player,
    passiveFlags,
    damage,
    useSpecial,
    special,
  });
  damage = resolvedDamage;

  return buildEnemyWorldStrikeResult({
    damage,
    special,
    timelineProfile,
    incomingStatuses,
    passiveFlags,
    preBodySaintDamage,
    player,
    enemy,
    voidEvasion,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
    swordDeathWardTriggered,
  });
};

export const calculatePlayerStats = (
  attributes: BaseAttributes,
  majorRealm: MajorRealm,
  spiritRootId: SpiritRootId,
  equipmentStats: Partial<
    BaseAttributes & {
      attack: number;
      defense: number;
      speed: number;
      hp: number;
      mp: number;
      crit: number;
      critDamage: number;
      dodge: number;
      magic: number;
      blockRate: number;
      regenHp: number;
      res: number;
      damageReduction: number;
    }
  > = {},
  name = "道友",
  profession: ProfessionType = ProfessionType.None,
  learnedSkillIds: string[] = []
): PlayerCombatStats => {
  const base = REALM_BASE_STATS[majorRealm];
  const rootDetails = SPIRIT_ROOT_DETAILS[spiritRootId];
  const rootBonuses = rootDetails.bonuses.battle || {};
  const professionPassives = getProfessionPassives(profession);
  const learnedSkills = getLearnedSkills(learnedSkillIds);
  const passiveSkillBonuses = getPassiveSkillBonuses(learnedSkills);

  const effectivePhysique = attributes.physique + (equipmentStats.physique || 0);
  const effectiveRootBone = attributes.rootBone + (equipmentStats.rootBone || 0);
  const effectiveInsight = attributes.insight + (equipmentStats.insight || 0);
  const effectiveComprehension =
    attributes.comprehension + (equipmentStats.comprehension || 0);
  const effectiveFortune = attributes.fortune + (equipmentStats.fortune || 0);

  let maxHp = effectivePhysique * 15 + base.hp;
  let maxMp = effectiveInsight * 10 + base.mp;
  let attack = effectiveRootBone * 2;
  let magic = effectiveInsight * 2;
  let defense = effectivePhysique * 1.5;
  let res = effectiveInsight * 1.5;

  maxHp += equipmentStats.hp || 0;
  maxMp += equipmentStats.mp || 0;
  attack += equipmentStats.attack || 0;
  defense += equipmentStats.defense || 0;
  magic += equipmentStats.magic || 0;
  res += equipmentStats.res || 0;

  if (rootBonuses.hpPercent) maxHp *= 1 + rootBonuses.hpPercent / 100;
  if (rootBonuses.mpPercent) maxMp *= 1 + rootBonuses.mpPercent / 100;
  if (rootBonuses.atkPercent) attack *= 1 + rootBonuses.atkPercent / 100;
  if (rootBonuses.defPercent) defense *= 1 + rootBonuses.defPercent / 100;

  if (rootBonuses.resPercent) {
    res *= 1 + rootBonuses.resPercent / 100;
  } else if (rootBonuses.defPercent) {
    res *= 1 + rootBonuses.defPercent / 100;
  }

  if (passiveSkillBonuses.hpPercent) {
    maxHp *= 1 + passiveSkillBonuses.hpPercent / 100;
  }
  if (passiveSkillBonuses.mpPercent) {
    maxMp *= 1 + passiveSkillBonuses.mpPercent / 100;
  }
  if (passiveSkillBonuses.attackPercent) {
    attack *= 1 + passiveSkillBonuses.attackPercent / 100;
  }
  if (passiveSkillBonuses.magicPercent) {
    magic *= 1 + passiveSkillBonuses.magicPercent / 100;
  }
  if (passiveSkillBonuses.defensePercent) {
    defense *= 1 + passiveSkillBonuses.defensePercent / 100;
  }
  if (passiveSkillBonuses.resPercent) {
    res *= 1 + passiveSkillBonuses.resPercent / 100;
  }

  maxHp = Math.floor(maxHp);
  maxMp = Math.floor(maxMp);
  attack = Math.floor(attack);
  magic = Math.floor(magic);
  defense = Math.floor(defense);
  res = Math.floor(res);

  const speed = effectiveComprehension + (equipmentStats.speed || 0);
  let crit = effectiveInsight * 0.1 + (equipmentStats.crit || 0);
  if (rootBonuses.critRate) crit += rootBonuses.critRate;
  crit += professionPassives.critBonus;
  crit += passiveSkillBonuses.critBonus;

  let dodge = effectiveFortune * 0.1 + (equipmentStats.dodge || 0);
  if (rootBonuses.dodgeRate) dodge += rootBonuses.dodgeRate;
  dodge += passiveSkillBonuses.dodgeBonus;

  const critDamage =
    150 +
    effectiveInsight * 0.2 +
    (equipmentStats.critDamage || 0) +
    professionPassives.critDamageBonus +
    passiveSkillBonuses.critDamageBonus;
  const blockRate =
    effectivePhysique * 0.1 + (equipmentStats.blockRate || 0);
  const alchemyBonus = rootDetails.bonuses.alchemyBonus || 0;
  const craftingBonus = rootDetails.bonuses.craftingBonus || 0;
  const breakthroughBonus = 0;
  const dropRateBonus = effectiveFortune * 0.1;
  const cultivationSpeedBonus = 0;
  const damageReduction =
    (rootBonuses.damageReduction || 0) +
    (equipmentStats.damageReduction || 0) +
    professionPassives.damageReductionBonus +
    passiveSkillBonuses.damageReductionBonus;
  const regenHp =
    (rootBonuses.hpRegen || 0) +
    (equipmentStats.regenHp || 0) +
    professionPassives.regenHpBonus +
    passiveSkillBonuses.regenHpBonus;
  const element = SPIRIT_ROOT_TO_ELEMENT[spiritRootId] || ElementType.None;

  return {
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    attack,
    magic,
    defense,
    res,
    speed,
    crit,
    critDamage,
    dodge,
    blockRate,
    damageReduction,
    alchemyBonus,
    craftingBonus,
    breakthroughBonus,
    dropRateBonus,
    cultivationSpeedBonus,
    name,
    element,
    regenHp,
    profession,
    learnedSkills,
  };
};

export const runAutoBattle = (
  player: PlayerCombatStats,
  enemy: Enemy
): AutoBattleTimelineResult => {
  const logs: CombatLog[] = [];
  const result = executeAutoBattleTimeline({
    player,
    enemy,
    logs,
    prepared: prepareAutoBattleExecution(player, enemy, logs),
  });
  clearCombatLogSnapshotProvider();
  return result;
};

export const createAutoBattleReplaySession = (
  player: PlayerCombatStats,
  enemy: Enemy
): AutoBattleReplaySession => {
  const { won, logs, rewards } = runAutoBattle(player, enemy);
  const firstLog =
    logs[0] ??
    ({
      turn: 1,
      message: `你與 ${enemy.name} 展開交戰。`,
      isPlayer: true,
      playerHp: player.hp,
      playerMaxHp: player.maxHp,
      enemyHp: enemy.hp,
      enemyMaxHp: enemy.hp,
    } satisfies CombatLog);

  return {
    displayedLogs: [firstLog],
    replayQueue: logs.slice(1),
    battleSnapshot: {
      playerHp: firstLog.playerHp ?? player.hp,
      playerMaxHp: firstLog.playerMaxHp ?? player.maxHp,
      enemyHp: firstLog.enemyHp ?? enemy.hp,
      enemyMaxHp: firstLog.enemyMaxHp ?? enemy.hp,
      won,
      rewards,
    },
  };
};
