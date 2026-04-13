import {
  BaseAttributes,
  Enemy,
  CombatLog,
  MajorRealm,
  SpiritRootId,
  ElementType,
  EnemyRank,
  ItemInstance,
  ItemQuality,
  ProfessionType,
  Skill,
} from "../types";
import {
  REALM_BASE_STATS,
  SPIRIT_ROOT_DETAILS,
  SPIRIT_ROOT_TO_ELEMENT,
  ELEMENT_NAMES,
} from "../constants";
import { getItem } from "../data/items";
import { getDropRewards } from "../data/drop_tables";
import { getFormalSkillId, getSkill } from "../data/skills";
import { generateDrops } from "./dropSystem";

const formatSpiritStones = (amount: number): string => {
  if (amount <= 0) return "";

  const high = Math.floor(amount / 1000000);
  const medium = Math.floor((amount % 1000000) / 1000);
  const low = amount % 1000;

  const parts: string[] = [];
  if (high > 0) parts.push(`<stones q="2">${high} 上品 靈石</stones>`);
  if (medium > 0) parts.push(`<stones q="1">${medium} 中品 靈石</stones>`);
  if (low > 0) parts.push(`<stones q="0">${low} 下品 靈石</stones>`);

  return parts.join("，");
};

export interface PlayerCombatStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  magic: number;
  defense: number;
  res: number;
  speed: number;
  crit: number;
  critDamage: number;
  dodge: number;
  blockRate: number;
  damageReduction: number;
  alchemyBonus: number;
  craftingBonus: number;
  breakthroughBonus: number;
  dropRateBonus: number;
  cultivationSpeedBonus: number;
  name: string;
  element: ElementType;
  regenHp: number;
  profession: ProfessionType;
  learnedSkills: Skill[];
}

type AttackMode = "physical" | "magical" | "hybrid";

interface AttackContext {
  power: number;
  defense: number;
  critBonus: number;
  critDamageBonus: number;
  damageBonus: number;
  canCrit: boolean;
}

interface PassiveSkillBonuses {
  hpPercent: number;
  mpPercent: number;
  attackPercent: number;
  magicPercent: number;
  defensePercent: number;
  resPercent: number;
  critBonus: number;
  critDamageBonus: number;
  dodgeBonus: number;
  damageReductionBonus: number;
  regenHpBonus: number;
}

export interface WorldStrikeResult {
  damage: number;
  isCrit: boolean;
  skillName?: string;
  nextActionDelayMs: number;
  skillCooldownMs: number;
  executionTimeMs: number;
  playerStatusNames: string[];
  enemyStatusNames: string[];
  playerShieldGain: number;
  areaShape?: Skill["areaShape"];
  areaRadius?: number;
  maxTargets?: number;
  isProjectile: boolean;
}

export interface SkillTimelineProfile {
  cooldownSeconds: number;
  cooldownMs: number;
  executionTimeMs: number;
  areaShape: NonNullable<Skill["areaShape"]>;
  areaRadius: number;
  maxTargets: number;
  isProjectile: boolean;
  areaDamageModifier: number;
}

export interface EnemySpecialTimelineProfile {
  cooldownSeconds: number;
  cooldownMs: number;
  executionTimeMs: number;
  areaShape: NonNullable<Skill["areaShape"]>;
  areaRadius: number;
  maxTargets: number;
  isProjectile: boolean;
  areaDamageModifier: number;
}

type CombatStatusKind =
  | "incapacitate"
  | "burn"
  | "poison"
  | "bleed"
  | "armorBreak"
  | "critBoost"
  | "shield"
  | "reflect"
  | "drain";

interface CombatStatus {
  id: string;
  name: string;
  kind: CombatStatusKind;
  value: number;
  expiresAtMs: number;
  nextTickAtMs?: number;
}

const getEnemyElementalModifier = (
  attackerElement: ElementType,
  enemy: Enemy
): { multiplier: number; reason?: "resistance" | "weakness" } => {
  if (attackerElement === ElementType.None) {
    return { multiplier: 1 };
  }
  if (enemy.weaknesses?.includes(attackerElement)) {
    return { multiplier: 1.18, reason: "weakness" };
  }
  if (enemy.resistances?.includes(attackerElement)) {
    return { multiplier: 0.84, reason: "resistance" };
  }
  return { multiplier: 1 };
};

const hasEnemyAffix = (enemy: Enemy, affix: string) =>
  enemy.affixes?.includes(affix) ?? false;

const getEnemyDefenseMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "堅甲")) multiplier *= 1.1;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 1.05;
  return multiplier;
};

const getEnemyDamageReductionMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "霸體")) multiplier *= 0.97;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 0.98;
  return multiplier;
};

const getEnemyAttackPowerMultiplier = (enemy: Enemy) => {
  let multiplier = 1;
  if (hasEnemyAffix(enemy, "強襲")) multiplier *= 1.08;
  if (hasEnemyAffix(enemy, "統御")) multiplier *= 1.05;
  return multiplier;
};

type CombatLogSnapshotProvider = (
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

const getRestriction = (
  attacker: ElementType,
  defender: ElementType
): { isEffective: boolean; isResisted: boolean } => {
  if (attacker === ElementType.None || defender === ElementType.None) {
    return { isEffective: false, isResisted: false };
  }

  if (attacker === ElementType.Metal && defender === ElementType.Wood) {
    return { isEffective: true, isResisted: false };
  }
  if (attacker === ElementType.Wood && defender === ElementType.Earth) {
    return { isEffective: true, isResisted: false };
  }
  if (attacker === ElementType.Earth && defender === ElementType.Water) {
    return { isEffective: true, isResisted: false };
  }
  if (attacker === ElementType.Water && defender === ElementType.Fire) {
    return { isEffective: true, isResisted: false };
  }
  if (attacker === ElementType.Fire && defender === ElementType.Metal) {
    return { isEffective: true, isResisted: false };
  }

  if (defender === ElementType.Metal && attacker === ElementType.Wood) {
    return { isEffective: false, isResisted: true };
  }
  if (defender === ElementType.Wood && attacker === ElementType.Earth) {
    return { isEffective: false, isResisted: true };
  }
  if (defender === ElementType.Earth && attacker === ElementType.Water) {
    return { isEffective: false, isResisted: true };
  }
  if (defender === ElementType.Water && attacker === ElementType.Fire) {
    return { isEffective: false, isResisted: true };
  }
  if (defender === ElementType.Fire && attacker === ElementType.Metal) {
    return { isEffective: false, isResisted: true };
  }

  return { isEffective: false, isResisted: false };
};

const getAttackMode = (profession: ProfessionType): AttackMode => {
  switch (profession) {
    case ProfessionType.Mage:
      return "magical";
    case ProfessionType.Body:
      return "hybrid";
    default:
      return "physical";
  }
};

const getProfessionPassives = (profession: ProfessionType) => {
  switch (profession) {
    case ProfessionType.Sword:
      return {
        critBonus: 8,
        critDamageBonus: 45,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
    case ProfessionType.Body:
      return {
        critBonus: 0,
        critDamageBonus: 0,
        damageReductionBonus: 3,
        regenHpBonus: 0,
      };
    case ProfessionType.Mage:
      return {
        critBonus: 4,
        critDamageBonus: 20,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
    default:
      return {
        critBonus: 0,
        critDamageBonus: 0,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
  }
};

const getLearnedSkills = (learnedSkillIds: string[]): Skill[] =>
  learnedSkillIds
    .map((id) => getSkill(id))
    .filter((skill): skill is Skill => Boolean(skill))
    .sort((a, b) => b.minRealm - a.minRealm);

const getPassiveSkillBonuses = (
  learnedSkills: Skill[]
): PassiveSkillBonuses => {
  const bonuses: PassiveSkillBonuses = {
    hpPercent: 0,
    mpPercent: 0,
    attackPercent: 0,
    magicPercent: 0,
    defensePercent: 0,
    resPercent: 0,
    critBonus: 0,
    critDamageBonus: 0,
    dodgeBonus: 0,
    damageReductionBonus: 0,
    regenHpBonus: 0,
  };

  learnedSkills
    .filter((skill) => skill.type === "Passive" && skill.profession)
    .forEach((skill) => {
      if (getFormalSkillId(skill.id) === "b_q_passive") {
        return;
      }
      const tier = skill.minRealm + 1;

      switch (skill.profession) {
        case ProfessionType.Sword:
          bonuses.attackPercent += 4 + tier * 2;
          bonuses.critBonus += 1 + tier * 0.6;
          bonuses.critDamageBonus += 8 + tier * 3;
          break;
        case ProfessionType.Body:
          bonuses.hpPercent += 5 + tier * 3;
          bonuses.defensePercent += 4 + tier * 2;
          bonuses.damageReductionBonus += tier >= 2 ? 1 : 0;
          bonuses.damageReductionBonus += tier >= 6 ? 1 : 0;
          bonuses.regenHpBonus += tier >= 4 ? 1 : 0;
          break;
        case ProfessionType.Mage:
          bonuses.magicPercent += 6 + tier * 3;
          bonuses.mpPercent += 6 + tier * 4;
          bonuses.resPercent += 4 + tier * 2;
          bonuses.critDamageBonus += 4 + tier * 2;
          bonuses.dodgeBonus += tier >= 5 ? 1 : 0;
          break;
      }
    });

  return bonuses;
};

const getHighestActiveSkill = (
  profession: ProfessionType,
  learnedSkills: Skill[]
): Skill | undefined =>
  learnedSkills.find(
    (skill) => skill.profession === profession && skill.type === "Active"
  );

const hasPassiveSkillId = (learnedSkills: Skill[], skillId: string) =>
  learnedSkills.some(
    (skill) =>
      skill.type === "Passive" &&
      getFormalSkillId(skill.id) === getFormalSkillId(skillId)
  );

const hasLearnedSkillId = (learnedSkills: Skill[], skillId: string) =>
  learnedSkills.some(
    (skill) => getFormalSkillId(skill.id) === getFormalSkillId(skillId)
  );

type PlayerPassiveFlags = {
  hasSwordQiPassive: boolean;
  hasBodyQiPassive: boolean;
  hasMageQiPassive: boolean;
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
  hasSwordDeathWardPassive: boolean;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasBodyFoundationPassive: boolean;
  hasMageFoundationPassive: boolean;
  hasSwordGoldenPassive: boolean;
  hasSwordEchoPassive: boolean;
  hasSwordHeartPassive: boolean;
  hasBodySaintPassive: boolean;
  hasSwordFusionPassive: boolean;
  hasSwordVoidPassive: boolean;
  hasBodyFusionPassive: boolean;
  hasMageFusionPassive: boolean;
  hasBodyAncientPassive: boolean;
  hasMageVoidPassive: boolean;
  hasSwordTribulationPassive: boolean;
  hasBodyTribulationPassive: boolean;
  hasMageTribulationPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasBodyRebirthTruePassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageMahayanaPassive: boolean;
  hasMageImmortalPassive: boolean;
  hasSwordImmortalPassive: boolean;
  hasBodyEmperorPassive: boolean;
  hasSwordEmperorPassive: boolean;
  hasMageEmperorPassive: boolean;
};

const PLAYER_PASSIVE_FLAG_SKILL_IDS: Record<keyof PlayerPassiveFlags, string> = {
  hasSwordQiPassive: "s_q_passive",
  hasBodyQiPassive: "b_q_passive",
  hasMageQiPassive: "m_q_passive",
  hasReflectPassive: "b_g_passive",
  hasInitialShieldPassive: "m_g_passive",
  hasSwordDeathWardPassive: "s_n_passive",
  hasBodyRebirthPassive: "b_n_passive",
  hasManaSpringPassive: "m_n_passive",
  hasBodyFoundationPassive: "b_f_passive",
  hasMageFoundationPassive: "m_f_passive",
  hasSwordGoldenPassive: "s_g_passive",
  hasSwordEchoPassive: "s_sf_passive",
  hasSwordHeartPassive: "s_f_passive",
  hasBodySaintPassive: "b_sf_passive",
  hasSwordFusionPassive: "s_bi_passive",
  hasSwordVoidPassive: "s_vr_passive",
  hasBodyFusionPassive: "b_bi_passive",
  hasMageFusionPassive: "m_bi_passive",
  hasBodyAncientPassive: "b_vr_passive",
  hasMageVoidPassive: "m_vr_passive",
  hasSwordTribulationPassive: "s_tr_passive",
  hasBodyTribulationPassive: "b_tr_passive",
  hasMageTribulationPassive: "m_tr_passive",
  hasBodyImmortalPassive: "b_im_passive",
  hasBodyRebirthTruePassive: "b_ma_passive",
  hasSwordMahayanaPassive: "s_ma_passive",
  hasMageMahayanaPassive: "m_ma_passive",
  hasMageImmortalPassive: "m_im_passive",
  hasSwordImmortalPassive: "s_im_passive",
  hasBodyEmperorPassive: "b_ie_passive",
  hasSwordEmperorPassive: "s_ie_passive",
  hasMageEmperorPassive: "m_ie_passive",
};

const getPlayerPassiveFlags = (learnedSkills: Skill[]): PlayerPassiveFlags =>
  Object.fromEntries(
    Object.entries(PLAYER_PASSIVE_FLAG_SKILL_IDS).map(([flagName, skillId]) => [
      flagName,
      hasPassiveSkillId(learnedSkills, skillId),
    ])
  ) as PlayerPassiveFlags;

const getCanonicalSkillId = (skill?: Skill) =>
  skill ? getFormalSkillId(skill.id) : undefined;

const getBodyFoundationBloodlineStacks = (
  currentHp: number,
  maxHp: number
) => {
  if (maxHp <= 0) return 0;
  const missingRatio = Math.max(0, 1 - currentHp / maxHp);
  return Math.max(0, Math.min(9, Math.floor(missingRatio / 0.1)));
};

const getSwordQiPassiveCritBonus = () => 3;

const createSwordQiArmorBreakStatus = (currentTimeMs: number): CombatStatus => ({
  id: "sword_meridian_break",
  name: "劍脈破甲",
  kind: "armorBreak",
  value: 0.08,
  expiresAtMs: currentTimeMs + 2000,
  nextTickAtMs: undefined,
});

const getCopperSkinReductionMultiplier = () => 0.97;

const getMageQiCycleRecovery = (maxMp: number) =>
  Math.max(1, Math.floor(maxMp * 0.12));

const hasSwordTribulationWindow = (
  currentHp: number,
  maxHp: number,
  passiveFlags: Pick<PlayerPassiveFlags, "hasSwordTribulationPassive">
) => passiveFlags.hasSwordTribulationPassive && currentHp <= maxHp * 0.2;

const getEnemyWorldPassiveStatusNames = (
  options: {
    passiveFlags: PlayerPassiveFlags;
    prePassiveDamage: number;
    playerMaxHp: number;
    voidEvasion: boolean;
    bodyFoundationStacks: number;
    copperSkinTriggered: boolean;
    bodyFusionTriggered: boolean;
    elementalBarrierTriggered: boolean;
    reflectTriggered: boolean;
    enemyElement: ElementType;
    bodyTribulationTriggered: boolean;
    mageTribulationTriggered: boolean;
    bodyRebirthTrueTriggered: boolean;
    swordDeathWardTriggered: boolean;
    bodyEmperorTriggered: boolean;
  }
) => {
  const statusNames: string[] = [];
  const {
    passiveFlags,
    prePassiveDamage,
    playerMaxHp,
    voidEvasion,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
    enemyElement,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    bodyRebirthTrueTriggered,
    swordDeathWardTriggered,
    bodyEmperorTriggered,
  } = options;

  if (swordDeathWardTriggered) {
    statusNames.push("護體劍罡");
  }

  if (reflectTriggered) {
    statusNames.push("反震");
  }

  if (bodyFoundationStacks > 0) {
    statusNames.push("蠻荒血脈");
  }

  if (copperSkinTriggered) {
    statusNames.push("銅皮鐵骨");
  }

  if (bodyFusionTriggered) {
    statusNames.push("金剛法相");
  }

  if (passiveFlags.hasBodySaintPassive && prePassiveDamage > 0) {
    statusNames.push("肉身成聖");
  }

  if (elementalBarrierTriggered) {
    statusNames.push("元素護盾");
  }

  if (bodyTribulationTriggered) {
    statusNames.push("萬劫不滅");
  }

  if (mageTribulationTriggered && enemyElement === ElementType.Metal) {
    statusNames.push("雷劫煉心");
  }

  if (bodyRebirthTrueTriggered) {
    statusNames.push("滴血重生");
  }

  if (bodyEmperorTriggered) {
    statusNames.push("不死不滅");
  }

  if (voidEvasion) {
    statusNames.push("空間法則");
  }

  return statusNames;
};

const getResolvedEnemyWorldIncomingStatuses = ({
  special,
  player,
  passiveFlags,
}: {
  special?: Enemy["specialAttack"];
  player: PlayerCombatStats;
  passiveFlags: PlayerPassiveFlags;
}) => {
  const createdStatuses = resolveNormalizedEnemySpecialStatuses(
    special,
    player.maxHp,
    0
  );

  const filteredStatuses = createdStatuses.filter((status) => {
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

  return {
    filteredStatuses,
    bodyImmortalTriggered,
    swordEmperorTriggered,
  };
};

const resolveIncomingEnemySpecialStatuses = ({
  special,
  player,
  passiveFlags,
  currentTimeMs,
  shortenControlDuration,
}: {
  special?: Enemy["specialAttack"];
  player: PlayerCombatStats;
  passiveFlags: PlayerPassiveFlags;
  currentTimeMs: number;
  shortenControlDuration: boolean;
}) => {
  const incomingStatuses = getResolvedEnemyWorldIncomingStatuses({
    special,
    player,
    passiveFlags,
  });

  const normalizedIncomingStatuses = incomingStatuses.filteredStatuses
    .map((status) => {
      if (shortenControlDuration && status.kind === "incapacitate") {
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
  };
};

const logEnemySpecialImmunityTriggers = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  bodyImmortalTriggered,
  swordEmperorTriggered,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  bodyImmortalTriggered: boolean;
  swordEmperorTriggered: boolean;
}) => {
  if (bodyImmortalTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【仙體無垢】你直接免疫了持續傷害侵蝕。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (swordEmperorTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【萬法皆空】你不受任何負面狀態束縛。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }
};

const getEnemyWorldPassiveTriggerState = (options: {
  enemy: Enemy;
  player: PlayerCombatStats;
  passiveFlags: PlayerPassiveFlags;
  damage: number;
  useSpecial: boolean;
  special?: Enemy["specialAttack"];
}) => {
  const { enemy, player, passiveFlags, useSpecial, special } = options;
  let damage = options.damage;
  const reflectTriggered =
    passiveFlags.hasReflectPassive &&
    damage > 0 &&
    (enemy.attackRange ?? 1) <= 1;
  const bodyFoundationStacks = getBodyFoundationBloodlineStacks(player.hp, player.maxHp);

  if (options.special?.damageMultiplier) {
    // damage bonus has already been folded into the incoming value before this helper runs.
  }

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
    Boolean(special) &&
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

const getPlayerWorldPassiveStatusNames = (options: {
  passiveFlags: PlayerPassiveFlags;
  player: PlayerCombatStats;
  skill?: Skill;
  isCrit: boolean;
  dealsDirectDamage: boolean;
  canonicalSkillId?: string;
  hasSwordQiChain: boolean;
  swordTribulationActive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
}) => {
  const {
    passiveFlags,
    player,
    skill,
    isCrit,
    dealsDirectDamage,
    canonicalSkillId,
    hasSwordQiChain,
    swordTribulationActive,
    bodyFoundationStacks,
    voidSwordProc,
  } = options;

  const statusNames: string[] = [];

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageMahayanaPassive) {
    statusNames.push("言出法隨");
  }

  if (passiveFlags.hasSwordMahayanaPassive && isCrit) {
    statusNames.push("劍道獨尊");
  }

  if (swordTribulationActive) {
    statusNames.push("向死而生");
  }

  if (canonicalSkillId === "s_tr_active" && hasSwordQiChain) {
    statusNames.push("萬劍歸一");
  }

  if (bodyFoundationStacks > 0) {
    statusNames.push("蠻荒血脈");
  }

  if (!skill && passiveFlags.hasMageQiPassive && player.profession === ProfessionType.Mage) {
    statusNames.push("靈潮循環");
  }

  if (passiveFlags.hasManaSpringPassive && player.mp >= player.maxMp * 0.8) {
    statusNames.push("法力源泉");
  }

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageFoundationPassive) {
    statusNames.push("靈力湧動");
  }

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageFusionPassive) {
    statusNames.push("五氣朝元");
  }

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageImmortalPassive) {
    statusNames.push("仙法通神");
  }

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageEmperorPassive) {
    statusNames.push("萬法歸宗");
  }

  if (!skill && passiveFlags.hasSwordEmperorPassive && dealsDirectDamage) {
    statusNames.push("萬法皆空");
  }

  if (
    passiveFlags.hasSwordQiPassive &&
    isCrit &&
    dealsDirectDamage &&
    skill?.profession === ProfessionType.Sword
  ) {
    statusNames.push("劍脈初成");
  }

  if (voidSwordProc) {
    statusNames.push("法則之劍");
  }

  return statusNames;
};

const getPlayerAttackContext = (
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

  if (skill?.profession === ProfessionType.Mage) {
    damageBonus += 12;
  }
  if (skill?.profession === ProfessionType.Body) {
    damageBonus += 4;
  }

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

const getEnemyAttackContext = (
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

const resolveDamage = (
  power: number,
  defense: number,
  varianceMin = 0.92,
  varianceMax = 1.08
): number => {
  const mitigation = 100 / (100 + Math.max(0, defense));
  const variance = varianceMin + Math.random() * (varianceMax - varianceMin);
  return Math.max(1, Math.floor(power * mitigation * variance));
};

const getPlayerAttackIntervalMs = (player: PlayerCombatStats) => {
  const baseByProfession: Record<ProfessionType, number> = {
    [ProfessionType.None]: 1450,
    [ProfessionType.Sword]: 1280,
    [ProfessionType.Body]: 1450,
    [ProfessionType.Mage]: 1260,
  };

  const base = baseByProfession[player.profession] ?? 1450;
  const speedReduction = Math.min(520, player.speed * 14);
  return Math.max(520, base - speedReduction);
};

const getEnemyAttackIntervalMs = (enemy: Enemy) => {
  const rankBase: Record<EnemyRank, number> = {
    [EnemyRank.Common]: 1550,
    [EnemyRank.Elite]: 1380,
    [EnemyRank.Boss]: 1260,
  };

  const rangePenalty = (enemy.attackRange ?? 1) > 1 ? 120 : 0;
  const affixReduction = hasEnemyAffix(enemy, "迅影") ? 120 : 0;
  return Math.max(650, rankBase[enemy.rank] + rangePenalty - affixReduction);
};

const getCombatStatusSnapshot = (
  statuses: CombatStatus[],
  timeMs: number
): string[] => {
  const labels = statuses
    .filter((status) => {
      if (status.kind === "shield") {
        return status.expiresAtMs > timeMs && status.value > 0;
      }
      return status.expiresAtMs > timeMs;
    })
    .map((status) => {
      const mapped = getStatusLabel(status.id);
      return mapped === status.id ? status.name : mapped;
    });

  return Array.from(new Set(labels));
};

const pushCombatLog = (logs: CombatLog[], log: CombatLog) => {
  const snapshotTimeMs = log.timeMs ?? 0;
  const snapshots = combatLogSnapshotProvider?.(snapshotTimeMs);
  logs.push({
    ...log,
    ...(snapshots ?? {}),
  });
};

const getStatusLabel = (statusId: string) => {
  switch (statusId) {
    case "stun":
      return "暈眩";
    case "freeze":
      return "凍結";
    case "paralyze":
      return "麻痺";
    case "banish":
      return "放逐";
    case "burn":
    case "true_fire_burn":
      return "燃燒";
    case "poison":
      return "中毒";
    case "bleed":
      return "流血";
    case "earth_shatter_debuff":
    case "armorBreak":
      return "破甲";
    case "reflect_taunt":
      return "反震";
    case "taunt":
      return "嘲諷";
    case "god_kingdom":
      return "神國侵蝕";
    case "sword_qi":
      return "劍氣";
    default:
      return statusId;
  }
};

const kindToStatusMessage = (
  status: CombatStatus,
  targetIsPlayer: boolean,
  enemy: Enemy
) => {
  if (status.kind === "incapacitate") {
    return targetIsPlayer
      ? `你陷入【${status.name}】，行動受制。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 陷入【${status.name}】！`;
  }

  if (status.kind === "armorBreak") {
    return targetIsPlayer
      ? `你被施加【${status.name}】，護體被削弱！`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】，護體被削弱！`;
  }

  if (status.kind === "critBoost") {
    return targetIsPlayer
      ? `你凝聚了【${status.name}】，下一輪劍勢更加凌厲。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 凝聚了【${status.name}】。`;
  }

  if (
    status.kind === "burn" ||
    status.kind === "poison" ||
    status.kind === "bleed" ||
    status.kind === "drain"
  ) {
    return targetIsPlayer
      ? `你被施加【${status.name}】！`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】！`;
  }

  if (status.kind === "shield") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，可抵擋 ${Math.floor(status.value)} 點傷害。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 獲得了【${status.name}】。`;
  }

  return targetIsPlayer
    ? `你受到【${status.name}】影響。`
    : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 受到【${status.name}】影響。`;
};

const getSkillExecutionTimeMs = (skill?: Skill) => {
  if (!skill) return 0;

  const castTimeMs = skill.castTimeMs ?? 0;
  const travelTimeMs =
    skill.projectileSpeed && skill.projectileSpeed > 0 && (skill.castRange ?? 0) > 1
      ? Math.round(((skill.castRange ?? 0) * 180) / skill.projectileSpeed)
      : 0;

  return castTimeMs + travelTimeMs;
};

export const getSkillTimelineProfile = (
  skill?: Skill
): SkillTimelineProfile => {
  const cooldownSeconds = skill?.cooldownSeconds ?? skill?.cooldown ?? 0;
  const areaShape =
    skill?.areaShape ??
    (skill?.targetType === "self"
      ? "self"
      : skill?.targetType === "all"
        ? "circle"
        : "single");
  const areaRadius = skill?.areaRadius ?? 0;
  const maxTargets =
    skill?.maxTargets ?? (skill?.targetType === "all" ? 3 : 1);
  const executionTimeMs = getSkillExecutionTimeMs(skill);

  return {
    cooldownSeconds,
    cooldownMs: Math.floor(cooldownSeconds * 1000),
    executionTimeMs,
    areaShape,
    areaRadius,
    maxTargets,
    isProjectile: Boolean(skill?.projectileSpeed && (skill.castRange ?? 0) > 1),
    areaDamageModifier: getAreaShapeDamageModifier(skill),
  };
};

export const getResolvedSkillCooldownSeconds = (
  skill: Skill | undefined,
  learnedSkillIdsOrSkills: string[] | Skill[] = []
) => {
  if (!skill) return 0;

  const baseCooldownSeconds = getSkillTimelineProfile(skill).cooldownSeconds;
  const learnedSkills =
    learnedSkillIdsOrSkills.length > 0 &&
    typeof learnedSkillIdsOrSkills[0] !== "string"
      ? (learnedSkillIdsOrSkills as Skill[])
      : getLearnedSkills(learnedSkillIdsOrSkills as string[]);
  const hasExplicitCooldownReductionPassive = hasPassiveSkillId(
    learnedSkills,
    "m_sf_passive"
  );

  return hasExplicitCooldownReductionPassive
    ? Math.max(1, baseCooldownSeconds - 1)
    : baseCooldownSeconds;
};

const getAreaShapeDamageModifier = (skill?: Skill) => {
  if (!skill || skill.targetType === "self") return 1;

  const shape = skill.areaShape ?? (skill.targetType === "all" ? "circle" : "single");
  if (shape === "single" || shape === "self") return 1;

  const baseByShape: Record<NonNullable<Skill["areaShape"]>, number> = {
    single: 1,
    self: 1,
    line: 0.96,
    cone: 0.91,
    circle: 0.86,
  };

  const base = baseByShape[shape] ?? 0.9;
  const radiusBonus = Math.min(0.08, (skill.areaRadius ?? 0) * 0.025);
  const targetPenalty = Math.min(
    0.2,
    Math.max(0, (skill.maxTargets ?? (skill.targetType === "all" ? 3 : 1)) - 1) * 0.03
  );

  return Math.max(0.7, Math.min(1.02, base + radiusBonus - targetPenalty));
};

const getEnemyAreaDamageModifier = (
  specialAttack?: Enemy["specialAttack"]
) => {
  if (!specialAttack) return 1;

  const shape = specialAttack.areaShape ?? "single";
  if (shape === "single" || shape === "self") return 1;

  const baseByShape: Record<NonNullable<Skill["areaShape"]>, number> = {
    single: 1,
    self: 1,
    line: 0.96,
    cone: 0.91,
    circle: 0.86,
  };

  const base = baseByShape[shape] ?? 0.9;
  const radiusBonus = Math.min(0.08, (specialAttack.areaRadius ?? 0) * 0.025);
  const targetPenalty = Math.min(
    0.2,
    Math.max(0, (specialAttack.maxTargets ?? 1) - 1) * 0.03
  );

  return Math.max(0.7, Math.min(1.02, base + radiusBonus - targetPenalty));
};

export const getEnemySpecialTimelineProfile = (
  enemy: Enemy
): EnemySpecialTimelineProfile => {
  const special = enemy.specialAttack;
  const cooldownSeconds = special?.cooldownSeconds ?? 0;
  const areaShape = special?.areaShape ?? "single";
  const areaRadius = special?.areaRadius ?? 0;
  const maxTargets = special?.maxTargets ?? 1;

  return {
    cooldownSeconds,
    cooldownMs: Math.floor(cooldownSeconds * 1000),
    executionTimeMs:
      special?.castTimeMs ?? ((enemy.attackRange ?? 1) > 1 ? 260 : 120),
    areaShape,
    areaRadius,
    maxTargets,
    isProjectile: Boolean((enemy.attackRange ?? 1) > 1),
    areaDamageModifier: getEnemyAreaDamageModifier(special),
  };
};

export const getResolvedEnemySpecialCooldownSeconds = (enemy: Enemy) =>
  getEnemySpecialTimelineProfile(enemy).cooldownSeconds;

const buildStatusesFromEnemySpecial = (
  specialAttack?: Enemy["specialAttack"],
  targetMaxHp?: number
): CombatStatus[] => {
  if (!specialAttack?.statusEffect) return [];

  const { id, duration, chance, value } = specialAttack.statusEffect;
  if (Math.random() > chance) return [];

  let kind: CombatStatusKind = "incapacitate";
  if (id === "burn" || id === "true_fire_burn") kind = "burn";
  else if (id === "poison") kind = "poison";
  else if (id === "bleed") kind = "bleed";
  else if (id === "armorBreak") kind = "armorBreak";
  else if (id === "drain") kind = "drain";

  return [
    {
      id,
      name: getStatusLabel(id),
      kind,
      value:
        value ??
        (kind === "burn"
          ? 0.02
          : kind === "poison"
            ? 0.018
            : kind === "bleed"
              ? 0.015
              : kind === "armorBreak"
                ? 0.1
                : kind === "drain"
                  ? 0.04
                  : targetMaxHp ?? 0),
      expiresAtMs: duration * 1000,
      nextTickAtMs:
        kind === "burn" ||
        kind === "poison" ||
        kind === "bleed" ||
        kind === "drain"
          ? 1000
          : undefined,
    },
  ];
};

const getArmorBreakMultiplier = (statuses: CombatStatus[], currentTimeMs: number) => {
  const totalBreak = statuses
    .filter(
      (status) =>
        status.kind === "armorBreak" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);

  return Math.max(0.2, 1 - totalBreak);
};

const hasIncapacitatingStatus = (
  statuses: CombatStatus[],
  currentTimeMs: number
) =>
  statuses.some(
    (status) =>
      status.kind === "incapacitate" && status.expiresAtMs > currentTimeMs
  );

const absorbDamageWithShield = (
  statuses: CombatStatus[],
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

const getReflectValue = (statuses: CombatStatus[], currentTimeMs: number) =>
  statuses
    .filter(
      (status) => status.kind === "reflect" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);

const getInitialPassiveStatuses = ({
  hasReflectPassive,
  hasInitialShieldPassive,
}: {
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
}) => {
  const statuses: CombatStatus[] = [];

  if (hasReflectPassive) {
    statuses.push({
      id: "thorn_reflect",
      name: "荊棘反震",
      kind: "reflect",
      value: 0.15,
      expiresAtMs: Number.MAX_SAFE_INTEGER,
    });
  }

  if (hasInitialShieldPassive) {
    statuses.push({
      id: "elemental_barrier",
      name: "元素護盾",
      kind: "shield",
      value: 1,
      expiresAtMs: Number.MAX_SAFE_INTEGER,
    });
  }

  return statuses;
};

const getInitialPassiveBattleLogMessages = ({
  hasReflectPassive,
  hasInitialShieldPassive,
}: {
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
}) => {
  const messages: string[] = [];

  if (hasReflectPassive) {
    messages.push("【荊棘皮層】已覆上體表，只待近身來敵反震自傷。");
  }

  if (hasInitialShieldPassive) {
    messages.push("戰鬥開始時，你獲得了【元素護盾】。");
  }

  return messages;
};

const getCombatOpeningMessages = (options: {
  player: PlayerCombatStats;
  enemy: Enemy;
  restriction: { isEffective: boolean; isResisted: boolean };
  elementalAffinity: { multiplier: number; reason?: "resistance" | "weakness" };
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
  hasMageImmortalPassive: boolean;
  hasMageEmperorPassive: boolean;
}) => {
  const {
    player,
    enemy,
    restriction,
    elementalAffinity,
    hasReflectPassive,
    hasInitialShieldPassive,
    hasMageImmortalPassive,
    hasMageEmperorPassive,
  } = options;
  const messages: string[] = [];

  if (player.element !== ElementType.None && enemy.element !== ElementType.None) {
    if (restriction.isEffective) {
      messages.push(
        `屬性克制：你的【${ELEMENT_NAMES[player.element]}】克制了敵方的【${ELEMENT_NAMES[enemy.element]}】！攻擊更易穿透對方護體。`
      );
    }
    if (restriction.isResisted) {
      messages.push(
        `屬性受制：你的【${ELEMENT_NAMES[player.element]}】受到敵方【${ELEMENT_NAMES[enemy.element]}】壓制，輸出略有削弱。`
      );
    }
    if (elementalAffinity.reason === "weakness") {
      messages.push(
        `弱點洞察：敵方對【${ELEMENT_NAMES[player.element]}】存在明顯弱點，造成的直接傷害將額外提升。`
      );
    } else if (elementalAffinity.reason === "resistance") {
      messages.push(
        `元素抗性：敵方對【${ELEMENT_NAMES[player.element]}】具備抗性，造成的直接傷害會被部分削減。`
      );
    }
  }

  messages.push(
    ...getInitialPassiveBattleLogMessages({
      hasReflectPassive,
      hasInitialShieldPassive,
    })
  );

  if (hasMageImmortalPassive) {
    messages.push("【仙法通神】法則共鳴已展開，術式有機會再次應現。");
  }

  if (hasMageEmperorPassive) {
    messages.push("【萬法歸宗】先天法則壓制降下，敵方術式運轉被延後。");
  }

  return messages;
};

const getPassiveRegenMessages = (options: {
  healAmount: number;
  manaAmount: number;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
}) => {
  const {
    healAmount,
    manaAmount,
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
  } = options;

  return {
    healMessage:
      healAmount > 0
        ? hasBodyRebirthPassive
          ? `【滴血重生】血肉自衍，你回復了 ${healAmount} 點氣血。`
          : hasMageFusionPassive
            ? `【五氣朝元】五氣回流護住周身，你回復了 ${healAmount} 點氣血。`
            : `氣血流轉，你回復了 ${healAmount} 點氣血。`
        : "",
    manaMessage:
      manaAmount > 0
        ? hasManaSpringPassive
          ? `【法力源泉】靈海回湧，你回復了 ${manaAmount} 點靈力。`
          : hasMageFusionPassive
            ? `【五氣朝元】五氣朝元不息，你回復了 ${manaAmount} 點靈力。`
            : `法力源泉湧動，你回復了 ${manaAmount} 點靈力。`
        : "",
  };
};

const getPlayerActivePassiveProcMessages = (options: {
  player: PlayerCombatStats;
  enemy: Enemy;
  currentTimeMs: number;
  playerHp: number;
  enemyHp: number;
  skillReady: boolean;
  activeSkill?: Skill;
  isCrit: boolean;
  manaSpringEmpowered: boolean;
  hasMageMahayanaPassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageQiPassive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
}) => {
  const {
    player,
    enemy,
    currentTimeMs,
    playerHp,
    enemyHp,
    skillReady,
    activeSkill,
    isCrit,
    manaSpringEmpowered,
    hasMageMahayanaPassive,
    hasSwordMahayanaPassive,
    hasMageQiPassive,
    bodyFoundationStacks,
    voidSwordProc,
  } = options;

  const messages: string[] = [];

  if (manaSpringEmpowered) {
    messages.push("【法力源泉】靈海盈滿，你的術式威能暴漲。");
  }

  if (hasMageMahayanaPassive && skillReady && activeSkill?.profession === ProfessionType.Mage) {
    messages.push("【言出法隨】一言牽動萬法，主動術式威能被再度拔升。");
  }

  if (voidSwordProc) {
    messages.push("【法則之劍】劍勢洞穿護體，這一擊額外撕開敵方防禦並抬升暴傷上限。");
  }

  if (hasSwordMahayanaPassive && isCrit) {
    messages.push("【劍道獨尊】單體劍勢攀至極處，暴擊威能再被推上一層。");
  }

  if (hasMageQiPassive && !skillReady && player.profession === ProfessionType.Mage) {
    messages.push("【靈潮循環】法力餘波裹住普攻，讓空窗期不致斷勢。");
  }

  if (bodyFoundationStacks > 0) {
    messages.push(`【蠻荒血脈】氣血越低，凶性越盛，當前 ${bodyFoundationStacks} 層血脈沸騰同步拔高攻勢。`);
  }

  return messages.map((message) => ({
    turn: 0,
    timeMs: currentTimeMs,
    isPlayer: true as const,
    message,
    damage: 0,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  }));
};

const logShieldAbsorption = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  absorbed,
  sourceName,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  absorbed: number;
  sourceName?: string;
}) => {
  if (absorbed <= 0) return;

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: sourceName
      ? `【${sourceName}】替你抵擋了 <dmg>${absorbed}</dmg> 點傷害。`
      : `護盾替你抵擋了 <dmg>${absorbed}</dmg> 點傷害。`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

const logReflectRetaliation = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  reflected,
  enemy,
  sourceName,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  reflected: number;
  enemy: Enemy;
  sourceName?: string;
}) => {
  if (reflected <= 0) return;

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: sourceName
      ? `【${sourceName}】於近身交鋒間反震回敬 <enemy rank="${enemy.rank}">${enemy.name}</enemy>，造成 <dmg>${reflected}</dmg> 點傷害！`
      : `你以護體反震回敬 <enemy rank="${enemy.rank}">${enemy.name}</enemy>，造成 <dmg>${reflected}</dmg> 點傷害！`,
    damage: reflected,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

const applySwordDeathWardTrigger = ({
  shouldTrigger,
  logs,
  turn,
  timeMs,
  preventedDamage,
  playerHp,
  playerMaxHp,
  playerMp,
  enemyHp,
  enemyMaxHp,
  enemy,
}: {
  shouldTrigger: boolean;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  preventedDamage: number;
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemy: Enemy;
}) => {
  if (!shouldTrigger) {
    return {
      playerMp,
      enemyHp,
      enemyDamage: undefined as number | undefined,
      triggered: false,
    };
  }

  const prevented = preventedDamage;
  const reflected = Math.max(1, prevented);
  const nextEnemyHp = Math.max(0, enemyHp - reflected);

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: `【護體劍罡】於生死一線間展開，你耗盡靈力擋下致命一擊，並反震 <enemy rank="${enemy.rank}">${enemy.name}</enemy> <dmg>${reflected}</dmg> 點傷害！`,
    damage: reflected,
    playerHp,
    playerMaxHp,
    enemyHp: nextEnemyHp,
    enemyMaxHp,
  });

  return {
    playerMp: 0,
    enemyHp: nextEnemyHp,
    enemyDamage: 0,
    triggered: true,
  };
};

const applyFatalSurvivalPassives = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  bodyRebirthTrueAvailable,
  bodyEmperorAvailable,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatus[];
  bodyRebirthTrueAvailable: boolean;
  bodyEmperorAvailable: boolean;
}) => {
  let nextPlayerHp = playerHp;
  let nextPlayerStatuses = playerStatuses;
  let bodyRebirthTrueTriggered = false;
  let bodyEmperorTriggered = false;

  if (bodyRebirthTrueAvailable && nextPlayerHp <= 0) {
    bodyRebirthTrueTriggered = true;
    nextPlayerHp = Math.floor(playerMaxHp * 0.5);
    nextPlayerStatuses = [
      ...nextPlayerStatuses,
      {
        id: "true_rebirth_guard",
        name: "滴血重生",
        kind: "shield",
        value: 999999,
        expiresAtMs: timeMs + 3000,
      },
    ];
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【滴血重生（真）】逆轉死劫，你恢復了大量氣血並短暫無敵。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (bodyEmperorAvailable && nextPlayerHp <= 0) {
    bodyEmperorTriggered = true;
    nextPlayerHp = 1;
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【不死不滅】強行續住最後一線生機。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return {
    playerHp: nextPlayerHp,
    playerStatuses: nextPlayerStatuses,
    bodyRebirthTrueTriggered,
    bodyEmperorTriggered,
  };
};

const getIncomingDefensivePassiveMessages = (options: {
  bodyFoundationStacks: number;
  copperSkinReduced: number;
  bodyFusionReduced: number;
  bodySaintReduced: number;
  elementalBarrierBlocked: boolean;
}) => {
  const messages: string[] = [];
  const {
    bodyFoundationStacks,
    copperSkinReduced,
    bodyFusionReduced,
    bodySaintReduced,
    elementalBarrierBlocked,
  } = options;

  if (bodyFoundationStacks > 0) {
    messages.push(
      `【蠻荒血脈】傷勢越深，肉身越堅，當前 ${bodyFoundationStacks} 層血脈沸騰抬升了護體。`
    );
  }

  if (copperSkinReduced > 0) {
    messages.push(`【銅皮鐵骨】硬生生化去 <dmg>${copperSkinReduced}</dmg> 點傷害。`);
  }

  if (bodyFusionReduced > 0) {
    messages.push(`【金剛法相】卸去 <dmg>${bodyFusionReduced}</dmg> 點最終傷害。`);
  }

  if (bodySaintReduced > 0) {
    messages.push(`【肉身成聖】化去重擊，減少了 <dmg>${bodySaintReduced}</dmg> 點傷害。`);
  }

  if (elementalBarrierBlocked) {
    messages.push("【元素護盾】完整化去了一次術式傷害。");
  }

  return messages;
};

const isNegativeStatusKind = (kind: CombatStatus["kind"]) =>
  [
    "burn",
    "poison",
    "bleed",
    "drain",
    "incapacitate",
    "armorBreak",
  ].includes(kind);

const isDotStatusKind = (kind: CombatStatus["kind"]) =>
  ["burn", "poison", "bleed"].includes(kind);

const getCritBoostValue = (statuses: CombatStatus[], currentTimeMs: number) =>
  statuses
    .filter(
      (status) => status.kind === "critBoost" && status.expiresAtMs > currentTimeMs
    )
    .reduce((sum, status) => sum + status.value, 0);

const buildStatusesFromSkill = (
  skill: Skill,
  targetMaxHp: number
): CombatStatus[] => {
  const statuses: CombatStatus[] = [];
  const expiresAtMs = (skill.statusEffect?.duration ?? 0) * 1000;
  const canonicalSkillId = getCanonicalSkillId(skill);

  if (skill.statusEffect) {
    const base = {
      id: skill.statusEffect.id,
      name: getStatusLabel(skill.statusEffect.id),
      value: skill.statusEffect.value ?? 0,
      expiresAtMs,
      nextTickAtMs: 1000,
    };

    switch (skill.statusEffect.id) {
      case "stun":
      case "freeze":
      case "paralyze":
      case "banish":
        statuses.push({ ...base, kind: "incapacitate" });
        break;
      case "true_fire_burn":
      case "burn":
        statuses.push({ ...base, kind: "burn" });
        break;
      case "poison":
        statuses.push({ ...base, kind: "poison" });
        break;
      case "bleed":
        statuses.push({ ...base, kind: "bleed" });
        break;
      case "earth_shatter_debuff":
      case "armorBreak":
        statuses.push({
          ...base,
          kind: "armorBreak",
          value: skill.statusEffect.value ?? 0.3,
        });
        break;
      case "reflect_taunt":
        statuses.push({
          ...base,
          kind: "reflect",
          value: skill.statusEffect.value ?? 0.5,
        });
        break;
      case "sword_qi":
        statuses.push({
          ...base,
          kind: "critBoost",
          value: skill.statusEffect.value ?? 5,
          nextTickAtMs: undefined,
        });
        break;
      case "god_kingdom":
        statuses.push({
          ...base,
          kind: "drain",
          value: skill.statusEffect.value ?? 0.1,
        });
        break;
      case "spirit_sever":
        statuses.push({
          ...base,
          kind: "armorBreak",
          value: skill.statusEffect.value ?? 0.18,
          nextTickAtMs: undefined,
        });
        break;
      case "zhuxian_domain":
        statuses.push({
          ...base,
          kind: "burn",
          value: 0.03,
        });
        statuses.push({
          id: "zhuxian_break",
          name: "誅仙劍陣",
          kind: "armorBreak",
          value: skill.statusEffect.value ?? 0.3,
          expiresAtMs,
          nextTickAtMs: undefined,
        });
        break;
    }
  }

  if (skill.id === "b_g_active") {
    statuses.push({
      id: "shield",
      name: "護盾",
      kind: "shield",
      value: Math.floor(targetMaxHp * 0.2),
      expiresAtMs: 2 * 1000,
    });
  }

  if (skill.id === "b_bi_active" || canonicalSkillId === "b_ma_active") {
    statuses.push({
      id: "giant_form_guard",
      name: "法天象地",
      kind: "shield",
      value: Math.floor(targetMaxHp * 0.35),
      expiresAtMs: 5 * 1000,
    });
  }

  if (
    canonicalSkillId === "b_vr_active" &&
    !statuses.some((status) => status.kind === "reflect")
  ) {
    statuses.push({
      id: "battle_tribulation_reflect",
      name: "反震",
      kind: "reflect",
      value: 0.5,
      expiresAtMs: 3 * 1000,
      nextTickAtMs: undefined,
    });
  }

  if (
    canonicalSkillId === "s_tr_active" &&
    !statuses.some((status) => status.name === "誅仙劍陣")
  ) {
    statuses.push({
      id: "zhuxian_burn",
      name: "燃燒",
      kind: "burn",
      value: 0.03,
      expiresAtMs: 5 * 1000,
      nextTickAtMs: 1000,
    });
    statuses.push({
      id: "zhuxian_break",
      name: "誅仙劍陣",
      kind: "armorBreak",
      value: 0.3,
      expiresAtMs: 5 * 1000,
      nextTickAtMs: undefined,
    });
  }

  if (
    canonicalSkillId === "m_tr_active" &&
    !statuses.some((status) => status.id === "paralyze")
  ) {
    statuses.push({
      id: "paralyze",
      name: getStatusLabel("paralyze"),
      kind: "incapacitate",
      value: 0,
      expiresAtMs: 1000,
      nextTickAtMs: undefined,
    });
  }

  return statuses;
};

const normalizeCombatStatuses = (
  statuses: CombatStatus[],
  currentTimeMs: number
) =>
  statuses.map((status) => ({
    ...status,
    expiresAtMs: currentTimeMs + status.expiresAtMs,
    nextTickAtMs: status.nextTickAtMs
      ? currentTimeMs + status.nextTickAtMs
      : undefined,
  }));

const splitSkillStatusesBySide = (
  skill: Skill,
  statuses: CombatStatus[]
) => {
  const playerSideStatuses = statuses.filter(
    (status) =>
      skill.targetType === "self" ||
      status.kind === "shield" ||
      status.kind === "reflect" ||
      status.kind === "critBoost"
  );
  const enemySideStatuses = statuses.filter(
    (status) => !playerSideStatuses.includes(status)
  );

  return {
    playerSideStatuses,
    enemySideStatuses,
  };
};

const resolveNormalizedSkillStatuses = (
  skill: Skill,
  targetMaxHp: number,
  currentTimeMs: number
) => {
  const createdStatuses = buildStatusesFromSkill(skill, targetMaxHp);
  const normalizedStatuses = normalizeCombatStatuses(
    createdStatuses,
    currentTimeMs
  );
  const { playerSideStatuses, enemySideStatuses } = splitSkillStatusesBySide(
    skill,
    normalizedStatuses
  );

  return {
    createdStatuses,
    normalizedStatuses,
    playerSideStatuses,
    enemySideStatuses,
  };
};

const resolveNormalizedEnemySpecialStatuses = (
  specialAttack: Enemy["specialAttack"] | undefined,
  targetMaxHp: number,
  currentTimeMs: number
) =>
  normalizeCombatStatuses(
    buildStatusesFromEnemySpecial(specialAttack, targetMaxHp),
    currentTimeMs
  );

export const resolvePlayerWorldStrike = (
  player: PlayerCombatStats,
  enemy: Enemy,
  skill?: Skill
): WorldStrikeResult => {
  const attackContext = getPlayerAttackContext(player, enemy, skill);
  const canonicalSkillId = getCanonicalSkillId(skill);
  const passiveFlags = getPlayerPassiveFlags(player.learnedSkills);
  const restriction = getRestriction(player.element, enemy.element);
  const elementalAffinity = getEnemyElementalModifier(player.element, enemy);
  const dealsDirectDamage =
    !skill ||
    skill.effectType === "damage" ||
    skill.damageMultiplier !== undefined;
  const { hasSwordVoidPassive, hasSwordQiPassive, hasMageQiPassive, hasBodyFoundationPassive, hasSwordEmperorPassive, hasSwordMahayanaPassive, hasMageMahayanaPassive } =
    passiveFlags;
  const hasSwordQiChain = hasLearnedSkillId(player.learnedSkills, "s_f_active");
  const swordTribulationActive = hasSwordTribulationWindow(
    player.hp,
    player.maxHp,
    passiveFlags
  );
  const bodyFoundationStacks = hasBodyFoundationPassive
    ? getBodyFoundationBloodlineStacks(player.hp, player.maxHp)
    : 0;

  const timelineProfile = getSkillTimelineProfile(skill);
  let effectivePower = attackContext.power;
  if (restriction.isEffective) effectivePower *= 1.12;
  if (restriction.isResisted) effectivePower *= 0.88;
  effectivePower *= elementalAffinity.multiplier;
  if (bodyFoundationStacks > 0) {
    effectivePower *= 1 + bodyFoundationStacks * 0.02;
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

  const { playerSideStatuses, enemySideStatuses } = skill
    ? resolveNormalizedSkillStatuses(
        skill,
        skill.targetType === "self" ? player.maxHp : enemy.maxHp,
        0
      )
    : { playerSideStatuses: [], enemySideStatuses: [] };
  const filteredEnemyStatuses = enemySideStatuses.filter((status) => {
    if (playerSideStatuses.includes(status)) return false;
    if (
      hasEnemyAffix(enemy, "霸體") &&
      status.kind === "incapacitate" &&
      Math.random() < 0.35
    ) {
      return false;
    }
    return true;
  });

  if (hasSwordQiPassive && isCrit && dealsDirectDamage && skill?.profession === ProfessionType.Sword) {
    filteredEnemyStatuses.push(createSwordQiArmorBreakStatus(0));
  }

  return {
    damage,
    isCrit,
    skillName: skill?.name,
    nextActionDelayMs: Math.max(
      getPlayerAttackIntervalMs(player),
      timelineProfile.executionTimeMs
    ),
    skillCooldownMs: skill
      ? Math.floor(
          getResolvedSkillCooldownSeconds(skill, player.learnedSkills) * 1000
        )
      : 0,
    executionTimeMs: timelineProfile.executionTimeMs,
    playerStatusNames: [
      ...playerSideStatuses.map((status) => status.name),
      ...getPlayerWorldPassiveStatusNames({
        passiveFlags,
        player,
        skill,
        isCrit,
        dealsDirectDamage,
        canonicalSkillId,
        hasSwordQiChain,
        swordTribulationActive,
        bodyFoundationStacks,
        voidSwordProc,
      }),
    ],
    enemyStatusNames: filteredEnemyStatuses.map((status) => status.name),
    playerShieldGain: playerSideStatuses
      .filter((status) => status.kind === "shield")
      .reduce((sum, status) => sum + Math.floor(status.value), 0),
    areaShape: timelineProfile.areaShape,
    areaRadius: timelineProfile.areaRadius,
    maxTargets: timelineProfile.maxTargets,
    isProjectile: timelineProfile.isProjectile,
  };
};

export const resolveEnemyWorldStrike = (
  enemy: Enemy,
  player: PlayerCombatStats,
  useSpecial = false
) => {
  const special = useSpecial ? enemy.specialAttack : undefined;
  const timelineProfile = getEnemySpecialTimelineProfile(enemy);
  const attackContext = getEnemyAttackContext(enemy, player);
  const passiveFlags = getPlayerPassiveFlags(player.learnedSkills);
  const restriction = getRestriction(enemy.element, player.element);
  let effectivePower =
    attackContext.power * (special?.damageMultiplier ?? 1);

  if (restriction.isEffective) effectivePower *= 1.1;
  if (restriction.isResisted) effectivePower *= 0.9;

  const effectiveDefense =
    attackContext.defense *
    (special ? timelineProfile.areaDamageModifier : 1);
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
  damage = resolvedDamage;
  const incomingStatuses = getResolvedEnemyWorldIncomingStatuses({
    special,
    player,
    passiveFlags,
  });

  const statusNames = [
    ...incomingStatuses.filteredStatuses.map((status) => status.name),
    ...getEnemyWorldPassiveStatusNames({
      passiveFlags,
      prePassiveDamage: preBodySaintDamage,
      playerMaxHp: player.maxHp,
      voidEvasion,
      bodyFoundationStacks,
      copperSkinTriggered,
      bodyFusionTriggered,
      elementalBarrierTriggered,
      reflectTriggered,
      enemyElement: enemy.element,
      bodyTribulationTriggered,
      mageTribulationTriggered,
      bodyRebirthTrueTriggered,
      bodyEmperorTriggered,
      swordDeathWardTriggered,
    }),
  ];

  if (incomingStatuses.bodyImmortalTriggered) {
    statusNames.push("仙體無垢");
  }

  if (incomingStatuses.swordEmperorTriggered) {
    statusNames.push("萬法皆空");
  }

  return {
    damage,
    skillName: special?.name,
    statusNames,
    nextActionDelayMs: getEnemyAttackIntervalMs(enemy),
    specialCooldownMs: special
      ? Math.floor(getResolvedEnemySpecialCooldownSeconds(enemy) * 1000)
      : 0,
    executionTimeMs: timelineProfile.executionTimeMs,
    areaShape: timelineProfile.areaShape,
    areaRadius: timelineProfile.areaRadius,
    isProjectile: timelineProfile.isProjectile,
  };
};

export const calculatePlayerStats = (
  attributes: BaseAttributes,
  majorRealm: MajorRealm,
  spiritRootId: SpiritRootId,
  equipmentStats: Partial<
    BaseAttributes & {
      attack: number;
      defense: number;
      speed: number;
      hp: number;
      mp: number;
      crit: number;
      critDamage: number;
      dodge: number;
      magic: number;
      blockRate: number;
      regenHp: number;
      res: number;
      damageReduction: number;
    }
  > = {},
  name = "道友",
  profession: ProfessionType = ProfessionType.None,
  learnedSkillIds: string[] = []
): PlayerCombatStats => {
  const base = REALM_BASE_STATS[majorRealm];
  const rootDetails = SPIRIT_ROOT_DETAILS[spiritRootId];
  const rootBonuses = rootDetails.bonuses.battle || {};
  const professionPassives = getProfessionPassives(profession);
  const learnedSkills = getLearnedSkills(learnedSkillIds);
  const passiveSkillBonuses = getPassiveSkillBonuses(learnedSkills);

  const effectivePhysique = attributes.physique + (equipmentStats.physique || 0);
  const effectiveRootBone = attributes.rootBone + (equipmentStats.rootBone || 0);
  const effectiveInsight = attributes.insight + (equipmentStats.insight || 0);
  const effectiveComprehension =
    attributes.comprehension + (equipmentStats.comprehension || 0);
  const effectiveFortune = attributes.fortune + (equipmentStats.fortune || 0);

  let maxHp = effectivePhysique * 15 + base.hp;
  let maxMp = effectiveInsight * 10 + base.mp;
  let attack = effectiveRootBone * 2;
  let magic = effectiveInsight * 2;
  let defense = effectivePhysique * 1.5;
  let res = effectiveInsight * 1.5;

  maxHp += equipmentStats.hp || 0;
  maxMp += equipmentStats.mp || 0;
  attack += equipmentStats.attack || 0;
  defense += equipmentStats.defense || 0;
  magic += equipmentStats.magic || 0;
  res += equipmentStats.res || 0;

  if (rootBonuses.hpPercent) maxHp *= 1 + rootBonuses.hpPercent / 100;
  if (rootBonuses.mpPercent) maxMp *= 1 + rootBonuses.mpPercent / 100;
  if (rootBonuses.atkPercent) attack *= 1 + rootBonuses.atkPercent / 100;
  if (rootBonuses.defPercent) defense *= 1 + rootBonuses.defPercent / 100;

  if (rootBonuses.resPercent) {
    res *= 1 + rootBonuses.resPercent / 100;
  } else if (rootBonuses.defPercent) {
    res *= 1 + rootBonuses.defPercent / 100;
  }

  if (passiveSkillBonuses.hpPercent) {
    maxHp *= 1 + passiveSkillBonuses.hpPercent / 100;
  }
  if (passiveSkillBonuses.mpPercent) {
    maxMp *= 1 + passiveSkillBonuses.mpPercent / 100;
  }
  if (passiveSkillBonuses.attackPercent) {
    attack *= 1 + passiveSkillBonuses.attackPercent / 100;
  }
  if (passiveSkillBonuses.magicPercent) {
    magic *= 1 + passiveSkillBonuses.magicPercent / 100;
  }
  if (passiveSkillBonuses.defensePercent) {
    defense *= 1 + passiveSkillBonuses.defensePercent / 100;
  }
  if (passiveSkillBonuses.resPercent) {
    res *= 1 + passiveSkillBonuses.resPercent / 100;
  }

  maxHp = Math.floor(maxHp);
  maxMp = Math.floor(maxMp);
  attack = Math.floor(attack);
  magic = Math.floor(magic);
  defense = Math.floor(defense);
  res = Math.floor(res);

  const speed = effectiveComprehension + (equipmentStats.speed || 0);
  let crit = effectiveInsight * 0.1 + (equipmentStats.crit || 0);
  if (rootBonuses.critRate) crit += rootBonuses.critRate;
  crit += professionPassives.critBonus;
  crit += passiveSkillBonuses.critBonus;

  let dodge = effectiveFortune * 0.1 + (equipmentStats.dodge || 0);
  if (rootBonuses.dodgeRate) dodge += rootBonuses.dodgeRate;
  dodge += passiveSkillBonuses.dodgeBonus;

  const critDamage =
    150 +
    effectiveInsight * 0.2 +
    (equipmentStats.critDamage || 0) +
    professionPassives.critDamageBonus +
    passiveSkillBonuses.critDamageBonus;
  const blockRate =
    effectivePhysique * 0.1 + (equipmentStats.blockRate || 0);
  const alchemyBonus = rootDetails.bonuses.alchemyBonus || 0;
  const craftingBonus = rootDetails.bonuses.craftingBonus || 0;
  const breakthroughBonus = 0;
  const dropRateBonus = effectiveFortune * 0.1;
  const cultivationSpeedBonus = 0;
  const damageReduction =
    (rootBonuses.damageReduction || 0) +
    (equipmentStats.damageReduction || 0) +
    professionPassives.damageReductionBonus +
    passiveSkillBonuses.damageReductionBonus;
  const regenHp =
    (rootBonuses.hpRegen || 0) +
    (equipmentStats.regenHp || 0) +
    professionPassives.regenHpBonus +
    passiveSkillBonuses.regenHpBonus;
  const element = SPIRIT_ROOT_TO_ELEMENT[spiritRootId] || ElementType.None;

  return {
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    attack,
    magic,
    defense,
    res,
    speed,
    crit,
    critDamage,
    dodge,
    blockRate,
    damageReduction,
    alchemyBonus,
    craftingBonus,
    breakthroughBonus,
    dropRateBonus,
    cultivationSpeedBonus,
    name,
    element,
    regenHp,
    profession,
    learnedSkills,
  };
};

export const runAutoBattle = (
  player: PlayerCombatStats,
  enemy: Enemy
): {
  won: boolean;
  logs: CombatLog[];
  rewards?: {
    spiritStones: number;
    exp: number;
    drops: { itemId: string; count: number; instance?: ItemInstance }[];
  };
} => {
  let playerHp = player.hp;
  let enemyHp = enemy.hp;
  let playerMp = player.mp;
  const logs: CombatLog[] = [];
  let turn = 1;
  let currentTimeMs = 0;
  let playerNextActionMs = 0;
  let enemyNextActionMs = 0;
  let activeSkillReadyAtMs = 0;
  let enemySpecialReadyAtMs = 0;
  let bossBroken = false;
  let playerDebuffed = false;
  let lastRegenTimeMs = 0;
  let lastStatusTickMs = 0;
  let playerStatuses: CombatStatus[] = [];
  let enemyStatuses: CombatStatus[] = [];
  const previousSnapshotProvider = combatLogSnapshotProvider;

  combatLogSnapshotProvider = (snapshotTimeMs) => ({
    playerStatuses: getCombatStatusSnapshot(playerStatuses, snapshotTimeMs),
    enemyStatuses: getCombatStatusSnapshot(enemyStatuses, snapshotTimeMs),
    playerActiveSkillName: activeSkill?.name,
    playerActiveSkillCooldownRemainingMs: activeSkill
      ? Math.max(0, activeSkillReadyAtMs - snapshotTimeMs)
      : 0,
    playerActiveSkillCooldownTotalMs: activeSkill
      ? Math.floor(
          getResolvedSkillCooldownSeconds(activeSkill, player.learnedSkills) *
            1000
        )
      : 0,
  });

  const activeSkill = getHighestActiveSkill(player.profession, player.learnedSkills);
  const playerAttackIntervalMs = getPlayerAttackIntervalMs(player);
  const enemyAttackIntervalMs = getEnemyAttackIntervalMs(enemy);
  const pVsE = getRestriction(player.element, enemy.element);
  const eVsP = getRestriction(enemy.element, player.element);
  const enemyElementalAffinity = getEnemyElementalModifier(player.element, enemy);
  const passiveFlags = getPlayerPassiveFlags(player.learnedSkills);
  const {
    hasReflectPassive,
    hasSwordQiPassive,
    hasBodyQiPassive,
    hasMageQiPassive,
    hasInitialShieldPassive,
    hasSwordDeathWardPassive,
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasBodyFoundationPassive,
    hasMageFoundationPassive,
    hasSwordGoldenPassive,
    hasSwordEchoPassive,
    hasSwordHeartPassive,
    hasBodySaintPassive,
    hasSwordFusionPassive,
    hasSwordVoidPassive,
    hasBodyFusionPassive,
    hasMageFusionPassive,
    hasBodyAncientPassive,
    hasMageVoidPassive,
    hasSwordTribulationPassive,
    hasBodyTribulationPassive,
    hasMageTribulationPassive,
    hasBodyImmortalPassive,
    hasBodyRebirthTruePassive,
    hasSwordMahayanaPassive,
    hasMageMahayanaPassive,
    hasMageImmortalPassive,
    hasSwordImmortalPassive,
    hasBodyEmperorPassive,
    hasSwordEmperorPassive,
    hasMageEmperorPassive,
  } = passiveFlags;
  let swordDeathWardUsed = false;
  let bodyRebirthTrueUsed = false;
  let bodyTribulationStacks = 0;
  let mageFoundationStacks = 0;
  let swordHeartStacks = 0;
  let playerDamagedSinceSwordHeartWindow = false;
  let nextSwordImmortalGuardAtMs = 5000;

  const cleanupExpiredStatuses = (currentMs: number) => {
    playerStatuses = playerStatuses.filter(
      (status) =>
        status.expiresAtMs > currentMs &&
        (status.kind !== "shield" || status.value > 0)
    );
    enemyStatuses = enemyStatuses.filter(
      (status) =>
        status.expiresAtMs > currentMs &&
        (status.kind !== "shield" || status.value > 0)
    );
  };

  const processStatusTicks = (currentMs: number) => {
    while (lastStatusTickMs + 1000 <= currentMs && playerHp > 0 && enemyHp > 0) {
      lastStatusTickMs += 1000;
      const tickMs = lastStatusTickMs;

      cleanupExpiredStatuses(tickMs);

      enemyStatuses.forEach((status) => {
        if ((status.nextTickAtMs ?? 0) > tickMs || status.expiresAtMs <= tickMs) {
          return;
        }

        let tickDamage = 0;
        let tickMessage = "";

        switch (status.kind) {
          case "burn":
            tickDamage = Math.max(1, Math.floor(enemy.maxHp * Math.max(0.02, status.value)));
            tickMessage = `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 身陷【${status.name}】，承受 <dmg>${tickDamage}</dmg> 點傷害！`;
            break;
          case "poison":
            tickDamage = Math.max(1, Math.floor(enemy.maxHp * Math.max(0.018, status.value)));
            tickMessage = `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 遭【${status.name}】侵蝕，承受 <dmg>${tickDamage}</dmg> 點傷害！`;
            break;
          case "bleed":
            tickDamage = Math.max(1, Math.floor(enemy.maxHp * Math.max(0.015, status.value)));
            tickMessage = `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 傷口撕裂，流失 <dmg>${tickDamage}</dmg> 點氣血！`;
            break;
          case "drain":
            tickDamage = Math.max(1, Math.floor(enemy.maxHp * Math.max(0.04, status.value)));
            playerHp = Math.min(player.maxHp, playerHp + tickDamage);
            tickMessage = `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 遭【${status.name}】吞噬，承受 <dmg>${tickDamage}</dmg> 點傷害，你回復了同等氣血。`;
            break;
        }

        if (tickDamage > 0) {
          enemyHp = Math.max(0, enemyHp - tickDamage);
          pushCombatLog(logs, {
            turn,
            timeMs: tickMs,
            isPlayer: true,
            message: tickMessage,
            damage: tickDamage,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        status.nextTickAtMs = tickMs + 1000;
      });

      playerStatuses.forEach((status) => {
        if ((status.nextTickAtMs ?? 0) > tickMs || status.expiresAtMs <= tickMs) {
          return;
        }

        if (hasSwordEmperorPassive && isNegativeStatusKind(status.kind)) {
          status.expiresAtMs = tickMs;
          status.nextTickAtMs = undefined;
          pushCombatLog(logs, {
            turn,
            timeMs: tickMs,
            isPlayer: true,
            message: `【萬法皆空】直接抹除了【${status.name}】。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
          return;
        }

        if (hasBodyImmortalPassive && isDotStatusKind(status.kind)) {
          status.expiresAtMs = tickMs;
          status.nextTickAtMs = undefined;
          pushCombatLog(logs, {
            turn,
            timeMs: tickMs,
            isPlayer: true,
            message: `【仙體無垢】淨化了【${status.name}】的侵蝕。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
          return;
        }

        let tickDamage = 0;
        let tickMessage = "";

        switch (status.kind) {
          case "burn":
            tickDamage = Math.max(1, Math.floor(player.maxHp * Math.max(0.02, status.value)));
            tickMessage = `你身陷【${status.name}】，承受 <dmg>${tickDamage}</dmg> 點傷害！`;
            break;
          case "poison":
            tickDamage = Math.max(1, Math.floor(player.maxHp * Math.max(0.018, status.value)));
            tickMessage = `你遭【${status.name}】侵蝕，承受 <dmg>${tickDamage}</dmg> 點傷害！`;
            break;
          case "bleed":
            tickDamage = Math.max(1, Math.floor(player.maxHp * Math.max(0.015, status.value)));
            tickMessage = `你氣血流失，因【${status.name}】承受 <dmg>${tickDamage}</dmg> 點傷害！`;
            break;
          case "drain":
            tickDamage = Math.max(1, Math.floor(player.maxHp * Math.max(0.04, status.value)));
            enemyHp = Math.min(enemy.maxHp, enemyHp + tickDamage);
            tickMessage = `你被【${status.name}】抽離生機，承受 <dmg>${tickDamage}</dmg> 點傷害，敵方恢復同等氣血。`;
            break;
        }

        if (tickDamage > 0) {
          playerHp = Math.max(0, playerHp - tickDamage);
          playerDamagedSinceSwordHeartWindow = true;
          pushCombatLog(logs, {
            turn,
            timeMs: tickMs,
            isPlayer: false,
            message: tickMessage,
            damage: tickDamage,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        status.nextTickAtMs = tickMs + 1000;
      });
    }

    cleanupExpiredStatuses(currentMs);
  };

  const initialPassiveStatuses = getInitialPassiveStatuses({
    hasReflectPassive,
    hasInitialShieldPassive,
  });
  if (initialPassiveStatuses.length > 0) {
    playerStatuses.push(...initialPassiveStatuses);
  }
  getCombatOpeningMessages({
    player,
    enemy,
    restriction: pVsE,
    elementalAffinity: enemyElementalAffinity,
    hasReflectPassive,
    hasInitialShieldPassive,
    hasMageImmortalPassive,
    hasMageEmperorPassive,
  }).forEach((message) => {
    pushCombatLog(logs, {
      turn: 0,
      timeMs: 0,
      isPlayer: true,
      message,
      damage: 0,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  });
  if (hasMageEmperorPassive) enemySpecialReadyAtMs = 2000;

  while (playerHp > 0 && enemyHp > 0) {
    const playerActsFirst = playerNextActionMs <= enemyNextActionMs;
    currentTimeMs = playerActsFirst ? playerNextActionMs : enemyNextActionMs;

    processStatusTicks(currentTimeMs);
    if (playerHp <= 0 || enemyHp <= 0) break;

    if ((player.regenHp > 0 || hasBodyRebirthPassive || hasManaSpringPassive || hasMageFusionPassive) && (playerHp < player.maxHp || playerMp < player.maxMp)) {
      const regenIntervals = Math.floor((currentTimeMs - lastRegenTimeMs) / 1000);
      if (regenIntervals > 0) {
        let healPerSecond = Math.floor(player.maxHp * (player.regenHp / 100));
        if (hasBodyRebirthPassive) {
          const missingHp = Math.max(0, player.maxHp - playerHp);
          healPerSecond +=
            Math.floor(player.maxHp * 0.02) + Math.floor(missingHp * 0.05);
        }
        if (hasMageFusionPassive) {
          healPerSecond += Math.floor(player.maxHp * 0.05);
        }
        const healAmount = Math.floor(
          healPerSecond * regenIntervals * (hasBodyImmortalPassive ? 1.5 : 1)
        );
        if (healAmount > 0) {
          playerHp = Math.min(player.maxHp, playerHp + healAmount);
          const { healMessage } = getPassiveRegenMessages({
            healAmount,
            manaAmount: 0,
            hasBodyRebirthPassive,
            hasManaSpringPassive,
            hasMageFusionPassive,
          });
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: healMessage,
            damage: -healAmount,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if ((hasManaSpringPassive || hasMageFusionPassive) && playerMp < player.maxMp) {
          const manaPerSecond =
            (hasManaSpringPassive ? Math.floor(player.maxMp * 0.1) : 0) +
            (hasMageFusionPassive ? Math.floor(player.maxMp * 0.05) : 0);
          const manaAmount = manaPerSecond * regenIntervals;
          if (manaAmount > 0) {
            playerMp = Math.min(player.maxMp, playerMp + manaAmount);
            const { manaMessage } = getPassiveRegenMessages({
              healAmount: 0,
              manaAmount,
              hasBodyRebirthPassive,
              hasManaSpringPassive,
              hasMageFusionPassive,
            });
            pushCombatLog(logs, {
              turn,
              timeMs: currentTimeMs,
              isPlayer: true,
              message: manaMessage,
              damage: 0,
              playerHp,
              playerMaxHp: player.maxHp,
              enemyHp,
              enemyMaxHp: enemy.maxHp,
            });
          }
        }
        if (hasBodyAncientPassive) {
          const removableIndex = playerStatuses.findIndex(
            (status) =>
              status.expiresAtMs > currentTimeMs &&
              isNegativeStatusKind(status.kind)
          );
          if (removableIndex >= 0) {
            const [removedStatus] = playerStatuses.splice(removableIndex, 1);
            pushCombatLog(logs, {
              turn,
              timeMs: currentTimeMs,
              isPlayer: true,
              message: `【荒古戰體】震散了【${removedStatus.name}】。`,
              damage: 0,
              playerHp,
              playerMaxHp: player.maxHp,
              enemyHp,
              enemyMaxHp: enemy.maxHp,
            });
          }
        }
        lastRegenTimeMs += regenIntervals * 1000;
      }
    }

    if (playerActsFirst) {
      if (hasSwordImmortalPassive && currentTimeMs >= nextSwordImmortalGuardAtMs) {
        playerStatuses.push({
          id: "immortal_sword_guard",
          name: "仙元護體",
          kind: "shield",
          value: 999999,
          expiresAtMs: currentTimeMs + 1000,
        });
        nextSwordImmortalGuardAtMs += 5000;
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【仙元護體】再次凝成，可抵擋一次任意傷害。`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }

      if (enemy.rank === EnemyRank.Boss && pVsE.isEffective && !bossBroken && Math.random() < 0.12) {
        bossBroken = true;
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【破綻】你抓住了 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 的氣機破綻，下一擊傷害大幅提升！`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }

      const skillReady =
        activeSkill &&
        currentTimeMs >= activeSkillReadyAtMs &&
        (playerMp >= (activeSkill.cost || 0) ||
          (hasMageFusionPassive &&
            activeSkill.profession === ProfessionType.Mage));
      const activeSkillTimelineProfile = skillReady
        ? getSkillTimelineProfile(activeSkill!)
        : undefined;
      const dealsDirectDamage =
        !skillReady ||
        activeSkill!.effectType === "damage" ||
        activeSkill!.damageMultiplier !== undefined;
      const activeSkillCanonicalId = skillReady
        ? getCanonicalSkillId(activeSkill!)
        : undefined;
      const attackContext = getPlayerAttackContext(
        player,
        enemy,
        skillReady ? activeSkill : undefined
      );

      let effectivePower = attackContext.power;
      let effectiveDefense =
        attackContext.defense * getArmorBreakMultiplier(enemyStatuses, currentTimeMs);
      const bodyFoundationStacks = hasBodyFoundationPassive
        ? getBodyFoundationBloodlineStacks(playerHp, player.maxHp)
        : 0;
      const voidSwordProc = hasSwordVoidPassive && Math.random() < 0.1;
      if (voidSwordProc) {
        effectiveDefense = Math.max(1, effectiveDefense * 0.5);
      }

      if (pVsE.isEffective) effectivePower *= 1.12;
      if (pVsE.isResisted) effectivePower *= 0.88;
      effectivePower *= enemyElementalAffinity.multiplier;
      if (bossBroken) effectivePower *= 1.25;
      if (playerDebuffed) effectivePower *= 0.9;
      if (
        hasMageQiPassive &&
        !skillReady &&
        player.profession === ProfessionType.Mage
      ) {
        effectivePower += player.magic * 0.28;
      }
      if (hasSwordTribulationPassive && playerHp <= player.maxHp * 0.2) {
        effectivePower *= 1.5;
      }
      if (
        hasMageMahayanaPassive &&
        skillReady &&
        activeSkill!.profession === ProfessionType.Mage
      ) {
        effectivePower *= 1.4;
      }
      if (
        hasMageFoundationPassive &&
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
      const manaSpringEmpowered =
        hasManaSpringPassive && playerMp >= player.maxMp * 0.8;
      if (manaSpringEmpowered) {
        effectivePower *= 1.2;
      }
      if (hasSwordHeartPassive && swordHeartStacks > 0) {
        effectivePower *= 1 + swordHeartStacks * 0.03;
      }
      if (bodyFoundationStacks > 0) {
        effectivePower *= 1 + bodyFoundationStacks * 0.02;
      }
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
      } else if (skillReady && activeSkillCanonicalId === "s_tr_active" && hasSwordQiChain) {
        effectivePower *= 1.18;
      }

      const critRate = Math.min(
        95,
        player.crit +
          (hasSwordMahayanaPassive ? 5 : 0) +
          (hasSwordQiPassive ? getSwordQiPassiveCritBonus() : 0) +
          attackContext.critBonus +
          getCritBoostValue(playerStatuses, currentTimeMs)
      );
      const isCrit =
        (hasSwordTribulationPassive && playerHp <= player.maxHp * 0.2) ||
        (attackContext.canCrit && Math.random() * 100 < Math.max(0, critRate));

      let playerDamage = 0;
      const ignoreEnemyReduction =
        (skillReady && activeSkillCanonicalId === "s_tr_active") ||
        (!skillReady && hasSwordEmperorPassive);
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
                (hasSwordMahayanaPassive ? 10 : 0)) /
                100)
          );
        }
        if (
          skillReady &&
          activeSkillCanonicalId === "b_vr_active" &&
          enemy.rank !== EnemyRank.Boss
        ) {
          playerDamage = Math.max(playerDamage, enemyHp);
        }
      }

      enemyHp = Math.max(0, enemyHp - playerDamage);
      getPlayerActivePassiveProcMessages({
        player,
        enemy,
        currentTimeMs,
        playerHp,
        enemyHp,
        skillReady,
        activeSkill: activeSkill ?? undefined,
        isCrit,
        manaSpringEmpowered,
        hasMageMahayanaPassive,
        hasSwordMahayanaPassive,
        hasMageQiPassive,
        bodyFoundationStacks,
        voidSwordProc,
      }).forEach((log) => {
        pushCombatLog(logs, {
          ...log,
          turn,
        });
      });
      pushCombatLog(logs, {
        turn,
        timeMs: currentTimeMs,
        isPlayer: true,
        message: skillReady
          ? dealsDirectDamage
            ? `<player>${player.name}</player> 施展【${activeSkill!.name}】${activeSkill!.areaShape && activeSkill!.areaShape !== "single" && activeSkill!.areaShape !== "self" ? "，範圍術式震盪四散，" : "，"}${isCrit ? "暴擊！" : ""}造成 <dmg>${playerDamage}</dmg> 點傷害！`
            : `<player>${player.name}</player> 施展【${activeSkill!.name}】，靈力在戰場上激盪開來！`
          : `<player>${player.name}</player> 發動攻擊，${isCrit ? "暴擊！" : ""}造成 <dmg>${playerDamage}</dmg> 點傷害！`,
        damage: playerDamage,
        playerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp: enemy.maxHp,
      });
      if (
        hasSwordQiPassive &&
        skillReady &&
        activeSkill?.profession === ProfessionType.Sword &&
        isCrit &&
        enemyHp > 0
      ) {
        enemyStatuses.push(createSwordQiArmorBreakStatus(currentTimeMs));
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【劍脈初成】劍勢貫通護體，為 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 施加【劍脈破甲】。`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }

      if (
        skillReady &&
        activeSkillCanonicalId === "s_tr_active" &&
        activeSwordQiStatuses.length > 0
      ) {
        playerStatuses = playerStatuses.filter(
          (status) =>
            !(
              status.kind === "critBoost" &&
              status.expiresAtMs > currentTimeMs
            )
        );
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【萬劍歸一】引爆 ${activeSwordQiStatuses.length} 層劍氣共鳴，劍勢瞬間攀升。`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      } else if (
        skillReady &&
        activeSkillCanonicalId === "s_tr_active" &&
        hasSwordQiChain
      ) {
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【萬劍歸一】殘存劍勢與破劫一擊共鳴，爆發再度攀升。`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }

      if (
        hasSwordEchoPassive &&
        !skillReady &&
        enemyHp > 0 &&
        playerDamage > 0
      ) {
        const echoPower = player.attack * 0.6;
        let echoDamage = resolveDamage(
          echoPower,
          effectiveDefense * getArmorBreakMultiplier(enemyStatuses, currentTimeMs)
        );
        if (pVsE.isEffective) echoDamage = Math.floor(echoDamage * 1.12);
        if (pVsE.isResisted) echoDamage = Math.floor(echoDamage * 0.88);
        echoDamage = Math.floor(echoDamage * enemyElementalAffinity.multiplier);
        echoDamage = Math.floor(
          echoDamage * getEnemyDamageReductionMultiplier(enemy)
        );
        enemyHp = Math.max(0, enemyHp - echoDamage);
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【劍意化形】追擊斬落，追加造成 <dmg>${echoDamage}</dmg> 點傷害！`,
          damage: echoDamage,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }

      if (skillReady && activeSkillCanonicalId === "s_ma_active" && enemyHp > 0) {
        for (let echoIndex = 0; echoIndex < 2 && enemyHp > 0; echoIndex += 1) {
          let echoDamage = resolveDamage(
            player.attack,
            effectiveDefense * getArmorBreakMultiplier(enemyStatuses, currentTimeMs)
          );
          echoDamage = Math.floor(
            echoDamage * getEnemyDamageReductionMultiplier(enemy)
          );
          enemyHp = Math.max(0, enemyHp - echoDamage);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs + echoIndex + 1,
            isPlayer: true,
            message: `【虛空劍陣】陣眼再斬，追加造成 <dmg>${echoDamage}</dmg> 點傷害！`,
            damage: echoDamage,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }
      }

      if (skillReady && activeSkillCanonicalId === "m_tr_active" && enemyHp > 0) {
        for (let summonIndex = 0; summonIndex < 3 && enemyHp > 0; summonIndex += 1) {
          let summonDamage = resolveDamage(
            player.magic,
            effectiveDefense * 0.9
          );
          summonDamage = Math.floor(
            summonDamage * getEnemyDamageReductionMultiplier(enemy)
          );
          enemyHp = Math.max(0, enemyHp - summonDamage);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs + summonIndex + 1,
            isPlayer: true,
            message: `【撒豆成兵】金甲天兵出擊，造成 <dmg>${summonDamage}</dmg> 點傷害！`,
            damage: summonDamage,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }
      }

      if (skillReady) {
        const baseCooldownSeconds =
          activeSkillTimelineProfile?.cooldownSeconds ??
          activeSkill!.cooldownSeconds ??
          activeSkill!.cooldown;
        if (
          hasMageFusionPassive &&
          activeSkill!.profession === ProfessionType.Mage
        ) {
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【五氣朝元】術式運轉不再消耗靈力。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        } else {
          playerMp = Math.max(0, playerMp - (activeSkill!.cost || 0));
        }
        const effectiveCooldownSeconds = getResolvedSkillCooldownSeconds(
          activeSkill!,
          player.learnedSkills
        );
        activeSkillReadyAtMs =
          currentTimeMs + Math.floor(effectiveCooldownSeconds * 1000);
        if (
          effectiveCooldownSeconds < baseCooldownSeconds &&
          activeSkill!.profession === ProfessionType.Mage
        ) {
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【道法自然】術式流轉提前歸位，冷卻縮短至 ${effectiveCooldownSeconds.toFixed(1)} 秒。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if (hasMageQiPassive && activeSkill!.profession === ProfessionType.Mage) {
          const recoveredMana = getMageQiCycleRecovery(player.maxMp);
          playerMp = Math.min(player.maxMp, playerMp + recoveredMana);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【靈潮循環】術式回潮歸海，你回復了 ${recoveredMana} 點靈力。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if (
          hasSwordGoldenPassive &&
          activeSkillCanonicalId === "s_f_active" &&
          isCrit &&
          Math.random() < 0.3
        ) {
          activeSkillReadyAtMs = currentTimeMs;
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【劍心通明】你在暴擊中瞬息回氣，流光劍影冷卻即刻重置。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if (hasMageFoundationPassive && activeSkill!.profession === ProfessionType.Mage) {
          mageFoundationStacks = Math.min(3, mageFoundationStacks + 1);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【靈力湧動】術式餘波回流，下一輪法術威能提升，當前 ${mageFoundationStacks} 層。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        const { createdStatuses, playerSideStatuses, enemySideStatuses } =
          resolveNormalizedSkillStatuses(
            activeSkill!,
            activeSkill!.targetType === "self" ? player.maxHp : enemy.maxHp,
            currentTimeMs
          );

        if (playerSideStatuses.length > 0) {
          playerStatuses.push(...playerSideStatuses);
        }
        if (enemySideStatuses.length > 0) {
          enemyStatuses.push(...enemySideStatuses);
        }

        createdStatuses.forEach((status) => {
          if (status.kind === "incapacitate") {
            pushCombatLog(logs, {
              turn,
              timeMs: currentTimeMs,
              isPlayer: true,
              message:
                activeSkill!.targetType === "self"
                  ? `你獲得了【${status.name}】相關加持。`
                  : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 陷入【${status.name}】！`,
              damage: 0,
              playerHp,
              playerMaxHp: player.maxHp,
              enemyHp,
              enemyMaxHp: enemy.maxHp,
            });
          }

          if (status.kind === "armorBreak") {
            pushCombatLog(logs, {
              turn,
              timeMs: currentTimeMs,
              isPlayer: true,
              message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】，護體被削弱！`,
              damage: 0,
              playerHp,
              playerMaxHp: player.maxHp,
              enemyHp,
              enemyMaxHp: enemy.maxHp,
            });
          }

          if (
            status.kind === "burn" ||
            status.kind === "poison" ||
            status.kind === "bleed" ||
            status.kind === "drain"
          ) {
            pushCombatLog(logs, {
              turn,
              timeMs: currentTimeMs,
              isPlayer: true,
              message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】！`,
              damage: 0,
              playerHp,
              playerMaxHp: player.maxHp,
              enemyHp,
              enemyMaxHp: enemy.maxHp,
            });
          }

          if (status.kind === "shield") {
            pushCombatLog(logs, {
              turn,
              timeMs: currentTimeMs,
              isPlayer: true,
              message: `你獲得了【${status.name}】，可抵擋 ${Math.floor(
                status.value
              )} 點傷害。`,
              damage: 0,
              playerHp,
              playerMaxHp: player.maxHp,
              enemyHp,
              enemyMaxHp: enemy.maxHp,
            });
          }

          if (status.kind === "critBoost") {
            pushCombatLog(logs, {
              turn,
              timeMs: currentTimeMs,
              isPlayer: true,
              message: `你凝聚了【${status.name}】，暴擊機會暫時提升。`,
              damage: 0,
              playerHp,
              playerMaxHp: player.maxHp,
              enemyHp,
              enemyMaxHp: enemy.maxHp,
            });
          }
        });

        if (
          hasMageImmortalPassive &&
          activeSkill!.profession === ProfessionType.Mage &&
          playerDamage > 0 &&
          Math.random() < 0.3
        ) {
          const repeatedDamage = Math.max(1, Math.floor(playerDamage));
          enemyHp = Math.max(0, enemyHp - repeatedDamage);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs + 1,
            isPlayer: true,
            message: `【仙法通神】術式回響，再度造成 <dmg>${repeatedDamage}</dmg> 點傷害！`,
            damage: repeatedDamage,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if (activeSkillCanonicalId === "b_ma_active" && playerDamage > 0) {
          const lifestealAmount = Math.max(
            1,
            Math.floor(playerDamage * 0.5 * (hasBodyImmortalPassive ? 1.5 : 1))
          );
          playerHp = Math.min(player.maxHp, playerHp + lifestealAmount);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【祖巫降臨】吞納戰果，你回復了 <heal>${lifestealAmount}</heal> 點氣血。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if (activeSkillCanonicalId === "b_ma_active") {
          const giantHeal = Math.max(1, Math.floor(player.maxHp * 0.35));
          playerHp = Math.min(player.maxHp, playerHp + giantHeal);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【法天象地】肉身擴張如山，回復了 <heal>${giantHeal}</heal> 點氣血並撐起巨靈護體。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if (activeSkillCanonicalId === "b_ma_active" && enemyHp > 0) {
          const siphonAmount = Math.max(1, Math.floor(enemy.maxHp * 0.1));
          enemyHp = Math.max(0, enemyHp - siphonAmount);
          playerHp = Math.min(player.maxHp, playerHp + siphonAmount);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【掌中神國】神國抽離敵方本源，額外造成 <dmg>${siphonAmount}</dmg> 點侵蝕傷害，並回復 <heal>${siphonAmount}</heal> 點氣血。`,
            damage: siphonAmount,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if (activeSkillCanonicalId === "m_tr_active" && enemyHp > 0) {
          const invertedStatuses: CombatStatus[] = [
            {
              id: "dao_bloom_break",
              name: "萬象反噬",
              kind: "armorBreak",
              value: 0.28,
              expiresAtMs: currentTimeMs + 3000,
            },
            {
              id: "dao_bloom_burn",
              name: "道火反噬",
              kind: "burn",
              value: 0.025,
              expiresAtMs: currentTimeMs + 3000,
              nextTickAtMs: currentTimeMs + 1000,
            },
          ];

          if ((enemy.affixes?.length ?? 0) >= 2 || enemy.rank === EnemyRank.Boss) {
            invertedStatuses.push({
              id: "dao_bloom_banish",
              name: "萬象寂滅",
              kind: "incapacitate",
              value: 0,
              expiresAtMs: currentTimeMs + 1000,
            });
          }

          enemyStatuses.push(...invertedStatuses);
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【一念花開】逆轉敵方氣運與護體，將其優勢翻成劫火與枯寂。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }

        if (activeSkillCanonicalId === "s_tr_active" && enemyHp <= 0) {
          activeSkillReadyAtMs = currentTimeMs;
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【破劫一擊】一擊斷劫，冷卻即刻重置。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }
      }

      const skillExecutionTimeMs =
        activeSkillTimelineProfile?.executionTimeMs ??
        getSkillExecutionTimeMs(skillReady ? activeSkill! : undefined);
      playerNextActionMs =
        currentTimeMs + Math.max(playerAttackIntervalMs, skillExecutionTimeMs);
      if (enemyHp <= 0) break;
    } else {
      if (hasIncapacitatingStatus(enemyStatuses, currentTimeMs)) {
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: false,
          message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被控制中，無法出手！`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
        enemyNextActionMs = currentTimeMs + enemyAttackIntervalMs;
        if (hasSwordHeartPassive && !playerDamagedSinceSwordHeartWindow && swordHeartStacks < 5) {
          swordHeartStacks += 1;
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message: `【養劍術】敵勢受阻，劍勢提升至第 ${swordHeartStacks} 層。`,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        }
        playerDamagedSinceSwordHeartWindow = false;
        turn++;
        continue;
      }

      const enemyContext = getEnemyAttackContext(enemy, player);
      const enemySpecialReady =
        enemy.specialAttack && currentTimeMs >= enemySpecialReadyAtMs;
      const enemySpecialTimelineProfile = enemySpecialReady
        ? getEnemySpecialTimelineProfile(enemy)
        : undefined;
      let enemyPower = enemyContext.power;
      let playerDefense =
        enemyContext.defense * getArmorBreakMultiplier(playerStatuses, currentTimeMs);
      const bodyFoundationStacks = hasBodyFoundationPassive
        ? getBodyFoundationBloodlineStacks(playerHp, player.maxHp)
        : 0;
      if (hasBodyTribulationPassive && bodyTribulationStacks > 0) {
        playerDefense *= 1 + Math.min(0.02 * bodyTribulationStacks, 1);
      }
      if (bodyFoundationStacks > 0) {
        playerDefense *= 1 + bodyFoundationStacks * 0.05;
      }
      if (eVsP.isEffective) enemyPower *= 1.12;
      if (eVsP.isResisted) enemyPower *= 0.88;
      if (hasMageEmperorPassive && enemy.element !== ElementType.None) {
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
        hasMageVoidPassive && !isDodge && Math.random() < 0.3;
      const isBlock = Math.random() * 100 < player.blockRate;

      if (isDodge || voidEvasion) {
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: false,
          message: voidEvasion
            ? `【空間法則】扭曲了攻勢，你將這次傷害轉入虛空。`
            : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 的攻勢被你避開了！`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      } else {
        if (isBlock) {
          enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.6));
        }

        let copperSkinReduced = 0;
        if (hasBodyQiPassive && enemyDamage > 0 && !enemySpecialReady) {
          copperSkinReduced = enemyDamage - Math.max(
            1,
            Math.floor(enemyDamage * getCopperSkinReductionMultiplier())
          );
          enemyDamage = Math.max(
            1,
            Math.floor(enemyDamage * getCopperSkinReductionMultiplier())
          );
        }

        let bodyFusionReduced = 0;
        if (hasBodyFusionPassive && enemyDamage > 0) {
          bodyFusionReduced = enemyDamage - Math.max(1, Math.floor(enemyDamage * 0.7));
          enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.7));
        }

        let bodySaintReduced = 0;
        if (hasBodySaintPassive && enemyDamage > player.maxHp * 0.2) {
          bodySaintReduced = enemyDamage - Math.max(1, Math.floor(enemyDamage * 0.5));
          enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
        }

        let elementalBarrierBlocked = false;
        if (enemySpecialReady && enemyDamage > 0) {
          const elementalBarrier = playerStatuses.find(
            (status) =>
              status.id === "elemental_barrier" &&
              status.kind === "shield" &&
              status.expiresAtMs > currentTimeMs &&
              status.value > 0
          );
          if (elementalBarrier) {
            elementalBarrier.value = 0;
            elementalBarrier.expiresAtMs = currentTimeMs;
            elementalBarrierBlocked = true;
            enemyDamage = 0;
          }
        }

        getIncomingDefensivePassiveMessages({
          bodyFoundationStacks,
          copperSkinReduced,
          bodyFusionReduced,
          bodySaintReduced,
          elementalBarrierBlocked,
        }).forEach((message) => {
          pushCombatLog(logs, {
            turn,
            timeMs: currentTimeMs,
            isPlayer: true,
            message,
            damage: 0,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
          });
        });

        const shieldResult = absorbDamageWithShield(
          playerStatuses,
          enemyDamage,
          currentTimeMs
        );
        enemyDamage = shieldResult.remainingDamage;

        logShieldAbsorption({
          logs,
          turn,
          timeMs: currentTimeMs,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
          absorbed: shieldResult.absorbed,
        });

        if (elementalBarrierBlocked) {
          playerStatuses = playerStatuses.filter(
            (status) =>
              !(
                status.id === "elemental_barrier" &&
                status.expiresAtMs <= currentTimeMs
              )
          );
        }

        if (
          hasSwordDeathWardPassive &&
          !swordDeathWardUsed &&
          enemyDamage >= playerHp &&
          playerMp > 0
        ) {
          const swordDeathWardResult = applySwordDeathWardTrigger({
            shouldTrigger: true,
            logs,
            turn,
            timeMs: currentTimeMs,
            preventedDamage: enemyDamage,
            playerHp,
            playerMaxHp: player.maxHp,
            playerMp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
            enemy,
          });
          swordDeathWardUsed = swordDeathWardResult.triggered;
          playerMp = swordDeathWardResult.playerMp;
          enemyDamage = swordDeathWardResult.enemyDamage ?? enemyDamage;
          enemyHp = swordDeathWardResult.enemyHp;
        }

      playerHp = Math.max(0, playerHp - enemyDamage);
      if (enemyDamage > 0) {
        playerDamagedSinceSwordHeartWindow = true;
      }
      if (
        hasBodyTribulationPassive &&
        enemyDamage > 0 &&
        bodyTribulationStacks < 50
      ) {
        bodyTribulationStacks += 1;
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【萬劫不滅】借劫煉體，防禦再疊 1 層，當前 ${bodyTribulationStacks} 層。`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }
      if (
        hasMageTribulationPassive &&
        enemyDamage > 0 &&
        enemy.element === ElementType.Metal
      ) {
        const thunderHeal = Math.max(1, Math.floor(enemyDamage * 0.35));
        playerHp = Math.min(player.maxHp, playerHp + thunderHeal);
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【雷劫煉心】借天雷反煉自身，回復了 <heal>${thunderHeal}</heal> 點氣血。`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }
      if (hasEnemyAffix(enemy, "噬生") && enemyDamage > 0) {
        const leechAmount = Math.max(1, Math.floor(enemyDamage * 0.06));
        enemyHp = Math.min(enemy.maxHp, enemyHp + leechAmount);
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: false,
          message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 的【噬生】發作，回復了 <heal>${leechAmount}</heal> 點氣血。`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }

        const fatalSurvivalResult = applyFatalSurvivalPassives({
          logs,
          turn,
          timeMs: currentTimeMs,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
          playerStatuses,
          bodyRebirthTrueAvailable:
            hasBodyRebirthTruePassive && !bodyRebirthTrueUsed,
          bodyEmperorAvailable: hasBodyEmperorPassive,
        });
        playerHp = fatalSurvivalResult.playerHp;
        playerStatuses = fatalSurvivalResult.playerStatuses;
        if (fatalSurvivalResult.bodyRebirthTrueTriggered) {
          bodyRebirthTrueUsed = true;
        }

        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: false,
          message: enemySpecialReady && enemy.specialAttack
            ? `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 施展【${enemy.specialAttack.name}】${enemySpecialTimelineProfile && enemySpecialTimelineProfile.areaShape !== "single" && enemySpecialTimelineProfile.areaShape !== "self" ? "，術式波及周遭，" : "，"}${isBlock ? "被你格擋後，" : ""}造成 <dmg>${enemyDamage}</dmg> 點傷害！`
            : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 反擊，${isBlock ? "被你格擋後，" : ""}造成 <dmg>${enemyDamage}</dmg> 點傷害！`,
          damage: enemyDamage,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });

        if (enemySpecialReady && enemy.specialAttack) {
          const enemyIncomingStatusResult = resolveIncomingEnemySpecialStatuses({
            special: enemy.specialAttack,
            player,
            passiveFlags,
            currentTimeMs,
            shortenControlDuration: hasSwordFusionPassive,
          });
          const filteredEnemyStatuses =
            enemyIncomingStatusResult.filteredStatuses;
          const normalizedIncomingStatuses =
            enemyIncomingStatusResult.normalizedIncomingStatuses;

          if (filteredEnemyStatuses.length > 0) {
            playerStatuses.push(...normalizedIncomingStatuses);
            normalizedIncomingStatuses.forEach((status) => {
              pushCombatLog(logs, {
                turn,
                timeMs: currentTimeMs,
                isPlayer: false,
                message:
                  kindToStatusMessage(status, true, enemy),
                damage: 0,
                playerHp,
                playerMaxHp: player.maxHp,
                enemyHp,
                enemyMaxHp: enemy.maxHp,
              });
            });
            if (
              hasSwordFusionPassive &&
              filteredEnemyStatuses.some((status) => status.kind === "incapacitate")
            ) {
              pushCombatLog(logs, {
                turn,
                timeMs: currentTimeMs,
                isPlayer: true,
                message: `【人劍合神】強行縮短了控制侵蝕的持續時間。`,
                damage: 0,
                playerHp,
                playerMaxHp: player.maxHp,
                enemyHp,
                enemyMaxHp: enemy.maxHp,
              });
            }
          }

          logEnemySpecialImmunityTriggers({
            logs,
            turn,
            timeMs: currentTimeMs,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
            bodyImmortalTriggered: enemyIncomingStatusResult.bodyImmortalTriggered,
            swordEmperorTriggered: enemyIncomingStatusResult.swordEmperorTriggered,
          });
        }

        const reflectValue = getReflectValue(playerStatuses, currentTimeMs);
        const isMeleeEnemyHit = (enemy.attackRange ?? 1) <= 1;
        if (
          reflectValue > 0 &&
          enemyDamage > 0 &&
          enemyHp > 0 &&
          isMeleeEnemyHit
        ) {
          const reflected = Math.max(1, Math.floor(enemyDamage * reflectValue));
          enemyHp = Math.max(0, enemyHp - reflected);
          logReflectRetaliation({
            logs,
            turn,
            timeMs: currentTimeMs,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp,
            reflected,
            enemy,
            sourceName: "荊棘皮層",
          });
        }
      }

      if (hasSwordHeartPassive && !playerDamagedSinceSwordHeartWindow && swordHeartStacks < 5) {
        swordHeartStacks += 1;
        pushCombatLog(logs, {
          turn,
          timeMs: currentTimeMs,
          isPlayer: true,
          message: `【養劍術】劍勢沉澱更深，攻勢提升至第 ${swordHeartStacks} 層。`,
          damage: 0,
          playerHp,
          playerMaxHp: player.maxHp,
          enemyHp,
          enemyMaxHp: enemy.maxHp,
        });
      }
      playerDamagedSinceSwordHeartWindow = false;

      if (enemySpecialReady && enemy.specialAttack) {
        const specialCooldown = getResolvedEnemySpecialCooldownSeconds(enemy);
        enemySpecialReadyAtMs =
          currentTimeMs +
          Math.floor(specialCooldown * 1000) +
          (enemySpecialTimelineProfile?.executionTimeMs ?? 0);
      }
      enemyNextActionMs = currentTimeMs + enemyAttackIntervalMs;
    }

    bossBroken = false;
    playerDebuffed = false;
    turn++;

    if (turn > 500) break;
  }

  const won = playerHp > 0 && enemyHp <= 0;
  if (won) {
    const exp = enemy.exp || 0;
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `<acc>擊敗了</acc> <enemy rank="${enemy.rank}">${enemy.name}</enemy>，獲得 <exp>${exp} 修為</exp>`,
      damage: 0,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    });

    let { spiritStones } = getDropRewards(enemy);
    const drops = generateDrops(enemy);
    const finalDrops: { itemId: string; count: number; instance?: ItemInstance }[] = [];

    drops.forEach((d) => {
      if (d.itemId === "spirit_stone") {
        spiritStones += d.count;
      } else {
        finalDrops.push(d);
      }
    });

    if (spiritStones > 0 || finalDrops.length > 0) {
      let lootMsg = "";

      if (spiritStones > 0) {
        lootMsg += formatSpiritStones(spiritStones);
      }

      if (finalDrops.length > 0) {
        if (lootMsg) lootMsg += "，";
        const dropNames = finalDrops.map((d) => {
          const item = getItem(d.itemId);
          const name = item ? item.name : d.itemId;
          let qStr = "";
          let qVal = 0;

          if (d.instance) {
            qVal = d.instance.quality;
          } else if (item) {
            qVal = item.quality || 0;
          }

          if (qVal === ItemQuality.Low) qStr = "(下品)";
          if (qVal === ItemQuality.Medium) qStr = "(中品)";
          if (qVal === ItemQuality.High) qStr = "(上品)";
          if (qVal === ItemQuality.Immortal) qStr = "(仙品)";

          return `<item q="${qVal}">${name}${qStr}</item>`;
        });
        lootMsg += dropNames.join("，");
      }

      pushCombatLog(logs, {
        turn,
        timeMs: currentTimeMs,
        isPlayer: true,
        message: `獲得戰利品：${lootMsg}`,
        damage: 0,
        playerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    }

    combatLogSnapshotProvider = previousSnapshotProvider;
    return { won, logs, rewards: { spiritStones, exp, drops } };
  }

  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: false,
    message: `不敵 [${enemy.name}]，身受重傷...`,
    damage: 0,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  combatLogSnapshotProvider = previousSnapshotProvider;
  return { won, logs };
};
