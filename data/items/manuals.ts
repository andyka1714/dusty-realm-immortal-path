import {
  ConsumableItem,
  ConsumableType,
  Item,
  ItemCategory,
  ItemQuality,
  MajorRealm,
  MajorRealmCN,
  ProfessionType,
  Skill,
  SkillAcquisitionTier,
  SkillManualSourceType,
} from "../../types";
import {
  FINAL_CULL_REMOVAL_SKILLS_BY_PROFESSION,
  FORMAL_CORE_SKILLS_SORTED,
  getFormalSkill,
  getSkill,
  getSkillFormalAcquisitionTier,
} from "../skills";

const PROFESSION_CN: Record<ProfessionType, string> = {
  [ProfessionType.None]: "通用",
  [ProfessionType.Sword]: "劍修",
  [ProfessionType.Body]: "體修",
  [ProfessionType.Mage]: "法修",
};

export interface SkillManualSourceEntry {
  type: SkillManualSourceType;
  label: string;
}

const MANUAL_SOURCE_LABELS: Record<SkillManualSourceType, string> = {
  shop_mortal: "凡界藏經閣",
  shop_sect: "宗門藏經閣",
  quest_sect_trial: "宗門入門試煉",
  drop_elite: "同境界精英",
  drop_boss: "同境界 Boss",
  inheritance: "古修傳承",
};

const MANUAL_ACQUISITION_LABELS: Record<SkillAcquisitionTier, string> = {
  basic: "基礎秘卷",
  advanced: "進階秘卷",
  boss_core: "核心秘卷",
  inheritance: "傳承秘卷",
};

export const getSkillManualTierLabel = (skill: Skill) => {
  if (skill.minRealm <= MajorRealm.QiRefining) {
    return "入門秘卷";
  }
  if (skill.minRealm <= MajorRealm.Foundation) {
    return "進階秘卷";
  }
  if (skill.minRealm <= MajorRealm.NascentSoul) {
    return "真傳秘卷";
  }
  return "大道秘卷";
};

export const getSkillManualAcquisitionTier = (skill: Skill) =>
  getSkillFormalAcquisitionTier(skill);

export const getSkillManualAcquisitionTierLabel = (
  skillOrTier: Skill | SkillAcquisitionTier
) => {
  const tier =
    typeof skillOrTier === "string"
      ? skillOrTier
      : getSkillManualAcquisitionTier(skillOrTier);
  return MANUAL_ACQUISITION_LABELS[tier];
};

export const getSkillManualSourceTypeLabel = (
  sourceType: SkillManualSourceType
) => MANUAL_SOURCE_LABELS[sourceType];

export const getSkillManualSources = (skill: Skill): SkillManualSourceEntry[] => {
  switch (skill.formalSourceTier) {
    case "shop":
      if (skill.minRealm <= MajorRealm.QiRefining) {
        return skill.type === "Active"
          ? [
              {
                type: "shop_mortal",
                label: getSkillManualSourceTypeLabel("shop_mortal"),
              },
              {
                type: "quest_sect_trial",
                label: getSkillManualSourceTypeLabel("quest_sect_trial"),
              },
            ]
          : [
              {
                type: "shop_mortal",
                label: getSkillManualSourceTypeLabel("shop_mortal"),
              },
            ];
      }

      return [
        {
          type: "shop_sect",
          label: getSkillManualSourceTypeLabel("shop_sect"),
        },
      ];
    case "elite":
      return [
        {
          type: "drop_elite",
          label: getSkillManualSourceTypeLabel("drop_elite"),
        },
      ];
    case "boss":
      return [
        {
          type: "drop_boss",
          label: getSkillManualSourceTypeLabel("drop_boss"),
        },
      ];
    case "inheritance":
      return [
        {
          type: "inheritance",
          label: getSkillManualSourceTypeLabel("inheritance"),
        },
      ];
    default:
      if (skill.minRealm === MajorRealm.QiRefining) {
        return [
          {
            type: "shop_mortal",
            label: getSkillManualSourceTypeLabel("shop_mortal"),
          },
        ];
      }
      return skill.type === "Active"
        ? [
            {
              type: "drop_boss",
              label: getSkillManualSourceTypeLabel("drop_boss"),
            },
          ]
        : [
            {
              type: "drop_elite",
              label: getSkillManualSourceTypeLabel("drop_elite"),
            },
          ];
  }
};

export const getSkillManualSourceLabels = (skill: Skill) =>
  getSkillManualSources(skill).map((source) => source.label);

export const getSkillManualCategoryLabel = (skill: Skill) =>
  `${skill.type === "Active" ? "主動術式" : "被動心法"} / ${getSkillManualTierLabel(skill)}`;

export const getSkillManualId = (skillId: string) => `manual_${skillId}`;

const FINAL_CULL_REMOVED_SKILL_MANUAL_MIGRATION_MAP: Record<string, string> = Object.fromEntries(
  Object.values(FINAL_CULL_REMOVAL_SKILLS_BY_PROFESSION)
    .flat()
    .flatMap((skill) => {
      const formalSkill = getFormalSkill(skill.id);
      if (!formalSkill) {
        return [];
      }

      const targetManualId = getSkillManualId(formalSkill.id);
      return [
        [getSkillManualId(skill.id), targetManualId],
        [`${skill.id}_manual`, targetManualId],
      ] as Array<[string, string]>;
    })
);

const getSkillIdFromManualItemPattern = (itemId: string) => {
  if (itemId.startsWith("manual_")) {
    return itemId.slice("manual_".length);
  }

  if (itemId.endsWith("_manual")) {
    return itemId.slice(0, -"_manual".length);
  }

  return undefined;
};

export const isSkillManualLikeItemId = (itemId: string) =>
  itemId in SKILL_MANUAL_ITEMS ||
  itemId in FINAL_CULL_REMOVED_SKILL_MANUAL_MIGRATION_MAP ||
  itemId.startsWith("manual_") ||
  itemId.endsWith("_manual");

export const resolveFormalSkillManualItemId = (itemId: string): string | undefined => {
  if (itemId in SKILL_MANUAL_ITEMS) {
    return itemId;
  }

  const knownMigrationTarget = FINAL_CULL_REMOVED_SKILL_MANUAL_MIGRATION_MAP[itemId];
  if (knownMigrationTarget) {
    return knownMigrationTarget;
  }

  const parsedSkillId = getSkillIdFromManualItemPattern(itemId);
  if (!parsedSkillId) {
    return undefined;
  }

  const skill = getSkill(parsedSkillId);
  if (!skill) {
    return undefined;
  }

  const formalSkill = getFormalSkill(skill.id);
  return formalSkill ? getSkillManualId(formalSkill.id) : undefined;
};

export const SKILL_MANUAL_SOURCE_REGISTRY: Record<
  string,
  {
    skillId: string;
    manualId: string;
    categoryLabel: string;
    tierLabel: string;
    acquisitionTier: SkillAcquisitionTier;
    acquisitionTierLabel: string;
    sources: SkillManualSourceEntry[];
    requiredRealm: MajorRealm;
    requiredProfession?: ProfessionType;
    prerequisiteSkillIds: string[];
  }
> = Object.fromEntries(
  FORMAL_CORE_SKILLS_SORTED.map((skill) => [
    skill.id,
    {
      skillId: skill.id,
      manualId: getSkillManualId(skill.id),
      categoryLabel: getSkillManualCategoryLabel(skill),
      tierLabel: getSkillManualTierLabel(skill),
      acquisitionTier: getSkillManualAcquisitionTier(skill),
      acquisitionTierLabel: getSkillManualAcquisitionTierLabel(skill),
      sources: getSkillManualSources(skill),
      requiredRealm: skill.minRealm,
      requiredProfession:
        skill.profession && skill.profession !== ProfessionType.None
          ? skill.profession
          : undefined,
      prerequisiteSkillIds: skill.prerequisiteSkillIds ?? [],
    },
  ])
);

const getSkillManualQuality = (realm: MajorRealm): ItemQuality => {
  if (realm <= MajorRealm.QiRefining) return ItemQuality.Low;
  if (realm <= MajorRealm.GoldenCore) return ItemQuality.Medium;
  if (realm <= MajorRealm.VoidRefining) return ItemQuality.High;
  return ItemQuality.Immortal;
};

const getSkillManualPrice = (skill: Skill): number => {
  const realmBase = 400 + skill.minRealm * 450;
  const activeBonus = skill.type === "Active" ? 300 : 0;
  return realmBase + activeBonus;
};

const createSkillManual = (skill: Skill): ConsumableItem => {
  const realmText = MajorRealmCN[skill.minRealm];
  const professionText =
    skill.profession && skill.profession !== ProfessionType.None
      ? `${PROFESSION_CN[skill.profession]}專用`
      : "通用秘卷";
  const manualSources = getSkillManualSources(skill);
  const manualAcquisitionTier = getSkillManualAcquisitionTier(skill);
  const prerequisiteSkillIds = skill.prerequisiteSkillIds ?? [];
  const prerequisiteText =
    prerequisiteSkillIds.length > 0
      ? `前置需求：${prerequisiteSkillIds
          .map(
            (prerequisiteSkillId) =>
              getFormalSkill(prerequisiteSkillId)?.name ?? prerequisiteSkillId
          )
          .join("、")}。`
      : "";

  return {
    id: getSkillManualId(skill.id),
    name: `${skill.name}秘卷`,
    category: ItemCategory.Consumable,
    subType: ConsumableType.Manual,
    description: `${professionText}，${realmText}可參悟。${getSkillManualCategoryLabel(skill)} / ${getSkillManualAcquisitionTierLabel(manualAcquisitionTier)}。主要來源：${manualSources
      .map((source) => source.label)
      .join("、")}。${prerequisiteText}可先收藏秘卷，待符合職業、境界與前置條件後再參悟。${skill.description} 使用後習得【${skill.name}】。`,
    price: getSkillManualPrice(skill),
    quality: getSkillManualQuality(skill.minRealm),
    maxStack: 1,
    requiredProfession:
      skill.profession && skill.profession !== ProfessionType.None
        ? skill.profession
        : undefined,
    requiredRealm: skill.minRealm,
    manualSkillId: skill.id,
    manualAcquisitionTier,
    manualSourceTypes: manualSources.map((source) => source.type),
    prerequisiteSkillIds,
    effects: [{ type: "learn_skill", value: 0, skillId: skill.id }],
  };
};

export const SKILL_MANUAL_ITEMS: Record<string, Item> = Object.fromEntries(
  FORMAL_CORE_SKILLS_SORTED.map((skill) => [
    getSkillManualId(skill.id),
    createSkillManual(skill),
  ])
);

export const MANUAL_ITEMS: Record<string, Item> = {
  ...SKILL_MANUAL_ITEMS,
  map_mortal_region: {
    id: "map_mortal_region",
    name: "凡界地圖",
    category: ItemCategory.Consumable,
    subType: ConsumableType.Map,
    description: "繪製了凡界主要區域的粗略地圖。",
    price: 100,
    quality: ItemQuality.Low,
    maxStack: 1,
    effects: [],
  },
};
