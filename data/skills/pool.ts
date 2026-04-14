import { ProfessionType, Skill } from "../../types";

export interface SkillPoolEntry {
  skillId: string;
  profession: ProfessionType;
  poolStatus: NonNullable<Skill["poolStatus"]>;
  formalRole: NonNullable<Skill["formalRole"]>;
  formalSourceTier: NonNullable<Skill["formalSourceTier"]>;
  prerequisiteSkillIds: string[];
  replacementSkillId?: string;
}

const defineSkill = (
  profession: ProfessionType,
  skillId: string,
  poolStatus: SkillPoolEntry["poolStatus"],
  formalRole: SkillPoolEntry["formalRole"],
  formalSourceTier: SkillPoolEntry["formalSourceTier"],
  prerequisiteSkillIds: string[] = [],
  replacementSkillId?: string
): SkillPoolEntry => ({
  skillId,
  profession,
  poolStatus,
  formalRole,
  formalSourceTier,
  prerequisiteSkillIds,
  replacementSkillId,
});

const SWORD_SKILL_POOL_ENTRIES: SkillPoolEntry[] = [
  defineSkill(ProfessionType.Sword, "s_q_active", "core", "guaranteed", "shop"),
  defineSkill(ProfessionType.Sword, "s_q_passive", "core", "passive", "shop"),
  defineSkill(ProfessionType.Sword, "s_f_active", "core", "utility", "boss", ["s_q_active"]),
  defineSkill(ProfessionType.Sword, "s_f_passive", "transition", "passive", "shop", ["s_q_passive"], "s_g_passive"),
  defineSkill(ProfessionType.Sword, "s_g_active", "core", "burst", "boss", ["s_f_active"]),
  defineSkill(ProfessionType.Sword, "s_g_passive", "core", "passive", "elite", ["s_q_passive"]),
  defineSkill(ProfessionType.Sword, "s_n_active", "core", "burst", "boss", ["s_f_active", "s_g_active"]),
  defineSkill(ProfessionType.Sword, "s_n_passive", "core", "passive", "elite", ["s_g_passive"]),
  defineSkill(ProfessionType.Sword, "s_sf_active", "core", "burst", "boss", ["s_n_active"]),
  defineSkill(ProfessionType.Sword, "s_sf_passive", "core", "passive", "elite", ["s_n_passive"]),
  defineSkill(ProfessionType.Sword, "s_vr_active", "transition", "utility", "boss", ["s_sf_active"], "s_ma_active"),
  defineSkill(ProfessionType.Sword, "s_vr_passive", "transition", "passive", "elite", ["s_sf_passive"], "s_tr_passive"),
  defineSkill(ProfessionType.Sword, "s_bi_active", "transition", "burst", "boss", ["s_sf_active", "s_vr_active"], "s_tr_active"),
  defineSkill(ProfessionType.Sword, "s_bi_passive", "legacy", "passive", "elite", ["s_vr_passive"], "s_tr_passive"),
  defineSkill(ProfessionType.Sword, "s_ma_active", "core", "burst", "inheritance", ["s_g_active", "s_sf_active"]),
  defineSkill(ProfessionType.Sword, "s_ma_passive", "transition", "passive", "elite", ["s_g_passive"], "s_tr_passive"),
  defineSkill(ProfessionType.Sword, "s_tr_active", "core", "burst", "inheritance", ["s_n_active", "s_ma_active"]),
  defineSkill(ProfessionType.Sword, "s_tr_passive", "core", "passive", "inheritance", ["s_sf_passive"]),
  defineSkill(ProfessionType.Sword, "s_im_active", "transition", "utility", "boss", ["s_ma_active", "s_tr_active"], "s_tr_active"),
  defineSkill(ProfessionType.Sword, "s_im_passive", "legacy", "passive", "elite", ["s_tr_passive"], "s_tr_passive"),
  defineSkill(ProfessionType.Sword, "s_ie_active", "legacy", "burst", "inheritance", ["s_tr_active", "s_im_active"], "s_tr_active"),
  defineSkill(ProfessionType.Sword, "s_ie_passive", "legacy", "passive", "inheritance", ["s_tr_passive", "s_im_passive"], "s_tr_passive"),
];

const BODY_SKILL_POOL_ENTRIES: SkillPoolEntry[] = [
  defineSkill(ProfessionType.Body, "b_q_active", "core", "guaranteed", "shop"),
  defineSkill(ProfessionType.Body, "b_q_passive", "core", "passive", "shop"),
  defineSkill(ProfessionType.Body, "b_f_active", "core", "utility", "boss", ["b_q_active"]),
  defineSkill(ProfessionType.Body, "b_f_passive", "core", "passive", "shop", ["b_q_passive"]),
  defineSkill(ProfessionType.Body, "b_g_active", "core", "utility", "boss", ["b_f_active"]),
  defineSkill(ProfessionType.Body, "b_g_passive", "core", "passive", "elite", ["b_q_passive"]),
  defineSkill(ProfessionType.Body, "b_n_active", "core", "burst", "boss", ["b_f_active", "b_g_active"]),
  defineSkill(ProfessionType.Body, "b_n_passive", "core", "passive", "elite", ["b_f_passive"]),
  defineSkill(ProfessionType.Body, "b_sf_active", "core", "utility", "boss", ["b_g_active"]),
  defineSkill(ProfessionType.Body, "b_sf_passive", "core", "passive", "elite", ["b_n_passive"]),
  defineSkill(ProfessionType.Body, "b_vr_active", "core", "burst", "boss", ["b_n_active", "b_sf_active"]),
  defineSkill(ProfessionType.Body, "b_vr_passive", "transition", "passive", "elite", ["b_sf_passive"], "b_sf_passive"),
  defineSkill(ProfessionType.Body, "b_bi_active", "transition", "utility", "boss", ["b_vr_active"], "b_ma_active"),
  defineSkill(ProfessionType.Body, "b_bi_passive", "legacy", "passive", "elite", ["b_vr_passive"], "b_sf_passive"),
  defineSkill(ProfessionType.Body, "b_ma_active", "core", "burst", "inheritance", ["b_sf_active", "b_vr_active"]),
  defineSkill(ProfessionType.Body, "b_ma_passive", "transition", "passive", "elite", ["b_n_passive", "b_sf_passive"], "b_sf_passive"),
  defineSkill(ProfessionType.Body, "b_tr_active", "transition", "utility", "boss", ["b_ma_active"], "b_vr_active"),
  defineSkill(ProfessionType.Body, "b_tr_passive", "legacy", "passive", "elite", ["b_ma_passive"], "b_sf_passive"),
  defineSkill(ProfessionType.Body, "b_im_active", "transition", "burst", "boss", ["b_ma_active", "b_tr_active"], "b_ma_active"),
  defineSkill(ProfessionType.Body, "b_im_passive", "legacy", "passive", "elite", ["b_ma_passive"], "b_sf_passive"),
  defineSkill(ProfessionType.Body, "b_ie_active", "legacy", "burst", "inheritance", ["b_tr_active", "b_im_active"], "b_ma_active"),
  defineSkill(ProfessionType.Body, "b_ie_passive", "legacy", "passive", "inheritance", ["b_im_passive"], "b_sf_passive"),
];

const MAGE_SKILL_POOL_ENTRIES: SkillPoolEntry[] = [
  defineSkill(ProfessionType.Mage, "m_q_active", "core", "guaranteed", "shop"),
  defineSkill(ProfessionType.Mage, "m_q_passive", "core", "passive", "shop"),
  defineSkill(ProfessionType.Mage, "m_f_active", "core", "utility", "boss", ["m_q_active"]),
  defineSkill(ProfessionType.Mage, "m_f_passive", "core", "passive", "shop", ["m_q_passive"]),
  defineSkill(ProfessionType.Mage, "m_g_active", "core", "burst", "boss", ["m_f_active"]),
  defineSkill(ProfessionType.Mage, "m_g_passive", "core", "passive", "elite", ["m_f_passive"]),
  defineSkill(ProfessionType.Mage, "m_n_active", "core", "burst", "boss", ["m_f_active", "m_g_active"]),
  defineSkill(ProfessionType.Mage, "m_n_passive", "core", "passive", "elite", ["m_f_passive", "m_g_passive"]),
  defineSkill(ProfessionType.Mage, "m_sf_active", "core", "utility", "boss", ["m_f_active", "m_n_active"]),
  defineSkill(ProfessionType.Mage, "m_sf_passive", "core", "passive", "elite", ["m_n_passive"]),
  defineSkill(ProfessionType.Mage, "m_vr_active", "core", "utility", "boss", ["m_sf_active"]),
  defineSkill(ProfessionType.Mage, "m_vr_passive", "transition", "passive", "elite", ["m_sf_passive"], "m_sf_passive"),
  defineSkill(ProfessionType.Mage, "m_bi_active", "transition", "burst", "boss", ["m_n_active", "m_vr_active"], "m_tr_active"),
  defineSkill(ProfessionType.Mage, "m_bi_passive", "legacy", "passive", "elite", ["m_vr_passive"], "m_sf_passive"),
  defineSkill(ProfessionType.Mage, "m_ma_active", "transition", "burst", "boss", ["m_g_active", "m_sf_active"], "m_tr_active"),
  defineSkill(ProfessionType.Mage, "m_ma_passive", "legacy", "passive", "elite", ["m_sf_passive"], "m_sf_passive"),
  defineSkill(ProfessionType.Mage, "m_tr_active", "core", "burst", "inheritance", ["m_g_active", "m_n_active"]),
  defineSkill(ProfessionType.Mage, "m_tr_passive", "transition", "passive", "inheritance", ["m_sf_passive"], "m_sf_passive"),
  defineSkill(ProfessionType.Mage, "m_im_active", "transition", "utility", "boss", ["m_tr_active"], "m_tr_active"),
  defineSkill(ProfessionType.Mage, "m_im_passive", "transition", "passive", "elite", ["m_tr_passive"], "m_sf_passive"),
  defineSkill(ProfessionType.Mage, "m_ie_active", "legacy", "burst", "inheritance", ["m_tr_active", "m_im_active"], "m_tr_active"),
  defineSkill(ProfessionType.Mage, "m_ie_passive", "legacy", "passive", "inheritance", ["m_im_passive"], "m_sf_passive"),
];

const SKILL_POOL_ENTRIES_BY_PROFESSION: Record<ProfessionType, SkillPoolEntry[]> = {
  [ProfessionType.None]: [],
  [ProfessionType.Sword]: SWORD_SKILL_POOL_ENTRIES,
  [ProfessionType.Body]: BODY_SKILL_POOL_ENTRIES,
  [ProfessionType.Mage]: MAGE_SKILL_POOL_ENTRIES,
};

const buildSkillPoolRegistry = (
  professionPools: Record<ProfessionType, SkillPoolEntry[]>
) =>
  Object.fromEntries(
    Object.values(professionPools)
      .flat()
      .map((entry) => [entry.skillId, entry])
  ) as Record<string, SkillPoolEntry>;

const buildProfessionSkillPools = ({
  professionPools,
  predicate,
}: {
  professionPools: Record<ProfessionType, SkillPoolEntry[]>;
  predicate: (entry: SkillPoolEntry) => boolean;
}) =>
  Object.fromEntries(
    Object.entries(professionPools).map(([profession, entries]) => [
      profession,
      entries.filter(predicate),
    ])
  ) as Record<ProfessionType, SkillPoolEntry[]>;

export const SKILL_POOL_REGISTRY: Record<string, SkillPoolEntry> =
  buildSkillPoolRegistry(SKILL_POOL_ENTRIES_BY_PROFESSION);

export const SKILL_PROFESSION_POOL_GROUPS = {
  all: SKILL_POOL_ENTRIES_BY_PROFESSION,
  core: buildProfessionSkillPools({
    professionPools: SKILL_POOL_ENTRIES_BY_PROFESSION,
    predicate: (entry) => entry.poolStatus === "core",
  }),
  nonCore: buildProfessionSkillPools({
    professionPools: SKILL_POOL_ENTRIES_BY_PROFESSION,
    predicate: (entry) => entry.poolStatus !== "core",
  }),
} as const;

export const CORE_SKILL_POOL_REGISTRY = buildSkillPoolRegistry(
  SKILL_PROFESSION_POOL_GROUPS.core
);

export const NON_CORE_SKILL_POOL_REGISTRY = buildSkillPoolRegistry(
  SKILL_PROFESSION_POOL_GROUPS.nonCore
);

export const SKILL_PROFESSION_POOLS: Record<ProfessionType, SkillPoolEntry[]> =
  SKILL_PROFESSION_POOL_GROUPS.core;

export const NON_CORE_SKILL_PROFESSION_POOLS: Record<ProfessionType, SkillPoolEntry[]> =
  SKILL_PROFESSION_POOL_GROUPS.nonCore;

export const getSkillPoolEntry = (skillId: string) => SKILL_POOL_REGISTRY[skillId];

export const getMissingPrerequisiteSkillIds = (
  learnedSkillIds: string[],
  skillId: string
) => {
  const entry = getSkillPoolEntry(skillId);
  if (!entry) return [];

  return entry.prerequisiteSkillIds.filter(
    (prerequisiteSkillId) => !learnedSkillIds.includes(prerequisiteSkillId)
  );
};

export const resolveReplacementSkillId = (skillId: string): string => {
  const visited = new Set<string>();
  let currentSkillId = skillId;

  while (!visited.has(currentSkillId)) {
    visited.add(currentSkillId);
    const replacementSkillId = getSkillPoolEntry(currentSkillId)?.replacementSkillId;
    if (!replacementSkillId) {
      return currentSkillId;
    }
    currentSkillId = replacementSkillId;
  }

  return skillId;
};

export const normalizeFormalSkillIds = (skillIds: string[]) => {
  const normalizedSkillIds = skillIds.map(resolveReplacementSkillId);
  return Array.from(new Set(normalizedSkillIds));
};
