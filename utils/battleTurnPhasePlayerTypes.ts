import type { SkillTimelineProfile } from "./battleProfiles";
import type { CombatStatusLike } from "./battleStatusTypes";
import type {
  ElementalAffinityLike,
  RestrictionLike,
} from "./battleTurnPhaseSharedTypes";

export type ResolvePlayerOffenseRollResult = {
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

export type ResolvePlayerActiveAftermathResult = {
  enemyHp: number;
  playerHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  playerMp: number;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
};

export type ResolvePlayerTurnResult = {
  enemyHp: number;
  playerHp: number;
  playerMp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  playerNextActionMs: number;
};

export type ResolvedPlayerTurnContext = {
  skillReady: boolean;
  activeSkillTimelineProfile?: SkillTimelineProfile;
  activeSkillCanonicalId?: string;
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
  enemyHp: number;
};

export type ResolvePlayerActionPhaseResult = ResolvePlayerTurnResult & {
  nextSwordImmortalGuardAtMs: number;
  bossBroken: boolean;
};

export type ResolvePlayerPreludeResult = {
  playerStatuses: CombatStatusLike[];
  nextSwordImmortalGuardAtMs: number;
  bossBroken: boolean;
};

export type PlayerTurnPhaseResult = ResolvePlayerActionPhaseResult;
