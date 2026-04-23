import { MajorRealm, ItemQuality, type WorkshopState } from "../types";

export type WorkshopRecipeDiscipline = "alchemy" | "smithing";
export type WorkshopRecipeTier = "basic" | "advanced" | "highRealm";

export interface WorkshopRecipe {
  id: string;
  name: string;
  discipline: WorkshopRecipeDiscipline;
  tier?: WorkshopRecipeTier;
  minRealm?: MajorRealm;
  routeTags?: string[];
  qualityHint?: string;
  sourceHint?: string;
  masteryYield?: number;
  description: string;
  spiritStoneCost: number;
  requiredLevel: number;
  ingredients: Array<{
    itemId: string;
    count: number;
  }>;
  outputs: Array<{
    itemId: string;
    count: number;
    quality?: ItemQuality;
  }>;
}

export const WORKSHOP_RECIPES: Record<string, WorkshopRecipe> = {
  qi_pill: {
    id: "qi_pill",
    name: "聚氣丹",
    discipline: "alchemy",
    tier: "basic",
    description: "以聚靈草萃出溫和丹氣，補上前期修為缺口。",
    spiritStoneCost: 25,
    requiredLevel: 1,
    ingredients: [{ itemId: "spirit_herb", count: 2 }],
    outputs: [{ itemId: "qi_pill", count: 1 }],
  },
  novice_sword_reforge: {
    id: "novice_sword_reforge",
    name: "鏽鐵劍重鑄",
    discipline: "smithing",
    tier: "basic",
    description: "以玄鐵礦與妖狼牙重鑄一柄能入世歷練的劍器。",
    spiritStoneCost: 35,
    requiredLevel: 1,
    ingredients: [
      { itemId: "iron_ore", count: 2 },
      { itemId: "wolf_fang", count: 1 },
    ],
    outputs: [{ itemId: "novice_sword", count: 1, quality: ItemQuality.Low }],
  },
  immortal_emperor_breakthrough_pill: {
    id: "immortal_emperor_breakthrough_pill",
    name: "九轉鴻蒙丹",
    discipline: "alchemy",
    tier: "highRealm",
    minRealm: MajorRealm.SpiritSevering,
    routeTags: ["化神", "仙帝", "縹緲仙宮"],
    qualityHint: "仙品破境丹，專供化神後期衝擊仙帝門檻。",
    sourceHint: "縹緲仙宮星砂秘材與萬獸血骨殘材熬煉出的高階破境丹。",
    masteryYield: 28,
    description: "以星砂秘材壓住丹火，再以血骨殘材鎮住反噬，直指仙帝門檻。",
    spiritStoneCost: 288,
    requiredLevel: 8,
    ingredients: [
      { itemId: "mystic_path_starlotus", count: 2 },
      { itemId: "beast_path_bloodbone", count: 1 },
      { itemId: "spirit_herb", count: 6 },
    ],
    outputs: [{ itemId: "bt_immortal_emperor", count: 1, quality: ItemQuality.Immortal }],
  },
  immortal_emperor_sword_forge: {
    id: "immortal_emperor_sword_forge",
    name: "萬古帝劍鍛造",
    discipline: "smithing",
    tier: "highRealm",
    minRealm: MajorRealm.SpiritSevering,
    routeTags: ["化神", "仙帝", "凌霄劍宗"],
    qualityHint: "仙品帝兵，劍修終局的證道兵器。",
    sourceHint: "凌霄劍宗前哨殘核熔出的劍心星鋼，混入血骨殘材鍛成帝劍胚。",
    masteryYield: 32,
    description: "將劍宗殘核、血骨殘材與靈石火候一併熔鑄，成就可承載帝意的終局劍器。",
    spiritStoneCost: 320,
    requiredLevel: 8,
    ingredients: [
      { itemId: "sword_path_starsteel", count: 2 },
      { itemId: "beast_path_bloodbone", count: 2 },
      { itemId: "iron_ore", count: 4 },
    ],
    outputs: [{ itemId: "origin_sword", count: 1, quality: ItemQuality.Immortal }],
  },
};

export const getWorkshopDisciplineLevel = (
  workshop: WorkshopState,
  discipline: WorkshopRecipeDiscipline
) => (discipline === "alchemy" ? workshop.alchemyLevel : workshop.blacksmithLevel);

export const getUnlockedWorkshopRecipes = (
  workshop: WorkshopState,
  discipline: WorkshopRecipeDiscipline
) =>
  workshop.unlockedRecipes
    .map((recipeId) => WORKSHOP_RECIPES[recipeId])
    .filter(
      (recipe): recipe is WorkshopRecipe =>
        Boolean(recipe) && recipe.discipline === discipline
    );
