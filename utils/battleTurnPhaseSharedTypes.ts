import type { Skill } from "../types";

export type PlayerCombatStatsLike = {
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
  element: import("../types").ElementType;
  regenHp: number;
  profession: import("../types").ProfessionType;
  learnedSkills: Skill[];
  equippedActiveSkillId?: string | null;
};

export type RestrictionLike = {
  isEffective: boolean;
  isResisted: boolean;
};

export type ElementalAffinityLike = {
  multiplier: number;
  reason?: "resistance" | "weakness";
};
