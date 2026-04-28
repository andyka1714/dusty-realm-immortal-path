import {
  ConsumableType,
  Item,
  ItemCategory,
  MaterialType,
} from "../../types";
import {
  FIRST_WAVE_ITEM_LINE_ITEM_IDS,
  QUEST_ITEM_IDS,
  REGION_SPECIALTY_ITEMS,
  TALISMAN_ARRAY_ARTIFACT_ITEMS,
  TOKEN_ITEMS,
} from "../../data/items/itemLineMetadata";

export type CompendiumItemCategoryId =
  | "manual"
  | "equipment"
  | "pill"
  | "alchemy_material"
  | "smithing_material"
  | "quest_item"
  | "region_specialty"
  | "currency_token"
  | "talisman"
  | "array"
  | "artifact_spirit"
  | "breakthrough"
  | "other";

export interface CompendiumItemCategoryDefinition {
  id: CompendiumItemCategoryId;
  label: string;
  description: string;
}

export const COMPENDIUM_ITEM_CATEGORIES: CompendiumItemCategoryDefinition[] = [
  {
    id: "manual",
    label: "功法秘卷",
    description: "購買、任務或掉落後可在背包參悟的功法來源。",
  },
  {
    id: "equipment",
    label: "裝備",
    description: "武器、防具與飾品，依境界與職業形成套裝線。",
  },
  {
    id: "pill",
    label: "丹藥",
    description: "恢復、修煉、突破與短時間戰鬥增益消耗品。",
  },
  {
    id: "alchemy_material",
    label: "煉丹材料",
    description: "藥草、靈露與丹方主材，主要用於煉丹工坊配方。",
  },
  {
    id: "smithing_material",
    label: "煉器材料",
    description: "礦石、妖獸素材與器胚材料，主要用於鍛造工坊配方。",
  },
  {
    id: "quest_item",
    label: "任務物品",
    description: "推進對話、轉職、提交或章節解鎖所需的非消耗任務道具。",
  },
  {
    id: "region_specialty",
    label: "地區特產",
    description: "特定地圖或區域代表性採集物，承接探索與地方任務。",
  },
  {
    id: "currency_token",
    label: "貨幣代幣",
    description: "靈石以外的兌換、貢獻、試煉與傳承代幣。",
  },
  {
    id: "talisman",
    label: "符籙",
    description: "可直接使用或作為戰鬥消耗的符紙類物品。",
  },
  {
    id: "array",
    label: "陣盤",
    description: "修煉、突破與秘境準備用的陣法承載物。",
  },
  {
    id: "artifact_spirit",
    label: "法寶器靈",
    description: "高階法寶胚、器靈與後續養成素材。",
  },
  {
    id: "breakthrough",
    label: "突破物",
    description: "直接服務於境界突破的關鍵道具。",
  },
  {
    id: "other",
    label: "其他",
    description: "尚未歸入主要物品線的通用道具。",
  },
];

export const COMPENDIUM_GENERAL_ITEM_CATEGORIES =
  COMPENDIUM_ITEM_CATEGORIES.filter(
    (category) => category.id !== "manual" && category.id !== "equipment"
  );

const questItemIds = new Set<string>(QUEST_ITEM_IDS);
const regionSpecialtyIds = new Set<string>(
  REGION_SPECIALTY_ITEMS.map((item) => item.itemId)
);
const tokenItemIds = new Set<string>(TOKEN_ITEMS.map((item) => item.itemId));
const talismanArrayArtifactByItemId = new Map<string, string>(
  TALISMAN_ARRAY_ARTIFACT_ITEMS.map((item) => [item.itemId, item.kind])
);

const firstWaveAlchemyMaterialIds = new Set(
  Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS.alchemy_material).flat()
);
const firstWaveSmithingMaterialIds = new Set(
  Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS.smithing_material).flat()
);
const firstWavePillIds = new Set(
  Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS.pill).flat()
);

const getCategoryDefinition = (
  id: CompendiumItemCategoryId
): CompendiumItemCategoryDefinition => {
  const definition = COMPENDIUM_ITEM_CATEGORIES.find(
    (category) => category.id === id
  );

  if (!definition) return COMPENDIUM_ITEM_CATEGORIES.at(-1)!;
  return definition;
};

export const getCompendiumItemCategory = (
  item: Item
): CompendiumItemCategoryDefinition => {
  if (questItemIds.has(item.id)) return getCategoryDefinition("quest_item");
  if (tokenItemIds.has(item.id)) return getCategoryDefinition("currency_token");

  const specialKind = talismanArrayArtifactByItemId.get(item.id);
  if (specialKind === "talisman") return getCategoryDefinition("talisman");
  if (specialKind === "array") return getCategoryDefinition("array");
  if (specialKind === "artifact" || specialKind === "spirit") {
    return getCategoryDefinition("artifact_spirit");
  }

  if (regionSpecialtyIds.has(item.id)) {
    return getCategoryDefinition("region_specialty");
  }

  if (
    item.category === ItemCategory.Consumable &&
    item.subType === ConsumableType.Manual
  ) {
    return getCategoryDefinition("manual");
  }

  if (item.category === ItemCategory.Equipment) {
    return getCategoryDefinition("equipment");
  }

  if (item.category === ItemCategory.Breakthrough) {
    return getCategoryDefinition("breakthrough");
  }

  if (
    item.category === ItemCategory.Consumable &&
    (item.subType === ConsumableType.Pill || firstWavePillIds.has(item.id))
  ) {
    return getCategoryDefinition("pill");
  }

  if (firstWaveAlchemyMaterialIds.has(item.id)) {
    return getCategoryDefinition("alchemy_material");
  }

  if (firstWaveSmithingMaterialIds.has(item.id)) {
    return getCategoryDefinition("smithing_material");
  }

  if (item.category === ItemCategory.Material) {
    if (item.subType === MaterialType.Herb) {
      return getCategoryDefinition("alchemy_material");
    }

    if (
      item.subType === MaterialType.Ore ||
      item.subType === MaterialType.MonsterPart
    ) {
      return getCategoryDefinition("smithing_material");
    }
  }

  return getCategoryDefinition("other");
};

export const getCompendiumItemCategoryLabel = (item: Item): string =>
  getCompendiumItemCategory(item).label;

export const isCompendiumGeneralItem = (item: Item): boolean => {
  const categoryId = getCompendiumItemCategory(item).id;
  return categoryId !== "manual" && categoryId !== "equipment";
};

export const isCompendiumEquipmentItem = (item: Item): boolean =>
  getCompendiumItemCategory(item).id === "equipment";
