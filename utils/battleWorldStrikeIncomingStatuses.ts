import { type Enemy } from "../types";
import { hasControlImmuneStatus } from "./battleCombatMath";
import type { PlayerCombatStats } from "./battleSystem";
import type { PlayerPassiveFlags } from "./battlePassives";
import { isDotStatusKind, isNegativeStatusKind } from "./battleStatuses";
import { resolveNormalizedEnemySpecialStatuses } from "./battleStatusEffects";
import type { CombatStatusLike } from "./battleStatusTypes";
import type { ResolvedIncomingEnemySpecialStatuses } from "./battleWorldStrikeEnemyTypes";

const getResolvedEnemyWorldIncomingStatuses = ({
  special,
  player,
  currentStatuses,
  currentStatusNames,
  passiveFlags,
}: {
  special?: Enemy["specialAttack"];
  player: PlayerCombatStats;
  currentStatuses?: CombatStatusLike[];
  currentStatusNames?: string[];
  passiveFlags: PlayerPassiveFlags;
}) => {
  const createdStatuses = resolveNormalizedEnemySpecialStatuses(
    special,
    player.maxHp,
    0
  );
  const controlImmuneActive =
    (currentStatuses
      ? hasControlImmuneStatus(currentStatuses, 0)
      : false) || (currentStatusNames?.includes("獸神附體") ?? false);

  const filteredStatuses = createdStatuses.filter((status) => {
    if (controlImmuneActive && status.kind === "incapacitate") {
      return false;
    }
    if (passiveFlags.hasMageTribulationPassive && status.kind === "incapacitate") {
      return false;
    }
    if (passiveFlags.hasSwordEmperorPassive && isNegativeStatusKind(status.kind)) {
      return false;
    }
    if (passiveFlags.hasBodyImmortalPassive && isDotStatusKind(status.kind)) {
      return false;
    }
    return true;
  });

  const bodyImmortalTriggered =
    passiveFlags.hasBodyImmortalPassive &&
    createdStatuses.some((status) => isDotStatusKind(status.kind)) &&
    filteredStatuses.every((status) => !isDotStatusKind(status.kind));

  const swordEmperorTriggered =
    passiveFlags.hasSwordEmperorPassive &&
    createdStatuses.some((status) => isNegativeStatusKind(status.kind)) &&
    filteredStatuses.every((status) => !isNegativeStatusKind(status.kind));

  const mageTribulationControlTriggered =
    passiveFlags.hasMageTribulationPassive &&
    createdStatuses.some((status) => status.kind === "incapacitate") &&
    filteredStatuses.every((status) => status.kind !== "incapacitate");

  const controlImmuneTriggered =
    controlImmuneActive &&
    createdStatuses.some((status) => status.kind === "incapacitate") &&
    filteredStatuses.every((status) => status.kind !== "incapacitate");

  return {
    filteredStatuses,
    bodyImmortalTriggered,
    swordEmperorTriggered,
    mageTribulationControlTriggered,
    controlImmuneTriggered,
  };
};

export const resolveIncomingEnemySpecialStatuses = ({
  special,
  player,
  currentStatuses,
  currentStatusNames,
  passiveFlags,
  currentTimeMs,
  shortenControlDuration,
}: {
  special?: Enemy["specialAttack"];
  player: PlayerCombatStats;
  currentStatuses?: CombatStatusLike[];
  currentStatusNames?: string[];
  passiveFlags: PlayerPassiveFlags;
  currentTimeMs: number;
  shortenControlDuration: boolean;
}): ResolvedIncomingEnemySpecialStatuses => {
  const incomingStatuses = getResolvedEnemyWorldIncomingStatuses({
    special,
    player,
    currentStatuses,
    currentStatusNames,
    passiveFlags,
  });

  let swordFusionControlTriggered = false;

  const normalizedIncomingStatuses = incomingStatuses.filteredStatuses
    .map((status) => {
      if (shortenControlDuration && status.kind === "incapacitate") {
        swordFusionControlTriggered = true;
        return {
          ...status,
          expiresAtMs: Math.max(currentTimeMs, status.expiresAtMs - 1000),
        };
      }
      return status;
    })
    .filter(
      (status) =>
        status.kind !== "incapacitate" || status.expiresAtMs > currentTimeMs
    );

  return {
    ...incomingStatuses,
    normalizedIncomingStatuses,
    swordFusionControlTriggered,
  };
};
