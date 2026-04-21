import type { ElementType, Enemy } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import type { PlayerPassiveFlags } from "./battlePassives";
import type { EncounterRestriction } from "./battleEncounterTypes";
import type { EnemySpecialTimelineProfile } from "./battleProfiles";
import type { AttackContext } from "./battleCombatMath";
import type { CombatStatusLike } from "./battleStatusTypes";

export type EnemyWorldPassiveStatusOptions = {
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

export type EnemyWorldIncomingStatusOptions = {
  bodyImmortalTriggered: boolean;
  swordEmperorTriggered: boolean;
  controlImmuneTriggered: boolean;
};

export type ResolvedIncomingEnemySpecialStatuses = {
  filteredStatuses: CombatStatusLike[];
  bodyImmortalTriggered: boolean;
  swordEmperorTriggered: boolean;
  mageTribulationControlTriggered: boolean;
  controlImmuneTriggered: boolean;
  normalizedIncomingStatuses: CombatStatusLike[];
  swordFusionControlTriggered: boolean;
};

export type EnemyWorldStrikeRuntime = {
  attackContext: AttackContext;
  passiveFlags: PlayerPassiveFlags;
  restriction: EncounterRestriction;
  effectiveDefense: number;
  timelineProfile: EnemySpecialTimelineProfile;
  incomingStatuses: ResolvedIncomingEnemySpecialStatuses;
};

export type BuildEnemyWorldStrikeResultOptions = {
  damage: number;
  special?: Enemy["specialAttack"];
  timelineProfile: EnemySpecialTimelineProfile;
  incomingStatuses: ResolvedIncomingEnemySpecialStatuses;
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
};

export type BuildEnemyWorldStrikeStatusNamesOptions = {
  incomingStatuses: ResolvedIncomingEnemySpecialStatuses;
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
};
