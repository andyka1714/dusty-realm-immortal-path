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
  ALL_RETIRED_ALIASES,
} from "./retired_aliases";
import {
  CORE_SKILL_POOL_REGISTRY,
  getSkillPoolEntry,
  LEGACY_SKILL_POOL_REGISTRY,
  LEGACY_SKILL_PROFESSION_POOLS,
  NON_CORE_SKILL_PROFESSION_POOLS,
  NON_CORE_SKILL_POOL_REGISTRY,
  normalizeFormalSkillIds,
  resolveReplacementSkillId,
  SKILL_POOL_REGISTRY,
  SKILL_PROFESSION_POOL_GROUPS,
  SKILL_PROFESSION_POOLS,
  TRANSITION_SKILL_POOL_REGISTRY,
  TRANSITION_SKILL_PROFESSION_POOLS,
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

const buildSkillGroupsByReplacement = (skills: Skill[]) =>
  skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    const groupKey = skill.replacementSkillId ?? skill.id;
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(skill);
    return groups;
  }, {});

const buildSkillGroupsByProfessionAndReplacement = (
  skillsByProfession: Record<ProfessionType, Skill[]>
) =>
  Object.fromEntries(
    Object.entries(skillsByProfession).map(([profession, skills]) => [
      profession,
      buildSkillGroupsByReplacement(skills),
    ])
  ) as Record<ProfessionType, Record<string, Skill[]>>;

const buildMergeReadySkillGroups = (groups: Record<string, Skill[]>) =>
  Object.fromEntries(
    Object.entries(groups).filter(([, groupedSkills]) => groupedSkills.length > 1)
  ) as Record<string, Skill[]>;

const buildMergeReadySkillGroupsByProfession = (
  groupsByProfession: Record<ProfessionType, Record<string, Skill[]>>
) =>
  Object.fromEntries(
    Object.entries(groupsByProfession).map(([profession, groups]) => [
      profession,
      buildMergeReadySkillGroups(groups),
    ])
  ) as Record<ProfessionType, Record<string, Skill[]>>;

const buildSkillMap = (skills: Skill[]) =>
  Object.fromEntries(skills.map((skill) => [skill.id, skill])) as Record<string, Skill>;

const buildFlattenedSkillViewsByProfession = (
  groupsByProfession: Record<ProfessionType, Record<string, Skill[]>>
) =>
  ({
    [ProfessionType.None]: [],
    [ProfessionType.Sword]: Object.values(groupsByProfession[ProfessionType.Sword])
      .flat()
      .sort(compareSkills),
    [ProfessionType.Body]: Object.values(groupsByProfession[ProfessionType.Body])
      .flat()
      .sort(compareSkills),
    [ProfessionType.Mage]: Object.values(groupsByProfession[ProfessionType.Mage])
      .flat()
      .sort(compareSkills),
  }) as Record<ProfessionType, Skill[]>;

const buildSkillMapByProfession = (skillsByProfession: Record<ProfessionType, Skill[]>) =>
  Object.fromEntries(
    Object.entries(skillsByProfession).map(([profession, skills]) => [
      profession,
      buildSkillMap(skills),
    ])
  ) as Record<ProfessionType, Record<string, Skill>>;

const mergeSkillGroupsByProfession = (
  left: Record<ProfessionType, Record<string, Skill[]>>,
  right: Record<ProfessionType, Record<string, Skill[]>>
) =>
  ({
    [ProfessionType.None]: {},
    [ProfessionType.Sword]: {
      ...left[ProfessionType.Sword],
      ...right[ProfessionType.Sword],
    },
    [ProfessionType.Body]: {
      ...left[ProfessionType.Body],
      ...right[ProfessionType.Body],
    },
    [ProfessionType.Mage]: {
      ...left[ProfessionType.Mage],
      ...right[ProfessionType.Mage],
    },
  }) as Record<ProfessionType, Record<string, Skill[]>>;

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
  ...ALL_RETIRED_ALIASES,
};

export const CORE_SKILL_SETS_BY_REALM: Record<MajorRealm, Record<string, Skill>> = {
  [MajorRealm.Mortal]: {},
  [MajorRealm.QiRefining]: QI_REFINING_SKILLS,
  [MajorRealm.Foundation]: FOUNDATION_SKILLS,
  [MajorRealm.GoldenCore]: GOLDEN_CORE_SKILLS,
  [MajorRealm.NascentSoul]: NASCENT_SOUL_SKILLS,
  [MajorRealm.SpiritSevering]: SPIRIT_SEVERING_SKILLS,
  [MajorRealm.VoidRefining]: VOID_REFINING_SKILLS,
  [MajorRealm.Fusion]: FUSION_SKILLS,
  [MajorRealm.Mahayana]: MAHAYANA_SKILLS,
  [MajorRealm.Tribulation]: TRIBULATION_SKILLS,
  [MajorRealm.Immortal]: IMMORTAL_SKILLS,
  [MajorRealm.ImmortalEmperor]: IMMORTAL_EMPEROR_SKILLS,
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

export const TRANSITION_SKILLS = Object.values(TRANSITION_SKILL_POOL_REGISTRY)
  .map((entry) => SKILLS[entry.skillId])
  .filter((skill): skill is Skill => Boolean(skill))
  .sort(compareSkills);

export const LEGACY_SKILLS = Object.values(LEGACY_SKILL_POOL_REGISTRY)
  .map((entry) => SKILLS[entry.skillId])
  .filter((skill): skill is Skill => Boolean(skill))
  .sort(compareSkills);

export const NON_CORE_SKILLS_SORTED = [...TRANSITION_SKILLS, ...LEGACY_SKILLS].sort(compareSkills);

export const FORMAL_CORE_SKILL_MAP: Record<string, Skill> = Object.fromEntries(
  FORMAL_CORE_SKILLS_SORTED.map((skill) => [skill.id, skill])
) as Record<string, Skill>;

export const RETIRED_SKILL_MAP: Record<string, Skill> = Object.fromEntries(
  RETIRED_SKILLS.map((skill) => [skill.id, skill])
) as Record<string, Skill>;

export const TRANSITION_SKILL_MAP: Record<string, Skill> = Object.fromEntries(
  TRANSITION_SKILLS.map((skill) => [skill.id, skill])
) as Record<string, Skill>;

export const LEGACY_SKILL_MAP: Record<string, Skill> = Object.fromEntries(
  LEGACY_SKILLS.map((skill) => [skill.id, skill])
) as Record<string, Skill>;

export const TRANSITION_SKILLS_BY_REPLACEMENT = buildSkillGroupsByReplacement(TRANSITION_SKILLS);

export const LEGACY_SKILLS_BY_REPLACEMENT = buildSkillGroupsByReplacement(LEGACY_SKILLS);

export const NON_CORE_SKILLS_BY_REPLACEMENT = buildSkillGroupsByReplacement(NON_CORE_SKILLS_SORTED);

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

export const TRANSITION_SKILLS_BY_PROFESSION: Record<ProfessionType, Skill[]> = {
  [ProfessionType.None]: [],
  [ProfessionType.Sword]: TRANSITION_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Sword
  ).sort(compareSkills),
  [ProfessionType.Body]: TRANSITION_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Body
  ).sort(compareSkills),
  [ProfessionType.Mage]: TRANSITION_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Mage
  ).sort(compareSkills),
};

export const LEGACY_SKILLS_BY_PROFESSION: Record<ProfessionType, Skill[]> = {
  [ProfessionType.None]: [],
  [ProfessionType.Sword]: LEGACY_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Sword
  ).sort(compareSkills),
  [ProfessionType.Body]: LEGACY_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Body
  ).sort(compareSkills),
  [ProfessionType.Mage]: LEGACY_SKILLS.filter(
    (skill) => skill.profession === ProfessionType.Mage
  ).sort(compareSkills),
};

export const TRANSITION_SKILLS_BY_PROFESSION_AND_REPLACEMENT =
  buildSkillGroupsByProfessionAndReplacement(TRANSITION_SKILLS_BY_PROFESSION);

export const LEGACY_SKILLS_BY_PROFESSION_AND_REPLACEMENT =
  buildSkillGroupsByProfessionAndReplacement(LEGACY_SKILLS_BY_PROFESSION);

export const NON_CORE_SKILLS_BY_PROFESSION_AND_REPLACEMENT =
  buildSkillGroupsByProfessionAndReplacement({
    [ProfessionType.None]: [],
    [ProfessionType.Sword]: [
      ...TRANSITION_SKILLS_BY_PROFESSION[ProfessionType.Sword],
      ...LEGACY_SKILLS_BY_PROFESSION[ProfessionType.Sword],
    ].sort(compareSkills),
    [ProfessionType.Body]: [
      ...TRANSITION_SKILLS_BY_PROFESSION[ProfessionType.Body],
      ...LEGACY_SKILLS_BY_PROFESSION[ProfessionType.Body],
    ].sort(compareSkills),
    [ProfessionType.Mage]: [
      ...TRANSITION_SKILLS_BY_PROFESSION[ProfessionType.Mage],
      ...LEGACY_SKILLS_BY_PROFESSION[ProfessionType.Mage],
    ].sort(compareSkills),
  });

export const MERGE_READY_NON_CORE_SKILL_GROUPS = buildMergeReadySkillGroups(
  NON_CORE_SKILLS_BY_REPLACEMENT
);

export const MERGE_READY_TRANSITION_SKILL_GROUPS = buildMergeReadySkillGroups(
  TRANSITION_SKILLS_BY_REPLACEMENT
);

export const MERGE_READY_LEGACY_SKILL_GROUPS = buildMergeReadySkillGroups(
  LEGACY_SKILLS_BY_REPLACEMENT
);

export const MERGE_READY_NON_CORE_SKILL_GROUPS_BY_PROFESSION =
  buildMergeReadySkillGroupsByProfession(NON_CORE_SKILLS_BY_PROFESSION_AND_REPLACEMENT);

export const MERGE_READY_TRANSITION_SKILL_GROUPS_BY_PROFESSION =
  buildMergeReadySkillGroupsByProfession(TRANSITION_SKILLS_BY_PROFESSION_AND_REPLACEMENT);

export const MERGE_READY_LEGACY_SKILL_GROUPS_BY_PROFESSION =
  buildMergeReadySkillGroupsByProfession(LEGACY_SKILLS_BY_PROFESSION_AND_REPLACEMENT);

export const MERGE_READY_NON_CORE_SKILLS = Object.values(MERGE_READY_NON_CORE_SKILL_GROUPS)
  .flat()
  .sort(compareSkills);

export const MERGE_READY_NON_CORE_SKILL_MAP: Record<string, Skill> =
  buildSkillMap(MERGE_READY_NON_CORE_SKILLS);

export const MERGE_READY_NON_CORE_SKILLS_BY_PROFESSION =
  buildFlattenedSkillViewsByProfession(MERGE_READY_NON_CORE_SKILL_GROUPS_BY_PROFESSION);

export const MERGE_READY_TRANSITION_SKILLS = Object.values(MERGE_READY_TRANSITION_SKILL_GROUPS)
  .flat()
  .sort(compareSkills);

export const MERGE_READY_LEGACY_SKILLS = Object.values(MERGE_READY_LEGACY_SKILL_GROUPS)
  .flat()
  .sort(compareSkills);

export const MERGE_READY_TRANSITION_SKILL_MAP: Record<string, Skill> =
  buildSkillMap(MERGE_READY_TRANSITION_SKILLS);

export const MERGE_READY_LEGACY_SKILL_MAP: Record<string, Skill> =
  buildSkillMap(MERGE_READY_LEGACY_SKILLS);

export const MERGE_READY_TRANSITION_SKILLS_BY_PROFESSION =
  buildFlattenedSkillViewsByProfession(MERGE_READY_TRANSITION_SKILL_GROUPS_BY_PROFESSION);

export const MERGE_READY_LEGACY_SKILLS_BY_PROFESSION =
  buildFlattenedSkillViewsByProfession(MERGE_READY_LEGACY_SKILL_GROUPS_BY_PROFESSION);

export const FINAL_CULL_SKILL_GROUPS_BY_PROFESSION = {
  transition: MERGE_READY_TRANSITION_SKILL_GROUPS_BY_PROFESSION,
  legacy: MERGE_READY_LEGACY_SKILL_GROUPS_BY_PROFESSION,
} as const;

export const FINAL_CULL_SKILLS_BY_PROFESSION_AND_REPLACEMENT =
  mergeSkillGroupsByProfession(
    MERGE_READY_TRANSITION_SKILL_GROUPS_BY_PROFESSION,
    MERGE_READY_LEGACY_SKILL_GROUPS_BY_PROFESSION
  );

export const FINAL_CULL_SKILLS_BY_PROFESSION =
  buildFlattenedSkillViewsByProfession(FINAL_CULL_SKILLS_BY_PROFESSION_AND_REPLACEMENT);

export const FINAL_CULL_SKILL_MAP_BY_PROFESSION = buildSkillMapByProfession(
  FINAL_CULL_SKILLS_BY_PROFESSION
);

export const FINAL_CULL_SKILL_MAP_BY_PROFESSION_AND_REPLACEMENT = Object.fromEntries(
  Object.entries(FINAL_CULL_SKILLS_BY_PROFESSION_AND_REPLACEMENT).map(([profession, groups]) => [
    profession,
    Object.fromEntries(
      Object.entries(groups).map(([replacementSkillId, skills]) => [
        replacementSkillId,
        buildSkillMap(skills),
      ])
    ),
  ])
) as Record<ProfessionType, Record<string, Record<string, Skill>>>;

export const FINAL_CULL_SKILL_IDS_BY_PROFESSION = Object.fromEntries(
  Object.entries(FINAL_CULL_SKILLS_BY_PROFESSION).map(([profession, skills]) => [
    profession,
    skills.map((skill) => skill.id),
  ])
) as Record<ProfessionType, string[]>;

export const SKILLS_BY_REALM: Record<MajorRealm, Skill[]> = Object.fromEntries(
  Object.entries(CORE_SKILL_SETS_BY_REALM).map(([realm, skills]) => [
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

export const isFormalCoreSkill = (skillId: string) =>
  FORMAL_CORE_SKILL_IDS.has(skillId);

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
export const normalizeLearnedSkills = (skillIds: string[]) =>
  normalizeFormalSkillIds(skillIds)
    .map((skillId) => SKILLS[skillId])
    .filter((skill): skill is Skill => Boolean(skill));
export {
  CORE_SKILL_POOL_REGISTRY,
  LEGACY_SKILL_POOL_REGISTRY,
  LEGACY_SKILL_PROFESSION_POOLS,
  NON_CORE_SKILL_PROFESSION_POOLS,
  NON_CORE_SKILL_POOL_REGISTRY,
  SKILL_POOL_REGISTRY,
  SKILL_PROFESSION_POOL_GROUPS,
  SKILL_PROFESSION_POOLS,
  TRANSITION_SKILL_POOL_REGISTRY,
  TRANSITION_SKILL_PROFESSION_POOLS,
  getSkillPoolEntry,
};
