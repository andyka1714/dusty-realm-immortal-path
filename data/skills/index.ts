import { MajorRealm, ProfessionType, Skill } from "../../types";
import { QI_REFINING_SKILLS } from "./qi_refining";
import { FOUNDATION_SKILLS } from "./foundation";
import { GOLDEN_CORE_SKILLS } from "./golden_core";
import { NASCENT_SOUL_SKILLS } from "./nascent_soul";
import { SPIRIT_SEVERING_SKILLS } from "./spirit_severing";
import { VOID_REFINING_SKILLS } from "./void_refining";
import { FUSION_SKILLS } from "./fusion";
import { MAHAYANA_SKILLS } from "./mahayana";
import { TRIBULATION_SKILLS } from "./tribulation";
import { IMMORTAL_SKILLS } from "./immortal";
import { IMMORTAL_EMPEROR_SKILLS } from "./immortal_emperor";
import {
  BATTLE_ABSORBED_RETIRED_ACTIVE_ALIASES,
  BATTLE_ABSORBED_RETIRED_ACTIVE_ALIAS_VIEWS,
  ALL_RETIRED_ACTIVE_ALIASES,
  RETIREMENT_READY_RETIRED_ACTIVE_ALIASES,
  RETIREMENT_READY_RETIRED_ACTIVE_ALIAS_VIEWS,
} from "./retired_active_aliases";
import {
  ALL_RETIRED_PASSIVE_ALIASES,
  BATTLE_ABSORBED_RETIRED_PASSIVE_ALIASES,
  BATTLE_ABSORBED_RETIRED_PASSIVE_ALIAS_VIEWS,
  RETIREMENT_READY_RETIRED_PASSIVE_ALIASES,
  RETIREMENT_READY_RETIRED_PASSIVE_ALIAS_VIEWS,
} from "./retired_passive_aliases";
import {
  getRetiredAliasesForRealm,
  stripRetiredAliasesForRealmView,
} from "./retired_aliases";
import {
  getSkillPoolEntry,
  normalizeFormalSkillIds,
  resolveReplacementSkillId,
  SKILL_POOL_REGISTRY,
  SKILL_PROFESSION_POOLS,
} from "./pool";

const compareSkills = (left: Skill, right: Skill) => {
  if (left.minRealm !== right.minRealm) {
    return left.minRealm - right.minRealm;
  }

  if (left.type !== right.type) {
    return left.type === "Active" ? -1 : 1;
  }

  return left.name.localeCompare(right.name, "zh-Hant");
};

const getDefaultRealtimeShape = (
  skill: Skill
): Pick<
  Skill,
  | "cooldownSeconds"
  | "castRange"
  | "castTimeMs"
  | "projectileSpeed"
  | "areaShape"
  | "areaRadius"
  | "maxTargets"
> => {
  if (skill.type === "Passive") {
    return {
      cooldownSeconds: 0,
      castRange: 0,
      castTimeMs: 0,
      projectileSpeed: undefined,
      areaShape: "self",
      areaRadius: 0,
      maxTargets: 1,
    };
  }

  switch (skill.profession) {
    case "Mage":
      return {
        cooldownSeconds: Math.max(2.2, skill.cooldown * 1.25),
        castRange: skill.targetType === "self" ? 0 : 5,
        castTimeMs: 420,
        projectileSpeed: 11,
        areaShape: skill.targetType === "all" ? "circle" : "single",
        areaRadius: skill.targetType === "all" ? 2 : 0,
        maxTargets: skill.targetType === "all" ? 6 : 1,
      };
    case "Body":
      return {
        cooldownSeconds: Math.max(1.8, skill.cooldown * 1.3),
        castRange: skill.targetType === "self" ? 0 : 1,
        castTimeMs: 320,
        projectileSpeed: undefined,
        areaShape: skill.targetType === "all" ? "cone" : "single",
        areaRadius: skill.targetType === "all" ? 1 : 0,
        maxTargets: skill.targetType === "all" ? 3 : 1,
      };
    case "Sword":
    default:
      return {
        cooldownSeconds: Math.max(1.4, skill.cooldown * 1.15),
        castRange: skill.targetType === "self" ? 0 : 1,
        castTimeMs: 220,
        projectileSpeed: undefined,
        areaShape: skill.targetType === "all" ? "line" : "single",
        areaRadius: skill.targetType === "all" ? 1 : 0,
        maxTargets: skill.targetType === "all" ? 4 : 1,
      };
  }
};

const getDefaultPassiveTags = (skill: Skill): Skill["passiveEffectTags"] => {
  if (skill.type !== "Passive") return undefined;

  const text = `${skill.name} ${skill.description}`;
  const tags = new Set<NonNullable<Skill["passiveEffectTags"]>[number]>();

  if (/暴擊|劍心|劍脈/.test(text)) tags.add("crit");
  if (/減傷|銅皮|防禦|護體/.test(text)) tags.add("damage_reduction");
  if (/反彈|反傷|反震|荊棘/.test(text)) tags.add("reflect");
  if (/護盾/.test(text)) tags.add("shield");
  if (/冷卻|重置/.test(text)) tags.add("cooldown_reduction");
  if (/回復|回春|重生|生命/.test(text)) tags.add("regen");
  if (/法力|靈力/.test(text)) tags.add("mana_flow");
  if (/閃避/.test(text)) tags.add("evasion");
  if (/破甲|無視.*防禦/.test(text)) tags.add("armor_break");
  if (/致命傷害|抵擋該次傷害/.test(text)) tags.add("death_prevention");
  if (/免疫控制/.test(text)) tags.add("control_immunity");
  if (/解除自身一個負面狀態/.test(text)) tags.add("cleanse");

  if (tags.size === 0) {
    switch (skill.profession) {
      case "Sword":
        tags.add("offense");
        break;
      case "Body":
        tags.add("durability");
        break;
      case "Mage":
        tags.add("spellpower");
        break;
    }
  }

  return Array.from(tags);
};

export const EXPLICIT_PASSIVE_EFFECT_SKILL_IDS = new Set<string>([
  "s_q_passive",
  "s_f_passive",
  "s_g_passive",
  "s_n_passive",
  "s_sf_passive",
  "s_vr_passive",
  "s_bi_passive",
  "s_ma_passive",
  "s_tr_passive",
  "s_im_passive",
  "s_ie_passive",
  "b_q_passive",
  "b_f_passive",
  "b_g_passive",
  "b_n_passive",
  "b_sf_passive",
  "b_vr_passive",
  "b_bi_passive",
  "b_ma_passive",
  "b_tr_passive",
  "b_im_passive",
  "b_ie_passive",
  "m_q_passive",
  "m_f_passive",
  "m_g_passive",
  "m_n_passive",
  "m_sf_passive",
  "m_vr_passive",
  "m_bi_passive",
  "m_ma_passive",
  "m_tr_passive",
  "m_im_passive",
  "m_ie_passive",
  ...Object.keys(ALL_RETIRED_PASSIVE_ALIASES),
]);

const normalizeSkill = (skill: Skill): Skill => {
  const realtime = getDefaultRealtimeShape(skill);
  const poolEntry = getSkillPoolEntry(skill.id);

  return {
    ...skill,
    cooldownSeconds: skill.cooldownSeconds ?? realtime.cooldownSeconds,
    castRange: skill.castRange ?? realtime.castRange,
    castTimeMs: skill.castTimeMs ?? realtime.castTimeMs,
    projectileSpeed: skill.projectileSpeed ?? realtime.projectileSpeed,
    areaShape: skill.areaShape ?? realtime.areaShape,
    areaRadius: skill.areaRadius ?? realtime.areaRadius,
    maxTargets: skill.maxTargets ?? realtime.maxTargets,
    passiveEffectTags:
      skill.passiveEffectTags ??
      (EXPLICIT_PASSIVE_EFFECT_SKILL_IDS.has(skill.id)
        ? undefined
        : getDefaultPassiveTags(skill)),
    poolStatus: skill.poolStatus ?? poolEntry?.poolStatus,
    formalRole: skill.formalRole ?? poolEntry?.formalRole,
    formalSourceTier: skill.formalSourceTier ?? poolEntry?.formalSourceTier,
    prerequisiteSkillIds: skill.prerequisiteSkillIds ?? poolEntry?.prerequisiteSkillIds,
    replacementSkillId: skill.replacementSkillId ?? poolEntry?.replacementSkillId,
  };
};

const RAW_SKILLS: Record<string, Skill> = {
  ...QI_REFINING_SKILLS,
  ...FOUNDATION_SKILLS,
  ...GOLDEN_CORE_SKILLS,
  ...NASCENT_SOUL_SKILLS,
  ...SPIRIT_SEVERING_SKILLS,
  ...VOID_REFINING_SKILLS,
  ...FUSION_SKILLS,
  ...MAHAYANA_SKILLS,
  ...TRIBULATION_SKILLS,
  ...IMMORTAL_SKILLS,
  ...IMMORTAL_EMPEROR_SKILLS,
  ...ALL_RETIRED_ACTIVE_ALIASES,
  ...ALL_RETIRED_PASSIVE_ALIASES,
};

const buildRealmSkillSet = (
  realm: MajorRealm,
  baseSkills: Record<string, Skill>
) =>
  stripRetiredAliasesForRealmView({
    ...baseSkills,
    ...getRetiredAliasesForRealm(realm),
  });

const RAW_SKILL_SETS_BY_REALM: Record<MajorRealm, Record<string, Skill>> = {
  [MajorRealm.Mortal]: {},
  [MajorRealm.QiRefining]: QI_REFINING_SKILLS,
  [MajorRealm.Foundation]: buildRealmSkillSet(MajorRealm.Foundation, FOUNDATION_SKILLS),
  [MajorRealm.GoldenCore]: GOLDEN_CORE_SKILLS,
  [MajorRealm.NascentSoul]: NASCENT_SOUL_SKILLS,
  [MajorRealm.SpiritSevering]: SPIRIT_SEVERING_SKILLS,
  [MajorRealm.VoidRefining]: buildRealmSkillSet(MajorRealm.VoidRefining, VOID_REFINING_SKILLS),
  [MajorRealm.Fusion]: buildRealmSkillSet(MajorRealm.Fusion, FUSION_SKILLS),
  [MajorRealm.Mahayana]: buildRealmSkillSet(MajorRealm.Mahayana, MAHAYANA_SKILLS),
  [MajorRealm.Tribulation]: buildRealmSkillSet(MajorRealm.Tribulation, TRIBULATION_SKILLS),
  [MajorRealm.Immortal]: buildRealmSkillSet(MajorRealm.Immortal, IMMORTAL_SKILLS),
  [MajorRealm.ImmortalEmperor]: buildRealmSkillSet(MajorRealm.ImmortalEmperor, IMMORTAL_EMPEROR_SKILLS),
};

export const SKILLS: Record<string, Skill> = Object.fromEntries(
  Object.entries(RAW_SKILLS).map(([id, skill]) => [id, normalizeSkill(skill)])
) as Record<string, Skill>;

export const FORMAL_CORE_SKILLS = Object.values(SKILLS).filter(
  (skill) => skill.poolStatus === "core"
);

export const FORMAL_CORE_SKILLS_SORTED = [...FORMAL_CORE_SKILLS].sort(compareSkills);

export const RETIRED_SKILLS = Object.values(SKILLS).filter(
  (skill) => skill.poolStatus !== "core"
);

export const FORMAL_CORE_SKILL_MAP: Record<string, Skill> = Object.fromEntries(
  FORMAL_CORE_SKILLS_SORTED.map((skill) => [skill.id, skill])
) as Record<string, Skill>;

export const RETIRED_SKILL_MAP: Record<string, Skill> = Object.fromEntries(
  RETIRED_SKILLS.map((skill) => [skill.id, skill])
) as Record<string, Skill>;

export const FORMAL_CORE_SKILLS_BY_SOURCE_TIER: Record<
  NonNullable<Skill["formalSourceTier"]>,
  Skill[]
> = {
  shop: FORMAL_CORE_SKILLS.filter((skill) => skill.formalSourceTier === "shop").sort(compareSkills),
  elite: FORMAL_CORE_SKILLS.filter((skill) => skill.formalSourceTier === "elite").sort(compareSkills),
  boss: FORMAL_CORE_SKILLS.filter((skill) => skill.formalSourceTier === "boss").sort(compareSkills),
  inheritance: FORMAL_CORE_SKILLS.filter(
    (skill) => skill.formalSourceTier === "inheritance"
  ).sort(compareSkills),
};

export const FORMAL_CORE_PASSIVE_SKILLS = FORMAL_CORE_SKILLS_SORTED.filter(
  (skill) => skill.type === "Passive"
);

export const FORMAL_CORE_ACTIVE_SKILLS = FORMAL_CORE_SKILLS_SORTED.filter(
  (skill) => skill.type === "Active"
);

export const FORMAL_CORE_SKILLS_BY_PROFESSION: Record<
  ProfessionType,
  Skill[]
> = {
  [ProfessionType.None]: [],
  [ProfessionType.Sword]: FORMAL_CORE_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Sword
  ).sort(compareSkills),
  [ProfessionType.Body]: FORMAL_CORE_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Body
  ).sort(compareSkills),
  [ProfessionType.Mage]: FORMAL_CORE_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Mage
  ).sort(compareSkills),
};

export const SKILLS_BY_REALM: Record<MajorRealm, Skill[]> = Object.fromEntries(
  Object.entries(RAW_SKILL_SETS_BY_REALM).map(([realm, skills]) => [
    Number(realm),
    Object.values(skills)
      .map((skill) => SKILLS[skill.id])
      .filter((skill): skill is Skill => Boolean(skill))
      .sort(compareSkills),
  ])
) as Record<MajorRealm, Skill[]>;

export const FORMAL_CORE_SKILLS_BY_REALM: Record<MajorRealm, Skill[]> = Object.fromEntries(
  Object.entries(SKILLS_BY_REALM).map(([realm, skills]) => [
    Number(realm),
    skills.filter((skill) => skill.poolStatus === "core"),
  ])
) as Record<MajorRealm, Skill[]>;

export const RETIRED_SKILLS_BY_REALM: Record<MajorRealm, Skill[]> = Object.fromEntries(
  Object.entries(SKILLS_BY_REALM).map(([realm, skills]) => [
    Number(realm),
    skills.filter((skill) => skill.poolStatus !== "core"),
  ])
) as Record<MajorRealm, Skill[]>;

export const FORMAL_CORE_SKILL_IDS = new Set(
  FORMAL_CORE_SKILLS.map((skill) => skill.id)
);

export const SKILL_NAME_INDEX: Record<string, Skill> = Object.fromEntries(
  Object.values(SKILLS).map((skill) => [skill.name, skill])
) as Record<string, Skill>;

export const FORMAL_CORE_SKILL_NAME_INDEX: Record<string, Skill> = Object.fromEntries(
  FORMAL_CORE_SKILLS_SORTED.map((skill) => [skill.name, skill])
) as Record<string, Skill>;

export const RETIRED_SKILL_NAME_INDEX: Record<string, Skill> = Object.fromEntries(
  RETIRED_SKILLS.map((skill) => [skill.name, skill])
) as Record<string, Skill>;

const resolveSkillViews = (skills: Skill[]) =>
  skills.map((skill) => SKILLS[skill.id]).filter((skill): skill is Skill => Boolean(skill));

const buildSkillMap = (skills: Skill[]) =>
  Object.fromEntries(skills.map((skill) => [skill.id, skill])) as Record<string, Skill>;

export const BATTLE_ABSORBED_RETIRED_SKILLS = resolveSkillViews(
  BATTLE_ABSORBED_RETIRED_ACTIVE_ALIAS_VIEWS
);

export const BATTLE_ABSORBED_RETIRED_SKILL_MAP: Record<string, Skill> = buildSkillMap(
  BATTLE_ABSORBED_RETIRED_SKILLS
);

export const BATTLE_ABSORBED_RETIRED_PASSIVE_SKILLS = resolveSkillViews(
  BATTLE_ABSORBED_RETIRED_PASSIVE_ALIAS_VIEWS
);

export const BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP: Record<string, Skill> = buildSkillMap(
  BATTLE_ABSORBED_RETIRED_PASSIVE_SKILLS
);

export const RETIREMENT_READY_RETIRED_SKILLS = resolveSkillViews(
  RETIREMENT_READY_RETIRED_ACTIVE_ALIAS_VIEWS
);

export const RETIREMENT_READY_RETIRED_SKILL_MAP: Record<string, Skill> = buildSkillMap(
  RETIREMENT_READY_RETIRED_SKILLS
);

export const RETIREMENT_READY_RETIRED_PASSIVE_SKILLS = resolveSkillViews(
  RETIREMENT_READY_RETIRED_PASSIVE_ALIAS_VIEWS
);

export const RETIREMENT_READY_RETIRED_PASSIVE_SKILL_MAP: Record<string, Skill> = buildSkillMap(
  RETIREMENT_READY_RETIRED_PASSIVE_SKILLS
);

export const isFormalCoreSkill = (skillId: string) =>
  FORMAL_CORE_SKILL_IDS.has(skillId);
export const isBattleAbsorbedRetiredSkill = (skillId: string) =>
  Boolean(BATTLE_ABSORBED_RETIRED_SKILL_MAP[skillId]);
export const getBattleAbsorbedRetiredSkills = () =>
  [...BATTLE_ABSORBED_RETIRED_SKILLS].sort(compareSkills);
export const isBattleAbsorbedRetiredPassiveSkill = (skillId: string) =>
  Boolean(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP[skillId]);
export const getBattleAbsorbedRetiredPassiveSkills = () =>
  [...BATTLE_ABSORBED_RETIRED_PASSIVE_SKILLS].sort(compareSkills);
export const isRetirementReadyRetiredSkill = (skillId: string) =>
  Boolean(RETIREMENT_READY_RETIRED_SKILL_MAP[skillId]);
export const getRetirementReadyRetiredSkills = () =>
  [...RETIREMENT_READY_RETIRED_SKILLS].sort(compareSkills);
export const getRetirementReadyRetiredPassiveSkills = () =>
  [...RETIREMENT_READY_RETIRED_PASSIVE_SKILLS].sort(compareSkills);

export const getSkill = (id: string): Skill | undefined => SKILLS[id];
export const getFormalSkillId = (skillId: string) => resolveReplacementSkillId(skillId);
export const getFormalSkill = (skillId: string): Skill | undefined =>
  FORMAL_CORE_SKILL_MAP[getFormalSkillId(skillId)] ?? SKILLS[getFormalSkillId(skillId)];
export const getSkillByName = (skillName: string) => SKILL_NAME_INDEX[skillName];
export const getFormalSkillByNameExact = (skillName: string) =>
  FORMAL_CORE_SKILL_NAME_INDEX[skillName];
export const getFormalSkillByName = (skillName: string) => {
  return getFormalSkillByNameExact(skillName) ?? (() => {
    const skill = getSkillByName(skillName);
    return skill ? getFormalSkill(skill.id) : undefined;
  })();
};
export const getFormalCoreSkills = (options?: {
  profession?: ProfessionType;
  minRealm?: Skill["minRealm"];
  formalSourceTier?: NonNullable<Skill["formalSourceTier"]>;
  type?: Skill["type"];
}) =>
  FORMAL_CORE_SKILLS_SORTED.filter((skill) => {
    if (options?.profession && skill.profession !== options.profession) {
      return false;
    }
    if (options?.minRealm !== undefined && skill.minRealm !== options.minRealm) {
      return false;
    }
    if (
      options?.formalSourceTier &&
      skill.formalSourceTier !== options.formalSourceTier
    ) {
      return false;
    }
    if (options?.type && skill.type !== options.type) {
      return false;
    }
    return true;
  });
export const getSkillsByRealm = (realm: MajorRealm) => SKILLS_BY_REALM[realm] ?? [];
export const getFormalCoreSkillsByRealm = (realm: MajorRealm) =>
  FORMAL_CORE_SKILLS_BY_REALM[realm] ?? [];
export const getRetiredSkillsByRealm = (realm: MajorRealm) =>
  RETIRED_SKILLS_BY_REALM[realm] ?? [];
export const normalizeLearnedSkills = (skillIds: string[]) =>
  normalizeFormalSkillIds(skillIds)
    .map((skillId) => SKILLS[skillId])
    .filter((skill): skill is Skill => Boolean(skill));
export { SKILL_POOL_REGISTRY, SKILL_PROFESSION_POOLS, getSkillPoolEntry };
