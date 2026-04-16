import { CombatLog } from "../types";

export type CombatLogSnapshotProvider = (
  timeMs: number
) => Pick<
  CombatLog,
  | "playerStatuses"
  | "enemyStatuses"
  | "playerActiveSkillName"
  | "playerActiveSkillCooldownRemainingMs"
  | "playerActiveSkillCooldownTotalMs"
>;

let combatLogSnapshotProvider: CombatLogSnapshotProvider | null = null;

export const setCombatLogSnapshotProvider = (
  provider: CombatLogSnapshotProvider | null
) => {
  combatLogSnapshotProvider = provider;
};

export const clearCombatLogSnapshotProvider = () => {
  combatLogSnapshotProvider = null;
};

export const pushCombatLog = (logs: CombatLog[], log: CombatLog) => {
  const snapshotTimeMs = log.timeMs ?? 0;
  const snapshots = combatLogSnapshotProvider?.(snapshotTimeMs);
  logs.push({
    ...log,
    ...(snapshots ?? {}),
  });
};

export const formatSpiritStones = (amount: number): string => {
  if (amount <= 0) return "";

  const high = Math.floor(amount / 1000000);
  const mid = Math.floor((amount % 1000000) / 1000);
  const low = amount % 1000;
  const parts: string[] = [];

  if (high > 0) parts.push(`<stones q="2">${high} 上品 靈石</stones>`);
  if (mid > 0) parts.push(`<stones q="1">${mid} 中品 靈石</stones>`);
  if (low > 0) parts.push(`<stones q="0">${low} 下品 靈石</stones>`);

  return parts.join("，");
};
