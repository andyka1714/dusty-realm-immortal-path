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
} from "../../types";
import { FORMAL_CORE_SKILLS_SORTED } from "../skills";

const PROFESSION_CN: Record<ProfessionType, string> = {
  [ProfessionType.None]: "通用",
  [ProfessionType.Sword]: "劍修",
  [ProfessionType.Body]: "體修",
  [ProfessionType.Mage]: "法修",
};

export type SkillManualSourceType =
  | "shop_mortal"
  | "shop_sect"
  | "quest_sect_trial"
  | "drop_elite"
  | "drop_boss"
  | "inheritance";

export interface SkillManualSourceEntry {
  type: SkillManualSourceType;
  label: string;
}

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

export const getSkillManualSources = (skill: Skill): SkillManualSourceEntry[] => {
  switch (skill.formalSourceTier) {
    case "shop":
      return [
        {
          type:
            skill.minRealm <= MajorRealm.QiRefining ? "shop_mortal" : "shop_sect",
          label: skill.minRealm <= MajorRealm.QiRefining ? "凡界藏經閣" : "宗門藏經閣",
        },
      ];
    case "elite":
      return [{ type: "drop_elite", label: "同境界精英" }];
    case "boss":
      return [{ type: "drop_boss", label: "同境界 Boss" }];
    case "inheritance":
      return [{ type: "inheritance", label: "古修傳承" }];
    default:
      if (skill.minRealm === MajorRealm.QiRefining) {
        return [{ type: "shop_mortal", label: "凡界藏經閣" }];
      }
      return skill.type === "Active"
        ? [{ type: "drop_boss", label: "同境界 Boss" }]
        : [{ type: "drop_elite", label: "同境界精英" }];
  }
};

export const getSkillManualSourceLabels = (skill: Skill) =>
  getSkillManualSources(skill).map((source) => source.label);

export const getSkillManualCategoryLabel = (skill: Skill) =>
  `${skill.type === "Active" ? "主動術式" : "被動心法"} / ${getSkillManualTierLabel(skill)}`;

export const getSkillManualId = (skillId: string) => `manual_${skillId}`;

export const SKILL_MANUAL_SOURCE_REGISTRY: Record<
  string,
  {
    skillId: string;
    manualId: string;
    categoryLabel: string;
    tierLabel: string;
    sources: SkillManualSourceEntry[];
  }
> = Object.fromEntries(
  FORMAL_CORE_SKILLS_SORTED.map((skill) => [
    skill.id,
    {
      skillId: skill.id,
      manualId: getSkillManualId(skill.id),
      categoryLabel: getSkillManualCategoryLabel(skill),
      tierLabel: getSkillManualTierLabel(skill),
      sources: getSkillManualSources(skill),
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

  return {
    id: getSkillManualId(skill.id),
    name: `${skill.name}秘卷`,
    category: ItemCategory.Consumable,
    subType: ConsumableType.Manual,
    description: `${professionText}，${realmText}可參悟。${getSkillManualCategoryLabel(skill)}。主要來源：${getSkillManualSourceLabels(skill).join("、")}。${skill.description} 使用後習得【${skill.name}】。`,
    price: getSkillManualPrice(skill),
    quality: getSkillManualQuality(skill.minRealm),
    maxStack: 1,
    requiredProfession:
      skill.profession && skill.profession !== ProfessionType.None
        ? skill.profession
        : undefined,
    requiredRealm: skill.minRealm,
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
