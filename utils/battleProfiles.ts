import { getSkill } from "../data/skills";
import { Enemy, EnemyRank, ProfessionType, Skill } from "../types";
import { getPlayerPassiveFlags, getCanonicalSkillId } from "./battlePassives";

export interface SkillTimelineProfile {
  cooldownSeconds: number;
  cooldownMs: number;
  executionTimeMs: number;
  areaShape: NonNullable<Skill["areaShape"]>;
  areaRadius: number;
  maxTargets: number;
  isProjectile: boolean;
  areaDamageModifier: number;
}

export interface EnemySpecialTimelineProfile {
  cooldownSeconds: number;
  cooldownMs: number;
  executionTimeMs: number;
  areaShape: NonNullable<Skill["areaShape"]>;
  areaRadius: number;
  maxTargets: number;
  isProjectile: boolean;
  areaDamageModifier: number;
}

type PlayerAttackIntervalInput = {
  profession: ProfessionType;
  speed: number;
};

const getSkillExecutionTimeMs = (skill?: Skill) => {
  if (!skill) return 0;

  const castTimeMs = skill.castTimeMs ?? 0;
  const travelTimeMs =
    skill.projectileSpeed && skill.projectileSpeed > 0 && (skill.castRange ?? 0) > 1
      ? Math.round(((skill.castRange ?? 0) * 180) / skill.projectileSpeed)
      : 0;

  return castTimeMs + travelTimeMs;
};

const getAreaShapeDamageModifier = (skill?: Skill) => {
  if (!skill || skill.targetType === "self") return 1;

  const shape =
    skill.areaShape ?? (skill.targetType === "all" ? "circle" : "single");
  if (shape === "single" || shape === "self") return 1;

  const baseByShape: Record<NonNullable<Skill["areaShape"]>, number> = {
    single: 1,
    self: 1,
    line: 0.96,
    cone: 0.91,
    circle: 0.86,
  };

  const base = baseByShape[shape] ?? 0.9;
  const radiusBonus = Math.min(0.08, (skill.areaRadius ?? 0) * 0.025);
  const targetPenalty = Math.min(
    0.2,
    Math.max(0, (skill.maxTargets ?? (skill.targetType === "all" ? 3 : 1)) - 1) * 0.03
  );

  return Math.max(0.7, Math.min(1.02, base + radiusBonus - targetPenalty));
};

const getEnemyAreaDamageModifier = (specialAttack?: Enemy["specialAttack"]) => {
  if (!specialAttack) return 1;

  const shape = specialAttack.areaShape ?? "single";
  if (shape === "single" || shape === "self") return 1;

  const baseByShape: Record<NonNullable<Skill["areaShape"]>, number> = {
    single: 1,
    self: 1,
    line: 0.96,
    cone: 0.91,
    circle: 0.86,
  };

  const base = baseByShape[shape] ?? 0.9;
  const radiusBonus = Math.min(0.08, (specialAttack.areaRadius ?? 0) * 0.025);
  const targetPenalty = Math.min(
    0.2,
    Math.max(0, (specialAttack.maxTargets ?? 1) - 1) * 0.03
  );

  return Math.max(0.7, Math.min(1.02, base + radiusBonus - targetPenalty));
};

export const getLearnedSkills = (learnedSkillIds: string[]): Skill[] =>
  learnedSkillIds
    .map((id) => getSkill(id))
    .filter((skill): skill is Skill => Boolean(skill))
    .sort((a, b) => b.minRealm - a.minRealm);

export const getPlayerAttackIntervalMs = (player: PlayerAttackIntervalInput) => {
  const baseByProfession: Record<ProfessionType, number> = {
    [ProfessionType.None]: 1450,
    [ProfessionType.Sword]: 1280,
    [ProfessionType.Body]: 1450,
    [ProfessionType.Mage]: 1260,
  };

  const base = baseByProfession[player.profession] ?? 1450;
  const speedReduction = Math.min(520, player.speed * 14);
  return Math.max(520, base - speedReduction);
};

export const getEnemyAttackIntervalMs = (enemy: Enemy) => {
  const rankBase: Record<EnemyRank, number> = {
    [EnemyRank.Common]: 1550,
    [EnemyRank.Elite]: 1380,
    [EnemyRank.Boss]: 1260,
  };

  const rangePenalty = (enemy.attackRange ?? 1) > 1 ? 120 : 0;
  const affixReduction = enemy.affixes?.includes("迅影") ? 120 : 0;
  return Math.max(650, rankBase[enemy.rank] + rangePenalty - affixReduction);
};

export const resolvePlayerActiveSkillWindow = ({
  activeSkill,
  currentTimeMs,
  activeSkillReadyAtMs,
  playerMp,
  hasMageFusionPassive,
}: {
  activeSkill?: Skill;
  currentTimeMs: number;
  activeSkillReadyAtMs: number;
  playerMp: number;
  hasMageFusionPassive: boolean;
}) => {
  const skillReady =
    Boolean(activeSkill) &&
    currentTimeMs >= activeSkillReadyAtMs &&
    (playerMp >= (activeSkill?.cost || 0) ||
      (hasMageFusionPassive &&
        activeSkill?.profession === ProfessionType.Mage));

  if (!skillReady || !activeSkill) {
    return {
      skillReady: false,
      activeSkillTimelineProfile: undefined,
      activeSkillCanonicalId: undefined,
    };
  }

  return {
    skillReady: true,
    activeSkillTimelineProfile: getSkillTimelineProfile(activeSkill),
    activeSkillCanonicalId: getCanonicalSkillId(activeSkill),
  };
};

export const getSkillTimelineProfile = (
  skill?: Skill
): SkillTimelineProfile => {
  const cooldownSeconds = skill?.cooldownSeconds ?? skill?.cooldown ?? 0;
  const areaShape =
    skill?.areaShape ??
    (skill?.targetType === "self"
      ? "self"
      : skill?.targetType === "all"
        ? "circle"
        : "single");
  const areaRadius = skill?.areaRadius ?? 0;
  const maxTargets =
    skill?.maxTargets ?? (skill?.targetType === "all" ? 3 : 1);
  const executionTimeMs = getSkillExecutionTimeMs(skill);

  return {
    cooldownSeconds,
    cooldownMs: Math.floor(cooldownSeconds * 1000),
    executionTimeMs,
    areaShape,
    areaRadius,
    maxTargets,
    isProjectile: Boolean(skill?.projectileSpeed && (skill.castRange ?? 0) > 1),
    areaDamageModifier: getAreaShapeDamageModifier(skill),
  };
};

export const getResolvedSkillCooldownSeconds = (
  skill: Skill | undefined,
  learnedSkillIdsOrSkills: string[] | Skill[] = []
) => {
  if (!skill) return 0;

  const baseCooldownSeconds = getSkillTimelineProfile(skill).cooldownSeconds;
  const learnedSkills =
    learnedSkillIdsOrSkills.length > 0 &&
    typeof learnedSkillIdsOrSkills[0] !== "string"
      ? (learnedSkillIdsOrSkills as Skill[])
      : getLearnedSkills(learnedSkillIdsOrSkills as string[]);
  const passiveFlags = getPlayerPassiveFlags(learnedSkills);
  const hasExplicitCooldownReductionPassive =
    passiveFlags.hasMageSpiritSeveringPassive;

  return hasExplicitCooldownReductionPassive
    ? Math.max(1, baseCooldownSeconds - 1)
    : baseCooldownSeconds;
};

export const getEnemySpecialTimelineProfile = (
  enemy: Enemy
): EnemySpecialTimelineProfile => {
  const special = enemy.specialAttack;
  const cooldownSeconds = special?.cooldownSeconds ?? 0;
  const areaShape = special?.areaShape ?? "single";
  const areaRadius = special?.areaRadius ?? 0;
  const maxTargets = special?.maxTargets ?? 1;

  return {
    cooldownSeconds,
    cooldownMs: Math.floor(cooldownSeconds * 1000),
    executionTimeMs:
      special?.castTimeMs ?? ((enemy.attackRange ?? 1) > 1 ? 260 : 120),
    areaShape,
    areaRadius,
    maxTargets,
    isProjectile: Boolean((enemy.attackRange ?? 1) > 1),
    areaDamageModifier: getEnemyAreaDamageModifier(special),
  };
};

export const getResolvedEnemySpecialCooldownSeconds = (enemy: Enemy) =>
  getEnemySpecialTimelineProfile(enemy).cooldownSeconds;
