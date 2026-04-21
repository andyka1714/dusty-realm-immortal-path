import { Enemy, Skill } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import {
  getBodyFoundationBloodlineStacks,
  getCanonicalSkillId,
  getPlayerPassiveFlags,
  hasLearnedSkillId,
  hasSwordTribulationWindow,
} from "./battlePassives";
import { getEnemyElementalModifier, getRestriction } from "./battleEncounter";
import {
  getEnemySpecialTimelineProfile,
  getSkillTimelineProfile,
} from "./battleProfiles";
import {
  getEnemyAttackContext,
  getPlayerAttackContext,
} from "./battleWorldStrikeAttackContext";
import { resolveIncomingEnemySpecialStatuses } from "./battleWorldStrikeIncomingStatuses";
import type { EnemyWorldStrikeRuntime } from "./battleWorldStrikeEnemyTypes";
import type { PlayerWorldStrikeRuntime } from "./battleWorldStrikePlayerTypes";

export const createPlayerWorldStrikeRuntime = (
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

export const createEnemyWorldStrikeRuntime = (
  enemy: Enemy,
  player: PlayerCombatStats,
  useSpecial = false,
  currentStatusNames: string[] = []
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
      currentStatusNames,
      passiveFlags,
      currentTimeMs: 0,
      shortenControlDuration: passiveFlags.hasSwordFusionPassive,
    }),
  };
};
