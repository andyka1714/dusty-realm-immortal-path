import { ItemQuality, type WorkshopState } from "../types";

export type WorkshopRecipeDiscipline = "alchemy" | "smithing";

export interface WorkshopRecipe {
  id: string;
  name: string;
  discipline: WorkshopRecipeDiscipline;
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
    description: "以玄鐵礦與妖狼牙重鑄一柄能入世歷練的劍器。",
    spiritStoneCost: 35,
    requiredLevel: 1,
    ingredients: [
      { itemId: "iron_ore", count: 2 },
      { itemId: "wolf_fang", count: 1 },
    ],
    outputs: [{ itemId: "novice_sword", count: 1, quality: ItemQuality.Low }],
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
