import { Skill } from "../types";
import { buildStatusesFromSkill } from "./battleStatusEffectBuilders";
import type { CombatStatusLike } from "./battleStatusTypes";

export const normalizeCombatStatuses = (
  statuses: CombatStatusLike[],
  currentTimeMs: number
) =>
  statuses.map((status) => ({
    ...status,
    expiresAtMs: currentTimeMs + status.expiresAtMs,
    nextTickAtMs: status.nextTickAtMs
      ? currentTimeMs + status.nextTickAtMs
      : undefined,
  }));

export const splitSkillStatusesBySide = (
  skill: Skill,
  statuses: CombatStatusLike[]
) => {
  const playerSideStatuses = statuses.filter(
    (status) =>
      skill.targetType === "self" ||
      status.kind === "shield" ||
      status.kind === "reflect" ||
      status.kind === "critBoost" ||
      status.kind === "damageAmp" ||
      status.kind === "lifesteal" ||
      status.kind === "controlImmune" ||
      status.kind === "taunt"
  );
  const enemySideStatuses = statuses.filter(
    (status) => !playerSideStatuses.includes(status)
  );

  return {
    playerSideStatuses,
    enemySideStatuses,
  };
};

export const resolveNormalizedSkillStatuses = (
  skill: Skill,
  targetMaxHp: number,
  currentTimeMs: number
) => {
  const createdStatuses = buildStatusesFromSkill(skill, targetMaxHp);
  const normalizedStatuses = normalizeCombatStatuses(
    createdStatuses,
    currentTimeMs
  );
  const { playerSideStatuses, enemySideStatuses } = splitSkillStatusesBySide(
    skill,
    normalizedStatuses
  );

  return {
    createdStatuses,
    normalizedStatuses,
    playerSideStatuses,
    enemySideStatuses,
  };
};
