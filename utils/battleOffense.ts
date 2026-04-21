import { ElementType, Enemy, EnemyRank, ProfessionType, Skill } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import {
  getArmorBreakMultiplier,
  getCritBoostValue,
  getDamageAmpMultiplier,
  getEnemyDamageReductionMultiplier,
  getVulnerableMultiplier,
  resolveDamage,
} from "./battleCombatMath";
import { getEnemyElementalModifier, getRestriction } from "./battleEncounter";
import type {
  EnemySpecialTimelineProfile,
  SkillTimelineProfile,
} from "./battleProfiles";
import {
  type PlayerPassiveFlags,
  getBodyFoundationBloodlineStacks,
  getSwordQiPassiveCritBonus,
  hasLearnedSkillId,
  hasSwordTribulationWindow,
  isManaSpringEmpowered,
} from "./battlePassives";
import {
  getEnemyAttackContext,
  getPlayerAttackContext,
} from "./battleWorldStrikeAttackContext";
import type { CombatStatusLike } from "./battleStatusTypes";

export const resolvePlayerOffenseRoll = ({
  player,
  enemy,
  activeSkill,
  activeSkillCanonicalId,
  activeSkillTimelineProfile,
  skillReady,
  passiveFlags,
  playerHp,
  playerMp,
  playerStatuses,
  enemyStatuses,
  bossBroken,
  playerDebuffed,
  mageFoundationStacks,
  swordHeartStacks,
  currentTimeMs,
}: {
  player: PlayerCombatStats;
  enemy: Enemy;
  activeSkill?: Skill;
  activeSkillCanonicalId?: string;
  activeSkillTimelineProfile?: SkillTimelineProfile;
  skillReady: boolean;
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerMp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  bossBroken: boolean;
  playerDebuffed: boolean;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  currentTimeMs: number;
}) => {
  const attackContext = getPlayerAttackContext(
    player,
    enemy,
    skillReady ? activeSkill : undefined
  );
  const pVsE = getRestriction(player.element, enemy.element);
  const enemyElementalAffinity = getEnemyElementalModifier(player.element, enemy);
  const dealsDirectDamage =
    !skillReady ||
    activeSkill!.effectType === "damage" ||
    activeSkill!.damageMultiplier !== undefined;

  let effectivePower = attackContext.power;
  let effectiveDefense =
    attackContext.defense * getArmorBreakMultiplier(enemyStatuses, currentTimeMs);
  const enemyVulnerableMultiplier = getVulnerableMultiplier(
    enemyStatuses,
    currentTimeMs
  );
  const bodyFoundationStacks = passiveFlags.hasBodyFoundationPassive
    ? getBodyFoundationBloodlineStacks(playerHp, player.maxHp)
    : 0;
  const voidSwordProc = passiveFlags.hasSwordVoidPassive && Math.random() < 0.1;
  if (voidSwordProc) {
    effectiveDefense = Math.max(1, effectiveDefense * 0.5);
  }

  if (pVsE.isEffective) effectivePower *= 1.12;
  if (pVsE.isResisted) effectivePower *= 0.88;
  effectivePower *= enemyElementalAffinity.multiplier;
  if (bossBroken) effectivePower *= 1.25;
  if (playerDebuffed) effectivePower *= 0.9;
  if (
    passiveFlags.hasMageQiPassive &&
    !skillReady &&
    player.profession === ProfessionType.Mage
  ) {
    effectivePower += player.magic * 0.28;
  }
  const swordTribulationActive = hasSwordTribulationWindow(
    playerHp,
    player.maxHp,
    passiveFlags
  );
  if (swordTribulationActive) {
    effectivePower *= 1.5;
  }
  if (
    passiveFlags.hasMageMahayanaPassive &&
    skillReady &&
    activeSkill!.profession === ProfessionType.Mage
  ) {
    effectivePower *= 1.4;
  }
  if (
    passiveFlags.hasMageFoundationPassive &&
    skillReady &&
    activeSkill!.profession === ProfessionType.Mage &&
    mageFoundationStacks > 0
  ) {
    effectivePower *= 1 + mageFoundationStacks * 0.1;
  }
  if (
    skillReady &&
    activeSkillCanonicalId === "m_tr_active" &&
    enemyStatuses.some(
      (status) =>
        status.id === "paralyze" && status.expiresAtMs > currentTimeMs
    )
  ) {
    effectivePower *= 1.5;
  }
  const manaSpringEmpowered = isManaSpringEmpowered(
    playerMp,
    player.maxMp,
    passiveFlags
  );
  if (manaSpringEmpowered) {
    effectivePower *= 1.2;
  }
  if (passiveFlags.hasSwordHeartPassive && swordHeartStacks > 0) {
    effectivePower *= 1 + swordHeartStacks * 0.03;
  }
  if (bodyFoundationStacks > 0) {
    effectivePower *= 1 + bodyFoundationStacks * 0.02;
  }
  effectivePower *= getDamageAmpMultiplier(playerStatuses, currentTimeMs);
  const hasSwordQiChain = hasLearnedSkillId(player.learnedSkills, "s_f_active");
  const activeSwordQiStatuses =
    skillReady && activeSkillCanonicalId === "s_tr_active"
      ? playerStatuses.filter(
          (status) =>
            status.kind === "critBoost" && status.expiresAtMs > currentTimeMs
        )
      : [];
  if (activeSwordQiStatuses.length > 0) {
    effectivePower *= 1 + activeSwordQiStatuses.length * 0.35;
  } else if (
    skillReady &&
    activeSkillCanonicalId === "s_tr_active" &&
    hasSwordQiChain
  ) {
    effectivePower *= 1.18;
  }

  const critRate = Math.min(
    95,
    player.crit +
      (passiveFlags.hasSwordMahayanaPassive ? 5 : 0) +
      (passiveFlags.hasSwordQiPassive ? getSwordQiPassiveCritBonus() : 0) +
      attackContext.critBonus +
      getCritBoostValue(playerStatuses, currentTimeMs)
  );
  const isCrit =
    swordTribulationActive ||
    (attackContext.canCrit && Math.random() * 100 < Math.max(0, critRate));

  let playerDamage = 0;
  const ignoreEnemyReduction =
    (skillReady && activeSkillCanonicalId === "s_tr_active") ||
    (!skillReady && passiveFlags.hasSwordEmperorPassive);
  if (dealsDirectDamage) {
    playerDamage = resolveDamage(
      effectivePower,
      ignoreEnemyReduction ? 0 : effectiveDefense
    );
    if (attackContext.damageBonus) {
      playerDamage = Math.floor(
        playerDamage * (1 + attackContext.damageBonus / 100)
      );
    }
    if (!ignoreEnemyReduction) {
      playerDamage = Math.floor(
        playerDamage * getEnemyDamageReductionMultiplier(enemy)
      );
    }
    playerDamage = Math.floor(playerDamage * enemyVulnerableMultiplier);
    if (skillReady) {
      playerDamage = Math.floor(
        playerDamage * (activeSkillTimelineProfile?.areaDamageModifier ?? 1)
      );
    }
    if (isCrit) {
      playerDamage = Math.floor(
        playerDamage *
          ((player.critDamage +
            attackContext.critDamageBonus +
            (voidSwordProc ? 50 : 0) +
            (passiveFlags.hasSwordMahayanaPassive ? 10 : 0)) /
            100)
      );
    }
    if (
      skillReady &&
      activeSkillCanonicalId === "b_vr_active" &&
      enemy.rank !== EnemyRank.Boss
    ) {
      playerDamage = Math.max(playerDamage, enemy.hp);
    }
  }

  return {
    attackContext,
    pVsE,
    enemyElementalAffinity,
    dealsDirectDamage,
    effectiveDefense,
    bodyFoundationStacks,
    voidSwordProc,
    swordTribulationActive,
    manaSpringEmpowered,
    hasSwordQiChain,
    activeSwordQiStatuses,
    isCrit,
    playerDamage,
  };
};

export const resolveEnemyOffenseRoll = ({
  enemy,
  player,
  enemyStatuses,
  playerStatuses,
  currentTimeMs,
  enemySpecialReady,
  enemySpecialTimelineProfile,
  passiveFlags,
  bodyTribulationStacks,
}: {
  enemy: Enemy;
  player: PlayerCombatStats;
  enemyStatuses: CombatStatusLike[];
  playerStatuses: CombatStatusLike[];
  currentTimeMs: number;
  enemySpecialReady: boolean;
  enemySpecialTimelineProfile?: EnemySpecialTimelineProfile;
  passiveFlags: PlayerPassiveFlags;
  bodyTribulationStacks: number;
}) => {
  const enemyContext = getEnemyAttackContext(enemy, player);
  const eVsP = getRestriction(enemy.element, player.element);
  const bodyFoundationStacks = passiveFlags.hasBodyFoundationPassive
    ? getBodyFoundationBloodlineStacks(player.hp, player.maxHp)
    : 0;

  let enemyPower = enemyContext.power;
  let playerDefense =
    enemyContext.defense * getArmorBreakMultiplier(playerStatuses, currentTimeMs);
  const playerVulnerableMultiplier = getVulnerableMultiplier(
    playerStatuses,
    currentTimeMs
  );

  if (passiveFlags.hasBodyTribulationPassive && bodyTribulationStacks > 0) {
    playerDefense *= 1 + Math.min(0.02 * bodyTribulationStacks, 1);
  }
  if (bodyFoundationStacks > 0) {
    playerDefense *= 1 + bodyFoundationStacks * 0.05;
  }
  if (eVsP.isEffective) enemyPower *= 1.12;
  if (eVsP.isResisted) enemyPower *= 0.88;
  if (passiveFlags.hasMageEmperorPassive && enemy.element !== ElementType.None) {
    enemyPower *= 0.8;
  }
  if (enemySpecialReady && enemy.specialAttack?.damageMultiplier) {
    enemyPower *= enemy.specialAttack.damageMultiplier;
    enemyPower *= enemySpecialTimelineProfile?.areaDamageModifier ?? 1;
  }

  const enemyCrit =
    enemyContext.canCrit &&
    Math.random() * 100 < Math.max(0, enemyContext.critBonus);
  let enemyDamage = resolveDamage(enemyPower, playerDefense);
  if (enemyContext.damageBonus) {
    enemyDamage = Math.floor(
      enemyDamage * (1 + enemyContext.damageBonus / 100)
    );
  }
  enemyDamage = Math.floor(enemyDamage * playerVulnerableMultiplier);
  if (enemyCrit) {
    enemyDamage = Math.floor(
      enemyDamage * ((150 + enemyContext.critDamageBonus) / 100)
    );
  }
  if (player.damageReduction > 0) {
    enemyDamage = Math.floor(
      enemyDamage * (1 - player.damageReduction / 100)
    );
  }

  const isDodge = Math.random() * 100 < player.dodge;
  const voidEvasion =
    passiveFlags.hasMageVoidPassive && !isDodge && Math.random() < 0.3;
  const isBlock = Math.random() * 100 < player.blockRate;

  return {
    enemyDamage,
    isDodge,
    voidEvasion,
    isBlock,
    bodyFoundationStacks,
    eVsP,
  };
};
