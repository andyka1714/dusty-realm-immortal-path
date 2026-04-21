import { Enemy, ProfessionType, Skill } from "../types";
import type { PlayerPassiveFlags } from "./battlePassives";
import {
  buildStatusesFromEnemySpecial,
  createSwordQiArmorBreakStatus,
} from "./battleStatusEffectBuilders";
import { resolveNormalizedSkillStatuses } from "./battleStatusNormalization";
import type { CombatStatusLike } from "./battleStatusTypes";

const hasEnemyAffix = (enemy: Enemy, affix: string) =>
  enemy.affixes?.includes(affix) ?? false;

export const resolveNormalizedEnemySpecialStatuses = (
  specialAttack: Enemy["specialAttack"] | undefined,
  targetMaxHp: number,
  currentTimeMs: number
) =>
  buildStatusesFromEnemySpecial(specialAttack, targetMaxHp).map((status) => ({
    ...status,
    expiresAtMs: currentTimeMs + status.expiresAtMs,
    nextTickAtMs: status.nextTickAtMs
      ? currentTimeMs + status.nextTickAtMs
      : undefined,
  }));

const filterPlayerAppliedEnemyStatuses = (
  enemy: Enemy,
  statuses: CombatStatusLike[]
) =>
  statuses.filter((status) => {
    if (
      hasEnemyAffix(enemy, "霸體") &&
      status.kind === "incapacitate" &&
      Math.random() < 0.35
    ) {
      return false;
    }

    return true;
  });

export const shouldApplySwordQiArmorBreak = ({
  passiveFlags,
  skill,
  isCrit,
  enemyHp,
}: {
  passiveFlags: Pick<PlayerPassiveFlags, "hasSwordQiPassive">;
  skill?: Skill;
  isCrit: boolean;
  enemyHp: number;
}) =>
  passiveFlags.hasSwordQiPassive &&
  skill?.profession === ProfessionType.Sword &&
  isCrit &&
  enemyHp > 0;

const resolvePlayerAppliedEnemyStatuses = ({
  enemy,
  statuses,
  passiveFlags,
  skill,
  isCrit,
  currentTimeMs,
  enemyHp,
}: {
  enemy: Enemy;
  statuses: CombatStatusLike[];
  passiveFlags: Pick<PlayerPassiveFlags, "hasSwordQiPassive">;
  skill?: Skill;
  isCrit: boolean;
  currentTimeMs: number;
  enemyHp: number;
}) => {
  const filteredStatuses = filterPlayerAppliedEnemyStatuses(enemy, statuses);

  if (
    shouldApplySwordQiArmorBreak({
      passiveFlags,
      skill,
      isCrit,
      enemyHp,
    })
  ) {
    filteredStatuses.push(createSwordQiArmorBreakStatus(currentTimeMs));
  }

  return filteredStatuses;
};

export const resolvePlayerSkillStatusApplication = ({
  skill,
  targetMaxHp,
  enemy,
  passiveFlags,
  dealsDirectDamage,
  isCrit,
  currentTimeMs,
  enemyHp,
}: {
  skill: Skill | undefined;
  targetMaxHp: number;
  enemy: Enemy;
  passiveFlags: Pick<PlayerPassiveFlags, "hasSwordQiPassive">;
  dealsDirectDamage: boolean;
  isCrit: boolean;
  currentTimeMs: number;
  enemyHp: number;
}) => {
  if (!skill) {
    return {
      playerSideStatuses: [] as CombatStatusLike[],
      filteredEnemyStatuses: [] as CombatStatusLike[],
    };
  }

  const { playerSideStatuses, enemySideStatuses } =
    resolveNormalizedSkillStatuses(skill, targetMaxHp, currentTimeMs);

  const filteredEnemyStatuses = dealsDirectDamage
    ? resolvePlayerAppliedEnemyStatuses({
        enemy,
        statuses: enemySideStatuses,
        passiveFlags,
        skill,
        isCrit,
        currentTimeMs,
        enemyHp,
      })
    : filterPlayerAppliedEnemyStatuses(enemy, enemySideStatuses);

  return {
    playerSideStatuses,
    filteredEnemyStatuses,
  };
};
