import { type CombatLog, type Enemy, type Skill } from "../types";
import type { PlayerPassiveFlags } from "./battlePassives";
import type { CombatStatusLike } from "./battleStatusTypes";
import type {
  ResolvePlayerActiveAftermathResult,
  ResolvePlayerOffenseRollResult,
} from "./battleTurnPhasePlayerTypes";
import type {
  ElementalAffinityLike,
  PlayerCombatStatsLike,
  RestrictionLike,
} from "./battleTurnPhaseSharedTypes";

export type PlayerTurnPhaseDependencies = {
  resolvePlayerOffenseRoll: (args: {
    player: PlayerCombatStatsLike;
    enemy: Enemy;
    activeSkill?: Skill;
    activeSkillCanonicalId?: string;
    activeSkillTimelineProfile?: {
      executionTimeMs?: number;
    };
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
