import { Enemy } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import { resolveDamage } from "./battleCombatMath";
import type { EnemyWorldStrikeResolved } from "./battleWorldStrike";
import { buildEnemyWorldStrikeResult } from "./battleWorldStrikeResultBuilders";
import { getEnemyWorldPassiveTriggerState } from "./battleWorldStrikeEnemyPassiveTriggers";
import { createEnemyWorldStrikeRuntime } from "./battleWorldStrikeRuntime";
import type { EnemyWorldStrikeRuntime } from "./battleWorldStrikeEnemyTypes";

const resolveEnemyWorldStrikeOutcome = ({
  enemy,
  player,
  useSpecial,
  runtime,
}: {
  enemy: Enemy;
  player: PlayerCombatStats;
  useSpecial: boolean;
  runtime: EnemyWorldStrikeRuntime;
}): EnemyWorldStrikeResolved => {
  const special = useSpecial ? enemy.specialAttack : undefined;
  const {
    attackContext,
    passiveFlags,
    restriction,
    effectiveDefense,
    timelineProfile,
    incomingStatuses,
  } = runtime;
  let effectivePower = attackContext.power * (special?.damageMultiplier ?? 1);

  if (restriction.isEffective) effectivePower *= 1.1;
  if (restriction.isResisted) effectivePower *= 0.9;

  let damage = resolveDamage(effectivePower, effectiveDefense);
  if (attackContext.damageBonus) {
    damage = Math.floor(damage * (1 + attackContext.damageBonus / 100));
  }

  const {
    damage: resolvedDamage,
    reflectTriggered,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    preBodySaintDamage,
    elementalBarrierTriggered,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
    swordDeathWardTriggered,
    voidEvasion,
  } = getEnemyWorldPassiveTriggerState({
    enemy,
    player,
    passiveFlags,
    damage,
    useSpecial,
    special,
  });

  return buildEnemyWorldStrikeResult({
    damage: resolvedDamage,
    special,
    timelineProfile,
    incomingStatuses,
    passiveFlags,
    preBodySaintDamage,
    player,
    enemy,
    voidEvasion,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
    swordDeathWardTriggered,
  });
};

export const resolveEnemyWorldStrike = (
  enemy: Enemy,
  player: PlayerCombatStats,
  useSpecial = false,
  currentStatusNames: string[] = []
): EnemyWorldStrikeResolved =>
  resolveEnemyWorldStrikeOutcome({
    enemy,
    player,
    useSpecial,
    runtime: createEnemyWorldStrikeRuntime(
      enemy,
      player,
      useSpecial,
      currentStatusNames
    ),
  });
