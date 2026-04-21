import { Enemy, Skill } from "../types";
import {
  getEnemyElementalModifier,
  getRestriction,
} from "./battleEncounterElements";
import { getHighestActiveSkill } from "./battleEncounterSkillSelection";
import { type PlayerPassiveFlags, getPlayerPassiveFlags } from "./battlePassives";
import type {
  EncounterElementalAffinity,
  EncounterPlayerCombatStatsLike,
  EncounterRestriction,
} from "./battleEncounterTypes";
import {
  getEnemyAttackIntervalMs,
  getPlayerAttackIntervalMs,
} from "./battleProfiles";

export { getEnemyElementalModifier, getRestriction } from "./battleEncounterElements";

export type CombatRuntimeContext = {
  activeSkill?: Skill;
  playerAttackIntervalMs: number;
  enemyAttackIntervalMs: number;
  pVsE: EncounterRestriction;
  enemyElementalAffinity: EncounterElementalAffinity;
  passiveFlags: PlayerPassiveFlags;
};

export type CombatLoopFeatureFlags = Pick<
  PlayerPassiveFlags,
  | "hasBodyRebirthPassive"
  | "hasManaSpringPassive"
  | "hasMageFusionPassive"
  | "hasBodyImmortalPassive"
  | "hasBodyAncientPassive"
  | "hasSwordImmortalPassive"
  | "hasSwordHeartPassive"
>;

export const createCombatRuntimeContext = (
  player: EncounterPlayerCombatStatsLike,
  enemy: Enemy
): CombatRuntimeContext => {
  const activeSkill = getHighestActiveSkill(player.profession, player.learnedSkills);
  return {
    activeSkill: activeSkill ?? undefined,
    playerAttackIntervalMs: getPlayerAttackIntervalMs(player),
    enemyAttackIntervalMs: getEnemyAttackIntervalMs(enemy),
    pVsE: getRestriction(player.element, enemy.element),
    enemyElementalAffinity: getEnemyElementalModifier(player.element, enemy),
    passiveFlags: getPlayerPassiveFlags(player.learnedSkills),
  };
};

export const createCombatLoopFeatureFlags = (
  passiveFlags: PlayerPassiveFlags
): CombatLoopFeatureFlags => ({
  hasBodyRebirthPassive: passiveFlags.hasBodyRebirthPassive,
  hasManaSpringPassive: passiveFlags.hasManaSpringPassive,
  hasMageFusionPassive: passiveFlags.hasMageFusionPassive,
  hasBodyImmortalPassive: passiveFlags.hasBodyImmortalPassive,
  hasBodyAncientPassive: passiveFlags.hasBodyAncientPassive,
  hasSwordImmortalPassive: passiveFlags.hasSwordImmortalPassive,
  hasSwordHeartPassive: passiveFlags.hasSwordHeartPassive,
});
