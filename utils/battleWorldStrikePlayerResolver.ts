import { Enemy, ProfessionType, Skill } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import {
  getSwordQiPassiveCritBonus,
  isManaSpringEmpowered,
} from "./battlePassives";
import { resolvePlayerSkillStatusApplication } from "./battleStatusEffects";
import {
  getEnemyDamageReductionMultiplier,
  resolveDamage,
} from "./battleCombatMath";
import type { WorldStrikeResult } from "./battleWorldStrike";
import { buildPlayerWorldStrikeResult } from "./battleWorldStrikeResultBuilders";
import { createPlayerWorldStrikeRuntime } from "./battleWorldStrikeRuntime";
import type { PlayerWorldStrikeRuntime } from "./battleWorldStrikePlayerTypes";

const resolvePlayerWorldStrikeOutcome = ({
  player,
  enemy,
  skill,
  runtime,
}: {
  player: PlayerCombatStats;
  enemy: Enemy;
  skill?: Skill;
  runtime: PlayerWorldStrikeRuntime;
}): WorldStrikeResult => {
  const {
    attackContext,
    canonicalSkillId,
    passiveFlags,
    restriction,
    elementalAffinity,
    dealsDirectDamage,
    hasSwordQiChain,
    swordTribulationActive,
    bodyFoundationStacks,
    timelineProfile,
  } = runtime;
  const {
    hasSwordVoidPassive,
    hasSwordQiPassive,
    hasMageQiPassive,
    hasSwordEmperorPassive,
    hasSwordMahayanaPassive,
    hasMageMahayanaPassive,
  } = passiveFlags;

  let effectivePower = attackContext.power;
  if (restriction.isEffective) effectivePower *= 1.12;
  if (restriction.isResisted) effectivePower *= 0.88;
  effectivePower *= elementalAffinity.multiplier;
  if (bodyFoundationStacks > 0) {
    effectivePower *= 1 + bodyFoundationStacks * 0.02;
  }

  if (isManaSpringEmpowered(player.mp, player.maxMp, passiveFlags)) {
    effectivePower *= 1.2;
  }
  if (!skill && hasMageQiPassive && player.profession === ProfessionType.Mage) {
    effectivePower += player.magic * 0.18;
  }
  if (hasMageMahayanaPassive && skill?.profession === ProfessionType.Mage) {
    effectivePower *= 1.4;
  }
  if (swordTribulationActive) {
    effectivePower *= 1.5;
  }
  if (canonicalSkillId === "s_tr_active" && hasSwordQiChain) {
    effectivePower *= 1.18;
  }

  const voidSwordProc = hasSwordVoidPassive && Math.random() < 0.1;
  const resolvedDefense =
    voidSwordProc && attackContext.defense > 0
      ? Math.max(1, attackContext.defense * 0.5)
      : attackContext.defense;

  const critRate = Math.min(
    95,
    player.crit +
      attackContext.critBonus +
      (hasSwordMahayanaPassive ? 5 : 0) +
      (hasSwordQiPassive ? getSwordQiPassiveCritBonus() : 0)
  );
  const isCrit =
    swordTribulationActive ||
    (attackContext.canCrit && Math.random() * 100 < Math.max(0, critRate));

  let damage = 0;
  const ignoreEnemyReduction =
    canonicalSkillId === "s_tr_active" || (!skill && hasSwordEmperorPassive);
  if (dealsDirectDamage) {
    damage = resolveDamage(
      effectivePower,
      ignoreEnemyReduction ? 0 : resolvedDefense
    );
    if (attackContext.damageBonus) {
      damage = Math.floor(damage * (1 + attackContext.damageBonus / 100));
    }
    if (!ignoreEnemyReduction) {
      damage = Math.floor(damage * getEnemyDamageReductionMultiplier(enemy));
    }
    if (skill) {
      damage = Math.floor(damage * timelineProfile.areaDamageModifier);
    }
    if (isCrit) {
      damage = Math.floor(
        damage *
          ((player.critDamage +
            attackContext.critDamageBonus +
            (hasSwordMahayanaPassive ? 10 : 0) +
            (voidSwordProc ? 50 : 0)) /
            100)
      );
    }
  }

  const { playerSideStatuses, filteredEnemyStatuses } =
    resolvePlayerSkillStatusApplication({
      skill,
      targetMaxHp: skill?.targetType === "self" ? player.maxHp : enemy.maxHp,
      enemy,
      passiveFlags,
      dealsDirectDamage,
      isCrit,
      currentTimeMs: 0,
      enemyHp: enemy.hp,
    });

  return buildPlayerWorldStrikeResult({
    damage,
    isCrit,
    skill,
    player,
    playerSideStatuses,
    filteredEnemyStatuses,
    passiveFlags,
    canonicalSkillId,
    hasSwordQiChain,
    swordTribulationActive,
    bodyFoundationStacks,
    voidSwordProc,
    dealsDirectDamage,
    timelineProfile,
  });
};

export const resolvePlayerWorldStrike = (
  player: PlayerCombatStats,
  enemy: Enemy,
  skill?: Skill
): WorldStrikeResult =>
  resolvePlayerWorldStrikeOutcome({
    player,
    enemy,
    skill,
    runtime: createPlayerWorldStrikeRuntime(player, enemy, skill),
  });
