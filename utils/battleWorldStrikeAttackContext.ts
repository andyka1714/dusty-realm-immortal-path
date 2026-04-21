import { ElementType, Enemy, EnemyRank, ProfessionType, Skill } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import { getCanonicalSkillId } from "./battlePassives";
import {
  type AttackContext,
  getAttackMode,
  getEnemyAttackPowerMultiplier,
  getEnemyDefenseMultiplier,
} from "./battleCombatMath";

export const getPlayerAttackContext = (
  player: PlayerCombatStats,
  enemy: Enemy,
  skill?: Skill
): AttackContext => {
  const mode = getAttackMode(player.profession);
  const multiplier = skill?.damageMultiplier ?? 1;
  const canonicalSkillId = getCanonicalSkillId(skill);
  let power = 0;
  let defense = enemy.defense * getEnemyDefenseMultiplier(enemy);
  let critBonus = 0;
  let critDamageBonus = 0;
  let damageBonus = 0;

  if (mode === "magical") {
    power = player.magic * multiplier;
    defense = Math.max(1, enemy.defense * 0.72);
    damageBonus += 18;
  } else if (mode === "hybrid") {
    power = (player.attack * 0.78 + player.defense * 0.42) * multiplier;
    defense = enemy.defense * 0.82;
    damageBonus += 10;
  } else {
    power = player.attack * multiplier;
    defense = enemy.defense * 0.78;
    damageBonus += 8;
    critBonus += 5;
    critDamageBonus += 25;
  }

  if (skill?.profession === ProfessionType.Mage) damageBonus += 12;
  if (skill?.profession === ProfessionType.Body) damageBonus += 4;

  if (skill?.id === "b_f_active") {
    power = player.attack * 1.5 + player.defense * 0.3;
    defense = enemy.defense * 0.8;
    damageBonus += 12;
  }

  if (skill?.id === "s_vr_active" || canonicalSkillId === "s_ma_active") {
    power = player.attack * 3.1;
    defense = enemy.defense * 0.72;
    damageBonus += 14;
  }

  if (skill?.id === "m_bi_active" || canonicalSkillId === "m_tr_active") {
    defense = Math.max(1, defense * 0.5);
    damageBonus += 10;
  }

  if (skill?.id === "m_ie_active" || canonicalSkillId === "m_tr_active") {
    defense = Math.max(1, defense * 0.42);
    damageBonus += 24;
  }

  if (skill?.id === "s_ie_active" || canonicalSkillId === "s_tr_active") {
    defense = 0;
    damageBonus += 28;
    critBonus += 10;
  }

  return {
    power,
    defense,
    critBonus,
    critDamageBonus,
    damageBonus,
    canCrit: mode !== "hybrid" || !skill,
  };
};

export const getEnemyAttackContext = (
  enemy: Enemy,
  player: PlayerCombatStats
): AttackContext => {
  const magicalEnemy =
    enemy.element !== ElementType.None &&
    (enemy.element === ElementType.Fire ||
      enemy.element === ElementType.Water ||
      enemy.element === ElementType.Wood);

  return {
    power: enemy.attack * getEnemyAttackPowerMultiplier(enemy),
    defense: magicalEnemy ? player.res : player.defense,
    critBonus: enemy.rank === EnemyRank.Boss ? 5 : 0,
    critDamageBonus: enemy.rank === EnemyRank.Boss ? 15 : 0,
    damageBonus: enemy.rank === EnemyRank.Boss ? 8 : 0,
    canCrit: true,
  };
};
