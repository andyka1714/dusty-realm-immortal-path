import {
  BaseAttributes,
  ElementType,
  MajorRealm,
  ProfessionType,
  Skill,
  SpiritRootId,
} from "../types";
import {
  REALM_BASE_STATS,
  SPIRIT_ROOT_DETAILS,
  SPIRIT_ROOT_TO_ELEMENT,
} from "../constants";
import { getLearnedSkills } from "./battleProfiles";
import {
  getPassiveSkillBonuses,
  getProfessionPassives,
} from "./battlePassiveSkillBonusRegistry";
import type { PlayerCombatStats } from "./battleSystem";
import { getCoreAttributeEffects } from "./attributeEffects";

const BODY_LATE_REALM_ATTACK_BONUS: Partial<Record<MajorRealm, number>> = {
  [MajorRealm.Fusion]: 0.04,
  [MajorRealm.Mahayana]: 0.06,
  [MajorRealm.Tribulation]: 0.08,
  [MajorRealm.Immortal]: 0.1,
  [MajorRealm.ImmortalEmperor]: 0.12,
};

const MAGE_LATE_REALM_HP_BONUS: Partial<Record<MajorRealm, number>> = {
  [MajorRealm.Fusion]: 0.04,
  [MajorRealm.Mahayana]: 0.06,
  [MajorRealm.Tribulation]: 0.08,
  [MajorRealm.Immortal]: 0.1,
  [MajorRealm.ImmortalEmperor]: 0.12,
};

const MAGE_LATE_REALM_RES_BONUS: Partial<Record<MajorRealm, number>> = {
  [MajorRealm.Fusion]: 0.04,
  [MajorRealm.Mahayana]: 0.06,
  [MajorRealm.Tribulation]: 0.08,
  [MajorRealm.Immortal]: 0.1,
  [MajorRealm.ImmortalEmperor]: 0.12,
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

  if (profession === ProfessionType.Body) {
    attack *= 1 + (BODY_LATE_REALM_ATTACK_BONUS[majorRealm] ?? 0);
  }

  if (profession === ProfessionType.Mage) {
    maxHp *= 1 + (MAGE_LATE_REALM_HP_BONUS[majorRealm] ?? 0);
    res *= 1 + (MAGE_LATE_REALM_RES_BONUS[majorRealm] ?? 0);
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
  const attributeEffects = getCoreAttributeEffects({
    ...attributes,
    comprehension: effectiveComprehension,
    fortune: effectiveFortune,
  });
  const breakthroughBonus = attributeEffects.breakthroughBonus;
  const dropRateBonus = attributeEffects.dropRateBonus;
  const cultivationSpeedBonus = attributeEffects.cultivationSpeedBonus;
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
