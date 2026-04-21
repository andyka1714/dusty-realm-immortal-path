import type { Skill } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import type { PlayerPassiveFlags } from "./battlePassives";
import type {
  EncounterElementalAffinity,
  EncounterRestriction,
} from "./battleEncounterTypes";
import type { SkillTimelineProfile } from "./battleProfiles";
import type { AttackContext } from "./battleCombatMath";
import type { CombatStatusLike } from "./battleStatusTypes";

export type PlayerWorldPassiveStatusOptions = {
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

export type PlayerWorldStrikeRuntime = {
  attackContext: AttackContext;
  canonicalSkillId?: string;
  passiveFlags: PlayerPassiveFlags;
  restriction: EncounterRestriction;
  elementalAffinity: EncounterElementalAffinity;
  dealsDirectDamage: boolean;
  hasSwordQiChain: boolean;
  swordTribulationActive: boolean;
  bodyFoundationStacks: number;
  timelineProfile: SkillTimelineProfile;
};

export type BuildPlayerWorldStrikeResultOptions = {
  damage: number;
  isCrit: boolean;
  skill?: Skill;
  player: PlayerCombatStats;
  playerSideStatuses: CombatStatusLike[];
  filteredEnemyStatuses: CombatStatusLike[];
  passiveFlags: PlayerPassiveFlags;
  canonicalSkillId?: string;
  hasSwordQiChain: boolean;
  swordTribulationActive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
  dealsDirectDamage: boolean;
  timelineProfile: SkillTimelineProfile;
};

export type BuildPlayerWorldStrikeStatusNamesOptions = {
  playerSideStatuses: CombatStatusLike[];
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
