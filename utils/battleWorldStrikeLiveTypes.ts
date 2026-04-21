import {
  ActiveMonster,
  ProfessionType,
  Skill,
} from "../types";
import {
  BattleLogEntryPlan,
  BattleRewardApplicationPlan,
  BattleRewardManifest,
} from "./battleRewards";
import {
  WorldPlayerDefeatPlan,
  WorldPlayerDefeatStatePlan,
} from "./battleLifecycle";

export interface WorldStrikeResult {
  damage: number;
  isCrit: boolean;
  skillName?: string;
  nextActionDelayMs: number;
  skillCooldownMs: number;
  executionTimeMs: number;
  playerStatusNames: string[];
  enemyStatusNames: string[];
  playerShieldGain: number;
  areaShape?: Skill["areaShape"];
  areaRadius?: number;
  maxTargets?: number;
  isProjectile: boolean;
}

export interface EnemyWorldStrikeResolved {
  damage: number;
  skillName?: string;
  nextActionDelayMs: number;
  specialCooldownMs: number;
  executionTimeMs: number;
  statusNames: string[];
  areaShape?: Skill["areaShape"];
  areaRadius?: number;
  isProjectile: boolean;
}

export interface WorldStrikeImpactPlan {
  color: string;
  colorInt: number;
  targetX: number;
  targetY: number;
  radius: number;
  damageText: string;
  damageTextColor: string;
  damageTextColorInt: number;
}

export interface WorldStrikeVisualPlan {
  projectile?: {
    color: string;
    colorInt: number;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    durationMs: number;
  };
  area?: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    durationMs: number;
  };
  impact?: WorldStrikeImpactPlan;
}

export interface WorldShieldedDamageResolution {
  absorbed: number;
  damageTaken: number;
  remainingShield: number;
}

export interface PlayerWorldStrikeImpactTarget {
  target: ActiveMonster;
  damage: number;
  defeated: boolean;
  visualPlan: WorldStrikeVisualPlan;
}

export interface PlayerWorldStrikeExecutionPlan {
  strikeVisualPlan: WorldStrikeVisualPlan;
  impactTargets: PlayerWorldStrikeImpactTarget[];
  defeatedTargets: ActiveMonster[];
  resolutionMessage: string;
  shouldClearEncounter: boolean;
}

export interface PlayerWorldStrikeDefeatResult {
  monsterName: string;
  rewardManifest: BattleRewardManifest;
  recoveryAmount: number;
  recoveryLogMessage: string;
  victoryLogMessage: string;
}

export interface PlayerWorldStrikeOutcomePlan {
  executionPlan: PlayerWorldStrikeExecutionPlan;
  defeatedResults: PlayerWorldStrikeDefeatResult[];
}

export interface PlayerWorldStrikeOutcomeStatePlan {
  monsterDamageApplications: Array<{
    monsterInstanceId: string;
    damage: number;
  }>;
  visualPlans: WorldStrikeVisualPlan[];
  worldLastCombatMessage: string;
  rewardApplicationPlans: BattleRewardApplicationPlan[];
  logEntries: BattleLogEntryPlan[];
  nextWorldPlayerHp: number;
  shouldClearEncounter: boolean;
}

export interface EnemyWorldStrikeExecutionPlan {
  shieldResolution: WorldShieldedDamageResolution;
  nextHp: number;
  nextStatuses: string[];
  resolutionMessage: string;
  visualPlan: WorldStrikeVisualPlan;
  shouldHandleDefeat: boolean;
}

export interface EnemyWorldStrikeOutcomePlan {
  executionPlan: EnemyWorldStrikeExecutionPlan;
  defeatPlan?: WorldPlayerDefeatPlan;
}

export interface EnemyWorldStrikeOutcomeStatePlan {
  shouldUpdateWorldPlayerShield: boolean;
  nextWorldPlayerShield: number;
  nextWorldPlayerHp: number;
  nextWorldCombatPlayerStatuses: string[];
  worldLastCombatMessage: string;
  visualPlan: WorldStrikeVisualPlan;
  defeatStatePlan?: WorldPlayerDefeatStatePlan;
}

export interface PlayerWorldStrikePreviewPlan {
  worldCombatTargetId: string;
  worldCombatTargetStatuses: string[];
  worldCombatPlayerStatuses: string[];
  nextWorldPlayerShield: number;
  worldLastCombatMessage: string;
  nextPlayerActionReadyAt: number;
  nextPlayerSkillReadyAt?: number;
}

export interface EnemyWorldStrikePreviewPlan {
  nextEnemyActionReadyAt: number;
  nextEnemySpecialReadyAt?: number;
  worldLastCombatMessage: string;
}

export type WorldStrikeSkillProfession = ProfessionType | undefined;
