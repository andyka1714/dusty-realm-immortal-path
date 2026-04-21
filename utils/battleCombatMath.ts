import { Enemy, ProfessionType } from "../types";
import type { CombatStatusLike } from "./battleStatusTypes";

export type AttackMode = "physical" | "magical" | "hybrid";

export interface AttackContext {
  power: number;
  defense: number;
  critBonus: number;
  critDamageBonus: number;
  damageBonus: number;
  canCrit: boolean;
}

type StatusLike = Pick<CombatStatusLike, "kind" | "value" | "expiresAtMs">;

export const hasEnemyAffix = (enemy: Enemy, affix: string) =>
  enemy.affixes?.includes(affix) ?? false;

export const getEnemyDefenseMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "堅甲")) multiplier *= 1.1;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 1.05;
  return multiplier;
};

export const getEnemyDamageReductionMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "霸體")) multiplier *= 0.97;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 0.98;
  return multiplier;
};

export const getEnemyAttackPowerMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "強襲")) multiplier *= 1.08;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 1.05;
  return multiplier;
};

export const getAttackMode = (profession: ProfessionType): AttackMode => {
  switch (profession) {
    case ProfessionType.Mage:
      return "magical";
    case ProfessionType.Body:
      return "hybrid";
    default:
      return "physical";
  }
};

export const resolveDamage = (
  power: number,
  defense: number,
  varianceMin = 0.92,
  varianceMax = 1.08
): number => {
  const mitigation = 100 / (100 + Math.max(0, defense));
  const variance = varianceMin + Math.random() * (varianceMax - varianceMin);
  return Math.max(1, Math.floor(power * mitigation * variance));
};

export const getArmorBreakMultiplier = (
  statuses: StatusLike[],
  currentTimeMs: number
) => {
  const totalBreak = statuses
    .filter(
      (status) =>
        status.kind === "armorBreak" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);

  return Math.max(0.2, 1 - totalBreak);
};

export const getVulnerableMultiplier = (
  statuses: StatusLike[],
  currentTimeMs: number
) => {
  const totalVulnerable = statuses
    .filter(
      (status) =>
        status.kind === "vulnerable" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + Math.max(0, status.value), 0);

  return Math.min(2, 1 + totalVulnerable);
};

export const getDamageAmpMultiplier = (
  statuses: StatusLike[],
  currentTimeMs: number
) => {
  const totalAmp = statuses
    .filter(
      (status) =>
        status.kind === "damageAmp" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + Math.max(0, status.value), 0);

  return Math.min(2.5, 1 + totalAmp);
};

export const getLifestealValue = (
  statuses: StatusLike[],
  currentTimeMs: number
) =>
  statuses
    .filter(
      (status) =>
        status.kind === "lifesteal" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + Math.max(0, status.value), 0);

export const hasControlImmuneStatus = (
  statuses: StatusLike[],
  currentTimeMs: number
) =>
  statuses.some(
    (status) =>
      status.kind === "controlImmune" && status.expiresAtMs > currentTimeMs
  );

export const absorbDamageWithShield = (
  statuses: StatusLike[],
  incomingDamage: number,
  currentTimeMs: number
) => {
  let remainingDamage = incomingDamage;
  let absorbed = 0;

  statuses.forEach((status) => {
    if (
      remainingDamage <= 0 ||
      status.kind !== "shield" ||
      status.expiresAtMs <= currentTimeMs ||
      status.value <= 0
    ) {
      return;
    }

    const block = Math.min(status.value, remainingDamage);
    status.value -= block;
    remainingDamage -= block;
    absorbed += block;
  });

  return { remainingDamage, absorbed };
};

export const getReflectValue = (statuses: StatusLike[], currentTimeMs: number) =>
  statuses
    .filter(
      (status) => status.kind === "reflect" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);

export const getCritBoostValue = (
  statuses: StatusLike[],
  currentTimeMs: number
) =>
  statuses
    .filter(
      (status) => status.kind === "critBoost" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);
