import { ElementType, ProfessionType, Skill } from "../types";

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
  createAutoBattleReplaySession,
  runAutoBattle,
} from "./battleAutoTimeline";
export { calculatePlayerStats } from "./battleStats";
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
export {
  resolveEnemyWorldStrike,
  resolvePlayerWorldStrike,
} from "./battleWorldStrikeResolver";
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
