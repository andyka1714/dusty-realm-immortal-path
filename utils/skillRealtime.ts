import { Skill, ProfessionType } from "../types";
import { normalizeLearnedSkills, SKILLS } from "../data/skills";

export interface RealtimeSkillProfile {
  cooldownSeconds: number;
  castRange: number;
  castTimeMs: number;
  areaShape: "single" | "line" | "cone" | "circle" | "self";
  areaRadius: number;
  maxTargets: number;
  projectileSpeed?: number;
}

const getDefaultRealtimeProfile = (skill: Skill): RealtimeSkillProfile => {
  if (skill.type === "Passive") {
    return {
      cooldownSeconds: 0,
      castRange: 0,
      castTimeMs: 0,
      areaShape: "self",
      areaRadius: 0,
      maxTargets: 1,
    };
  }

  switch (skill.profession) {
    case ProfessionType.Mage:
      return {
        cooldownSeconds: Math.max(2.2, skill.cooldown * 1.25),
        castRange: skill.targetType === "self" ? 0 : 5,
        castTimeMs: 420,
        areaShape: skill.targetType === "all" ? "circle" : "single",
        areaRadius: skill.targetType === "all" ? 2 : 0,
        maxTargets: skill.targetType === "all" ? 6 : 1,
        projectileSpeed: 11,
      };
    case ProfessionType.Body:
      return {
        cooldownSeconds: Math.max(1.8, skill.cooldown * 1.3),
        castRange: skill.targetType === "self" ? 0 : 1,
        castTimeMs: 320,
        areaShape: skill.targetType === "all" ? "cone" : "single",
        areaRadius: skill.targetType === "all" ? 1 : 0,
        maxTargets: skill.targetType === "all" ? 3 : 1,
      };
    case ProfessionType.Sword:
    default:
      return {
        cooldownSeconds: Math.max(1.4, skill.cooldown * 1.15),
        castRange: skill.targetType === "self" ? 0 : 1,
        castTimeMs: 220,
        areaShape: skill.targetType === "all" ? "line" : "single",
        areaRadius: skill.targetType === "all" ? 1 : 0,
        maxTargets: skill.targetType === "all" ? 4 : 1,
      };
  }
};

export const getSkillRealtimeProfile = (skill: Skill): RealtimeSkillProfile => {
  const defaults = getDefaultRealtimeProfile(skill);

  return {
    cooldownSeconds: skill.cooldownSeconds ?? defaults.cooldownSeconds,
    castRange: skill.castRange ?? defaults.castRange,
    castTimeMs: skill.castTimeMs ?? defaults.castTimeMs,
    areaShape: skill.areaShape ?? defaults.areaShape,
    areaRadius: skill.areaRadius ?? defaults.areaRadius,
    maxTargets: skill.maxTargets ?? defaults.maxTargets,
    projectileSpeed: skill.projectileSpeed ?? defaults.projectileSpeed,
  };
};

export const getLearnedSkillEngagementRange = (
  profession: ProfessionType,
  learnedSkillIds: string[]
) => {
  const baseRange = profession === ProfessionType.Mage ? 3 : 1;

  const activeRanges = normalizeLearnedSkills(learnedSkillIds)
    .filter((skill): skill is Skill => skill.type === "Active")
    .map((skill) => getSkillRealtimeProfile(skill).castRange);

  return Math.max(baseRange, ...activeRanges, 0);
};

export const getAvailablePlayerEngagementRange = ({
  profession,
  activeSkill,
  canUseActiveSkill,
}: {
  profession: ProfessionType;
  activeSkill?: Skill;
  canUseActiveSkill: boolean;
}) => {
  const baseRange = profession === ProfessionType.Mage ? 3 : 1;
  if (!activeSkill || !canUseActiveSkill) {
    return baseRange;
  }

  return Math.max(baseRange, getSkillRealtimeProfile(activeSkill).castRange);
};
