import { EnemyRank, MajorRealm } from "../types";
import type { Enemy, MinorRealmType } from "../types";
import type { PlayerCombatStats } from "./battleSystem";

const ENEMY_RANK_MULTIPLIER: Record<EnemyRank, number> = {
  [EnemyRank.Common]: 1,
  [EnemyRank.Elite]: 1.25,
  [EnemyRank.Boss]: 1.65,
};

const MINOR_REALM_POWER_STEP: Record<MinorRealmType, number> = {
  初期: 0,
  中期: 3,
  後期: 6,
  圓滿: 9,
};

export const getCharacterDerivedLevel = (
  majorRealm: MajorRealm,
  minorRealm: number
) => majorRealm * 10 + minorRealm + 1;

export const getMinorRealmPowerStep = (minorRealm?: MinorRealmType) =>
  minorRealm ? MINOR_REALM_POWER_STEP[minorRealm] ?? 0 : 0;

export const getRealmPowerMultiplier = (
  majorRealm: MajorRealm,
  minorRealmStep = 0
) => 1 + majorRealm * 0.18 + minorRealmStep * 0.015;

export const calculatePlayerCombatPower = ({
  stats,
  majorRealm,
  minorRealm,
}: {
  stats: PlayerCombatStats;
  majorRealm: MajorRealm;
  minorRealm: number;
}) => {
  const basePower =
    stats.maxHp * 0.35 +
    stats.maxMp * 0.18 +
    stats.attack * 9 +
    stats.defense * 7 +
    stats.speed * 4 +
    stats.crit * 120 +
    stats.critDamage * 80 +
    stats.dodge * 100;

  return Math.max(
    1,
    Math.floor(basePower * getRealmPowerMultiplier(majorRealm, minorRealm))
  );
};

export const calculateEnemyCombatPower = (enemy: Enemy) => {
  const specialAttackBonus = enemy.specialAttack ? enemy.attack * 5 : 0;
  const basePower =
    enemy.maxHp * 0.35 +
    enemy.attack * 9 +
    enemy.defense * 7 +
    specialAttackBonus;

  return Math.max(
    1,
    Math.floor(
      basePower *
        getRealmPowerMultiplier(
          enemy.realm,
          getMinorRealmPowerStep(enemy.minorRealm)
        ) *
        ENEMY_RANK_MULTIPLIER[enemy.rank]
    )
  );
};

export const formatCombatPower = (value: number) =>
  new Intl.NumberFormat("zh-TW").format(value);
