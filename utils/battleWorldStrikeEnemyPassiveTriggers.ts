import { ElementType, Enemy } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import type { PlayerPassiveFlags } from "./battlePassives";
import {
  getBodyFoundationBloodlineStacks,
  getCopperSkinReductionMultiplier,
} from "./battlePassives";

export const getEnemyWorldPassiveTriggerState = (options: {
  enemy: Enemy;
  player: PlayerCombatStats;
  passiveFlags: PlayerPassiveFlags;
  damage: number;
  useSpecial: boolean;
  special?: Enemy["specialAttack"];
}) => {
  const { enemy, player, passiveFlags, useSpecial } = options;
  let damage = options.damage;
  const reflectTriggered =
    passiveFlags.hasReflectPassive &&
    damage > 0 &&
    (enemy.attackRange ?? 1) <= 1;
  const bodyFoundationStacks = getBodyFoundationBloodlineStacks(player.hp, player.maxHp);

  const copperSkinTriggered =
    passiveFlags.hasBodyQiPassive && !useSpecial && damage > 0;
  if (passiveFlags.hasBodyQiPassive && !useSpecial) {
    damage = Math.max(0, Math.floor(damage * getCopperSkinReductionMultiplier()));
  }

  const preBodyFusionDamage = damage;
  const bodyFusionTriggered =
    passiveFlags.hasBodyFusionPassive && preBodyFusionDamage > 0;
  if (passiveFlags.hasBodyFusionPassive && preBodyFusionDamage > 0) {
    damage = Math.max(1, Math.floor(damage * 0.7));
  }

  const preBodySaintDamage = damage;
  if (passiveFlags.hasBodySaintPassive && preBodySaintDamage > player.maxHp * 0.2) {
    damage = Math.max(1, Math.floor(damage * 0.5));
  }

  const elementalBarrierTriggered =
    Boolean(options.special) &&
    passiveFlags.hasInitialShieldPassive &&
    damage > 0;
  if (elementalBarrierTriggered) {
    damage = 0;
  }

  const bodyTribulationTriggered =
    passiveFlags.hasBodyTribulationPassive && damage > 0;
  const mageTribulationTriggered =
    passiveFlags.hasMageTribulationPassive &&
    damage > 0 &&
    enemy.element === ElementType.Metal;
  const postTribulationDamage = damage;
  const bodyRebirthTrueTriggered =
    passiveFlags.hasBodyRebirthTruePassive &&
    postTribulationDamage >= player.hp;
  const bodyEmperorTriggered =
    passiveFlags.hasBodyEmperorPassive &&
    postTribulationDamage >= player.hp;
  const swordDeathWardTriggered =
    passiveFlags.hasSwordDeathWardPassive &&
    postTribulationDamage >= player.hp &&
    player.mp > 0;
  const voidEvasion =
    passiveFlags.hasMageVoidPassive && Math.random() < 0.3;
  if (voidEvasion) {
    damage = 0;
  }

  return {
    damage,
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
  };
};
