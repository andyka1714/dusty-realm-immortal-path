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

const createEmptyPassiveSkillBonuses = (): PassiveSkillBonuses => ({
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
});

const addPassiveSkillBonuses = (
  target: PassiveSkillBonuses,
  source: Partial<PassiveSkillBonuses>
) => {
  target.hpPercent += source.hpPercent ?? 0;
  target.mpPercent += source.mpPercent ?? 0;
  target.attackPercent += source.attackPercent ?? 0;
  target.magicPercent += source.magicPercent ?? 0;
  target.defensePercent += source.defensePercent ?? 0;
  target.resPercent += source.resPercent ?? 0;
  target.critBonus += source.critBonus ?? 0;
  target.critDamageBonus += source.critDamageBonus ?? 0;
  target.dodgeBonus += source.dodgeBonus ?? 0;
  target.damageReductionBonus += source.damageReductionBonus ?? 0;
  target.regenHpBonus += source.regenHpBonus ?? 0;
};

const FORMAL_PASSIVE_SKILL_BONUS_MAP: Record<string, Partial<PassiveSkillBonuses>> = {
  s_q_passive: {
    attackPercent: 6,
    critBonus: 2,
    critDamageBonus: 11,
  },
  s_g_passive: {
    attackPercent: 10,
    critBonus: 3,
    critDamageBonus: 17,
  },
  s_n_passive: {
    attackPercent: 12,
    critBonus: 3.4,
    critDamageBonus: 20,
  },
  s_sf_passive: {
    attackPercent: 14,
    critBonus: 4,
    critDamageBonus: 23,
  },
  s_tr_passive: {
    attackPercent: 20,
    critBonus: 5.8,
    critDamageBonus: 32,
  },
  s_bi_passive: {
    attackPercent: 22,
    critBonus: 6.2,
    critDamageBonus: 35,
  },
  s_vr_passive: {
    attackPercent: 24,
    critBonus: 6.8,
    critDamageBonus: 38,
  },
  s_ma_passive: {
    attackPercent: 26,
    critBonus: 7.4,
    critDamageBonus: 42,
  },
  s_im_passive: {
    attackPercent: 29,
    critBonus: 8.2,
    critDamageBonus: 46,
  },
  s_ie_passive: {
    attackPercent: 32,
    critBonus: 9,
    critDamageBonus: 50,
  },
  b_q_passive: {
    damageReductionBonus: 1,
  },
  b_f_passive: {
    hpPercent: 11,
    defensePercent: 8,
    damageReductionBonus: 1,
  },
  b_g_passive: {
    hpPercent: 14,
    defensePercent: 10,
    damageReductionBonus: 1,
  },
  b_n_passive: {
    hpPercent: 17,
    defensePercent: 12,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_sf_passive: {
    hpPercent: 20,
    defensePercent: 14,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_tr_passive: {
    hpPercent: 23,
    defensePercent: 16,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_bi_passive: {
    hpPercent: 26,
    defensePercent: 18,
    damageReductionBonus: 2,
    regenHpBonus: 1,
  },
  b_vr_passive: {
    hpPercent: 30,
    defensePercent: 20,
    damageReductionBonus: 2,
    regenHpBonus: 2,
  },
  b_ma_passive: {
    hpPercent: 34,
    defensePercent: 22,
    damageReductionBonus: 2,
    regenHpBonus: 2,
  },
  b_im_passive: {
    hpPercent: 38,
    defensePercent: 24,
    damageReductionBonus: 3,
    regenHpBonus: 2,
  },
  b_ie_passive: {
    hpPercent: 42,
    defensePercent: 26,
    damageReductionBonus: 3,
    regenHpBonus: 3,
  },
  m_q_passive: {
    magicPercent: 9,
    mpPercent: 10,
    resPercent: 6,
    critDamageBonus: 6,
  },
  m_f_passive: {
    magicPercent: 16,
    mpPercent: 18,
    resPercent: 10,
    critDamageBonus: 12,
  },
  m_g_passive: {
    magicPercent: 15,
    mpPercent: 18,
    resPercent: 10,
    critDamageBonus: 10,
  },
  m_n_passive: {
    magicPercent: 18,
    mpPercent: 22,
    resPercent: 12,
    critDamageBonus: 12,
  },
  m_sf_passive: {
    magicPercent: 21,
    mpPercent: 26,
    resPercent: 14,
    critDamageBonus: 14,
    dodgeBonus: 1,
  },
  m_tr_passive: {
    magicPercent: 24,
    mpPercent: 30,
    resPercent: 16,
    critDamageBonus: 16,
    dodgeBonus: 1,
  },
  m_bi_passive: {
    magicPercent: 27,
    mpPercent: 34,
    resPercent: 18,
    critDamageBonus: 18,
    dodgeBonus: 2,
  },
  m_vr_passive: {
    magicPercent: 30,
    mpPercent: 38,
    resPercent: 20,
    critDamageBonus: 20,
    dodgeBonus: 2,
  },
  m_ma_passive: {
    magicPercent: 33,
    mpPercent: 42,
    resPercent: 22,
    critDamageBonus: 22,
    dodgeBonus: 2,
  },
  m_im_passive: {
    magicPercent: 36,
    mpPercent: 46,
    resPercent: 24,
    critDamageBonus: 24,
    dodgeBonus: 3,
  },
  m_ie_passive: {
    magicPercent: 40,
    mpPercent: 50,
    resPercent: 26,
    critDamageBonus: 26,
    dodgeBonus: 3,
  },
};

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
  const bonuses = createEmptyPassiveSkillBonuses();

  learnedSkills
    .filter((skill) => skill.type === "Passive" && skill.profession)
    .forEach((skill) => {
      addPassiveSkillBonuses(
        bonuses,
        FORMAL_PASSIVE_SKILL_BONUS_MAP[getFormalSkillId(skill.id)] ?? {}
      );
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

const hasExactPassiveSkillId = (learnedSkills: Skill[], skillIds: string | string[]) => {
  const acceptedIds = new Set(Array.isArray(skillIds) ? skillIds : [skillIds]);
  return learnedSkills.some(
    (skill) => skill.type === "Passive" && acceptedIds.has(skill.id)
  );
};

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
  hasMageSpiritSeveringPassive: boolean;
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

const PLAYER_PASSIVE_FLAG_SKILL_IDS: Record<keyof PlayerPassiveFlags, string | string[]> = {
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
  hasSwordHeartPassive: ["s_f_passive", "s_g_passive"],
  hasBodySaintPassive: "b_sf_passive",
  hasMageSpiritSeveringPassive: "m_sf_passive",
  hasSwordFusionPassive: ["s_bi_passive", "s_tr_passive"],
  hasSwordVoidPassive: ["s_vr_passive", "s_tr_passive"],
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
  hasSwordEmperorPassive: ["s_ie_passive", "s_tr_passive"],
  hasMageEmperorPassive: ["m_ie_passive", "m_sf_passive"],
};

const getPlayerPassiveFlags = (learnedSkills: Skill[]): PlayerPassiveFlags =>
  Object.fromEntries(
    Object.entries(PLAYER_PASSIVE_FLAG_SKILL_IDS).map(([flagName, skillId]) => [
      flagName,
      hasExactPassiveSkillId(learnedSkills, skillId),
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

const isManaSpringEmpowered = (
  currentMp: number,
  maxMp: number,
  passiveFlags: Pick<PlayerPassiveFlags, "hasManaSpringPassive">
) => passiveFlags.hasManaSpringPassive && currentMp >= maxMp * 0.8;

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
    mageTribulationControlTriggered: boolean;
    swordFusionControlTriggered: boolean;
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
    mageTribulationControlTriggered,
    swordFusionControlTriggered,
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

  if (mageTribulationControlTriggered) {
    statusNames.push("雷劫煉心");
  }

  if (swordFusionControlTriggered) {
    statusNames.push("人劍合神");
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

const getEnemyWorldIncomingStatusNames = ({
  bodyImmortalTriggered,
  swordEmperorTriggered,
}: {
  bodyImmortalTriggered: boolean;
  swordEmperorTriggered: boolean;
}) => {
  const statusNames: string[] = [];

  if (bodyImmortalTriggered) {
    statusNames.push("仙體無垢");
  }

  if (swordEmperorTriggered) {
    statusNames.push("萬法皆空");
  }

  return statusNames;
};

const getPlayerWorldProfessionPassiveStatusNames = (options: {
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

  if (passiveFlags.hasSwordMahayanaPassive && isCrit) {
    statusNames.push("劍道獨尊");
  }

  if (
    passiveFlags.hasSwordGoldenPassive &&
    isCrit &&
    dealsDirectDamage &&
    skill?.profession === ProfessionType.Sword
  ) {
    statusNames.push("劍心通明");
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

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageSpiritSeveringPassive) {
    statusNames.push("道法自然");
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

  if (!skill && passiveFlags.hasSwordEchoPassive && dealsDirectDamage) {
    statusNames.push("劍意化形");
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

const createPlayerAttackLogMessage = ({
  player,
  skillReady,
  activeSkill,
  isCrit,
  playerDamage,
}: {
  player: PlayerCombatStats;
  skillReady: boolean;
  activeSkill?: Skill;
  isCrit: boolean;
  playerDamage: number;
}) => {
  if (!skillReady || !activeSkill) {
    return `<player>${player.name}</player> 發動攻擊，${isCrit ? "暴擊！" : ""}造成 <dmg>${playerDamage}</dmg> 點傷害！`;
  }

  if (activeSkill.effectType === "damage" || activeSkill.damageMultiplier !== undefined) {
    return `<player>${player.name}</player> 施展【${activeSkill.name}】${activeSkill.areaShape && activeSkill.areaShape !== "single" && activeSkill.areaShape !== "self" ? "，範圍術式震盪四散，" : "，"}${isCrit ? "暴擊！" : ""}造成 <dmg>${playerDamage}</dmg> 點傷害！`;
  }

  return `<player>${player.name}</player> 施展【${activeSkill.name}】，靈力在戰場上激盪開來！`;
};

const logSwordQiArmorBreak = ({
  shouldTrigger,
  logs,
  turn,
  timeMs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  shouldTrigger: boolean;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (!shouldTrigger) return;

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: `【劍脈初成】劍勢貫通護體，為 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 施加【劍脈破甲】。`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
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

  const mageTribulationControlTriggered =
    passiveFlags.hasMageTribulationPassive &&
    createdStatuses.some((status) => status.kind === "incapacitate") &&
    filteredStatuses.every((status) => status.kind !== "incapacitate");

  return {
    filteredStatuses,
    bodyImmortalTriggered,
    swordEmperorTriggered,
    mageTribulationControlTriggered,
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

const applyEnemySpecialStatusApplication = ({
  special,
  player,
  passiveFlags,
  currentTimeMs,
  shortenControlDuration,
  container,
  logs,
  turn,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  special?: Enemy["specialAttack"];
  player: PlayerCombatStats;
  passiveFlags: PlayerPassiveFlags;
  currentTimeMs: number;
  shortenControlDuration: boolean;
  container: CombatStatus[];
  logs: CombatLog[];
  turn: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  const enemyIncomingStatusResult = resolveIncomingEnemySpecialStatuses({
    special,
    player,
    passiveFlags,
    currentTimeMs,
    shortenControlDuration,
  });

  if (enemyIncomingStatusResult.filteredStatuses.length > 0) {
    appendAndLogCombatStatuses({
      container,
      statuses: enemyIncomingStatusResult.normalizedIncomingStatuses,
      logs,
      turn,
      timeMs: currentTimeMs,
      isPlayer: false,
      targetIsPlayer: true,
      enemy,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  logEnemySpecialResistanceTriggers({
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    bodyImmortalTriggered: enemyIncomingStatusResult.bodyImmortalTriggered,
    swordEmperorTriggered: enemyIncomingStatusResult.swordEmperorTriggered,
    mageTribulationControlTriggered:
      enemyIncomingStatusResult.mageTribulationControlTriggered,
    swordFusionControlTriggered:
      enemyIncomingStatusResult.swordFusionControlTriggered,
  });

  return enemyIncomingStatusResult;
};

const logEnemySpecialResistanceTriggers = ({
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  bodyImmortalTriggered,
  swordEmperorTriggered,
  mageTribulationControlTriggered,
  swordFusionControlTriggered,
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
  mageTribulationControlTriggered: boolean;
  swordFusionControlTriggered: boolean;
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

  if (mageTribulationControlTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【雷劫煉心】雷痕護住識海，你直接掙脫了控制侵蝕。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (swordFusionControlTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【人劍合神】強行縮短了控制侵蝕的持續時間。`,
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
  const { passiveFlags, skill } = options;
  const statusNames = getPlayerWorldProfessionPassiveStatusNames(options);

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageMahayanaPassive) {
    statusNames.unshift("言出法隨");
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

const resolvePlayerOffenseRoll = ({
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
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
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

const resolveEnemyOffenseRoll = ({
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
  enemyStatuses: CombatStatus[];
  playerStatuses: CombatStatus[];
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

const resolvePlayerActiveAftermath = ({
  player,
  skillReady,
  activeSkill,
  activeSkillCanonicalId,
  currentTimeMs,
  turn,
  logs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  enemyStatuses,
  playerMp,
  playerDamage,
  effectiveDefense,
  pVsE,
  enemyElementalAffinity,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  isCrit,
  dealsDirectDamage,
  passiveFlags,
}: {
  player: PlayerCombatStats;
  skillReady: boolean;
  activeSkill?: Skill;
  activeSkillCanonicalId?: string;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  playerMp: number;
  playerDamage: number;
  effectiveDefense: number;
  pVsE: ReturnType<typeof getRestriction>;
  enemyElementalAffinity: ReturnType<typeof getEnemyElementalModifier>;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  isCrit: boolean;
  dealsDirectDamage: boolean;
  passiveFlags: PlayerPassiveFlags;
}) => {
  if (!skillReady || !activeSkill) {
    return {
      enemyHp,
      playerHp,
      playerStatuses,
      enemyStatuses,
      playerMp,
      activeSkillReadyAtMs,
      mageFoundationStacks,
    };
  }

  ({
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  } = resolvePlayerActiveResourceFlow({
    activeSkill,
    activeSkillCanonicalId,
    player,
    playerMp,
    currentTimeMs,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    isCrit,
    logs,
    turn,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    hasMageFusionPassive: passiveFlags.hasMageFusionPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
    hasSwordGoldenPassive: passiveFlags.hasSwordGoldenPassive,
    hasMageFoundationPassive: passiveFlags.hasMageFoundationPassive,
  }));

  const { playerSideStatuses, filteredEnemyStatuses } =
    resolvePlayerSkillStatusApplication({
      skill: activeSkill,
      targetMaxHp:
        activeSkill.targetType === "self" ? playerMaxHp : enemyMaxHp,
      enemy,
      passiveFlags,
      dealsDirectDamage,
      isCrit,
      currentTimeMs,
      enemyHp,
    });

  appendAndLogCombatStatuses({
    container: playerStatuses,
    statuses: playerSideStatuses,
    logs,
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    targetIsPlayer: true,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  appendAndLogCombatStatuses({
    container: enemyStatuses,
    statuses: filteredEnemyStatuses,
    logs,
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    targetIsPlayer: false,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  if (
    passiveFlags.hasMageImmortalPassive &&
    activeSkill.profession === ProfessionType.Mage &&
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
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  ({
    enemyHp,
    playerHp,
    activeSkillReadyAtMs,
  } = applyPlayerActiveFollowupEffects({
    activeSkillCanonicalId,
    playerDamage,
    currentTimeMs,
    enemy,
    enemyHp,
    playerHp,
    playerMaxHp,
    turn,
    logs,
    hasBodyImmortalPassive: passiveFlags.hasBodyImmortalPassive,
    enemyStatuses,
    activeSkillReadyAtMs,
  }));

  enemyHp = applyPlayerEchoAndSummonFollowupEffects({
    skillReady,
    activeSkillCanonicalId,
    hasSwordEchoPassive: passiveFlags.hasSwordEchoPassive,
    currentTimeMs,
    turn,
    logs,
    player,
    enemy,
    enemyHp,
    playerHp,
    playerMaxHp,
    playerDamage,
    effectiveDefense,
    enemyStatuses,
    pVsE,
    enemyElementalAffinity,
  });

  return {
    enemyHp,
    playerHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  };
};

const resolveEnemyIncapacitatedTurn = ({
  currentTimeMs,
  enemy,
  enemyAttackIntervalMs,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  currentTimeMs: number;
  enemy: Enemy;
  enemyAttackIntervalMs: number;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: false,
    message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被控制中，無法出手！`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  if (hasSwordHeartPassive && !playerDamagedSinceSwordHeartWindow) {
    swordHeartStacks = applySwordHeartUpkeep({
      swordHeartStacks,
      logs,
      turn,
      timeMs: currentTimeMs,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
      blockedMessage:
        "【養劍術】劍勢已滿，當前回合的停滯不再繼續積蓄殺機。",
      stackingMessage: (nextStacks) =>
        `【養劍術】敵勢受阻，劍勢提升至第 ${nextStacks} 層。`,
    });
  }

  return {
    enemyNextActionMs: currentTimeMs + enemyAttackIntervalMs,
    swordHeartStacks,
    playerDamagedSinceSwordHeartWindow: false,
  };
};

const resolveTurnStartMaintenance = ({
  currentTimeMs,
  turn,
  processStatusTicks,
  player,
  enemy,
  logs,
  getPlayerHp,
  getPlayerMp,
  setPlayerHp,
  setPlayerMp,
  getEnemyHp,
  getPlayerStatuses,
  setPlayerStatuses,
  getLastRegenTimeMs,
  setLastRegenTimeMs,
  hasBodyRebirthPassive,
  hasManaSpringPassive,
  hasMageFusionPassive,
  hasBodyImmortalPassive,
  hasBodyAncientPassive,
}: {
  currentTimeMs: number;
  turn: number;
  processStatusTicks: (currentMs: number) => void;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  getPlayerHp: () => number;
  getPlayerMp: () => number;
  setPlayerHp: (value: number) => void;
  setPlayerMp: (value: number) => void;
  getEnemyHp: () => number;
  getPlayerStatuses: () => CombatStatus[];
  setPlayerStatuses: (value: CombatStatus[]) => void;
  getLastRegenTimeMs: () => number;
  setLastRegenTimeMs: (value: number) => void;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasBodyAncientPassive: boolean;
}) => {
  processStatusTicks(currentTimeMs);
  if (getPlayerHp() <= 0 || getEnemyHp() <= 0) {
    return { combatEnded: true };
  }

  const upkeepResult = applyPassiveRegenAndCleanse({
    player,
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp: getPlayerHp(),
    playerMp: getPlayerMp(),
    enemyHp: getEnemyHp(),
    enemyMaxHp: enemy.maxHp,
    playerStatuses: getPlayerStatuses(),
    lastRegenTimeMs: getLastRegenTimeMs(),
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
    hasBodyImmortalPassive,
    hasBodyAncientPassive,
  });

  setPlayerHp(upkeepResult.playerHp);
  setPlayerMp(upkeepResult.playerMp);
  setPlayerStatuses(upkeepResult.playerStatuses);
  setLastRegenTimeMs(upkeepResult.lastRegenTimeMs);

  return { combatEnded: false };
};

const resolvePlayerTurnPrelude = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  pVsE,
  bossBroken,
  playerHp,
  playerStatuses,
  nextSwordImmortalGuardAtMs,
  hasSwordImmortalPassive,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  pVsE: { isEffective: boolean; isResisted: boolean };
  bossBroken: boolean;
  playerHp: number;
  playerStatuses: CombatStatus[];
  nextSwordImmortalGuardAtMs: number;
  hasSwordImmortalPassive: boolean;
}) => {
  ({ playerStatuses, nextSwordImmortalGuardAtMs } = applyPeriodicPassiveStatuses({
    logs,
    turn,
    timeMs: currentTimeMs,
    player,
    playerHp,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.maxHp,
    playerStatuses,
    hasSwordImmortalPassive,
    nextSwordImmortalGuardAtMs,
  }));

  bossBroken = rollBossBreakOpportunity({
    enemy,
    restriction: pVsE,
    bossBroken,
    currentTimeMs,
    turn,
    logs,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.maxHp,
  });

  return {
    playerStatuses,
    nextSwordImmortalGuardAtMs,
    bossBroken,
  };
};

const resolveEnemyActionWindow = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerStatuses,
  enemyStatuses,
  playerHp,
  playerMp,
  enemyHp,
  enemyAttackIntervalMs,
  enemySpecialReadyAtMs,
  bodyTribulationStacks,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  enemyAttackIntervalMs: number;
  enemySpecialReadyAtMs: number;
  bodyTribulationStacks: number;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
}) => {
  if (hasIncapacitatingStatus(enemyStatuses, currentTimeMs)) {
    return {
      skipped: true as const,
      ...resolveEnemyIncapacitatedTurn({
        currentTimeMs,
        enemy,
        enemyAttackIntervalMs,
        hasSwordHeartPassive,
        playerDamagedSinceSwordHeartWindow,
        swordHeartStacks,
        logs,
        turn,
        playerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp: enemy.maxHp,
      }),
    };
  }

  enemySpecialReadyAtMs = applyEnemySpecialTimingDelay({
    logs,
    turn,
    timeMs: currentTimeMs,
    enemy,
    enemyStatuses,
    enemySpecialReadyAtMs,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });
  const enemySpecialReady =
    enemy.specialAttack && currentTimeMs >= enemySpecialReadyAtMs;
  const enemySpecialTimelineProfile = enemySpecialReady
    ? getEnemySpecialTimelineProfile(enemy)
    : undefined;
  const offenseRoll = resolveEnemyOffenseRoll({
    enemy,
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    enemyStatuses,
    playerStatuses,
    currentTimeMs,
    enemySpecialReady: Boolean(enemySpecialReady),
    enemySpecialTimelineProfile: enemySpecialTimelineProfile ?? undefined,
    passiveFlags,
    bodyTribulationStacks,
  });

  return {
    skipped: false as const,
    enemySpecialReadyAtMs,
    enemySpecialReady: Boolean(enemySpecialReady),
    enemySpecialTimelineProfile,
    ...offenseRoll,
  };
};

const resolveEnemyActionPhase = ({
  enemyActionWindow,
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  swordDeathWardUsed,
  bodyTribulationStacks,
  bodyRebirthTrueUsed,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  enemyAttackIntervalMs,
}: {
  enemyActionWindow: Exclude<
    ReturnType<typeof resolveEnemyActionWindow>,
    { skipped: true }
  >;
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  enemyAttackIntervalMs: number;
}) => {
  let {
    enemyDamage,
    isDodge,
    voidEvasion,
    isBlock,
    bodyFoundationStacks,
  } = enemyActionWindow;

  ({
    enemyDamage,
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
  } = resolveEnemyTurnAftermath({
    enemyDamage,
    isDodge,
    voidEvasion,
    isBlock,
    enemySpecialReady: Boolean(enemyActionWindow.enemySpecialReady),
    currentTimeMs,
    turn,
    logs,
    enemy,
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    passiveFlags,
    bodyFoundationStacks,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
  }));
  if (enemyDamage > 0 && !isDodge && !voidEvasion) {
    playerDamagedSinceSwordHeartWindow = true;
  }

  if (hasSwordHeartPassive && !playerDamagedSinceSwordHeartWindow) {
    swordHeartStacks = applySwordHeartUpkeep({
      swordHeartStacks,
      logs,
      turn,
      timeMs: currentTimeMs,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
      blockedMessage:
        "【養劍術】劍勢已滿，敵招雖過，劍意已抵當前可凝的極限。",
      stackingMessage: (nextStacks) =>
        `【養劍術】劍勢沉澱更深，攻勢提升至第 ${nextStacks} 層。`,
    });
  }
  playerDamagedSinceSwordHeartWindow = false;

  let enemySpecialReadyAtMs = enemyActionWindow.enemySpecialReadyAtMs;
  if (enemyActionWindow.enemySpecialReady && enemy.specialAttack) {
    const specialCooldown = getResolvedEnemySpecialCooldownSeconds(enemy);
    enemySpecialReadyAtMs =
      currentTimeMs +
      Math.floor(specialCooldown * 1000) +
      (enemyActionWindow.enemySpecialTimelineProfile?.executionTimeMs ?? 0);
  }

  return {
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    enemyStatuses,
    swordDeathWardUsed,
    bodyTribulationStacks,
    bodyRebirthTrueUsed,
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
    enemySpecialReadyAtMs,
    enemyNextActionMs: currentTimeMs + enemyAttackIntervalMs,
  };
};

const resolvePlayerTurn = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  pVsE,
  bossBroken,
  playerDebuffed,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  swordHeartStacks,
  playerAttackIntervalMs,
  hasMageFusionPassive,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  pVsE: { isEffective: boolean; isResisted: boolean };
  bossBroken: boolean;
  playerDebuffed: boolean;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  activeSkill?: Skill;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  playerAttackIntervalMs: number;
  hasMageFusionPassive: boolean;
}) => {
  const { skillReady, activeSkillTimelineProfile, activeSkillCanonicalId } =
    resolvePlayerActiveSkillWindow({
      activeSkill,
      currentTimeMs,
      activeSkillReadyAtMs,
      playerMp,
      hasMageFusionPassive,
    });

  const {
    dealsDirectDamage,
    effectiveDefense,
    bodyFoundationStacks,
    voidSwordProc,
    manaSpringEmpowered,
    hasSwordQiChain,
    activeSwordQiStatuses,
    isCrit,
    playerDamage,
    pVsE: playerRestriction,
    enemyElementalAffinity: playerEnemyElementalAffinity,
  } = resolvePlayerOffenseRoll({
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    activeSkill: activeSkill ?? undefined,
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
  });

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
    hasMageMahayanaPassive: passiveFlags.hasMageMahayanaPassive,
    hasSwordMahayanaPassive: passiveFlags.hasSwordMahayanaPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
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
    message: createPlayerAttackLogMessage({
      player,
      skillReady,
      activeSkill: activeSkill ?? undefined,
      isCrit,
      playerDamage,
    }),
    damage: playerDamage,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  logSwordQiArmorBreak({
    shouldTrigger: shouldApplySwordQiArmorBreak({
      passiveFlags,
      skill: skillReady ? activeSkill ?? undefined : undefined,
      isCrit,
      enemyHp,
    }),
    logs,
    turn,
    timeMs: currentTimeMs,
    enemy,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  if (
    logPlayerSwordResonance({
      skillReady,
      activeSkillCanonicalId,
      activeSwordQiStatuses,
      hasSwordQiChain,
      currentTimeMs,
      logs,
      turn,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    })
  ) {
    playerStatuses = playerStatuses.filter(
      (status) =>
        !(
          status.kind === "critBoost" &&
          status.expiresAtMs > currentTimeMs
        )
    );
  }

  ({
    enemyHp,
    playerHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  } = resolvePlayerActiveAftermath({
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    skillReady,
    activeSkill: activeSkill ?? undefined,
    activeSkillCanonicalId,
    currentTimeMs,
    turn,
    logs,
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    playerDamage,
    effectiveDefense,
    pVsE: playerRestriction,
    enemyElementalAffinity: playerEnemyElementalAffinity,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    isCrit,
    dealsDirectDamage,
    passiveFlags,
  }));

  const skillExecutionTimeMs =
    activeSkillTimelineProfile?.executionTimeMs ??
    getSkillExecutionTimeMs(skillReady ? activeSkill! : undefined);

  return {
    enemyHp,
    playerHp,
    playerMp,
    playerStatuses,
    enemyStatuses,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    playerNextActionMs:
      currentTimeMs + Math.max(playerAttackIntervalMs, skillExecutionTimeMs),
  };
};

const resolvePlayerActionPhase = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  pVsE,
  bossBroken,
  playerDebuffed,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  swordHeartStacks,
  playerAttackIntervalMs,
  nextSwordImmortalGuardAtMs,
  hasMageFusionPassive,
  hasSwordImmortalPassive,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  pVsE: { isEffective: boolean; isResisted: boolean };
  bossBroken: boolean;
  playerDebuffed: boolean;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  activeSkill?: Skill;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  playerAttackIntervalMs: number;
  nextSwordImmortalGuardAtMs: number;
  hasMageFusionPassive: boolean;
  hasSwordImmortalPassive: boolean;
}) => {
  ({
    playerStatuses,
    nextSwordImmortalGuardAtMs,
    bossBroken,
  } = resolvePlayerTurnPrelude({
    currentTimeMs,
    turn,
    player,
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    logs,
    pVsE,
    bossBroken,
    playerHp,
    playerStatuses,
    nextSwordImmortalGuardAtMs,
    hasSwordImmortalPassive,
  }));

  const playerTurnResult = resolvePlayerTurn({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    pVsE,
    bossBroken,
    playerDebuffed,
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    enemyStatuses,
    activeSkill,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    swordHeartStacks,
    playerAttackIntervalMs,
    hasMageFusionPassive,
  });

  return {
    ...playerTurnResult,
    nextSwordImmortalGuardAtMs,
    bossBroken,
  };
};

const resolvePlayerTurnPhase = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  pVsE,
  bossBroken,
  playerDebuffed,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  swordHeartStacks,
  playerAttackIntervalMs,
  nextSwordImmortalGuardAtMs,
  hasMageFusionPassive,
  hasSwordImmortalPassive,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  pVsE: { isEffective: boolean; isResisted: boolean };
  bossBroken: boolean;
  playerDebuffed: boolean;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  activeSkill?: Skill;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  playerAttackIntervalMs: number;
  nextSwordImmortalGuardAtMs: number;
  hasMageFusionPassive: boolean;
  hasSwordImmortalPassive: boolean;
}) =>
  resolvePlayerActionPhase({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    pVsE,
    bossBroken,
    playerDebuffed,
    playerHp,
    playerMp,
    enemyHp,
    playerStatuses,
    enemyStatuses,
    activeSkill,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    swordHeartStacks,
    playerAttackIntervalMs,
    nextSwordImmortalGuardAtMs,
    hasMageFusionPassive,
    hasSwordImmortalPassive,
  });

const resolveEnemyTurnPhase = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  swordDeathWardUsed,
  bodyTribulationStacks,
  bodyRebirthTrueUsed,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  enemyAttackIntervalMs,
  enemySpecialReadyAtMs,
}: {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatus[];
  enemyStatuses: CombatStatus[];
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  enemyAttackIntervalMs: number;
  enemySpecialReadyAtMs: number;
}) => {
  const enemyActionWindow = resolveEnemyActionWindow({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    playerStatuses,
    enemyStatuses,
    playerHp,
    playerMp,
    enemyHp,
    enemyAttackIntervalMs,
    enemySpecialReadyAtMs,
    bodyTribulationStacks,
    hasSwordHeartPassive,
    playerDamagedSinceSwordHeartWindow,
    swordHeartStacks,
  });

  if (enemyActionWindow.skipped) {
    return {
      skipped: true as const,
      enemyNextActionMs: enemyActionWindow.enemyNextActionMs,
      swordHeartStacks: enemyActionWindow.swordHeartStacks,
      playerDamagedSinceSwordHeartWindow:
        enemyActionWindow.playerDamagedSinceSwordHeartWindow,
    };
  }

  const resolvedEnemyActionWindow = enemyActionWindow as Exclude<
    ReturnType<typeof resolveEnemyActionWindow>,
    { skipped: true }
  >;

  return {
    skipped: false as const,
    ...resolveEnemyActionPhase({
      enemyActionWindow: resolvedEnemyActionWindow,
      currentTimeMs,
      turn,
      player: {
        ...player,
        hp: playerHp,
        mp: playerMp,
      },
      enemy,
      logs,
      passiveFlags,
      playerHp,
      playerMp,
      enemyHp,
      playerStatuses,
      enemyStatuses,
      swordDeathWardUsed,
      bodyTribulationStacks,
      bodyRebirthTrueUsed,
      hasSwordHeartPassive,
      playerDamagedSinceSwordHeartWindow,
      swordHeartStacks,
      enemyAttackIntervalMs,
    }),
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

const buildVictoryLootMessage = (
  spiritStones: number,
  drops: { itemId: string; count: number; instance?: ItemInstance }[]
) => {
  let lootMsg = "";

  if (spiritStones > 0) {
    lootMsg += formatSpiritStones(spiritStones);
  }

  if (drops.length > 0) {
    if (lootMsg) lootMsg += "，";
    const dropNames = drops.map((d) => {
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

  return lootMsg;
};

const resolveVictoryRewards = ({
  enemy,
  logs,
  turn,
  currentTimeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
}: {
  enemy: Enemy;
  logs: CombatLog[];
  turn: number;
  currentTimeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
}) => {
  const exp = enemy.exp || 0;
  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    message: `<acc>擊敗了</acc> <enemy rank="${enemy.rank}">${enemy.name}</enemy>，獲得 <exp>${exp} 修為</exp>`,
    damage: 0,
    playerHp,
    playerMaxHp,
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
    const lootMsg = buildVictoryLootMessage(spiritStones, finalDrops);

    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `獲得戰利品：${lootMsg}`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  return { spiritStones, exp, drops };
};

const createCombatDefeatLog = ({
  logs,
  turn,
  currentTimeMs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
}: {
  logs: CombatLog[];
  turn: number;
  currentTimeMs: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
}) => {
  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: false,
    message: `不敵 [${enemy.name}]，身受重傷...`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });
};

const finalizeCombatResult = ({
  won,
  logs,
  turn,
  currentTimeMs,
  player,
  enemy,
  playerHp,
  enemyHp,
  previousSnapshotProvider,
}: {
  won: boolean;
  logs: CombatLog[];
  turn: number;
  currentTimeMs: number;
  player: PlayerCombatStats;
  enemy: Enemy;
  playerHp: number;
  enemyHp: number;
  previousSnapshotProvider?: typeof combatLogSnapshotProvider;
}) => {
  if (won) {
    const { spiritStones, exp, drops } = resolveVictoryRewards({
      enemy,
      logs,
      turn,
      currentTimeMs,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
    });

    combatLogSnapshotProvider = previousSnapshotProvider;
    return { won, logs, rewards: { spiritStones, exp, drops } };
  }

  createCombatDefeatLog({
    logs,
    turn,
    currentTimeMs,
    enemy,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
  });

  combatLogSnapshotProvider = previousSnapshotProvider;
  return { won, logs };
};

const resolvePlayerActiveSkillWindow = ({
  activeSkill,
  currentTimeMs,
  activeSkillReadyAtMs,
  playerMp,
  hasMageFusionPassive,
}: {
  activeSkill?: Skill;
  currentTimeMs: number;
  activeSkillReadyAtMs: number;
  playerMp: number;
  hasMageFusionPassive: boolean;
}) => {
  const skillReady =
    Boolean(activeSkill) &&
    currentTimeMs >= activeSkillReadyAtMs &&
    (playerMp >= (activeSkill?.cost || 0) ||
      (hasMageFusionPassive &&
        activeSkill?.profession === ProfessionType.Mage));

  if (!skillReady || !activeSkill) {
    return {
      skillReady: false,
      activeSkillTimelineProfile: undefined,
      activeSkillCanonicalId: undefined,
    };
  }

  return {
    skillReady: true,
    activeSkillTimelineProfile: getSkillTimelineProfile(activeSkill),
    activeSkillCanonicalId: getCanonicalSkillId(activeSkill),
  };
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

const createCombatSnapshotProvider = ({
  activeSkill,
  playerStatusesRef,
  enemyStatusesRef,
  activeSkillReadyAtMsRef,
  learnedSkills,
}: {
  activeSkill?: Skill;
  playerStatusesRef: () => CombatStatus[];
  enemyStatusesRef: () => CombatStatus[];
  activeSkillReadyAtMsRef: () => number;
  learnedSkills: Skill[];
}) => (snapshotTimeMs: number) => ({
  playerStatuses: getCombatStatusSnapshot(playerStatusesRef(), snapshotTimeMs),
  enemyStatuses: getCombatStatusSnapshot(enemyStatusesRef(), snapshotTimeMs),
  playerActiveSkillName: activeSkill?.name,
  playerActiveSkillCooldownRemainingMs: activeSkill
    ? Math.max(0, activeSkillReadyAtMsRef() - snapshotTimeMs)
    : 0,
  playerActiveSkillCooldownTotalMs: activeSkill
    ? Math.floor(getResolvedSkillCooldownSeconds(activeSkill, learnedSkills) * 1000)
    : 0,
});

const createStatusTickProcessor = ({
  getTurn,
  logs,
  player,
  enemy,
  passiveFlags,
  getPlayerHp,
  getEnemyHp,
  setPlayerHp,
  setEnemyHp,
  getPlayerStatuses,
  setPlayerStatuses,
  getEnemyStatuses,
  setEnemyStatuses,
  getLastStatusTickMs,
  setLastStatusTickMs,
  getPlayerDamagedSinceSwordHeartWindow,
  setPlayerDamagedSinceSwordHeartWindow,
}: {
  getTurn: () => number;
  logs: CombatLog[];
  player: PlayerCombatStats;
  enemy: Enemy;
  passiveFlags: PlayerPassiveFlags;
  getPlayerHp: () => number;
  getEnemyHp: () => number;
  setPlayerHp: (value: number) => void;
  setEnemyHp: (value: number) => void;
  getPlayerStatuses: () => CombatStatus[];
  setPlayerStatuses: (value: CombatStatus[]) => void;
  getEnemyStatuses: () => CombatStatus[];
  setEnemyStatuses: (value: CombatStatus[]) => void;
  getLastStatusTickMs: () => number;
  setLastStatusTickMs: (value: number) => void;
  getPlayerDamagedSinceSwordHeartWindow: () => boolean;
  setPlayerDamagedSinceSwordHeartWindow: (value: boolean) => void;
}) => {
  const cleanupExpiredStatuses = (currentMs: number) => {
    setPlayerStatuses(
      getPlayerStatuses().filter(
        (status) =>
          status.expiresAtMs > currentMs &&
          (status.kind !== "shield" || status.value > 0)
      )
    );
    setEnemyStatuses(
      getEnemyStatuses().filter(
        (status) =>
          status.expiresAtMs > currentMs &&
          (status.kind !== "shield" || status.value > 0)
      )
    );
  };

  return (currentMs: number) => {
    while (
      getLastStatusTickMs() + 1000 <= currentMs &&
      getPlayerHp() > 0 &&
      getEnemyHp() > 0
    ) {
      const tickMs = getLastStatusTickMs() + 1000;
      setLastStatusTickMs(tickMs);

      cleanupExpiredStatuses(tickMs);

      const enemyTickResult = applyStatusTickBatch({
        statuses: getEnemyStatuses(),
        tickMs,
        targetIsPlayer: false,
        targetMaxHp: enemy.maxHp,
        actorIsPlayer: true,
        logs,
        turn: getTurn(),
        playerHp: getPlayerHp(),
        playerMaxHp: player.maxHp,
        enemyHp: getEnemyHp(),
        enemyMaxHp: enemy.maxHp,
        enemy,
        passiveFlags,
      });
      setPlayerHp(enemyTickResult.playerHp);
      setEnemyHp(enemyTickResult.enemyHp);

      const playerTickResult = applyStatusTickBatch({
        statuses: getPlayerStatuses(),
        tickMs,
        targetIsPlayer: true,
        targetMaxHp: player.maxHp,
        actorIsPlayer: false,
        logs,
        turn: getTurn(),
        playerHp: getPlayerHp(),
        playerMaxHp: player.maxHp,
        enemyHp: getEnemyHp(),
        enemyMaxHp: enemy.maxHp,
        passiveFlags,
      });
      setPlayerHp(playerTickResult.playerHp);
      setEnemyHp(playerTickResult.enemyHp);
      if (playerTickResult.playerTookDamage) {
        setPlayerDamagedSinceSwordHeartWindow(true);
      }
    }

    cleanupExpiredStatuses(currentMs);
  };
};

const resolveStatusTickOutcome = ({
  status,
  targetMaxHp,
  targetIsPlayer,
  enemy,
}: {
  status: CombatStatus;
  targetMaxHp: number;
  targetIsPlayer: boolean;
  enemy?: Enemy;
}) => {
  let damage = 0;
  let message = "";
  let restoreToPlayer = false;
  let restoreToEnemy = false;

  switch (status.kind) {
    case "burn":
      damage = Math.max(1, Math.floor(targetMaxHp * Math.max(0.02, status.value)));
      message = targetIsPlayer
        ? `你身陷【${status.name}】，承受 <dmg>${damage}</dmg> 點傷害！`
        : `<enemy rank="${enemy?.rank}">${enemy?.name}</enemy> 身陷【${status.name}】，承受 <dmg>${damage}</dmg> 點傷害！`;
      break;
    case "poison":
      damage = Math.max(1, Math.floor(targetMaxHp * Math.max(0.018, status.value)));
      message = targetIsPlayer
        ? `你遭【${status.name}】侵蝕，承受 <dmg>${damage}</dmg> 點傷害！`
        : `<enemy rank="${enemy?.rank}">${enemy?.name}</enemy> 遭【${status.name}】侵蝕，承受 <dmg>${damage}</dmg> 點傷害！`;
      break;
    case "bleed":
      damage = Math.max(1, Math.floor(targetMaxHp * Math.max(0.015, status.value)));
      message = targetIsPlayer
        ? `你氣血流失，因【${status.name}】承受 <dmg>${damage}</dmg> 點傷害！`
        : `<enemy rank="${enemy?.rank}">${enemy?.name}</enemy> 傷口撕裂，流失 <dmg>${damage}</dmg> 點氣血！`;
      break;
    case "drain":
      damage = Math.max(1, Math.floor(targetMaxHp * Math.max(0.04, status.value)));
      restoreToPlayer = !targetIsPlayer;
      restoreToEnemy = targetIsPlayer;
      message = targetIsPlayer
        ? `你被【${status.name}】抽離生機，承受 <dmg>${damage}</dmg> 點傷害，敵方恢復同等氣血。`
        : `<enemy rank="${enemy?.rank}">${enemy?.name}</enemy> 遭【${status.name}】吞噬，承受 <dmg>${damage}</dmg> 點傷害，你回復了同等氣血。`;
      break;
  }

  return { damage, message, restoreToPlayer, restoreToEnemy };
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
    case "spirit_sever":
      return "絕仙封脈";
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

  if (status.kind === "reflect") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，近身來敵將被反噬。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 佈下【${status.name}】。`;
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

const logAppliedCombatStatuses = ({
  logs,
  turn,
  timeMs,
  isPlayer,
  statuses,
  targetIsPlayer,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  isPlayer: boolean;
  statuses: CombatStatus[];
  targetIsPlayer: boolean;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  statuses.forEach((status) => {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer,
      message: kindToStatusMessage(status, targetIsPlayer, enemy),
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  });
};

const appendAndLogCombatStatuses = ({
  container,
  statuses,
  logs,
  turn,
  timeMs,
  isPlayer,
  targetIsPlayer,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  container: CombatStatus[];
  statuses: CombatStatus[];
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  isPlayer: boolean;
  targetIsPlayer: boolean;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (statuses.length === 0) {
    return;
  }

  container.push(...statuses);
  logAppliedCombatStatuses({
    logs,
    turn,
    timeMs,
    isPlayer,
    statuses,
    targetIsPlayer,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
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
  const passiveFlags = getPlayerPassiveFlags(learnedSkills);
  const hasExplicitCooldownReductionPassive =
    passiveFlags.hasMageSpiritSeveringPassive;

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

const getEnemySpecialDelayFromStatuses = (
  statuses: CombatStatus[],
  currentTimeMs: number
) =>
  statuses.some(
    (status) => status.id === "spirit_sever" && status.expiresAtMs > currentTimeMs
  )
    ? 1000
    : 0;

const getInitialEnemySpecialReadyAtMs = (hasMageEmperorPassive: boolean) =>
  hasMageEmperorPassive ? 2000 : 0;

const applyEnemySpecialTimingDelay = ({
  logs,
  turn,
  timeMs,
  enemy,
  enemyStatuses,
  enemySpecialReadyAtMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  enemyStatuses: CombatStatus[];
  enemySpecialReadyAtMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  const enemySpecialDelayMs = getEnemySpecialDelayFromStatuses(
    enemyStatuses,
    timeMs
  );
  if (
    !enemy.specialAttack ||
    timeMs < enemySpecialReadyAtMs ||
    enemySpecialDelayMs <= 0
  ) {
    return enemySpecialReadyAtMs;
  }

  const delayedReadyAtMs = timeMs + enemySpecialDelayMs;
  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: `【絕仙劍】斬斷敵方靈機流轉，將其術式節奏再壓後 ${(enemySpecialDelayMs / 1000).toFixed(0)} 秒。`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  return delayedReadyAtMs;
};

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
  hasSwordGoldenPassive,
  hasSwordDeathWardPassive,
  hasSwordQiPassive,
  hasBodyQiPassive,
  hasBodyFoundationPassive,
  hasBodyRebirthPassive,
  hasSwordEchoPassive,
  hasBodySaintPassive,
  hasMageQiPassive,
  hasManaSpringPassive,
  hasMageFoundationPassive,
  hasMageSpiritSeveringPassive,
  hasBodyAncientPassive,
  hasSwordImmortalPassive,
  hasBodyImmortalPassive,
  hasMageVoidPassive,
  hasSwordEmperorPassive,
  hasBodyEmperorPassive,
  hasSwordHeartPassive,
  hasBodyFusionPassive,
  hasMageFusionPassive,
  hasSwordFusionPassive,
  hasBodyTribulationPassive,
  hasMageTribulationPassive,
  hasSwordMahayanaPassive,
  hasMageMahayanaPassive,
  hasMageImmortalPassive,
  hasMageEmperorPassive,
}: {
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
  hasSwordGoldenPassive: boolean;
  hasSwordDeathWardPassive: boolean;
  hasSwordQiPassive: boolean;
  hasBodyQiPassive: boolean;
  hasBodyFoundationPassive: boolean;
  hasBodyRebirthPassive: boolean;
  hasSwordEchoPassive: boolean;
  hasBodySaintPassive: boolean;
  hasMageQiPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFoundationPassive: boolean;
  hasMageSpiritSeveringPassive: boolean;
  hasBodyAncientPassive: boolean;
  hasSwordImmortalPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasMageVoidPassive: boolean;
  hasSwordEmperorPassive: boolean;
  hasBodyEmperorPassive: boolean;
  hasSwordHeartPassive: boolean;
  hasBodyFusionPassive: boolean;
  hasMageFusionPassive: boolean;
  hasMageImmortalPassive: boolean;
  hasMageEmperorPassive: boolean;
  hasSwordFusionPassive: boolean;
  hasBodyTribulationPassive: boolean;
  hasMageTribulationPassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageMahayanaPassive: boolean;
}) => {
  const messages: string[] = [];

  if (hasReflectPassive) {
    messages.push("【荊棘皮層】已覆上體表，只待近身來敵反震自傷。");
  }

  if (hasInitialShieldPassive) {
    messages.push("戰鬥開始時，你獲得了【元素護盾】。");
  }

  if (hasSwordGoldenPassive) {
    messages.push("【劍心通明】劍心澄澈待發，暴擊時將牽動流光劍影再次出鞘。");
  }

  if (hasSwordDeathWardPassive) {
    messages.push("【護體劍罡】劍罡已護住命門，一次致命來襲將被強行截斷。");
  }

  if (hasSwordEchoPassive) {
    messages.push("【劍意化形】劍意凝影待發，普攻將化作雙段追斬。");
  }

  if (hasSwordQiPassive) {
    messages.push("【劍脈初成】劍勢已然循環，暴擊將牽動破甲追擊。");
  }

  if (hasBodyQiPassive) {
    messages.push("【銅皮鐵骨】筋骨已提前繃緊，凡俗重擊將被層層卸去。");
  }

  if (hasBodyFoundationPassive) {
    messages.push("【蠻荒血脈】荒血已在體內鼓盪，負傷越深，血勢越兇。");
  }

  if (hasBodyRebirthPassive) {
    messages.push("【滴血重生】血氣已盤踞命宮，重傷時將自行回生續戰。");
  }

  if (hasSwordHeartPassive) {
    messages.push("【養劍術】劍勢已在心湖沉澱，敵招受阻時將持續蓄起更深殺機。");
  }

  if (hasBodySaintPassive) {
    messages.push("【肉身成聖】聖軀已穩，重擊將被大幅化去。");
  }

  if (hasMageQiPassive) {
    messages.push("【靈潮循環】靈潮已在經脈間往復，普攻空窗也會持續回潮。");
  }

  if (hasManaSpringPassive) {
    messages.push("【法力源泉】靈海滿溢時，術式威能將再向上拔高。");
  }

  if (hasMageFoundationPassive) {
    messages.push("【靈力湧動】靈元已在經脈間翻騰，施法時將順勢拔高術式威能。");
  }

  if (hasMageSpiritSeveringPassive) {
    messages.push("【道法自然】術式流轉圓融，萬法冷卻將提早歸位。");
  }

  if (hasMageFusionPassive) {
    messages.push("【五氣朝元】五氣已在丹府間周天輪轉，術式回補與免耗隨時可被喚醒。");
  }

  if (hasBodyAncientPassive) {
    messages.push("【荒古戰體】荒古血肉盤踞周身，負面侵蝕將被持續震散。");
  }

  if (hasBodyFusionPassive) {
    messages.push("【金剛法相】法相已在筋骨間待命，來襲重擊將被再次硬生生卸去。");
  }

  if (hasSwordImmortalPassive) {
    messages.push("【仙元護體】劍元護體已待命，將定時凝成一次絕對護盾。");
  }

  if (hasBodyImmortalPassive) {
    messages.push("【仙體無垢】仙血流轉無垢，灼毒與流血將被直接抹除。");
  }

  if (hasMageVoidPassive) {
    messages.push("【空間法則】虛空褶皺護住法身，部分來襲將被挪入虛空。");
  }

  if (hasSwordEmperorPassive) {
    messages.push("【萬法皆空】劍意已斷萬法因果，負面侵蝕將被直接抹去。");
  }

  if (hasBodyEmperorPassive) {
    messages.push("【不死不滅】霸體鎮住命門，最後一線生機尚未斷絕。");
  }

  if (hasMageImmortalPassive) {
    messages.push("【仙法通神】仙元灌注靈海，術式回響已待命啟動。");
  }

  if (hasMageEmperorPassive) {
    messages.push("【萬法歸宗】萬法歸一鎮住靈臺，敵方特招節奏將被持續遲滯。");
  }

  if (hasSwordFusionPassive) {
    messages.push("【人劍合神】劍魂已與識海相融，控制侵蝕將被強行縮短。");
  }

  if (hasBodyTribulationPassive) {
    messages.push("【萬劫不滅】劫火護體待發，每次承傷都將反煉肉身。");
  }

  if (hasMageTribulationPassive) {
    messages.push("【雷劫煉心】雷痕纏身護識，控制侵蝕將被天雷反煉。");
  }

  if (hasSwordMahayanaPassive) {
    messages.push("【劍道獨尊】劍勢已鎖定全場，敵勢越盛越助你凝出殺機。");
  }

  if (hasMageMahayanaPassive) {
    messages.push("【言出法隨】法言既出即成天條，主動術式威能已被抬升。");
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
  hasSwordGoldenPassive: boolean;
  hasSwordDeathWardPassive: boolean;
  hasSwordQiPassive: boolean;
  hasBodyQiPassive: boolean;
  hasBodyFoundationPassive: boolean;
  hasBodyRebirthPassive: boolean;
  hasSwordEchoPassive: boolean;
  hasBodySaintPassive: boolean;
  hasMageQiPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFoundationPassive: boolean;
  hasMageSpiritSeveringPassive: boolean;
  hasBodyAncientPassive: boolean;
  hasSwordImmortalPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasMageVoidPassive: boolean;
  hasSwordEmperorPassive: boolean;
  hasBodyEmperorPassive: boolean;
  hasSwordHeartPassive: boolean;
  hasBodyFusionPassive: boolean;
  hasMageFusionPassive: boolean;
  hasSwordFusionPassive: boolean;
  hasBodyTribulationPassive: boolean;
  hasMageTribulationPassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageMahayanaPassive: boolean;
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
    hasSwordGoldenPassive,
    hasSwordDeathWardPassive,
    hasSwordQiPassive,
    hasBodyQiPassive,
    hasBodyFoundationPassive,
    hasBodyRebirthPassive,
    hasSwordEchoPassive,
    hasBodySaintPassive,
    hasMageQiPassive,
    hasManaSpringPassive,
    hasMageFoundationPassive,
    hasMageSpiritSeveringPassive,
    hasBodyAncientPassive,
    hasSwordImmortalPassive,
    hasBodyImmortalPassive,
    hasMageVoidPassive,
    hasSwordEmperorPassive,
    hasBodyEmperorPassive,
    hasSwordHeartPassive,
    hasBodyFusionPassive,
    hasMageFusionPassive,
    hasSwordFusionPassive,
    hasBodyTribulationPassive,
    hasMageTribulationPassive,
    hasSwordMahayanaPassive,
    hasMageMahayanaPassive,
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
      hasSwordGoldenPassive,
      hasSwordDeathWardPassive,
      hasSwordQiPassive,
      hasBodyQiPassive,
      hasBodyFoundationPassive,
      hasBodyRebirthPassive,
      hasSwordEchoPassive,
      hasBodySaintPassive,
      hasMageQiPassive,
      hasManaSpringPassive,
      hasMageFoundationPassive,
      hasMageSpiritSeveringPassive,
      hasBodyAncientPassive,
      hasSwordImmortalPassive,
      hasBodyImmortalPassive,
      hasMageVoidPassive,
      hasSwordEmperorPassive,
      hasBodyEmperorPassive,
      hasSwordHeartPassive,
      hasBodyFusionPassive,
      hasMageFusionPassive,
      hasMageImmortalPassive,
      hasMageEmperorPassive,
      hasSwordFusionPassive,
      hasBodyTribulationPassive,
      hasMageTribulationPassive,
      hasSwordMahayanaPassive,
      hasMageMahayanaPassive,
    })
  );

  return messages;
};

const initializeCombatEncounter = ({
  player,
  enemy,
  logs,
  passiveFlags,
  restriction,
  elementalAffinity,
  playerHp,
  enemyHp,
}: {
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  restriction: { isEffective: boolean; isResisted: boolean };
  elementalAffinity: { multiplier: number; reason?: "resistance" | "weakness" };
  playerHp: number;
  enemyHp: number;
}) => {
  const initialPassiveStatuses = getInitialPassiveStatuses({
    hasReflectPassive: passiveFlags.hasReflectPassive,
    hasInitialShieldPassive: passiveFlags.hasInitialShieldPassive,
  });

  getCombatOpeningMessages({
    player,
    enemy,
    restriction,
    elementalAffinity,
    hasReflectPassive: passiveFlags.hasReflectPassive,
    hasInitialShieldPassive: passiveFlags.hasInitialShieldPassive,
    hasSwordGoldenPassive: passiveFlags.hasSwordGoldenPassive,
    hasSwordDeathWardPassive: passiveFlags.hasSwordDeathWardPassive,
    hasSwordQiPassive: passiveFlags.hasSwordQiPassive,
    hasBodyQiPassive: passiveFlags.hasBodyQiPassive,
    hasBodyFoundationPassive: passiveFlags.hasBodyFoundationPassive,
    hasBodyRebirthPassive: passiveFlags.hasBodyRebirthPassive,
    hasSwordEchoPassive: passiveFlags.hasSwordEchoPassive,
    hasBodySaintPassive: passiveFlags.hasBodySaintPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
    hasManaSpringPassive: passiveFlags.hasManaSpringPassive,
    hasMageFoundationPassive: passiveFlags.hasMageFoundationPassive,
    hasMageSpiritSeveringPassive: passiveFlags.hasMageSpiritSeveringPassive,
    hasBodyAncientPassive: passiveFlags.hasBodyAncientPassive,
    hasSwordImmortalPassive: passiveFlags.hasSwordImmortalPassive,
    hasBodyImmortalPassive: passiveFlags.hasBodyImmortalPassive,
    hasMageVoidPassive: passiveFlags.hasMageVoidPassive,
    hasSwordEmperorPassive: passiveFlags.hasSwordEmperorPassive,
    hasBodyEmperorPassive: passiveFlags.hasBodyEmperorPassive,
    hasSwordHeartPassive: passiveFlags.hasSwordHeartPassive,
    hasBodyFusionPassive: passiveFlags.hasBodyFusionPassive,
    hasMageFusionPassive: passiveFlags.hasMageFusionPassive,
    hasSwordFusionPassive: passiveFlags.hasSwordFusionPassive,
    hasBodyTribulationPassive: passiveFlags.hasBodyTribulationPassive,
    hasMageTribulationPassive: passiveFlags.hasMageTribulationPassive,
    hasSwordMahayanaPassive: passiveFlags.hasSwordMahayanaPassive,
    hasMageMahayanaPassive: passiveFlags.hasMageMahayanaPassive,
    hasMageImmortalPassive: passiveFlags.hasMageImmortalPassive,
    hasMageEmperorPassive: passiveFlags.hasMageEmperorPassive,
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

  return {
    initialPassiveStatuses,
    initialEnemySpecialReadyAtMs: getInitialEnemySpecialReadyAtMs(
      passiveFlags.hasMageEmperorPassive
    ),
  };
};

const rollBossBreakOpportunity = ({
  enemy,
  restriction,
  bossBroken,
  currentTimeMs,
  turn,
  logs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  enemy: Enemy;
  restriction: { isEffective: boolean; isResisted: boolean };
  bossBroken: boolean;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (
    enemy.rank !== EnemyRank.Boss ||
    !restriction.isEffective ||
    bossBroken ||
    Math.random() >= 0.12
  ) {
    return bossBroken;
  }

  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    message: `【破綻】你抓住了 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 的氣機破綻，下一擊傷害大幅提升！`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  return true;
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

const applyPassiveRegenAndCleanse = ({
  player,
  logs,
  turn,
  timeMs,
  playerHp,
  playerMp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  lastRegenTimeMs,
  hasBodyRebirthPassive,
  hasManaSpringPassive,
  hasMageFusionPassive,
  hasBodyImmortalPassive,
  hasBodyAncientPassive,
}: {
  player: PlayerCombatStats;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatus[];
  lastRegenTimeMs: number;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasBodyAncientPassive: boolean;
}) => {
  if (
    !(player.regenHp > 0 || hasBodyRebirthPassive || hasManaSpringPassive || hasMageFusionPassive) ||
    (playerHp >= player.maxHp && playerMp >= player.maxMp)
  ) {
    return { playerHp, playerMp, playerStatuses, lastRegenTimeMs };
  }

  const regenIntervals = Math.floor((timeMs - lastRegenTimeMs) / 1000);
  if (regenIntervals <= 0) {
    return { playerHp, playerMp, playerStatuses, lastRegenTimeMs };
  }

  let nextPlayerHp = playerHp;
  let nextPlayerMp = playerMp;
  const nextPlayerStatuses = playerStatuses;
  let healPerSecond = Math.floor(player.maxHp * (player.regenHp / 100));

  if (hasBodyRebirthPassive) {
    const missingHp = Math.max(0, player.maxHp - nextPlayerHp);
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
    nextPlayerHp = Math.min(player.maxHp, nextPlayerHp + healAmount);
    const { healMessage } = getPassiveRegenMessages({
      healAmount,
      manaAmount: 0,
      hasBodyRebirthPassive,
      hasManaSpringPassive,
      hasMageFusionPassive,
    });
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: healMessage,
      damage: -healAmount,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if ((hasManaSpringPassive || hasMageFusionPassive) && nextPlayerMp < player.maxMp) {
    const manaPerSecond =
      (hasManaSpringPassive ? Math.floor(player.maxMp * 0.1) : 0) +
      (hasMageFusionPassive ? Math.floor(player.maxMp * 0.05) : 0);
    const manaAmount = manaPerSecond * regenIntervals;
    if (manaAmount > 0) {
      nextPlayerMp = Math.min(player.maxMp, nextPlayerMp + manaAmount);
      const { manaMessage } = getPassiveRegenMessages({
        healAmount: 0,
        manaAmount,
        hasBodyRebirthPassive,
        hasManaSpringPassive,
        hasMageFusionPassive,
      });
      pushCombatLog(logs, {
        turn,
        timeMs,
        isPlayer: true,
        message: manaMessage,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp,
      });
    }
  }

  if (hasBodyAncientPassive) {
    const removableIndex = nextPlayerStatuses.findIndex(
      (status) => status.expiresAtMs > timeMs && isNegativeStatusKind(status.kind)
    );
    if (removableIndex >= 0) {
      const [removedStatus] = nextPlayerStatuses.splice(removableIndex, 1);
      pushCombatLog(logs, {
        turn,
        timeMs,
        isPlayer: true,
        message: `【荒古戰體】震散了【${removedStatus.name}】。`,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp,
      });
    }
  }

  return {
    playerHp: nextPlayerHp,
    playerMp: nextPlayerMp,
    playerStatuses: nextPlayerStatuses,
    lastRegenTimeMs: lastRegenTimeMs + regenIntervals * 1000,
  };
};

const applyPeriodicPassiveStatuses = ({
  logs,
  turn,
  timeMs,
  player,
  playerHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  hasSwordImmortalPassive,
  nextSwordImmortalGuardAtMs,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  player: PlayerCombatStats;
  playerHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatus[];
  hasSwordImmortalPassive: boolean;
  nextSwordImmortalGuardAtMs: number;
}) => {
  let nextGuardAtMs = nextSwordImmortalGuardAtMs;
  if (hasSwordImmortalPassive && timeMs >= nextGuardAtMs) {
    playerStatuses.push({
      id: "immortal_sword_guard",
      name: "仙元護體",
      kind: "shield",
      value: 999999,
      expiresAtMs: timeMs + 1000,
    });
    nextGuardAtMs += 5000;
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【仙元護體】再次凝成，可抵擋一次任意傷害。`,
      damage: 0,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return { playerStatuses, nextSwordImmortalGuardAtMs: nextGuardAtMs };
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

const logResolvedActivePassiveEffects = (options: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  noManaCostTriggered: boolean;
  cooldownReductionMessage?: string;
  manaCycleRecovery?: number;
  swordGoldenResetTriggered: boolean;
  mageFoundationStacksGained?: number;
}) => {
  const {
    logs,
    turn,
    timeMs,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    noManaCostTriggered,
    cooldownReductionMessage,
    manaCycleRecovery,
    swordGoldenResetTriggered,
    mageFoundationStacksGained,
  } = options;

  if (noManaCostTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【五氣朝元】術式運轉不再消耗靈力。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (cooldownReductionMessage) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: cooldownReductionMessage,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (manaCycleRecovery && manaCycleRecovery > 0) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【靈潮循環】術式回潮歸海，你回復了 ${manaCycleRecovery} 點靈力。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (swordGoldenResetTriggered) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【劍心通明】你在暴擊中瞬息回氣，流光劍影冷卻即刻重置。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if (mageFoundationStacksGained && mageFoundationStacksGained > 0) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【靈力湧動】術式餘波回流，下一輪法術威能提升，當前 ${mageFoundationStacksGained} 層。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }
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

const resolvePlayerActiveResourceFlow = ({
  activeSkill,
  activeSkillCanonicalId,
  player,
  playerMp,
  currentTimeMs,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  isCrit,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  hasMageFusionPassive,
  hasMageQiPassive,
  hasSwordGoldenPassive,
  hasMageFoundationPassive,
}: {
  activeSkill: Skill;
  activeSkillCanonicalId?: string;
  player: PlayerCombatStats;
  playerMp: number;
  currentTimeMs: number;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  isCrit: boolean;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  hasMageFusionPassive: boolean;
  hasMageQiPassive: boolean;
  hasSwordGoldenPassive: boolean;
  hasMageFoundationPassive: boolean;
}) => {
  const baseCooldownSeconds =
    activeSkill.cooldownSeconds ?? activeSkill.cooldown;
  const noManaCostTriggered =
    hasMageFusionPassive && activeSkill.profession === ProfessionType.Mage;
  let nextPlayerMp = noManaCostTriggered
    ? playerMp
    : Math.max(0, playerMp - (activeSkill.cost || 0));
  const effectiveCooldownSeconds = getResolvedSkillCooldownSeconds(
    activeSkill,
    player.learnedSkills
  );
  let nextActiveSkillReadyAtMs =
    currentTimeMs + Math.floor(effectiveCooldownSeconds * 1000);
  const cooldownReductionMessage =
    effectiveCooldownSeconds < baseCooldownSeconds &&
    activeSkill.profession === ProfessionType.Mage
      ? `【道法自然】術式流轉提前歸位，冷卻縮短至 ${effectiveCooldownSeconds.toFixed(1)} 秒。`
      : undefined;

  let recoveredMana = 0;
  if (hasMageQiPassive && activeSkill.profession === ProfessionType.Mage) {
    recoveredMana = getMageQiCycleRecovery(player.maxMp);
    nextPlayerMp = Math.min(player.maxMp, nextPlayerMp + recoveredMana);
  }

  let swordGoldenResetTriggered = false;
  if (
    hasSwordGoldenPassive &&
    activeSkillCanonicalId === "s_f_active" &&
    isCrit &&
    Math.random() < 0.3
  ) {
    nextActiveSkillReadyAtMs = currentTimeMs;
    swordGoldenResetTriggered = true;
  }

  let nextMageFoundationStacks = mageFoundationStacks;
  let mageFoundationStacksGained: number | undefined;
  if (hasMageFoundationPassive && activeSkill.profession === ProfessionType.Mage) {
    nextMageFoundationStacks = Math.min(3, nextMageFoundationStacks + 1);
    mageFoundationStacksGained = nextMageFoundationStacks;
  }

  logResolvedActivePassiveEffects({
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    noManaCostTriggered,
    cooldownReductionMessage,
    manaCycleRecovery: recoveredMana,
    swordGoldenResetTriggered,
    mageFoundationStacksGained,
  });

  return {
    playerMp: nextPlayerMp,
    activeSkillReadyAtMs: nextActiveSkillReadyAtMs,
    mageFoundationStacks: nextMageFoundationStacks,
  };
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

const resolveIncomingEnemyDamage = ({
  enemyDamage,
  enemySpecialReady,
  currentTimeMs,
  playerStatuses,
  logs,
  turn,
  enemy,
  playerHp,
  playerMaxHp,
  playerMp,
  enemyHp,
  enemyMaxHp,
  bodyFoundationStacks,
  hasBodyQiPassive,
  hasBodyFusionPassive,
  hasBodySaintPassive,
  hasSwordDeathWardPassive,
  swordDeathWardUsed,
}: {
  enemyDamage: number;
  enemySpecialReady: boolean;
  currentTimeMs: number;
  playerStatuses: CombatStatus[];
  logs: CombatLog[];
  turn: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMaxHp: number;
  bodyFoundationStacks: number;
  hasBodyQiPassive: boolean;
  hasBodyFusionPassive: boolean;
  hasBodySaintPassive: boolean;
  hasSwordDeathWardPassive: boolean;
  swordDeathWardUsed: boolean;
}) => {
  let nextEnemyDamage = enemyDamage;
  let nextPlayerStatuses = playerStatuses;
  let nextPlayerMp = playerMp;
  let nextEnemyHp = enemyHp;
  let nextSwordDeathWardUsed = swordDeathWardUsed;

  let copperSkinReduced = 0;
  if (hasBodyQiPassive && nextEnemyDamage > 0 && !enemySpecialReady) {
    copperSkinReduced = nextEnemyDamage - Math.max(
      1,
      Math.floor(nextEnemyDamage * getCopperSkinReductionMultiplier())
    );
    nextEnemyDamage = Math.max(
      1,
      Math.floor(nextEnemyDamage * getCopperSkinReductionMultiplier())
    );
  }

  let bodyFusionReduced = 0;
  if (hasBodyFusionPassive && nextEnemyDamage > 0) {
    bodyFusionReduced =
      nextEnemyDamage - Math.max(1, Math.floor(nextEnemyDamage * 0.7));
    nextEnemyDamage = Math.max(1, Math.floor(nextEnemyDamage * 0.7));
  }

  let bodySaintReduced = 0;
  if (hasBodySaintPassive && nextEnemyDamage > playerMaxHp * 0.2) {
    bodySaintReduced =
      nextEnemyDamage - Math.max(1, Math.floor(nextEnemyDamage * 0.5));
    nextEnemyDamage = Math.max(1, Math.floor(nextEnemyDamage * 0.5));
  }

  let elementalBarrierBlocked = false;
  if (enemySpecialReady && nextEnemyDamage > 0) {
    const elementalBarrier = nextPlayerStatuses.find(
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
      nextEnemyDamage = 0;
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
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  });

  const shieldResult = absorbDamageWithShield(
    nextPlayerStatuses,
    nextEnemyDamage,
    currentTimeMs
  );
  nextEnemyDamage = shieldResult.remainingDamage;

  logShieldAbsorption({
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp,
    playerMaxHp,
    enemyHp: nextEnemyHp,
    enemyMaxHp,
    absorbed: shieldResult.absorbed,
  });

  if (elementalBarrierBlocked) {
    nextPlayerStatuses = nextPlayerStatuses.filter(
      (status) =>
        !(
          status.id === "elemental_barrier" && status.expiresAtMs <= currentTimeMs
        )
    );
  }

  if (
    hasSwordDeathWardPassive &&
    !nextSwordDeathWardUsed &&
    nextEnemyDamage >= playerHp &&
    nextPlayerMp > 0
  ) {
    const swordDeathWardResult = applySwordDeathWardTrigger({
      shouldTrigger: true,
      logs,
      turn,
      timeMs: currentTimeMs,
      preventedDamage: nextEnemyDamage,
      playerHp,
      playerMaxHp,
      playerMp: nextPlayerMp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
      enemy,
    });
    nextSwordDeathWardUsed = swordDeathWardResult.triggered;
    nextPlayerMp = swordDeathWardResult.playerMp;
    nextEnemyDamage = swordDeathWardResult.enemyDamage ?? nextEnemyDamage;
    nextEnemyHp = swordDeathWardResult.enemyHp;
  }

  return {
    enemyDamage: nextEnemyDamage,
    playerStatuses: nextPlayerStatuses,
    playerMp: nextPlayerMp,
    enemyHp: nextEnemyHp,
    swordDeathWardUsed: nextSwordDeathWardUsed,
  };
};

const applyEnemyHitAftermath = ({
  enemyDamage,
  currentTimeMs,
  logs,
  turn,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  hasBodyTribulationPassive,
  bodyTribulationStacks,
  hasMageTribulationPassive,
  hasEnemyLeech,
  hasBodyRebirthTruePassive,
  bodyRebirthTrueUsed,
  hasBodyEmperorPassive,
}: {
  enemyDamage: number;
  currentTimeMs: number;
  logs: CombatLog[];
  turn: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatus[];
  hasBodyTribulationPassive: boolean;
  bodyTribulationStacks: number;
  hasMageTribulationPassive: boolean;
  hasEnemyLeech: boolean;
  hasBodyRebirthTruePassive: boolean;
  bodyRebirthTrueUsed: boolean;
  hasBodyEmperorPassive: boolean;
}) => {
  let nextPlayerHp = playerHp;
  let nextEnemyHp = enemyHp;
  let nextPlayerStatuses = playerStatuses;
  let nextBodyTribulationStacks = bodyTribulationStacks;
  let nextBodyRebirthTrueUsed = bodyRebirthTrueUsed;

  if (
    hasBodyTribulationPassive &&
    enemyDamage > 0 &&
    nextBodyTribulationStacks < 50
  ) {
    nextBodyTribulationStacks += 1;
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【萬劫不滅】借劫煉體，防禦再疊 1 層，當前 ${nextBodyTribulationStacks} 層。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  }

  if (
    hasMageTribulationPassive &&
    enemyDamage > 0 &&
    enemy.element === ElementType.Metal
  ) {
    const thunderHeal = Math.max(1, Math.floor(enemyDamage * 0.35));
    nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + thunderHeal);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【雷劫煉心】借天雷反煉自身，回復了 <heal>${thunderHeal}</heal> 點氣血。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  }

  if (hasEnemyLeech && enemyDamage > 0) {
    const leechAmount = Math.max(1, Math.floor(enemyDamage * 0.06));
    nextEnemyHp = Math.min(enemyMaxHp, nextEnemyHp + leechAmount);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: false,
      message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 的【噬生】發作，回復了 <heal>${leechAmount}</heal> 點氣血。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp,
    });
  }

  const fatalSurvivalResult = applyFatalSurvivalPassives({
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp: nextPlayerHp,
    playerMaxHp,
    enemyHp: nextEnemyHp,
    enemyMaxHp,
    playerStatuses: nextPlayerStatuses,
    bodyRebirthTrueAvailable:
      hasBodyRebirthTruePassive && !nextBodyRebirthTrueUsed,
    bodyEmperorAvailable: hasBodyEmperorPassive,
  });
  nextPlayerHp = fatalSurvivalResult.playerHp;
  nextPlayerStatuses = fatalSurvivalResult.playerStatuses;
  if (fatalSurvivalResult.bodyRebirthTrueTriggered) {
    nextBodyRebirthTrueUsed = true;
  }

  return {
    playerHp: nextPlayerHp,
    enemyHp: nextEnemyHp,
    playerStatuses: nextPlayerStatuses,
    bodyTribulationStacks: nextBodyTribulationStacks,
    bodyRebirthTrueUsed: nextBodyRebirthTrueUsed,
  };
};

const resolveEnemyTurnAftermath = ({
  enemyDamage,
  isDodge,
  voidEvasion,
  isBlock,
  enemySpecialReady,
  currentTimeMs,
  turn,
  logs,
  enemy,
  player,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  passiveFlags,
  bodyFoundationStacks,
  swordDeathWardUsed,
  bodyTribulationStacks,
  bodyRebirthTrueUsed,
}: {
  enemyDamage: number;
  isDodge: boolean;
  voidEvasion: boolean;
  isBlock: boolean;
  enemySpecialReady: boolean;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  enemy: Enemy;
  player: PlayerCombatStats;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatus[];
  passiveFlags: PlayerPassiveFlags;
  bodyFoundationStacks: number;
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
}) => {
  let nextEnemyDamage = enemyDamage;
  let nextPlayerHp = playerHp;
  let nextPlayerMp = playerMp;
  let nextEnemyHp = enemyHp;
  let nextPlayerStatuses = playerStatuses;
  let nextSwordDeathWardUsed = swordDeathWardUsed;
  let nextBodyTribulationStacks = bodyTribulationStacks;
  let nextBodyRebirthTrueUsed = bodyRebirthTrueUsed;

  if (isDodge || voidEvasion) {
    logEnemyAvoidance({
      logs,
      turn,
      timeMs: currentTimeMs,
      enemy,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
      voidEvasion,
    });
  } else {
    if (isBlock) {
      nextEnemyDamage = Math.max(1, Math.floor(nextEnemyDamage * 0.6));
    }
    ({
      enemyDamage: nextEnemyDamage,
      playerStatuses: nextPlayerStatuses,
      playerMp: nextPlayerMp,
      enemyHp: nextEnemyHp,
      swordDeathWardUsed: nextSwordDeathWardUsed,
    } = resolveIncomingEnemyDamage({
      enemyDamage: nextEnemyDamage,
      enemySpecialReady,
      currentTimeMs,
      playerStatuses: nextPlayerStatuses,
      logs,
      turn,
      enemy,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      playerMp: nextPlayerMp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
      bodyFoundationStacks,
      hasBodyQiPassive: passiveFlags.hasBodyQiPassive,
      hasBodyFusionPassive: passiveFlags.hasBodyFusionPassive,
      hasBodySaintPassive: passiveFlags.hasBodySaintPassive,
      hasSwordDeathWardPassive: passiveFlags.hasSwordDeathWardPassive,
      swordDeathWardUsed: nextSwordDeathWardUsed,
    }));

    nextPlayerHp = Math.max(0, nextPlayerHp - nextEnemyDamage);
    ({
      playerHp: nextPlayerHp,
      enemyHp: nextEnemyHp,
      playerStatuses: nextPlayerStatuses,
      bodyTribulationStacks: nextBodyTribulationStacks,
      bodyRebirthTrueUsed: nextBodyRebirthTrueUsed,
    } = applyEnemyHitAftermath({
      enemyDamage: nextEnemyDamage,
      currentTimeMs,
      logs,
      turn,
      enemy,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
      playerStatuses: nextPlayerStatuses,
      hasBodyTribulationPassive: passiveFlags.hasBodyTribulationPassive,
      bodyTribulationStacks: nextBodyTribulationStacks,
      hasMageTribulationPassive: passiveFlags.hasMageTribulationPassive,
      hasEnemyLeech: hasEnemyAffix(enemy, "噬生"),
      hasBodyRebirthTruePassive: passiveFlags.hasBodyRebirthTruePassive,
      bodyRebirthTrueUsed: nextBodyRebirthTrueUsed,
      hasBodyEmperorPassive: passiveFlags.hasBodyEmperorPassive,
    }));

    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: false,
      message: enemySpecialReady && enemy.specialAttack
        ? `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 施展【${enemy.specialAttack.name}】${isBlock ? "，被你格擋後，" : "，"}造成 <dmg>${nextEnemyDamage}</dmg> 點傷害！`
        : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 反擊，${isBlock ? "被你格擋後，" : ""}造成 <dmg>${nextEnemyDamage}</dmg> 點傷害！`,
      damage: nextEnemyDamage,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });

    if (enemySpecialReady && enemy.specialAttack) {
      applyEnemySpecialStatusApplication({
        special: enemy.specialAttack,
        player,
        passiveFlags,
        currentTimeMs,
        shortenControlDuration: passiveFlags.hasSwordFusionPassive,
        container: nextPlayerStatuses,
        logs,
        turn,
        enemy,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    }

    const reflectValue = getReflectValue(nextPlayerStatuses, currentTimeMs);
    const isMeleeEnemyHit = (enemy.attackRange ?? 1) <= 1;
    if (
      reflectValue > 0 &&
      nextEnemyDamage > 0 &&
      nextEnemyHp > 0 &&
      isMeleeEnemyHit
    ) {
      const reflected = Math.max(1, Math.floor(nextEnemyDamage * reflectValue));
      nextEnemyHp = Math.max(0, nextEnemyHp - reflected);
      logReflectRetaliation({
        logs,
        turn,
        timeMs: currentTimeMs,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp: enemy.maxHp,
        reflected,
        enemy,
        sourceName: "荊棘皮層",
      });
    }
  }

  return {
    enemyDamage: nextEnemyDamage,
    playerHp: nextPlayerHp,
    playerMp: nextPlayerMp,
    enemyHp: nextEnemyHp,
    playerStatuses: nextPlayerStatuses,
    swordDeathWardUsed: nextSwordDeathWardUsed,
    bodyTribulationStacks: nextBodyTribulationStacks,
    bodyRebirthTrueUsed: nextBodyRebirthTrueUsed,
  };
};

const applyStatusTickBatch = ({
  statuses,
  tickMs,
  targetIsPlayer,
  targetMaxHp,
  actorIsPlayer,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  enemy,
  passiveFlags,
}: {
  statuses: CombatStatus[];
  tickMs: number;
  targetIsPlayer: boolean;
  targetMaxHp: number;
  actorIsPlayer: boolean;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemy?: Enemy;
  passiveFlags: PlayerPassiveFlags;
}) => {
  let nextPlayerHp = playerHp;
  let nextEnemyHp = enemyHp;
  let playerTookDamage = false;

  statuses.forEach((status) => {
    if ((status.nextTickAtMs ?? 0) > tickMs || status.expiresAtMs <= tickMs) {
      return;
    }

    if (
      targetIsPlayer &&
      passiveFlags.hasSwordEmperorPassive &&
      isNegativeStatusKind(status.kind)
    ) {
      status.expiresAtMs = tickMs;
      status.nextTickAtMs = undefined;
      pushCombatLog(logs, {
        turn,
        timeMs: tickMs,
        isPlayer: true,
        message: `【萬法皆空】直接抹除了【${status.name}】。`,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp,
      });
      return;
    }

    if (
      targetIsPlayer &&
      passiveFlags.hasBodyImmortalPassive &&
      isDotStatusKind(status.kind)
    ) {
      status.expiresAtMs = tickMs;
      status.nextTickAtMs = undefined;
      pushCombatLog(logs, {
        turn,
        timeMs: tickMs,
        isPlayer: true,
        message: `【仙體無垢】淨化了【${status.name}】的侵蝕。`,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp,
      });
      return;
    }

    const outcome = resolveStatusTickOutcome({
      status,
      targetMaxHp,
      targetIsPlayer,
      enemy,
    });

    if (targetIsPlayer) {
      if (outcome.restoreToEnemy && outcome.damage > 0) {
        nextEnemyHp = Math.min(enemyMaxHp, nextEnemyHp + outcome.damage);
      }
      if (outcome.damage > 0) {
        nextPlayerHp = Math.max(0, nextPlayerHp - outcome.damage);
        playerTookDamage = true;
        pushCombatLog(logs, {
          turn,
          timeMs: tickMs,
          isPlayer: actorIsPlayer,
          message: outcome.message,
          damage: outcome.damage,
          playerHp: nextPlayerHp,
          playerMaxHp,
          enemyHp: nextEnemyHp,
          enemyMaxHp,
        });
      }
    } else {
      if (outcome.restoreToPlayer && outcome.damage > 0) {
        nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + outcome.damage);
      }
      if (outcome.damage > 0) {
        nextEnemyHp = Math.max(0, nextEnemyHp - outcome.damage);
        pushCombatLog(logs, {
          turn,
          timeMs: tickMs,
          isPlayer: actorIsPlayer,
          message: outcome.message,
          damage: outcome.damage,
          playerHp: nextPlayerHp,
          playerMaxHp,
          enemyHp: nextEnemyHp,
          enemyMaxHp,
        });
      }
    }

    status.nextTickAtMs = tickMs + 1000;
  });

  return {
    playerHp: nextPlayerHp,
    enemyHp: nextEnemyHp,
    playerTookDamage,
  };
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

const filterPlayerAppliedEnemyStatuses = (
  enemy: Enemy,
  statuses: CombatStatus[]
) =>
  statuses.filter((status) => {
    if (
      hasEnemyAffix(enemy, "霸體") &&
      status.kind === "incapacitate" &&
      Math.random() < 0.35
    ) {
      return false;
    }

    return true;
  });

const shouldApplySwordQiArmorBreak = ({
  passiveFlags,
  skill,
  isCrit,
  enemyHp,
}: {
  passiveFlags: PlayerPassiveFlags;
  skill?: Skill;
  isCrit: boolean;
  enemyHp: number;
}) =>
  passiveFlags.hasSwordQiPassive &&
  skill?.profession === ProfessionType.Sword &&
  isCrit &&
  enemyHp > 0;

const resolvePlayerAppliedEnemyStatuses = ({
  enemy,
  statuses,
  passiveFlags,
  skill,
  isCrit,
  currentTimeMs,
  enemyHp,
}: {
  enemy: Enemy;
  statuses: CombatStatus[];
  passiveFlags: PlayerPassiveFlags;
  skill?: Skill;
  isCrit: boolean;
  currentTimeMs: number;
  enemyHp: number;
}) => {
  const filteredStatuses = filterPlayerAppliedEnemyStatuses(enemy, statuses);

  if (
    shouldApplySwordQiArmorBreak({
      passiveFlags,
      skill,
      isCrit,
      enemyHp,
    })
  ) {
    filteredStatuses.push(createSwordQiArmorBreakStatus(currentTimeMs));
  }

  return filteredStatuses;
};

const resolvePlayerSkillStatusApplication = ({
  skill,
  targetMaxHp,
  enemy,
  passiveFlags,
  dealsDirectDamage,
  isCrit,
  currentTimeMs,
  enemyHp,
}: {
  skill: Skill | undefined;
  targetMaxHp: number;
  enemy: Enemy;
  passiveFlags: PlayerPassiveFlags;
  dealsDirectDamage: boolean;
  isCrit: boolean;
  currentTimeMs: number;
  enemyHp: number;
}) => {
  if (!skill) {
    return {
      playerSideStatuses: [] as CombatStatus[],
      filteredEnemyStatuses: [] as CombatStatus[],
    };
  }

  const { playerSideStatuses, enemySideStatuses } = resolveNormalizedSkillStatuses(
    skill,
    targetMaxHp,
    currentTimeMs
  );

  const filteredEnemyStatuses = dealsDirectDamage
    ? resolvePlayerAppliedEnemyStatuses({
        enemy,
        statuses: enemySideStatuses,
        passiveFlags,
        skill,
        isCrit,
        currentTimeMs,
        enemyHp,
      })
    : filterPlayerAppliedEnemyStatuses(enemy, enemySideStatuses);

  return {
    playerSideStatuses,
    filteredEnemyStatuses,
  };
};

const applyPlayerActiveFollowupEffects = ({
  activeSkillCanonicalId,
  playerDamage,
  currentTimeMs,
  enemy,
  enemyHp,
  playerHp,
  playerMaxHp,
  turn,
  logs,
  hasBodyImmortalPassive,
  enemyStatuses,
  activeSkillReadyAtMs,
}: {
  activeSkillCanonicalId?: string;
  playerDamage: number;
  currentTimeMs: number;
  enemy: Enemy;
  enemyHp: number;
  playerHp: number;
  playerMaxHp: number;
  turn: number;
  logs: CombatLog[];
  hasBodyImmortalPassive: boolean;
  enemyStatuses: CombatStatus[];
  activeSkillReadyAtMs: number;
}) => {
  let nextEnemyHp = enemyHp;
  let nextPlayerHp = playerHp;
  let nextActiveSkillReadyAtMs = activeSkillReadyAtMs;

  if (activeSkillCanonicalId === "b_ma_active" && playerDamage > 0) {
    const lifestealAmount = Math.max(
      1,
      Math.floor(playerDamage * 0.5 * (hasBodyImmortalPassive ? 1.5 : 1))
    );
    nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + lifestealAmount);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【祖巫降臨】吞納戰果，你回復了 <heal>${lifestealAmount}</heal> 點氣血。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (activeSkillCanonicalId === "b_ma_active") {
    const giantHeal = Math.max(1, Math.floor(playerMaxHp * 0.35));
    nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + giantHeal);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【法天象地】肉身擴張如山，回復了 <heal>${giantHeal}</heal> 點氣血並撐起巨靈護體。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (activeSkillCanonicalId === "b_ma_active" && nextEnemyHp > 0) {
    const siphonAmount = Math.max(1, Math.floor(enemy.maxHp * 0.1));
    nextEnemyHp = Math.max(0, nextEnemyHp - siphonAmount);
    nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + siphonAmount);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【掌中神國】神國抽離敵方本源，額外造成 <dmg>${siphonAmount}</dmg> 點侵蝕傷害，並回復 <heal>${siphonAmount}</heal> 點氣血。`,
      damage: siphonAmount,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (activeSkillCanonicalId === "m_tr_active" && nextEnemyHp > 0) {
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
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (activeSkillCanonicalId === "s_tr_active" && nextEnemyHp <= 0) {
    nextActiveSkillReadyAtMs = currentTimeMs;
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【破劫一擊】一擊斷劫，冷卻即刻重置。`,
      damage: 0,
      playerHp: nextPlayerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  return {
    enemyHp: nextEnemyHp,
    playerHp: nextPlayerHp,
    activeSkillReadyAtMs: nextActiveSkillReadyAtMs,
  };
};

const applyPlayerEchoAndSummonFollowupEffects = ({
  skillReady,
  activeSkillCanonicalId,
  hasSwordEchoPassive,
  currentTimeMs,
  turn,
  logs,
  player,
  enemy,
  enemyHp,
  playerHp,
  playerMaxHp,
  playerDamage,
  effectiveDefense,
  enemyStatuses,
  pVsE,
  enemyElementalAffinity,
}: {
  skillReady: boolean;
  activeSkillCanonicalId?: string;
  hasSwordEchoPassive: boolean;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  player: PlayerCombatStats;
  enemy: Enemy;
  enemyHp: number;
  playerHp: number;
  playerMaxHp: number;
  playerDamage: number;
  effectiveDefense: number;
  enemyStatuses: CombatStatus[];
  pVsE: ReturnType<typeof getRestriction>;
  enemyElementalAffinity: ReturnType<typeof getEnemyElementalModifier>;
}) => {
  let nextEnemyHp = enemyHp;

  if (
    hasSwordEchoPassive &&
    !skillReady &&
    nextEnemyHp > 0 &&
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
    nextEnemyHp = Math.max(0, nextEnemyHp - echoDamage);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【劍意化形】追擊斬落，追加造成 <dmg>${echoDamage}</dmg> 點傷害！`,
      damage: echoDamage,
      playerHp,
      playerMaxHp,
      enemyHp: nextEnemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  if (skillReady && activeSkillCanonicalId === "s_ma_active" && nextEnemyHp > 0) {
    for (let echoIndex = 0; echoIndex < 2 && nextEnemyHp > 0; echoIndex += 1) {
      let echoDamage = resolveDamage(
        player.attack,
        effectiveDefense * getArmorBreakMultiplier(enemyStatuses, currentTimeMs)
      );
      echoDamage = Math.floor(
        echoDamage * getEnemyDamageReductionMultiplier(enemy)
      );
      nextEnemyHp = Math.max(0, nextEnemyHp - echoDamage);
      pushCombatLog(logs, {
        turn,
        timeMs: currentTimeMs + echoIndex + 1,
        isPlayer: true,
        message: `【虛空劍陣】陣眼再斬，追加造成 <dmg>${echoDamage}</dmg> 點傷害！`,
        damage: echoDamage,
        playerHp,
        playerMaxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    }
  }

  if (skillReady && activeSkillCanonicalId === "m_tr_active" && nextEnemyHp > 0) {
    for (let summonIndex = 0; summonIndex < 3 && nextEnemyHp > 0; summonIndex += 1) {
      let summonDamage = resolveDamage(player.magic, effectiveDefense * 0.9);
      summonDamage = Math.floor(
        summonDamage * getEnemyDamageReductionMultiplier(enemy)
      );
      nextEnemyHp = Math.max(0, nextEnemyHp - summonDamage);
      pushCombatLog(logs, {
        turn,
        timeMs: currentTimeMs + summonIndex + 1,
        isPlayer: true,
        message: `【撒豆成兵】金甲天兵出擊，造成 <dmg>${summonDamage}</dmg> 點傷害！`,
        damage: summonDamage,
        playerHp,
        playerMaxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    }
  }

  return nextEnemyHp;
};

const logPlayerSwordResonance = ({
  skillReady,
  activeSkillCanonicalId,
  activeSwordQiStatuses,
  hasSwordQiChain,
  currentTimeMs,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  skillReady: boolean;
  activeSkillCanonicalId?: string;
  activeSwordQiStatuses: CombatStatus[];
  hasSwordQiChain: boolean;
  currentTimeMs: number;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (
    skillReady &&
    activeSkillCanonicalId === "s_tr_active" &&
    activeSwordQiStatuses.length > 0
  ) {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【萬劍歸一】引爆 ${activeSwordQiStatuses.length} 層劍氣共鳴，劍勢瞬間攀升。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
    return true;
  }

  if (skillReady && activeSkillCanonicalId === "s_tr_active" && hasSwordQiChain) {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【萬劍歸一】殘存劍勢與破劫一擊共鳴，爆發再度攀升。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return false;
};

const applySwordHeartUpkeep = ({
  swordHeartStacks,
  logs,
  turn,
  timeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  blockedMessage,
  stackingMessage,
}: {
  swordHeartStacks: number;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  blockedMessage: string;
  stackingMessage: (nextStacks: number) => string;
}) => {
  if (swordHeartStacks >= 5) {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: blockedMessage,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
    return swordHeartStacks;
  }

  const nextStacks = swordHeartStacks + 1;
  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: stackingMessage(nextStacks),
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
  return nextStacks;
};

const logEnemyAvoidance = ({
  logs,
  turn,
  timeMs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  voidEvasion,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  voidEvasion: boolean;
}) => {
  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: false,
    message: voidEvasion
      ? `【空間法則】扭曲了攻勢，你將這次傷害轉入虛空。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 的攻勢被你避開了！`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

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
  const manaSpringEmpowered = isManaSpringEmpowered(
    player.mp,
    player.maxMp,
    passiveFlags
  );
  if (manaSpringEmpowered) {
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
  const incomingStatuses = resolveIncomingEnemySpecialStatuses({
    special,
    player,
    passiveFlags,
    currentTimeMs: 0,
    shortenControlDuration: passiveFlags.hasSwordFusionPassive,
  });

  const statusNames = [
    ...incomingStatuses.normalizedIncomingStatuses.map((status) => status.name),
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
      mageTribulationControlTriggered:
        incomingStatuses.mageTribulationControlTriggered,
      swordFusionControlTriggered:
        incomingStatuses.swordFusionControlTriggered,
      bodyRebirthTrueTriggered,
      bodyEmperorTriggered,
      swordDeathWardTriggered,
    }),
  ];

  statusNames.push(
    ...getEnemyWorldIncomingStatusNames({
      bodyImmortalTriggered: incomingStatuses.bodyImmortalTriggered,
      swordEmperorTriggered: incomingStatuses.swordEmperorTriggered,
    })
  );

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
  const activeSkill = getHighestActiveSkill(player.profession, player.learnedSkills);

  combatLogSnapshotProvider = createCombatSnapshotProvider({
    activeSkill: activeSkill ?? undefined,
    playerStatusesRef: () => playerStatuses,
    enemyStatusesRef: () => enemyStatuses,
    activeSkillReadyAtMsRef: () => activeSkillReadyAtMs,
    learnedSkills: player.learnedSkills,
  });

  const playerAttackIntervalMs = getPlayerAttackIntervalMs(player);
  const enemyAttackIntervalMs = getEnemyAttackIntervalMs(enemy);
  const pVsE = getRestriction(player.element, enemy.element);
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
    hasMageSpiritSeveringPassive,
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

  const processStatusTicks = createStatusTickProcessor({
    getTurn: () => turn,
    logs,
    player,
    enemy,
    passiveFlags,
    getPlayerHp: () => playerHp,
    getEnemyHp: () => enemyHp,
    setPlayerHp: (value) => {
      playerHp = value;
    },
    setEnemyHp: (value) => {
      enemyHp = value;
    },
    getPlayerStatuses: () => playerStatuses,
    setPlayerStatuses: (value) => {
      playerStatuses = value;
    },
    getEnemyStatuses: () => enemyStatuses,
    setEnemyStatuses: (value) => {
      enemyStatuses = value;
    },
    getLastStatusTickMs: () => lastStatusTickMs,
    setLastStatusTickMs: (value) => {
      lastStatusTickMs = value;
    },
    getPlayerDamagedSinceSwordHeartWindow: () => playerDamagedSinceSwordHeartWindow,
    setPlayerDamagedSinceSwordHeartWindow: (value) => {
      playerDamagedSinceSwordHeartWindow = value;
    },
  });

  const { initialPassiveStatuses, initialEnemySpecialReadyAtMs } =
    initializeCombatEncounter({
      player,
      enemy,
      logs,
      passiveFlags,
      restriction: pVsE,
      elementalAffinity: enemyElementalAffinity,
      playerHp,
      enemyHp,
    });
  if (initialPassiveStatuses.length > 0) {
    playerStatuses.push(...initialPassiveStatuses);
  }
  enemySpecialReadyAtMs = initialEnemySpecialReadyAtMs;

  while (playerHp > 0 && enemyHp > 0) {
    const playerActsFirst = playerNextActionMs <= enemyNextActionMs;
    currentTimeMs = playerActsFirst ? playerNextActionMs : enemyNextActionMs;

    const { combatEnded } = resolveTurnStartMaintenance({
      currentTimeMs,
      turn,
      processStatusTicks,
      player,
      enemy,
      logs,
      getPlayerHp: () => playerHp,
      getPlayerMp: () => playerMp,
      setPlayerHp: (value) => {
        playerHp = value;
      },
      setPlayerMp: (value) => {
        playerMp = value;
      },
      getEnemyHp: () => enemyHp,
      getPlayerStatuses: () => playerStatuses,
      setPlayerStatuses: (value) => {
        playerStatuses = value;
      },
      getLastRegenTimeMs: () => lastRegenTimeMs,
      setLastRegenTimeMs: (value) => {
        lastRegenTimeMs = value;
      },
      hasBodyRebirthPassive,
      hasManaSpringPassive,
      hasMageFusionPassive,
      hasBodyImmortalPassive,
      hasBodyAncientPassive,
    });
    if (combatEnded) break;

    if (playerActsFirst) {
      ({
        enemyHp,
        playerHp,
        playerMp,
        playerStatuses,
        enemyStatuses,
        activeSkillReadyAtMs,
        mageFoundationStacks,
        playerNextActionMs,
        nextSwordImmortalGuardAtMs,
        bossBroken,
      } = resolvePlayerTurnPhase({
        currentTimeMs,
        turn,
        player,
        enemy,
        logs,
        passiveFlags,
        pVsE,
        bossBroken,
        playerDebuffed,
        playerHp,
        playerMp,
        enemyHp,
        playerStatuses,
        enemyStatuses,
        activeSkill: activeSkill ?? undefined,
        activeSkillReadyAtMs,
        mageFoundationStacks,
        swordHeartStacks,
        playerAttackIntervalMs,
        nextSwordImmortalGuardAtMs,
        hasMageFusionPassive,
        hasSwordImmortalPassive,
      }));
      if (enemyHp <= 0) break;
    } else {
      const enemyTurnResult = resolveEnemyTurnPhase({
        currentTimeMs,
        turn,
        player,
        enemy,
        logs,
        passiveFlags,
        playerStatuses,
        enemyStatuses,
        playerHp,
        playerMp,
        enemyHp,
        enemyAttackIntervalMs,
        enemySpecialReadyAtMs,
        swordDeathWardUsed,
        bodyTribulationStacks,
        bodyRebirthTrueUsed,
        hasSwordHeartPassive,
        playerDamagedSinceSwordHeartWindow,
        swordHeartStacks,
      });

      if (enemyTurnResult.skipped) {
        ({
          enemyNextActionMs,
          swordHeartStacks,
          playerDamagedSinceSwordHeartWindow,
        } = enemyTurnResult);
        turn++;
        continue;
      } else {
        const resolvedEnemyTurnResult = enemyTurnResult as Exclude<
          ReturnType<typeof resolveEnemyTurnPhase>,
          { skipped: true }
        >;
        ({
          playerHp,
          playerMp,
          enemyHp,
          playerStatuses,
          enemyStatuses,
          swordDeathWardUsed,
          bodyTribulationStacks,
          bodyRebirthTrueUsed,
          playerDamagedSinceSwordHeartWindow,
          swordHeartStacks,
          enemySpecialReadyAtMs,
          enemyNextActionMs,
        } = resolvedEnemyTurnResult);
      }
    }

    bossBroken = false;
    playerDebuffed = false;
    turn++;

    if (turn > 500) break;
  }

  const won = playerHp > 0 && enemyHp <= 0;
  return finalizeCombatResult({
    won,
    logs,
    turn,
    currentTimeMs,
    player,
    enemy,
    playerHp,
    enemyHp,
    previousSnapshotProvider,
  });
};
